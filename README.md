# CommSim v3 — Simulador Avanzado de Comunicaciones Digitales

Un simulador interactivo profesional de comunicaciones digitales que permite transmitir y recibir información entre dos nodos (A y B) con modulación configurable, codificación de canal, y análisis detallado de señales en tiempo real.

## 🎯 Características Principales

### ⚡ Entorno en Vivo
Visualización en tiempo real de parámetros del canal y señales:

- **Parámetros del Canal**: Ajusta SNR, portadora, tasa de símbolo, modulación y codificación
- **Señales en el Tiempo**: Visualiza portadora, modulada y ruidosa simultáneamente
- **Espectro de Potencia (PSD)**: Análisis en frecuencia con transformada rápida de Fourier (FFT)
- **Constelación IQ**: Gráfico en plano complejo para modulaciones QAM y OFDM
  - TX ideal (puntos de constelación teóricos)
  - RX recibido (con ruido y distorsión)
- **Eye Diagram**: Diagrama de ojo para detectar interferencia entre símbolos (ISI)
- **Stream de Bits NRZ**: Visualización del flujo binario en código NRZ
- **Espectro Electromagnético**: Posicionamiento automático de la señal en el espectro EM
  - Desde Radio hasta Rayos Gamma

### 📡 Módulo de Envío (Nodo A)

#### Tipos de Datos Soportados
1. **Texto**: 
   - Hasta 5000 caracteres UTF-8
   - Codificación transparente
   
2. **Imagen**:
   - Formatos: PNG, JPG, WebP
   - Máximo 10 MB
   - Se envía completa sin compresión
   
3. **Audio**:
   - **Grabación**: Desde micrófono (máx 256 KB)
   - **Generador de Tonos**: Frecuencia ajustable 110-1760 Hz
   - Formato WAV para tonos
   
4. **Archivo**:
   - Cualquier tipo binario
   - Máximo 1 MB
   - Verificación de integridad con MD5

#### Resultado de Transmisión Individual
Cada transmisión muestra métricas detalladas:

**Métricas Numéricas:**
- BER (Bit Error Rate): Tasa de error de bits
- SNR (dB): Relación señal-ruido en decibelios
- Éxito (%): Porcentaje de bits correctos
- Bytes: Tamaño del datos transmitido
- MD5/Integridad: Verificación de checksum
- Overhead: Factor de expansión por codificación

**Gráficos Incluidos:**
- TX vs RX: Comparación de envoltentes de señal
- Espectro TX: Análisis frecuencial de la transmisión
- Constelación RX: Puntos recibidos vs ideales
- Bits TX/RX: Comparación de streams binarios

**Histórico:**
- Últimas 100 transmisiones almacenadas
- Timestamp de cada envío
- Tipo de dato y tamaño

### 📥 Módulo de Recepción (Nodo B)

#### Mensajes Recibidos
- **Bandeja de Entrada**: Cola visible de mensajes con:
  - Tipo de dato (Texto/Imagen/Audio/Archivo)
  - Emisor (A o B)
  - BER y estado de integridad
  - Tamaño en bytes
  - Timestamp

#### Métricas de Recepción en Vivo
- **Recibidos**: Contador total
- **Bytes RX**: Total acumulado
- **Errores**: Transmisiones fallidas
- **Integridad**: Porcentaje de checksums correctos
- **BER promedio**: Tasa de error promediada
- **SNR promedio**: Relación señal-ruido promediada

#### Gráficos de Recepción
- **Eye Diagram RX**: Diagrama de ojo recibido
- **Constelación RX**: Puntos en plano complejo
- **Espectro RX**: Análisis frecuencial de entrada
- **Bits RX (NRZ)**: Stream binario recibido

#### Histórico de Recepción
- Últimas 100 recepciones
- Emisor, tipo, tamaño, BER individual

### 📊 Estadísticas Avanzadas

#### Panel Principal de Estadísticas
Visualización de KPIs generales:

| Métrica | Descripción |
|---------|-------------|
| BER Actual | Último valor medido |
| SNR (dB) | Relación señal-ruido actual |
| Éxito (%) | Tasa de éxito promedio |
| Bytes TX | Total transmitidos en sesión |
| Enviados | Contador de transmisiones |
| Recibidos | Contador de recepciones |
| Integridad | % de checksums MD5 correctos |
| Overhead | Expansión promedio por codificación |

