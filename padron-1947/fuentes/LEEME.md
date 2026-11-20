# Scripts que generaron los datos

Referencia para regenerar `data/` si se corrige la transcripción. Requieren Python 3 con pandas, shapely, pypinyin, pycantonese y opencc-python-reimplemented.

1. `limpiar.py padron_chile.xlsx out/electores.csv`: normaliza el Excel del padrón (sedes, localidades, condados, oficios, apellidos). Este CSV intermedio sí contiene nombres: no publicarlo.
2. `mapas.py <carpeta_geo> out/`: simplifica los límites (necesita los GeoJSON de origen descargados en `<carpeta_geo>`).
3. `grafias.py`: arma `apellidos_grafias.json` (pronunciaciones y cotejo con el cuadro de Kam-Ching Zambrano). Necesita el diccionario hakka `dict-hakka.json` de g0v/moedict-data-hakka.
4. `web_export.py out/ data/ [--sin-nombres]`: exporta los JSON de la página; por defecto con nombres, marca de lectura dudosa e imagen.

Las rutas dentro de los scripts corresponden a la carpeta de trabajo donde se generaron; ajústalas antes de usarlos.
