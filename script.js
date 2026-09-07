/* ============================================================
   PLANIFICADOR DE PRODUCCIÓN — Lógica del juego (CORREGIDO)
   Recorre el proceso de producción y descubre sus características:
   5 estaciones (una por característica del cuadro de la pág. 37)
   + reto final de memoria. Mecánica: elegir entre 3 alternativas.
   ============================================================ */
'use strict';

/* ---------- Utilidades ---------- */
const $ = (sel) => document.querySelector(sel);

const azar = (n) => Math.floor(Math.random() * n);

function barajar(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = azar(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmtTiempo = (seg) => {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Estado ---------- */
const estado = {
  rondas: [],          /* 5 retos: uno por característica, en orden de estación */
  indice: 0,           /* estación actual (0–4); 5 = reto final */
  fase: 'estaciones',
  puntos: 0,
  racha: 0,
  rachaMax: 0,
  aciertos: 0,         /* estaciones + reto final */
  resultados: [],      /* ok por estación */
  fallosTipos: [],
  seleccionadas: null, /* índices de tarjetas del reto final */
  tInicio: null,
  tRonda: null,
  corriendo: false,
  respondida: false,
  reloj: null
};

window.estado = estado; /* referencia de lectura para el arnés de QA */

const TOTAL_RONDAS = 6; /* 5 estaciones + reto final */

/* ---------- Audio (sintetizado, sin archivos) ---------- */
const audio = {
  ctx: null,
  silencio: localStorage.getItem('pp_sonido') === 'off',

  asegurar() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tono(freq, dur = .12, tipo = 'sine', vol = .16, retardo = 0) {
    if (this.silencio) return;
    const ctx = this.asegurar();
    if (!ctx) return;
    const t = ctx.currentTime + retardo;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + .05);
  },

  golpe() {
    if (this.silencio) return;
    const ctx = this.asegurar();
    if (!ctx) return;
    const dur = .09;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < datos.length; i++) {
      datos[i] = (Math.random() * 2 - 1) * (1 - i / datos.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = .25;
    src.connect(filtro).connect(g).connect(ctx.destination);
    src.start();
  },

  tap()    { this.tono(240, .06, 'square', .07); },
  correcto() {
    this.tono(659, .10, 'sine', .16, 0);
    this.tono(880, .16, 'sine', .16, .09);
    this.golpe();
  },
  error()  {
    this.tono(196, .16, 'sawtooth', .10, 0);
    this.tono(147, .22, 'sawtooth', .10, .10);
  },
  estacion() {
    this.tono(392, .09, 'triangle', .12, 0);
    this.tono(523, .14, 'triangle', .12, .08);
    this.golpe();
  },
  fin()    {
    this.tono(523, .12, 'sine', .14, 0);
    this.tono(659, .12, 'sine', .14, .11);
    this.tono(784, .12, 'sine', .14, .22);
    this.tono(1047, .30, 'sine', .14, .33);
  }
};

function sincronizarSonido() {
  const href = audio.silencio ? '#ic-sonido-off' : '#ic-sonido-on';
  const presionado = String(!audio.silencio);
  for (const btn of document.querySelectorAll('.btn-sonido')) {
    btn.querySelector('use').setAttribute('href', href);
    btn.setAttribute('aria-pressed', presionado);
  }
}

function alternarSonido() {
  audio.silencio = !audio.silencio;
  localStorage.setItem('pp_sonido', audio.silencio ? 'off' : 'on');
  sincronizarSonido();
  if (!audio.silencio) audio.tap();
}

/* ---------- Muestreo: un reto por característica ---------- */
function muestrearPartida() {
  return window.ESTACIONES.map(est => {
    const bolsa = barajar(window.BANCO.filter(r => r.car === est.car));
    return bolsa[0];
  });
}

/* ---------- Escena: estaciones, chips y almacén ---------- */
const ICONO_CHIP = {
  factory: '#ic-fabrica',
  box: '#ic-caja',
  truck: '#ic-camion',
  gear: '#ic-velocimetro',
  coin: '#ic-moneda',
  calendar: '#ic-calendario',
  bolt: '#ic-rayo'
};

function pintarEstaciones() {
  const cont = $('#estaciones');
  let html = '<span class="estacion-extremo">Materia<br>prima</span>';
  window.ESTACIONES.forEach((est, i) => {
    if (i > 0) html += '<i class="estacion-flecha" aria-hidden="true"></i>';
    const res = estado.resultados[i]; /* undefined = pendiente */
    let cls = 'estacion-nodo';
    if (res === true) cls += ' ok';
    else if (res === false) cls += ' mal';
    else if (i === estado.indice && estado.fase === 'estaciones') cls += ' actual';
    html += `<span class="${cls}" aria-hidden="true"><b>${i + 1}</b></span>`;
  });
  html += '<span class="estacion-extremo">Producto<br>terminado</span>';
  cont.innerHTML = html;

  /* nivel de transformación del producto en la banda */
  const nivel = Math.min(estado.aciertos, 5);
  document.querySelector('.escena').setAttribute('data-nivel', String(nivel));
}

function pintarChips(chips) {
  const cont = $('#chips');
  cont.hidden = !chips || chips.length === 0;
  cont.innerHTML = (chips || []).map(c =>
    `<span class="chip"><svg class="icono"><use href="${ICONO_CHIP[c.i] || '#ic-caja'}"/></svg><span>${c.l}:</span><b>${c.v}</b></span>`
  ).join('');
}

function pintarAlmacen() {
  const cont = $('#almacen-cajas');
  const n = Math.min(estado.aciertos, 8);
  cont.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const caja = document.createElement('span');
    caja.className = 'mini-caja';
    cont.appendChild(caja);
  }
  $('#almacen-contador').textContent = estado.aciertos;
}

/* ---------- Flujo de partida ---------- */
function iniciarPartida() {
  estado.rondas = muestrearPartida();
  estado.indice = 0;
  estado.fase = 'estaciones';
  estado.puntos = 0;
  estado.racha = 0;
  estado.rachaMax = 0;
  estado.aciertos = 0;
  estado.resultados = [];
  estado.fallosTipos = [];
  estado.respondida = false;

  $('#progreso').innerHTML = Array.from({ length: TOTAL_RONDAS },
    () => '<span class="progreso-dot"></span>').join('');

  pintarAlmacen();
  cambiarPantalla('juego');
  pintarRonda();

  estado.tInicio = Date.now();
  estado.corriendo = true;
  clearInterval(estado.reloj);
  estado.reloj = setInterval(actualizarReloj, 500);
  actualizarReloj();
}

function actualizarReloj() {
  if (!estado.corriendo) return;
  const seg = Math.floor((Date.now() - estado.tInicio) / 1000);
  $('#m-tiempo').textContent = fmtTiempo(seg);
}

/* ---------- Ronda de estación ---------- */
function pintarRonda() {
  const reto = estado.rondas[estado.indice];
  const est = window.ESTACIONES[estado.indice];

  estado.respondida = false;
  estado.tRonda = Date.now();

  $('#reto-ronda').textContent = `Estación ${estado.indice + 1} de 5`;
  $('#reto-tipo').textContent = est.corto;
  $('#pregunta').innerHTML = reto.pregunta;
  $('#pregunta').hidden = false;
  $('#opciones').hidden = false;
  $('#reto-final').hidden = true;
  $('.escena').hidden = false;

  pintarEstaciones();
  pintarChips(reto.chips);

  const opciones = barajar(reto.opciones);
  const cont = $('#opciones');
  cont.innerHTML = '';
  opciones.forEach((op, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opcion';
    btn._ok = !!op.ok;
    btn.innerHTML =
      `<span class="letra" aria-hidden="true">${'ABC'[i]}</span>` +
      `<span class="opcion-texto">${op.html}</span>` +
      `<svg class="icono opcion-ico" aria-hidden="true"></svg>`;
    btn.addEventListener('click', () => responder(btn));
    cont.appendChild(btn);
  });

  ocultarFeedback();
  marcarProgreso();
}

function ocultarFeedback() {
  const fb = $('#feedback');
  fb.hidden = true;
  fb.classList.remove('acierto', 'fallo');
}

function marcarProgreso() {
  const dots = progresoDots();
  dots.forEach((d, i) => d.classList.toggle('actual', i === estado.indice));
  $('#m-puntos').textContent = estado.puntos;
  $('#m-racha').textContent = estado.racha;
  $('#progreso').setAttribute('aria-label',
    `Progreso: ${estado.fase === 'estaciones' ? `estación ${estado.indice + 1} de 5` : 'reto final'}, ${estado.aciertos} aciertos`);
}

function progresoDots() {
  return Array.from(document.querySelectorAll('#progreso .progreso-dot'));
}

function responder(btn) {
  if (estado.respondida) return;
  estado.respondida = true;

  const reto = estado.rondas[estado.indice];
  const est = window.ESTACIONES[estado.indice];
  const acierto = btn._ok;
  const botones = Array.from($('#opciones').children);
  botones.forEach(b => { b.disabled = true; });

  const icoCheck = '<use href="#ic-check"/>';
  const icoX = '<use href="#ic-x"/>';

  botones.forEach((b) => {
    if (b._ok) {
      b.classList.add('correcta');
      b.querySelector('.opcion-ico').innerHTML = icoCheck;
      b.querySelector('.opcion-ico').style.visibility = 'visible';
    } else if (b === btn) {
      b.classList.add('incorrecta');
      b.querySelector('.opcion-ico').innerHTML = icoX;
      b.querySelector('.opcion-ico').style.visibility = 'visible';
    } else {
      b.classList.add('atenuada');
    }
  });

  const fb = $('#feedback');
  fb.hidden = false;

  if (acierto) {
    const segRonda = (Date.now() - estado.tRonda) / 1000;
    const bonusRapidez = segRonda <= 8 ? 30 : (segRonda <= 15 ? 15 : 0);
    const bonusRacha = Math.min(estado.racha, 5) * 10;

    estado.puntos += 100 + bonusRapidez + bonusRacha;
    estado.racha += 1;
    estado.rachaMax = Math.max(estado.rachaMax, estado.racha);
    estado.aciertos += 1;

    fb.classList.add('acierto');
    $('#feedback-icono').innerHTML = '<svg class="icono">' + icoCheck + '</svg>';
    $('#feedback-texto').textContent = `Correcto. ${reto.fb.ok}`;
    audio.correcto();
    audio.estacion();
  } else {
    estado.racha = 0;
    estado.fallosTipos.push(est.nombre);
    fb.classList.add('fallo');
    $('#feedback-icono').innerHTML = '<svg class="icono">' + icoX + '</svg>';
    $('#feedback-texto').textContent = `Incorrecto. ${reto.fb.mal}`;
    audio.error();
  }

  estado.resultados[estado.indice] = acierto;
  pintarEstaciones();
  pintarAlmacen();

  const dots = progresoDots();
  dots[estado.indice].classList.add(acierto ? 'ok' : 'mal');
  dots[estado.indice].classList.remove('actual');

  $('#m-puntos').textContent = estado.puntos;
  $('#m-racha').textContent = estado.racha;

  const ultima = estado.indice === estado.rondas.length - 1;
  $('#btn-siguiente').innerHTML = ultima
    ? 'Reto final <svg class="icono"><use href="#ic-estrella"/></svg>'
    : 'Siguiente <svg class="icono"><use href="#ic-flecha"/></svg>';

  $('#btn-siguiente').focus();
}

/* ---------- Reto final: memoria del cuadro ---------- */
function pintarRetoFinal() {
  const rf = window.RETO_FINAL;

  estado.indice = 5;
  estado.fase = 'final';
  estado.respondida = false;
  estado.tRonda = Date.now();

  $('#reto-ronda').textContent = 'Reto final';
  $('#reto-tipo').textContent = 'Memoria del cuadro';
  $('#pregunta').hidden = true;
  $('#opciones').hidden = true;
  $('#reto-final').hidden = false;
  $('.escena').hidden = true; /* más espacio para las tarjetas de memoria */

  pintarEstaciones();
  pintarChips([]);

  $('#cuadro-titulo').textContent = rf.titulo;
  $('#cuadro-instr').textContent = rf.instrucciones;

  const nDist = 2 + azar(2); /* 2 o 3 distractores → 7 u 8 tarjetas */
  const tarjetas = barajar([
    ...rf.correctas.map(t => ({ texto: t, ok: true })),
    ...barajar(rf.distractores).slice(0, nDist).map(t => ({ texto: t, ok: false }))
  ]);

  const cont = $('#tarjetas');
  cont.innerHTML = '';
  estado.tarjetas = tarjetas;
  estado.seleccionadas = new Set();
  tarjetas.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tarjeta-cara';
    btn._ok = t.ok;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML =
      `<svg class="icono tarjeta-ico" aria-hidden="true"><use href="#ic-check"/></svg><span>${t.texto}</span>`;
    btn.addEventListener('click', () => alternarTarjeta(btn));
    cont.appendChild(btn);
  });

  const btnConfirmar = $('#btn-confirmar');
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = 'Selecciona 5 <svg class="icono"><use href="#ic-check"/></svg>';

  ocultarFeedback();
  marcarProgreso();
}

