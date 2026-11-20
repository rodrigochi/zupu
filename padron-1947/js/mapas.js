// Mapas: ruta transpacífica, Chile, delta del río de las Perlas y China.
const ZHONGSHAN = [113.39, 22.52];
const ANTIPODA = [ZHONGSHAN[0] - 180, -ZHONGSHAN[1]];
const LUGARES_CN = { // coordenadas aproximadas de cada lugar de origen fuera del delta
  '嘉應': [116.12, 24.29], '瓊州': [110.32, 20.04], '雲霄': [117.34, 23.96], '青田': [120.29, 28.14], '吳興': [120.09, 30.87],
  '成都': [104.07, 30.66], '巴縣': [106.5, 29.4], '武昌': [114.31, 30.55], '江陵': [112.19, 30.33], '衡陽': [112.57, 26.89],
  '通縣': [116.66, 39.9], '天津': [117.2, 39.13], '盱眙': [118.5, 33.0], '懷遠': [117.2, 32.97], '武進': [119.9, 31.7], '無錫': [120.31, 31.49],
};
const SEDE_XY = { Arica: [-70.31, -18.48], Iquique: [-70.15, -20.21], Tocopilla: [-70.2, -22.09], Antofagasta: [-70.4, -23.65], Taltal: [-70.48, -25.4], 'Chañaral': [-70.62, -26.35], 'Pueblo Hundido': [-70.05, -26.39], 'Copiapó': [-70.33, -27.37], Vallenar: [-70.76, -28.58], Coquimbo: [-71.34, -29.95], Santiago: [-70.66, -33.45] };

function etiquetasSinChoque(items, minGap, yMin, yMax) {
  items.sort((a, b) => a.y - b.y);
  items.forEach((it, i) => { it.ly = it.y; if (i && it.ly - items[i - 1].ly < minGap) it.ly = items[i - 1].ly + minGap; });
  const exceso = items.length ? items[items.length - 1].ly - yMax : 0;
  if (exceso > 0) { for (let i = items.length - 1; i >= 0; i--) { const lim = i === items.length - 1 ? yMax : items[i + 1].ly - minGap; if (items[i].ly > lim) items[i].ly = lim; } }
  items.forEach((it) => { if (it.ly < yMin) it.ly = yMin; });
  return items;
}

// D3 espera los anillos exteriores en sentido horario; si un polígono cubre más de medio globo, está invertido.
function enderezar(feats) {
  return feats.map((f) => {
    if (!f.geometry || d3.geoArea(f) <= 2 * Math.PI) return f;
    const inv = (rings) => rings.map((r) => r.slice().reverse());
    const g = f.geometry;
    const geometry = g.type === 'Polygon' ? { ...g, coordinates: inv(g.coordinates) } : g.type === 'MultiPolygon' ? { ...g, coordinates: g.coordinates.map(inv) } : g;
    return { ...f, geometry };
  });
}

