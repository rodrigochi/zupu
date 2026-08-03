# Diagnóstico: `data/zupu.json` vs. zupu de 长兴里 (1943)

**Fecha:** agosto 2026 · **Estado:** solo diagnóstico, no se modificó nada
**Fuente contrastada:** `files/250813.doc` — 共和泮坑长兴里《徐氏族谱·万世始祖源流簿》, 徐水莲书柬
**Base contrastada:** `data/zupu.json` (937 personas)

---

## 1. Resumen ejecutivo

La estructura troncal de la base es **correcta**: la línea directa 廿九郎公 → … → 兆璋 coincide
generación por generación con el documento, y no hay nodos huérfanos ni `pid` rotos.

Los problemas se concentran en las **ramas colaterales** y tienen tres causas mecánicas:

| # | Causa | Efecto | Personas afectadas |
|---|---|---|---|
| A | Injerto de una rama completa en el nodo equivocado | 春魁 con 50 hijos | **196** (21% de la base) |
| B | Nodo "vertedero" para gente sin padre resuelto | 廷發 con 32 hijos | ~27 |
| C | Fusión de dos fuentes (1943 + 2025) sin deduplicar | personas repetidas | ~20 |

Además: **colapso generacional** (nietos colgados como hijos) en al menos 3 nodos, y
**adopciones sub-registradas** (el doc tiene ~8 casos; la base marca 4).

> **Advertencia importante:** el documento de 1943 **también tiene errores internos** y
> contradicciones consigo mismo (sección 8). No debe importarse a ciegas.

---

## 2. Alcance del documento — qué cubre y qué no

El `.doc` es el zupu de **长兴里**, compilado hacia 1943–44 (menciona 中日抗战 y 民国卅二年;
lo firma 兆沂 a sus 70 años). Su propósito es documentar **la rama del compilador**, no la tuya.

**Consecuencia crítica para el cotejo:**

- Tu línea aparece **solo hasta 富朝** (粘坑 13世). Búsqueda literal en el documento:
  - `奕润` → **0 apariciones**
  - `世礼` → **0 apariciones**
  - `兆璋` → **0 apariciones**
- Las generaciones profundas del doc (14–17世: 奕芳 → 世滔/世豪/世添/世恩 → 兆彬/兆廷/兆椿/兆沂 → X祯)
  pertenecen a la rama **文禧 → 日英**, que es la del compilador.
- Tu rama es **文禄 → 烈英 → 星发 → 富朝**, hermana de esa.

**Por lo tanto:** este documento **no puede validar** 奕润, 世礼 ni 兆璋. Esos tres eslabones
descansan únicamente en el zupu de 2025 y la memoria familiar. Si quieres verificarlos hace
falta otra fuente.

### Equivalencia de numeración

El doc usa **dos** numeraciones y las mezcla sin avisar:

| Numeración | 1世 | Campo equivalente en la base |
|---|---|---|
| 长乐开基 | 徐真人公 | `gen` − 10 |
| 粘坑开基 | 徐仲礼 | **`gen_wuhua`** ✔ |

`gen_wuhua` calza exactamente con la numeración 粘坑 del doc (仲礼: `gen`=13, `gen_wuhua`=1).
**Usar `gen_wuhua` como clave de cotejo.**

### Poema generacional (líneas 31–33)

```
仲 ? 玉 明 君 达 德 捷
敬 文 英 发 富 奕 世 兆
祥
```

La segunda línea calza perfecto: 敬先(9) 文禄(10) 烈英(11) 星发(12) 富朝(13) 奕润(14) 世礼(15) 兆璋(16).
Dos observaciones:

- El carácter en posición 2 se extrajo como `英`, pero la persona real es 徐**富** (2世).
  `富` reaparece en posición 13. **Revisar el original en papel** — probablemente sea otro carácter.
- La posición 17 dice `祥`, pero los nombres reales de esa generación en el doc usan **`祯`**
  (潭祯, 杞祯, 南祯, 彩祯). Verificar si es variante de copia.
- **La rama de Chile abandona el poema**: tras 兆璋(16) correspondería `祥/祯`, pero tu padre es
  徐**捷**武 — y `捷` es el carácter de la generación 8. No es un error de la base, pero conviene
  dejarlo anotado para que nadie lo "corrija".