#### Gráficos Analíticos

1. **Curva BER vs SNR**
   - Curva teórica BPSK
   - Curva medida experimental
   - Permite comparar desempeño
   
2. **Historial BER**
   - Evolución de BER en el tiempo
   - Últimas 100 mediciones
   - Identifica tendencias
   
3. **Espectrograma 2D**
   - Representación tiempo-frecuencia
   - Muestra concentración de potencia
   - Detecta anomalías espectrales
   
4. **Histograma de Amplitud**
   - Distribución de amplitudes de señal
   - Útil para detectar saturación
   - Analiza densidad de probabilidad

## ⚙️ Parámetros del Canal Configurables

### Parámetros Físicos

| Parámetro | Rango | Unidad | Descripción |
|-----------|-------|--------|-------------|
| **SNR** | 0-40 | dB | Relación señal-ruido |
| **Portadora (fc)** | 100-2000 | Hz | Frecuencia de la portadora |
| **Tasa de símbolo (sr)** | 10-200 | Símb/s | Velocidad de transmisión |
| **Fs (Muestreo)** | Fijo | 8000 | Hz (configurable en código) |

### Parámetros de Modulación

| Parámetro | Opciones | Descripción |
|-----------|----------|-------------|
| **Modulación** | ASK, BPSK, QAM, OFDM | Tipo de modulación digital |
| **Codificación** | Ninguna, Hamming(7,4), Repetición x3 | Código corrector de errores |
| **Bits/símbolo** | 1-4 | Información por símbolo (espectral) |
| **Subportadoras (OFDM)** | 1-32 | Número de portadoras ortogonales |

## 🔧 Modulaciones Implementadas

### ASK (Amplitude Shift Keying)
```
Ecuación: s(t) = A·bit(t)·cos(2πfc·t)
- 0 → Amplitud baja (apagado)
- 1 → Amplitud alta (encendido)
```
**Características:**
- Más simple, menos eficiente espectralmente
- Vulnerable al ruido de amplitud
- Constelación: 2 puntos en línea real

### BPSK (Binary Phase Shift Keying)
```
Ecuación: s(t) = A·cos(2πfc·t + π·bit(t))
- 0 → Fase 0° (cos)
- 1 → Fase 180° (-cos)
```
**Características:**
- Estándar de la industria para bajo SNR
- Robusto frente a fading
- Constelación: 2 puntos opuestos en círculo
- **BER teórico**: Q(√(2·SNR_lineal))

### QAM (Quadrature Amplitude Modulation)
```
Ecuación: s(t) = I(t)·cos(2πfc·t) - Q(t)·sin(2πfc·t)
- Componentes I (In-phase) y Q (Quadrature)
- 4-QAM: 2 bits/símbolo
- 16-QAM: 4 bits/símbolo
```
**Características:**
- Mayor capacidad espectral
- Requiere SNR más alto
- Constelación: 4 o 16 puntos en cuadrícula
- Muy usado en WiFi, 4G, 5G

### OFDM (Orthogonal Frequency Division Multiplexing)
```
Ecuación: s(t) = Σ[Ik·cos(2π(fc+k·Δf)·t) + Qk·sin(2π(fc+k·Δf)·t)]
- Múltiples subportadoras ortogonales
- Δf = espaciado entre portadoras
```
**Características:**
- Robusto ante desvanecimiento selectivo
- Base de WiFi, 4G, 5G, DVB
- Eficiente en espectro
- Implementación con IFFT

## 🔐 Códigos Correctores de Errores (FEC)

### Hamming(7,4)
```
Entrada: 4 bits de datos (d0-d3)
Salida: 7 bits (3 paridad p1-p3 + 4 datos)

Matriz de paridad:
p1 = d0 ⊕ d1 ⊕ d3
p2 = d0 ⊕ d2 ⊕ d3
p3 = d1 ⊕ d2 ⊕ d3
```
**Características:**
- Puede corregir 1 bit erróneo
- Puede detectar 2 bits errados
- Overhead 1.75× (7 bits de 4 datos)
- Distancia mínima 3

