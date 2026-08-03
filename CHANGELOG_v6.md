# Changelog · `data/zupu_v6.json`

Derivado de `data/zupu_v5.json`. **913 personas.**

Fuente nueva: `files/zupu_2025_plain_text.txt` (transcripción del zupu 2025).

## Correcciones revertidas

- `X_FUHAO`: revertido a **徐富路**. La transcripción del zupu 2025 dice 富路; el zupu 1943 dice 富灏 y la imagen se lee 富潞. Las tres variantes quedan en `alias` y el nodo se marca `dato_sospechoso`. (En v5 lo había cambiado a 富灝 basándome solo en 1943.)
- `D_14_YANFA`: 徐廷發 → **徐延發**, como dicen la transcripción 2025 y el propio ID. 廷發 queda como variante de 1943.
- `PGRANDPA` 兆璋: restaurada la discrepancia 鍾氏 (zupu) vs 何氏 (familia). En v5 la había eliminado por error, afirmando que el zupu decía 何氏.

## Modelo de adopciones

- Nuevo campo **`pid_adoptivo`** (opcional, retrocompatible). `pid` sigue siendo el padre biológico, así que el árbol existente no cambia de forma y cualquier consumidor que ignore el campo sigue funcionando igual.
- Adopciones registradas: 兆彬→世滔, 兆椿→世添, 兆沂→世恩, 來發→浚英.
- Corregido el grupo de 兆譽 (zupu 2025 pág. 44: 所生四子 先騰, 嘉禎, 樹禎, 富禎). En la base el `pid` apuntaba al padre **adoptivo**; ahora apunta al biológico y la adopción va en `pid_adoptivo`: 嘉禎: padre 兆康→兆譽, adoptivo 兆康; 樹禎: padre 兆鷹→兆譽, adoptivo 兆鷹; 富禎: padre 兆鑾→兆譽, adoptivo 兆夔.

## Rama 广州 reconstruida

- Rama 广州: desplazadas +1 las generaciones de los 196 descendientes de 春魁 (los 鼎X pasan de gw8 a **gw9**, que es lo que dice el zupu 2025: 九世祖徐鼎瑛…).
- Creados los **4 hijos de 春魁** que da el zupu 2025 (七世祖徐春魁 … 四子): **捷煥** (alias 敬尊, esposa 李氏, emigró a 廣州), 捷煌, 捷輝 y 捷炳.
- Los **17 鼎X** pasan de ser hijos de 春魁 a serlo de 捷煥, en gw9. El zupu 2025 nombra explícitamente a 鼎琳 y 鼎珍 como hijos suyos; el resto se asigna a 捷煥 por generación y rama, no por mención directa.
- **14 nietos** que colgaban como hermanos pasan a su padre documentado: 鼎鳳 → 仁/義/禮/智/美鳳; 鼎瑞 → 來/清/南/周/西鳳; 鼎璋 → 增/城/尊/雲凰 (zupu 2025, 九世祖). Los 鼎X que ya tenían bien a sus hijos (鼎瑛→麒凰…) no se tocaron.
- Los **19 restantes** (全鳳, 進鳳, 世X, 士榮…) se reasignan provisionalmente a 捷煥 y quedan marcados `dato_sospechoso`: el zupu no dice de cuál de los 鼎X descienden.

## 閏發 y 富饒

- Creado **徐閏發** (`PC_RUNFA`, hijo de 季英, esposa 張氏) y reasignados a él 富彥, 富洪 y 富源, que colgaban de 延發. Ambos zupus coinciden en sus 5 hijos.
- ⚠️ 富滔 y 富淮 (4.º y 5.º hijos de 閏發) siguen sin existir en la base; no se inventaron.
- **富饒** pasa de 延發 a **榮發** (zupu 2025 pág. 38: 荣發 → 富献, 富绕).

## Campos derivados

- Rellenados **63 campos** de generación derivada (`gen_wuhua`, `gen_heling`, `gen_tian`) que estaban ausentes en los 21 nodos de la rama chilena; se calculan desde el padre. Era un hueco previo, no introducido por estas correcciones.

## Validación

- Raíces: 1
- Ciclos: ninguno
- Referencias colgantes: 0
- Saltos de generación padre→hijo: 0
- Nodos con más de 8 hijos: [('徐延發', 12), ('徐捷煥', 36), ('徐鍾清鳳', 9)]