---

## 3. 🔴 P1 — Súper-nodos (errores estructurales graves)

### 3.1 徐春魁 `X_CHUNKUI` — 50 hijos, **196 descendientes**

**El error más grave de la base.**

- **Doc (línea 206):** `春魁之子捷焕移居本省广州府番禺县横江村住` → **un solo hijo: 捷煥**,
  que emigró a 番禺 (Guangzhou).
- **Base:** 50 hijos directos, y **捷煥 no existe en la base**.
- Los 50 hijos son *todos* `branch: guangzhou`, `provenance: ZUPU_2025`, prefijo `G_`.
- El subárbol completo son **196 personas = exactamente el total de `branch: guangzhou`**.
- Ninguno sigue el carácter generacional `捷` (son 鼎X y X鳳/X凰).

**Diagnóstico:** la rama entera de 广州 del zupu 2025 se injertó directamente en 春魁,
saltándose el eslabón documentado. El doc dice justamente que el emigrante a 番禺 fue 捷煥
— es decir, 捷煥 es el ancestro de esa rama, y falta.

**Corrección propuesta:**
1. Crear 徐捷煥 (`gen_wuhua`=8, padre 春魁, `migration: → 番禺横江村`).
2. Re-enraizar la rama 广州 bajo 捷煥, o bajo el descendiente que corresponda.
3. Marcar el enlace con `dato_sospechoso` hasta confirmar cuántas generaciones faltan entre
   捷煥 (s. XVIII) y los 鼎X. **Casi con seguridad falta más de una generación** — hay un salto
   de siglos sin cubrir.

> ⚠️ Mientras no se resuelva, el 21% de la base cuelga de un enlace no verificado.

### 3.2 徐廷發 `D_14_YANFA` — 32 hijos

- **Doc (líneas 731–732):** `十二世长房祖徐廷发 配练氏 所生五子 长 富灏 次 富海 三 富泽 四 富浓 五 富沧` → **5 hijos**.
- **Base:** 32.
- Las notas del propio nodo ya admiten el problema:
  *"Padre exacto entre 華英 y 旋英 sin confirmar… ⚠️ verificar en PDF/original."*

Los 27 sobrantes pertenecen, según el doc, a otros padres de la generación 發:

| Hijos mal asignados | Padre correcto (doc) | Línea |
|---|---|---|
| 富梅, 富楊, 富桃 | 來發 | 693–694 |
| 富就, 富利 | 開發 | 712 |
| 富福, 富祿, 富壽, 富全 | 才發 | 713–714 |
| 富賢 | 鳳發 | 715 |
| 富昆, 富薰 | 元發 | 716 |
| 富彥, 富洪, 富源 | 閏發 | 717–718 |
| 富玉 | 錦發 | 719–720 |
| 富成 | 超發 | 721–722 |
| 富邦, 富強 | 欽發 | 723 |
| 富逵, 富達 | 茂發 | 727 |

**Además:** la base tiene `徐富路`; el doc dice **富灏**. Y `徐富繞` vs. doc **富饶**.

### 3.3 徐文祐 `P155` — 9 hijos

- **Doc (línea 480):** `文祐 配叶郭氏 所生二子 长 华英 次 璇英` → **2 hijos**.
- **Base:** 9 (華英, 旋英, 魁英, 立京, 延英, 多英, 漁英, 帝英, 周英).
- De los sobrantes, al menos dos son identificables en otra rama:
  - **帝英** → hijo de 文煋 (línea 648)
  - **多英** → hijo de 文郁 (líneas 495, 640–642)
- 70 descendientes cuelgan de este nodo.

Probable causa: los encabezados del doc dicen `系…文祐公所生之后裔也` (*descendientes*, no *hijos*)
y a continuación listan gente de **12世** (廷發, 迪發, 建發, 廼發, 盛發 — líneas 730–737), que son
**nietos** vía 華英/旋英. Un parser que lea "所生之后裔" como "hijos" los cuelga una generación arriba.

### 3.4 徐敬信 `D_BC_JIXIN` — 8 hijos (sus propias notas dicen 4)

