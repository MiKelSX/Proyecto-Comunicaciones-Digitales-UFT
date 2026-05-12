# CommSim v3 — Ejemplos Prácticos

## Ejemplo 1: Comparación Básica de Modulaciones

**Objetivo**: Entender cómo afecta la modulación al BER bajo diferentes SNR

### Procedimiento

1. **Abre la aplicación**
   ```bash
   python iniciar.py
   ```

2. **Nodo A**: Ve a tab "Entorno en Vivo"
   - SNR = 10 dB
   - Modulación = BPSK
   - Observa los gráficos

3. **Nodo A**: Tab "Enviar"
   - Tipo: Texto
   - Texto: "CommSim v3 Test BPSK"
   - Presiona "Transmitir" 5 veces
   - Anota el BER promedio

4. **Cambia a QPSK (QAM 4-ary)**
   - Tab "Entorno en Vivo"
   - Modulación = QAM
   - Bits/símbolo = 2
   - Repite paso 3

5. **Cambia a 16-QAM**
   - Bits/símbolo = 4
   - Repite paso 3

6. **Compara en Estadísticas**
   - Tab "Estadísticas"
   - Observa "Curva BER vs SNR"
   - Nota cómo BPSK es más robusto a bajo SNR

**Resultado Esperado**:
```
BPSK (10dB):    BER ≈ 0.001
QPSK (10dB):    BER ≈ 0.002
16-QAM (10dB):  BER ≈ 0.005
```

---

## Ejemplo 2: Impacto de Codificación FEC

**Objetivo**: Demostrar cómo la codificación reduce errores pero aumenta overhead

### Procedimiento

1. **Escenario Base: SNR muy bajo**
   - Tab "Entorno en Vivo"
   - SNR = 5 dB
   - Modulación = BPSK
   - Codificación = Ninguna

2. **Nodo A**: Envía 10 mensajes cortos
   ```
   "Prueba 1" (8 veces)
   "Prueba 2"
   "Prueba 3"
   ```

3. **Observa resultados**
   - BER muy alto (40-50%)
   - Muchos checksums incorrectos
   - Anota datos en papel

4. **Activa Codificación Hamming(7,4)**
   - Tab "Entorno en Vivo"
   - Codificación = Hamming(7,4)
   - Envía los mismos 10 mensajes

5. **Compara**
   - BER mucho menor (5-10%)
   - Overhead = 1.75× (7 bits por cada 4)
   - ¿Vale la pena?

6. **Prueba Repetición x3**
   - Codificación = Repetición x3
   - Envía 10 mensajes
   - BER casi 0%
   - Overhead = 3× (muy alto)

**Conclusión**:
- Sin codificación: Alta BER, bajo overhead
- Hamming: Balance óptimo para SNR bajo
- Repetición: Máxima confiabilidad, máximo overhead

---

## Ejemplo 3: Transmisión de Imagen

**Objetivo**: Experimentar con datos multimedia

### Procedimiento

1. **Prepara una imagen pequeña**
   - PNG o JPG pequeño (50-100 KB)
   - Ej: Screenshot de una ventana

2. **Nodo A**: Tab "Enviar"
   - Tipo: Imagen
   - Carga tu imagen (drag & drop)
   - Preview aparecerá

3. **Configura parámetros**
   - Tab "Entorno en Vivo"
   - SNR = 25 dB (para mayor confiabilidad)
   - Modulación = QAM (mayor capacidad)
   - Codificación = Hamming(7,4)

4. **Transmite**
   - Tab "Enviar" → Botón "Transmitir"
   - Observa resultado de TX
   - Gráficos muestran espectro

5. **Nodo B**: Tab "Recibir"
   - Observa mensaje recibido
   - Si checksum ✓, datos íntegros
   - Haz clic en imagen para descargar

6. **Análisis**
   - Tab "Estadísticas"
   - Observa Espectrograma 2D
   - Nota concentración de potencia en portadora

---

## Ejemplo 4: Comparación Teórico vs Medido

**Objetivo**: Validar que la simulación coincide con teoría

### Procedimiento

1. **Calcula BER teórico BPSK**
   ```python
   # Para SNR = 10 dB (lineal = 10)
   SNR_lin = 10**(10/10)  # = 10
   Eb_N0 = SNR_lin
   
   # Q(√(2×10)) ≈ Q(4.47) ≈ 0.0000038
   # BER teórico ≈ 0.0038
   ```

2. **Nodo A**: Transmite muchos mensajes
   - SNR = 10 dB
   - Modulación = BPSK
   - Codificación = Ninguna
   - Envía 50 mensajes pequeños

