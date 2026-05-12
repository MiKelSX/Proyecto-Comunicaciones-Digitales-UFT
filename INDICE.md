# CommSim v3 — Índice de Documentación

## 📚 Documentos Disponibles

### 1️⃣ **README.md** (INICIO RECOMENDADO)
**Audiencia**: Todos  
**Tiempo de lectura**: 15-20 minutos  
**Contenido**:
- Características principales del sistema
- Modulaciones: ASK, BPSK, QAM, OFDM (explícadas)
- Codificadores: Hamming, Repetición
- Instalación paso a paso
- Flujo de trabajo típico
- Fórmulas matemáticas
- Troubleshooting

**👉 COMIENZA AQUÍ si es tu primera vez**

---

### 2️⃣ **GUIA_RAPIDA.md** (REFERENCIA RÁPIDA)
**Audiencia**: Usuarios actuales  
**Tiempo de lectura**: 5-10 minutos  
**Contenido**:
- Inicio en 3 minutos
- Layout de interfaz
- Explicación de cada tab
- Parámetros recomendados
- Lectura rápida de métricas
- Atajos de teclado
- Troubleshooting instantáneo

**👉 USA ESTO mientras trabajas con la aplicación**

---

### 3️⃣ **EJEMPLOS.md** (EDUCATIVO)
**Audiencia**: Estudiantes/Investigadores  
**Tiempo de lectura**: 2-3 horas (incluyendo implementación)  
**Contenido**:
- 10 proyectos educativos completos
- Paso a paso detallado
- Resultados esperados
- Análisis e interpretación
- Temas cubiertos:
  - Modulaciones
  - Codificación
  - Multimedia (imagen, audio)
  - Análisis espectral
  - Comparación teórico vs medido

**👉 EJECUTA ESTOS para aprender haciendo**

---

### 4️⃣ **ESPECIFICACIONES.md** (TÉCNICO)
**Audiencia**: Desarrolladores/Investigadores  
**Tiempo de lectura**: 30-45 minutos  
**Contenido**:
- Arquitectura de capas
- Algoritmos DSP (con código)
- Protocolos REST (con ejemplos)
- Formato de datos interno
- Métricas y cálculos
- Rendimiento y benchmarks
- Fórmulas matemáticas

**👉 CONSULTA ESTO para modificar/extender código**

---

### 5️⃣ **CAMBIOS.md** (NOVEDADES)
**Audiencia**: Usuarios previos (v2.0→v3.0)  
**Tiempo de lectura**: 10 minutos  
**Contenido**:
- Resumen de mejoras
- APIs nuevas
- Documentación agregada
- Estadísticas de cambio
- Futuras mejoras sugeridas

**👉 LEE ESTO si usabas CommSim v2.0**

---

## 🎯 Mapa de Navegación

```
┌─ INICIO ─────────────────────────────────┐
│ ¿Primera vez?                             │
│ SÍ → README.md → GUIA_RAPIDA.md          │
│ NO → GUIA_RAPIDA.md                       │
└──────────────────────────────────────────┘
              ↓
┌─ USO ────────────────────────────────────┐
│ ¿Quieres...?                              │
│                                            │
│ • Entender conceptos → EJEMPLOS.md        │
│ • Implementar código → ESPECIFICACIONES   │
│ • Referencia rápida → GUIA_RAPIDA        │
│ • Cambios v2→v3 → CAMBIOS.md             │
└──────────────────────────────────────────┘
              ↓
┌─ PROFUNDO ────────────────────────────────┐
│ ¿Necesitas...?                             │
│                                            │
│ • Fórmulas matemáticas → README/ESPEC.   │
│ • Código fuente → ESPECIFICACIONES        │
│ • APIs → ESPECIFICACIONES                 │
│ • Ejemplos prácticos → EJEMPLOS.md        │
└──────────────────────────────────────────┘
```

---

## 📖 Guía por Rol

### 👨‍🎓 Estudiante de Ingeniería Eléctrica
1. **Día 1**: README.md (30 min)
2. **Día 2**: GUIA_RAPIDA.md (10 min)
3. **Día 3**: EJEMPLOS.md - Ejemplo 1-3 (1 hora)
4. **Día 4**: EJEMPLOS.md - Ejemplo 4-7 (1 hora)
5. **Día 5**: EJEMPLOS.md - Ejemplo 8-10 (1 hora)
6. **Día 6+**: ESPECIFICACIONES.md (experimental)