- **Notas del nodo:** *"Hijos: 文彰 (1.er), 文玉 (2.º), 文光 (3.er), 文華 (4.º)"* → 4.
- **Base:** 8. Los 4 extra son **nietos**:
  - 京英, 立英 → hijos de 文彰 (línea 582–583)
  - 元英, 允英 → hijos de 文光 (línea 585–586)

Mismo mecanismo de colapso generacional que 3.3. **Aquí la base se contradice a sí misma**,
lo que lo hace fácil de detectar automáticamente (ver §9).

### 3.5 徐星發 `PA12` — 6 hijos ⚠️ *afecta tu línea directa*

- **Doc (líneas 706–710):**
  ```
  烈英公之子 十二世长房祖徐昌发 配邱氏 所生三子 长 富仁 次 富义 三 富礼
          十二世二房祖徐星发 配赖氏 所生三子 长 富朝 次 富国 三 富业
  ```
- **星發 tuvo 3 hijos y UNA esposa (赖氏).** 富仁/富義/富禮 y la esposa 邱氏 son de su
  **hermano 昌發**.
- **Base:** 星發 tiene 6 hijos y 2 esposas (賴氏 + 邱氏); sus notas dicen
  *"2ª esposa 邱氏 → 富仁, 富義, 富禮 (zupu 2025)"*.
- **昌發 `PA12b` ya existe** con esos mismos 3 hijos correctamente asignados.

→ **富仁, 富義, 富禮 están duplicados** (ver §4).

**Corrección:** quitar de 星發 los 3 hijos `N_X23500*` y la esposa 邱氏; conservar los
`D_FUREN`/`D_FUYI`/`D_FULI` bajo 昌發. Esto es relevante porque toca la rama de la que desciendes.

---

## 4. 🟠 P2 — Duplicación por fusión de fuentes

**Causa raíz:** la base combina `ZUPU_1943` (479 personas) y `ZUPU_2025` (434) **sin deduplicar**.
La misma persona entra dos veces con IDs distintos.

### 4.1 Duplicado exacto (mismo nombre, mismo padre)

| Persona | Copia A (correcta) | Copia B (a eliminar) |
|---|---|---|
| 富仁 / 富義 / 富禮 | `D_FUREN`… bajo **昌發** | `N_X2350*` bajo **星發** |

### 4.2 Duplicado desplazado una generación

Un subárbol completo existe dos veces, una de ellas **una generación demasiado arriba**:

| Persona | Correcto | Duplicado erróneo |
|---|---|---|
| 康發 | `X_KANGFA2` (gw12) | `X_KANGFA` (gw11) |
| 坤發 | `X_KUNFA2` (gw12) | `X_KUNFA` (gw11) |
| 嶸發 | `X_RONGFA2` (gw12) | `X_RONGFA` (gw11) |
| 經發 | `X_JINGFA2` (gw12) | `X_JINGFA` (gw11) |
| 先裕 / 先任 / 先倡 | `X_*2` (gw13) | `X_*` (gw12) |
| 京英 / 立英 | `X_*` (gw11, bajo 文彰) | `D_*` (gw10, bajo 敬信) |
| 元英 / 允英 | `X_*` (gw11, bajo 文光) | `D_*` (gw10, bajo 敬信) |
| 嵩英 | `X_SONGYING` (gw11) | `D_SONGYING` (gw10) |

### 4.3 Gemelos exactos (mismo nombre, mismo padre, mismos hijos)

| Persona | IDs | Nota |
|---|---|---|
| 才發 | `X_CAIFA` / `X_CAIFA2` | **ambos** bajo 秀英, **ambos** con los mismos 4 hijos → 8 personas donde deben ser 4 |
| 開發 | `X_KAIFA` / `X_KAIFA2` | ídem |
| 鳳發 | `X_FENGFA` / `X_FENGFA2` | ídem |

**Total estimado:** ~20 personas sobrantes en 14 grupos.

### 4.4 `children_ids` desincronizado con `pid`

**18 registros** donde la lista `children_ids` no coincide con los hijos reales (los que
apuntan a ese nodo vía `pid`). Ejemplos:

- `PGRANDPA` (兆璋): declara 2, tiene 5 (faltan los `CHI_9000*` de Chile)
- `G_2546319977` (捷三): declara 1, tiene 5
- `X_174017547` (永建): declara 4, tiene **0**
- `G_385962651982` (雄林): declara 1, tiene 0

`children_ids` está documentado como campo derivado ("se recalcula automáticamente"), así que
**`pid` debe ser la única fuente de verdad** y `children_ids` regenerarse siempre desde ahí.

---

## 5. 🟡 P3 — Nombres anómalos

### 5.1 Conformidad con el carácter generacional

| gen_wuhua | Carácter | Total | Conformes | No conformes |
|---|---|---|---|---|
| 8 | 捷 | 73 | 17 | **56** |
| 9 | 敬 | 126 | 52 | **74** |
| 10 | 文 | 148 | 92 | 56 |
| 11 | 英 | 164 | 84 | 80 |
| 13 | 富 | 94 | 74 | 20 |
| 15 | 世 | 20 | 20 | 0 ✔ |
| 16 | 兆 | 24 | 20 | 4 |

El grueso de los no conformes en gw8/gw9 es el bloque 鼎X / X鳳 / X凰 colgado de 春魁 (§3.1):
si esa rama se re-enraíza correctamente, gran parte de esta anomalía se explica sola.

### 5.2 Nombres con alias fusionado en el campo `zh`

Deberían separarse a `alias`:

- `徐法興/榮直` (`PA06b`) → nombre `徐法興`, alias `榮直`
- `徐依召/榮華` (`PA06c`) → nombre `徐依召`, alias `榮華`
- `徐明議/明謹` (`PA04d`) → variantes del doc (línea 166: `明议 又曰 明谨`)
- `徐明誨(法師)` (`PA04c`) → el `(法師)` es un rol, no parte del nombre
- `徐鍾清鳳` (`G_377582816540`, 9 hijos) → parece llevar el apellido de la esposa (鍾) incrustado

### 5.3 Nombres-marcador `亞X`

18 personas se llaman 徐亞三/亞四/亞五/亞六/亞七/亞八. **No son nombres**: son marcadores de
"hijo número N", usados en el doc para varones muertos jóvenes o sin nombre registrado.

**Riesgo:** hay **4 personas llamadas 徐亞六** y **4 llamadas 徐亞四** en ramas distintas.
Cualquier deduplicación por nombre las fusionaría. Recomendación: marcarlos con un flag
tipo `nombre_marcador` para excluirlos de cualquier matching automático.

### 5.4 Homónimos legítimos — no fusionar

El doc contiene homónimos reales en ramas distintas:

- **徐長發** ×2: hijo de 元英 (línea 585) y hijo de 日英 (línea 687)
- **徐錦發** ×2: hijo de 立英 (línea 657) y hijo de 季英 (línea 719)
- **徐富福/富祿/富壽/富全** aparecen bajo 才發 y también (mal) bajo 廷發

---

## 6. 🟡 P4 — Adopciones sub-registradas

El doc documenta **~8 eventos de adopción** (过继 / 立嗣 / 继子). La base marca solo **4**
con flag `adopcion` y **2** con texto en notas.

### Casos en el documento

| Hijo | Padre biológico | Padre adoptivo | Línea |
|---|---|---|---|
| 兆彬 | 世豪 | 世滔 (hermano mayor) | 769, 775 |
| 兆椿 | 世豪 | 世添 | 776, 780 |
| 兆沂 | 世豪 | 世恩 | 776, 787 |
| 來發 | 日英 | 浚英 | 615, 623, 693 |
| 先煥 | 坤發 | 經發 | 665 |
| 亞六 → 先潤 | 鳴發 | 魁發 | 676, 678 |
| 先茂 | 廣發 | 成發 | 677, 685 |
| (heredero s/n) | — | 經發 | 667 |

### Cómo lo maneja la base

El grupo 世豪 **está bien modelado**: los 5 hijos cuelgan del padre biológico y las notas de
世滔/世添/世恩 dicen a quién adoptaron. Pero:

- El vínculo adoptivo vive **solo en prosa**, no es consultable por el programa.
- 世滔, 世添 y 世恩 muestran **0 hijos** en el árbol → visualmente parecen ramas extintas,
  cuando en realidad continuaron por vía adoptiva.

**Propuesta:** añadir un campo `pid_adoptivo` (o `adopted_by`) + flag `adopcion` en el hijo, y
que la visualización dibuje ese enlace con línea punteada. Así se conserva la verdad biológica
**y** la sucesión ritual, que en un zupu es la que define la herencia.

---

## 7. ✅ Variaciones legítimas — **NO “corregir”**

Estas cosas parecen errores pero **están bien**. Documentarlas para que nadie las normalice:

1. **Ramas que abandonan el poema generacional.** En gw11, donde tocaría `英`:
   - descendientes de 敬琏/敬琳 usan **`祝`** (發祝, 高祝, 鸞祝, 鳳祝, 鏡祝, 祖祝… líneas 556–563)
   - descendientes de 敬宁 usan **`周`** (學周, 元周, 贊周, 成周, 輝周, 興周… líneas 565–577)
2. **La rama 荣直 usa `先X`/`就X` en gw13**, mientras la rama 荣政 usa `富X`. Ambas correctas.
3. **Tu propia rama chilena** abandona el poema desde 捷武 (§2).
4. **Dos numeraciones** conviviendo en el doc (长乐 y 粘坑) — no es contradicción.

---

## 8. ⚠️ Contradicciones del **propio documento de 1943**

El doc no es una autoridad perfecta. Antes de "corregir" la base contra él, resolver esto:

| # | Problema | Líneas |
|---|---|---|
| 1 | `敬先公之长子文禄公之子日英公` — **falso**: 日英 es hijo de **文禧**, y 文禄 es el **次子**, no 长子. Las líneas 686 y 766 lo dicen bien. | 738 |
| 2 | Segundo hijo de 子仪: **敬庠** vs. **敬岸** | 271 vs 361 |
| 3 | Hijos de 敬劭: `文庆, 文居, 亚安, 亚六, 亚七` vs. después solo `文居, 文安` | 411 vs 532 |
| 4 | 敬宁 declara 5 hijos (incl. **文伟**) pero luego solo se desarrollan 4; 文伟 desaparece | 434 vs 565–577 |
| 5 | 捷元 `所生八子` pero numerados 长,次,**五,六,七,八,九,十** — faltan 三 y 四. ¿8 hijos mal rotulados o 10 con 2 perdidos? | 293–294 |
| 6 | 明谅: `长曰君付 … 三曰君仁` — rotula 君仁 como *tercero* pero solo lista 2 hijos | 149 |
| 7 | 君仁: `所生二子 长曰法兴 次曰依召 **又生一子** 名达天` — 3 hijos en fraseo de 2+1 (¿otra madre?) | 172 |
| 8 | 嵩英 `所生六子` pero nombra 4 + `后有未详` | 593–594 |
| 9 | 文清 `生七子` pero nombra 2 + `其余未详` | 513–514 |
| 10 | 文庄 `所生五子 字标英` (1 nombrado) y luego `一六七子俱移居广西` → implica ≥7 hijos | 547–548 |
| 11 | **浚英** vs **俊英** — misma persona, dos grafías | 623 vs 693 |
| 12 | `文王公之子` → debe ser **文玉** | 584 |

Los casos 5, 8, 9 y 10 son exactamente lo que mencionabas: **gente que declara más hijos de los
que lista**. Son huecos reales del registro, no errores de transcripción — conviene registrarlos
como "N hijos declarados, M documentados" en vez de inventar o de borrar la cifra declarada.

---

## 9. Integridad estructural (lo que está bien)

- ✔ Una sola raíz: 廿九郎公 (`ANC_NIANJIULANG`)
- ✔ Ningún `pid` apunta a un ID inexistente
- ✔ Sin ciclos detectados
- ✔ `gen_wuhua` consistente con la numeración 粘坑 del doc
- ✔ Línea directa 廿九郎公 → 兆璋 verificada contra el doc en todo el tramo que el doc cubre

