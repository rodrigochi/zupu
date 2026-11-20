// Mapas: ruta transpacífica, Chile, delta del río de las Perlas y China.
const ZHONGSHAN = [113.39, 22.52];
const ANTIPODA = [ZHONGSHAN[0] - 180, -ZHONGSHAN[1]];
const LUGARES_CN = { // coordenadas aproximadas de cada lugar de origen fuera del delta
  '嘉應': [116.12, 24.29], '瓊州': [110.32, 20.04], '雲霄': [117.34, 23.96], '青田': [120.29, 28.14], '吳興': [120.09, 30.87],
  '成都': [104.07, 30.66], '巴縣': [106.5, 29.4], '武昌': [114.31, 30.55], '江陵': [112.19, 30.33], '衡陽': [112.57, 26.89],
  '通縣': [116.66, 39.9], '天津': [117.2, 39.13], '盱眙': [118.5, 33.0], '懷遠': [117.2, 32.97], '武進': [119.9, 31.7], '無錫': [120.31, 31.49],
};
const SEDE_XY = { Arica: [-70.31, -18.48], Iquique: [-70.15, -20.21], Tocopilla: [-70.2, -22.09], Antofagasta: [-70.4, -23.65], Taltal: [-70.48, -25.4], 'Chañaral': [-70.62, -26.35], 'Copiapó': [-70.33, -27.37], Coquimbo: [-71.34, -29.95], Santiago: [-70.66, -33.45] };

function etiquetasSinChoque(items, minGap, yMin, yMax) {
  items.sort((a, b) => a.y - b.y);
  items.forEach((it, i) => { it.ly = it.y; if (i && it.ly - items[i - 1].ly < minGap) it.ly = items[i - 1].ly + minGap; });
  const exceso = items.length ? items[items.length - 1].ly - yMax : 0;
  if (exceso > 0) { for (let i = items.length - 1; i >= 0; i--) { const lim = i === items.length - 1 ? yMax : items[i + 1].ly - minGap; if (items[i].ly > lim) items[i].ly = lim; } }
  items.forEach((it) => { if (it.ly < yMin) it.ly = yMin; });
  return items;
}

