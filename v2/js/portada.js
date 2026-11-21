// Portada: el árbol de la línea directa, el poema generacional y las cifras.
'use strict';

(function () {
  const Z = window.ZUPU;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 700, H = 900;
  const POEMA = ['敬', '文', '英', '發', '富', '奕', '世', '兆', '禎', '祥'];
  const POEMA_S = { '發': '发', '禎': '祯' };

  const el = (tag, attrs, padre) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(n);
    return n;
  };

  // Tronco: curva suave de la raíz (abajo) a la copa (arriba)
  const troncoX = (t) => 330 + 46 * Math.sin(t * Math.PI * 1.35 + .3) - 24 * t;
  const troncoY = (t) => 860 - t * 800;

  function dibujar() {
    const svg = document.getElementById('arbol-linea');
    if (!svg) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const linea = Z.LINEA;
    const n = linea.length;

    // Copa: hojas de fondo
    const fondo = el('g', { 'aria-hidden': 'true' }, svg);
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let i = 0; i < 70; i++) {
      const t = .1 + rnd() * .92;
      const x = troncoX(t) + (rnd() - .5) * 520 * (.4 + t * .7);
      const y = troncoY(t) + (rnd() - .5) * 70;
      const a = (rnd() - .5) * 140;
      el('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: (22 + rnd() * 20).toFixed(1), ry: (7 + rnd() * 5).toFixed(1),
        transform: `rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`, class: 'al-hoja ' + ['b', 'c', ''][i % 3] }, fondo);
    }

    // Raíces
    const raices = el('g', { 'aria-hidden': 'true' }, svg);
    [[-1, 90, 34], [1, 110, 30], [-1, 170, 18], [1, 190, 16], [0, 40, 14]].forEach(([s, l, w]) => {
      const x0 = troncoX(0), y0 = troncoY(0);
      el('path', { d: `M${x0},${y0 - 6}C${x0 + s * l * .3},${y0 + 10} ${x0 + s * l * .7},${y0 + 14} ${x0 + s * l},${y0 + 34}`, class: 'al-raiz', 'stroke-width': w * .5 }, raices);
    });

    // Tronco con ancho decreciente
    const pasos = 60, izq = [], der = [];
    for (let i = 0; i <= pasos; i++) {
      const t = i / pasos, x = troncoX(t), y = troncoY(t), w = 30 * (1 - t) + 5;
      izq.push(`${(x - w / 2).toFixed(1)},${y.toFixed(1)}`); der.unshift(`${(x + w / 2).toFixed(1)},${y.toFixed(1)}`);
    }
    el('path', { d: `M${izq.join('L')}L${der.join('L')}Z`, class: 'al-tronco', 'aria-hidden': 'true' }, svg);
    const vetas = el('g', { 'aria-hidden': 'true' }, svg);
    [-.25, .2].forEach((o) => {
      const p = [];
      for (let i = 0; i <= 40; i++) { const t = i / 40 * .8; p.push(`${(troncoX(t) + o * (30 * (1 - t) + 5)).toFixed(1)},${troncoY(t).toFixed(1)}`); }
      el('path', { d: 'M' + p.join('L'), class: 'al-veta' }, vetas);
    });

    // Hitos de época a la izquierda
    const hitos = el('g', { 'aria-hidden': 'true' }, svg);
    [[1, Z.L('c. 1100 · dinastía Song', 'c. 1100 · Song dynasty')], [11, Z.L('1403 · Wǔhuá', '1403 · Wǔhuá')], [21, Z.L('1740 · Hèshān', '1740 · Hèshān')], [28, Z.L('1927 · Chile', '1927 · Chile')]].forEach(([g, txt]) => {
      const t = (g - 1) / (n - 1), y = troncoY(t);
      el('line', { x1: 0, x2: troncoX(t) - 26, y1: y, y2: y, class: 'al-hito-l' }, hitos);
      const tx = el('text', { x: 0, y: y - 7, class: 'al-hito' }, hitos); tx.textContent = txt;
    });

    // Frutos
    const frutos = el('g', {}, svg);
    linea.forEach((p, i) => {
      const t = i / (n - 1), x = troncoX(t), y = troncoY(t);
      const lado = i % 2 ? 1 : -1;
      const largo = 74 + 52 * Math.abs(Math.sin(i * 1.7));
      const fx = x + lado * largo, fy = y - 16 - 10 * Math.abs(Math.cos(i));
      const chile = p.branch === 'chile' || p.id === 'PGRANDPA';
      const g = el('g', { class: 'al-fruto' + (chile ? ' chile' : ''), tabindex: '0', role: 'button', 'data-id': p.id,
        'aria-label': `${Z.L('Generación', 'Generation')} ${p.gen}: ${Z.zh(p)} ${p.py || ''}` }, frutos);
      el('path', { d: `M${x.toFixed(1)},${(y + 4).toFixed(1)}Q${(x + lado * largo * .5).toFixed(1)},${(y - 4).toFixed(1)} ${fx.toFixed(1)},${(fy - 12).toFixed(1)}`, class: 'al-ramita', 'stroke-width': 3 - t * 1.4 }, g);
      el('ellipse', { cx: (x + lado * largo * .55).toFixed(1), cy: (y - 14).toFixed(1), rx: 17, ry: 6, transform: `rotate(${lado * -25} ${(x + lado * largo * .55).toFixed(1)} ${(y - 14).toFixed(1)})`, class: 'al-hoja c' }, g);
      el('circle', { cx: fx, cy: fy, r: 24, class: 'hit' }, g);
      const s = 34;
      el('use', { href: '#fruto-verde', x: fx - s / 2, y: fy - s * .55, width: s, height: s * 1.15 }, g);
      const m = el('use', { href: '#fruto', x: fx - s / 2, y: fy - s * .55, width: s, height: s * 1.15, class: 'madura' }, g);
      m.style.setProperty('--i', i);
      const ancla = lado > 0 ? 'start' : 'end', lx = fx + lado * 22;
      const gen = el('text', { x: lx, y: fy - 6, 'text-anchor': ancla, class: 'al-gen num' }, g); gen.textContent = String(p.gen);
      const etq = el('text', { x: lx, y: fy + 13, 'text-anchor': ancla, class: 'al-etq' }, g); etq.textContent = Z.zh(p);
      g.addEventListener('click', (e) => { e.stopPropagation(); abrir(p, g, fx, fy); });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(p, g, fx, fy); } });
    });
  }

  let abierta = null;
  function abrir(p, g, fx, fy) {
    const ficha = document.getElementById('ficha-fruto');
    const svg = document.getElementById('arbol-linea');
    document.querySelectorAll('.al-fruto.activo').forEach((x) => x.classList.remove('activo'));
    g.classList.add('activo');
    abierta = p.id;
    const nombre = p.civil_name_es ? `<div class="ff-py">${Z.esc(p.civil_name_es)}</div>` : '';
    ficha.innerHTML = `
      <button type="button" class="ff-cerrar" aria-label="${Z.L('Cerrar', 'Close')}"><svg aria-hidden="true"><use href="#i-cerrar"/></svg></button>
      <div class="ff-gen num">${Z.L('Generación', 'Generation')} ${p.gen}</div>
      <div class="ff-zh">${Z.esc(Z.zh(p))}</div>
      <div class="ff-py">${Z.esc(p.py || '')}</div>${nombre}
      ${p.place || p.migration ? `<div class="ff-lugar">${Z.esc(Z.lugar(p.place || p.migration))}${p.birth ? ' · ' + Z.esc(p.birth) : ''}</div>` : ''}
      <div class="ff-enlaces">
        <a href="ruta/#g${p.gen}">${Z.L('Su historia', 'Their story')}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>
        <a href="arbol/#person=${encodeURIComponent(p.id)}">${Z.L('En el árbol', 'In the tree')}</a>
      </div>`;
    ficha.hidden = false;
    ficha.querySelector('.ff-cerrar').addEventListener('click', cerrar);
    // Posición junto al fruto (en escritorio)
    const caja = svg.getBoundingClientRect(), fig = svg.parentElement.getBoundingClientRect();
    const k = Math.min(caja.width / W, caja.height / H);
    const ox = caja.left - fig.left + (caja.width - W * k) / 2, oy = caja.top - fig.top + (caja.height - H * k) / 2;
    const px = ox + fx * k, py = oy + fy * k;
    const ancho = ficha.offsetWidth, alto = ficha.offsetHeight;
    let left = px + 28; if (left + ancho > fig.width) left = px - 28 - ancho;
    let top = Math.max(0, Math.min(py - alto / 2, fig.height - alto));
    ficha.style.left = left + 'px'; ficha.style.top = top + 'px';
  }
  function cerrar() {
    document.getElementById('ficha-fruto').hidden = true;
    document.querySelectorAll('.al-fruto.activo').forEach((x) => x.classList.remove('activo'));
    abierta = null;
  }
  document.addEventListener('click', (e) => { if (abierta && !e.target.closest('#ficha-fruto')) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierta) cerrar(); });

  function poema() {
    const ol = document.getElementById('poema'); if (!ol) return;
    const porGen = {}; Z.LINEA.forEach((p) => { porGen[p.gen] = p; });
    ol.innerHTML = POEMA.map((c, i) => {
      const g = 21 + i, p = porGen[g];
      const car = Z.script === 'simp' && POEMA_S[c] ? POEMA_S[c] : c;
      const vacio = i >= 8;
      const quien = p ? `<a href="ruta/#g${g}">${Z.esc(Z.zh(p))}</a>` : '';
      const py = p ? (vacio ? Z.L('habría sido su carácter', 'would have been his') : Z.esc((p.py || '').replace(/^Xú\s*/, ''))) : '';
      return `<li class="${vacio ? 'vacio' : ''}${g === 28 ? ' abuelo' : ''}"><span class="pv-car" aria-hidden="${vacio}">${car}</span>
        <span class="pv-quien">${quien}</span><span class="pv-py num">${Z.L('Gen.', 'Gen.')} ${g} · ${py}</span></li>`;
    }).join('');
  }

  function cifras() {
    const DB = Z.DB;
    const v = {
      personas: DB.length,
      gens: new Set(DB.map((p) => p.gen)).size,
      migraciones: DB.filter((p) => p.migration).length,
      escritos: 3,
    };
    v.gens = Math.max(...Z.LINEA.map((p) => p.gen));
    document.querySelectorAll('[data-n]').forEach((e) => { if (v[e.dataset.n] != null) e.textContent = v[e.dataset.n].toLocaleString(Z.lang === 'en' ? 'en' : 'es-CL'); });
  }

  function todo() { dibujar(); poema(); cifras(); }

  Z.cargar().then(() => {
    const huerto = document.querySelector('.huerto');
    huerto.classList.add('anima');
    todo();
    Z.alCambiar(() => { cerrar(); huerto.classList.remove('anima'); todo(); });
  }).catch((err) => {
    const fig = document.querySelector('.huerto-arbol');
    if (fig) fig.insertAdjacentHTML('beforeend', `<p class="error">${Z.L('No se pudo cargar el árbol', 'The tree could not be loaded')} (${Z.esc(err.message)}).</p>`);
  });
})();
