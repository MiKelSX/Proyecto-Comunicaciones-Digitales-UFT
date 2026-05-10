# CommSim v3 — Simulador de Comunicaciones Digitales

## Inicio rápido (Modo Local)
```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
pytest tests/ -v
python iniciar.py
```

Acceso automático:
- **Nodo A (Emisor):**   http://localhost:5000/?nodo=A
- **Nodo B (Receptor):** http://localhost:5000/?nodo=B

---

## 🌐 Uso en Red WiFi (Multi-dispositivo)

### Escenario 1: Compartir Internet desde Celular
Tu celular crea un hotspot WiFi, y el PC/otros dispositivos se conectan a él.

**Paso 1:** En el PC que ejecuta el servidor
```bash
.venv\Scripts\python iniciar.py
```

El servidor mostrará algo como:
```
Running on http://127.0.0.1:5000
Running on http://192.168.43.X:5000
```

**Paso 2:** Anota la IP local (ej: `192.168.43.123`)

**Paso 3:** Desde otro dispositivo conectado a la MISMA red WiFi
- Abre el navegador y ve a: **http://192.168.43.123:5000/?nodo=A**
- O: **http://192.168.43.123:5000/?nodo=B**

### Escenario 2: Red WiFi Normal (Router)
Si usas un router normal:

**Paso 1:** Inicia el servidor en el PC
```bash
.venv\Scripts\python iniciar.py
```

**Paso 2:** Busca tu IP local (ejecuta en terminal):
```powershell
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
