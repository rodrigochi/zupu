// Cabecera, pie, frutos (SVG), buscador y avisos comunes a todas las páginas.
'use strict';

(function () {
  const Z = window.ZUPU;
  const R = Z.RAIZ;

  // ── Fruto de lichi: contorno rugoso generado una vez ──
  function contornoFruto(r, bultos) {
    const n = bultos || 16, pts = [];
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + .5) / n) * Math.PI * 2 - Math.PI / 2, a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      // Lichi algo más ancho abajo, como un corazón redondeado
      const k = (a) => r * (1 + .07 * Math.sin(a + Math.PI / 2));
      const p0 = [Math.cos(a0) * k(a0), Math.sin(a0) * k(a0) * 1.04];
      const c = [Math.cos(a1) * k(a1) * 1.1, Math.sin(a1) * k(a1) * 1.14];
      const p2 = [Math.cos(a2) * k(a2), Math.sin(a2) * k(a2) * 1.04];
      if (!i) pts.push(`M${p0[0].toFixed(2)},${p0[1].toFixed(2)}`);
      pts.push(`Q${c[0].toFixed(2)},${c[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`);
    }
    return pts.join('') + 'Z';
  }
  const FRUTO = contornoFruto(10, 16);

  const DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="piel-madura" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <rect width="5" height="5" fill="#c2304a"/>
      <path d="M0 2.5L1.25 1.2 2.5 2.5M2.5 5L3.75 3.7 5 5" stroke="#8e1f35" stroke-width=".7" fill="none"/>
    </pattern>
    <pattern id="piel-verde" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <rect width="5" height="5" fill="#4f8f68"/>
      <path d="M0 2.5L1.25 1.2 2.5 2.5M2.5 5L3.75 3.7 5 5" stroke="#2f6b4c" stroke-width=".7" fill="none"/>
    </pattern>
    <radialGradient id="brillo" cx=".35" cy=".3" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <symbol id="fruto" viewBox="-13 -16 26 30">
      <path d="M0 -10.5C.4 -13 1.6 -14.6 3.2 -15.4" stroke="#7a4c32" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="${FRUTO}" fill="url(#piel-madura)" stroke="#8e1f35" stroke-width=".8"/>
      <path d="${FRUTO}" fill="url(#brillo)"/>
    </symbol>
    <symbol id="fruto-verde" viewBox="-13 -16 26 30">
      <path d="M0 -10.5C.4 -13 1.6 -14.6 3.2 -15.4" stroke="#7a4c32" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="${FRUTO}" fill="url(#piel-verde)" stroke="#2f6b4c" stroke-width=".8"/>
    </symbol>
    <symbol id="fruto-vacio" viewBox="-13 -16 26 30">
      <path d="M0 -10.5C.4 -13 1.6 -14.6 3.2 -15.4" stroke="#7a4c32" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="${FRUTO}" fill="none" stroke="#efc2c4" stroke-width="1.1" stroke-dasharray="2.2 2"/>
    </symbol>
    <symbol id="i-buscar" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="i-cerrar" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="i-flecha" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-enlace" viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="i-mas" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="i-menos" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="i-centro" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  </defs>
