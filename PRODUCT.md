# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **La familia Chi / Xu (徐)**, en Chile, en China (Hèshān, Gònghé, Guǎngxī) y en Europa. Llegan sobre todo por enlaces compartidos en WhatsApp y WeChat, a menudo desde el teléfono. Quieren encontrarse en el árbol, leer la historia de sus antepasados y mostrarla a otros.
- **Público general** interesado en la migración china a Chile y en la diáspora hakka: lectores que llegan por un artículo, el padrón de 1947 o el ensayo del viaje.

## Product Purpose

Un *zupu* (族譜) digital: el libro genealógico del clan 徐 de Niánkēng, continuado hasta la rama chilena. Reúne el árbol (913 personas, 30 generaciones, ~900 años, desde finales de la dinastía Song), la línea directa hasta Chile, las migraciones del clan, los clanes de las esposas, artículos de historia, la radiografía del padrón chino de Chile de 1947 y el relato «La mitad de un meridiano», sobre el viaje de 2025 que reencontró a las dos ramas de la familia.

Éxito: un pariente abre el enlace en el teléfono, entiende de inmediato qué es, encuentra a su abuelo o bisabuelo y siente que el libro de la familia sigue vivo.

## Positioning

Es el único registro que une un *zupu* hakka de treinta generaciones con la rama que emigró a Chile en 1927, y que lo hace legible en español, inglés y chino (tradicional y simplificado), con la fuente de cada dato (Zupu 1943, Zupu 2025, fuente familiar).

## Operating Context

- Se comparte por WhatsApp y WeChat; la vista previa (Open Graph) importa.
- Se lee en teléfonos y en computador. Parte de la familia lee chino y no español; otra parte, al revés.
- El poema generacional del zupu (敬文英發富，奕世兆禎祥) asigna un carácter a cada generación; el abuelo, 徐兆璋, lleva 兆.
- El abuelo tuvo varios nombres: 徐兆璋 (de nacimiento), 徐玉楷 (Xu Yukai, el que usó en Chile), Sergio Chi Chia. En hakka, *akún* (阿公).

## Capabilities and Constraints

- Sitio estático en GitHub Pages (repositorio rodrigochi/zupu), sin paso de compilación. HTML, CSS y JavaScript sin framework; D3 v7 para el árbol y los mapas; Markdown para los artículos.
- Datos: `data/zupu.json` (personas, padres, esposas, migraciones, biografías en español e inglés, procedencia, marcas de revisión).
- Idiomas: español / inglés, y escritura tradicional / simplificada para el chino. Todo texto nuevo debe existir en ambos idiomas.
- Funciones que deben conservarse: ruta familiar (línea directa), árbol interactivo con zoom y ficha de persona, búsqueda (nombre chino, pinyin, lugar, esposa), migraciones (mapa y lista), clanes de esposas, cronología, artículos, modo revisión, enlaces directos `#person=` y `#article=`.
- La versión 2 se publica oculta en `/zupu/v2/` (sin enlaces desde la versión actual y con `noindex`) hasta que se decida reemplazar la actual.
- Las fotos del relato se publican con una marca de agua que lleve a la dirección del sitio.

## Brand Commitments

- Nombre: 族譜 · 徐氏 — Árbol genealógico de la familia Chi (徐/Xu).
- El apellido 徐 se lee Xú en mandarín y Chí en hakka; en Chile, Chi y Xu son el mismo apellido.
- Voz: primera persona familiar, precisa con los datos, sin grandilocuencia.

## Evidence on Hand

- `data/zupu.json`: 913 personas, 30 generaciones, 76 migraciones, 67 clanes de esposas.
- `padron-1947/`: padrón electoral de 1947 (1197 inscritos), con mapas y gráficos.
- `content/*.md`: artículos (algunos aún provisionales, marcados como pendientes).
- «La mitad de un meridiano» (docx del autor, 8 fotos): el abuelo y el autor (c. 1997), el sobre de 1989, la madre del abuelo con Kintong (c. 1950), la mesa en Dongquan, el altar de Xu Sanlang, la comisaría de Gonghe, la casa en Pankeng, el poema generacional.
- `assets/xu_state.svg`, `assets/boyi.png`: ilustraciones del origen legendario del apellido.
- No hay testimonios, cifras de visitas ni prensa enlazable en el repositorio: no inventarlos.

## Product Principles

1. El libro de la familia primero: cada pantalla debe ayudar a encontrar a una persona o entender una historia.
2. Toda afirmación lleva su fuente; lo dudoso se marca, no se esconde.
3. Tres públicos lectores, un mismo sitio: ningún contenido existe solo en un idioma.
4. Pensado para el teléfono de un pariente que abre un enlace de WhatsApp o WeChat.

## Accessibility & Inclusion

- Lectores mayores en teléfonos: texto legible sin zoom, contraste alto, objetivos táctiles amplios. *(Inferido del contexto de uso; no lo pidió el autor explícitamente.)*
- Caracteres chinos con una fuente que cubra tradicional y simplificado.
