// Gráficos: barras por lista y condado, cruce, edades, oficios y apellidos.

function filaBarra(cont, o) {
  const row = document.createElement('div');
  row.className = 'pc-row' + (o.sub ? ' pc-sub-row' : '') + (o.dim ? ' pc-dim' : '');
  row.setAttribute('role', 'button'); row.tabIndex = 0;
  if (o.sel) row.setAttribute('aria-selected', 'true');
  const nm = document.createElement('div'); nm.className = 'pc-row-name';
  nm.appendChild(document.createTextNode(o.nombre));
  if (o.detalle) { const s = document.createElement('small'); s.textContent = o.detalle; nm.appendChild(s); }
  const tr = document.createElement('div'); tr.className = 'pc-track';
  const fi = document.createElement('div'); fi.className = 'pc-fill'; fi.style.width = `${Math.max(o.t > 0 ? 0.8 : 0, o.t * 100)}%`; fi.style.background = o.color || dash.colors[0];
  tr.appendChild(fi);
  const n = document.createElement('div'); n.className = 'pc-row-n'; n.appendChild(document.createTextNode(o.n));
  if (o.pct !== undefined) { const s = document.createElement('small'); s.textContent = L(`${I18N.N(o.pct)} %`, `${o.pct}%`); n.appendChild(s); }
  row.append(nm, tr, n);
  if (o.click) { row.addEventListener('click', o.click); row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.click(); } }); }
  cont.appendChild(row);
}

dash.draw('barras_lista', (el) => {
  const d = CH.listo(el, ['por_lista', 'por_localidad']);
  if (!d) return;
  const [listas, locs] = d;
  el.replaceChildren();
  const max = d3.max(listas, (r) => r.n) || 1;
  const sel = dash.params().sede;
  listas.forEach((r) => {
    filaBarra(el, { nombre: r.sede, detalle: `${r.grafia !== r.sede ? r.grafia + ' · ' : ''}${V(r.estado).toLowerCase()}`, t: r.n / max, n: r.n, pct: r.pct,
      sel: sel === r.sede, dim: sel && sel !== r.sede, color: r.estado === 'Hipótesis' ? 'var(--cds-chart-muted)' : dash.colors[0], click: () => CH.alternar('sede', r.sede) });
    locs.filter((l) => l.sede === r.sede && l.localidad !== r.sede && l.n > 0).forEach((l) => {
      filaBarra(el, { nombre: `↳ ${l.localidad}`, t: l.n / max, n: l.n, sub: true, sel: false, dim: sel && sel !== r.sede, color: CH.mix(dash.colors[0], 55), click: () => CH.alternar('sede', r.sede) });
    });
  });
});

dash.draw('barras_condado', (el) => {
  const d = CH.listo(el, ['por_condado']);
  if (!d) return;
  const [conds] = d;
  el.replaceChildren();
  const max = d3.max(conds, (r) => r.n) || 1;
  const sel = dash.params().condado;
  const top = conds.slice(0, 14);
  const resto = conds.slice(14);
  top.forEach((r) => filaBarra(el, { nombre: `${r.zh} ${r.condado}`, detalle: `${r.canton ? r.canton + ' · ' : ''}${r.pinyin}${r.provincia !== 'Guangdong' ? ' · ' + r.provincia : ''}`,
    t: r.n / max, n: r.n, pct: r.pct, sel: sel === r.condado, dim: sel && sel !== r.condado, click: () => CH.alternar('condado', r.condado) }));
  if (resto.length) {
    const n = d3.sum(resto, (r) => r.n);
    filaBarra(el, { nombre: L(`Otros ${resto.length} lugares`, `${resto.length} other places`), detalle: resto.map((r) => r.zh).join(' '), t: n / max, n, color: 'var(--cds-chart-muted)' });
  }
});

