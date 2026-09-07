/* ============================================================
   PLANIFICADOR DE PRODUCCIÓN — Lógica del juego
   Enter → entender → jugar → terminar → volver a jugar
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
  rondas: [],
  indice: 0,
  puntos: 0,
  racha: 0,
  rachaMax: 0,
  aciertos: 0,
  fallosTipos: [],
  tInicio: null,
  tRonda: null,
  corriendo: false,
  respondida: false,
  reloj: null
};

window.estado = estado; /* referencia de lectura para el arnés de QA */

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

/* ---------- Muestreo de retos ---------- */
function muestrearPartida() {
  const rondas = [];
  for (const bloque of window.PLAN_PARTIDA) {
    const bolsa = barajar(window.BANCO.filter(r => r.tier === bloque.tier));
    rondas.push(...bolsa.slice(0, bloque.n));
  }
  return rondas;
}

/* ---------- Escena: línea del tiempo y chips ---------- */
const TIMELINES = {
  sailco: {
    pegada: true,
    periodos: [['T1', '40'], ['T2', '60'], ['T3', '75'], ['T4', '25']]
  },
  acme: {
    pegada: true,
    periodos: [['M1', '100'], ['M2', '250'], ['M3', '190'], ['M4', '140'], ['M5', '220'], ['M6', '110']]
  },
  general: {
    pegada: false,
    periodos: [['P1', '—'], ['P2', '—'], ['P3', '—'], ['P4', '—']]
  }
};

const ICONO_CHIP = {
  factory: '#ic-fabrica',
  box: '#ic-caja',
  truck: '#ic-camion',
  gear: '#ic-velocimetro',
  coin: '#ic-moneda',
  calendar: '#ic-calendario',
  bolt: '#ic-rayo'
};

function pintarLineaTiempo(caso) {
  const tl = TIMELINES[caso] || TIMELINES.general;
  const cont = $('#linea-tiempo');
  cont.classList.toggle('pegada', tl.pegada);
  cont.innerHTML = tl.periodos.map(([p, d]) =>
    `<div class="periodo"><b>${p}</b><span>${d}</span></div>`
  ).join('');
}

