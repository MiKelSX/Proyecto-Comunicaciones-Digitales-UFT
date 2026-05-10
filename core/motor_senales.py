"""
motor_senales.py — CommSim v3
Motor DSP optimizado. Patrones: Factory, Strategy, Observer, Singleton.
"""
from __future__ import annotations
import hashlib, numpy as np
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, List

N_VISTA  = 300
N_FFT    = 256
N_CONST  = 100
N_OJO    = 20
N_BITS   = 48
MAX_FILE = 1 * 1024 * 1024
MAX_AUDIO= 256 * 1024

class TipoMod(str, Enum):
    ASK  = "ASK"
    BPSK = "BPSK"
    QAM  = "QAM"
    OFDM = "OFDM"

class TipoCod(str, Enum):
    NINGUNA    = "Ninguna"
    HAMMING    = "Hamming(7,4)"
    REPETICION = "Repeticion x3"

@dataclass
class Params:
    fs:  int   = 8000
    fc:  float = 400.0
    sr:  float = 40.0
    snr: float = 20.0
    mod: TipoMod = TipoMod.BPSK
    cod: TipoCod = TipoCod.HAMMING
    bps: int   = 2
    nsc: int   = 4

@dataclass
class Resultado:
    ber: float; snr: float; exito: float; bytes_tx: int
    overhead: float; ck_ok: bool; mod: str
    v_tx: List; v_rx: List; freqs: List; potencia: List
    ctx: List; crx: List; ojo: List
    b_orig: List; b_rx: List; tiempo: List

# ── Moduladores ────────────────────────────────────────────────

class ModASK:
    def modular(self, bits, p):
        mps = max(1, int(p.fs / p.sr))
        t   = np.linspace(0, 1/p.sr, mps, endpoint=False, dtype=np.float32)
        c   = np.sin(2 * np.pi * p.fc * t)
        return np.outer(bits.astype(np.float32), c).ravel(), np.array([[0.,0.],[1.,0.]])

    def demodular(self, rx, p):
        mps  = max(1, int(p.fs / p.sr))
        n    = len(rx) // mps
        segs = rx[:n*mps].reshape(n, mps)
        t    = np.linspace(0, 1/p.sr, mps, endpoint=False, dtype=np.float32)
        ref  = np.sin(2 * np.pi * p.fc * t)
        corr = segs @ ref / mps
        bits = (corr > 0.15).astype(int)
        return bits, np.column_stack([corr, np.zeros(n)])

class ModBPSK:
    def modular(self, bits, p):
        mps   = max(1, int(p.fs / p.sr))
        n     = len(bits)
        t_all = np.arange(n * mps, dtype=np.float32) / p.fs
        fase  = np.repeat(bits * np.pi, mps).astype(np.float32)
        return np.sin(2 * np.pi * p.fc * t_all + fase), np.array([[-1.,0.],[1.,0.]])

    def demodular(self, rx, p):
        mps  = max(1, int(p.fs / p.sr))
        n    = len(rx) // mps
        segs = rx[:n*mps].reshape(n, mps)
        t_m  = (np.arange(n*mps, dtype=np.float32) / p.fs).reshape(n, mps)
        ref  = np.sin(2 * np.pi * p.fc * t_m)
        denom = np.sum(ref**2, axis=1) + 1e-12
        I    = np.sum(segs * ref, axis=1) / denom
        bits = (I < 0).astype(int)
        return bits, np.column_stack([I, np.zeros(n)])

