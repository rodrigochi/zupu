# Plan de correcciones — `data/zupu.json`

**Fecha:** agosto 2026 · **Estado:** nada modificado todavía
**Fuentes cotejadas:**
- `files/250813.doc` — zupu de 长兴里, ~1943, 徐水莲书柬 (`ZUPU_1943`)
- `files/zupu_chi_compressed.pdf` — 徐氏族谱 2025, 50 páginas escaneadas (`ZUPU_2025`)
- `data/zupu.json` — 937 personas

Complementa a [`DIAGNOSTICO_ZUPU.md`](DIAGNOSTICO_ZUPU.md), que se escribió **antes** de tener
el zupu 2025. Donde ambos difieran, manda este documento.

---

## 1. Lo que resolvió el zupu 2025

El PDF no tiene capa de texto; se renderizaron las 50 páginas y se leyeron visualmente.

**Hallazgo metodológico clave:** la numeración 世 del zupu 2025 **coincide exactamente** con el
campo `gen_wuhua` de la base (敬先=九世=9, 文禄=10, 烈英=11, 星發=12, 富朝=13, 奕润=14,
世礼=15, 兆璋=16). Eso da una clave de cotejo fiable para toda la base.

La **página 42** es un resumen de la línea directa completa, y la 43–44 continúan hasta la
generación 兆. Con eso se pudo verificar tu linaje eslabón por eslabón.

### Tu línea directa: verificada

| Gen | Persona | Zupu 2025 (pág. 42–44) | Base de datos | ✓ |
|---|---|---|---|---|
| 9 | 敬先 | 张氏 · 6 hijos | igual | ✔ |
| 10 | 文禄 | 张氏 · 3 hijos | igual | ✔ |
| 11 | 烈英 | 李氏 · 2 hijos | igual | ✔ |
| 12 | **星發** | **赖氏 · 3 hijos** | **邱氏+赖氏 · 6 hijos** | ✘ |
| 13 | 富朝 | 詹氏 · 5 hijos | igual | ✔ |
| 14 | 奕润 | 吕氏 · 4 hijos | igual | ✔ |
| 15 | 世礼 | **谢氏** · 2 hijos | **sin esposa** · 2 hijos | ~ |
| 16 | 兆璋 | **何氏** · sin hijos listados | 何氏 + María Flores Nilo | ✔ |

**Los tres eslabones que el doc de 1943 no podía validar —奕润 → 世礼 → 兆璋— quedan
confirmados por el zupu 2025.** Tu abuelo aparece como 十六世徐兆璋, con esposa 何氏.

---

## 2. Correcciones confirmadas (no requieren decisión tuya)

Ordenadas por impacto. En todas, **ambas fuentes coinciden** o el error es interno de la base.

### C1 · 星發: quitarle 3 hijos y una esposa ⚠️ *tu línea directa*

El zupu 2025, página 42, es literal:

```
十二世徐星發  姚赖氏  所生三子   长富朝 次富国 三富业
十二世徐昌發  姚邱氏  所生三子   长富仁 次富義 三富礼
```

El doc de 1943 (línea 706–710) dice exactamente lo mismo. **No hay conflicto entre fuentes.**

La nota actual de la base —*"2ª esposa 邱氏 → 富仁, 富義, 富禮 (zupu 2025)"*— **atribuye al
zupu 2025 algo que el zupu 2025 no dice**. Es una mala lectura, no un choque de fuentes.

- Quitar de `PA12` (星發): hijos `N_X2350020161`, `N_X2350032681`, `N_X2350031150` y la esposa 邱氏.
- Conservar `D_FUREN` / `D_FUYI` / `D_FULI` bajo `PA12b` (昌發), que ya están bien.
- Corregir la nota de `PA12`.

### C2 · Rama 广州: 196 personas mal injertadas y con generaciones colapsadas

Es el error más grande de la base (21% del total).

