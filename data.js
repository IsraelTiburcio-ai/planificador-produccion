/* ============================================================
   PLANIFICADOR DE PRODUCCIÓN — Banco académico (CORREGIDO)
   Objetivo real (aclaración de la profesora):
   "Es para las características de planeación de producción.
    Es para que llenen las características."

   Fuente de verdad: Gimnasio 2. Modelos de Programación Lineal,
   Optimización I — PÁGINA 37, mapa manuscrito:
   Centro: "Planteamiento de Proceso de Producción"
   Cajas alrededor:
   1. "Transformación de Productos"
   2. "Se manejan dos restr. (materia prima y producto)"
   3. "Función objetivo maximizada"
   4. "Rest. Establecer el proceso de transformación"
   5. "Caso particular de planeación de Producción"
   Ejemplo impreso de la misma página (prob. 41, ingeniero Dulce):
   guarapo (4000 t semanales) → azúcar morena (0.3 t/t) y melaza
   (0.1 t/t) → azúcar blanca (1 t morena → 0.8 t) → azúcar glas
   (0.95); utilidades $150, $200, $230 y $35 por tonelada;
   entrega mínima 25 t semanales por clase.
   Sailco (prob. 42) es el CASO PARTICULAR de planeación.
   ============================================================ */
'use strict';

/* Orden FIJO de estaciones de la línea de producción
   (orden de lectura del cuadro, pág. 37 — redacción literal) */
window.ESTACIONES = [
  { car: 'transformacion', corto: 'Transformación', nombre: 'Transformación de productos' },
  { car: 'restricciones',  corto: 'Materia prima y producto', nombre: 'Se manejan dos restricciones (materia prima y producto)' },
  { car: 'objetivo',       corto: 'Función objetivo', nombre: 'Función objetivo maximizada' },
  { car: 'planeacion',     corto: 'Caso particular', nombre: 'Caso particular de planeación de producción' },
  { car: 'proceso',        corto: 'Proceso de transformación', nombre: 'Restricciones: establecer el proceso de transformación' }
];