function alternarTarjeta(btn) {
  if (estado.respondida) return;
  const idx = Array.from($('#tarjetas').children).indexOf(btn);
  if (estado.seleccionadas.has(idx)) {
    estado.seleccionadas.delete(idx);
    btn.classList.remove('elegida');
    btn.setAttribute('aria-pressed', 'false');
  } else {
    if (estado.seleccionadas.size >= 5) return; /* máximo 5 */
    estado.seleccionadas.add(idx);
    btn.classList.add('elegida');
    btn.setAttribute('aria-pressed', 'true');
  }
  audio.tap();
  const n = estado.seleccionadas.size;
  const btnConfirmar = $('#btn-confirmar');
  btnConfirmar.disabled = n !== 5;
  btnConfirmar.innerHTML = (n === 5 ? 'Confirmar selección' : `Selecciona ${5 - n} más`)
    + ' <svg class="icono"><use href="#ic-check"/></svg>';
}

function confirmarReto() {
  if (estado.respondida || estado.seleccionadas.size !== 5) return;
  estado.respondida = true;

  const hijos = Array.from($('#tarjetas').children);
  let correctas = 0;
  hijos.forEach((b, i) => {
    b.disabled = true;
    if (estado.seleccionadas.has(i)) {
      if (b._ok) {
        b.classList.add('correcta');
      } else {
        b.classList.add('incorrecta');
      }
    } else if (b._ok) {
      b.classList.add('pendiente');
    }
  });

  const todasOk = hijos.every((b, i) => estado.seleccionadas.has(i) === b._ok);

  const fb = $('#feedback');
  fb.hidden = false;
  const segRonda = (Date.now() - estado.tRonda) / 1000;

  if (todasOk) {
    const bonusRapidez = segRonda <= 12 ? 30 : (segRonda <= 20 ? 15 : 0);
    estado.puntos += 200 + bonusRapidez;
    estado.racha += 1;
    estado.rachaMax = Math.max(estado.rachaMax, estado.racha);
    estado.aciertos += 1;
    fb.classList.add('acierto');
    $('#feedback-icono').innerHTML = '<svg class="icono"><use href="#ic-check"/></svg>';
    $('#feedback-texto').textContent = 'Cuadro completo: esas son las 5 características del planteamiento.';
    audio.correcto();
  } else {
    const nOk = hijos.filter((b, i) => estado.seleccionadas.has(i) && b._ok).length;
    estado.puntos += nOk * 40;
    estado.racha = 0;
    estado.fallosTipos.push('Memoria del cuadro');
    fb.classList.add('fallo');
    $('#feedback-icono').innerHTML = '<svg class="icono"><use href="#ic-x"/></svg>';
    $('#feedback-texto').textContent = 'La selección no cierra. Las 5 correctas quedan marcadas: revísalas en el resultado.';
    audio.error();
  }

  estado.resultados[5] = todasOk;

  const dots = progresoDots();
  dots[5].classList.add(todasOk ? 'ok' : 'mal');
  dots[5].classList.remove('actual');

  $('#m-puntos').textContent = estado.puntos;
  $('#m-racha').textContent = estado.racha;
  $('#progreso').setAttribute('aria-label',
    `Reto final contestado, ${estado.aciertos} aciertos`);

  const btnConfirmar = $('#btn-confirmar');
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = 'Ver resultado <svg class="icono"><use href="#ic-estrella"/></svg>';
  $('#btn-siguiente').focus();
}