dash.draw('cruce', (el) => {
  const d = CH.listo(el, ['cruce']);
  if (!d) return;
  const [filas] = d;
  el.replaceChildren();
  const modo = CH.estadoCruce;
  const listas = CH.ORDEN;
  const conds = [...new Map(filas.map((r) => [r.condado, r])).values()].sort((a, b) => a.orden - b.orden);
  const W = Math.max(320, el.clientWidth);
  const left = Math.min(150, Math.max(96, W * 0.17)), top = 70;
  const cw = (W - left - 4) / listas.length;
  const ch = Math.max(26, Math.min(36, cw * 0.62));
  const H = top + ch * conds.length + 6;
  const svg = CH.svg(el, W, H, L('Matriz de condados de origen por lista chilena', 'Matrix of counties of origin by Chilean list'));
  const p = dash.params();
  const maxN = d3.max(filas, (r) => r.n) || 1;
  const tip = CH.tip(el);
  listas.forEach((s, j) => {
    const x = left + j * cw + cw / 2;
    svg.append('text').attr('transform', `translate(${x},${top - 8}) rotate(-38)`).text(s).style('font-size', cw < 40 ? '10.5px' : '12px')
      .style('fill', p.sede === s ? 'var(--color-fg)' : 'var(--cds-text-secondary)').style('font-weight', p.sede === s ? 'var(--cds-font-weight-medium)' : null);
  });
  conds.forEach((c, i) => {
    const y = top + i * ch;
    const t = svg.append('text').attr('x', left - 8).attr('y', y + ch / 2 + 4).attr('text-anchor', 'end').style('font-size', '12px')
      .style('fill', p.condado === c.condado ? 'var(--color-fg)' : 'var(--cds-text-secondary)');
    if (c.zh) t.append('tspan').text(c.zh + ' ').style('fill', 'var(--color-fg)').style('font-size', '13px');
    t.append('tspan').text(V(c.condado));
  });
  const cells = svg.append('g').selectAll('g').data(filas).join('g')
    .attr('transform', (r) => `translate(${left + listas.indexOf(r.sede) * cw},${top + r.orden * ch})`)
    .style('cursor', (r) => (r.condado === 'Otros' || r.condado === 'Sin dato' ? 'default' : 'pointer'))
    .on('mousemove', (ev, r) => tip.show(ev, [`${r.sede} · ${r.zh ? r.zh + ' ' : ''}${V(r.condado)}`, L(`${r.n} inscritos`, `${r.n} voters`), L(`${r.pct_lista} % de la lista`, `${r.pct_lista}% of the list`)]))
    .on('mouseleave', () => tip.hide())
    .on('click', (ev, r) => { if (r.condado !== 'Otros' && r.condado !== 'Sin dato') dash.setParams({ sede: r.sede, condado: r.condado }); });
  cells.append('rect').attr('x', 1).attr('y', 1).attr('width', cw - 2).attr('height', ch - 2).attr('rx', 4)
    .style('fill', (r) => { const v = modo === 'pct' ? r.pct_lista / 100 : Math.sqrt(r.n / maxN); return r.n ? CH.seq(modo === 'pct' ? Math.sqrt(v) : v) : 'var(--color-panel)'; })
    .style('stroke', (r) => ((p.sede === r.sede && (!p.condado || p.condado === r.condado)) || (p.condado === r.condado && !p.sede) ? 'var(--color-fg)' : 'var(--color-border-line)'))
    .style('stroke-width', (r) => ((p.sede === r.sede && p.condado === r.condado) ? 2 : 0.6));
  cells.append('text').attr('x', cw / 2).attr('y', ch / 2 + 4).attr('text-anchor', 'middle')
    .text((r) => (r.n ? (modo === 'pct' ? (r.pct_lista || '<1') : r.n) : ''))
    .style('font-size', cw < 34 ? '10px' : '11.5px').style('font-variant-numeric', 'tabular-nums')
    .style('fill', (r) => ((modo === 'pct' ? r.pct_lista >= 35 : r.n / maxN > 0.3) ? 'var(--color-panel)' : 'var(--color-fg)'));
});