// ---------- Ruta: mapa de puntos, del delta a Chile ----------
// La tierra se dibuja como una trama de puntos: se pinta el mapa en un canvas oculto
// (un color por capa) y se muestrea el color en el centro de cada punto.
dash.draw('mapa_ruta', (el) => {
  const d = CH.listo(el, ['mapa_mundo', 'mapa_china', 'mapa_chile', 'por_lista']);
  if (!d) return;
  const [mundo, china, chile, listas] = d;
  el.replaceChildren();
  const W = Math.max(300, el.clientWidth);
  const chico = W < 600;
  const H = Math.round(chico ? W * 0.95 : Math.min(540, W * 0.5));
  const marco = chico ? [[97, 42], [-54, -46], [97, -46], [-54, 42]] : [[96, 46], [-40, -50], [96, -50], [-40, 46]];
  const proj = d3.geoEqualEarth().rotate([158, 0]).fitExtent([[4, 4], [W - 4, H - 4]], { type: 'MultiPoint', coordinates: marco });

  // 1. Canvas oculto: tierra (rojo), China (verde), Guangdong (amarillo), Chile (azul)
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const pinta = (feats, color) => { ctx.beginPath(); d3.geoPath(proj, ctx)({ type: 'FeatureCollection', features: feats }); ctx.fillStyle = color; ctx.fill(); };
  const fChina = enderezar(CH.filas(china));
  pinta(enderezar(CH.filas(mundo)), '#f00');
  pinta(fChina, '#0f0');
  pinta(fChina.filter((f) => f.properties.es === 'Guangdong'), '#ff0');
  pinta(enderezar(CH.filas(chile)).filter((f) => f.properties.tipo !== 'vecino'), '#00f');
  const px = ctx.getImageData(0, 0, W, H).data;

  // 2. Trama hexagonal de puntos
  const paso = chico ? 4.6 : Math.max(5.2, Math.min(6.6, W / 160));
  const r = paso * 0.24;
  const capas = { tierra: [], china: [], cantón: [], chile: [] };
  for (let fila = 0, y = paso / 2; y < H; fila++, y += paso * 0.866) {
    for (let x = (fila % 2 ? paso : paso / 2); x < W; x += paso) {
      const i = (Math.round(y) * W + Math.round(x)) * 4;
      const [R, G, B] = [px[i], px[i + 1], px[i + 2]];
      if (B > 128) capas.chile.push([x, y]);
      else if (R > 128 && G > 128) capas.cantón.push([x, y]);
      else if (G > 128) capas.china.push([x, y]);
      else if (R > 128) capas.tierra.push([x, y]);
    }
  }
  const puntos = (lista, rr) => lista.map(([x, y]) => `M${(x - rr).toFixed(1)},${y.toFixed(1)}a${rr},${rr} 0 1,0 ${2 * rr},0a${rr},${rr} 0 1,0 ${-2 * rr},0`).join('');

  const svg = CH.svg(el, W, H, L('Mapa del Pacífico con las rutas desde el delta del río de las Perlas hasta cada ciudad chilena, con grosor según el número de inscritos', 'Map of the Pacific with routes from the Pearl River Delta to each Chilean city, sized by number of voters'));
  svg.attr('class', 'pc-puntos');
  const g = svg.append('g');
  g.append('path').attr('d', puntos(capas.tierra, r)).attr('class', 'pp-tierra');
  g.append('path').attr('d', puntos(capas.china, r)).attr('class', 'pp-china');
  g.append('path').attr('d', puntos(capas.cantón, r * 1.15)).attr('class', 'pp-canton');
  g.append('path').attr('d', puntos(capas.chile, r * 1.15)).attr('class', 'pp-chile');

  // Ecuador, apenas insinuado
  const ecuador = { type: 'LineString', coordinates: d3.range(-180, 181, 2).map((x) => [x, 0]) };
  g.append('path').datum(ecuador).attr('d', d3.geoPath(proj)).attr('class', 'pp-ecuador');
  if (!chico) { const pe = proj([-178, 0]); g.append('text').attr('x', pe[0]).attr('y', pe[1] - 5).attr('class', 'pp-mini').text(L('ECUADOR', 'EQUATOR')); }
  const po = proj(chico ? [-150, -30] : [-150, -32]);
  g.append('text').attr('x', po[0]).attr('y', po[1]).attr('text-anchor', 'middle').attr('class', 'pp-oceano').text(L('Océano Pacífico', 'Pacific Ocean'));
  g.append('text').attr('x', po[0]).attr('y', po[1]).attr('dy', chico ? 15 : 20).attr('text-anchor', 'middle').attr('class', 'pp-oceano-zh').text('太平洋');

  // 3. Rutas: un abanico de arcos finos, uno por lista
  const tip = CH.tip(el);
  const p0 = proj(ZHONGSHAN);
  const max = d3.max(listas, (x) => x.n) || 1;
  const sel = dash.params().sede;
  const filas = listas.filter((x) => SEDE_XY[x.sede] && x.n > 0).sort((a, b) => a.n - b.n);
  const arco = (p1) => {
    const mx = (p0[0] + p1[0]) / 2, my = Math.min(p0[1], p1[1]) - Math.abs(p1[0] - p0[0]) * (chico ? 0.22 : 0.28);
    return `M${p0[0]},${p0[1]} Q${mx},${my} ${p1[0]},${p1[1]}`;
  };
  const rutas = g.append('g');
  const primera = !el.dataset.dibujado;
  el.dataset.dibujado = '1';
  filas.forEach((x, i) => {
    const p1 = proj(SEDE_XY[x.sede]);
    const dd = arco(p1);
    const activa = !sel || sel === x.sede;
    const linea = rutas.append('path').attr('d', dd).attr('class', 'pp-ruta' + (activa ? '' : ' apagada'))
      .style('stroke-width', (chico ? 0.5 : 0.7) + (chico ? 1.6 : 2.4) * Math.sqrt(x.n / max));
    if (primera) {
      const largo = linea.node().getTotalLength();
      linea.style('stroke-dasharray', `${largo} ${largo}`).style('stroke-dashoffset', largo).style('animation-delay', `${0.15 + i * 0.07}s`).classed('entra', true);
    }
    rutas.append('path').attr('d', dd).attr('class', 'pp-hit')
      .on('mousemove', (ev) => { linea.classed('encima', true); tip.show(ev, [`${x.sede}${x.grafia && x.grafia !== x.sede ? ' · ' + x.grafia : ''}`, L(`${x.n} inscritos`, `${x.n} voters`), L(`Sede ${V(x.estado).toLowerCase()}`, `${V(x.estado)} seat`)]); })
      .on('mouseleave', () => { linea.classed('encima', false); tip.hide(); })
      .on('click', () => CH.alternar('sede', x.sede));
    rutas.append('circle').attr('cx', p1[0]).attr('cy', p1[1]).attr('r', chico ? 1.6 : 2).attr('class', 'pp-destino' + (activa ? '' : ' apagada'));
  });

  // 4. Origen: punto con halo
  const og = g.append('g').attr('transform', `translate(${p0[0]},${p0[1]})`).style('pointer-events', 'none');
  og.append('circle').attr('r', chico ? 7 : 10).attr('class', 'pp-halo');
  og.append('circle').attr('r', chico ? 2.6 : 3.4).attr('class', 'pp-origen');

  // 5. Rótulos
  const rot = (x, y, anchor, lineas) => {
    const t = g.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('class', 'pp-rotulo');
    lineas.forEach(([txt, cls], i) => t.append('tspan').attr('x', x).attr('dy', i ? '1.45em' : 0).attr('class', cls).text(txt));
  };
  rot(p0[0] + (chico ? -2 : 0), p0[1] + (chico ? 22 : 30), chico ? 'start' : 'middle',
    [['珠江三角洲', 'pp-zh'], [L('Delta del río de las Perlas', 'Pearl River Delta'), 'pp-cap']]);
  const ns = new Set(filas.map((x) => x.sede)).size;
  const pn = proj(chico ? [-70.3, -26] : [-72, -35]);
  rot(pn[0] + (chico ? -10 : -12), pn[1] + (chico ? 34 : 6), 'end',
    [['智利 · Chile', 'pp-zh'], [L(`${ns} listas, de Arica a Santiago`, `${ns} lists, Arica to Santiago`), 'pp-cap']]);

  // Distancia sobre el vértice del arco principal
  const km = Math.round(d3.geoDistance(ZHONGSHAN, [-70.15, -20.21]) * 6371 / 100) * 100;
  const pIq = proj(SEDE_XY.Iquique);
  const vx = (p0[0] + pIq[0]) / 2, vy = (p0[1] + Math.min(p0[1], pIq[1]) - Math.abs(pIq[0] - p0[0]) * (chico ? 0.22 : 0.28) * 2 + pIq[1]) / 4;
  g.append('text').attr('x', vx).attr('y', vy - (chico ? 10 : 14)).attr('text-anchor', 'middle').attr('class', 'pp-km')
    .text(`≈ ${km.toLocaleString(I18N.LOC())} km`);
  g.append('text').attr('x', vx).attr('y', vy - (chico ? 10 : 14)).attr('dy', '1.5em').attr('text-anchor', 'middle').attr('class', 'pp-cap pp-cap-c')
    .text(L('Zhongshan → Iquique, casi en las antípodas', 'Zhongshan → Iquique, almost antipodal'));
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
  const s = document.createElement('span'); s.textContent = L('inscritos por provincia (escala raíz)', 'voters per province (square-root scale)'); el.appendChild(s);
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
  const svg = CH.svg(el, W, H, L('Mapa del norte y centro de Chile con la cantidad de inscritos por provincia y por localidad', 'Map of northern and central Chile with the number of voters per province and town'));
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
    .on('mousemove', (ev, f) => { if (f.properties.tipo === 'provincia') tip.show(ev, [L(`Provincia de ${f.properties.nombre}`, `${f.properties.nombre} Province`), L(`${pn[f.properties.nombre] || 0} inscritos`, `${pn[f.properties.nombre] || 0} voters`)]); })
    .on('mouseleave', () => tip.hide());
  // Vecinos
  [['Perú', -71.2, -16.9], ['Bolivia', -66.9, -18.6], ['Argentina', -65.6, -28.5], ['Océano Pacífico', -72.9, -31.9]].forEach(([t, x, y]) => {
    const p = proj([x, y]);
    if (p[1] < 4 || p[1] > H - 4) return;
    svg.append('text').attr('x', p[0]).attr('y', p[1]).attr('text-anchor', 'middle').text(V(t))
      .style('font-size', '11px').style('font-style', 'italic').style('fill', 'var(--cds-text-secondary)');
  });
  // Antípoda
  const a = proj(ANTIPODA);
  const ga = svg.append('g').style('pointer-events', 'none');
  ga.append('path').attr('d', `M${a[0] - 6},${a[1] - 6}L${a[0] + 6},${a[1] + 6}M${a[0] - 6},${a[1] + 6}L${a[0] + 6},${a[1] - 6}`).style('stroke', 'var(--color-fg)').style('stroke-width', 1.6);
  ga.append('path').attr('d', `M${a[0]},${a[1] + 7}L${a[0]},${a[1] + 44}`).style('stroke', 'var(--cds-chart-reference)').style('stroke-width', 0.8);
  ga.append('text').attr('x', a[0]).attr('y', a[1] + 56).attr('text-anchor', 'middle').text(L('antípoda de Zhongshan', 'antipode of Zhongshan')).style('font-size', '10.5px').style('fill', 'var(--cds-text-secondary)');
  // Burbujas
  const max = d3.max(locs, (r) => r.n) || 1;
  const rr = d3.scaleSqrt().domain([0, max]).range([0, Math.max(18, Math.min(32, W / 15))]);
  const sel = dash.params().sede;
  const datos = locs.filter((r) => r.n > 0).map((r) => { const p = proj([r.lon, r.lat]); return { ...r, x: p[0], y: p[1], r: Math.max(3, rr(r.n)) }; });
  const g = svg.append('g');
  g.selectAll('circle').data([...datos].sort((x, y) => y.n - x.n)).join('circle')
    .attr('cx', (r) => r.x).attr('cy', (r) => r.y).attr('r', (r) => r.r)
    .style('fill', dash.colors[0]).style('fill-opacity', (r) => (!sel || sel === r.sede ? 0.78 : 0.18))
    .style('stroke', (r) => (sel === r.sede ? 'var(--color-fg)' : r.estado === 'Hipótesis' ? 'var(--color-fg-muted)' : 'var(--color-panel)')).style('stroke-width', (r) => (sel === r.sede ? 2 : 1.5))
    .style('stroke-dasharray', (r) => (r.estado === 'Hipótesis' ? '3 2' : null))
    .style('cursor', 'pointer')
    .on('mousemove', (ev, r) => tip.show(ev, [r.localidad, L(`${r.n} inscritos`, `${r.n} voters`), r.estado === 'Hipótesis' ? L(`Lista ${r.grafia}: ubicación por hipótesis`, `List ${r.grafia}: hypothetical location`) : r.localidad !== r.sede ? L(`En la lista de ${r.sede}`, `On the ${r.sede} list`) : L('Sede de la lista', 'Seat of the list'), V(r.nota)]))
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
    t.append('tspan').text((W < 420 && r.localidad === 'Pueblo Hundido' ? 'P. Hundido' : r.localidad) + (r.estado === 'Hipótesis' ? ' (?) ' : ' '));
    t.append('tspan').text(r.n).style('font-weight', 'var(--cds-font-weight-medium)').style('font-variant-numeric', 'tabular-nums');
    if (lado === 'der') { const tw = t.node().getComputedTextLength() || 90; if (x2 + tw > W - 4) { x2 = W - 4 - tw; t.attr('x', x2); } }
    if (lado === 'izq') { const tw = t.node().getComputedTextLength() || 90; if (x2 - tw < 4) { x2 = 4 + tw; t.attr('x', x2); } }
    lab.insert('path', 'text').attr('d', `M${lado === 'izq' ? r.x - r.r : r.x + r.r},${r.y}L${x2 + (lado === 'izq' ? 2 : -2)},${r.ly - 4}`).style('stroke', 'var(--cds-chart-reference)').style('fill', 'none').style('stroke-width', 0.8);
  });
  pinta(izq, 'izq'); pinta(der, 'der');
});

