/* ============================================================
   PLANIFICADOR DE PRODUCCIÓN — Banco académico de retos
   Fuente: Gimnasio 2. Modelos de Programación Lineal,
   Optimización I — páginas 37 y 38.
   - SAILCO (prob. 42, p. 37–38): 4 trimestres, demanda 40/60/75/25,
     inventario inicial 10, capacidad regular xⱼ ≤ 40 a $400/bote,
     tiempo extra yⱼ a $450/bote, almacenamiento $20 por bote al
     final del trimestre. Modelo de clase:
     min Z = 400(x₁+x₂+x₃+x₄) + 450(y₁+y₂+y₃+y₄) + 20(r₁+r₂+r₃)
     Balances: x₁+y₁+10 = 40+r₁ · r₁+x₂+y₂ = 60+r₂
               r₂+x₃+y₃ = 75+r₃ · r₃+x₄+y₄ = 25
   - MANUFACTURERA ACME (Bayas Extra, prob. 43, p. 38): 6 meses,
     demanda 100/250/190/140/220/110, costo de producción
     $50/$45/$55/$48/$52/$50, almacenamiento $8/ventana·mes.
     Balances: x₁ = 100+r₁ · x₂+r₁ = 250+r₂ · x₃+r₂ = 190+r₃
               x₄+r₃ = 140+r₄ · x₅+r₄ = 220+r₅ · x₆+r₅ = 110
   Notación de clase: xⱼ producción regular, yⱼ tiempo extra,
   rⱼ inventario al final del periodo j.
   ============================================================ */
'use strict';

