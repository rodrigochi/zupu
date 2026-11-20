# Padrón 1947 · Los electores chinos de Chile

Página estática e interactiva con el padrón electoral de 1947 de ciudadanos chinos en Chile: mapas de origen (delta del río de las Perlas) y de residencia en Chile, cruce condado × ciudad, edades, oficios, apellidos con sus grafías en castellano y su pronunciación en mandarín, cantonés y hakka.

No necesita servidor propio ni compilación: son archivos HTML, JS y JSON que GitHub Pages sirve tal cual.

**Nombres (versión 3):** se publica el nombre de cada inscrito en caracteres, tal como figura en el manuscrito, sin romanizarlo ni pasarlo a simplificado. Las lecturas dudosas llevan «?» (28 de 1197). Cada fila enlaza a su imagen en el visor del 國史館 (`js/config.js`, tabla `paginas`: número de imagen → código del visor; la imagen n del visor es el archivo 033-020104-0091-n.jpg). La página invita a los familiares a pedir correcciones o el retiro de un nombre (`contacto` en `js/config.js`, hoy una issue de GitHub). Para volver a una versión solo con apellidos: `python3 fuentes/web_export.py <out> data --sin-nombres` (las tablas esperan la columna `nombre`).

## Contenido

```
padron-1947/
├── index.html              página completa (estilos incluidos)
├── js/
│   ├── runtime.js          carga los datos, calcula y redibuja (sin dependencias salvo D3)
│   ├── calcs.js            cálculos (totales, cruces, edades, oficios, apellidos)
│   ├── comun.js            utilidades, filtros, cifras y tablas
│   ├── mapas.js            mapas (ruta, Chile, delta, China)
│   ├── graficos.js         barras, matriz, histograma, mosaico de apellidos
│   └── grafias.js          tabla de apellidos: grafías en Chile y pronunciaciones
├── data/
│   ├── padron.json         1197 inscripciones, sin nombres (formato columnas + filas)
│   ├── apellidos_grafias.json   116 apellidos con simplificado, pinyin, jyutping, hakka y grafías chilenas
│   └── mapa_*.json         límites simplificados (GeoJSON)
├── vendor/d3.min.js        D3 v7 (licencia ISC en vendor/d3-LICENSE.txt)
└── fuentes/                scripts en Python que generaron los datos (referencia)
```

## Instalación en el sitio

El sitio es `https://rodrigochi.github.io/zupu/` (repositorio `rodrigochi/zupu`). Es una aplicación de una sola página que carga `data/zupu.json` y navega con el hash (`#article=…`).

1. Copiar la carpeta `padron-1947/` completa en la raíz del sitio, al mismo nivel que `index.html` y `data/` del sitio. Debe quedar accesible en `https://rodrigochi.github.io/zupu/padron-1947/`.
   - No mezclar su carpeta `data/` con la `data/` del sitio: la página usa rutas relativas a su propia carpeta.
   - Si el sitio se publica desde una carpeta distinta de la raíz (por ejemplo `docs/`), copiarla allí.
2. Enlazarla desde el artículo «Migración china a Chile» (`#article=migracion-china-chile-1980-1930`). Dos opciones, según cómo estén escritos los artículos (revisar dónde se definen; probablemente en `data/zupu.json` o en archivos Markdown/HTML que el sitio carga):
   - **Enlace** (lo más simple): agregar al final del artículo un párrafo como
     «Epílogo: la colectividad en 1947 — [ver el padrón electoral interactivo](padron-1947/)».
     También se puede agregar una tarjeta en «Escritos e historias».
   - **Incrustada** en el artículo con un iframe que ajusta su altura solo:
     ```html
     <iframe id="padron-1947" src="padron-1947/?incrustada=1"
             title="Los electores chinos de Chile, 1947"
             style="width:100%; border:0; min-height:900px" loading="lazy"></iframe>
     <script>
       window.addEventListener('message', (e) => {
         const f = document.getElementById('padron-1947');
         if (f && e.source === f.contentWindow && e.data && e.data.tipo === 'padron-1947-altura') {
           f.style.height = e.data.altura + 'px';
         }
       });
     </script>
     ```
     Con `?incrustada=1` (o dentro de cualquier iframe) la página oculta su navegación propia. Si el artículo se arma desde Markdown y el renderizador elimina `<iframe>` o `<script>`, usar la opción de enlace o añadir el iframe en la plantilla del artículo.
3. Los enlaces «← Migración china a Chile» y «Zupu» de la parte superior apuntan a `../#article=migracion-china-chile-1980-1930` y `../`. Si la carpeta queda en otra ruta, ajustarlos en `index.html`.
4. Colores: la paleta está en las variables CSS al comienzo de `index.html` (`--color-bg: #faf6f0`, etc.). Ajustarlas si el sitio usa otros tonos o tipografías.
5. Probar localmente con un servidor (no abriendo el archivo con doble clic, porque el navegador bloquea la carga de JSON desde `file://`):
   ```
   cd zupu && python3 -m http.server 8000
   # abrir http://localhost:8000/padron-1947/
   ```