class ModQAM:
    def _mapa(self, M):
        k = int(np.sqrt(M))
        lv = np.arange(k) - (k-1)/2
        IQ = np.zeros((M, 2))
        for i, qi in enumerate(lv[::-1]):
            for j, ii in enumerate(lv):
                gi = j ^ (j >> 1); gq = i ^ (i >> 1)
                IQ[(gi << int(np.log2(k))) | gq % M] = [ii, qi]
        return IQ

    def modular(self, bits, p):
        M = 2**p.bps; bps = p.bps; mps = max(1, int(p.fs/p.sr))
        r = len(bits) % bps
        if r: bits = np.append(bits, np.zeros(bps-r, dtype=int))
        IQ = self._mapa(M); n = len(bits) // bps
        idx = (np.packbits(bits.reshape(-1,bps), axis=1, bitorder='big').ravel()[:n]) % M
        pts = IQ[idx]
        t_sym = np.linspace(0, 1/p.sr, mps, endpoint=False, dtype=np.float32)
        s = np.zeros(n * mps, dtype=np.float32)
        for i, (I2, Q2) in enumerate(pts):
            tt = t_sym + i/p.sr
            s[i*mps:(i+1)*mps] = I2*np.cos(2*np.pi*p.fc*tt) - Q2*np.sin(2*np.pi*p.fc*tt)
        return s, pts

    def demodular(self, rx, p):
        M = 2**p.bps; bps = p.bps; mps = max(1, int(p.fs/p.sr))
        IQ = self._mapa(M); n = len(rx) // mps
        t_m = (np.arange(n*mps, dtype=np.float32)/p.fs).reshape(n, mps)
        segs = rx[:n*mps].reshape(n, mps)
        I2 =  2 * np.mean(segs * np.cos(2*np.pi*p.fc*t_m), axis=1)
        Q2 = -2 * np.mean(segs * np.sin(2*np.pi*p.fc*t_m), axis=1)
        rp = np.column_stack([I2, Q2])
        d  = np.sum((rp[:,None,:] - IQ[None,:,:])**2, axis=2)
        ci = np.argmin(d, axis=1)
        mask = np.zeros(8, dtype=bool); mask[8-bps:] = True
        bo = np.unpackbits(ci.astype(np.uint8), bitorder='big').reshape(-1,8)[:,mask].ravel()
        return bo[:n*bps], rp

class ModOFDM:
    def modular(self, bits, p):
        N = min(p.nsc, 8); mps = max(1, int(p.fs/p.sr))
        r = len(bits) % N
        if r: bits = np.append(bits, np.zeros(N-r, dtype=int))
        no = len(bits) // N
        fqs = np.linspace(p.fc, p.fc*2.5, N)
        s = np.zeros(no * mps, dtype=np.float32); pts = []
        for i in range(no):
            chunk = bits[i*N:(i+1)*N]
            t = np.linspace(0,1/p.sr,mps,endpoint=False,dtype=np.float32) + i/p.sr
            sym = np.zeros(mps, dtype=np.float32)
            for b, f in zip(chunk, fqs):
                ph = np.pi if b else 0.
                sym += np.cos(2*np.pi*f*t + ph); pts.append([np.cos(ph), np.sin(ph)])
            s[i*mps:(i+1)*mps] = sym / N
        return s, (np.array(pts[:N_CONST]) if pts else np.zeros((2,2)))

    def demodular(self, rx, p):
        N = min(p.nsc, 8); mps = max(1, int(p.fs/p.sr))
        fqs = np.linspace(p.fc, p.fc*2.5, N); no = len(rx) // mps
        bo = []; rp = []
        for i in range(no):
            seg = rx[i*mps:(i+1)*mps]
            t   = np.arange(len(seg), dtype=np.float32) / p.fs
            for f in fqs:
                c = float(np.mean(seg * np.cos(2*np.pi*f*t)))
                b = 1 if c < 0 else 0; bo.append(b); rp.append([1. if b==0 else -1., 0.])
        return np.array(bo, dtype=int), (np.array(rp[:N_CONST]) if rp else np.zeros((2,2)))

class Factory:
    _r = {TipoMod.ASK: ModASK, TipoMod.BPSK: ModBPSK,
          TipoMod.QAM: ModQAM, TipoMod.OFDM: ModOFDM}
    @classmethod
    def crear(cls, t): return cls._r.get(t, ModBPSK)()