dash.draw('sin_ubicar', (el) => {
  const g = dash.data('por_lista');
  el.replaceChildren();
  if (g.status !== 'ok') return;
  g.data.filter((r) => r.estado === 'Hipótesis').forEach((r) => {
    const s = document.createElement('span'); s.className = 'pc-chip';
    s.textContent = L(`${r.grafia} → ${r.sede} (?) · ${r.n} inscritos`, `${r.grafia} → ${r.sede} (?) · ${r.n} voters`);
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
  const s = document.createElement('span'); s.textContent = L('inscritos', 'voters'); el.appendChild(s);
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
  const svg = CH.svg(el, W, H, L('Mapa del delta del río de las Perlas con los condados coloreados según el número de inscritos', 'Map of the Pearl River Delta with counties shaded by number of voters'));
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
    .on('mousemove', (ev, f) => { const r = byZh[f.properties.zh]; tip.show(ev, r ? [`${r.zh} ${r.condado}`, L(`${r.n} inscritos (${I18N.N(r.pct)} %)`, `${r.n} voters (${r.pct}%)`), L(`Cantonés: ${r.canton || '—'} · pinyin: ${r.pinyin}`, `Cantonese: ${r.canton || '—'} · pinyin: ${r.pinyin}`)] : [f.properties.zh, L('Sin inscritos en la selección', 'No voters in the selection')]); })
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
    labs.append('text').attr('x', p[0] + 5).attr('y', p[1] - 4).text(V(t)).style('font-size', '10.5px').style('font-style', 'italic').style('fill', 'var(--color-fg)')
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
  const svg = CH.svg(el, W, H, L('Mapa de China con las provincias de origen de los inscritos', 'Map of China with the provinces of origin of the voters'));
  const porProv = {};
  conds.forEach((r) => { porProv[r.provincia] = (porProv[r.provincia] || 0) + r.n; });
  const es2 = { Guangdong: 'Guangdong', Zhejiang: 'Zhejiang', Sichuan: 'Sichuan', Hubei: 'Hubei', Hunan: 'Hunan', Hebei: 'Hebei', Anhui: 'Anhui', Jiangsu: 'Jiangsu', Fujian: 'Fujian' };
  const provDe = (f) => { const e = f.properties.es; if (e === 'Tianjin') return 'Hebei'; if (e === 'Chongqing') return 'Sichuan'; if (e === 'Hainan') return 'Guangdong'; return es2[e] || ''; };
  const pmax = d3.max(Object.values(porProv)) || 1;
  const tip = CH.tip(el);
  svg.append('g').selectAll('path').data(feats).join('path').attr('d', path)
    .style('fill', (f) => { const n = porProv[provDe(f)]; return n ? CH.seq(0.15 + 0.85 * Math.sqrt(n / pmax)) : 'var(--pc-land)'; })
    .style('stroke', 'var(--color-border-line)').style('stroke-width', 0.6)
    .on('mousemove', (ev, f) => { const pv = provDe(f); const n = porProv[pv]; tip.show(ev, [f.properties.es || f.properties.zh, n ? L(`${n} inscritos en ${pv}${pv === 'Guangdong' ? ' (incluye Hainan)' : ''}`, `${n} voters in ${pv}${pv === 'Guangdong' ? ' (incl. Hainan)' : ''}`) : L('Sin inscritos', 'No voters')]); })
    .on('mouseleave', () => tip.hide());
  const pts = conds.filter((r) => LUGARES_CN[r.zh]).map((r) => { const p = proj(LUGARES_CN[r.zh]); return { ...r, x: p[0], y: p[1] }; });
  svg.append('g').selectAll('circle').data(pts).join('circle').attr('cx', (r) => r.x).attr('cy', (r) => r.y).attr('r', (r) => 3 + Math.sqrt(r.n) * 1.6)
    .style('fill', 'var(--color-fg)').style('fill-opacity', 0.8).style('stroke', 'var(--color-panel)').style('stroke-width', 1.2)
    .on('mousemove', (ev, r) => tip.show(ev, [`${r.zh} ${r.condado}`, L(`${r.n} inscritos`, `${r.n} voters`), r.provincia]))
    .on('mouseleave', () => tip.hide());
  const gd = proj([113.3, 22.9]);
  svg.append('circle').attr('cx', gd[0]).attr('cy', gd[1]).attr('r', 5).style('fill', 'none').style('stroke', 'var(--color-fg)').style('stroke-width', 1.5);
  svg.append('text').attr('x', gd[0] - 8).attr('y', gd[1] + 18).attr('text-anchor', 'end').text('delta').style('font-size', '11px').style('fill', 'var(--color-fg)');
});