| | Base de datos | Zupu 2025 |
|---|---|---|
| 鼎X (鼎瑛, 鼎琳…) | `gen_wuhua` 8, hijos de 春魁 | **九世** (=9) |
| X鳳 / X凰 (南鳳, 增凰…) | `gen_wuhua` 8, hijos de 春魁 | **十世** (=10) |

En el zupu, 鼎X y X鳳 son **generaciones consecutivas** (padre e hijo). La base las aplastó en
una sola (`gw`=8) y colgó las 50 de 春魁 como hermanas.

Y el eslabón que falta lo nombra el doc de 1943 (línea 206):

```
春魁之子捷焕移居本省广州府番禺县横江村住
```

**捷煥 no existe en la base.** Es justamente el emigrante a 番禺 — el ancestro de esta rama.

Corrección: crear 徐捷煥 (`gen_wuhua`=8, padre 春魁), reasignar 鼎X a `gw`=9 bajo 捷煥,
y X鳳 a `gw`=10 bajo su 鼎X correspondiente. **Ver decisión D1**: la asignación fina
padre→hijo dentro de la rama requiere una relectura dirigida de las páginas 27–34.

### C3 · 廷發: 32 hijos → 5

Doc 1943 (línea 731): `十二世长房祖徐廷发 配练氏 所生五子 长富灏 次富海 三富泽 四富浓 五富沧`.
Las notas del propio nodo ya admiten que el padre no está confirmado.

Los 27 sobrantes se reparten (tabla completa en `DIAGNOSTICO_ZUPU.md` §3.2): 來發, 開發, 才發,
鳳發, 元發, 閏發, 錦發, 超發, 欽發, 茂發. Corregir además `富路`→**富灏** y `富繞`→**富饶**.

### C4 · Colapso generacional en 敬信 y 文祐

- `D_BC_JIXIN` (敬信): 8 hijos, pero sus **propias notas dicen 4**. Los extra (京英, 立英,
  元英, 允英) son **nietos** vía 文彰 y 文光.
- `P155` (文祐): 9 hijos; el doc de 1943 le da 2 (華英, 旋英). Entre los sobrantes, 帝英
  pertenece a 文煋 y 多英 a 文郁.

### C5 · Duplicados por fusión de fuentes (~20 personas)

`ZUPU_1943` (479) y `ZUPU_2025` (434) se fusionaron sin deduplicar. Tres patrones:

1. **Duplicado exacto**: 富仁/富義/富禮 (ver C1).
2. **Desplazado una generación**: 康發/坤發/嶸發/經發 bajo 嵩英 existen en `gw`11 y `gw`12;
   先裕/先任/先倡 en `gw`12 y `gw`13. La copia correcta es la de `gw` mayor.
3. **Gemelos exactos**: 才發 (`X_CAIFA`/`X_CAIFA2`), 開發, 鳳發 — mismos padres, mismos hijos.

Tabla completa en `DIAGNOSTICO_ZUPU.md` §4.

### C6 · `children_ids` desincronizado (18 registros)

`children_ids` está documentado como campo derivado. Debe regenerarse siempre desde `pid`.
Casos: `PGRANDPA` declara 2 y tiene 5; `X_174017547` declara 4 y tiene 0; etc.

### C7 · Datos faltantes o erróneos en la línea directa

| Registro | Base | Zupu 2025 (pág. 43–44) |
|---|---|---|
| `PSHILI` (世礼) | sin esposa | **姚谢氏** |
| `PZHAOCONG` (兆琮) | 鐘氏 | **姚马氏** |
| `PGRANDPA` (兆璋) — nota | *"el zupu anota la esposa como 鍾氏"* | el zupu dice **何氏**, igual que el registro familiar |

La nota de `PGRANDPA` inventa un conflicto que no existe. El 钟氏 probablemente se leyó de la
columna vecina (兆秾 姚钟氏 está justo al lado en la página 44) — el mismo tipo de error
posicional que produjo los súper-nodos.