/* ---------- Avance y cierre ---------- */
function siguiente() {
  audio.tap();
  if (estado.fase === 'estaciones') {
    if (estado.indice >= estado.rondas.length - 1) {
      pintarRetoFinal();
    } else {
      estado.indice += 1;
      pintarRonda();
    }
  } else {
    terminarPartida();
  }
}

function terminarPartida() {
  estado.corriendo = false;
  clearInterval(estado.reloj);
  const seg = Math.floor((Date.now() - estado.tInicio) / 1000);

  $('#r-puntos').textContent = estado.puntos;
  $('#r-aciertos').textContent = `${estado.aciertos}/${TOTAL_RONDAS}`;
  $('#r-racha').textContent = estado.rachaMax;
  $('#r-tiempo').textContent = fmtTiempo(seg);

  $('#cuadro-lista').innerHTML = window.ESTACIONES.map(est =>
    `<li>${est.nombre}</li>`).join('');

  const titulo = $('#resultado-titulo');
  const sub = $('#resultado-sub');
  if (estado.aciertos === TOTAL_RONDAS) {
    titulo.textContent = '¡Proceso dominado!';
    sub.textContent = 'Identificaste las 5 características: puedes llenar el cuadro completo.';
  } else if (estado.aciertos >= 4) {
    titulo.textContent = 'Proceso casi completo';
    sub.textContent = 'Faltan pocas características: da otro recorrido para afinar la memoria.';
  } else if (estado.aciertos >= 3) {
    titulo.textContent = 'Proceso en marcha';
    sub.textContent = 'Vas por buen camino: repasa las estaciones que fallaron.';
  } else {
    titulo.textContent = 'Turno de repaso';
    sub.textContent = 'Vuelve a recorrer la línea para fijar las 5 características.';
  }

  cambiarPantalla('resultado');
  audio.fin();

  if (estado.aciertos >= 4 && !reduceMovimiento) lanzarConfeti();
}