function pintarChips(chips) {
  $('#chips').innerHTML = (chips || []).map(c =>
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
  estado.puntos = 0;
  estado.racha = 0;
  estado.rachaMax = 0;
  estado.aciertos = 0;
  estado.fallosTipos = [];
  estado.respondida = false;

  const progreso = $('#progreso');
  progreso.innerHTML = estado.rondas.map(() => '<span class="progreso-dot"></span>').join('');

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

function pintarRonda() {
  const reto = estado.rondas[estado.indice];
  const n = estado.rondas.length;

  estado.respondida = false;
  estado.tRonda = Date.now();

  $('#reto-ronda').textContent = `Ronda ${estado.indice + 1} de ${n}`;
  $('#reto-tipo').textContent = reto.etiqueta;
  $('#pregunta').innerHTML = reto.pregunta;

  pintarLineaTiempo(reto.caso);
  pintarChips(reto.chips);

  const opciones = barajar(reto.opciones);
  const cont = $('#opciones');
  cont.innerHTML = '';
  opciones.forEach((op, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opcion' + (op.largo ? ' opcion-larga' : '');
    btn._ok = !!op.ok;
    btn.innerHTML =
      `<span class="letra" aria-hidden="true">${'ABC'[i]}</span>` +
      `<span class="opcion-texto">${op.html}</span>` +
      `<svg class="icono opcion-ico" aria-hidden="true"></svg>`;
    btn.addEventListener('click', () => responder(btn));
    cont.appendChild(btn);
  });

  const fb = $('#feedback');
  fb.hidden = true;
  fb.classList.remove('acierto', 'fallo');

  const dots = progresoDots();
  dots.forEach((d, i) => d.classList.toggle('actual', i === estado.indice));
  $('#m-puntos').textContent = estado.puntos;
  $('#m-racha').textContent = estado.racha;
  $('#progreso').setAttribute('aria-label',
    `Progreso: ronda ${estado.indice + 1} de ${n}, ${estado.aciertos} aciertos`);
}

function progresoDots() {
  return Array.from(document.querySelectorAll('#progreso .progreso-dot'));
}

function responder(btn) {
  if (estado.respondida) return;
  estado.respondida = true;

  const reto = estado.rondas[estado.indice];
  const acierto = btn._ok;
  const botones = Array.from($('#opciones').children);
  botones.forEach(b => { b.disabled = true; });

  const icoCheck = '<use href="#ic-check"/>';
  const icoX = '<use href="#ic-x"/>';

  botones.forEach((b) => {
    const esLaElegida = b === btn;
    if (b._ok) {
      b.classList.add('correcta');
      b.querySelector('.opcion-ico').innerHTML = icoCheck;
      b.querySelector('.opcion-ico').style.visibility = 'visible';
    } else if (esLaElegida) {
      b.classList.add('incorrecta');
      b.querySelector('.opcion-ico').innerHTML = icoX;
      b.querySelector('.opcion-ico').style.visibility = 'visible';
    } else {
      b.classList.add('atenuada');
    }
  });

  const fb = $('#feedback');
  fb.hidden = false;
  const fbTexto = $('#feedback-texto');
  const fbIcono = $('#feedback-icono');

  if (acierto) {
    const segRonda = (Date.now() - estado.tRonda) / 1000;
    const bonusRapidez = segRonda <= 10 ? 30 : (segRonda <= 18 ? 15 : 0);
    const bonusRacha = Math.min(estado.racha, 5) * 10;
    const ganancia = 100 + bonusRapidez + bonusRacha;

    estado.puntos += ganancia;
    estado.racha += 1;
    estado.rachaMax = Math.max(estado.rachaMax, estado.racha);
    estado.aciertos += 1;

    fb.classList.add('acierto');
    fbIcono.innerHTML = '<svg class="icono">' + icoCheck + '</svg>';
    fbTexto.textContent = `Correcto. ${reto.fb.ok}`;
    audio.correcto();
  } else {
    estado.racha = 0;
    estado.fallosTipos.push(reto.etiqueta);
    fb.classList.add('fallo');
    fbIcono.innerHTML = '<svg class="icono">' + icoX + '</svg>';
    fbTexto.textContent = `Incorrecto. ${reto.fb.mal}`;
    audio.error();
  }

  pintarAlmacen();
  const dots = progresoDots();
  dots[estado.indice].classList.add(acierto ? 'ok' : 'mal');
  dots[estado.indice].classList.remove('actual');

  $('#m-puntos').textContent = estado.puntos;
  $('#m-racha').textContent = estado.racha;

  const ultima = estado.indice === estado.rondas.length - 1;
  $('#btn-siguiente').innerHTML = ultima
    ? 'Ver resultado <svg class="icono"><use href="#ic-estrella"/></svg>'
    : 'Siguiente <svg class="icono"><use href="#ic-flecha"/></svg>';

  $('#btn-siguiente').focus();
}

function siguiente() {
  audio.tap();
  if (estado.indice >= estado.rondas.length - 1) {
    terminarPartida();
  } else {
    estado.indice += 1;
    pintarRonda();
  }
}

function terminarPartida() {
  estado.corriendo = false;
  clearInterval(estado.reloj);
  const seg = Math.floor((Date.now() - estado.tInicio) / 1000);
  const n = estado.rondas.length;

  $('#r-puntos').textContent = estado.puntos;
  $('#r-aciertos').textContent = `${estado.aciertos}/${n}`;
  $('#r-racha').textContent = estado.rachaMax;
  $('#r-tiempo').textContent = fmtTiempo(seg);

  const titulo = $('#resultado-titulo');
  if (estado.aciertos === n) titulo.textContent = 'Maestro de la planeación';
  else if (estado.aciertos >= n - 2) titulo.textContent = 'Planificador sólido';
  else if (estado.aciertos >= Math.ceil(n / 2)) titulo.textContent = 'Planificador en entrenamiento';
  else titulo.textContent = 'Turno de repaso';

  const repaso = $('#repaso-texto');
  if (estado.aciertos === n) {
    repaso.textContent = 'Turno perfecto: planteaste variables, balances, capacidad y función objetivo como en clase.';
  } else if (estado.fallosTipos.length) {
    const unicos = [...new Set(estado.fallosTipos)].slice(0, 3).join(', ').toLowerCase();
    repaso.textContent = `Tus retos pendientes: ${unicos}. Cada periodo debe conservar el flujo del modelo.`;
  }

  cambiarPantalla('resultado');
  audio.fin();

  if (estado.aciertos >= n - 2 && !reduceMovimiento) lanzarConfeti();
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
  if (['1', '2', '3'].includes(e.key)) {
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
$('#btn-repetir').addEventListener('click', () => { audio.tap(); iniciarPartida(); });
$('#btn-inicio').addEventListener('click', () => { audio.tap(); cambiarPantalla('inicio'); });
$('#btn-sonido').addEventListener('click', alternarSonido);
$('#btn-sonido-inicio').addEventListener('click', alternarSonido);

sincronizarSonido();

/* ---------- Ganchos de QA (se activan solo con hash) ---------- */
(function ganchoQA() {
  const h = location.hash;
  const responderPrimera = (bien) => {
    const botones = Array.from($('#opciones').children);
    const elegido = bien ? botones.find(b => b._ok) : botones.find(b => !b._ok);
    elegido.click();
  };
  if (h === '#jugar') {
    iniciarPartida();
  } else if (h === '#feedback-ok' || h === '#feedback-mal') {
    iniciarPartida();
    responderPrimera(h === '#feedback-ok');
  } else if (h === '#resultado') {
    iniciarPartida();
    const n = estado.rondas.length;
    for (let i = 0; i < n; i++) {
      responderPrimera(i < 6);
      siguiente();
    }
  }
})();