### Repetición x3
```
Entrada: N bits
Salida: 3N bits (cada bit se repite 3 veces)

Decodificación: Voto mayoritario
```
**Características:**
- Corrección rudimentaria pero efectiva
- Overhead 3× (muy alto)
- Fácil de decodificar
- Especialmente útil en canal muy ruidoso

## 🏗️ Arquitectura del Sistema

```
proy_cd_2/
├── servidor.py              # Backend Flask REST
├── iniciar.py              # Launcher multi-ventana
├── core/
│   ├── __init__.py
│   └── motor_senales.py    # Motor DSP vectorizado
├── templates/
│   └── index.html          # UI responsiva
├── tests/
│   └── test_motor.py       # Suite de pruebas
├── requirements.txt        # Dependencias
└── README.md              # Este archivo
```

### Backend: `servidor.py`

**Framework**: Flask (Python web framework)

**Rutas API**:

```
GET  /api/<nodo>/params              Obtener parámetros actuales
POST /api/<nodo>/params              Configurar parámetros
GET  /api/<nodo>/vivo                Datos en vivo para visualización
POST /api/<nodo>/tx                  Transmitir datos
GET  /api/<nodo>/buzon               Recibir mensajes en cola
GET  /api/<nodo>/stats               Estadísticas actuales
GET  /api/<nodo>/stats_historico     Histórico de TX/RX
GET  /api/<nodo>/histograma          Distribución de amplitudes
GET  /api/<nodo>/espectrograma       PSD en tiempo real
GET  /api/<nodo>/ber_curva           Curva BER teórica vs SNR
GET  /api/opciones                   Modulaciones y codificaciones
```

### Motor DSP: `motor_senales.py`

**Clases principales:**

1. **ModASK, ModBPSK, ModQAM, ModOFDM**
   - Métodos: `modular()`, `demodular()`
   - Usan Numpy vectorizado

2. **Cod (Codificación)**
   - `hamming_enc()`, `hamming_dec()`
   - `enc()` wrapper universal
   - Manejo de padding automático

3. **Canal (AWGN)**
   - `ruido()`: Añade Gauss N(0,σ²)
   - `tx()`: Atenúa y añade ruido

4. **Motor (Orquestador)**
   - `transmitir()`: Modulación + codificación + ruido
   - `vivo()`: Generador de señal de demostración
   - `curva_ber()`: Cálculo de curva teórica

### Frontend: `templates/index.html`

**Tecnologías**:
- Vanilla JavaScript (sin framework)
- Canvas 2D para gráficos
- WebAudio API para grabación
- Modo oscuro/claro CSS

**Características**:
- Interfaz responsiva
- 4 pestañas principales
- Actualización 30 FPS
- Visualización suave con animaciones

## 🚀 Instalación y Uso

### Requisitos Previos
- Python 3.8 o superior
- pip
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Micrófono para prueba de audio (opcional)

### Paso 1: Clonar/Descargar
```bash
cd proy_cd_2
```

### Paso 2: Crear Entorno Virtual
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### Paso 3: Instalar Dependencias
```bash
pip install -r requirements.txt
```

### Paso 4: Ejecutar Servidor
```bash
python iniciar.py
```

Se abrirán automáticamente dos navegadores:
- **Nodo A (Emisor)**: http://localhost:5000/?nodo=A
- **Nodo B (Receptor)**: http://localhost:5000/?nodo=B

## 📖 Flujo de Trabajo Típico

### Escenario 1: Prueba de Modulación

```
1. Abre tab "Entorno en Vivo"
2. Ajusta SNR = 15 dB
3. Modulación = BPSK
4. Observa gráficos en tiempo real
5. Abre "Enviar" en Nodo A
6. Envía 5 mensajes de texto
7. Revisa "Estadísticas" 
8. Anota BER promedio
9. Repite con modulación QAM
10. Compara en "Curva BER vs SNR"
```

### Escenario 2: Análisis de Codificación

```
1. Nodo A: Envía 10 mensajes SIN codificación (SNR=10dB)
2. Observa BER alto
3. Cambia a Hamming(7,4)
4. Envía 10 mensajes iguales
5. Observa BER reducido (pero overhead mayor)
6. Compara en estadísticas
7. Prueba Repetición x3
8. Nota overhead vs mejora en BER
```

### Escenario 3: Transmisión de Medios

