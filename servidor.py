"""
servidor.py — CommSim v3
"""
from __future__ import annotations
import base64, io, os, queue, struct, sys, time
from pathlib import Path
import numpy as np
from flask import Flask, jsonify, request, send_from_directory

sys.path.insert(0, str(Path(__file__).parent))
from core.motor_senales import (
    Motor, Params, Resultado, TipoMod, TipoCod, MAX_FILE, MAX_AUDIO
)

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024
app.config["JSON_SORT_KEYS"] = False

NODOS = ["A", "B"]; PAR = {"A":"B","B":"A"}
motores = {n: Motor() for n in NODOS}
buzon   = {n: queue.Queue(maxsize=30) for n in NODOS}
ultimo  = {n: None for n in NODOS}
stats   = {n: {"enviados":0,"recibidos":0,"bytes_tx":0,"errores":0} for n in NODOS}

def r2d(r: Resultado) -> dict:
    return {
        "ber":       round(r.ber, 6),
        "snr":       round(r.snr, 2),
        "exito":     r.exito,
        "bytes_tx":  r.bytes_tx,
        "ck_ok":     r.ck_ok,
        "overhead":  r.overhead,
        "mod":       r.mod,
        "tiempo":    r.tiempo,
        "v_tx":      r.v_tx,
        "v_rx":      r.v_rx,
        "freqs":     r.freqs,
        "potencia":  r.potencia,
        "ctx":       r.ctx,
        "crx":       r.crx,
        "ojo":       r.ojo,
        "b_orig":    r.b_orig,
        "b_rx":      r.b_rx,
    }

def wav_tono(f=440., dur=1., fs=8000) -> bytes:
    n = int(fs*dur); t = np.linspace(0,dur,n,endpoint=False,dtype=np.float32)
    m = (32767*np.sin(2*np.pi*f*t)).astype(np.int16).tobytes()
    buf = io.BytesIO()
    buf.write(struct.pack("<4sI4s4sIHHIIHH4sI",
        b"RIFF",36+len(m),b"WAVE",b"fmt ",16,1,1,fs,fs*2,2,16,b"data",len(m)))
    buf.write(m); return buf.getvalue()

def png_demo() -> bytes:
    import zlib; w=h=64; raw=bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw += bytes([int(255*x/w), int(255*y/h), int(128+127*np.sin((x+y)*.2))])
    def ck(n,d): return struct.pack(">I",len(d))+n+d+struct.pack(">I",zlib.crc32(n+d)&0xFFFFFFFF)
    return b"\x89PNG\r\n\x1a\n"+ck(b"IHDR",struct.pack(">IIBBBBB",w,h,8,2,0,0,0))+ck(b"IDAT",zlib.compress(bytes(raw)))+ck(b"IEND",b"")

def vn(n):
    if n not in NODOS: return jsonify({"error":f"Nodo '{n}' inválido"}),400
    return None

@app.route("/")
def raiz(): return send_from_directory("templates","index.html")

@app.route("/api/<n>/params", methods=["GET"])
def get_params(n):
    e = vn(n)
    if e: return e
    p = motores[n].params()
    return jsonify({"fs":p.fs,"fc":p.fc,"sr":p.sr,"snr":p.snr,
                    "mod":p.mod.value,"cod":p.cod.value,"bps":p.bps,"nsc":p.nsc})

@app.route("/api/<n>/params", methods=["POST"])
def set_params(n):
    e = vn(n); 
    if e: return e
    d = request.get_json(force=True) or {}
    p = motores[n].params()
    if "snr" in d: p.snr = float(d["snr"])
    if "fc"  in d: p.fc  = float(d["fc"])
    if "sr"  in d: p.sr  = float(d["sr"])
    if "bps" in d: p.bps = int(d["bps"])
    if "nsc" in d: p.nsc = int(d["nsc"])
    if "mod" in d:
        for m in TipoMod:
            if m.value == d["mod"]: p.mod = m; break
    if "cod" in d:
        for c in TipoCod:
            if c.value == d["cod"]: p.cod = c; break
    motores[n].config(p)
    return jsonify({"ok": True})