3. **Nodo A**: Tab "Estadísticas"
   - Observa "BER Actual" y "Historial BER"
   - Promedia los últimos 50 valores
   - Compara con teórico (0.0038)

4. **Ajusta SNR**
   - Prueba SNR = 15 dB, 20 dB, 25 dB
   - Verifica que BER disminuye
   - Debería seguir curva Q(√(2×SNR))

**Resultado Esperado**:
```
SNR (dB) | BER Teórico | BER Medido | Diferencia
---------|-------------|------------|----------
10       | 0.0038      | 0.0040     | +0.0002
15       | 0.00000033  | 0.00001    | pequeña
20       | ~0          | 0.0        | excelente
```

---

## Ejemplo 5: Análisis de Espectro

**Objetivo**: Entender la ocupación espectral

### Procedimiento

1. **Configura parámetros**
   - Tab "Entorno en Vivo"
   - fc = 1000 Hz (portadora clara)
   - sr = 40 símb/s

2. **Observa gráfico "Espectro de Potencia"**
   - BPSK: pico principal en 1000 Hz
   - Lóbulos secundarios pequeños

3. **Cambia modulación a QAM**
   - Bits/símbolo = 4
   - Espectro más ancho, mayor potencia

4. **Calcula BW ocupado**
   - BPSK: BW = 1.2 × 40 × 1 = 48 Hz
   - QAM-16: BW = 1.2 × 40 × 4 = 192 Hz
   - Observa cómo se ensancha el espectro

5. **Verifica en gráfico**
   - Espectro QAM debería ocupar 1000±96 Hz
   - Compara visualmente

---

## Ejemplo 6: Eye Diagram y ISI

**Objetivo**: Detectar interferencia entre símbolos (ISI)

### Procedimiento

1. **Configuración inicial**
   - Tab "Entorno en Vivo"
   - Modulación = BPSK
   - SNR = 25 dB
   - fc = 400 Hz
   - sr = 40 símb/s

2. **Observa Eye Diagram**
   - Gráfico superior derecho
   - Debería mostrar "ojo" abierto y claro
   - Dos trazas superpuestas (período doble)

3. **Reduce sr lentamente**
   - sr = 30 → ojo más abierto
   - sr = 10 → ojo muy abierto
   - rs = 100 → ojo empieza a cerrarse
   - sr = 200 → ojo casi cerrado (ISI)

4. **Aumenta SNR a 35 dB**
   - Eye aún más abierto, menos ruido

5. **Conclusión**
   - Eye diagram = indicador visual de calidad
   - Ojo abierto = comunicación clara
   - Ojo cerrado = ISI, necesita ecualización

---

## Ejemplo 7: Audición de Comunicación

**Objetivo**: Generar tonos y escucharlos

### Procedimiento

1. **Nodo A**: Tab "Enviar"
   - Tipo: Audio
   - Botón "🎵 Tono"
   - Frecuencia = 440 Hz (La4)
   - Genera tono 1 segundo

2. **Configura audio b**
   - fc = 440 Hz (para que no haya modulación)
   - Escucha en "preview" antes de enviar

3. **Transmite**
   - Botón "Transmitir"

4. **Nodo B**: Recibe
   - Audio distorsionado por ruido simulado
   - Si SNR bajo, más ruido

5. **Prueba con frecuencias**
   - 220 Hz: Más grave
   - 880 Hz: Más agudo
   - Repite con diferentes SNR

---

## Ejemplo 8: Grabación desde Micrófono

**Objetivo**: Usar entrada de audio real

### Procedimiento

1. **Nodo A**: Tab "Enviar"
   - Tipo: Audio
   - Botón "🎙 Grabar"
   - Autoriza micrófono si solicita
   - Habla: "CommSim prueba de audio"
   - Presiona "⏹ Detener"

2. **Preview**
   - Escucha la grabación
   - Ajusta si es necesario

3. **Transmite**
   - Botón "Transmitir"

4. **Nodo B**: Recibe
   - Descarga archivo .webm
   - Escucha resultado
   - Compara con original en Nodo A

5. **Análisis**
   - Observa espectro del audio
   - Múltiples frecuencias (armónicos)
   - SNR bajo = mucho ruido digital

---

## Ejemplo 9: Archivo Binario

**Objetivo**: Transmitir código o documento

### Procedimiento

1. **Prepara archivo**
   - Crea archivo `test.txt` con contenido
   - O descarga un PDF pequeño

