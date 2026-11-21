// El árbol completo: crece hacia arriba, de la raíz (廿九郎公) a las ramas más nuevas.
'use strict';

(function () {
  const Z = window.ZUPU;
  const DX = 64, DY = 120;
  const RAIZ_ID = 'ANC_NIANJIULANG';
  const MARCAS = {
    registro_incompleto: ['Registro incompleto', 'Incomplete record'],
    datos_incompletos: ['Datos incompletos', 'Incomplete data'],
    dato_sospechoso: ['Dato dudoso', 'Doubtful data'],
    ubicacion_por_confirmar: ['Ubicación por confirmar', 'Location to be confirmed'],
    traduccion_por_revisar: ['Traducción por revisar', 'Translation under review'],
    adopcion: ['Adopción (過繼)', 'Adoption (過繼)'],
    fecha_notable: ['Fecha notable', 'Notable date'],
    curiosidad: ['Curiosidad', 'Curiosity'],
  };

  let svg, capa, zoom, root, sel = null, k = 1;
  const estado = (p) => ((p.story_spa || '').trim() ? 'madura' : (p.flags || []).includes('registro_incompleto') ? 'vacia' : 'verde');
  const simbolo = { madura: '#fruto', verde: '#fruto-verde', vacia: '#fruto-vacio' };
  const ancho = () => document.getElementById('ar-lienzo').clientWidth;
  const alto = () => document.getElementById('ar-lienzo').clientHeight;

  document.getElementById('ar-buscador')._alElegir = (id) => foco(id, true);

  function construir() {
    const hacer = (id) => {
      const p = Z.byId[id]; if (!p) return null;
      const ch = (Z.kids[id] || []).map(hacer).filter(Boolean);
      return { p, children: ch.length ? ch : null };
    };
    root = d3.hierarchy(hacer(RAIZ_ID));
    root.each((d) => { d.id = d.data.p.id; d.total = d.descendants().length - 1; });
    // Se abren la línea directa y las primeras generaciones; el resto queda plegado
    root.each((d) => { if (d.children && !d.data.p.rodrigo && d.depth >= 6) { d._children = d.children; d.children = null; } });
  }

  function iniciar() {
    svg = d3.select('#ar-svg');
    capa = svg.append('g');
    capa.append('g').attr('class', 'ar-ramas');
    capa.append('g').attr('class', 'ar-frutos');
    zoom = d3.zoom().scaleExtent([0.06, 2.4]).on('zoom', (e) => {
      capa.attr('transform', e.transform); k = e.transform.k;
      svg.attr('class', k < .32 ? 'lejos' : k < .75 ? 'medio' : 'cerca');
    });
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('click', () => ocultarTip());
    construir();
    dibujar();
    document.querySelector('.ar-cargando').remove();
    const m = location.hash.match(/person=([^&]+)/);
    if (m && Z.byId[decodeURIComponent(m[1])]) foco(decodeURIComponent(m[1]), true, false);
    else centrar('PGRANDPA', .85, false);
  }

  function dibujar() {
    d3.tree().nodeSize([DX, DY]).separation((a, b) => (a.parent === b.parent ? 1 : 1.25))(root);
    const nodos = root.descendants(), ramas = root.links();
    const Y = (d) => -d.y;
    const t = d3.transition().duration(matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380).ease(d3.easeCubicOut);

    capa.select('.ar-ramas').selectAll('path').data(ramas, (l) => l.target.id).join(
      (en) => en.append('path').attr('opacity', 0),
      (up) => up,
      (sal) => sal.remove())
      .attr('class', (l) => 'ar-rama' + (l.source.data.p.rodrigo && l.target.data.p.rodrigo ? ' directa' : ''))
      .transition(t).attr('opacity', 1)
      .attr('d', (l) => `M${l.source.x},${Y(l.source) - 14}C${l.source.x},${(Y(l.source) + Y(l.target)) / 2} ${l.target.x},${(Y(l.source) + Y(l.target)) / 2} ${l.target.x},${Y(l.target) + 16}`);

    const g = capa.select('.ar-frutos').selectAll('g.ar-n').data(nodos, (d) => d.id).join((en) => {
      const n = en.append('g').attr('class', 'ar-n').attr('tabindex', 0).attr('role', 'button')
        .attr('transform', (d) => `translate(${d.parent ? d.parent.x0 ?? d.parent.x : d.x},${d.parent ? -(d.parent.y0 ?? d.parent.y) : -d.y})`);
      n.append('circle').attr('class', 'hit').attr('r', 22);
      n.append('circle').attr('class', 'anillo').attr('r', 19);
      n.append('use').attr('x', -14).attr('y', -18).attr('width', 28).attr('height', 32);
      n.append('text').attr('class', 'n-zh').attr('y', 30).attr('text-anchor', 'middle');
      n.append('text').attr('class', 'n-py').attr('y', 46).attr('text-anchor', 'middle');
      const b = n.append('g').attr('class', 'n-mas').attr('transform', 'translate(15,-14)');
      b.append('rect').attr('rx', 8).attr('height', 16).attr('y', -8);
      b.append('text').attr('y', 4).attr('text-anchor', 'middle');
      n.on('click', (e, d) => { e.stopPropagation(); tocar(d); })
        .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(d); } })
        .on('mouseenter', (e, d) => tip(e, d)).on('mouseleave', ocultarTip);
      return n;
    });
    g.attr('class', (d) => `ar-n ${estado(d.data.p)}${d.data.p.rodrigo ? ' directa' : ''}${d.id === sel ? ' sel' : ''}`)
      .attr('aria-label', (d) => `${Z.zh(d.data.p)} ${d.data.p.py || ''}, ${Z.L('generación', 'generation')} ${d.data.p.gen}`);
    g.select('use').attr('href', (d) => simbolo[estado(d.data.p)]);
    g.select('.n-zh').text((d) => Z.zhSinApellido(d.data.p) || Z.zh(d.data.p));
    g.select('.n-py').text((d) => (d.data.p.py_plain || '').replace(/^Xu\s+/i, ''));
    g.select('.n-mas').style('display', (d) => (d._children ? null : 'none'))
      .each(function (d) {
        if (!d._children) return;
        const txt = '+' + d.total;
        const w = 10 + txt.length * 7;
        d3.select(this).select('rect').attr('width', w).attr('x', 0);
        d3.select(this).select('text').attr('x', w / 2).text(txt);
      });
    g.transition(t).attr('transform', (d) => `translate(${d.x},${Y(d)})`);
    nodos.forEach((d) => { d.x0 = d.x; d.y0 = d.y; });
  }

  function tocar(d) {
    if (d.id === sel && d.children && d.depth > 0) { d._children = d.children; d.children = null; dibujar(); return; }
    if (d._children) { d.children = d._children; d._children = null; }
    sel = d.id;
    dibujar();
    abrirFicha(d.data.p);
  }

  function abrirCadena(id) {
    const c = new Set(Z.cadena(id));
    root.each((d) => { if (c.has(d.id) && d._children) { d.children = d._children; d._children = null; } });
  }
  function nodo(id) { let n = null; root.each((d) => { if (d.id === id) n = d; }); return n; }

  function centrar(id, escala, animar) {
    const d = nodo(id); if (!d) return;
    const s = escala || Math.max(k, .8);
    const ficha = document.getElementById('ar-ficha');
    const libre = !ficha.hidden && innerWidth > 900 ? ficha.offsetWidth : 0;
    const abajo = !ficha.hidden && innerWidth <= 900 ? alto() * .45 : 0;
    const tr = d3.zoomIdentity.translate((ancho() - libre) / 2 - d.x * s, (alto() - abajo) / 2 + d.y * s).scale(s);
    (animar === false ? svg : svg.transition().duration(600).ease(d3.easeCubicInOut)).call(zoom.transform, tr);
  }

  function foco(id, abrir, animar) {
    abrirCadena(id);
    sel = id;
    dibujar();
    if (abrir) abrirFicha(Z.byId[id]);
    centrar(id, Math.max(k, .9), animar);
  }

  // ── Ficha de persona: campos fijos en posiciones fijas ──
  const fila = (et, val, html) => `<div class="af-f${val ? '' : ' vacio'}"><dt>${et}</dt><dd>${val ? (html ? val : Z.esc(Z.simp(val))) : '—'}</dd></div>`;
  const chip = (p) => `<a class="af-chip" href="#person=${encodeURIComponent(p.id)}" data-id="${Z.esc(p.id)}"><span class="zh">${Z.esc(Z.zh(p))}</span></a>`;

  function abrirFicha(p) {
    if (!p) return;
    const ficha = document.getElementById('ar-ficha');
    const padre = p.pid ? Z.byId[p.pid] : null;
    const bio = p.pid_biologico ? Z.byId[p.pid_biologico] : null;
    const hijos = (Z.kids[p.id] || []).map((i) => Z.byId[i]).filter(Boolean);
    const hist = Z.historia(p), notas = Z.notas(p);
    const marcas = (p.flags || []).map((f) => (MARCAS[f] ? Z.L(MARCAS[f][0], MARCAS[f][1]) : f));
    const entierro = Z.lang === 'en' ? (p.burial_spa ? '' : p.burial) || p.burial_spa : p.burial_spa || p.burial;
    const migas = Z.cadena(p.id).reverse().slice(-5, -1).map((i) => chip(Z.byId[i])).join('<span class="af-sep" aria-hidden="true">›</span>');
    document.getElementById('af-cuerpo').innerHTML = `
      <div class="af-migas">${migas}</div>
      <p class="af-gen num">${Z.L('Generación', 'Generation')} ${p.gen}${p.gen_heling ? ` <span>· Hèlíng ${p.gen_heling}</span>` : ''}${p.gen_wuhua ? ` <span>· Wǔhuá ${p.gen_wuhua}</span>` : ''}</p>
      <h1 class="af-zh zh" id="af-zh">${Z.esc(Z.zh(p))}</h1>
      <p class="af-py">${Z.esc(p.py || '')}</p>
      ${p.rodrigo ? `<p class="af-directa"><svg aria-hidden="true"><use href="#fruto"/></svg>${Z.L('Línea directa a Chile', 'Direct line to Chile')}</p>` : ''}
      <dl class="af-campos">
        ${fila(Z.L('Nombre civil', 'Civil name'), p.civil_name_es)}
        ${fila(Z.L('Hakka', 'Hakka'), p.hakka_py)}
        ${fila(Z.L('Otro nombre', 'Other name'), p.alias)}
        ${fila(Z.L('Rama', 'Branch'), Z.rama(p.branch))}
        ${fila(Z.L('Padre', 'Father') + (bio ? ' · ' + Z.L('adoptivo', 'adoptive') : ''), padre ? chip(padre) : '', true)}
        ${bio ? fila(Z.L('Padre biológico', 'Biological father'), chip(bio), true) : ''}
        ${fila(Z.L('Esposas', 'Wives'), (p.spouses || []).join(' · '))}
        ${fila(Z.L('Hijos', 'Children') + (hijos.length ? ` (${hijos.length})` : ''), hijos.map(chip).join(''), true)}
        ${fila(Z.L('Nacimiento', 'Born'), p.birth)}
        ${fila(Z.L('Muerte', 'Died'), p.death)}
        ${fila(Z.L('Lugar', 'Place'), p.place)}
        ${fila(Z.L('Migración', 'Migration'), p.migration)}
        ${fila(Z.L('Entierro', 'Burial'), entierro)}
        ${fila(Z.L('Fuente', 'Source'), Z.procedencia(p.provenance))}
      </dl>
      ${marcas.length ? `<ul class="af-marcas">${marcas.map((m) => `<li>${Z.esc(m)}</li>`).join('')}</ul>` : ''}
      ${hist ? `<section class="af-texto"><h2>${p.branch === 'chile' && !p.rodrigo ? Z.L('El nombre', 'The name') : Z.L('Historia', 'Story')}</h2>${Z.md(hist)}</section>` : ''}
      ${notas ? `<section class="af-texto af-notas"><h2>${Z.L('Notas del zupu', 'Notes from the zupu')}</h2><p>${Z.esc(notas)}</p></section>` : ''}
      <div class="af-acciones">
        <button type="button" class="boton" data-copiar="${Z.esc(p.id)}"><svg aria-hidden="true"><use href="#i-enlace"/></svg>${Z.L('Copiar enlace', 'Copy link')}</button>
        ${p.rodrigo ? `<a class="boton" href="../ruta/#g${p.gen}">${Z.L('En la ruta familiar', 'In the family line')}</a>` : ''}
      </div>`;
    ficha.hidden = false;
    ficha.scrollTop = 0;
    document.body.classList.add('con-ficha');
    history.replaceState(null, '', '#person=' + encodeURIComponent(p.id));
  }
  function cerrarFicha() {
    document.getElementById('ar-ficha').hidden = true;
    document.body.classList.remove('con-ficha');
    sel = null; dibujar();
    history.replaceState(null, '', location.pathname + location.search);
  }

  // ── Tooltip ──
  function tip(e, d) {
    if (matchMedia('(hover: none)').matches) return;
    const el = document.getElementById('ar-tip'), p = d.data.p;
    el.innerHTML = `<span class="zh">${Z.esc(Z.zh(p))}</span> ${Z.esc(p.py || '')}<br><span class="t-meta">${Z.L('Gen.', 'Gen.')} ${p.gen}${p.place ? ' · ' + Z.esc(Z.lugar(p.place)) : ''}</span>`;
    el.hidden = false;
    el.style.left = (e.clientX + 16) + 'px'; el.style.top = (e.clientY + 12) + 'px';
  }
  function ocultarTip() { document.getElementById('ar-tip').hidden = true; }

  // ── Controles ──
  document.addEventListener('click', (e) => {
    const c = e.target.closest('.af-chip');
    if (c) { e.preventDefault(); foco(c.dataset.id, true); return; }
    if (e.target.closest('.af-cerrar')) { cerrarFicha(); return; }
    const cp = e.target.closest('[data-copiar]');
    if (cp) {
      const url = location.origin + location.pathname + '#person=' + cp.dataset.copiar;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => Z.aviso(Z.L('Enlace copiado', 'Link copied')), () => prompt(Z.L('Copia este enlace:', 'Copy this link:'), url));
      return;
    }
    const z = e.target.closest('[data-zoom]');
    if (!z || !svg) return;
    const v = z.dataset.zoom;
    if (v === 'linea') { abrirCadena('PRODRIGO'); dibujar(); centrar(sel || 'PGRANDPA', .85); }
    else if (v === 'todo') {
      const abierto = z.classList.toggle('abierto');
      if (abierto) root.each((d) => { if (d._children) { d.children = d._children; d._children = null; } });
      else root.each((d) => { if (d.children && !d.data.p.rodrigo && d.depth >= 6) { d._children = d.children; d.children = null; } });
      z.innerHTML = abierto ? `<span data-en="Fold">${Z.L('Plegar', 'Fold')}</span>` : `<span data-en="Open all">${Z.L('Abrir todo', 'Open all')}</span>`;
      dibujar();
    } else svg.transition().duration(300).call(zoom.scaleBy, +v);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.getElementById('ar-ficha').hidden) cerrarFicha(); });
  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/person=([^&]+)/);
    if (m && Z.byId[decodeURIComponent(m[1])] && decodeURIComponent(m[1]) !== sel) foco(decodeURIComponent(m[1]), true);
  });

  Z.cargar().then(() => {
    iniciar();
    Z.alCambiar(() => { dibujar(); if (sel) abrirFicha(Z.byId[sel]); });
  }).catch((err) => {
    document.querySelector('.ar-cargando').outerHTML = `<p class="error ar-cargando">${Z.L('No se pudo cargar el árbol', 'The tree could not be loaded')} (${Z.esc(err.message)}).</p>`;
  });
})();