// ---------- Ruta ----------
dash.draw('mapa_ruta', (el) => {
  const d = CH.listo(el, ['mapa_mundo', 'por_lista']);
  if (!d) return;
  const [mundo, listas] = d;
  el.replaceChildren();
  const W = Math.max(300, el.clientWidth), H = Math.round(Math.min(380, Math.max(170, W * (W < 600 ? 0.52 : 0.36))));
  const proj = d3.geoEqualEarth().rotate([160, 0]).fitExtent([[10, 10], [W - 10, H - 10]], { type: 'MultiPoint', coordinates: [[100, 42], [-58, -40], [100, -40], [-58, 42]] });
  const path = d3.geoPath(proj);
  const svg = CH.svg(el, W, H, 'Mapa del Pacífico con líneas desde el delta del río de las Perlas hasta cada ciudad chilena, con grosor según el número de inscritos');
  svg.append('path').datum({ type: 'Sphere' }).attr('d', path).style('fill', 'var(--pc-water)');
  svg.append('g').selectAll('path').data(CH.filas(mundo)).join('path').attr('d', path).style('fill', 'var(--pc-land)').style('stroke', 'var(--color-border-line)').style('stroke-width', 0.5);
  const tip = CH.tip(el);
  const p0 = proj(ZHONGSHAN);
  const max = d3.max(listas, (r) => r.n) || 1;
  const sel = dash.params().sede;
  const filas = listas.filter((r) => SEDE_XY[r.sede] && r.n > 0);
  const g = svg.append('g');
  filas.forEach((r) => {
    const p1 = proj(SEDE_XY[r.sede]);
    const mx = (p0[0] + p1[0]) / 2, my = Math.min(p0[1], p1[1]) - H * 0.32;
    g.append('path').attr('d', `M${p0[0]},${p0[1]} Q${mx},${my} ${p1[0]},${p1[1]}`)
      .style('fill', 'none').style('stroke', dash.colors[0]).style('stroke-linecap', 'round')
      .style('stroke-opacity', !sel || sel === r.sede ? 0.55 : 0.12)
      .style('stroke-width', 1 + 9 * Math.sqrt(r.n / max))
      .style('cursor', 'pointer')
      .on('mousemove', (ev) => tip.show(ev, [`${r.sede} ${r.grafia !== r.sede ? r.grafia : ''}`, `${r.n} inscritos`, `Sede ${r.estado.toLowerCase()}`]))
      .on('mouseleave', () => tip.hide())
      .on('click', () => CH.alternar('sede', r.sede));
  });
  const pin = (pt, txt, anchor, dx) => {
    svg.append('circle').attr('cx', pt[0]).attr('cy', pt[1]).attr('r', 4).style('fill', 'var(--color-fg)').style('stroke', 'var(--color-panel)').style('stroke-width', 2);
    svg.append('text').attr('x', pt[0] + dx).attr('y', pt[1] + 4).attr('text-anchor', anchor).text(txt).style('font-size', '12px').style('fill', 'var(--color-fg)').style('paint-order', 'stroke').style('stroke', 'var(--color-panel)').style('stroke-width', 3);
  };
  pin(p0, W < 600 ? 'Delta' : 'Delta del río de las Perlas', 'start', 8);
  const pc = proj([-70.3, -23]);
  pin(pc, W < 600 ? 'Chile' : 'Norte de Chile', 'end', -10);
  const km = Math.round(d3.geoDistance(ZHONGSHAN, [-70.15, -20.21]) * 6371 / 100) * 100;
  svg.append('text').attr('x', (p0[0] + pc[0]) / 2).attr('y', Math.max(18, Math.min(p0[1], pc[1]) - H * 0.18)).attr('text-anchor', 'middle')
    .text(W < 600 ? `≈ ${km.toLocaleString('es-CL')} km` : `Zhongshan–Iquique: ≈ ${km.toLocaleString('es-CL')} km en línea recta, casi medio globo`).style('font-size', '12px').style('fill', 'var(--cds-text-secondary)');
});

// ---------- Chile ----------
dash.draw('leyenda_chile', (el) => {
  const g = dash.data('por_provincia');
  el.replaceChildren();
  if (g.status !== 'ok') return;
  const max = d3.max(g.data, (r) => r.n) || 1;
  [0.15, 0.4, 0.7, 1].forEach((t) => {
    const s = document.createElement('span'); const i = document.createElement('i'); i.style.background = CH.mix(dash.colors[0], 10 + 38 * t);
    s.appendChild(i); s.appendChild(document.createTextNode(`${Math.round(max * t * t)}`)); el.appendChild(s);
  });
  const s = document.createElement('span'); s.textContent = 'inscritos por provincia (escala raíz)'; el.appendChild(s);
});