```
1. Nodo A → Tab "Enviar"
2. Cambia a "Imagen"
3. Carga PNG pequeño
4. Transmite
5. Nodo B → Observa en "Recibir"
6. Revisa espectro, constelación
7. Verifica integridad MD5
```

## 📐 Fórmulas y Teoría

### Bit Error Rate (BER)
$$\text{BER} = \frac{\text{# bits errados}}{\text{# bits totales}}$$

### Signal-to-Noise Ratio (SNR) en dB
$$\text{SNR(dB)} = 10 \log_{10}\left(\frac{P_s}{P_n}\right)$$

donde $P_s$ = potencia de señal, $P_n$ = potencia de ruido

### Tasa de Éxito
$$\text{Éxito(\%)} = (1 - \text{BER}) \times 100$$

### Overhead de Codificación
$$\text{Overhead} = \frac{\text{Bits Codificados}}{\text{Bits Originales}}$$

### BER Teórico BPSK (AWGN)
$$\text{BER}_{\text{BPSK}} = Q\left(\sqrt{\frac{2 \cdot E_b}{N_0}}\right)$$

donde Q(x) es la función Q de Marcum

### Capacidad de Shannon
$$C = B \log_2\left(1 + \frac{S}{N}\right) \text{ bits/s}$$

donde B = ancho de banda, S = potencia señal, N = potencia ruido

## 🎓 Casos de Uso Educativo

### Nivel 1: Conceptos Básicos
- Diferencia entre ASK, BPSK, QAM
- Efecto del SNR en comunicación
- Concepto de ruido AWGN

### Nivel 2: Ingeniería
- Diseño de codificadores FEC
- Trade-off ancho de banda vs potencia
- Análisis de espectro y eye diagram

### Nivel 3: Investigación
- Validación de nuevos algoritmos
- Comparación de modulaciones
- Optimización de parámetros

## ⚠️ Limitaciones Conocidas

| Limitación | Razón | Impacto |
|-----------|-------|---------|
| Ruido AWGN puro | Simplificación matemática | No modela fading multicamino |
| Sincronización perfecta | No se implementó compensación | Asume timing perfecto |
| Canal ideal | Sin dispersión temporal | No hay ISI realista |
| float32 en DSP | Optimización de velocidad | Posible pérdida de precisión en SNR << 0 |

## 🔧 Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Puerto 5000 en uso | Otra aplicación lo ocupa | `python servidor.py --puerto 8080` |
| No se abre navegador | Timeout en inicio | Abre manualmente http://localhost:5000 |
| Audio no se graba | Permisos de micrófono | Autoriza micrófono en navegador |
| FFT muy lento | N_FFT muy grande | Reduce en motor_senales.py (línea N_FFT=256) |
| Gráficos parpadeantes | FPS bajo | Cierra otras aplicaciones |

## 📦 Dependencias

```txt
Flask==2.3.3           # Web framework
numpy==1.24.3          # Cálculos numéricos
```

### Instalación Manual
```bash
pip install Flask numpy
```

## 🧪 Testing

```bash
pytest tests/test_motor.py -v
```

Cubre:
- Modulación/demodulación todos los tipos
- Codificación/decodificación FEC
- Cálculo de BER y ruido
- Análisis espectral FFT

## 📚 Referencias Académicas

1. **Proakis, J. & Salehi, M.** (2014)  
   *Fundamentals of Communication Systems*  
   ISBN: 978-0133456790

2. **Lyons, R. G.** (2010)  
   *Understanding Digital Signal Processing* (3rd ed.)  
   ISBN: 978-0137027453

3. **Oppenheim, A. V. & Willsky, A. S.** (1996)  
   *Signals and Systems* (2nd ed.)  
   ISBN: 978-0138147570

4. **Strang, G. & Nguyen, T.** (1996)  
   *Wavelets and Filter Banks*

## 📄 Licencia

Código educativo con propósito de enseñanza.  
Libre para modificar y distribuir con fines académicos.

## 👨‍💻 Desarrollo

**CommSim v3** — Sistema avanzado de comunicaciones digitales  
Desarrollado para educación y análisis de procesamiento de señales  

**Versión**: 3.0 (Mejorada con estadísticas detalladas)  
**Última actualización**: 2026

---

¿Necesitas ayuda? Revisa los gráficos en tiempo real, ajusta parámetros y observa cómo cambian las métricas instantáneamente.

ipconfig /all
```
Busca "IPv4 Address" en tu adaptador WiFi. Ejemplo: `192.168.1.102`

**Paso 3:** Desde otro dispositivo (mismo router):
- Ve a: **http://192.168.1.102:5000/?nodo=A**

### Escenario 3: Dos Celulares
- **Celular 1:** Instala Python + CommSim (o ejecuta en PC conectado al celular 1)
- **Celular 2:** Abre navegador y ve a la IP del servidor

---

## ⚙️ Configuración del Firewall (Windows)

Si otros dispositivos **no pueden conectarse**, autoriza el puerto 5000:

**Opción A: Línea de comandos (Admin)**
```powershell
netsh advfirewall firewall add rule name="CommSim" dir=in action=allow protocol=tcp localport=5000
```

**Opción B: GUI de Windows**
1. Panel de Control → Windows Defender Firewall → Permitir una aplicación
2. Click "Permitir otra aplicación"
3. Busca Python (`python.exe`)
4. Asegúrate de marcar ambas: "Privada" y "Pública"

---

## 📡 Verificar Conectividad

Antes de conectarse, verifica que:

✅ Ambos dispositivos están en la MISMA red WiFi
```powershell
ipconfig  # Verifica tu IP local
ping 192.168.X.X  # Desde otro dispositivo, verifica conectividad
```

✅ El servidor está corriendo
```
 * Running on http://0.0.0.0:5000
```

✅ Puerto 5000 está disponible
```powershell
netstat -ano | findstr :5000
```

---

## 📊 URLs Disponibles

- **Interfaz Gráfica:** `http://<IP>:5000/?nodo=A` o `?nodo=B`
- **API - Parámetros:** `GET /api/<nodo>/params`
- **API - Transmitir:** `POST /api/<nodo>/tx`
- **API - Buzón:** `GET /api/<nodo>/buzon`
- **API - Estadísticas:** `GET /api/<nodo>/stats`
- **API - Envivo:** `GET /api/<nodo>/vivo`

---

## 🔧 Características

| Característica | Detalles |
|---|---|
| **Modulaciones** | ASK, BPSK, QAM, OFDM |
| **Codificación** | Ninguna, Hamming(7,4), Repetición x3 |
| **Visualización** | Señales en tiempo real, Espectro, Eye Diagram, Constelación IQ |
| **Métricas** | BER, SNR, Éxito, Integridad (MD5), Overhead |
| **Tipos de datos** | Texto, Imagen, Audio grabado, Tono sinusoidal, Archivo binario |
| **Rendimiento** | 30 FPS optimizado, float32, FFT=256, buffers ≤1200 pts |

---

## 📋 Patrones de Diseño

| Patrón | Implementación |
|---|---|
| **Factory** | `Factory.crear(tipo_modulacion)` |
| **Strategy** | Diferentes moduladores (ASK, BPSK, QAM, OFDM) |
| **Observer** | Sistema de notificaciones del Motor |
| **Singleton** | Clase Canal (una única instancia) |
| **Adapter** | servidor.py convierte tipos → bytes |
| **MVC** | Motor (lógica) / index.html (vista) / servidor.py (controlador) |

---

## 🚀 Solución de Problemas

### "Otros dispositivos no pueden conectarse"
- Verifica firewall Windows (ver arriba)
- Verifica que usan la IP correcta: `ipconfig` en el servidor
- Verifica que están en la misma red WiFi
- Reinicia el router WiFi

### "Gráficos no se cargan"
- F12 → Console → busca errores JavaScript
- Recarga la página (Ctrl+R)
- Limpia cache del navegador (Ctrl+Shift+Delete)

### "Errores de conexión a /api/..."
- Verifica que el servidor está corriendo
- Verifica los logs en la terminal
- Prueba: `curl http://<IP>:5000/api/A/vivo`

---

## 📝 Notas

- **Datos móviles compartidos:** El servidor puede usar datos móviles, pero la latencia/velocidad depende de la señal
- **IP dinámica:** La IP puede cambiar si reinician el router/hotspot
- **Puertos alternativos:** Edita `iniciar.py` para cambiar el puerto (ej: 8080)
