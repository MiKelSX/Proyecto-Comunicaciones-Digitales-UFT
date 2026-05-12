# CommSim v3 — Guía de Referencia Rápida

## 🚀 Inicio Rápido (3 minutos)

```bash
# 1. Extraer archivos
cd proy_cd_2

# 2. Crear entorno
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

# 3. Instalar
pip install -r requirements.txt

# 4. Ejecutar
python iniciar.py
```

✅ Automáticamente abre:
- Nodo A: http://localhost:5000/?nodo=A
- Nodo B: http://localhost:5000/?nodo=B

---

## 📊 Interfaz de Usuario

### Barra Superior
```
[🌊 COMMSIM v3] [NODO A ↔ B] [🔴 TX] [🟢 CANAL] [🔴 RX] [🎨] [Nodo ▼] [⏳]
```

### 4 Pestañas Principales
```
⚡ Entorno en Vivo → 📡 Enviar → 📥 Recibir → 📊 Estadísticas
```

---

## ⚡ TAB 1: Entorno en Vivo

**Funciona en AMBOS nodos**

### Parámetros del Canal
| Control | Rango | Efecto |
|---------|-------|--------|
| SNR | 0-40 dB | Menos ruido → menos errores |
| Portadora | 100-2000 Hz | Frecuencia de la onda portadora |
| Tasa símbolo | 10-200 símb/s | Más rápido = más errores |
| Modulación | ASK/BPSK/QAM/OFDM | Eficiencia espectral |
| Codificación | Ninguna/Hamming/Rep | Corrección errores |
| Bits/símbolo | 1-4 | Info por símbolo |

### 6 Gráficos en Tiempo Real

| Gráfico | Eje X | Eje Y | Indica |
|---------|-------|-------|--------|
| Señales en Tiempo | Tiempo (s) | Amplitud | Portadora vs Modulada vs Ruidosa |
| Espectro PSD | Frecuencia (Hz) | Potencia (dB) | Ocupación espectral |
| Constelación IQ | Eje I | Eje Q | Puntos ideales vs recibidos |
| Eye Diagram | Tiempo | Amplitud | Calidad de símbolo |
| Bits NRZ | Índice | 0 o 1 | Stream binario |
| Espectro EM | Frecuencia (log) | Banda | Posición en espectro EM |

---

## 📡 TAB 2: Enviar (Solo Nodo A)

### Tipos de Dato

**Texto**
- Máx: 5000 caracteres
- Ejemplo: "CommSim prueba"
- Predeterminado: "CommSim v3..."

**Imagen**
- Máx: 10 MB
- Formatos: PNG, JPG, WebP
- Arrastra o haz clic

**Audio**
- Opción 1: Grabar desde micrófono (máx 256 KB)
- Opción 2: Generar tono (110-1760 Hz)

**Archivo**
- Máx: 1 MB
- Cualquier tipo binario
- Con verificación MD5

### Resultado de Transmisión

**Métricas**:
```
BER: Tasa de error de bits
SNR: Relación señal-ruido (dB)
Éxito: % de bits correctos
Bytes: Tamaño transmitido
MD5: Checksum (✓ OK / ✗ Error)
Overhead: Expansión por FEC
```

**Gráficos**:
- TX vs RX: Comparación de envoltentes
- Espectro TX: FFT de la transmisión
- Constelación RX: Puntos recibidos

### Log TX
```
[HH:MM:SS] 📤 Enviado "texto" (128 B) — BER 0.01
[HH:MM:SS] ✓ Checksum OK
```

---

## 📥 TAB 3: Recibir (Solo Nodo B)

### Bandeja de Entrada
Cada mensaje muestra:
```
📄 TIPO | EMISOR A | BER: 0.01 | ✓ | 128 B | tono_440hz.wav | [Descargar]
```

### Métricas en Vivo
```
Recibidos: 5
Bytes RX: 2.3 KB
Errores: 0
Integridad: 100%
BER prom: 0.005
SNR prom: 20.5 dB
```