window.BANCO = [

  /* ---------- NIVEL FÁCIL — conceptos (rondas 1–2) ---------- */

  {
    id: 'v1', tier: 'facil', caso: 'sailco', etiqueta: 'Variables',
    chips: [
      { i: 'factory', l: 'Producción', v: 'xⱼ' },
      { i: 'truck', l: 'Demanda T2', v: '60' },
      { i: 'box', l: 'Inventario', v: 'rⱼ' }
    ],
    pregunta: 'Sailco debe decidir cuántos botes de vela producir en cada uno de los 4 trimestres. En el modelo de clase, ¿qué representa <b>x₂</b>?',
    opciones: [
      { html: 'La demanda del trimestre 2', ok: false },
      { html: 'Los botes que Sailco produce en el trimestre 2', ok: true },
      { html: 'El inventario al final del trimestre 2', ok: false }
    ],
    fb: {
      ok: 'xⱼ es la decisión: botes a producir en el trimestre j. La demanda (60 en T2) es un dato.',
      mal: 'La demanda y el inventario no se deciden. xⱼ cuenta los botes a producir en el trimestre j.'
    }
  },

  {
    id: 'o1', tier: 'facil', caso: 'sailco', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'Regular', v: '$400' },
      { i: 'bolt', l: 'Extra', v: '$450' },
      { i: 'box', l: 'Almacenar', v: '$20' }
    ],
    pregunta: 'Sailco quiere un calendario de producción para los 4 trimestres. ¿Qué busca la función objetivo del modelo?',
    opciones: [
      { html: 'Maximizar el número de botes producidos', ok: false },
      { html: 'Minimizar la suma de costos de producción y de inventario', ok: true },
      { html: 'Mantener el inventario lo más alto posible', ok: false }
    ],
    fb: {
      ok: 'Se plantea como min Z: costos de producción (regular y extra) más el costo de almacenamiento.',
      mal: 'Producir más cuesta más. El modelo de clase minimiza el costo total de producción e inventario.'
    }
  },

  {
    id: 'i1', tier: 'facil', caso: 'acme', etiqueta: 'Inventario',
    chips: [
      { i: 'factory', l: 'Producción', v: 'xⱼ' },
      { i: 'box', l: 'Almacén', v: 'rⱼ' },
      { i: 'coin', l: 'Guardar', v: '$8/mes' }
    ],
    pregunta: 'Acme puede fabricar más ventanas de las necesarias en un mes y guardarlas para meses posteriores. ¿Qué variable representa esas unidades guardadas?',
    opciones: [
      { html: 'xⱼ: ventanas producidas en el mes j', ok: false },
      { html: 'rⱼ: ventanas en el almacén al final del mes j', ok: true },
      { html: 'La demanda del mes siguiente', ok: false }
    ],
    fb: {
      ok: 'rⱼ es el inventario al fin del mes j: así “viajan” las unidades de un periodo al siguiente.',
      mal: 'xⱼ es lo producido ese mes. Lo que se guarda para después se acumula en el inventario rⱼ.'
    }
  },

  {
    id: 'i2', tier: 'facil', caso: 'sailco', etiqueta: 'Costos',
    chips: [
      { i: 'box', l: 'Inventario final', v: 'rⱼ' },
      { i: 'coin', l: 'Costo', v: '? $/bote' },
      { i: 'calendar', l: 'Trimestres', v: '4' }
    ],
    pregunta: 'En Sailco, guardar un bote de un trimestre a otro también cuesta. Según el planteamiento de clase, ¿cuál es ese costo?',
    opciones: [
      { html: '$400 por bote, igual que el turno regular', ok: false },
      { html: '$450 por bote, igual que el tiempo extra', ok: false },
      { html: '$20 por bote almacenado al final del trimestre', ok: true }
    ],
    fb: {
      ok: 'Al final de cada trimestre se incurre en $20 por bote por transporte o almacenamiento.',
      mal: '$400 y $450 son costos de producir. El costo de inventario es $20 por bote al final del trimestre.'
    }
  },

  {
    id: 'c1', tier: 'facil', caso: 'sailco', etiqueta: 'Capacidad',
    chips: [
      { i: 'gear', l: 'Cap. regular', v: '40' },
      { i: 'factory', l: 'Producción', v: 'x₁' },
      { i: 'calendar', l: 'Periodo', v: 'T1' }
    ],
    pregunta: 'En cada trimestre, Sailco fabrica como máximo 40 botes con mano de obra en turno regular. ¿Qué restricción modela esto?',
    opciones: [
      { html: 'x₁ = 40', ok: false },
      { html: 'x₁ ≤ 40', ok: true },
      { html: 'x₁ ≥ 40', ok: false }
    ],
    fb: {
      ok: 'La capacidad es un tope: la producción regular no puede exceder los 40 botes del turno.',
      mal: '= 40 obligaría a usar toda la capacidad y ≥ 40 la viola. El tope se escribe x₁ ≤ 40.'
    }
  },

  /* ---------- NIVEL MEDIO — restricciones y balances (rondas 3–5) ---------- */

  {
    id: 'b1', tier: 'medio', caso: 'sailco', etiqueta: 'Balance',
    chips: [
      { i: 'box', l: 'Inv. inicial', v: '10' },
      { i: 'truck', l: 'Demanda T1', v: '40' },
      { i: 'gear', l: 'Cap. regular', v: '40' }
    ],
    pregunta: 'Trimestre 1 de Sailco: inventario inicial 10, producción regular x₁, tiempo extra y₁, demanda 40, inventario final r₁. ¿Cuál es el balance correcto?',
    opciones: [
      { html: '10 + x₁ + y₁ = 40 + r₁', ok: true },
      { html: '10 + 40 = x₁ + y₁ + r₁', ok: false },
      { html: '40 + x₁ + y₁ = 10 + r₁', ok: false }
    ],
    fb: {
      ok: 'Inventario anterior + producción = demanda + inventario final. Ese es el corazón del modelo.',
      mal: 'El flujo no se conserva. Recuerda: inventario anterior + producción = demanda + inventario final.'
    }
  },

  {
    id: 'b2', tier: 'medio', caso: 'sailco', etiqueta: 'Balance',
    chips: [
      { i: 'box', l: 'Llega del T1', v: 'r₁' },
      { i: 'truck', l: 'Demanda T2', v: '60' },
      { i: 'box', l: 'Deja para T3', v: 'r₂' }
    ],
    pregunta: 'En el modelo de clase, el balance del trimestre 2 es r₁ + x₂ + y₂ = ___. ¿Qué completa la ecuación?',
    opciones: [
      { html: '60 − r₂', ok: false },
      { html: '60', ok: false },
      { html: '60 + r₂', ok: true }
    ],
    fb: {
      ok: 'Lo que llega (r₁) más la producción cubre la demanda 60 y deja r₂ para el T3.',
      mal: 'Falta dejar inventario para el siguiente trimestre: el balance termina en demanda + inventario final.'
    }
  },

  {
    id: 'b3', tier: 'medio', caso: 'acme', etiqueta: 'Balance',
    chips: [
      { i: 'box', l: 'Llega del mes 1', v: 'r₁' },
      { i: 'truck', l: 'Demanda mes 2', v: '250' },
      { i: 'factory', l: 'Producción', v: 'x₂' }
    ],
    pregunta: 'Manufacturera Acme, mes 2: llegan r₁ ventanas del almacén, se producen x₂, la demanda es 250 y quedan r₂. ¿Cuál balance corresponde al modelo de clase?',
    opciones: [
      { html: 'x₂ = 250 + r₂', ok: false },
      { html: 'x₂ + r₁ = 250 + r₂', ok: true },
      { html: 'x₂ + r₂ = 250 + r₁', ok: false }
    ],
    fb: {
      ok: 'Producción del mes + inventario anterior = demanda + inventario final. Misma lógica que Sailco.',
      mal: 'Sin r₁ pierdes lo que llegó del mes 1, y el inventario final va junto a la demanda: x₂ + r₁ = 250 + r₂.'
    }
  },

  {
    id: 'c2', tier: 'medio', caso: 'sailco', etiqueta: 'Capacidad',
    chips: [
      { i: 'gear', l: 'Cap. regular', v: '40' },
      { i: 'factory', l: 'Producción T3', v: 'x₃' },
      { i: 'bolt', l: 'Tiempo extra', v: 'y₃' }
    ],
    pregunta: 'En la solución del modelo aparece x₃ = 40. ¿Qué significa para el trimestre 3?',
    opciones: [
      { html: 'Que la demanda del T3 fue de 40 botes', ok: false },
      { html: 'Que se produjeron 40 botes en tiempo extra', ok: false },
      { html: 'Que se usó toda la capacidad regular del trimestre', ok: true }
    ],
    fb: {
      ok: 'x₃ tocó su tope x₃ ≤ 40: el turno regular quedó lleno; lo adicional tendría que salir de y₃.',
      mal: '40 es la capacidad regular, no la demanda. x₃ = 40 significa turno regular al máximo.'
    }
  },

  {
    id: 'c3', tier: 'medio', caso: 'sailco', etiqueta: 'Capacidad',
    chips: [
      { i: 'calendar', l: 'Trimestres', v: '1–4' },
      { i: 'gear', l: 'Tope por periodo', v: '40' },
      { i: 'factory', l: 'Variables', v: 'xⱼ' }
    ],
    pregunta: '¿Cómo se escribe la restricción de capacidad de mano de obra regular para los cuatro trimestres?',
    opciones: [
      { html: 'x₁ + x₂ + x₃ + x₄ ≤ 40', ok: false },
      { html: 'xⱼ ≤ 40, para j = 1, 2, 3, 4', ok: true },
      { html: 'yⱼ ≤ 40, para j = 1, 2, 3, 4', ok: false }
    ],
    fb: {
      ok: 'Cada trimestre tiene su propio tope de 40 botes: la restricción se repite para cada j.',
      mal: 'Sumar juntaría los 4 trimestres en un solo tope. La capacidad es por trimestre y aplica a xⱼ.'
    }
  },

  {
    id: 'o2', tier: 'medio', caso: 'acme', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'Costos por mes', v: '50…50' },
      { i: 'calendar', l: 'Meses', v: '6' },
      { i: 'truck', l: 'Demanda total', v: '1010' }
    ],
    pregunta: 'En Acme el costo de producir una ventana cambia cada mes: $50, $45, $55, $48, $52 y $50. ¿Cómo entra ese costo en la función objetivo?',
    opciones: [
      { html: '50(x₁ + x₂ + x₃ + x₄ + x₅ + x₆)', ok: false },
      { html: '8(x₁ + x₂ + x₃ + x₄ + x₅ + x₆)', ok: false },
      { html: '50x₁ + 45x₂ + 55x₃ + 48x₄ + 52x₅ + 50x₆', ok: true }
    ],
    fb: {
      ok: 'Cada mes multiplica su propio costo de producción: por eso conviene decidir la producción mes a mes.',
      mal: 'Usar un solo costo ignora la variación mensual, y 8 es el costo de almacenamiento, no el de producción.'
    }
  },

  {
    id: 'd1', tier: 'medio', caso: 'general', etiqueta: 'Detectar el error',
    chips: [
      { i: 'box', l: 'Inv. anterior', v: '10' },
      { i: 'truck', l: 'Demanda', v: '60' },
      { i: 'factory', l: 'Producción', v: 'x' }
    ],
    pregunta: 'Demanda 60, inventario anterior 10, producción x, inventario final r. ¿Cuál ecuación está <b>incorrectamente</b> planteada?',
    opciones: [
      { html: '10 + x = 60 + r', ok: false },
      { html: 'x = 60 + r − 10', ok: false },
      { html: '10 + 60 = x + r', ok: true }
    ],
    fb: {
      ok: 'La demanda va del lado del inventario final: 10 + x = 60 + r. Las otras dos son equivalentes.',
      mal: '10 + 60 = x + r pone la demanda junto al inventario inicial: rompe el flujo del balance.'
    }
  },

  {
    id: 'v2', tier: 'medio', caso: 'sailco', etiqueta: 'Variables',
    chips: [
      { i: 'bolt', l: 'Mano de obra', v: 'extra' },
      { i: 'factory', l: 'Producción', v: 'yⱼ' },
      { i: 'coin', l: 'Costo', v: '$450' }
    ],
    pregunta: 'Si el turno regular no basta, Sailco puede usar empleados de tiempo extra. En el modelo, ¿qué representa y₁?',
    opciones: [
      { html: 'El inventario con el que arranca el trimestre 1', ok: false },
      { html: 'Los botes producidos con tiempo extra en el trimestre 1', ok: true },
      { html: 'El costo de producir en el trimestre 1', ok: false }
    ],
    fb: {
      ok: 'yⱼ es la producción adicional en tiempo extra, a $450 por bote, sin tope de 40.',
      mal: 'El inventario inicial es un dato (10) y el costo no es una variable de decisión: y₁ es producción extra.'
    }
  },

  {
    id: 'b4', tier: 'medio', caso: 'general', etiqueta: 'Balance',
    chips: [
      { i: 'box', l: 'Inv. anterior', v: 'Iₜ₋₁' },
      { i: 'factory', l: 'Producción', v: 'xₜ' },
      { i: 'truck', l: 'Demanda', v: 'Dₜ' }
    ],
    pregunta: '¿Cuál de estas estructuras es SIEMPRE la ecuación de balance de un periodo de producción?',
    opciones: [
      { html: 'Inventario anterior + producción = demanda + inventario final', ok: true },
      { html: 'Producción + demanda = inventario anterior + inventario final', ok: false },
      { html: 'Capacidad − producción = demanda − inventario final', ok: false }
    ],
    fb: {
      ok: 'Lo disponible (inventario que llega + producción) se reparte entre demanda e inventario final.',
      mal: 'La demanda no se produce: es lo que se cubre. El balance es Iₜ₋₁ + xₜ = Dₜ + Iₜ.'
    }
  },

  /* ---------- NIVEL AVANZADO — interpretación matemática (rondas 6–7) ---------- */

  {
    id: 'h1', tier: 'avanzado', caso: 'sailco', etiqueta: 'Interpretación',
    chips: [
      { i: 'box', l: 'Inv. inicial', v: '10' },
      { i: 'truck', l: 'Demanda T1', v: '40' },
      { i: 'box', l: 'Inv. final', v: 'r₁' }
    ],
    pregunta: 'En el modelo de clase aparece la ecuación x₁ + y₁ + 10 = 40 + r₁. ¿Qué representa?',
    opciones: [
      { html: 'El balance del T1: producción + inventario inicial cubren la demanda 40 y dejan r₁', ok: true },
      { html: 'La capacidad máxima de producción del trimestre 1', ok: false },
      { html: 'El cálculo del costo total del trimestre 1', ok: false }
    ],
    fb: {
      ok: 'Es el balance del T1: todo lo disponible (producción + inventario) se reparte entre demanda e inventario final.',
      mal: 'Ni capacidad ni costo: igualar lo disponible contra demanda + inventario final es la ecuación de balance.'
    }
  },

  {
    id: 'h2', tier: 'avanzado', caso: 'sailco', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'Regular', v: '$400' },
      { i: 'bolt', l: 'Extra', v: '$450' },
      { i: 'box', l: 'Almacenar', v: '$20' }
    ],
    pregunta: '¿Cuál es la función objetivo del modelo de clase para Sailco?',
    opciones: [
      { html: 'min Z = 400(x₁+x₂+x₃+x₄) + 450(y₁+y₂+y₃+y₄) − 20(r₁+r₂+r₃)', ok: false, largo: true },
      { html: 'min Z = 400(x₁+x₂+x₃+x₄) + 450(y₁+y₂+y₃+y₄) + 20(r₁+r₂+r₃)', ok: true, largo: true },
      { html: 'max Z = 400(x₁+x₂+x₃+x₄) + 450(y₁+y₂+y₃+y₄) + 20(r₁+r₂+r₃)', ok: false, largo: true }
    ],
    fb: {
      ok: 'Regular a $400, extra a $450 y almacenamiento a $20 sobre el inventario final: todo se suma y se minimiza.',
      mal: 'El almacenamiento suma costo (no se resta) y el modelo busca minimizar Z, no maximizarlo.'
    }
  },

  {
    id: 'h3', tier: 'avanzado', caso: 'sailco', etiqueta: 'Interpretación',
    chips: [
      { i: 'calendar', l: 'Último periodo', v: 'T4' },
      { i: 'truck', l: 'Demanda T4', v: '25' },
      { i: 'box', l: 'Llega del T3', v: 'r₃' }
    ],
    pregunta: 'En el modelo de clase, el balance del T4 es r₃ + x₄ + y₄ = 25, sin ningún r₄. ¿Por qué?',
    opciones: [
      { html: 'Porque la demanda del T4 es cero', ok: false },
      { html: 'Porque la capacidad regular impide dejar inventario', ok: false },
      { html: 'Porque es el último trimestre: el plan termina y no hay periodo siguiente que abastecer', ok: true }
    ],
    fb: {
      ok: 'Al cerrar el horizonte de 4 trimestres ya no existe un quinto periodo al cual guardarle inventario.',
      mal: 'La demanda del T4 es 25 (no cero) y la capacidad no prohíbe inventario: no hay un T5 después.'
    }
  },

  {
    id: 'h4', tier: 'avanzado', caso: 'acme', etiqueta: 'Detectar el error',
    chips: [
      { i: 'calendar', l: 'Meses', v: '6' },
      { i: 'truck', l: 'Demanda M1', v: '100' },
      { i: 'truck', l: 'Demanda M2', v: '250' }
    ],
    pregunta: 'En el modelo de Acme (demandas 100, 250, 190, …), ¿cuál balance <b>NO</b> corresponde al planteamiento?',
    opciones: [
      { html: 'x₁ = 100 + r₁', ok: false },
      { html: 'x₂ + r₁ = 250 + r₂', ok: false },
      { html: 'x₂ + r₂ = 250 + r₁', ok: true }
    ],
    fb: {
      ok: 'Del mes 1 llega r₁ y para el mes 3 queda r₂: el correcto es x₂ + r₁ = 250 + r₂.',
      mal: 'Esa opción intercambia los inventarios: pone el almacén del mes 2 entregando al mes 1. El flujo va hacia adelante.'
    }
  },

  {
    id: 'h5', tier: 'avanzado', caso: 'sailco', etiqueta: 'Interpretación',
    chips: [
      { i: 'factory', l: 'Variables', v: 'x, y, r' },
      { i: 'gear', l: 'Condición', v: '≥ 0, enteros' },
      { i: 'box', l: 'Unidades', v: 'botes' }
    ],
    pregunta: 'El modelo de Sailco cierra con xⱼ, yⱼ, rⱼ ≥ 0 y enteros. ¿Qué expresa esa condición?',
    opciones: [
      { html: 'Que la demanda siempre se cubre y nunca es negativa', ok: false },
      { html: 'Que no se puede producir, usar extra ni almacenar cantidades negativas ni fraccionarias', ok: true },
      { html: 'Que los costos de producción nunca pueden ser negativos', ok: false }
    ],
    fb: {
      ok: 'Las variables de decisión son botes completos: las condiciones aplican a producir, extra e inventario.',
      mal: 'La condición va sobre las variables de decisión (xⱼ, yⱼ, rⱼ), no sobre la demanda ni sobre los costos.'
    }
  },

  {
    id: 'h6', tier: 'avanzado', caso: 'sailco', etiqueta: 'Interpretación',
    chips: [
      { i: 'box', l: 'Llega del T2', v: 'r₂' },
      { i: 'truck', l: '¿75 = ?', v: 'T3' },
      { i: 'box', l: 'Deja para T4', v: 'r₃' }
    ],
    pregunta: 'En el balance r₂ + x₃ + y₃ = 75 + r₃ del modelo de Sailco, ¿qué es el 75?',
    opciones: [
      { html: 'La capacidad regular del trimestre 3', ok: false },
      { html: 'El inventario con el que inicia el trimestre 3', ok: false },
      { html: 'La demanda del trimestre 3', ok: true }
    ],
    fb: {
      ok: '75 es la demanda del T3: lo disponible (r₂ + producción) la cubre y deja r₃ para el T4.',
      mal: 'La capacidad es 40 y el inventario que inicia el T3 es r₂ (ya está a la izquierda). 75 es la demanda del T3.'
    }
  },

  {
    id: 'h7', tier: 'avanzado', caso: 'general', etiqueta: 'Inventario',
    chips: [
      { i: 'calendar', l: 'Meses', v: 'mar → abr' },
      { i: 'factory', l: 'Producción', v: '> demanda' },
      { i: 'box', l: 'Sobra', v: '→ abril' }
    ],
    pregunta: 'Una empresa produce en marzo más de lo que venderá ese mes, para usarlo en abril. En el balance de marzo, ¿qué término recoge esas unidades?',
    opciones: [
      { html: 'El inventario final de marzo', ok: true },
      { html: 'La demanda de abril', ok: false },
      { html: 'La capacidad de marzo', ok: false }
    ],
    fb: {
      ok: 'Se convierten en inventario final de marzo y pasan a abril como inventario anterior.',
      mal: 'La demanda de abril es un dato fijo del siguiente balance: lo producido de más vive en el inventario final de marzo.'
    }
  },

  /* ---------- RETO FINAL — mini caso integrado (ronda 8) ---------- */

  {
    id: 'f1', tier: 'final', caso: 'sailco', etiqueta: 'Caso integrador',
    chips: [
      { i: 'box', l: 'Inv. inicial', v: '10' },
      { i: 'truck', l: 'Demanda T1', v: '40' },
      { i: 'gear', l: 'Cap. regular', v: '40' },
      { i: 'coin', l: 'Regular / Extra', v: '$400 / $450' },
      { i: 'box', l: 'Almacenar', v: '$20/bote' }
    ],
    pregunta: 'Caso integrador — Trimestre 1 de Sailco. Variables: x₁ regular, y₁ extra, r₁ inventario final. ¿Cuál planteamiento del T1 es el correcto?',
    opciones: [
      {
        html: 'min Z = 400x₁ + 450y₁ + 20r₁<br><span class="f">x₁ + y₁ + 10 = 40 + r₁</span><span class="f">x₁ ≤ 40</span>',
        ok: true, largo: true
      },
      {
        html: 'max Z = 400x₁ + 450y₁<br><span class="f">x₁ + y₁ + 10 = 40 + r₁</span><span class="f">x₁ ≤ 40</span>',
        ok: false, largo: true
      },
      {
        html: 'min Z = 400x₁ + 450y₁ + 20r₁<br><span class="f">10 + 40 = x₁ + y₁ + r₁</span><span class="f">x₁ = 40</span>',
        ok: false, largo: true
      }
    ],
    fb: {
      ok: 'Los tres costos en el objetivo, el balance con inventario inicial y demanda, y la capacidad como tope. Modelo completo.',
      mal: 'Una opción maximiza y omite el $20 de inventario; otra fuerza x₁ = 40 y suma demanda con inventario inicial. Solo A plantea bien el T1.'
    }
  },

  {
    id: 'f2', tier: 'final', caso: 'acme', etiqueta: 'Caso integrador',
    chips: [
      { i: 'truck', l: 'Demanda M1', v: '100' },
      { i: 'coin', l: 'Producción', v: '$50/vent' },
      { i: 'box', l: 'Almacenar', v: '$8/vent·mes' },
      { i: 'gear', l: 'Capacidad', v: 'sin límite' }
    ],
    pregunta: 'Caso integrador — Mes 1 de Acme. Variables: x₁ ventanas producidas, r₁ en almacén al fin del mes. ¿Cuál planteamiento del mes 1 es el correcto?',
    opciones: [
      { html: 'min Z = 50x₁ + 8r₁<br><span class="f">x₁ = 100 + r₁</span>', ok: true, largo: true },
      { html: 'min Z = 50x₁<br><span class="f">x₁ = 100 − r₁</span>', ok: false, largo: true },
      { html: 'min Z = 50x₁ + 8r₁<br><span class="f">x₁ + r₁ = 100</span>', ok: false, largo: true }
    ],
    fb: {
      ok: 'Producir cuesta $50 por ventana, guardar r₁ cuesta $8, y la producción cubre la demanda 100 más lo almacenado.',
      mal: 'Una opción omite el costo de almacenar y resta el inventario; otra manda el almacén al lado equivocado. Producción = demanda + inventario final.'
    }
  }
];

/* Composición de una partida: 8 rondas muestreadas por nivel. */
window.PLAN_PARTIDA = [
  { tier: 'facil', n: 2 },
  { tier: 'medio', n: 3 },
  { tier: 'avanzado', n: 2 },
  { tier: 'final', n: 1 }
];