Flags actuales: `registro_incompleto` 581 · `ubicacion_por_confirmar` 66 ·
`dato_sospechoso` 61 · `traduccion_por_revisar` 25 · `adopcion` 4

---

## 10. Plan de trabajo priorizado

### Fase 1 — Estructural (alto impacto, bajo riesgo)

- [ ] **1.1** Crear 徐捷煥 y re-enraizar la rama 广州 (196 personas). Marcar `dato_sospechoso`
      y anotar que probablemente falten generaciones intermedias. → §3.1
- [ ] **1.2** Reasignar los 27 hijos mal puestos de 廷發 a sus padres correctos (tabla en §3.2).
      Dejar a 廷發 con sus 5. Corregir 富路→富灏, 富繞→富饶.
- [ ] **1.3** Quitar de 星發 los 3 hijos y la esposa 邱氏 que pertenecen a 昌發. → §3.5
      *(afecta tu línea directa)*
- [ ] **1.4** Corregir el colapso generacional en 敬信 (§3.4) y 文祐 (§3.3): mover nietos
      bajo su padre real.
- [ ] **1.5** Regenerar `children_ids` desde `pid` en los 18 registros desincronizados. → §4.4

### Fase 2 — Deduplicación

- [ ] **2.1** Eliminar los duplicados desplazados de generación (tabla §4.2), conservando la
      copia con `gen_wuhua` correcto.
- [ ] **2.2** Fusionar los gemelos 才發/開發/鳳發 y sus hijos (§4.3).
- [ ] **2.3** Eliminar `N_X2350020161/32681/31150` (富仁/義/禮 duplicados). → §4.1
- [ ] **2.4** **Antes de cualquier dedup automático**, excluir los nombres-marcador `亞X`
      y la lista de homónimos legítimos (§5.3, §5.4).

### Fase 3 — Modelo de datos

- [ ] **3.1** Añadir campo `pid_adoptivo` + poblar los 8 casos del §6.
- [ ] **3.2** Separar alias fusionados del campo `zh` (§5.2).
- [ ] **3.3** Añadir campo `hijos_declarados` (int) para los casos "declara N, documenta M" (§8).
- [ ] **3.4** Añadir flag `nombre_marcador` para los `亞X`.

### Fase 4 — Verificación con la familia / fuentes

- [ ] **4.1** Revisar en el original el carácter 2 del poema generacional (§2).
- [ ] **4.2** ¿祥 o 祯 en la generación 17? (§2)
- [ ] **4.3** Resolver las 12 contradicciones internas del doc (§8) — requiere el original en papel
      o el zupu 2025.
- [ ] **4.4** **奕润 / 世礼 / 兆璋 no están en este documento.** Buscar otra fuente que los
      respalde. → §2

---

## 11. Comprobaciones automáticas recomendadas

Reglas que habrían detectado casi todo lo anterior, y que conviene dejar como validador:

1. `children_ids` ≠ hijos reales por `pid` → error
2. `gen_wuhua` del hijo ≠ `gen_wuhua` del padre + 1 → error
3. Nodo con > 8 hijos → revisar (los zupus rara vez superan 8; 捷元 con 8 es el máximo real)
4. Conteo de hijos ≠ número declarado en las propias `notes` (esto detectó a 敬信)
5. Mismo `zh` + mismo nombre de padre + distinto `gen_wuhua` → duplicado desplazado
6. Nombre que no contiene el carácter generacional **y** cuya rama no está en la lista de
   excepciones legítimas del §7 → revisar

---

## 12. Anexo — archivos

| Archivo | Contenido |
|---|---|
| `files/250813.doc` | Original Word 97 (OLE2), 51 pág. |
| *(scratchpad)* `zupu_doc.txt` | Texto extraído vía piece table del FIB |
| *(scratchpad)* `zupu_doc_clean.txt` | Versión compactada, **816 líneas** — las referencias de línea de este informe apuntan aquí |

El `.doc` no era legible con las herramientas del sistema (sin `antiword`/`catdoc`/LibreOffice
y sin `sudo`); se extrajo con un parser propio en Python sobre la estructura OLE2 + tabla de
piezas del FIB, resolviendo las piezas UTF-16LE y CP1252. 18.608 caracteres recuperados.
