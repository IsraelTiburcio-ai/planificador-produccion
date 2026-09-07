#!/usr/bin/env python3
"""QA ACADÉMICO — Compara la redacción del juego contra la pág. 37 del Gimnasio 2.
Uso: python3 qa/qa-academico.py  (desde la raíz del proyecto)"""
import re, unicodedata
import pymupdf

PDF = '/Users/israeltiburcio/Documents/Mac/Optimización 1 proyectos /GYM 2_251005_202412 (1).pdf'

def norm(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())

juego_raw = open('data.js', encoding='utf-8').read()
juego = norm(juego_raw)

doc = pymupdf.open(PDF)
p37 = norm(doc[36].get_text())

fallos = []
def afirmar(cond, msg):
    print(('  OK  ' if cond else '  ✗   ') + msg)
    if not cond: fallos.append(msg)

print('— Las 5 cajas del mapa manuscrito (pág. 37) presentes en el juego —')
CAJAS = {
  'Transformación de productos': ['transformaciondeproductos'],
  'Se manejan dos restr. (materia prima y producto)': ['dosrestricciones', 'materiaprima'],
  'Función objetivo maximizada': ['funcionobjetivomaximizada'],
  'Rest. Establecer el proceso de transformación': ['restriccion', 'establece', 'procesodetransformacion'],
  'Caso particular de planeación de producción': ['casoparticulardeplaneaciondeproduccion'],
}
for caja, claves in CAJAS.items():
    afirmar(all(k in juego for k in claves), f'caja reflejada: {caja}')

print('— Datos del ejemplo impreso (prob. 41) presentes en el juego y en la página —')
DATOS = ['guarapo', 'morena', 'melaza', 'glas', '4000', '03', '08', '095', '150', '200', '230', '35']
for d in DATOS:
    afirmar(d in juego, f'el juego usa el dato de la pág. 37: {d}')
    afirmar(d in p37, f'el dato {d} coincide con la página impresa')
afirmar('25 toneladas semanales' in juego_raw or '25 t/sem' in juego_raw, 'entrega mínima de 25 t (pág. 37) en el juego')

print('— La mecánica anterior no domina la partida (aclaración de la profesora) —')
# "min Z" solo puede vivir como distractor; jamás como respuesta correcta.
afirmar(not re.search(r"html:\s*'[^']*(min Z|balance|inventario|almacenamiento|tiempo extra)[^']*',\s*ok:\s*true", juego_raw, re.I),
        'ningún concepto de la mecánica anterior es respuesta CORRECTA')
for v in ['almacenamiento', 'tiempoextra', 'inventarioinicial', 'capacidadregular']:
    afirmar(v not in juego, f'concepto anterior retirado de la partida: "{v}"')
# Las menciones de "balance"/"inventario final"/"min Z" solo se permiten como distractores
opciones_ok_con_viejos = re.findall(r"html:\s*'([^']*(?:balance|inventario|min Z)[^']*)',\s*ok:\s*true", juego_raw, re.I)
afirmar(len(opciones_ok_con_viejos) == 0, 'ninguna respuesta CORRECTA depende de la mecánica anterior')
afirmar(juego.count('inventariofinal') <= 1, 'los inventarios solo sobreviven como pequeño contraste, no dominan')

print('— Enmarcado de preguntas en el esquema (sin ambigüedad) —')
# El problema impreso del ingeniero Dulce ES parte del esquema de la pág. 37:
# citarlo es un anclaje válido y sin ambigüedad.
marcadores = ['esquema', 'planteamiento', 'característica', 'de clase', 'profesora',
              'trabajado', 'presentadas', 'ingeniero dulce', 'azúcar', 'guarapo']
sin_marco = 0
for i, p in enumerate(re.findall(r"pregunta:\s*'(.+?)',", juego_raw, re.S), 1):
    if not any(m in p.lower() for m in marcadores):
        sin_marco += 1
        print(f'    sin enmarcar [reto {i}]: {p[:70]}…')
afirmar(sin_marco == 0, 'todas las preguntas quedan ancladas al esquema o a su ejemplo impreso')

print()
if fallos:
    print(f'QA ACADÉMICO: FAIL ({len(fallos)})')
    raise SystemExit(1)
print('QA ACADÉMICO: PASS — el juego prepara para llenar el cuadro de la pág. 37')