@app.route("/api/<n>/vivo")
def vivo(n):
    e = vn(n)
    if e: return e
    return jsonify(motores[n].vivo())

@app.route("/api/<n>/tx", methods=["POST"])
def tx(n):
    e = vn(n)
    if e: return e
    d = request.get_json(force=True) or {}
    tipo = d.get("tipo","texto"); par = PAR[n]; nom = d.get("nom","dato")
    try:
        if tipo == "texto":
            raw = d.get("texto","")[:5000].encode("utf-8"); nom = "mensaje.txt"
        elif tipo == "imagen":
            b64 = d.get("b64","")
            raw = base64.b64decode(b64) if b64 else png_demo(); nom = d.get("nom","imagen.png")
            if len(raw) > 10*1024*1024: return jsonify({"ok":False,"error":"Imagen >10MB"}),400
        elif tipo == "audio_grab":
            b64 = d.get("b64","")
            if not b64: return jsonify({"ok":False,"error":"Sin audio"}),400
            raw = base64.b64decode(b64)[:MAX_AUDIO]; nom = d.get("nom","grabacion.webm")
        elif tipo == "audio_tono":
            raw = wav_tono(float(d.get("freq",440))); nom = f"tono_{int(d.get('freq',440))}hz.wav"
        elif tipo == "archivo":
            b64 = d.get("b64","")
            if not b64: return jsonify({"ok":False,"error":"Sin archivo"}),400
            raw = base64.b64decode(b64)
            if len(raw) > MAX_FILE: return jsonify({"ok":False,"error":"Archivo >1MB"}),400
            nom = d.get("nom","archivo.bin")
        else:
            raw = d.get("texto","prueba").encode(); nom = "datos.txt"

        # DSP sobre muestra pequeña para métricas
        prueba = raw[:min(len(raw),128)]
        r = motores[n].transmitir(prueba)
        dr = r2d(r); ultimo[n] = dr
        stats[n]["enviados"] += 1; stats[n]["bytes_tx"] += len(raw)

        item = {"tipo":tipo,"b64":base64.b64encode(raw).decode(),"emisor":n,
                "ts":time.time(),"ber":round(r.ber,6),"ck_ok":r.ck_ok,
                "tam":len(raw),"nom":nom,"resultado":dr}
        if buzon[par].full():
            try: buzon[par].get_nowait()
            except: pass
        buzon[par].put_nowait(item)
        stats[par]["recibidos"] += 1
        return jsonify({"ok":True,"resultado":dr})
    except Exception as ex:
        stats[n]["errores"] += 1
        return jsonify({"ok":False,"error":str(ex)}), 500

@app.route("/api/<n>/buzon")
def leer_buzon(n):
    e = vn(n)
    if e: return e
    items = []
    for _ in range(5):
        try: items.append(buzon[n].get_nowait())
        except: break
    return jsonify(items)

@app.route("/api/<n>/stats")
def get_stats(n):
    e = vn(n)
    if e: return e
    return jsonify(stats[n])

@app.route("/api/<n>/ber_curva")
def ber_curva(n):
    e = vn(n)
    if e: return e
    s, b = motores[n].curva_ber()
    return jsonify({"snr":s,"ber":b})

@app.route("/api/opciones")
def opciones():
    return jsonify({"mods":[m.value for m in TipoMod],"cods":[c.value for c in TipoCod]})

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--puerto", type=int, default=5000)
    a  = ap.parse_args()
    print(f"\n{'='*50}")
    print(f"  CommSim v3")
    print(f"  Nodo A: http://localhost:{a.puerto}/?nodo=A")
    print(f"  Nodo B: http://localhost:{a.puerto}/?nodo=B")
    print(f"{'='*50}\n")
    app.run(host="0.0.0.0", port=a.puerto, debug=False, threaded=True)