2. **Nodo A**: Tab "Enviar"
   - Tipo: Archivo
   - Carga archivo (max 1 MB)
   - Muestra info: nombre, tamaño

3. **Transmite**
   - SNR = 20 dB
   - Presiona "Transmitir"

4. **Nodo B**: Recibe
   - Mensaje en bandeja
   - Descarga desde "Recibir"
   - Verifica MD5 checksum
   - Si ✓, archivo idéntico

5. **Prueba con SNR bajo**
   - Nodo A: SNR = 5 dB
   - Transmite el mismo archivo
   - Observa BER más alto
   - Pero si ck_ok=true, datos correctos

---

## Ejemplo 10: Simulación de Ciclo Completo

**Objetivo**: Workflow profesional

### Procedimiento

```
HORA  ACCIÓN
┌────────────────────────────────────────────┐
│ 1. Iniciar ambos nodos                     │
├────────────────────────────────────────────┤
│ 2. Configurar SNR = 20 dB                  │
│    Modulación = QAM (4-ary)                │
│    Codificación = Hamming                  │
├────────────────────────────────────────────┤
│ 3. Transmitir Test Mensaje 1               │
│    Observar: BER, Éxito, Overhead          │
├────────────────────────────────────────────┤
│ 4. Transmitir Test Mensaje 2               │
│    Observar: ¿Mejora o empeora?            │
├────────────────────────────────────────────┤
│ 5. Transmitir Test Mensaje 3               │
│    Revisar Constelación IQ                 │
│    ¿Puntos cerca del ideal?                │
├────────────────────────────────────────────┤
│ 6. Transmitir Imagen pequeña               │
│    Comprobar integridad MD5                │
│    Descargar en Nodo B                     │
├────────────────────────────────────────────┤
│ 7. Tab Estadísticas                        │
│    Revisar curva BER vs SNR                │
│    Historial BER (50 valores)              │
│    Espectrograma 2D                        │
│    Histograma de Amplitud                  │
├────────────────────────────────────────────┤
│ 8. Disminuir SNR a 15 dB                   │
│    Repetir pasos 3-5                       │
│    Comparar resultados                     │
├────────────────────────────────────────────┤
│ 9. Activar Repetición x3                   │
│    SNR = 10 dB (muy bajo)                  │
│    Transmitir 5 mensajes                   │
│    Observar BER → 0 a pesar de SNR         │
├────────────────────────────────────────────┤
│ 10. Conclusiones                           │
│     - Impacto modulación: ✓ validado       │
│     - Impacto codificación: ✓ validado     │
│     - Trade-off bw vs confiabilidad: ✓    │
└────────────────────────────────────────────┘
```

**Tiempo estimado**: 30-45 minutos

---

## Troubleshooting en Ejemplos

| Problema | Causa | Solución |
|----------|-------|----------|
| BER = 0 incluso a SNR 5dB | SNR muy limitado en rango | Reduce SNR más en interfaz |
| Gráficos no se actualizan | Panel no visible | Cambia tab y vuelve |
| Audio no suena | Permisos micrófono | Refresca navegador, autoriza |
| Mensaje no llega a B | Queue llena | Reinicia B |
| Números no cambian en Stats | Cache navegador | Ctrl+Shift+R (hard refresh) |

---

## Proyectos Avanzados

### Proyecto 1: Ecualizador Adaptativo
```python
# Modificar motor_senales.py
# Agregar decodificador MLSE (Viterbi)
# Compensar ISI automáticamente
```

### Proyecto 2: Intercalador de Bits
```python
# Función: perm = random_interleaver(N)
# Mezclar bits antes de modular
# Desmezclar en recepción
# Mejora corrección FEC contra ráfagas de error
```

### Proyecto 3: Sincronización Adaptativa
```python
# Offset de muestreo aleatorio (±5%)
# Detectar automáticamente
# Compensar
```

### Proyecto 4: Fading Multicamino
```python
# Modelo Rayleigh fading
# Múltiples replicas de señal
# OFDM resuelve bien este problema
```

---

## Referencias de Validación

### Parámetros Reales (Estándares)

**WiFi (802.11b)**
- Modulación: DSSS + DBPSK/DQPSK
- SNR mínimo: 4-10 dB
- Tasa: 11 Mbps

**4G LTE**
- Modulación: QPSK, 16-QAM, 64-QAM
- Codificación: Turbo codes
- SNR: 0-20 dB típico

**Comunicación Satelital**
- Modulación: QPSK
- Codificación: Convolucional
- SNR: -3 dB (muy bajo)

---

**Fin de ejemplos**
