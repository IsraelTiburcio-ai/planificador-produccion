# 🏭 Planificador de Producción — Equilibra la fábrica

Microjuego educativo **mobile-first** (1–2 minutos por partida) para reforzar el tema
**Planteamientos de Planeación de Producción** del **Gimnasio 2 · Optimización I**.

El alumno administra una fábrica (Sailco / Manufacturera Acme) y, en lugar de resolver
el modelo con Simplex, aprende a **PLANTEARLO**: variables de decisión, ecuaciones de
balance de inventario, restricciones de capacidad, costos y función objetivo.

- **URL de producción:** https://israeltiburcio-ai.github.io/planificador-produccion/
- **Tema:** Planteamientos de planeación de producción (P.L.)
- **Duración por partida:** ≈ 60–100 segundos (8 retos)

## 📚 Fuente académica

Archivo del curso: `GYM 2_251005_202412 (1).pdf` — *Gimnasio 2. Modelos de Programación Lineal*.

- **Páginas 37–38 (problemas 42 y 43):**
  - **Sailco (42):** producción de botes de vela por trimestre. Demanda 40 / 60 / 75 / 25,
    inventario inicial 10, capacidad regular **xⱼ ≤ 40** a **$400**/bote, tiempo extra **yⱼ** a
    **$450**/bote, almacenamiento **$20**/bote al final del trimestre. Modelo de clase:
    `min Z = 400(x₁+x₂+x₃+x₄) + 450(y₁+y₂+y₃+y₄) + 20(r₁+r₂+r₃)`, con balances
    `x₁+y₁+10 = 40+r₁`, `r₁+x₂+y₂ = 60+r₂`, `r₂+x₃+y₃ = 75+r₃`, `r₃+x₄+y₄ = 25`.
  - **Manufacturera Acme (Bayas Extra, 43):** ventanas por mes. Demandas
    100 / 250 / 190 / 140 / 220 / 110, costos de producción $50/$45/$55/$48/$52/$50,
    almacenamiento **$8**/ventana·mes. Balances: `x₁ = 100+r₁`, `x₂+r₁ = 250+r₂`, …
- **Estructura central que enseña el juego:**
  `inventario anterior + producción = demanda + inventario final`

## 🎮 Mecánica

- **8 retos por partida** muestreados de un **banco de 23 retos** (varían entre partidas).
- Progresión de dificultad:
  - Rondas 1–2 · conceptos (variables, objetivo, costos)
  - Rondas 3–5 · restricciones y balances (capacidad, ecuaciones de balance)
  - Rondas 6–7 · interpretación matemática (leer el modelo de clase)
  - Ronda final · mini caso integrador (elegir el planteamiento completo correcto)
- Tipos de reto: identificar variables · balance de inventario · capacidad ·
  función objetivo · inventario entre periodos · interpretación · detectar el
  planteamiento incorrecto · caso integrador.
- Puntuación: 100 pts por acierto + bonus de rapidez (≤10 s: +30, ≤18 s: +15)
  + bonus de racha (hasta +50). Sin vidas: si fallas, se muestra la corrección y sigues.
- Cada acierto apila una caja en el almacén de la escena.

## 🛠️ Stack

HTML + CSS + JavaScript vanilla (sin frameworks ni dependencias). Iconografía y
escena de fábrica propias en SVG/CSS. Audio de efectos sintetizado con Web Audio API
(con botón de silencio persistente).

## 🚀 Cómo correrlo

Opción 1 — abrir directo:

```
open index.html
```

Opción 2 — servidor local:

```
python3 -m http.server 8000
# → http://localhost:8000
```

No hay paso de build. Despliegue automático a **GitHub Pages** vía **GitHub Actions**
(`.github/workflows/pages.yml`) en cada push a `main`.

## 📁 Estructura

```
index.html    → pantallas (inicio / juego / resultado) + sprite SVG
styles.css    → diseño mobile-first 390×844, tema fábrica nocturna
script.js     → lógica: muestreo de retos, racha, tiempo, audio, teclado
data.js       → banco académico de 23 retos (separado de la lógica)
.github/workflows/pages.yml → autodeploy a GitHub Pages
```

## ♿ Accesibilidad

Contraste AA, botones ≥ 44 px, `:focus-visible`, `aria-label` / `aria-live`,
atajos de teclado (1·2·3 para responder, Enter para continuar) y soporte de
`prefers-reduced-motion`. El acierto/error no depende solo del color (iconos + texto).

## ✅ QA

Probado en Chrome (viewport 390×844 y escritorio 1440×900): sin overflow horizontal,
fórmulas envueltas, opciones grandes táctiles, aleatoriedad verificada por simulación
de partidas y revisión académica contra las páginas 37–38 del PDF del Gimnasio 2.
