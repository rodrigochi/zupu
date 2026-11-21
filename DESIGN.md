---
name: El huerto
version: 2
surfaces: v2/
---

# El huerto — sistema visual de la versión 2

El árbol genealógico como un huerto de lichis vivo: las generaciones son ramas, las personas son frutos y los que tienen historia están maduros. La raíz (廿九郎公, c. 1100) queda abajo; las ramas nuevas, arriba.

## Color

Estrategia comprometida: el verde de la hoja es el suelo de todo el sitio; el carmesí del lichi es el único acento.

| Token | Valor | Uso |
|---|---|---|
| `--hoja-950` | `#0e261c` | Paneles oscuros, menús, mapa |
| `--hoja-900` | `#173b2c` | Fondo de todas las páginas |
| `--hoja-800` | `#1f4a37` | Superficies elevadas, chips, hover |
| `--hoja-700` | `#2f6b4c` | Bordes, reglas, hojas |
| `--hoja-500` | `#4f8f68` | Frutos verdes (registrados) |
| `--corteza` / `--corteza-viva` | `#4b2e1f` / `#7a4c32` | Tronco, ramas, rabitos |
| `--lichi` / `--lichi-vivo` / `--lichi-oscuro` | `#c2304a` / `#de4a62` / `#8e1f35` | Frutos maduros, acciones principales, acento sobre la ficha clara |
| `--pulpa` | `#f6eadf` | Texto principal; fondo de la ficha y del buscador |
| `--rubor` | `#efc2c4` | Texto secundario cálido, enlaces, foco |
| `--musgo` / `--musgo-tenue` | `#cfe0d3` / `#a9c4b1` | Texto de apoyo sobre verde |

El carmesí no se usa para texto pequeño sobre verde (contraste insuficiente): ahí va `--rubor`.

## Tipografía

- **Young Serif** — títulos (`--f-display`), un solo peso.
- **Literata** — lectura (`--f-lectura`): cuerpo, relato, historias.
- **Figtree** — controles, etiquetas, datos (`--f-ui`), con cifras tabulares (`.num`).
- **LXGW WenKai TC** — todo el chino (`--f-zh`): nombres, caracteres generacionales. Es una letra *kai*, cercana a la escritura a pincel del zupu.

Títulos de página: `clamp(2.8rem, 7vw, 5.4rem)`. Medida de lectura: 66–68ch.

## El fruto

Un solo dibujo en SVG (`comun.js`, `#fruto`): contorno rugoso de 16 bultos, cáscara rayada con un patrón (`#piel-madura`), un brillo y un rabito de corteza. Tres estados, en todo el sitio:

- `#fruto` — rojo, maduro: la persona tiene historia.
- `#fruto-verde` — verde: está en el zupu.
- `#fruto-vacio` — contorno punteado: registro incompleto. Lo que falta se dibuja, no se esconde.

En la ruta, el relato (índice de partes) y la portada, el fruto también marca el avance o la selección.

## Componentes

- **Cabecera** fija con la marca (fruto + 族譜 · 徐氏), cuatro secciones y dos selectores en píldora: ES/EN y 繁/简.
- **Buscador**: campo en píldora color pulpa con resultados en un panel verde oscuro; teclado completo (flechas, Enter, Esc).
- **Botones**: píldoras; el principal en carmesí (`.boton.lleno`), el secundario con borde rubor.
- **Ficha de persona** (árbol): panel claro color pulpa con campos fijos en posiciones fijas (nombre civil, hakka, otro nombre, rama, padre, esposas, hijos, nacimiento, muerte, lugar, migración, entierro, fuente). Un campo vacío muestra «—».
- **Listas índice** (portada, escritos): filas separadas por reglas, título en Young Serif, sin tarjetas.

## Movimiento

Un momento por página, siempre con `prefers-reduced-motion` respetado:

- Portada: los frutos maduran de la raíz a la copa al cargar.
- Relato: la ruta del medio meridiano se traza sobre el globo.
- Árbol: transiciones al abrir o plegar ramas; la ficha entra desde el lado (o desde abajo en el teléfono).

Curva: `cubic-bezier(.16, 1, .3, 1)`.

## Disposición

- Margen lateral `--gutter: clamp(16px, 4vw, 56px)`.
- Más aire sobre un título que debajo; secciones de portada separadas por `clamp(96px, 14vw, 180px)`.
- Teléfono: la navegación se desplaza horizontalmente, la ficha del árbol es una hoja inferior y la ruta tiene una barra guía «Generación N de 30» con flechas.
