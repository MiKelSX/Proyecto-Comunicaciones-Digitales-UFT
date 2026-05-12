# CommSim v3 — Especificaciones Técnicas Detalladas

## Tabla de Contenidos
1. [Arquitectura del Sistema](#arquitectura)
2. [Protocolos de Comunicación](#protocolos)
3. [Algoritmos DSP](#algoritmos-dsp)
4. [Formato de Datos](#formato-de-datos)
5. [Configuración de Canal](#configuracion-canal)
6. [Métricas y Cálculos](#metricas)
7. [Rendimiento](#rendimiento)

---

## Arquitectura

### Capas del Sistema

```
┌─────────────────────────────────────────┐
│   Capa de Presentación (Frontend)      │
│   - HTML5/CSS3/JS Vanilla               │
│   - Canvas 2D para gráficos             │
│   - WebAudio API para audio             │
└────────────────┬────────────────────────┘
                 │ HTTP REST API
┌────────────────▼────────────────────────┐
│   Capa de Aplicación (Flask)           │
│   - 10+ endpoints REST                  │
│   - Gestión de nodos A y B              │
│   - Encolado de mensajes                │
└────────────────┬────────────────────────┘
                 │ Python objects
┌────────────────▼────────────────────────┐
│   Capa DSP (NumPy Vectorizado)         │
│   - Modulación/Demodulación            │
│   - Codificación/Decodificación        │
│   - Análisis espectral                 │
│   - Generación de ruido                │
└─────────────────────────────────────────┘
```

### Flujo de Transmisión

```
Datos origen (bytes)
    ↓
[b2b] Conversión a bits
    ↓
[Codificación] FEC (Hamming/Repetición)
    ↓
[Modulación] (ASK/BPSK/QAM/OFDM)
    ↓
[Canal] Ruido AWGN
    ↓
[Demodulación]
    ↓
[Decodificación]
    ↓
[b2by] Conversión a bytes
    ↓
Datos destino + Métricas (BER, SNR, ...)
```

---

## Protocolos

### API REST

**Base URL**: `http://localhost:5000/api/<nodo>`

#### Endpoints Implementados

##### 1. Obtener Parámetros
```http
GET /api/A/params
Content-Type: application/json

Response:
{
  "fs": 8000,
  "fc": 400.0,
  "sr": 40.0,
  "snr": 20.0,
  "mod": "BPSK",
  "cod": "Hamming(7,4)",
  "bps": 2,
  "nsc": 4
}
```

##### 2. Configurar Parámetros
```http
POST /api/A/params
Content-Type: application/json

{
  "snr": 15.0,
  "fc": 500.0,
  "mod": "QAM",
  "cod": "Ninguna"
}

Response:
{"ok": true}
```

##### 3. Obtener Datos en Vivo
```http
GET /api/A/vivo

Response:
{
  "t": [0.0, 0.000125, 0.00025, ...],  # Tiempo (s)
  "po": [1.0, 0.97, 0.88, ...],        # Portadora
  "mo": [0.5, 0.48, 0.44, ...],        # Modulada
  "ru": [0.52, 0.50, 0.46, ...],       # Ruidosa
  "fq": [0, 10, 20, ...],              # Frecuencias (Hz)
  "pt": [10, 15, 20, ...],             # Potencia (dB)
  "snr": 20.0,
  "fc": 400.0,
  "mod": "BPSK",
  "bits": [1, 0, 1, ...]               # Stream NRZ
}
```

##### 4. Transmitir Datos
```http
POST /api/A/tx
Content-Type: application/json

{
  "tipo": "texto",
  "texto": "Hola CommSim",
  "nom": "saludo.txt"
}

Response:
{
  "ok": true,
  "resultado": {
    "ber": 0.015625,
    "snr": 20.0,
    "exito": 98.44,
    "bytes_tx": 12,
    "ck_ok": true,
    "overhead": 1.75,
    "mod": "BPSK",
    "tiempo": [0.0, 0.000125, ...],
    "v_tx": [1.0, 0.97, ...],          # Voltaje TX
    "v_rx": [0.98, 0.95, ...],         # Voltaje RX
    "freqs": [0, 10, 20, ...],
    "potencia": [10, 15, ...],
    "ctx": [[1, 0], [-1, 0], ...],    # Constelación TX
    "crx": [[0.98, 0.05], ...],       # Constelación RX
    "ojo": [[1.0, 0.97, ...], ...],   # Eye diagram filas
    "b_orig": [1, 0, 1, ...],
    "b_rx": [1, 0, 1, ...],
    "amplitud_tx": [1.0, 0.98, ...],
    "amplitud_rx": [0.98, 0.96, ...]
  }
}
```

##### 5. Recibir Mensajes
```http
GET /api/B/buzon

Response:
[
  {
    "tipo": "texto",
    "b64": "SGVsbyBDb21tU2ltwrE=",
    "emisor": "A",
    "ts": 1697845200.123,
    "ber": 0.015625,
    "ck_ok": true,
    "tam": 12,
    "nom": "saludo.txt",
    "resultado": { ... }
  }
]
```

##### 6. Obtener Estadísticas
```http
GET /api/A/stats

Response:
{
  "enviados": 5,
  "recibidos": 4,
  "bytes_tx": 150,
  "bytes_rx": 140,
  "errores": 1,
  "ber_prom": 0.018,
  "snr_prom": 19.5,
  "exito_prom": 98.2,
  "integridad_prom": 80.0,
  "ber_valores": [0.015, 0.02, ...],
  "snr_valores": [20, 19.8, ...],
  "exito_valores": [98.5, 98, ...]
}
```

##### 7. Histórico Completo
```http
GET /api/A/stats_historico

Response:
{
  "tx_historico": [
    {
      "ts": 1697845200.123,
      "tipo": "texto",
      "tam": 12,
      "nom": "saludo.txt",
      "ber": 0.015625,
      "snr": 20.0,
      "exito": 98.44,
      "ck_ok": true,
      "mod": "BPSK"
    },
    ...
  ],
  "rx_historico": [
    {
      "ts": 1697845205.456,
      "tipo": "audio_tono",
      "tam": 45678,
      "nom": "tono_440hz.wav",
      "emisor": "B",
      "ber": 0.012,
      "ck_ok": true
    },
    ...
  ]
}
```

---

## Algoritmos DSP

### Modulación BPSK

**Código de Implementación:**
```python
class ModBPSK:
    def modular(self, bits, p):
        """Modula bits a BPSK"""
        mps = max(1, int(p.fs / p.sr))  # Muestras por símbolo
        n = len(bits)
        t_all = np.arange(n * mps, dtype=np.float32) / p.fs
        fase = np.repeat(bits * np.pi, mps).astype(np.float32)
        s = np.sin(2 * np.pi * p.fc * t_all + fase)
        constelacion = np.array([[-1., 0.], [1., 0.]])
        return s, constelacion
```

**Fórmula Matemática:**
$$s_{\text{BPSK}}(t) = \sin(2\pi f_c t + \pi \cdot b[n])$$

donde:
- $f_c$ = frecuencia portadora
- $b[n]$ ∈ {0, 1} = bit n-ésimo
- Fase 0° para bit 0, fase 180° para bit 1

### Demodulación BPSK

```python
def demodular(self, rx, p):
    """Demodula BPSK"""
    mps = max(1, int(p.fs / p.sr))
    n = len(rx) // mps
    segs = rx[:n*mps].reshape(n, mps)
    t_m = (np.arange(n*mps, dtype=np.float32) / p.fs).reshape(n, mps)
    ref = np.sin(2 * np.pi * p.fc * t_m)
    denom = np.sum(ref**2, axis=1) + 1e-12
    I = np.sum(segs * ref, axis=1) / denom
    bits = (I < 0).astype(int)
    return bits, np.column_stack([I, np.zeros(n)])
```

**Decisión:**
- Si I > 0 → bit = 0
- Si I < 0 → bit = 1

### Codificación Hamming(7,4)

**Matriz Generadora:**
```
    d0  d1  d2  d3
p1: 1   1   0   1
p2: 1   0   1   1
p3: 0   1   1   1
```

**Cálculo de Paridades:**
```python
p1 = d0 ^ d1 ^ d3
p2 = d0 ^ d2 ^ d3
p3 = d1 ^ d2 ^ d3
```

**Palabra Codificada:** `[p1, p2, d0, p3, d1, d2, d3]` (7 bits)

**Síndrome en Decodificación:**
```python
s1 = p1 ^ d0 ^ d1 ^ d3
s2 = p2 ^ d0 ^ d2 ^ d3
s3 = p3 ^ d1 ^ d2 ^ d3
error_pos = s1 + 2*s2 + 4*s3  # Posición del error (1-7)
```

### Análisis Espectral (FFT)

```python
def espectro(self, s):
    N = N_FFT  # 256 por defecto
    seg = s[:N].astype(np.float32)
    if len(seg) < N:
        seg = np.pad(seg, (0, N-len(seg)))
    
    F = np.fft.rfft(seg * np.hanning(N).astype(np.float32))
    fq = np.fft.rfftfreq(N, 1/self._p.fs)
    pt = 20 * np.log10(np.abs(F) + 1e-12)  # Escala en dB
    
    return fq[:m].tolist(), pt[:m].tolist()
```

**Ventana Hanning** para reducir spectral leakage:
$$w[n] = 0.5 - 0.5 \cos\left(\frac{2\pi n}{N-1}\right)$$

### Eye Diagram

```python
def ojo(self, s):
    mps = max(1, int(self._p.fs / self._p.sr))
    per = 2 * mps  # Período = 2 símbolos
    rows = []
    for i in range(min(N_OJO, len(s)//per)):
        seg = s[i*per:(i+1)*per]
        if len(seg) == per:
            st = max(1, per//40)  # Downsampling
            rows.append(seg[::st].tolist())
    return rows
```

Superpone N_OJO=20 períodos de la señal para detectar ISI.

---

## Formato de Datos

### Estructura de Transmisión (Interna)

```
┌─────────────────────────────────────────┐
│ DATOS ORIGINALES (N bytes)              │
├─────────────────────────────────────────┤
│ CONVERSIÓN: bits = b2b(datos)           │
├─────────────────────────────────────────┤
│ CHECKSUM: md5_hash = MD5(datos)         │
│           md5_bits = b2b(md5_hash)      │
├─────────────────────────────────────────┤
│ CONCATENACIÓN: todo = bits + md5_bits   │
├─────────────────────────────────────────┤
│ CODIFICACIÓN: cod_bits = FEC(todo)      │
├─────────────────────────────────────────┤
│ MODULACIÓN: señal = MOD(cod_bits)       │
├─────────────────────────────────────────┤
│ CANAL: señal_rx = AWGN(señal, SNR)      │
└─────────────────────────────────────────┘
```

### Tamaños de Datos (Bytes → Bits)

| Tipo | Tamaño Máx | Bits Originales | Con Hamming | Con Repetición |
|------|-----------|-----------------|-------------|----------------|
| Texto | 5000 B | 40000 | 70000 | 120000 |
| Imagen | 10 MB | 80M | 140M | 240M |
| Audio | 256 KB | 2048K | 3584K | 6144K |
| Archivo | 1 MB | 8M | 14M | 24M |

### Codificación Base64 (Para JSON)

Todos los datos binarios se codifican en Base64 para transmisión HTTP:
- Incrementa tamaño ≈ 33% (4 caracteres por 3 bytes)
- Reversible 100%
- ASCII seguro

---

## Configuración Canal

### Parámetros por Defecto

```python
@dataclass
class Params:
    fs:  int   = 8000      # Frecuencia muestreo (Hz)
    fc:  float = 400.0     # Portadora (Hz)
    sr:  float = 40.0      # Tasa símbolo (símb/s)
    snr: float = 20.0      # SNR (dB)
    mod: TipoMod = BPSK    # Modulación
    cod: TipoCod = HAMMING # Codificación
    bps: int   = 2         # Bits por símbolo
    nsc: int   = 4         # Subportadoras (OFDM)
```

### Ancho de Banda Ocupado

$$BW = 1.2 \times sr \times \log_2(M)$$

donde M = 2^bps (constelación)

Ejemplos:
- BPSK (bps=1): BW = 1.2 × 40 × 1 = 48 Hz
- QPSK (bps=2): BW = 1.2 × 40 × 2 = 96 Hz  
- 16-QAM (bps=4): BW = 1.2 × 40 × 4 = 192 Hz

### Modelo de Ruido AWGN

$$y[n] = x[n] + w[n]$$

donde $w[n] \sim \mathcal{N}(0, \sigma^2)$

$$\sigma = \sqrt{\frac{P_x}{10^{\text{SNR(dB)}/10}}}$$

---

## Métricas

### Bit Error Rate (BER)

```python
def ber(self, tx, rx):
    n = min(len(tx), len(rx))
    return float(np.sum(tx[:n] != rx[:n]) / n) if n > 0 else 1.0
```

Rango: [0, 1] (0% a 100%)

### Tasa de Éxito

$$\text{Éxito} = (1 - \text{BER}) \times 100 \%$$

### Overhead de Codificación

$$\text{Overhead} = \frac{\text{Bits POST-codificación}}{\text{Bits PRE-codificación}}$$

Valores típicos:
- Sin codificación: 1.0×
- Hamming(7,4): 1.75×
- Repetición x3: 3.0×

### Integridad (Checksum MD5)

```python
import hashlib
ck = hashlib.md5(data).digest()  # 16 bytes = 128 bits
ck_ok = (ck_rx[:16] == ck)  # Comparación exacta
```

Probabilidad falso positivo: ≈ 2^-128 (negligible)

### Curva BER Teórica

**BPSK en AWGN:**
$$\text{BER} = Q\left(\sqrt{\frac{2 E_b}{N_0}}\right)$$

donde Q(x) ≈ erfc(x/√2)/2

---

## Rendimiento

### Complejidad Computacional

| Operación | Complejidad | Tiempo aprox (128 bytes) |
|-----------|------------|--------------------------|
| b2b (bytes→bits) | O(N) | < 1 ms |
| FFT (256 muestras) | O(N log N) | 2-5 ms |
| Modulación BPSK | O(N·mps) | 10-20 ms |
| Hamming FEC | O(N) | 5-10 ms |
| Demodulación | O(N·mps) | 15-25 ms |

### Ocupación Memoria

- Motor: ≈ 2 MB (buffers)
- Por transmisión: ≈ 500 KB (datos + FFT)
- Histórico (100 TX): ≈ 10 MB

### Límite de Throughput

```
Máximo teórico = fs × log2(M) / 1000 (kbps)

Ejemplos:
- BPSK (fs=8kHz): 8 kbps
- QPSK (fs=8kHz): 16 kbps
- 16-QAM (fs=8kHz): 32 kbps
```

En práctica:
- Con codificación Hamming: ÷ 1.75
- Con codificación Repetición: ÷ 3

### Latencia Total

```
Latencia = Codificación + Modulación + Demodulación + Decodificación
         ≈ 10 + 20 + 25 + 10 = 65 ms
```

---

## Debugging y Logging

### Variables de Entorno

```bash
export FLASK_DEBUG=1        # Modo debug
export FLASK_ENV=development
```

### Acceso a Logs

```python
# En servidor.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Puntos de Ruptura Útiles

1. `motor_senales.py` línea 280: Transmisión
2. `motor_senales.py` línea 320: Demodulación
3. `servidor.py` línea 100: Endpoint tx

---

## Validación

### Test Suite

```bash
pytest tests/test_motor.py::test_bpsk_modulacion -v
pytest tests/test_motor.py::test_hamming_fec -v
pytest tests/test_motor.py::test_ber_calculation -v
```

### Checklist de Verificación

- [ ] SNR slider 0-40 dB
- [ ] BER ∈ [0, 1]
- [ ] Overhead correcto por codificación
- [ ] Integridad MD5 siempre correcta sin errores
- [ ] FFT con picos en fc ± fc/2
- [ ] Eye diagram sin ISI significativo
- [ ] Constelación RX cerca de TX

---

**Fin de especificaciones técnicas**