</svg>`;

  const NAV = [
    ['ruta/', "Ruta<span class='largo'> familiar</span>", "Family<span class='largo'> line</span>", 'ruta'],
    ['arbol/', 'Árbol', 'Tree', 'arbol'],
    ['migraciones/', 'Migraciones', 'Migrations', 'migraciones'],
    ['escritos/', 'Escritos', 'Writings', 'escritos'],
  ];

  function cabecera() {
    const actual = document.body.dataset.pagina || '';
    const h = document.createElement('header');
    h.className = 'cabecera';
    h.innerHTML = `
      <a class="marca" href="${R}" aria-label="族譜 · 徐氏 — inicio"><svg aria-hidden="true"><use href="#fruto"/></svg><span class="zh" data-zh-simp="族谱 · 徐氏">族譜 · 徐氏</span></a>
      <nav class="nav" aria-label="Secciones" data-en-label="Sections">
        ${NAV.map(([href, es, en, id]) => `<a href="${R}${href}" data-en="${en}"${id === actual ? ' aria-current="page"' : ''}>${es}</a>`).join('')}
      </nav>
      <div class="prefs">
        <div class="pref" role="group" aria-label="Idioma" data-en-label="Language"><button type="button" data-pref-lang="es">ES</button><button type="button" data-pref-lang="en">EN</button></div>
        <div class="pref" role="group" aria-label="Escritura china" data-en-label="Chinese script"><button type="button" class="zh" data-pref-script="trad" title="繁體">繁</button><button type="button" class="zh" data-pref-script="simp" title="简体">简</button></div>
      </div>`;
    document.body.prepend(h);
  }

  function pie() {
    if (document.querySelector('.pie') || document.body.hasAttribute('data-sin-pie')) return;
    const f = document.createElement('footer');
    f.className = 'pie';
    f.innerHTML = `
      <div><span class="zh" data-zh-simp="族谱 · 徐氏 · 粘坑">族譜 · 徐氏 · 粘坑</span><br>
        <span data-en="Family tree of the Chi (徐/Xu) family, compiled by the family from the zupu of 1943 and 2025.">Árbol genealógico de la familia Chi (徐/Xu), compilado por la familia a partir de los zupu de 1943 y 2025.</span></div>
      <div><a href="${R}../padron-1947/" data-en="The Chinese in Chile, 1947">Los chinos en Chile, 1947</a> · <a href="${R}la-mitad-de-un-meridiano/" data-en="Half a meridian">La mitad de un meridiano</a></div>`;
    document.body.appendChild(f);
  }

  // ── Buscador reutilizable ──
  // <div class="buscador" data-buscador data-destino="arbol"> … </div>
  function montarBuscador(caja) {
    const input = caja.querySelector('input');
    const lista = caja.querySelector('.resultados');
    const alElegir = caja._alElegir;
    let items = [], sel = -1, t = 0;
    const destino = (p) => `${R}arbol/#person=${encodeURIComponent(p.id)}`;
    function pintar() {
      const q = input.value.trim();
      if (!q) { lista.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
      if (!Z.DB) { lista.innerHTML = `<li class="vacio">${Z.L('Cargando el árbol…', 'Loading the tree…')}</li>`; lista.hidden = false; return; }
      items = Z.buscar(q, 12); sel = -1;
      lista.innerHTML = items.length
        ? items.map((p, i) => `<li role="option" id="${lista.id}-${i}"><a href="${destino(p)}" data-id="${Z.esc(p.id)}">
            <span class="r-zh">${Z.esc(Z.zh(p))}</span><span class="r-py">${Z.esc(p.civil_name_es || p.py || '')}</span>
            <span class="r-meta num">${Z.L('Gen.', 'Gen.')} ${p.gen}${p.place ? ' · ' + Z.esc(Z.lugar(p.place)) : ''}</span></a></li>`).join('')
        : `<li class="vacio">${Z.L('Nadie con ese nombre o lugar. Prueba con el nombre en chino, en pinyin (Zhaozhang) o un lugar (Heshan).', 'No one by that name or place. Try the Chinese name, pinyin (Zhaozhang) or a place (Heshan).')}</li>`;
      lista.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(pintar, 120); });
    input.addEventListener('focus', () => { if (input.value.trim()) pintar(); });
    input.addEventListener('keydown', (e) => {
      const links = lista.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!links.length) return;
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach((a, i) => a.setAttribute('aria-selected', String(i === sel)));
        input.setAttribute('aria-activedescendant', `${lista.id}-${sel}`);
      } else if (e.key === 'Enter') {
        const a = links[sel >= 0 ? sel : 0]; if (a) { e.preventDefault(); a.click(); }
      } else if (e.key === 'Escape') { lista.hidden = true; }
    });
    lista.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-id]'); if (!a) return;
      lista.hidden = true;
      if (alElegir) { e.preventDefault(); alElegir(a.dataset.id); input.blur(); }
    });
    document.addEventListener('click', (e) => { if (!caja.contains(e.target)) lista.hidden = true; });
    Z.alCambiar(() => { if (!lista.hidden) pintar(); });
    Z.cargar().then(() => { if (document.activeElement === input && input.value.trim()) pintar(); }).catch(() => {});
  }

  let tAviso = 0;
  function aviso(texto) {
    let el = document.querySelector('.aviso');
    if (!el) { el = document.createElement('div'); el.className = 'aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = texto; el.classList.add('visible');
    clearTimeout(tAviso); tAviso = setTimeout(() => el.classList.remove('visible'), 2600);
  }

  Z.FRUTO = FRUTO;
  Z.contornoFruto = contornoFruto;
  Z.aviso = aviso;
  Z.montarBuscador = montarBuscador;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', DEFS);
    if (!document.body.hasAttribute('data-sin-cabecera')) cabecera();
    pie();
    document.querySelectorAll('[data-buscador]').forEach(montarBuscador);
    Z.aplicarIdioma();
  });
})();
