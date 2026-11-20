"""Exporta los datos de la página web estática, sin nombres de personas."""
import json, shutil, sys
from pathlib import Path
import pandas as pd

src = Path(sys.argv[1])      # carpeta con electores.csv, apellidos_grafias.json y mapas
dst = Path(sys.argv[2])      # carpeta data/ de la página
dst.mkdir(parents=True, exist_ok=True)

o = pd.read_csv(src / 'electores.csv', dtype=str).fillna('')
CAMPOS = ['id', 'sede', 'sede_grafia', 'sede_estado', 'provincia_chile', 'localidad', 'localidad_nota', 'lat', 'lon',
          'apellido', 'apellido_canton', 'apellido_pinyin', 'sexo', 'edad',
          'origen_zh', 'origen_condado', 'origen_canton', 'origen_pinyin', 'origen_provincia',
          'ocupacion_resuelto', 'ocupacion_cat']
filas = o[CAMPOS].to_dict(orient='records')
for r in filas:
    for k, v in r.items():
        if v == '':
            r[k] = None
assert not any('nombre' in k for k in filas[0]), 'no deben ir nombres'
json.dump({'columnas': CAMPOS, 'filas': [[r[c] for c in CAMPOS] for r in filas]}, open(dst / 'padron.json', 'w'), ensure_ascii=False, separators=(',', ':'))
for f in ['apellidos_grafias.json', 'mapa_mundo.json', 'mapa_chile.json', 'mapa_delta.json', 'mapa_china.json']:
    shutil.copy(src / f, dst / f)
print(len(filas), sorted(p.name for p in dst.iterdir()))