### Gráficos RX
- Eye Diagram RX: Calidad de recepción
- Constelación RX: Nube de puntos recibidos
- Espectro RX: Análisis frecuencial
- Bits RX (NRZ): Stream recibido

### Log RX
```
[HH:MM:SS] 📩 Recibido "texto" (128 B) de A
[HH:MM:SS] ✓ Integridad verificada
```

---

## 📊 TAB 4: Estadísticas

### Panel Principal (8 métricas)
```
┌───────────────────────────────────────────────┐
│ BER Actual: 0.01 | SNR: 20 dB | Éxito: 99%  │
│ Bytes TX: 512 | Enviados: 4 | Recibidos: 4  │
│ Integridad: 100% | Overhead: 1.75x          │
└───────────────────────────────────────────────┘
```

### 4 Gráficos Analíticos

**Curva BER vs SNR**
```
Log(BER) ▲
         │
      -1 │    ╱╱╱  Teórico BPSK
      -3 │   ╱  ╱  Medido ✓
      -5 │  ╱ ╱
         └──────────── SNR (dB)
           0    10    20    30
```

**Historial BER**
```
BER ▲
0.1 │  •
0.01│ • •   •
0  │• • • • •  (últimas 50)
    └─────────► Número TX
```

**Espectrograma 2D**
```
Potencia (dB) con código de color
Tiempo vs Frecuencia
```

**Histograma Amplitud**
```
Contar ▲
      │  ▄█
      │ ▄██
      │▄███
      └────► Amplitud
```

---

## 🎛️ Parámetros de Configuración

### Preset Recomendados

| Escenario | SNR | Mod | Cod | Bps |
|-----------|-----|-----|-----|-----|
| SNR Alto | 25+ | QAM | Ninguna | 4 |
| SNR Normal | 15-20 | BPSK | Hamming | 1 |
| SNR Bajo | 5-10 | BPSK | Hamming | 1 |
| SNR Muy Bajo | <5 | ASK | Repetición | 1 |
| Gran BW | - | OFDM | Hamming | 2 |

### Fórmula de Ancho de Banda
$$\text{BW} = 1.2 \times \text{sr} \times \log_2(\text{M})$$

donde M = 2^(bits/símbolo)

---

## 📈 Lectura de Métricas

### BER (Bit Error Rate)
```
0.0   = Perfecto
0.001 = Excelente
0.01  = Muy bueno
0.1   = Aceptable
0.5   = Inutilizable
```

### SNR (dB)
```
0 dB   = Ruido igual potencia señal
10 dB  = Señal 10× más potente
20 dB  = Señal 100× más potente
30 dB  = Señal 1000× más potente
```

### Integridad MD5
```
✓ OK    = Todos los bytes correctos
✗ ERROR = Al menos 1 bit errado
```

---

## 🎨 Modo Tema

**Botón en esquina superior derecha:**
- 🌙 "Modo B&N" → Tema claro
- 🌙 "Modo Oscuro" → Tema oscuro

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| TAB | Cambiar entre pestaña |
| SPACE | Grabar/Detener audio |
| ENTER | Transmitir mensaje |
| Ctrl+R | Refrescar página |
| Ctrl+Shift+R | Hard refresh (borrar cache) |

---

## 🔧 Solución Rápida de Problemas

| ❌ Problema | ✅ Solución |
|-----------|-----------|
| Gráficos vacíos | Cambia tab a Entorno en Vivo y espera |
| BER no cambia | Aumenta/disminuye SNR manualmente |
| Audio no funciona | Autoriza micrófono en navegador |
| Página lenta | Cierra otras pestañas/aplicaciones |
| "Error 500" en servidor | Revisa consola (terminal) del servidor |
| Puerto 5000 en uso | `python servidor.py --puerto 8080` |
| No llega mensaje a B | Recarga página de Nodo B |

---

## 📊 Benchmark Típico

### Con BPSK + Hamming + SNR=20dB

