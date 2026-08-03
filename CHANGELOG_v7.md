# Changelog · `data/zupu_v7.json`

Derivado de `v6`. **913 personas · 33 generaciones** (gen 1–33).

## 兆璋

- `PGRANDPA` 兆璋: la esposa china es **何氏** (registro familiar), confirmado por ti. El 鍾氏 de la transcripción 2025 se explica por contaminación con la columna vecina (兆穠 妣鍾氏). Se retira el flag `dato_sospechoso` y se documenta en ES e EN.

## Modelo de adopción

- Modelo de adopción **invertido**: el árbol (`pid`) cuelga ahora del padre **adoptivo**, que es la sucesión que un zupu considera vinculante. El padre biológico va en el nuevo campo `pid_biologico` y se explica en `notes`/`notes_eng`. No se dibujan dos padres.
- Los 7 casos: 兆彬: árbol←世滔, biológico=世豪; 兆椿: árbol←世添, biológico=世豪; 兆沂: árbol←世恩, biológico=世豪; 來發: árbol←浚英, biológico=日英; 嘉禎: árbol←兆康, biológico=兆譽; 樹禎: árbol←兆鷹, biológico=兆譽; 富禎: árbol←兆夔, biológico=兆譽.

## Nodos nuevos

- Completados los **5 nodos nuevos** (捷煥, 捷煌, 捷輝, 捷炳, 閏發) con todos los campos que usa el sitio: `py`, `py_plain`, `zh_simp`, `zh_traditional`, `story_spa`, `story_eng` y `notes_eng`. Antes les faltaban y habrían aparecido en blanco.

## Traducciones y simplificado

- `zh_simp` recalculado desde `zh` con **OpenCC (t2s)** en los 913 nodos: 0 estaban vacíos y 210 quedaron corregidos o completados. Antes se usaba una tabla manual parcial, que dejaba caracteres tradicionales sin convertir (彥, 閏, 煥…). Ahora la equivalencia tradicional↔simplificado es completa.
- ⚠️ Quedan **50** personas con `notes` en español pero sin `notes_eng`. El sitio ya cae al español cuando falta la traducción, así que no se rompe nada.

## Validación

- Personas: **913**
- Generaciones distintas: **33**
- Raíces: 1 · Ciclos: ninguno
- Referencias colgantes: 0
- Saltos de generación: 0
- Sin `zh_simp`: 0
- Sin `story_spa`: 864
- Con `notes` pero sin `notes_eng`: 50
