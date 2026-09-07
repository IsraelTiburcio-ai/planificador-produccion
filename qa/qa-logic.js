/* QA lógico — valida data.js y simula partidas (se ejecuta con Node) */
'use strict';

global.window = {};
require('../data.js');
const BANCO = window.BANCO;
const PLAN = window.PLAN_PARTIDA;

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
const TIERS_VALIDOS = new Set(['facil', 'medio', 'avanzado', 'final']);
const CASOS_VALIDOS = new Set(['sailco', 'acme', 'general']);

for (const r of BANCO) {
  const tag = `[${r.id}]`;
  afirmar(!ids.has(r.id), `${tag} id duplicado`);
  ids.add(r.id);
  afirmar(TIERS_VALIDOS.has(r.tier), `${tag} tier inválido: ${r.tier}`);
  afirmar(CASOS_VALIDOS.has(r.caso), `${tag} caso inválido: ${r.caso}`);
  afirmar(typeof r.pregunta === 'string' && r.pregunta.length > 10, `${tag} pregunta vacía`);
  afirmar(Array.isArray(r.opciones) && r.opciones.length === 3, `${tag} debe tener 3 opciones`);
  afirmar(r.opciones.filter(o => o.ok).length === 1, `${tag} debe tener exactamente 1 opción correcta`);
  afirmar(r.fb && r.fb.ok && r.fb.mal, `${tag} falta feedback ok/mal`);
  afirmar(r.fb.ok.length <= 160 && r.fb.mal.length <= 200, `${tag} feedback demasiado largo (1–2 líneas)`);
  afirmar(typeof r.etiqueta === 'string' && r.etiqueta, `${tag} falta etiqueta`);
  for (const c of r.chips || []) {
    afirmar(ICONOS_VALIDOS.has(c.i), `${tag} chip con icono inválido: ${c.i}`);
    afirmar(c.l && c.v !== undefined, `${tag} chip incompleto`);
  }
  afirmar(!/[🇦-🇿\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(JSON.stringify(r)), `${tag} contiene emojis (prohibidos en data)`);
}
console.log(`Banco: ${BANCO.length} retos — se esperaba 18–25`);
afirmar(BANCO.length >= 18 && BANCO.length <= 25, 'el banco debe tener 18–25 retos');

const porTier = {};
for (const r of BANCO) porTier[r.tier] = (porTier[r.tier] || 0) + 1;
console.log('Por tier:', JSON.stringify(porTier));
for (const b of PLAN) afirmar(porTier[b.tier] >= b.n, `tier ${b.tier} sin suficientes retos (${porTier[b.tier]}/${b.n})`);

const suma = PLAN.reduce((s, b) => s + b.n, 0);
console.log(`Retos por partida: ${suma} (plan: ${PLAN.map(p => `${p.n}×${p.tier}`).join(' + ')})`);
afirmar(suma >= 7 && suma <= 8, 'la partida debe tener 7–8 retos');

/* ---------- 2. Simulación de 5 partidas ---------- */
function muestrearPartida() {
  const rondas = [];
  for (const bloque of PLAN) {
    const bolsa = barajar(BANCO.filter(r => r.tier === bloque.tier));
    rondas.push(...bolsa.slice(0, bloque.n));
  }
  return rondas;
}

const posicionesCorrecta = { A: 0, B: 0, C: 0 };
let totalRondas = 0;

for (let partida = 1; partida <= 5; partida++) {
  const rondas = muestrearPartida();
  afirmar(rondas.length === suma, `partida ${partida}: número de rondas ${rondas.length} ≠ ${suma}`);
  afirmar(new Set(rondas.map(r => r.id)).size === rondas.length, `partida ${partida}: reto repetido en la misma partida`);

  const compo = {};
  for (const r of rondas) compo[r.tier] = (compo[r.tier] || 0) + 1;
  for (const b of PLAN) afirmar(compo[b.tier] === b.n, `partida ${partida}: composición de ${b.tier} = ${compo[b.tier]}`);
  afirmar(rondas[rondas.length - 1].tier === 'final', `partida ${partida}: la última ronda debe ser el caso integrador`);

  // Orden de dificultad no decreciente por bloques (facil → medio → avanzado → final)
  const orden = { facil: 0, medio: 1, avanzado: 2, final: 3 };
  for (let i = 1; i < rondas.length; i++) {
    afirmar(orden[rondas[i].tier] >= orden[rondas[i - 1].tier], `partida ${partida}: dificultad no creciente en ronda ${i + 1}`);
  }

  // Simular respuestas: 80% de acierto, respuesta entre 6 y 15 s
  let puntos = 0, racha = 0, rachaMax = 0, aciertos = 0, segTotales = 0;
  for (const reto of rondas) {
    totalRondas++;
    const opciones = barajar(reto.opciones);
    posicionesCorrecta['ABC'[opciones.findIndex(o => o.ok)]]++;
    const acierta = Math.random() < 0.8;
    const segRonda = 6 + Math.random() * 9;
    segTotales += segRonda + 1.2; // + transición/feedback
    if (acierta) {
      const bonusRapidez = segRonda <= 10 ? 30 : 15;
      const bonusRacha = Math.min(racha, 5) * 10;
      puntos += 100 + bonusRapidez + bonusRacha;
      racha++; rachaMax = Math.max(rachaMax, racha); aciertos++;
    } else { racha = 0; }
  }
  const dur = Math.round(segTotales);
  console.log(`Partida ${partida}: rondas=${rondas.length} aciertos=${aciertos} rachaMáx=${rachaMax} pts=${puntos} duración≈${dur}s ids=${rondas.map(r => r.id).join(',')}`);
  afirmar(dur >= 55 && dur <= 120, `partida ${partida}: duración estimada ${dur}s fuera de 60–120 s`);
  afirmar(puntos > 0 && puntos < 2000, `partida ${partida}: puntuación sospechosa ${puntos}`);
}

const total = posicionesCorrecta.A + posicionesCorrecta.B + posicionesCorrecta.C;
for (const k of ['A', 'B', 'C']) {
  const pct = Math.round(100 * posicionesCorrecta[k] / total);
  console.log(`Posición correcta ${k}: ${posicionesCorrecta[k]}/${total} (${pct}%)`);
  afirmar(pct >= 20 && pct <= 47, `posición ${k} sesgada (${pct}%)`);
}

/* ---------- 3. Cobertura de temas ---------- */
const temas = new Set(BANCO.map(r => r.etiqueta));
console.log('Temas cubiertos:', [...temas].join(' · '));
for (const esperado of ['Variables', 'Balance', 'Capacidad', 'Función objetivo', 'Inventario', 'Interpretación', 'Detectar el error', 'Caso integrador', 'Costos']) {
  afirmar(temas.has(esperado), `falta el tema ${esperado}`);
}
const casos = {};
for (const r of BANCO) casos[r.caso] = (casos[r.caso] || 0) + 1;
console.log('Casos:', JSON.stringify(casos));
afirmar(casos.sailco >= 8 && casos.acme >= 4, 'debe haber preguntas claras de Sailco y de Acme');

/* ---------- Resultado ---------- */
if (errores.length) {
  console.error('\nFALLOS QA:');
  errores.forEach(e => console.error(' ✗ ' + e));
  process.exit(1);
} else {
  console.log('\nQA LÓGICO: PASS ✓');
}