dash.draw('mapa_chile', (el) => {
  const d = CH.listo(el, ['mapa_chile', 'por_localidad', 'por_provincia']);
  if (!d) return;
  const [geo, locs, provs] = d;
  el.replaceChildren();
  const feats = CH.filas(geo);
  const W = Math.max(280, el.clientWidth), H = Math.round(Math.min(780, Math.max(520, W * 1.45)));
  const proj = d3.geoMercator().fitExtent([[0, 6], [W, H - 6]], { type: 'MultiPoint', coordinates: [[-73.4, -17.6], [-64.6, -34.2]] });
  const path = d3.geoPath(proj);
  const svg = CH.svg(el, W, H, 'Mapa del norte y centro de Chile con la cantidad de inscritos por provincia y por localidad');
  svg.append('rect').attr('width', W).attr('height', H).style('fill', 'var(--pc-water)').attr('rx', 6);
  const pmax = d3.max(provs, (r) => r.n) || 1;
  const pn = Object.fromEntries(provs.map((r) => [r.provincia, r.n]));
  const tip = CH.tip(el);
  svg.append('g').selectAll('path').data(feats).join('path').attr('d', path)
    .style('fill', (f) => {
      const t = f.properties.tipo;
      if (t === 'provincia') { const n = pn[f.properties.nombre] || 0; return n ? CH.mix(dash.colors[0], 10 + 38 * Math.sqrt(n / pmax)) : 'var(--color-panel)'; }
      if (t === 'resto') return 'var(--color-panel)';
      return 'var(--pc-land)';
    })
    .style('stroke', (f) => (f.properties.tipo === 'vecino' ? 'var(--color-border-line)' : 'var(--color-fg-muted)'))
    .style('stroke-width', (f) => (f.properties.tipo === 'vecino' ? 0.6 : 0.8))
    .on('mousemove', (ev, f) => { if (f.properties.tipo === 'provincia') tip.show(ev, [`Provincia de ${f.properties.nombre}`, `${pn[f.properties.nombre] || 0} inscritos`]); })
    .on('mouseleave', () => tip.hide());
  // Vecinos
  [['Perú', -71.2, -16.9], ['Bolivia', -66.9, -18.6], ['Argentina', -65.6, -28.5], ['Océano Pacífico', -72.9, -31.9]].forEach(([t, x, y]) => {
    const p = proj([x, y]);
    if (p[1] < 4 || p[1] > H - 4) return;
    svg.append('text').attr('x', p[0]).attr('y', p[1]).attr('text-anchor', 'middle').text(t)
      .style('font-size', '11px').style('font-style', 'italic').style('fill', 'var(--cds-text-secondary)');
  });
  // Antípoda
  const a = proj(ANTIPODA);
  const ga = svg.append('g').style('pointer-events', 'none');
  ga.append('path').attr('d', `M${a[0] - 6},${a[1] - 6}L${a[0] + 6},${a[1] + 6}M${a[0] - 6},${a[1] + 6}L${a[0] + 6},${a[1] - 6}`).style('stroke', 'var(--color-fg)').style('stroke-width', 1.6);
  ga.append('path').attr('d', `M${a[0]},${a[1] + 7}L${a[0]},${a[1] + 44}`).style('stroke', 'var(--cds-chart-reference)').style('stroke-width', 0.8);
  ga.append('text').attr('x', a[0]).attr('y', a[1] + 56).attr('text-anchor', 'middle').text('antípoda de Zhongshan').style('font-size', '10.5px').style('fill', 'var(--cds-text-secondary)');
  // Burbujas
  const max = d3.max(locs, (r) => r.n) || 1;
  const rr = d3.scaleSqrt().domain([0, max]).range([0, Math.max(18, Math.min(32, W / 15))]);
  const sel = dash.params().sede;
  const datos = locs.filter((r) => r.n > 0).map((r) => { const p = proj([r.lon, r.lat]); return { ...r, x: p[0], y: p[1], r: Math.max(3, rr(r.n)) }; });
  const g = svg.append('g');
  g.selectAll('circle').data([...datos].sort((x, y) => y.n - x.n)).join('circle')
    .attr('cx', (r) => r.x).attr('cy', (r) => r.y).attr('r', (r) => r.r)
    .style('fill', dash.colors[0]).style('fill-opacity', (r) => (!sel || sel === r.sede ? 0.78 : 0.18))
    .style('stroke', (r) => (sel === r.sede ? 'var(--color-fg)' : 'var(--color-panel)')).style('stroke-width', (r) => (sel === r.sede ? 2 : 1.5))
    .style('cursor', 'pointer')
    .on('mousemove', (ev, r) => tip.show(ev, [r.localidad, `${r.n} inscritos`, r.localidad !== r.sede ? `En la lista de ${r.sede}` : 'Sede de la lista', r.nota]))
    .on('mouseleave', () => tip.hide())
    .on('click', (ev, r) => CH.alternar('sede', r.sede));
  // Etiquetas: costa a la izquierda, interior a la derecha
  const interior = (r) => r.lon > -69.9;
  const izq = etiquetasSinChoque(datos.filter((r) => !interior(r)).map((r) => ({ ...r })), 15, 10, H - 6);
  const der = etiquetasSinChoque(datos.filter(interior).map((r) => ({ ...r })), 15, 10, H - 6);
  const lab = svg.append('g').style('pointer-events', 'none');
  const xl = proj([-72.4, -20])[0], xr = proj([-66.0, -20])[0];
  const pinta = (arr, lado) => arr.forEach((r) => {
    let x2 = lado === 'izq' ? Math.min(xl, r.x - r.r - 4) : Math.max(xr, r.x + r.r + 4);
    const t = lab.append('text').attr('x', x2).attr('y', r.ly).attr('text-anchor', lado === 'izq' ? 'end' : 'start').style('font-size', W < 420 ? '10.5px' : '11.5px')
      .style('fill', 'var(--color-fg)').style('opacity', !sel || sel === r.sede ? 1 : 0.45)
      .style('paint-order', 'stroke').style('stroke', 'var(--pc-land)').style('stroke-width', 3);
    t.append('tspan').text(r.localidad + ' ');
    t.append('tspan').text(r.n).style('font-weight', 'var(--cds-font-weight-medium)').style('font-variant-numeric', 'tabular-nums');
    if (lado === 'der') { const tw = t.node().getComputedTextLength() || 90; if (x2 + tw > W - 4) { x2 = W - 4 - tw; t.attr('x', x2); } }
    lab.insert('path', 'text').attr('d', `M${lado === 'izq' ? r.x - r.r : r.x + r.r},${r.y}L${x2 + (lado === 'izq' ? 2 : -2)},${r.ly - 4}`).style('stroke', 'var(--cds-chart-reference)').style('fill', 'none').style('stroke-width', 0.8);
  });
  pinta(izq, 'izq'); pinta(der, 'der');
});