**Tiempo total**: 5-6 horas

---

### 👨‍💻 Desarrollador
1. **Inicial**: README.md (20 min - secciones arquitectura)
2. **Funcional**: ESPECIFICACIONES.md (45 min - APIs)
3. **Implementación**: CAMBIOS.md (10 min - endpoints nuevos)
4. **Profundo**: ESPECIFICACIONES.md (1 hora - algoritmos)

**Tiempo total**: 2-2.5 horas

---

### 👨‍🔬 Investigador
1. **Contexto**: README.md (30 min)
2. **Teórico**: ESPECIFICACIONES.md (1 hora)
3. **Experimental**: EJEMPLOS.md (2-3 horas)
4. **Referencia**: GUIA_RAPIDA.md (ongoing)

**Tiempo total**: 4-5 horas (iterativo)

---

### 👨‍🏫 Profesor/Instructor
1. **Preparación**: README.md + ESPECIFICACIONES.md (1.5 horas)
2. **Materiales**: EJEMPLOS.md (preparar 3-5)
3. **Referencias**: GUIA_RAPIDA.md (para estudiantes)
4. **Evaluación**: Crear proyectos basados en EJEMPLOS.md

**Tiempo total**: 3-4 horas inicial + iterativo

---

## 🔍 Búsqueda por Tema

### Modulaciones
```
ASK     → README (Sección Modulaciones)
BPSK    → README + EJEMPLOS (1-5)
QAM     → README + EJEMPLOS (1-5)
OFDM    → README + EJEMPLOS (Avanzado)
QPSK    → README (mención en futuro)
```

### Codificación
```
Hamming(7,4)   → README (Códigos Correctores)
Repetición x3  → README (Códigos Correctores)
Ninguna        → README (Base)
FEC Avanzado   → ESPECIFICACIONES (Algoritmos)
```

### Análisis
```
BER             → GUIA_RAPIDA + ESPECIFICACIONES
SNR             → GUIA_RAPIDA + README
Espectro        → EJEMPLOS (4-5)
Eye Diagram     → EJEMPLOS (6)
Constelación    → README + GUIA_RAPIDA
```

### APIs
```
REST endpoints  → ESPECIFICACIONES
JSON format     → ESPECIFICACIONES
Python código   → ESPECIFICACIONES
Ejemplos curl   → ESPECIFICACIONES
```

---

## 📊 Comparación de Documentos

| Doc | Técnico | Práctico | Código | Imágenes | Fórmulas |
|-----|---------|----------|--------|----------|----------|
| README | ★★★ | ★★★★ | ★★ | ★★★ | ★★★★ |
| GUIA_RAPIDA | ★★ | ★★★★★ | ★ | ★★ | ★ |
| EJEMPLOS | ★★★ | ★★★★★ | ★★★★ | ★★ | ★★ |
| ESPECIFICACIONES | ★★★★★ | ★★ | ★★★★★ | ★★ | ★★★★ |
| CAMBIOS | ★★★ | ★★ | ★★ | ★ | ★ |

---

## ✅ Checklist de Lectura

### Nivel 1 (Inicial) — 30 minutos
- [ ] README.md hasta "Características Principales"
- [ ] GUIA_RAPIDA.md completo
- [ ] Instalación de CommSim v3

### Nivel 2 (Intermedio) — 2 horas
- [ ] README.md completo
- [ ] EJEMPLOS.md ejemplo 1
- [ ] EJEMPLOS.md ejemplo 2
- [ ] Ejecutar ambos en CommSim

### Nivel 3 (Avanzado) — 5-6 horas
- [ ] ESPECIFICACIONES.md completo
- [ ] EJEMPLOS.md ejemplos 3-10
- [ ] Experimentar con variaciones
- [ ] CAMBIOS.md para entiender arquitectura

### Nivel 4 (Experto) — 10+ horas
- [ ] Estudiar código fuente motor_senales.py
- [ ] Estudiar código fuente servidor.py
- [ ] Implementar modificación propia
- [ ] Documentar resultado