dash.draw('hist_edad', (el) => {
  const d = CH.listo(el, ['edades', 'resumen']);
  if (!d) return;
  const [bins, res] = d;
  el.replaceChildren();
  const filas = bins.filter((b) => b.desde >= 10 && b.desde <= 85);
  const W = Math.max(300, el.clientWidth), H = 300, m = { t: 26, r: 8, b: 46, l: 34 };
  const svg = CH.svg(el, W, H, L('Histograma de edades declaradas en tramos de cinco años', 'Histogram of declared ages in five-year bands'));
  const x = d3.scaleBand().domain(filas.map((b) => b.tramo)).range([m.l, W - m.r]).padding(0.12);
  const y = d3.scaleLinear().domain([0, d3.max(filas, (b) => b.n) || 1]).nice().range([H - m.b, m.t]);
  svg.append('g').attr('class', 'pc-axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r))).call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('line').style('stroke', 'var(--cds-chart-grid)'));
  const tip = CH.tip(el);
  const total = d3.sum(filas, (b) => b.n);
  svg.append('g').selectAll('path').data(filas).join('path')
    .attr('d', (b) => { const x0 = x(b.tramo), w = x.bandwidth(), y0 = y(b.n), y1 = y(0), r = Math.min(4, w / 2, y1 - y0); return b.n ? `M${x0},${y1}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + w - r}Q${x0 + w},${y0} ${x0 + w},${y0 + r}V${y1}Z` : ''; })
    .style('fill', dash.colors[0])
    .on('mousemove', (ev, b) => tip.show(ev, [L(`${b.tramo} años`, `Aged ${b.tramo}`), L(`${b.n} inscritos (${I18N.N(b.pct)} %)`, `${b.n} voters (${b.pct}%)`), L(`nacidos hacia ${b.nacidos}`, `born c. ${b.nacidos}`)]))
    .on('mouseleave', () => tip.hide());
  const step = W < 520 ? 2 : 1;
  const ax = svg.append('g').attr('class', 'pc-axis');
  filas.forEach((b, i) => {
    if (i % step) return;
    const cx = x(b.tramo) + x.bandwidth() / 2;
    ax.append('text').attr('x', cx).attr('y', H - m.b + 15).attr('text-anchor', 'middle').text(b.desde);
    if (i % (step * 2) === 0) ax.append('text').attr('x', cx).attr('y', H - m.b + 30).attr('text-anchor', 'middle').text(1947 - b.desde - 2).style('font-size', '10px');
  });
  ax.append('text').attr('x', m.l - 6).attr('y', H - m.b + 15).attr('text-anchor', 'end').text(L('edad', 'age')).style('font-size', '10px');
  ax.append('text').attr('x', m.l - 6).attr('y', H - m.b + 30).attr('text-anchor', 'end').text(L('nac.', 'born')).style('font-size', '10px');
  const med = res[0] && res[0].edad_mediana;
  if (med) {
    const b = filas.find((f) => med >= f.desde && med <= f.hasta);
    if (b) {
      const xm = x(b.tramo) + x.bandwidth() * ((med - b.desde + 0.5) / 5);
      svg.append('line').attr('x1', xm).attr('x2', xm).attr('y1', m.t - 6).attr('y2', H - m.b).style('stroke', 'var(--color-fg)').style('stroke-dasharray', '3 3');
      svg.append('text').attr('x', xm + 5).attr('y', m.t - 10).text(L(`mediana ${med} años · nacidos hacia ${1947 - med}`, `median ${med} · born c. ${1947 - med}`)).style('font-size', '11px').style('fill', 'var(--color-fg)');
    }
  }
  if (!total) svg.append('text').attr('x', W / 2).attr('y', H / 2).attr('text-anchor', 'middle').text(L('Sin edades en la selección', 'No ages in the selection')).style('fill', 'var(--cds-text-secondary)');
});

dash.draw('edad_lista', (el) => {
  const d = CH.listo(el, ['electores', 'edad_por_lista']);
  if (!d) return;
  const [rows, stats] = d;
  el.replaceChildren();
  const p = dash.params();
  const listas = stats.filter((s) => s.n > 0);
  const W = Math.max(300, el.clientWidth), rowH = 27, m = { t: 8, r: 34, b: 26, l: 112 };
  const H = m.t + m.b + rowH * listas.length;
  const svg = CH.svg(el, W, H, L('Edades de los inscritos en cada lista, con mediana y percentiles', 'Ages of the voters on each list, with median and percentiles'));
  const x = d3.scaleLinear().domain([10, 90]).range([m.l, W - m.r]);
  svg.append('g').attr('class', 'pc-axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(W < 450 ? 4 : 8).tickSize(-(H - m.t - m.b)))
    .call((g) => g.select('.domain').remove()).call((g) => g.selectAll('line').style('stroke', 'var(--cds-chart-grid)'));
  const tip = CH.tip(el);
  let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  listas.forEach((s, i) => {
    const yc = m.t + i * rowH + rowH / 2;
    const dim = p.sede && p.sede !== s.sede;
    svg.append('text').attr('x', m.l - 10).attr('y', yc + 4).attr('text-anchor', 'end').text(s.sede).style('font-size', '12px')
      .style('fill', dim ? 'var(--cds-text-secondary)' : 'var(--color-fg)');
    svg.append('rect').attr('x', x(s.p25)).attr('y', yc - 7).attr('width', Math.max(1, x(s.p75) - x(s.p25))).attr('height', 14).attr('rx', 4)
      .style('fill', CH.mix(dash.colors[0], 22)).style('opacity', dim ? 0.4 : 1);
    const pts = rows.filter((e) => e.sede === s.sede && (!p.condado || e.origen_condado === p.condado) && Number(e.edad) > 0);
    svg.append('g').selectAll('circle').data(pts).join('circle')
      .attr('cx', (e) => x(Number(e.edad) + (rnd() - 0.5) * 0.8)).attr('cy', () => yc + (rnd() - 0.5) * (rowH - 9)).attr('r', 2.3)
      .style('fill', dash.colors[0]).style('fill-opacity', dim ? 0.15 : 0.55)
      .on('mousemove', (ev, e) => tip.show(ev, [{ trad: `${e.nombre || '□'}${e.nombre_dudoso ? ' (?)' : ''} · ${L(`${e.edad} años`, `age ${e.edad}`)}` }, `${e.origen_zh || '—'} ${e.origen_condado || ''}`, `${e.ocupacion_resuelto || L('sin oficio', 'no occupation')} · ${e.localidad}`]))
      .on('mouseleave', () => tip.hide());
    svg.append('line').attr('x1', x(s.mediana)).attr('x2', x(s.mediana)).attr('y1', yc - 10).attr('y2', yc + 10).style('stroke', 'var(--color-fg)').style('stroke-width', 2.2).style('opacity', dim ? 0.4 : 1);
    svg.append('text').attr('x', W - m.r + 6).attr('y', yc + 4).text(Math.round(s.mediana)).style('font-size', '11px').style('fill', 'var(--cds-text-secondary)').style('font-variant-numeric', 'tabular-nums');
  });
  svg.append('text').attr('x', W - m.r + 6).attr('y', H - 8).text('med.').style('font-size', '10px').style('fill', 'var(--cds-text-secondary)');
});

dash.draw('oficios', (el) => {
  const d = CH.listo(el, ['oficios']);
  if (!d) return;
  const [filas] = d;
  el.replaceChildren();
  const max = d3.max(filas, (r) => r.n) || 1;
  filas.forEach((r) => {
    const gris = r.categoria === 'Lectura por confirmar' || r.categoria === 'Sin dato';
    filaBarra(el, { nombre: V(r.categoria), detalle: r.terminos, t: r.n / max, n: r.n, pct: r.pct, color: gris ? 'var(--cds-chart-muted)' : dash.colors[0] });
  });
});

dash.draw('leyenda_condados', (el) => {
  el.replaceChildren();
  [...CH.CONDADOS, 'Otro condado'].forEach((c) => {
    const s = document.createElement('span'); const i = document.createElement('i'); i.style.background = CH.colorCondado(c);
    s.appendChild(i); s.appendChild(document.createTextNode(V(c))); el.appendChild(s);
  });
  const s = document.createElement('span'); s.textContent = L('más intenso = apellido más concentrado en ese condado', 'stronger = surname more concentrated in that county'); el.appendChild(s);
});

// ---- Mosaico de apellidos, con selector de pronunciación ----
const cap = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : '');
const PRON = {
  mandarin: { zh: '普通話', es: 'Mandarín', en: 'Mandarin', de: (r, g) => cap((g && g.pinyin) || r.pinyin) },
  canton: { zh: '廣東話', es: 'Cantonés', en: 'Cantonese', de: (r, g) => r.canton || (g && g.jyutping) || '' },
  hakka: { zh: '客家話', es: 'Hakka', en: 'Hakka', de: (r, g) => cap(g && g.hakka) },
  chile: { zh: '智利', es: 'En Chile', en: 'In Chile', de: (r, g) => (g && g.grafias_chile ? g.grafias_chile.split(',')[0].trim() : '') },
};
CH.pron = PRON[new URLSearchParams(location.search).get('pron')] ? new URLSearchParams(location.search).get('pron') : 'canton';
function marcarPron() {
  document.querySelectorAll('[data-pron]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-pron') === CH.pron)));
  document.querySelectorAll('.pc-pron-tabla').forEach((t) => { t.dataset.col = CH.pron; });
}
document.querySelectorAll('[data-pron]').forEach((b) => b.addEventListener('click', () => {
  CH.pron = b.getAttribute('data-pron');
  marcarPron();
  dash.draw('apellidos');
}));
marcarPron();