dash.draw('sin_ubicar', (el) => {
  const g = dash.data('por_lista');
  el.replaceChildren();
  if (g.status !== 'ok') return;
  g.data.filter((r) => r.estado === 'Sin identificar').forEach((r) => {
    const s = document.createElement('span'); s.className = 'pc-chip';
    s.textContent = `${r.grafia} · ${r.n} inscritos · sin ubicar`;
    el.appendChild(s);
  });
});

// ---------- Delta ----------
dash.draw('leyenda_delta', (el) => {
  const g = dash.data('por_condado');
  el.replaceChildren();
  if (g.status !== 'ok') return;
  const max = d3.max(g.data, (r) => r.n) || 1;
  [0.1, 0.3, 0.6, 1].forEach((t) => {
    const s = document.createElement('span'); const i = document.createElement('i'); i.style.background = CH.seq(Math.sqrt(t));
    s.appendChild(i); s.appendChild(document.createTextNode(`${Math.max(1, Math.round(max * t))}`)); el.appendChild(s);
  });
  const s = document.createElement('span'); s.textContent = 'inscritos'; el.appendChild(s);
});

dash.draw('mapa_delta', (el) => {
  const d = CH.listo(el, ['mapa_delta', 'por_condado']);
  if (!d) return;
  const [geo, conds] = d;
  el.replaceChildren();
  const feats = CH.filas(geo);
  const W = Math.max(280, el.clientWidth), H = Math.round(Math.min(640, Math.max(360, W * 0.82)));
  const proj = d3.geoMercator().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'MultiPoint', coordinates: [[112.25, 21.55], [114.75, 23.75]] });
  const path = d3.geoPath(proj);
  const svg = CH.svg(el, W, H, 'Mapa del delta del río de las Perlas con los condados coloreados según el número de inscritos');
  const clipId = 'pc-clip-delta';
  svg.append('clipPath').attr('id', clipId).append('rect').attr('width', W).attr('height', H).attr('rx', 6);
  const root = svg.append('g').attr('clip-path', `url(#${clipId})`);
  root.append('rect').attr('width', W).attr('height', H).style('fill', 'var(--pc-water)');
  const byZh = Object.fromEntries(conds.map((r) => [r.zh, r]));
  const max = d3.max(conds, (r) => r.n) || 1;
  const sel = dash.params().condado;
  const tip = CH.tip(el);
  const ctx = feats.filter((f) => f.properties.tipo !== 'condado');
  const cty = feats.filter((f) => f.properties.tipo === 'condado');
  root.append('g').selectAll('path').data(ctx).join('path').attr('d', path)
    .style('fill', (f) => (f.properties.tipo === 'hkmo' ? 'color-mix(in oklab, var(--color-fg) 16%, var(--color-panel))' : 'var(--pc-land)'))
    .style('stroke', 'var(--color-border-line)').style('stroke-width', 0.5);
  root.append('g').selectAll('path').data(cty).join('path').attr('d', path)
    .style('fill', (f) => { const r = byZh[f.properties.zh]; return r ? CH.seq(Math.sqrt(r.n / max)) : 'var(--color-panel)'; })
    .style('stroke', (f) => { const r = byZh[f.properties.zh]; return r && sel === r.condado ? 'var(--color-fg)' : 'var(--color-fg-muted)'; })
    .style('stroke-width', (f) => { const r = byZh[f.properties.zh]; return r && sel === r.condado ? 2.2 : 0.7; })
    .style('cursor', (f) => (byZh[f.properties.zh] ? 'pointer' : 'default'))
    .on('mousemove', (ev, f) => { const r = byZh[f.properties.zh]; tip.show(ev, r ? [`${r.zh} ${r.condado}`, `${r.n} inscritos (${String(r.pct).replace('.', ',')} %)`, `Cantonés: ${r.canton || '—'} · pinyin: ${r.pinyin}`] : [f.properties.zh, 'Sin inscritos en la selección']); })
    .on('mouseleave', () => tip.hide())
    .on('click', (ev, f) => { const r = byZh[f.properties.zh]; if (r) CH.alternar('condado', r.condado); });
  // Etiquetas de condados
  const labs = root.append('g').style('pointer-events', 'none');
  cty.forEach((f) => {
    const c = path.centroid(f);
    if (!isFinite(c[0]) || c[0] < 0 || c[0] > W || c[1] < 0 || c[1] > H) return;
    const r = byZh[f.properties.zh];
    const area = path.area(f);
    if (area < 900 && !(r && r.n >= 10)) return;
    const big = r && r.n / max > 0.35;
    const t = labs.append('text').attr('x', c[0]).attr('y', c[1]).attr('text-anchor', 'middle')
      .style('fill', 'var(--color-fg)').style('paint-order', 'stroke').style('stroke', 'color-mix(in oklab, var(--color-panel) 70%, transparent)').style('stroke-width', 3);
    t.append('tspan').attr('x', c[0]).text(f.properties.zh).style('font-size', big ? '17px' : '13px').style('font-family', 'var(--fuente-serif)');
    if (r) t.append('tspan').attr('x', c[0]).attr('dy', '1.15em').text(r.n).style('font-size', '11px').style('font-variant-numeric', 'tabular-nums');
  });
  // Ciudades de referencia
  [['Cantón', 113.26, 23.13], ['Hong Kong', 114.17, 22.3], ['Macao', 113.55, 22.19]].forEach(([t, x, y]) => {
    const p = proj([x, y]);
    labs.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', 2.6).style('fill', 'var(--color-fg)');
    labs.append('text').attr('x', p[0] + 5).attr('y', p[1] - 4).text(t).style('font-size', '10.5px').style('font-style', 'italic').style('fill', 'var(--color-fg)')
      .style('paint-order', 'stroke').style('stroke', 'var(--color-panel)').style('stroke-width', 2.5);
  });
  // Jiaying queda fuera del encuadre
  const jy = byZh['嘉應'];
  if (jy) labs.append('text').attr('x', W - 8).attr('y', 18).attr('text-anchor', 'end').text(`→ 嘉應 Jiaying (Meizhou): ${jy.n}`).style('font-size', '11px').style('fill', 'var(--cds-text-secondary)');
});