class Cod:
    @staticmethod
    def hamming_enc(b):
        r = len(b) % 4
        if r: b = np.append(b, np.zeros(4-r, dtype=int))
        d = b.reshape(-1, 4)
        p1=(d[:,0]^d[:,1]^d[:,3]); p2=(d[:,0]^d[:,2]^d[:,3]); p3=(d[:,1]^d[:,2]^d[:,3])
        return np.column_stack([p1,p2,d[:,0],p3,d[:,1],d[:,2],d[:,3]]).ravel()

    @staticmethod
    def hamming_dec(b):
        r = len(b) % 7
        if r: b = np.append(b, np.zeros(7-r, dtype=int))
        bl = b.reshape(-1,7).copy()
        s = (bl[:,0]^bl[:,2]^bl[:,4]^bl[:,6]) + 2*(bl[:,1]^bl[:,2]^bl[:,5]^bl[:,6]) + 4*(bl[:,3]^bl[:,4]^bl[:,5]^bl[:,6])
        for i, pos in enumerate(s):
            if 0 < pos <= 7: bl[i, pos-1] ^= 1
        return bl[:,[2,4,5,6]].ravel()

    @staticmethod
    def enc(b, t):
        if t == TipoCod.HAMMING:    return Cod.hamming_enc(b)
        if t == TipoCod.REPETICION: return np.repeat(b, 3)
        return b

    @staticmethod
    def dec(b, t, L):
        if t == TipoCod.HAMMING:
            d = Cod.hamming_dec(b)
        elif t == TipoCod.REPETICION:
            n = (len(b)//3)*3; d = (b[:n].reshape(-1,3).sum(axis=1) > 1).astype(int)
        else:
            d = b
        return d[:L] if len(d) >= L else np.append(d, np.zeros(L-len(d), dtype=int))

class Canal:
    _i = None
    def __new__(cls):
        if not cls._i: cls._i = super().__new__(cls)
        return cls._i
    def ruido(self, s, snr):
        p = float(np.mean(s**2))
        if p < 1e-10: return s
        return s + np.random.normal(0, float(np.sqrt(p/10**(snr/10))), len(s)).astype(s.dtype)
    def tx(self, s, snr): return self.ruido(s * 0.85, snr)

class Motor:
    def __init__(self):
        self._p = Params(); self._c = Canal()
        self._obs: List[Callable] = []

    def config(self, p): self._p = p
    def params(self): return self._p
    def obs(self, cb): self._obs.append(cb)

    def b2b(self, data):
        return np.unpackbits(np.frombuffer(data, dtype=np.uint8)).astype(np.int8)

    def b2by(self, bits):
        return np.packbits(bits.astype(np.uint8) % 2).tobytes()

    def espectro(self, s):
        N   = N_FFT
        seg = s[:N].astype(np.float32)
        if len(seg) < N: seg = np.pad(seg, (0, N-len(seg)))
        F   = np.fft.rfft(seg * np.hanning(N).astype(np.float32))
        fq  = np.fft.rfftfreq(N, 1/self._p.fs)
        pt  = 20 * np.log10(np.abs(F) + 1e-12)
        m   = min(100, len(fq))
        return fq[:m].tolist(), pt[:m].tolist()

    def ojo(self, s):
        mps = max(1, int(self._p.fs / self._p.sr))
        per = 2 * mps; rows = []
        for i in range(min(N_OJO, len(s)//per)):
            seg = s[i*per:(i+1)*per]
            if len(seg) == per:
                st = max(1, per//40); rows.append(seg[::st].tolist())
        return rows

    def ber(self, tx, rx):
        n = min(len(tx), len(rx))
        return float(np.sum(tx[:n] != rx[:n]) / n) if n > 0 else 1.

    def transmitir(self, data: bytes, meta=None) -> Resultado:
        p    = self._p; meta = meta or {}
        if len(data) > MAX_FILE: data = data[:MAX_FILE]
        bo   = self.b2b(data)
        ck   = hashlib.md5(data).digest(); ck_b = self.b2b(ck)
        full = np.append(bo, ck_b)
        cod  = Cod.enc(full, p.cod); ov = len(cod) / max(len(full), 1)
        mod  = Factory.crear(p.mod)
        sm, ctx = mod.modular(cod.astype(np.int8), p); sm = sm.astype(np.float32)
        sr   = self._c.tx(sm, p.snr)
        rx_c, crx = mod.demodular(sr, p)
        rx_f = Cod.dec(rx_c, p.cod, len(full))
        rx_d = rx_f[:-128]; rx_ck = rx_f[-128:]
        d_rx = self.b2by(rx_d.astype(np.uint8)); ck_rx = self.b2by(rx_ck.astype(np.uint8))
        ck_ok = ck_rx[:16] == ck
        ber_v = self.ber(bo, rx_d[:len(bo)])
        fq, pt = self.espectro(sm); oj = self.ojo(sr)
        nv  = min(N_VISTA, len(sm))
        if not isinstance(ctx, np.ndarray) or ctx.ndim != 2: ctx = np.zeros((2,2))
        if not isinstance(crx, np.ndarray) or crx.ndim != 2: crx = np.zeros((2,2))
        r = Resultado(
            ber=ber_v, snr=p.snr, exito=round((1-ber_v)*100,2),
            bytes_tx=len(data), overhead=round(ov,3), ck_ok=ck_ok, mod=p.mod.value,
            v_tx=sm[:nv].tolist(), v_rx=sr[:nv].tolist(),
            freqs=fq, potencia=pt,
            ctx=ctx[:N_CONST].tolist(), crx=crx[:N_CONST].tolist(),
            ojo=oj, b_orig=bo[:N_BITS].tolist(), b_rx=rx_d[:N_BITS].tolist(),
            tiempo=(np.arange(nv, dtype=np.float32)/p.fs).tolist()
        )
        meta["d_rx"] = d_rx; meta["mod"] = p.mod.value
        r._meta = meta
        del sm, sr, cod, rx_c, rx_f
        for o in self._obs:
            try: o(r)
            except: pass
        return r

    def vivo(self):
        p = self._p; N = 300
        t  = np.linspace(0, N/p.fs, N, endpoint=False, dtype=np.float32)
        po = np.sin(2*np.pi*p.fc*t)
        ms = (0.5*np.sin(2*np.pi*25*t) + 0.35*np.sin(2*np.pi*70*t)).astype(np.float32)
        mo = ((1 + 0.65*ms) * po).astype(np.float32)
        ru = (mo + np.random.randn(N).astype(np.float32) * float(10**(-p.snr/20)) * 0.35)
        F  = np.fft.rfft(mo * np.hanning(N).astype(np.float32))
        fq = np.fft.rfftfreq(N, 1/p.fs)
        pt = 20 * np.log10(np.abs(F) + 1e-12)
        m  = min(90, len(fq))
        bits = (np.random.rand(N_BITS) > 0.5).astype(int).tolist()
        return {"t": t.tolist(), "po": po.tolist(), "mo": mo.tolist(), "ru": ru.tolist(),
                "fq": fq[:m].tolist(), "pt": pt[:m].tolist(),
                "snr": p.snr, "fc": p.fc, "mod": p.mod.value, "bits": bits}

    def curva_ber(self):
        rng  = list(range(0, 26, 2)); bers = []; test = b"CommSim test" * 8
        p0   = self._p; mod = Factory.crear(p0.mod); bits = self.b2b(test)
        for snr in rng:
            p2 = Params(fs=p0.fs, fc=p0.fc, sr=p0.sr, snr=float(snr),
                        mod=p0.mod, cod=TipoCod.NINGUNA, bps=p0.bps)
            try:
                s, _ = mod.modular(bits, p2)
                rx_s = self._c.tx(s.astype(np.float32), float(snr))
                rx, _ = mod.demodular(rx_s, p2)
                bers.append(max(self.ber(bits, rx), 1e-5))
            except:
                bers.append(0.5)
        return rng, bers