```
Tiempo de transmisión (128 B):
  Codificación:     5 ms
  Modulación:      15 ms
  Demodulación:    20 ms
  Decodificación:   8 ms
  ─────────────────────
  TOTAL:          ~48 ms

BER esperado: 0.0001-0.001
Éxito esperado: 99-99.99%
```

---

## 📖 Referencia Modulaciones

### ASK (Amplitude Shift Keying)
```
0 → Baja amplitud
1 → Alta amplitud
Consumo: BAJO | Robustez: BAJA
```

### BPSK (Binary Phase Shift Keying)
```
0 → Fase 0°
1 → Fase 180°
Consumo: BAJO | Robustez: MUY ALTA ⭐
```

### QAM (Quadrature Amplitude Modulation)
```
4-QAM (2 bits): 4 puntos
16-QAM (4 bits): 16 puntos
Consumo: ALTO | Robustez: MEDIA
```

### OFDM (Orthogonal FDM)
```
Múltiples subportadoras
4-32 canales paralelos
Consumo: MUY ALTO | Robustez: ALTA (fading)
```

---

## 🔐 Referencia Codificación

### Sin Codificación
```
Entrada: XXXXX (5 bits)
Salida: XXXXX (5 bits)
Overhead: 1.0×
Corrección: NINGUNA
```

### Hamming(7,4)
```
Entrada: XXXX (4 bits)
Salida: PPPXPXXX (7 bits)
Overhead: 1.75×
Corrección: 1 bit errado
Detección: 2 bits errados
```

### Repetición x3
```
Entrada: X (1 bit)
Salida: XXX (3 bits)
Overhead: 3.0×
Corrección: Todos si < 2 errores por símbolo
```

---

## 🧪 Test Rápido

Ejecutar este test verifica todo funciona:

```bash
# 1. Terminal A (Nodo A)
python iniciar.py

# 2. Terminal B (Nodo B) — Abre segundo terminal
curl http://localhost:5000/api/A/stats

# Si ves JSON con {}, todo OK ✓
```

---

## 💾 Exportar Datos

### Histórico en JSON

```javascript
// En consola navegador (F12):
console.log(JSON.stringify(A.lastR, null, 2))
// Copia y pega en archivo .json
```

### Captura de Pantalla

```bash
# Print Screen o Ctrl+Prtsc
# Pega en Paint/Photoshop
```

---

## 🌐 Red LAN (Multi-PC)

Si ejecutas en PC1 y quieres abrir desde PC2:

1. **PC1**: Terminal
   ```bash
   python servidor.py --puerto 5000
   # Nota la IP: 192.168.X.X
   ```

2. **PC2**: Navegador
   ```
   http://192.168.X.X:5000/?nodo=A
   ```

---

## 📞 Soporte Rápido

### Errores Comunes
```
ModuleNotFoundError: No module named 'flask'
→ pip install -r requirements.txt

Address already in use
→ Cambia puerto: python servidor.py --puerto 8080

CORS Error
→ Recarga navegador (Ctrl+Shift+R)
```

### Logs Útiles
```bash
# Terminal del servidor
# Mira líneas con [ERROR] o [WARNING]
```

---

## 📚 Documento Relacionados

- **README.md**: Descripción completa del proyecto
- **ESPECIFICACIONES.md**: Detalles técnicos profundos
- **EJEMPLOS.md**: 10 proyectos educativos

---

## 🎓 Nivel de Dificultad

```
⭐ PRINCIPIANTE (5 min)
└─ Abre app, lee gráficos en vivo

⭐⭐ BÁSICO (20 min)
└─ Transmite texto entre nodos

⭐⭐⭐ INTERMEDIO (1-2 hrs)
└─ Compara modulaciones y codificaciones

⭐⭐⭐⭐ AVANZADO (4+ hrs)
└─ Analiza teórico vs medido
└─ Modifica algoritmos

⭐⭐⭐⭐⭐ EXPERTO
└─ Implementa nuevas modulaciones
└─ Diseña ecualizador adaptativo
```

---

**Última actualización: 2026**  
**Versión: 3.0**