// ---------- China ----------
dash.draw('mapa_china', (el) => {
  const d = CH.listo(el, ['mapa_china', 'por_condado']);
  if (!d) return;
  const [geo, conds] = d;
  el.replaceChildren();
  const feats = CH.filas(geo);
  const W = Math.max(260, el.clientWidth), H = Math.round(Math.min(420, Math.max(260, W * 0.78)));
  const proj = d3.geoConicEqualArea().parallels([25, 47]).rotate([-105, 0]).fitExtent([[4, 4], [W - 4, H - 4]], { type: 'MultiPoint', coordinates: [[76, 20], [132, 46], [108, 18], [124, 53]] });
  const path = d3.geoPath(proj);
  const svg = CH.svg(el, W, H, 'Mapa de China con las provincias de origen de los inscritos');
  const porProv = {};
  conds.forEach((r) => { porProv[r.provincia] = (porProv[r.provincia] || 0) + r.n; });
  const es2 = { Guangdong: 'Guangdong', Zhejiang: 'Zhejiang', Sichuan: 'Sichuan', Hubei: 'Hubei', Hunan: 'Hunan', Hebei: 'Hebei', Anhui: 'Anhui', Jiangsu: 'Jiangsu', Fujian: 'Fujian' };
  const provDe = (f) => { const e = f.properties.es; if (e === 'Tianjin') return 'Hebei'; if (e === 'Chongqing') return 'Sichuan'; if (e === 'Hainan') return 'Guangdong'; return es2[e] || ''; };
  const pmax = d3.max(Object.values(porProv)) || 1;
  const tip = CH.tip(el);
  svg.append('g').selectAll('path').data(feats).join('path').attr('d', path)
    .style('fill', (f) => { const n = porProv[provDe(f)]; return n ? CH.seq(0.15 + 0.85 * Math.sqrt(n / pmax)) : 'var(--pc-land)'; })
    .style('stroke', 'var(--color-border-line)').style('stroke-width', 0.6)
    .on('mousemove', (ev, f) => { const pv = provDe(f); const n = porProv[pv]; tip.show(ev, [f.properties.es || f.properties.zh, n ? `${n} inscritos en ${pv}${pv === 'Guangdong' ? ' (incluye Hainan)' : ''}` : 'Sin inscritos']); })
    .on('mouseleave', () => tip.hide());
  const pts = conds.filter((r) => LUGARES_CN[r.zh]).map((r) => { const p = proj(LUGARES_CN[r.zh]); return { ...r, x: p[0], y: p[1] }; });
  svg.append('g').selectAll('circle').data(pts).join('circle').attr('cx', (r) => r.x).attr('cy', (r) => r.y).attr('r', (r) => 3 + Math.sqrt(r.n) * 1.6)
    .style('fill', 'var(--color-fg)').style('fill-opacity', 0.8).style('stroke', 'var(--color-panel)').style('stroke-width', 1.2)
    .on('mousemove', (ev, r) => tip.show(ev, [`${r.zh} ${r.condado}`, `${r.n} inscritos`, r.provincia]))
    .on('mouseleave', () => tip.hide());
  const gd = proj([113.3, 22.9]);
  svg.append('circle').attr('cx', gd[0]).attr('cy', gd[1]).attr('r', 5).style('fill', 'none').style('stroke', 'var(--color-fg)').style('stroke-width', 1.5);
  svg.append('text').attr('x', gd[0] - 8).attr('y', gd[1] + 18).attr('text-anchor', 'end').text('delta').style('font-size', '11px').style('fill', 'var(--color-fg)');
});