---

## 🚀 Inicio Rápido

### Si tienes 5 minutos
```
1. README.md → primeras 2 secciones
2. Ejecuta: python iniciar.py
```

### Si tienes 20 minutos
```
1. README.md → Características + Instalación
2. GUIA_RAPIDA.md → completo
3. Ejecuta y explora
```

### Si tienes 1-2 horas
```
1. README.md → completo
2. GUIA_RAPIDA.md → referencia
3. EJEMPLOS.md → ejemplo 1-2
4. Ejecuta y experimenta
```

### Si tienes 4+ horas
```
1. README.md → completo
2. ESPECIFICACIONES.md → secciones clave
3. EJEMPLOS.md → 5-7 ejemplos
4. Ejecuta todos los ejemplos
5. Experimenta con variaciones
```

---

## 💡 Preguntas Frecuentes por Documento

### "¿Por dónde empiezo?"
→ **README.md** (sección "Características Principales")

### "¿Cómo transmito datos?"
→ **GUIA_RAPIDA.md** (sección "TAB 2: Enviar")

### "¿Cómo comparo BPSK con QAM?"
→ **EJEMPLOS.md** (Ejemplo 1: Comparación Modulaciones)

### "¿Cuáles son las APIs disponibles?"
→ **ESPECIFICACIONES.md** (sección "Protocolos")

### "¿Qué cambió desde v2.0?"
→ **CAMBIOS.md** (Registro de Mejoras)

### "¿Cuál es el overhead de Hamming?"
→ **README.md** (sección "Hamming(7,4)") o **ESPECIFICACIONES.md**

### "¿Qué significa BER = 0.01?"
→ **GUIA_RAPIDA.md** (sección "Lectura de Métricas")

### "¿Cómo agrego una modulación nueva?"
→ **ESPECIFICACIONES.md** (sección "Algoritmos DSP")

---

## 📱 Acceso Offline

Todos los documentos están en formato **Markdown (.md)**

```bash
# Ver en terminal
cat README.md | less

# Convertir a PDF
pandoc README.md -o README.pdf

# Convertir a HTML
pandoc README.md -o README.html
```

---

## 🌐 Versiones Web

Todos los .md se pueden ver en:
- GitHub (si subes repo)
- GitLab
- Bitbucket
- Notion
- Obsidian

---

## 📈 Líneas de Documentación

```
README.md            800 líneas
ESPECIFICACIONES.md  500 líneas
EJEMPLOS.md          700 líneas
GUIA_RAPIDA.md       400 líneas
CAMBIOS.md           300 líneas
Este índice          300 líneas
─────────────────────────────
TOTAL               3000 líneas de documentación
```

---

## 🎓 Valor Educativo

```
Concepto         Doc       Profundidad
────────────────────────────────────
Modulaciones     README    ★★★★
Codificación     README    ★★★
APIs             ESPEC.    ★★★★★
Ejemplos         EJEMPLOS  ★★★★★
Referencia       RAPIDA    ★★★
Teoría           ESPEC.    ★★★★
Algoritmos       ESPEC.    ★★★★★
```

---

## ✨ Resumen Final

**CommSim v3 incluye**:
- ✅ Código Python funcional
- ✅ Interfaz web interactiva
- ✅ 5 documentos completos (3000+ líneas)
- ✅ 10 ejemplos educativos
- ✅ API REST documentada
- ✅ Troubleshooting
- ✅ Referencia matemática

**Está listo para**:
- 🎓 Educación universitaria
- 🔬 Investigación
- 🏭 Prototipado
- 📚 Aprendizaje autodidacta

---

## 🔗 Relaciones entre Documentos

```
README.md ──────────────┐
   ↓                    ├─→ GUIA_RAPIDA.md (referencia)
   ├─→ EJEMPLOS.md ─────┤
   │   (implementa)      └─→ ESPECIFICACIONES.md (profundo)
   │                         ↑
   └─→ ESPECIFICACIONES.md───┘
       (teoría)

CAMBIOS.md ← Actualización (v2→v3)
```

---

**Última actualización**: 2026  
**Versión**: 3.0  
**Total Documentación**: 3000+ líneas
