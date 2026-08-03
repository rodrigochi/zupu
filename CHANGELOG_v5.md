# Changelog · `data/zupu_v5.json`

Generado desde `data/zupu.json`, que queda **intacto**.

**937 → 908 personas.**

## Resumen

- Total de registros eliminados: **29** (937 → 908). Todos eran duplicados verificados.

## Línea directa (tu linaje)

- `PA12` 星發: esposa 邱氏 eliminada; 3 hijos ajenos desvinculados; nota corregida.
- `PSHILI` 世禮: añadida esposa 謝氏 (zupu 2025 pág. 43: 十五世徐世禮 姚謝氏).
- `PZHAOCONG` 兆琮: esposa 鐘氏 → 馬氏 (zupu 2025 pág. 44: 十六世徐兆琮 姚馬氏 所生四子).
- `PGRANDPA` 兆璋: nota corregida — el zupu 2025 dice 何氏, no 鍾氏. El 鍾氏 provenía de la columna vecina (兆穠 姚鍾氏).

## Duplicados eliminados

- `D_BC_JIXIN` 敬信: eliminados 4 duplicados (京英, 立英, 元英, 允英) que ya existen correctamente en gw11 bajo 文彰 y 文光. Queda con sus 4 hijos reales.
- Eliminado el subárbol 嵩英 duplicado y desplazado una generación (`D_SONGYING` gw10 → 康發/坤發/嶸發/經發 gw11 → 先裕/先任/先倡 gw12). Se conserva el correcto: `X_SONGYING` gw11 → `X_KANGFA2` gw12 → `X_XIANYU2` gw13. 8 registros.
- Fusionados los gemelos bajo 秀英: `X_CAIFA2`, `X_KAIFA2`, `X_FENGFA2` (mismo nombre, mismo padre, mismos hijos que su par).
- Eliminados también los 4 hijos duplicados de `X_CAIFA2` (富福/富祿/富壽/富全 ya existen bajo `X_CAIFA`).

## Súper-nodo 廷發

- `D_14_YANFA` 廷發: eliminados 7 duplicados (富梅/富楊/富桃 ya bajo 來發; 富福/富祿/富壽/富全 ya bajo 才發).
- `D_14_YANFA` 廷發: reasignados 9 hijos a su padre documentado en el zupu de 1943 — 富利 → 開發; 富就 → 開發; 富賢 → 鳳發; 富昆 → 元發; 富薰 → 元發; 富邦 → 欽發; 富強 → 欽發; 富玉 → 錦發; 富成 → 超發.
- ⚠️ 富逵 y 富達 (→ 茂發) NO se reasignaron: existen dos 茂發 (N_X3353830332, X_MAOFA) y hay que fusionarlos primero. Quedan en 廷發.
- `X_FUHAO`: 徐富路 → 徐富灝 (zupu 1943 línea 732: 长富灏).
- `N_X2350032350`: 徐富繞 → 徐富饒 (zupu 1943 línea 726: 富饶).

## Súper-nodo 文祐

- `P155` 文祐: 帝英 → 文煋 (`D_WENXING2`) y 多英 → 文郁 (`D_WENYU`), según zupu 1943 líneas 648 y 495.

## Campos derivados

- `children_ids` y `child_count` regenerados desde `pid` en todos los nodos (51 registros quedaron sincronizados).

## Validación

- Raíces: 1 (廿九郎公)
- `pid` colgantes: 0
- Ciclos: ninguno
- Saltos de generación padre→hijo restantes: 0
