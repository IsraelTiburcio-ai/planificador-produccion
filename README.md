# 🏭 Planificador de Producción — Características del proceso de producción

Microjuego educativo **mobile-first** (45–90 segundos por partida) del **Gimnasio 2 · Optimización I**.

**Objetivo académico (aclaración de la profesora):**
> «Es para las características de planeación de producción. Es para que llenen las características.»

El alumno recorre una línea de producción de **5 estaciones** —una por cada característica del
cuadro manuscrito— y cierra con un **reto final de memoria**. Al terminar, debe poder llenar el
cuadro cuyo centro es **“Planteamiento de Proceso de Producción”**.

- **URL de producción:** https://israeltiburcio-ai.github.io/planificador-produccion/
- **Tema:** Características del planteamiento de proceso de producción (P.L.)
- **Duración por partida:** ≈ 45–90 s (5 estaciones + reto final)

## 📚 Fuente académica

`GYM 2_251005_202412 (1).pdf` — *Gimnasio 2. Modelos de Programación Lineal*.

- **Página 37 (mapa manuscrito):** centro “Planteamiento de Proceso de Producción”, rodeado por:
  1. **Transformación de productos**
  2. **Se manejan dos restricciones** *(materia prima y producto)*
  3. **Función objetivo maximizada**
  4. **La restricción establece el proceso de transformación**
  5. **Caso particular de planeación de producción**
- **Mismo ejemplo impreso (prob. 41, ingeniero Dulce):** guarapo (4000 t semanales) → azúcar
  morena (0.3 t/t) y melaza (0.1 t/t) → azúcar blanca (1 t morena → 0.8 t) → azúcar glas (0.95);
  utilidades $150/$200/$230/$35 por tonelada; entrega mínima de 25 t semanales por clase.
- **Sailco (prob. 42)** se conserva únicamente como el *caso particular* de planeación de producción.

## 🎮 Mecánica

- **Línea de producción con 5 estaciones:** `MATERIA PRIMA → [1][2][3][4][5] → PRODUCTO TERMINADO`.
  Cada estación corresponde a una característica; al acertar, la estación se activa, la caja de la
  banda se transforma y el almacén suma cajas.
- **Banco de 20 retos (4 por característica)**; cada partida muestrea **una pregunta por
  característica** en el orden de la línea, así que siempre se cubren las 5 respuestas del cuadro
  pero las preguntas varían entre partidas.
- **Reto final de memoria (≤ 20 s):** aparecen 7–8 tarjetas; el alumno selecciona las **5
  características** del cuadro entre distractores plausibles de P.L.
- Puntuación: 100 pts por estación + rapidez (≤8 s: +30, ≤15 s: +15) + racha (hasta +50);
  el reto final vale 200. Sin vidas: el fallo muestra la corrección y el proceso continúa.
- La pantalla de resultado muestra **el cuadro completo listo para copiar** al de la profesora.

## 🛠️ Stack

HTML + CSS + JavaScript vanilla (sin frameworks ni dependencias). Iconografía y escena de fábrica
propias en SVG/CSS. Efectos de sonido sintetizados con Web Audio API (tap, correcto, incorrecto,
avance de estación, fin) con botón de silencio persistente.

## 🚀 Cómo correrlo

```
python3 -m http.server 8000
# → http://localhost:8000
```

o abrir `index.html` directamente. Sin paso de build. Despliegue automático a **GitHub Pages**
vía **GitHub Actions** (`.github/workflows/pages.yml`) en cada push a `main`.

## 📁 Estructura

```
index.html    → pantallas (inicio / juego / resultado) + sprite SVG
styles.css    → diseño mobile-first 390×844, tema fábrica nocturna
script.js     → lógica: estaciones, reto final, racha, tiempo, audio, teclado
data.js       → banco académico de 20 retos + reto final (separado de la lógica)
qa/           → QA lógico (Node), batería funcional (Chrome) y QA académico (Python)
.github/workflows/pages.yml → autodeploy a GitHub Pages
```

## ♿ Accesibilidad

Contraste AA, botones ≥ 44 px, `:focus-visible`, `aria-label` / `aria-live`,
atajos de teclado (1·2·3 responder, Enter continuar) y soporte de `prefers-reduced-motion`.
El acierto/error no depende solo del color (iconos + texto + estados con borde).

## ✅ QA

- `qa/qa-logic.js` (Node): validez del banco, 4 retos por característica, fidelidad de redacción
  al mapa, barajado uniforme, 5 partidas simuladas con duración estimada.
- `qa/qa.html` (Chrome headless): batería funcional con iframe exacto de 390×844 y 1440×900:
  overflow, táctiles, reto final, replay, mute.
- `qa/qa-academico.py`: verifica que la redacción del juego coincide con las 5 cajas manuscritas
  de la pág. 37 y que la mecánica anterior (balances, costos, min Z) no domina la partida.