// Clic en un apellido: lo busca en la tabla de grafías.
function irAGrafia(apellido) {
  const inp = document.getElementById('buscar-apellido');
  if (!inp) return;
  inp.value = I18N.zh(apellido);
  inp.dispatchEvent(new Event('input'));
  const sec = document.getElementById('grafias');
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

dash.draw('apellidos', (el) => {
  const d = CH.listo(el, ['apellidos']);
  if (!d) return;
  const [filas] = d;
  el.replaceChildren();
  if (!filas.length) { const p = document.createElement('div'); p.className = 'pc-fail'; p.textContent = L('Sin apellidos en la selección', 'No surnames in the selection'); el.appendChild(p); return; }
  const W = Math.max(300, el.clientWidth), H = Math.round(Math.min(560, Math.max(380, W * 0.5)));
  const root = d3.hierarchy({ children: filas }).sum((r) => r.n || 0).sort((a, b) => b.value - a.value);
  d3.treemap().size([W, H]).paddingInner(3).round(true).tile(d3.treemapSquarify.ratio(1.3))(root);
  const svg = CH.svg(el, W, H, L('Mosaico de los apellidos más frecuentes, coloreados por el condado donde se concentran', 'Mosaic of the most frequent surnames, coloured by the county where they concentrate'));
  svg.attr('class', 'pc-mosaico');
  const tip = CH.tip(el);
  const gr = dash.data('apellidos_grafias');
  const G = gr.status === 'ok' && Array.isArray(gr.data) ? Object.fromEntries(gr.data.map((r) => [r.apellido, r])) : {};
  const modo = PRON[CH.pron] || PRON.canton;
  const lineas = (r) => {
    const g = G[r.apellido] || {};
    const marca = (k) => (k === CH.pron ? '▸ ' : '');
    return [
      L(`${r.apellido} · ${r.n} inscritos`, `${r.apellido} · ${r.n} voters`),
      `${marca('mandarin')}${PRON.mandarin.zh} ${L('Mandarín', 'Mandarin')}: ${PRON.mandarin.de(r, g) || '—'}`,
      `${marca('canton')}${PRON.canton.zh} ${L('Cantonés', 'Cantonese')}: ${r.canton || '—'}${g.jyutping ? ` (${g.jyutping})` : ''}`,
      `${marca('hakka')}${PRON.hakka.zh} Hakka: ${g.hakka || '—'}`,
      `${marca('chile')}${L('En Chile', 'In Chile')}: ${g.grafias_chile || L('sin correspondencia en el cuadro', 'no match in the chart')}`,
      L(`${r.pct_principal} % de ${r.condado_principal || '—'}`, `${r.pct_principal}% from ${r.condado_principal || '—'}`),
      r.desglose,
      L(`Clic: escuchar en ${PRON[CH.pron].es.toLowerCase()} · doble clic: ver sus grafías`, `Click: listen in ${PRON[CH.pron].en} · double-click: see its spellings`),
    ];
  };
  const g = svg.selectAll('g').data(root.leaves()).join('g').attr('transform', (n) => `translate(${n.x0},${n.y0})`)
    .attr('tabindex', 0).attr('role', 'button')
    .attr('aria-label', (n) => `${n.data.apellido} ${modo.de(n.data, G[n.data.apellido]) || ''}, ${n.data.n}`)
    .on('mousemove', (ev, n) => tip.show(ev, lineas(n.data)))
    .on('mouseleave', () => tip.hide())
    .on('click', function (ev, n) { PRONUNCIA.tocar(n.data.apellido, CH.pron, this, (G[n.data.apellido] || {}).grafias_chile); })
    .on('dblclick', (ev, n) => irAGrafia(n.data.apellido))
    .on('keydown', function (ev, n) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); PRONUNCIA.tocar(n.data.apellido, CH.pron, this, (G[n.data.apellido] || {}).grafias_chile); }
      if (ev.key === 'g') irAGrafia(n.data.apellido);
    });
  g.append('rect').attr('width', (n) => n.x1 - n.x0).attr('height', (n) => n.y1 - n.y0).attr('rx', 5)
    .style('fill', (n) => CH.mix(CH.colorCondado(n.data.condado_principal), 14 + 0.5 * n.data.pct_principal));
  g.each(function (n) {
    const w = n.x1 - n.x0, h = n.y1 - n.y0;
    const chars = n.data.apellido.length;
    const conLinea = h > 52 && w > 46;
    const s = Math.min((w * 0.6) / chars, conLinea ? (h - 26) / 1.25 : h / 1.35, 54);
    if (s < 11) return;
    const gg = d3.select(this);
    const alto = 1.15 * s + (conLinea ? 15 : 0);
    const yc = (h - alto) / 2 + 0.88 * s;
    gg.append('text').attr('x', w / 2).attr('y', yc).attr('text-anchor', 'middle').text(n.data.apellido)
      .style('font-size', `${s}px`).style('font-family', 'var(--fuente-serif)').style('fill', 'var(--color-fg)');
    if (conLinea) {
      const rom = modo.de(n.data, G[n.data.apellido]) || '—';
      const t = gg.append('text').attr('x', w / 2).attr('y', yc + 0.27 * s + 12).attr('text-anchor', 'middle').attr('class', 'pc-rom');
      t.append('tspan').text(rom).style('font-weight', 'var(--cds-font-weight-medium)');
      t.append('tspan').text(` · ${n.data.n}`).style('opacity', 0.7);
      if ((t.node().getComputedTextLength() || 0) > w - 6) { t.selectAll('tspan').remove(); t.text(rom); }
      if ((t.node().getComputedTextLength() || 0) > w - 6) t.text(n.data.n);
    }
  });
});
