// Ruta familiar: las treinta generaciones de la línea directa.
'use strict';

(function () {
  const Z = window.ZUPU;
  const EPOCAS = {
    1: ['Las montañas de Jiangxi y Fujian · dinastía Song', 'The mountains of Jiangxi and Fujian · Song dynasty'],
    11: ['Wǔhuá (五華), Guǎngdōng · desde 1403', 'Wǔhuá (五華), Guǎngdōng · from 1403'],
    21: ['Hèshān (鶴山), Guǎngdōng · desde 1740', 'Hèshān (鶴山), Guǎngdōng · from 1740'],
    28: ['Chile · desde 1927', 'Chile · from 1927'],
  };
  const POEMA = { 21: '敬', 22: '文', 23: '英', 24: '發', 25: '富', 26: '奕', 27: '世', 28: '兆' };

  function hechos(p) {
    const h = [];
    if (p.birth) h.push([Z.L('Nacimiento', 'Born'), p.birth]);
    if (p.death) h.push([Z.L('Muerte', 'Died'), p.death]);
    if (p.place) h.push([Z.L('Lugar', 'Place'), p.place]);
    if (p.migration) h.push([Z.L('Migración', 'Migration'), p.migration.replace(/^→\s*/, '→ ')]);
    if (p.spouses && p.spouses.length) h.push([Z.L('Esposas', 'Wives'), p.spouses.join(' · ')]);
    const n = (Z.kids[p.id] || []).length;
    if (n) h.push([Z.L('Hijos en el zupu', 'Children in the zupu'), String(n)]);
    return h;
  }

  function pintar() {
    const ol = document.getElementById('ru-linea');
    ol.innerHTML = Z.LINEA.map((p) => {
      const ep = EPOCAS[p.gen];
      const car = POEMA[p.gen];
      const civil = p.civil_name_es ? `<p class="ru-civil">${Z.esc(p.civil_name_es)}</p>` : '';
      const hakka = p.hakka_py ? `<p class="ru-hakka"><span>${Z.L('Hakka', 'Hakka')}</span> ${Z.esc(p.hakka_py)}</p>` : '';
      const extra = p.id === 'PGRANDPA'
        ? `<a class="boton lleno" href="../la-mitad-de-un-meridiano/">${Z.L('Leer «La mitad de un meridiano»', 'Read “Half a meridian”')}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>` : '';
      return `${ep ? `<li class="ru-epoca" aria-hidden="false"><span>${Z.esc(Z.simp(Z.L(ep[0], ep[1])))}</span></li>` : ''}
      <li class="ru-gen${p.branch === 'chile' || p.id === 'PGRANDPA' ? ' chile' : ''}" id="g${p.gen}" data-gen="${p.gen}">
        <div class="ru-marca"><svg aria-hidden="true"><use href="#fruto"/></svg><span class="ru-n num">${p.gen}</span></div>
        <div class="ru-cuerpo">
          <h2 class="ru-zh zh">${Z.esc(Z.zh(p))}${car ? `<span class="ru-car" title="${Z.L('Carácter generacional', 'Generation character')}">${Z.esc(Z.simp(car))}</span>` : ''}</h2>
          <p class="ru-py">${Z.esc(p.py || '')}</p>${civil}${hakka}
          <dl class="ru-hechos">${hechos(p).map(([k, v]) => `<div><dt>${k}</dt><dd>${Z.esc(Z.simp(v))}</dd></div>`).join('')}</dl>
          <div class="ru-historia">${Z.md(Z.historia(p))}</div>
          <div class="ru-acciones"><a class="boton" href="../arbol/#person=${encodeURIComponent(p.id)}">${Z.L('Ver en el árbol', 'See in the tree')}</a>${extra}</div>
        </div>
      </li>`;
    }).join('');
    guia();
  }

  let actual = 1;
  function guia() {
    const txt = document.getElementById('ru-guia-txt');
    const gens = [...document.querySelectorAll('.ru-gen')];
    const total = gens.length;
    const marcar = () => {
      let g = 1;
      gens.forEach((li) => { if (li.getBoundingClientRect().top < innerHeight * .4) g = +li.dataset.gen; });
      actual = g;
      const p = Z.LINEA.find((x) => x.gen === g);
      txt.innerHTML = `${Z.L('Generación', 'Generation')} <b>${g}</b> ${Z.L('de', 'of')} ${total} · <span class="zh">${Z.esc(Z.zh(p))}</span>`;
      gens.forEach((li) => li.classList.toggle('actual', +li.dataset.gen === g));
    };
    window.onscroll = () => requestAnimationFrame(marcar);
    marcar();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.ru-paso'); if (!b) return;
    const g = Math.max(1, Math.min(Z.LINEA.length, actual + (+b.dataset.paso)));
    document.getElementById('g' + g).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  Z.cargar().then(() => {
    pintar();
    if (location.hash) { const el = document.querySelector(location.hash); if (el) setTimeout(() => el.scrollIntoView(), 50); }
    Z.alCambiar(pintar);
  }).catch((err) => {
    document.getElementById('ru-linea').innerHTML = `<li class="error">${Z.L('No se pudo cargar el árbol', 'The tree could not be loaded')} (${Z.esc(err.message)}).</li>`;
  });
})();
