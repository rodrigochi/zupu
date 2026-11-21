// Escritos: índice y lector de los artículos en Markdown de ../content/.
'use strict';

(function () {
  const Z = window.ZUPU;
  const C = Z.BASE + 'content/';
  let ARTS = [];
  const RELATO = {
    id: 'la-mitad-de-un-meridiano', href: '../la-mitad-de-un-meridiano/',
    title: 'La mitad de un meridiano', title_en: 'Half a meridian',
    subtitle: 'El viaje de 2025 que reunió a las dos ramas de la familia. Por Rodrigo Chi.',
    subtitle_en: 'The 2025 trip that reunited the two branches of the family. By Rodrigo Chi.',
  };
  const tit = (a) => Z.L(a.title, a.title_en || a.title);
  const sub = (a) => Z.L(a.subtitle || '', a.desc_en || a.subtitle_en || a.subtitle || '');
  const enlace = (a) => a.href || (a.url ? '../' + a.url : '?a=' + encodeURIComponent(a.id));

  function indice() {
    const listos = [RELATO, ...ARTS.filter((a) => !a.pendiente)];
    // El viaje de 2025 queda reemplazado por el relato
    const pend = ARTS.filter((a) => a.pendiente && a.id !== 'viaje-china-2025');
    const fila = (a) => `<li><a href="${enlace(a)}"><span class="el-t">${Z.esc(Z.simp(tit(a)))}</span><span class="el-s">${Z.esc(Z.simp(sub(a)))}</span>
      <svg class="el-f" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>`;
    document.getElementById('es-lista').innerHTML = listos.map(fila).join('');
    document.getElementById('es-pendientes').innerHTML = pend.map(fila).join('');
  }

  const cache = {};
  async function leer(id) {
    const a = ARTS.find((x) => x.id === id);
    if (!a || !a.file) { location.replace('./'); return; }
    document.getElementById('es-indice').hidden = true;
    document.getElementById('es-articulo').hidden = false;
    document.getElementById('es-titulo').textContent = Z.simp(tit(a));
    document.getElementById('es-sub').textContent = Z.simp(sub(a));
    document.title = tit(a) + ' — 族譜 · 徐氏';
    const file = Z.lang === 'en' && a.file_en ? a.file_en : a.file;
    const cuerpo = document.getElementById('es-cuerpo');
    try {
      if (!cache[file]) { const r = await fetch(C + file); if (!r.ok) throw new Error('HTTP ' + r.status); cache[file] = await r.text(); }
      let md = cache[file].replace(/^#\s+.*\n/, ''); // el título ya está arriba
      cuerpo.innerHTML = marked.parse(md, { gfm: true });
      cuerpo.querySelectorAll('img[src^="./"]').forEach((img) => { img.src = Z.BASE + img.getAttribute('src').slice(2); img.loading = 'lazy'; });
      cuerpo.querySelectorAll('a[href]').forEach((l) => {
        const h = l.getAttribute('href');
        if (h === 'padron-1947/' || h === './padron-1947/') l.href = Z.BASE + 'padron-1947/';
        else if (/^#article=/.test(h)) l.href = '?a=' + h.slice(9);
      });
    } catch (e) {
      cuerpo.innerHTML = `<p class="error">${Z.L('No se pudo cargar el escrito', 'The writing could not be loaded')} (${Z.esc(e.message)}).</p>`;
    }
  }

  function mostrar() {
    const id = new URLSearchParams(location.search).get('a');
    if (id) leer(id); else indice();
  }

  fetch(C + 'articles.json').then((r) => r.json()).then((a) => { ARTS = a; mostrar(); Z.alCambiar(mostrar); })
    .catch((e) => { document.getElementById('es-lista').innerHTML = `<li class="error">${Z.esc(e.message)}</li>`; });
})();