## Enlaces con filtro

La página guarda los filtros en la dirección, por ejemplo:
`padron-1947/#lista=Iquique&condado=Heshan`

## Fuentes y créditos

- Padrón: transcripción del expediente 033-020104-0091 (elección de representantes a la Asamblea Nacional de la República de China, distrito 9 de ciudadanos en el extranjero, noviembre de 1947).
- Contexto de la elección: Constitución de la República de China, art. 26; 國民大會秘書處, 《第一屆國民大會實錄》 (1961); 總統府公報 n.º 472 (17-II-1954, reemplazo de 鄭藻文 por el suplente 孫邦華).
- Grafías castellanas de los apellidos: «Cuadro genealógico de la colectividad china», en Elsa Kam-Ching Zambrano, *Historia de la colectividad china en Chile*, pp. 54–57.
- Hakka (dialecto sixian): diccionario hakka del Ministerio de Educación de Taiwán, datos abiertos de g0v/moedict-data-hakka. Mandarín: pypinyin. Cantonés: pycantonese (jyutping). Simplificado: OpenCC.
- Mapas: límites de China (DataV/Aliyun, vía lyhmyd1211/GeoMapData_CN), regiones de Chile (caracena/chile-geojson), continentes y países vecinos (Natural Earth, vía world-atlas). Conviene revisar las condiciones de uso de cada fuente antes de publicar.
- Gráficos: D3 v7 (ISC).

Los criterios de normalización (sedes, condados de 1947, oficios, apellidos) están en las notas al pie de la página.

## Idiomas y escritura (versión 2)

- **Español / inglés y tradicional / simplificado**, con los mismos botones de bandera que Zupu. La preferencia se guarda en `localStorage` con las mismas claves que el resto del sitio (`zupu-lang`, `zupu-script`), así que se comparte en las dos direcciones. También se puede forzar con la dirección: `?lang=en&zh=simp`.
- Textos largos: dos versiones en `index.html` con `data-l="es"` y `data-l="en"`. Textos cortos: atributo `data-en="…"`. Textos de los gráficos: `L('español', 'English')` y `V(valor)` para los valores de los datos (en `js/i18n.js`).
- Simplificado: `js/i18n.js` trae la tabla de pares tradicional→simplificado de todos los caracteres de la página, generada con OpenCC (`t2s`); los apellidos usan la columna `simplificado` de `apellidos_grafias.json`. Lo marcado con `data-trad` queda en tradicional (notas sobre caracteres manuscritos, columna «Tradicional»). Si se agregan caracteres nuevos, hay que regenerar la tabla.
- Mosaico de apellidos con selector de pronunciación: mandarín, cantonés, hakka o grafía chilena (`?pron=hakka` para enlazarlo directo). Un clic en un apellido abre sus grafías.

## Pronunciación (versión 3)

- `js/audio.js`: botón 🔊 en la tabla de grafías y en el recuadro de 徐; en el mosaico, un clic reproduce el apellido en la lengua elegida (doble clic: sus grafías).
- Hakka: grabaciones (dialecto sixian) del 《臺灣客家語常用詞辭典》 del Ministerio de Educación de Taiwán, descargadas vía moedict.tw sin modificar, en `audio/hakka/<código Unicode>.mp3`; índice en `data/audio.json`. Se eligió la entrada cuya lectura sixian coincide exactamente con la de `apellidos_grafias.json`; 99 de 116 apellidos tienen grabación. Origen: `https://www.moedict.tw/h/<carácter>.json` (campo `=`) y `https://r2-assets.moedict.tw/audio/h/1-<id>.mp3` (1 = sixian).
- Mandarín: sílabas grabadas de [hugolpz/audio-cmn](https://github.com/hugolpz/audio-cmn) (voz de Chen Wang, CC BY-SA), `64k/syllabs/cmn-<pinyin con número de tono>.mp3` (ü = v), en `audio/mandarin/`; índice en `data/audio.json` (歐陽 = dos sílabas que suenan seguidas).
- Cantonés y grafía chilena: voz sintética del dispositivo (Web Speech API: zh-HK, es). Si no hay voz para el idioma, se avisa en vez de leer con otra voz. En cantonés, 曾, 翟 y 任 se dicen «姓X» para forzar la lectura de apellido.

## Digitalización

La transcripción se hizo principalmente con gemini-3.6-flash mediante `procesar_padron.py`. De las 70 hojas con registro de procesamiento, 65 quedaron registradas con ese modelo, 4 con gemini-3.8-flash (modelo predeterminado del script) y 1, la imagen 067, se transcribió por cotejo visual. La revisión de los escaneos, el cotejo histórico y la preparación del Excel se hicieron con GPT-6.2 Sol en Codex.