function lanzarConfeti() {
  const colores = ['#f5a524', '#53c6f5', '#3ecf8e', '#ff7a7a', '#ffd47e'];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('span');
    c.className = 'confeti';
    c.style.left = `${azar(100)}vw`;
    c.style.background = colores[azar(colores.length)];
    c.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
    c.style.animationDelay = `${Math.random() * .5}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4600);
  }
}

/* ---------- Navegación de pantallas ---------- */
function cambiarPantalla(nombre) {
  for (const p of ['inicio', 'juego', 'resultado']) {
    $('#pantalla-' + p).classList.toggle('oculta', p !== nombre);
  }
  window.scrollTo(0, 0);
}

/* ---------- Atajos de teclado ---------- */
document.addEventListener('keydown', (e) => {
  const enJuego = !$('#pantalla-juego').classList.contains('oculta');
  if (!enJuego) {
    if (e.key === 'Enter' && !$('#pantalla-inicio').classList.contains('oculta')) {
      const activo = document.activeElement;
      if (activo && activo.tagName === 'BUTTON') return;
      $('#btn-comenzar').click();
    }
    return;
  }
  if (estado.fase === 'estaciones' && ['1', '2', '3'].includes(e.key)) {
    const btn = $('#opciones').children[Number(e.key) - 1];
    if (btn && !estado.respondida) btn.click();
  } else if (e.key === 'Enter' && estado.respondida) {
    const activo = document.activeElement;
    if (activo && activo.tagName === 'BUTTON') return;
    $('#btn-siguiente').click();
  }
});

/* ---------- Eventos ---------- */
$('#btn-comenzar').addEventListener('click', () => { audio.asegurar(); audio.tap(); iniciarPartida(); });
$('#btn-siguiente').addEventListener('click', siguiente);
$('#btn-confirmar').addEventListener('click', confirmarReto);
$('#btn-repetir').addEventListener('click', () => { audio.tap(); iniciarPartida(); });
$('#btn-inicio').addEventListener('click', () => { audio.tap(); cambiarPantalla('inicio'); });
$('#btn-sonido').addEventListener('click', alternarSonido);
$('#btn-sonido-inicio').addEventListener('click', alternarSonido);

sincronizarSonido();

/* ---------- Ganchos de QA (se activan solo con hash) ---------- */
(function ganchoQA() {
  const h = location.hash;
  const responderEstacion = (bien) => {
    const botones = Array.from($('#opciones').children);
    const elegido = bien ? botones.find(b => b._ok) : botones.find(b => !b._ok);
    elegido.click();
  };
  const resolverRetoFinal = (bien) => {
    const tarjetas = Array.from($('#tarjetas').children);
    if (bien) {
      tarjetas.filter(b => b._ok).forEach(b => { if (!b.classList.contains('elegida')) b.click(); });
    } else {
      const malas = tarjetas.filter(b => !b._ok);
      tarjetas.filter(b => b._ok).slice(0, 3).forEach(b => b.click());
      malas.slice(0, 2).forEach(b => b.click());
    }
    $('#btn-confirmar').click();
  };
  if (h === '#jugar') {
    iniciarPartida();
  } else if (h === '#feedback-ok' || h === '#feedback-mal') {
    iniciarPartida();
    responderEstacion(h === '#feedback-ok');
  } else if (h === '#reto-final') {
    iniciarPartida();
    for (let i = 0; i < 5; i++) { responderEstacion(true); siguiente(); }
  } else if (h === '#resultado') {
    iniciarPartida();
    for (let i = 0; i < 5; i++) { responderEstacion(i < 6); siguiente(); }
    resolverRetoFinal(true);
    siguiente();
  }
})();
