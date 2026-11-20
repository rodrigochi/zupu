"""Exporta los datos de la página web estática.

Uso: web_export.py <carpeta_out> <carpeta_data_de_la_pagina> [--sin-nombres]

Por defecto incluye el nombre tal como figura en el padrón (en caracteres), una marca de
lectura dudosa y el número de imagen del expediente para enlazar el escaneo.
Con --sin-nombres deja solo el apellido (versión anónima).
"""
import json, re, shutil, sys
from pathlib import Path
import pandas as pd

src = Path(sys.argv[1])
dst = Path(sys.argv[2])
sin_nombres = '--sin-nombres' in sys.argv
dst.mkdir(parents=True, exist_ok=True)

o = pd.read_csv(src / 'electores.csv', dtype=str).fillna('')
# Lectura dudosa del nombre: carácter ilegible (□) o una nota de transcripción que lo menciona.
o['nombre_dudoso'] = (o.nombre.str.contains('□') | o.duda.str.contains('nombre', case=False)).map({True: '1', False: ''})
# Número de imagen del expediente: 033-020104-0091-084.jpg → 084
o['img'] = o.archivo.map(lambda a: (re.search(r'-(\d{3})\.jpg$', a) or [None, ''])[1])

CAMPOS = ['id', 'sede', 'sede_grafia', 'sede_estado', 'provincia_chile', 'localidad', 'localidad_nota', 'lat', 'lon',
          'apellido', 'apellido_canton', 'apellido_pinyin', 'sexo', 'edad',
          'origen_zh', 'origen_condado', 'origen_canton', 'origen_pinyin', 'origen_provincia',
          'ocupacion_resuelto', 'ocupacion_cat']
if not sin_nombres:
    CAMPOS += ['nombre', 'nombre_dudoso', 'folio', 'img']
filas = o[CAMPOS].to_dict(orient='records')
for r in filas:
    for k, v in r.items():
        if v == '':
            r[k] = None
if sin_nombres:
    assert 'nombre' not in CAMPOS
json.dump({'columnas': CAMPOS, 'filas': [[r[c] for c in CAMPOS] for r in filas]}, open(dst / 'padron.json', 'w'), ensure_ascii=False, separators=(',', ':'))
for f in ['apellidos_grafias.json', 'mapa_mundo.json', 'mapa_chile.json', 'mapa_delta.json', 'mapa_china.json']:
    shutil.copy(src / f, dst / f)
print(len(filas), 'con nombres' if not sin_nombres else 'sin nombres', int((o.nombre_dudoso == '1').sum()), 'nombres dudosos')
