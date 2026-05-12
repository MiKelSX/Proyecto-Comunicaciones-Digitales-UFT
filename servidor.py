"""
servidor.py — CommSim v3
Motor de comunicaciones digitales mejorado con estadísticas detalladas.
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

# Estadísticas detalladas por nodo
stats = {n: {
    "enviados": 0,
    "recibidos": 0,
    "bytes_tx": 0,
    "bytes_rx": 0,
    "errores": 0,
    "ber_valores": [],      # Historial de BER
    "snr_valores": [],      # Historial de SNR
    "exito_valores": [],    # Historial de éxito %
    "integridad": 0,        # Checksum OK
    "integridad_total": 0,  # Total OK
    "tx_historico": [],     # Datos de cada transmisión (últimas 100)
    "rx_historico": [],     # Datos de cada recepción (últimas 100)
} for n in NODOS}

def r2d(r: Resultado) -> dict:
    """Convierte Resultado a diccionario JSON con métricas completas."""
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
        "ctx":       r.ctx,      # Constelación TX
        "crx":       r.crx,      # Constelación RX
        "ojo":       r.ojo,      # Eye diagram
        "b_orig":    r.b_orig,   # Bits originales
        "b_rx":      r.b_rx,     # Bits recibidos
        "amplitud_tx": [float(np.abs(x)) for x in r.v_tx[:50]],  # Envolvente TX
        "amplitud_rx": [float(np.abs(x)) for x in r.v_rx[:50]],  # Envolvente RX
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
    """Transmite datos y registra métricas detalladas."""
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
        
        # Actualizar estadísticas globales
        stats[n]["enviados"] += 1
        stats[n]["bytes_tx"] += len(raw)
        stats[n]["ber_valores"].append(r.ber)
        stats[n]["snr_valores"].append(r.snr)
        stats[n]["exito_valores"].append(r.exito)
        if r.ck_ok:
            stats[n]["integridad"] += 1
            stats[n]["integridad_total"] += 1
        
        # Mantener histórico de últimas 100 transmisiones
        tx_entry = {
            "ts": time.time(),
            "tipo": tipo,
            "tam": len(raw),
            "nom": nom,
            "ber": round(r.ber, 6),
            "snr": round(r.snr, 2),
            "exito": r.exito,
            "ck_ok": r.ck_ok,
            "mod": r.mod
        }
        stats[n]["tx_historico"].append(tx_entry)
        if len(stats[n]["tx_historico"]) > 100:
            stats[n]["tx_historico"].pop(0)

        item = {"tipo":tipo,"b64":base64.b64encode(raw).decode(),"emisor":n,
                "ts":time.time(),"ber":round(r.ber,6),"ck_ok":r.ck_ok,
                "tam":len(raw),"nom":nom,"resultado":dr}
        if buzon[par].full():
            try: buzon[par].get_nowait()
            except: pass
        buzon[par].put_nowait(item)
        stats[par]["recibidos"] += 1
        stats[par]["bytes_rx"] += len(raw)
        
        # Registrar en histórico de recepción del nodo par
        rx_entry = {
            "ts": time.time(),
            "tipo": tipo,
            "tam": len(raw),
            "nom": nom,
            "emisor": n,
            "ber": round(r.ber, 6),
            "ck_ok": r.ck_ok
        }
        stats[par]["rx_historico"].append(rx_entry)
        if len(stats[par]["rx_historico"]) > 100:
            stats[par]["rx_historico"].pop(0)
        
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
    """Obtiene estadísticas actuales del nodo."""
    e = vn(n)
    if e: return e
    s = stats[n]
    # Calcular promedios
    ber_prom = round(np.mean(s["ber_valores"]), 6) if s["ber_valores"] else 0.0
    snr_prom = round(np.mean(s["snr_valores"]), 2) if s["snr_valores"] else 0.0
    exito_prom = round(np.mean(s["exito_valores"]), 2) if s["exito_valores"] else 0.0
    tasa_integridad = round((s["integridad_total"] / max(s["enviados"], 1)) * 100, 2)
    
    return jsonify({
        "enviados": s["enviados"],
        "recibidos": s["recibidos"],
        "bytes_tx": s["bytes_tx"],
        "bytes_rx": s["bytes_rx"],
        "errores": s["errores"],
        "ber_prom": ber_prom,
        "snr_prom": snr_prom,
        "exito_prom": exito_prom,
        "integridad_prom": tasa_integridad,
        "ber_valores": s["ber_valores"][-50:],  # Últimos 50 valores
        "snr_valores": s["snr_valores"][-50:],
        "exito_valores": s["exito_valores"][-50:],
    })

@app.route("/api/<n>/stats_historico")
def stats_historico(n):
    """Obtiene el histórico completo de transmisiones y recepciones."""
    e = vn(n)
    if e: return e
    s = stats[n]
    return jsonify({
        "tx_historico": s["tx_historico"],
        "rx_historico": s["rx_historico"]
    })

@app.route("/api/<n>/histograma")
def histograma(n):
    """Calcula histograma de amplitudes de la última transmisión."""
    e = vn(n)
    if e: return e
    if ultimo[n] is None:
        return jsonify({"bins": [], "valores": []})
    
    # Usar amplitudes de TX
    amps = np.array(ultimo[n].get("amplitud_tx", []))
    if len(amps) == 0:
        return jsonify({"bins": [], "valores": []})
    
    bins, counts = np.histogram(amps, bins=16, range=(0, np.max(amps) + 0.1))
    return jsonify({
        "bins": [float(b) for b in bins],
        "valores": [int(c) for c in counts]
    })

@app.route("/api/<n>/espectrograma")
def espectrograma(n):
    """Calcula espectrograma simple 2D."""
    e = vn(n)
    if e: return e
    if ultimo[n] is None:
        return jsonify({"data": []})
    
    freqs = np.array(ultimo[n].get("freqs", []))
    potencia = np.array(ultimo[n].get("potencia", []))
    
    if len(freqs) == 0 or len(potencia) == 0:
        return jsonify({"freqs": [], "potencia": []})
    
    return jsonify({
        "freqs": [float(f) for f in freqs],
        "potencia": [float(p) for p in potencia]
    })

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