### C8 · Personas del zupu 2025 que faltan en la base

La sub-rama de 昌發 está incompleta: el zupu (pág. 40, 42) da hijos a 富仁/富義/富禮
(奕盛, 奕煥, 奕清, 奕元), pero en la base esos tres aparecen **sin descendencia** y los cuatro
奕X **no existen**.

### C9 · Adopciones: el zupu 2025 las marca explícitamente

Solo la página 44 contiene cuatro, escritas con 过继:

```
十六世徐兆誉 姚黄氏 所生四子
  长先勝  次嘉祯（过继给兆康） 三树祯（过继给兆鹰） 四富祯（过继给兆夔）
```

También 兆康, 兆鹰 y 兆夔 aparecen recibiendo a esos hijos, y 世裕 (pág. 43) tiene
`继子往台山狄海埠`. Sumado a los ~8 casos del doc de 1943, la base (4 flags `adopcion`)
los tiene claramente sub-registrados.

---

## 3. 🔴 Decisiones que necesito de ti

### D1 · Cómo tratar la rama de 广州 (196 personas)

Es la decisión de mayor impacto. Sé que el injerto actual está mal, pero reconstruir el
detalle padre→hijo dentro de la rama exige releer con lupa las páginas 27–34 del PDF.
Opciones:

- **(a)** Reconstruirla completa ahora: releo esas páginas y reasigno las 196 una por una.
  Es lo correcto, pero es el trabajo más largo del plan.
- **(b)** Arreglo mínimo ahora: creo 捷煥, cuelgo la rama entera de él con
  `dato_sospechoso`, y dejo la estructura interna para después. Rápido y honesto.
- **(c)** Aislarla: marcarla como rama no verificada y sacarla de la vista principal del
  sitio hasta reconstruirla.

### D2 · ¿Falta una generación entre 捷煥 y los 鼎X?

捷煥 emigró a 番禺 en el s. XVIII; los 鼎X del zupu son 九世. Si 捷煥 es 八世, encaja sin
huecos. Pero conviene confirmarlo: ¿tienes cómo preguntar a la rama de 广州, o alguna
página del zupu que yo no haya identificado que lo explicite?

### D3 · Qué hacer con lo que solo respalda la memoria familiar

El zupu 2025 registra a 兆璋 **sin hijos** (emigró en 1927; los compiladores no tenían datos).
Los 5 hijos que hay en la base vienen del registro familiar chileno. Propongo mantenerlos con
`provenance: FAMILIAR` y marcarlos visualmente distinto en el sitio — pero es tu llamada si
prefieres otro tratamiento.

### D4 · El carácter generacional 17: 祥 o 祯

El poema del doc de 1943 escribe **祥**, pero las personas reales de esa generación se llaman
**祯** en ambos zupus (潭祯, 杞祯 en 1943; 育祯, 務祯, 嘉祯, 树祯, 富祯, 良祯 en 2025).
¿Corrijo el poema a 祯, o lo dejo como está anotando la discrepancia?

### D5 · Modelo de adopción

Propongo añadir un campo `pid_adoptivo` + flag `adopcion` en el hijo, manteniendo `pid` como
el padre biológico, y que el sitio dibuje el vínculo adoptivo con línea punteada. Así 世滔,
世添 y 世恩 dejan de aparecer como ramas extintas. ¿Te sirve ese modelo?

### D6 · Personas que están en 1943 pero no en 2025

El zupu 2025 omite gente que el de 1943 sí registra (ramas que se fueron a 江西, 四川, 广西…).
¿Se conservan como están, o se marcan como "no confirmadas en la recompilación de 2025"?

---

## 4. Plan de ejecución

Cada fase deja la base en estado consistente; se puede parar entre fases.

### Fase 1 — Correcciones inequívocas (sin decisiones pendientes)

