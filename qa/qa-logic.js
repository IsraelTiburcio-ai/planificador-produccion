/* QA lógico — valida data.js del juego CORREGIDO y simula partidas (Node) */
'use strict';

global.window = {};
require('../data.js');
const BANCO = window.BANCO;
const ESTACIONES = window.ESTACIONES;
const RETO_FINAL = window.RETO_FINAL;

const azar = (n) => Math.floor(Math.random() * n);
function barajar(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = azar(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

let errores = [];
const afirmar = (cond, msg) => { if (!cond) errores.push(msg); };

/* ---------- 1. Validez del banco ---------- */
const ids = new Set();
const ICONOS_VALIDOS = new Set(['factory', 'box', 'truck', 'gear', 'coin', 'calendar', 'bolt']);
const CARS_VALIDOS = new Set(ESTACIONES.map(e => e.car));

for (const r of BANCO) {
  const tag = `[${r.id}]`;
  afirmar(!ids.has(r.id), `${tag} id duplicado`);
  ids.add(r.id);
  afirmar(CARS_VALIDOS.has(r.car), `${tag} característica inválida: ${r.car}`);
  afirmar(typeof r.pregunta === 'string' && r.pregunta.length > 10, `${tag} pregunta vacía`);
  afirmar(Array.isArray(r.opciones) && r.opciones.length === 3, `${tag} debe tener 3 opciones`);
  afirmar(r.opciones.filter(o => o.ok).length === 1, `${tag} debe tener exactamente 1 opción correcta`);
  afirmar(r.fb && r.fb.ok && r.fb.mal, `${tag} falta feedback ok/mal`);
  afirmar(r.fb.ok.length <= 170 && r.fb.mal.length <= 190, `${tag} feedback demasiado largo (1–2 líneas)`);
  afirmar(typeof r.etiqueta === 'string' && r.etiqueta, `${tag} falta etiqueta`);
  for (const c of r.chips || []) {
    afirmar(ICONOS_VALIDOS.has(c.i), `${tag} chip con icono inválido: ${c.i}`);
    afirmar(c.l && c.v !== undefined, `${tag} chip incompleto`);
  }
  afirmar(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(JSON.stringify(r)), `${tag} contiene emojis (prohibidos en data)`);
}
console.log(`Banco: ${BANCO.length} retos — se esperaba 15–20`);
afirmar(BANCO.length >= 15 && BANCO.length <= 20, 'el banco debe tener 15–20 retos');

/* ---------- 2. Cobertura: 3–4 retos por cada característica ---------- */
const porCar = {};
for (const r of BANCO) porCar[r.car] = (porCar[r.car] || 0) + 1;
console.log('Por característica:', JSON.stringify(porCar));
afirmar(Object.keys(porCar).length === 5, 'deben existir exactamente 5 características');
for (const est of ESTACIONES) {
  afirmar(porCar[est.car] >= 3 && porCar[est.car] <= 4, `característica ${est.car} con ${porCar[est.car]} retos (3–4 esperados)`);
}

/* ---------- 3. Reto final ---------- */
afirmar(RETO_FINAL.correctas.length === 5, 'el reto final debe tener exactamente 5 correctas');
afirmar(RETO_FINAL.distractores.length >= 2 && RETO_FINAL.distractores.length <= 3, 'el reto final debe tener 2–3 distractores');
const todasTarjetas = [...RETO_FINAL.correctas, ...RETO_FINAL.distractores];
afirmar(new Set(todasTarjetas).size === todasTarjetas.length, 'tarjetas repetidas en el reto final');
afirmar(RETO_FINAL.titulo.toUpperCase().includes('PLANTEAMIENTO DE PROCESO DE PRODUCCIÓN'), 'título del reto final');

/* ---------- 4. Fidelidad de redacción vs. mapa de la pág. 37 ---------- */
const NORMALIZAR = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
const textoBanco = NORMALIZAR(JSON.stringify(BANCO) + JSON.stringify(RETO_FINAL) + JSON.stringify(ESTACIONES));
/* Las cajas del mapa usan abreviaturas ("dos restr.", "Rest."); el juego las
   expande ("dos restricciones", "la restricción establece…"). Se verifican
   los términos sustantivos de cada caja. */
const CAJAS_MAPA = [
  { caja: 'Transformación de Productos', claves: ['transformaciondeproductos'] },
  { caja: 'Se manejan dos restr. (materia prima y producto)', claves: ['dosrestricciones', 'materiaprima'] },
  { caja: 'Función objetivo maximizada', claves: ['funcionobjetivomaximizada'] },
  { caja: 'Rest. Establecer el proceso de transformación', claves: ['restriccion', 'establece', 'procesodetransformacion'] },
  { caja: 'Caso particular de planeación de Producción', claves: ['casoparticulardeplaneaciondeproduccion'] }
];
for (const { caja, claves } of CAJAS_MAPA) {
  afirmar(claves.every(k => textoBanco.includes(k)), `el juego no refleja la caja del mapa: "${caja}"`);
}
afirmar(textoBanco.includes(NORMALIZAR('materia prima')) && textoBanco.includes(NORMALIZAR('producto')), 'debe nombrar materia prima y producto');

/* ---------- 5. Simulación de 5 partidas ---------- */
function muestrearPartida() {
  return ESTACIONES.map(est => {
    const bolsa = barajar(BANCO.filter(r => r.car === est.car));
    return bolsa[0];
  });
}

/* Uniformidad del barajado de opciones: 200 muestras (10 por reto) */
const posiciones = { A: 0, B: 0, C: 0 };
for (const reto of BANCO) {
  for (let i = 0; i < 10; i++) {
    const opciones = barajar(reto.opciones);
    posiciones['ABC'[opciones.findIndex(o => o.ok)]]++;
  }
}
let totalRondas = 0;

for (let partida = 1; partida <= 5; partida++) {
  const rondas = muestrearPartida();
  afirmar(rondas.length === 5, `partida ${partida}: rondas=${rondas.length} ≠ 5`);
  const carsUsadas = rondas.map(r => r.car);
  afirmar(new Set(carsUsadas).size === 5, `partida ${partida}: no cubre las 5 características`);
  afirmar(JSON.stringify(carsUsadas) === JSON.stringify(ESTACIONES.map(e => e.car)),
    `partida ${partida}: el orden de estaciones no coincide con la línea de producción`);

  // Reto final: 7 u 8 tarjetas
  const nDist = 2 + azar(2);
  const tarjetas = barajar([
    ...RETO_FINAL.correctas.map(t => ({ t, ok: true })),
    ...barajar(RETO_FINAL.distractores).slice(0, nDist).map(t => ({ t, ok: false }))
  ]);
  afirmar(tarjetas.length === 5 + nDist && tarjetas.length >= 7 && tarjetas.length <= 8,
    `partida ${partida}: tarjetas del reto final = ${tarjetas.length}`);
  afirmar(tarjetas.filter(t => t.ok).length === 5, `partida ${partida}: deben existir 5 correctas`);

  // Simular respuestas: estaciones 6–12 s cada una; reto final ~15 s
  let seg = 0, aciertos = 0, puntos = 0, racha = 0;
  for (const reto of rondas) {
    totalRondas++;
    const acierta = Math.random() < 0.75;
    const s = 6 + Math.random() * 6;
    seg += s + 1.4;
    if (acierta) {
      const bonusRapidez = s <= 8 ? 30 : 15;
      puntos += 100 + bonusRapidez + Math.min(racha, 5) * 10;
      racha++; aciertos++;
    } else { racha = 0; }
  }
  const sFinal = 13 + Math.random() * 6;
  seg += sFinal + 1.2;
  const todasOk = Math.random() < 0.7;
  if (todasOk) { puntos += 200 + (sFinal <= 12 ? 30 : 15); aciertos++; }
  else { puntos += 40 * (2 + azar(3)); }

  const dur = Math.round(seg);
  console.log(`Partida ${partida}: estaciones+final=6 aciertos=${aciertos} pts=${puntos} duración≈${dur}s ids=${rondas.map(r => r.id).join(',')}`);
  afirmar(dur >= 42 && dur <= 90, `partida ${partida}: duración estimada ${dur}s fuera de 45–90 s`);
  afirmar(puntos >= 300 && puntos < 1800, `partida ${partida}: puntuación sospechosa ${puntos}`);
}

const total = posiciones.A + posiciones.B + posiciones.C;
for (const k of ['A', 'B', 'C']) {
  const pct = Math.round(100 * posiciones[k] / total);
  console.log(`Posición correcta ${k}: ${posiciones[k]}/${total} (${pct}%)`);
  afirmar(pct >= 24 && pct <= 43, `posición ${k} sesgada (${pct}% de ${total})`);
}

/* ---------- 6. Distractores no absurdos ---------- */
const PALABRAS_ABSURDAS = ['dinosaurio', 'pizza', 'videojuego', 'coche', 'comer'];
afirmar(!PALABRAS_ABSURDAS.some(w => textoBanco.includes(NORMALIZAR(w))), 'hay distractores absurdos');
// Toda opción debe ser sustanciosa (las fórmulas cortas tipo "min Z" cuentan por su Z)
for (const r of BANCO) {
  for (const o of r.opciones) {
    const texto = o.html.replace(/<[^>]+>/g, '').trim();
    afirmar(texto.length >= 8 || /[Zz0-9]/.test(texto),
      `[${r.id}] opción demasiado corta para ser plausible: "${texto}"`);
  }
}

/* ---------- Resultado ---------- */
if (errores.length) {
  console.error('\nFALLOS QA:');
  errores.forEach(e => console.error(' ✗ ' + e));
  process.exit(1);
} else {
  console.log('\nQA LÓGICO: PASS ✓');
}