window.BANCO = [

  /* ════════ ESTACIÓN 1 · TRANSFORMACIÓN DE PRODUCTOS ════════ */

  {
    id: 't1', car: 'transformacion', etiqueta: 'Transformación',
    chips: [
      { i: 'factory', l: 'Planteamiento', v: 'proceso de producción' },
      { i: 'box', l: 'Entrada', v: 'materia prima' },
      { i: 'bolt', l: 'Salida', v: 'productos' }
    ],
    pregunta: 'Según el esquema trabajado en clase, ¿qué caracteriza principalmente a un <b>planteamiento de proceso de producción</b>?',
    opciones: [
      { html: 'La transformación de productos', ok: true },
      { html: 'La representación exclusiva de inventarios', ok: false },
      { html: 'La búsqueda de regiones factibles con el método gráfico', ok: false }
    ],
    fb: {
      ok: 'El centro del esquema es la transformación: la materia prima se convierte en productos.',
      mal: 'Ni inventarios ni método gráfico: la característica principal es la transformación de productos.'
    }
  },

  {
    id: 't2', car: 'transformacion', etiqueta: 'Transformación',
    chips: [
      { i: 'box', l: 'Guarapo', v: '4000 t/sem' },
      { i: 'factory', l: 'Produce', v: 'azúcares y melaza' },
      { i: 'coin', l: 'Utilidades', v: '$35–$230/t' }
    ],
    pregunta: 'En el problema del ingeniero Dulce, el guarapo concentrado se convierte en azúcar morena y melaza. Dentro del esquema, ese paso de insumos a productos se describe como…',
    opciones: [
      { html: 'Análisis de sensibilidad del modelo', ok: false },
      { html: 'Transformación de productos', ok: true },
      { html: 'Obtención de la solución dual', ok: false }
    ],
    fb: {
      ok: 'Eso es transformación de productos: procesos que cambian la materia prima en productos con valor.',
      mal: 'El paso de guarapo a azúcares es la transformación de productos, característica central del esquema.'
    }
  },

  {
    id: 't3', car: 'transformacion', etiqueta: 'Transformación',
    chips: [
      { i: 'box', l: 'Insumo', v: 'materia prima' },
      { i: 'factory', l: 'Procesos', v: 'definidos' },
      { i: 'bolt', l: 'Resultado', v: 'productos' }
    ],
    pregunta: '¿Cuál de estas situaciones corresponde a un planteamiento de proceso de producción?',
    opciones: [
      { html: 'Convertir guarapo en azúcar glas mediante un proceso de molienda', ok: true },
      { html: 'Clasificar los vértices de la región factible con el método gráfico', ok: false },
      { html: 'Pronosticar la demanda del siguiente mes con promedios', ok: false }
    ],
    fb: {
      ok: 'Convertir un insumo mediante procesos (molienda) en un producto es transformación de productos.',
      mal: 'Vértices y pronósticos son otras técnicas: aquí lo central es transformar insumos en productos.'
    }
  },

  {
    id: 't4', car: 'transformacion', etiqueta: 'Transformación',
    chips: [
      { i: 'box', l: 'Materia prima', v: 'entra' },
      { i: 'factory', l: 'Proceso', v: '¿?' },
      { i: 'bolt', l: 'Producto', v: 'sale' }
    ],
    pregunta: 'Entre la materia prima y el producto terminado, ¿qué ocurre en este tipo de planteamiento?',
    opciones: [
      { html: 'Se realiza una transformación mediante procesos de producción', ok: true },
      { html: 'Solo se trasladan de un almacén a otro', ok: false },
      { html: 'Se comparan costos fijos y variables del periodo', ok: false }
    ],
    fb: {
      ok: 'La materia prima entra a procesos de producción y sale transformada como producto.',
      mal: 'No es solo traslado ni comparación de costos: ocurre una transformación dentro del proceso.'
    }
  },

  /* ════════ ESTACIÓN 2 · DOS RESTRICCIONES: MATERIA PRIMA Y PRODUCTO ════════ */

  {
    id: 'r1', car: 'restricciones', etiqueta: 'Restricciones',
    chips: [
      { i: 'box', l: 'Insumo', v: 'disponible' },
      { i: 'bolt', l: 'Entrega', v: 'mínima' },
      { i: 'factory', l: 'Esquema', v: 'de clase' }
    ],
    pregunta: 'De acuerdo con las características presentadas, ¿qué elementos se manejan como las <b>dos restricciones</b> del planteamiento de proceso de producción?',
    opciones: [
      { html: 'Materia prima y producto', ok: true },
      { html: 'Capacidad e inventario', ok: false },
      { html: 'Demanda y costos', ok: false }
    ],
    fb: {
      ok: 'El esquema lo indica: las dos restricciones son materia prima y producto.',
      mal: 'Capacidad, inventario, demanda y costos son de otros modelos: aquí son materia prima y producto.'
    }
  },

  {
    id: 'r2', car: 'restricciones', etiqueta: 'Restricciones',
    chips: [
      { i: 'box', l: 'Guarapo', v: '4000 t/sem' },
      { i: 'factory', l: 'Rinde', v: '0.3 t morena' },
      { i: 'coin', l: 'Uso', v: 'restricción' }
    ],
    pregunta: 'En el problema del ingeniero Dulce, la compra de 4000 toneladas semanales de guarapo se incorpora al modelo como…',
    opciones: [
      { html: 'Una variable de decisión libre', ok: false },
      { html: 'Una restricción de materia prima', ok: true },
      { html: 'La función objetivo del modelo', ok: false }
    ],
    fb: {
      ok: 'La disponibilidad de guarapo limita cuánto se puede transformar: es la restricción de materia prima.',
      mal: 'El guarapo disponible no se decide ni se maximiza: limita el proceso como restricción de materia prima.'
    }
  },

  {
    id: 'r3', car: 'restricciones', etiqueta: 'Restricciones',
    chips: [
      { i: 'bolt', l: 'Entrega', v: '≥ 25 t/sem' },
      { i: 'factory', l: 'Tipos', v: 'morena, blanca, glas, melaza' },
      { i: 'box', l: 'Restricción', v: '¿?' }
    ],
    pregunta: 'La empresa debe entregar al menos 25 toneladas semanales de cada clase de azúcar. Esa condición corresponde a la restricción de…',
    opciones: [
      { html: 'Producto', ok: true },
      { html: 'Materia prima', ok: false },
      { html: 'Función objetivo', ok: false }
    ],
    fb: {
      ok: 'Lo que se debe entregar del producto terminado forma la restricción de producto.',
      mal: 'No limita el insumo ni es el objetivo: exigir la entrega mínima es la restricción de producto.'
    }
  },

  {
    id: 'r4', car: 'restricciones', etiqueta: 'Restricciones',
    chips: [
      { i: 'factory', l: 'Esquema', v: '2 restricciones' },
      { i: 'box', l: 'Rest. 1', v: 'materia prima' },
      { i: 'bolt', l: 'Rest. 2', v: 'producto' }
    ],
    pregunta: 'Completa la característica del esquema: "Se manejan dos restricciones (____)".',
    opciones: [
      { html: 'Tiempo de cómputo y memoria', ok: false },
      { html: 'Materia prima y producto', ok: true },
      { html: 'Oferta y demanda del mercado', ok: false }
    ],
    fb: {
      ok: 'Así reza la característica: las dos restricciones son materia prima y producto.',
      mal: 'La pareja correcta del esquema es materia prima y producto; el resto pertenece a otros modelos.'
    }
  },

  /* ════════ ESTACIÓN 3 · FUNCIÓN OBJETIVO MAXIMIZADA ════════ */

  {
    id: 'o1', car: 'objetivo', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'Utilidades', v: 'por tonelada' },
      { i: 'factory', l: 'Planteamiento', v: 'de clase' },
      { i: 'calendar', l: 'Dirección', v: '¿?' }
    ],
    pregunta: 'Según las características del esquema trabajado, ¿cómo se plantea la <b>función objetivo</b> en este proceso de producción?',
    opciones: [
      { html: 'Maximizada', ok: true },
      { html: 'Siempre minimizada', ok: false },
      { html: 'El modelo prescinde de función objetivo', ok: false }
    ],
    fb: {
      ok: 'La característica es clara: en este planteamiento la función objetivo se maximiza.',
      mal: 'En el esquema de la clase la función objetivo es maximizada, no minimizada y jamás ausente.'
    }
  },

  {
    id: 'o2', car: 'objetivo', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'Utilidades/t', v: '$150 · $200 · $230 · $35' },
      { i: 'factory', l: 'Azúcares', v: 'x₁…x₄' },
      { i: 'bolt', l: 'Meta', v: 'utilidad' }
    ],
    pregunta: 'Cada tonelada deja utilidades de $150 (morena), $200 (blanca), $230 (glas) y $35 (melaza). ¿Cuál función objetivo corresponde a este planteamiento?',
    opciones: [
      { html: 'max Z = 150x₁ + 200x₂ + 230x₃ + 35x₄', ok: true },
      { html: 'min Z = 150x₁ + 200x₂ + 230x₃ + 35x₄', ok: false },
      { html: 'max Z = x₁ + x₂ + x₃ + x₄', ok: false }
    ],
    fb: {
      ok: 'Las utilidades se maximizan con sus valores por tonelada: max Z = 150x₁ + 200x₂ + 230x₃ + 35x₄.',
      mal: 'Ignorar las utilidades o cambiar max por min contradice la característica: función objetivo maximizada.'
    }
  },

  {
    id: 'o3', car: 'objetivo', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'max Z', v: 'utilidades' },
      { i: 'factory', l: 'Sentido', v: '¿?' },
      { i: 'bolt', l: 'Restricciones', v: 's.a' }
    ],
    pregunta: '¿Qué significa que la función objetivo esté <b>maximizada</b> en este planteamiento?',
    opciones: [
      { html: 'Que todas las variables tomen su mayor valor posible', ok: false },
      { html: 'Que las restricciones se conviertan en máximos', ok: false },
      { html: 'Que el modelo busca el mayor valor de Z, por ejemplo la utilidad total', ok: true }
    ],
    fb: {
      ok: 'Maximizar es buscar el mayor valor de Z (aquí, las utilidades), respetando las restricciones.',
      mal: 'No es agrandar variables ni restricciones: es hallar el mayor valor posible de la función Z.'
    }
  },

  {
    id: 'o4', car: 'objetivo', etiqueta: 'Función objetivo',
    chips: [
      { i: 'coin', l: 'Dirección', v: '¿max o min?' },
      { i: 'factory', l: 'Modelo', v: 'de producción' },
      { i: 'calendar', l: 'Esquema', v: 'de clase' }
    ],
    pregunta: 'En un modelo escrito de este tipo de planteamiento, ¿qué encabezado corresponde a la función objetivo?',
    opciones: [
      { html: 's.a (sujeto a)', ok: false },
      { html: 'min Z', ok: false },
      { html: 'max Z', ok: true }
    ],
    fb: {
      ok: 'La función objetivo maximizada se encabeza con max Z; el "s.a" introduce las restricciones.',
      mal: 's.a solo anuncia las restricciones y min Z contradice el esquema: aquí es max Z.'
    }
  },

  /* ════════ ESTACIÓN 4 · LA RESTRICCIÓN ESTABLECE EL PROCESO DE TRANSFORMACIÓN ════════ */

  {
    id: 'p1', car: 'proceso', etiqueta: 'Proceso de transformación',
    chips: [
      { i: 'box', l: 'Insumos', v: '→' },
      { i: 'factory', l: 'Elemento', v: '¿?' },
      { i: 'bolt', l: 'Productos', v: '→' }
    ],
    pregunta: 'Dentro de este tipo de planteamiento, ¿qué elemento expresa matemáticamente <b>cómo se realiza la transformación</b>?',
    opciones: [
      { html: 'La restricción', ok: true },
      { html: 'El valor óptimo final de Z', ok: false },
      { html: 'La región gráfica del modelo', ok: false }
    ],
    fb: {
      ok: 'Según el esquema: la restricción es la que establece el proceso de transformación.',
      mal: 'Ni el valor óptimo ni la región: el papel de la restricción es fijar cómo se transforma.'
    }
  },

  {
    id: 'p2', car: 'proceso', etiqueta: 'Proceso de transformación',
    chips: [
      { i: 'box', l: '1 t guarapo', v: '→ 0.3 t morena' },
      { i: 'box', l: '1 t morena', v: '→ 0.8 t blanca' },
      { i: 'factory', l: 'Rendimiento', v: 'coeficientes' }
    ],
    pregunta: "En el modelo del ingeniero Dulce, la frase 'una tonelada de guarapo produce 0.3 toneladas de azúcar morena' entra al modelo como…",
    opciones: [
      { html: 'Coeficientes dentro de la restricción de transformación', ok: true },
      { html: 'La solución óptima del problema', ok: false },
      { html: 'Un costo sombra del modelo dual', ok: false }
    ],
    fb: {
      ok: 'Los rendimientos (0.3, 0.8, 0.95) viven en la restricción: ahí queda descrita la transformación.',
      mal: 'La receta de transformación no es la solución ni parte del dual: son coeficientes de la restricción.'
    }
  },

  {
    id: 'p3', car: 'proceso', etiqueta: 'Proceso de transformación',
    chips: [
      { i: 'factory', l: 'Restricciones', v: 'materia prima y producto' },
      { i: 'box', l: 'Describen', v: '¿?' },
      { i: 'bolt', l: 'Del insumo', v: 'al producto' }
    ],
    pregunta: 'De acuerdo con las características presentadas, ¿cuál es el papel de las restricciones en este planteamiento?',
    opciones: [
      { html: 'Determinar el método gráfico con el que se resolverá', ok: false },
      { html: 'Establecer el proceso de transformación de insumos a productos', ok: true },
      { html: 'Fijar los precios sombra de las variables duales', ok: false }
    ],
    fb: {
      ok: 'Esa es la característica del esquema: la restricción establece el proceso de transformación.',
      mal: 'Método gráfico y duales son otros temas: aquí las restricciones describen la transformación.'
    }
  },

  {
    id: 'p4', car: 'proceso', etiqueta: 'Proceso de transformación',
    chips: [
      { i: 'box', l: 'Guarapo', v: '4000 t' },
      { i: 'factory', l: '0.3 t/t', v: 'azúcar morena' },
      { i: 'bolt', l: '25 t/sem', v: 'por azúcar' }
    ],
    pregunta: 'En el modelo del ingeniero Dulce, la igualdad o desigualdad que une guarapo, azúcares y sus rendimientos cumple el papel de…',
    opciones: [
      { html: 'Contar las variables del modelo', ok: false },
      { html: 'Expresar la transformación que impone el proceso productivo', ok: true },
      { html: 'Registrar el inventario final de cada periodo', ok: false }
    ],
    fb: {
      ok: 'Esa relación insumos-rendimientos-productos es la restricción que describe la transformación.',
      mal: 'No cuenta variables ni inventarios: esa ecuación expresa la transformación del proceso.'
    }
  },

  /* ════════ ESTACIÓN 5 · CASO PARTICULAR DE PLANEACIÓN DE PRODUCCIÓN ════════ */

  {
    id: 'c1', car: 'planeacion', etiqueta: 'Caso particular',
    chips: [
      { i: 'factory', l: 'Esquema', v: 'de la clase' },
      { i: 'calendar', l: 'Conexión', v: '¿?' },
      { i: 'box', l: 'Sailco', v: '4 trimestres' }
    ],
    pregunta: 'En el esquema trabajado, la <b>planeación de producción</b> se presenta como…',
    opciones: [
      { html: 'Un método para resolver gráficamente cualquier P.L.', ok: false },
      { html: 'Una técnica independiente de los modelos de producción', ok: false },
      { html: 'Un caso particular del planteamiento de proceso de producción', ok: true }
    ],
    fb: {
      ok: 'Así está en el cuadro: la planeación de producción es un caso particular del esquema.',
      mal: 'No es un método gráfico ni algo independiente: es un caso particular del esquema central.'
    }
  },

  {
    id: 'c2', car: 'planeacion', etiqueta: 'Caso particular',
    chips: [
      { i: 'factory', l: 'Sailco', v: 'botes por trimestre' },
      { i: 'calendar', l: 'Demandas', v: '40·60·75·25' },
      { i: 'coin', l: 'Meta', v: 'min Z costos' }
    ],
    pregunta: 'Sailco decide cuántos botes producir en cada trimestre para cubrir su demanda con producción e inventario. Dentro del esquema de la profesora, ese tipo de modelo es…',
    opciones: [
      { html: 'La restricción de materia prima del esquema', ok: false },
      { html: 'El caso particular de planeación de producción', ok: true },
      { html: 'Un ejemplo de función objetivo maximizada', ok: false }
    ],
    fb: {
      ok: 'Sailco es justamente el caso particular de planeación de producción del cuadro.',
      mal: 'Sailco no ilustra las restricciones ni la maximización: ilustra el caso particular de planeación.'
    }
  },

  {
    id: 'c3', car: 'planeacion', etiqueta: 'Caso particular',
    chips: [
      { i: 'factory', l: 'Proceso de producción', v: 'general' },
      { i: 'box', l: 'Planeación', v: 'producción' },
      { i: 'bolt', l: 'Relación', v: '¿?' }
    ],
    pregunta: '¿Qué relación guardan el planteamiento de proceso de producción y la planeación de producción según el esquema?',
    opciones: [
      { html: 'Son conceptos que no se relacionan entre sí', ok: false },
      { html: 'El proceso de producción es un caso particular de la planeación', ok: false },
      { html: 'La planeación de producción es un caso particular del proceso de producción', ok: true }
    ],
    fb: {
      ok: 'La flecha del cuadro va del caso hacia el esquema: la planeación es el caso particular.',
      mal: 'La dirección importa: el caso particular es la planeación de producción, no al revés.'
    }
  },

  {
    id: 'c4', car: 'planeacion', etiqueta: 'Caso particular',
    chips: [
      { i: 'factory', l: 'Cuadro', v: 'de la profesora' },
      { i: 'calendar', l: 'Caja inferior', v: '¿?' },
      { i: 'box', l: 'Centro', v: 'proceso de producción' }
    ],
    pregunta: 'Al llenar el cuadro cuyo centro es "Planteamiento de Proceso de Producción", la caja inferior izquierda corresponde a…',
    opciones: [
      { html: 'La teoría de dualidad', ok: false },
      { html: 'El método de la M grande', ok: false },
      { html: 'El caso particular de planeación de producción', ok: true }
    ],
    fb: {
      ok: 'Esa caja del cuadro es el caso particular de planeación de producción.',
      mal: 'Dualidad y M grande no están en el cuadro: esa caja es la planeación de producción como caso particular.'
    }
  }
];

/* ════════ RETO FINAL · Memoria del cuadro ════════
   5 correctas del mapa de la pág. 37 + distractores plausibles de P.L. */
window.RETO_FINAL = {
  titulo: 'PLANTEAMIENTO DE PROCESO DE PRODUCCIÓN',
  instrucciones: 'El cuadro trae exactamente 5: selecciónalas.',
  correctas: [
    'Transformación de productos',
    'Se manejan dos restricciones (materia prima y producto)',
    'Función objetivo maximizada',
    'Caso particular de planeación de producción',
    'Restricciones: establecer el proceso de transformación'
  ],
  distractores: [
    'Minimizar el costo de inventario entre periodos',
    'Región factible y vértices del polígono',
    'Balance de inventario de cada trimestre'
  ]
};