- [ ] **1.1** `PA12` 星發: quitar 3 hijos + esposa 邱氏; corregir nota. → C1
- [ ] **1.2** `PSHILI`: añadir esposa 谢氏. → C7
- [ ] **1.3** `PZHAOCONG`: corregir esposa 鐘氏 → 马氏. → C7
- [ ] **1.4** `PGRANDPA`: corregir la nota que inventa el conflicto 鍾氏/何氏. → C7
- [ ] **1.5** Regenerar `children_ids` desde `pid` en los 18 registros. → C6

### Fase 2 — Súper-nodos y colapso generacional

- [ ] **2.1** 廷發: reasignar 27 hijos; corregir 富路/富繞. → C3
- [ ] **2.2** 敬信: mover 4 nietos bajo 文彰 y 文光. → C4
- [ ] **2.3** 文祐: mover 帝英 → 文煋, 多英 → 文郁; revisar el resto. → C4
- [ ] **2.4** Rama 广州 — **bloqueada por D1 y D2**. → C2

### Fase 3 — Deduplicación

- [ ] **3.1** Eliminar duplicados desplazados de generación. → C5
- [ ] **3.2** Fusionar gemelos 才發 / 開發 / 鳳發 y sus hijos. → C5
- [ ] **3.3** Excluir del matching los nombres-marcador `亞X` (18) y los homónimos
      legítimos (2× 長發, 2× 錦發) antes de cualquier dedup automático.

### Fase 4 — Modelo de datos y datos faltantes

- [ ] **4.1** Añadir `pid_adoptivo` y poblar los casos de 1943 + 2025 — **depende de D5**. → C9
- [ ] **4.2** Añadir 奕盛/奕煥/奕清/奕元 y sus vínculos con 富仁/富義/富禮. → C8
- [ ] **4.3** Separar alias fusionados del campo `zh` (徐法興/榮直, 徐依召/榮華…).
- [ ] **4.4** Campo `hijos_declarados` para los casos "declara N, documenta M".

### Fase 5 — Validadores permanentes

- [ ] **5.1** `children_ids` ≠ hijos reales por `pid`
- [ ] **5.2** `gen_wuhua` hijo ≠ `gen_wuhua` padre + 1
- [ ] **5.3** Nodo con > 8 hijos (el máximo real documentado es 捷元 con 8)
- [ ] **5.4** Nº de hijos ≠ número declarado en las propias `notes` *(esta regla detectó a 敬信)*
- [ ] **5.5** Mismo `zh` + mismo nombre de padre + distinto `gen_wuhua` → duplicado desplazado

---

## 5. Lo que sigue sin resolverse

- **Tu padre y tú no están en el zupu 2025.** Termina en 兆璋; la generación 17 (祯) del zupu
  son sus primos, no su hijo. La rama chilena solo la respalda el registro familiar.
- **Las 12 contradicciones internas del doc de 1943** (`DIAGNOSTICO_ZUPU.md` §8) siguen abiertas;
  el zupu 2025 no cubre esos tramos con suficiente detalle para arbitrarlas.
- **El carácter nº 2 del poema generacional** (posición de 徐富) sigue sin aclararse.

---

## 6. Anexo — método

El PDF (23 MB, 50 pág., producido con iLovePDF desde `徐氏族谱-1.cdr`) **no tiene capa de texto**:
`get_text()` devuelve 0 caracteres en todas las páginas. Se renderizó a PNG a 150 dpi con
PyMuPDF y se leyó visualmente, recortando y ampliando las regiones críticas.

No se usó OCR de forma deliberada: en genealogía un carácter mal leído no es una errata sino
otra persona, y varias distinciones de este archivo (何氏/钟氏, 祥/祯, 富灏/富路) se juegan en
uno o dos trazos.

Páginas más útiles: **42** (resumen de la línea directa 9世→14世), **43** (15世, generación 世),
**44** (16世, generación 兆, con las adopciones marcadas), **45–47** (17–19世).
