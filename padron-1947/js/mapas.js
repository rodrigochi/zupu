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

// ---------- Ruta: carta del Pacífico ----------
dash.draw('mapa_ruta', (el) => {
  const d = CH.listo(el, ['mapa_mundo', 'mapa_china', 'mapa_chile', 'por_lista']);
  if (!d) return;
  const [mundo, china, chile, listas] = d;
  el.replaceChildren();
  const W = Math.max(300, el.clientWidth);
  const chico = W < 600;
  const H = Math.round(Math.min(560, Math.max(260, W * (chico ? 0.78 : 0.5))));
  const M = chico ? 8 : 14; // margen del marco
  const proj = d3.geoEqualEarth().rotate([158, 0])
    .fitExtent([[M + 6, M + 6], [W - M - 6, H - M - 6]], { type: 'MultiPoint', coordinates: chico ? [[90, 44], [-44, -50], [90, -50], [-44, 44]] : [[98, 46], [-58, -48], [98, -48], [-58, 46]] });
  const path = d3.geoPath(proj);
  const svg = CH.svg(el, W, H, L('Carta del Pacífico con las rutas desde el delta del río de las Perlas hasta cada ciudad chilena, con grosor según el número de inscritos', 'Chart of the Pacific with routes from the Pearl River Delta to each Chilean city, sized by number of voters'));
  svg.attr('class', 'pc-carta');
  const defs = svg.append('defs');
  const uid = 'carta' + Math.random().toString(36).slice(2, 7);

  // Mar: degradado suave
  const mar = defs.append('radialGradient').attr('id', `${uid}-mar`).attr('cx', '50%').attr('cy', '45%').attr('r', '75%');
  mar.append('stop').attr('offset', '0%').attr('stop-color', '#eef3f2');
  mar.append('stop').attr('offset', '100%').attr('stop-color', '#d9e3e3');
  const clip = defs.append('clipPath').attr('id', `${uid}-clip`);
  clip.append('rect').attr('x', M).attr('y', M).attr('width', W - 2 * M).attr('height', H - 2 * M);

  // Fondo de papel y marco doble, como una carta antigua
  svg.append('rect').attr('width', W).attr('height', H).attr('rx', 8).style('fill', 'var(--color-panel)');
  const g = svg.append('g').attr('clip-path', `url(#${uid}-clip)`);
  g.append('rect').attr('x', M).attr('y', M).attr('width', W - 2 * M).attr('height', H - 2 * M).style('fill', `url(#${uid}-mar)`);

  // Retícula, trópicos y ecuador
  g.append('path').datum(d3.geoGraticule().step([15, 15])()).attr('d', path)
    .style('fill', 'none').style('stroke', '#8aa3a6').style('stroke-width', 0.5).style('stroke-opacity', 0.35);
  const paralelo = (lat) => ({ type: 'LineString', coordinates: d3.range(-180, 181, 2).map((x) => [x, lat]) });
  [[23.44, L('Trópico de Cáncer', 'Tropic of Cancer')], [0, L('Ecuador', 'Equator')], [-23.44, L('Trópico de Capricornio', 'Tropic of Capricorn')]].forEach(([lat, nombre]) => {
    g.append('path').datum(paralelo(lat)).attr('d', path).style('fill', 'none')
      .style('stroke', lat === 0 ? '#b0894a' : '#9fb4b6').style('stroke-width', lat === 0 ? 0.9 : 0.7).style('stroke-dasharray', lat === 0 ? '6 4' : '2 4');
    if (!chico) {
      const p = proj([-128, lat]);
      g.append('text').attr('x', p[0]).attr('y', p[1] - 4).attr('text-anchor', 'middle').text(nombre)
        .style('font-size', '10px').style('font-style', 'italic').style('letter-spacing', '.06em').style('fill', lat === 0 ? '#8a6a35' : '#7f9597');
    }
  });

  // Tierra firme, China y Chile destacados
  g.append('g').selectAll('path').data(enderezar(CH.filas(mundo))).join('path').attr('d', path)
    .style('fill', '#ece0c6').style('stroke', '#bca37a').style('stroke-width', 0.6);
  g.append('g').selectAll('path').data(enderezar(CH.filas(china))).join('path').attr('d', path)
    .style('fill', (f) => (f.properties.es === 'Guangdong' ? 'color-mix(in oklab, var(--serie-1) 55%, #ece0c6)' : '#e3d2ae'))
    .style('stroke', '#c8ad80').style('stroke-width', 0.35);
  g.append('g').selectAll('path').data(enderezar(CH.filas(chile)).filter((f) => f.properties.tipo !== 'vecino')).join('path').attr('d', path)
    .style('fill', 'color-mix(in oklab, var(--serie-1) 45%, #ece0c6)').style('stroke', 'none');

  // Rótulos geográficos
  const rotulo = (lonlat, texto, tam, extra = {}) => {
    const p = proj(lonlat);
    const t = g.append('text').attr('x', p[0]).attr('y', p[1]).attr('text-anchor', extra.anchor || 'middle').text(texto)
      .style('font-family', 'var(--fuente-serif)').style('font-size', `${tam}px`).style('fill', extra.color || '#6b5744')
      .style('letter-spacing', extra.esp || '.12em').style('font-style', extra.italic ? 'italic' : null).style('pointer-events', 'none');
    if (extra.halo) t.style('paint-order', 'stroke').style('stroke', '#ece0c6').style('stroke-width', 3);
    return t;
  };
  rotulo(chico ? [-160, -24] : [-152, -8], L('OCÉANO PACÍFICO', 'PACIFIC OCEAN'), chico ? 11 : 17, { color: '#5f7a7d', esp: '.32em', italic: true });
  rotulo(chico ? [-160, -31] : [-152, -15], '太 平 洋', chico ? 11 : 16, { color: '#7f9597', esp: '.2em' }).attr('dy', chico ? 10 : 14);
  rotulo(chico ? [96, 38] : [104, 33], 'CHINA 中國', chico ? 10 : 13, { color: 'var(--color-accent)', halo: true, anchor: chico ? 'start' : 'middle' });
  if (!chico) rotulo([-64, -33], 'CHILE', 13, { color: 'var(--color-accent)', anchor: 'start', esp: '.2em', halo: true });
  if (!chico) {
    rotulo([-95, 38], L('AMÉRICA', 'AMERICA'), 11, { color: '#9a8566', esp: '.3em' });
    rotulo([138, 38], L('JAPÓN', 'JAPAN'), 9.5, { color: '#9a8566', anchor: 'start', esp: '.2em' });
    rotulo([136, -25], 'AUSTRALIA', 11, { color: '#9a8566', esp: '.3em' });
    rotulo([-157, 23.5], L('Hawái', 'Hawaii'), 9.5, { color: '#7f9597', italic: true, esp: '.04em' }).attr('dy', -9);
  }

  // Rutas: del delta a cada lista, con degradado oro → rojo y grosor según inscritos
  const tip = CH.tip(el);
  const p0 = proj(ZHONGSHAN);
  const max = d3.max(listas, (r) => r.n) || 1;
  const sel = dash.params().sede;
  const filas = listas.filter((r) => SEDE_XY[r.sede] && r.n > 0).sort((a, b) => b.n - a.n);
  const rutas = g.append('g');
  const curva = (p1, i) => {
    const mx = (p0[0] + p1[0]) / 2, my = Math.min(p0[1], p1[1]) - H * (0.3 + 0.012 * i);
    return `M${p0[0]},${p0[1]} Q${mx},${my} ${p1[0]},${p1[1]}`;
  };
  filas.forEach((r, i) => {
    const p1 = proj(SEDE_XY[r.sede]);
    const gid = `${uid}-r${i}`;
    const lg = defs.append('linearGradient').attr('id', gid).attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', p0[0]).attr('y1', p0[1]).attr('x2', p1[0]).attr('y2', p1[1]);
    lg.append('stop').attr('offset', '0%').attr('stop-color', 'var(--color-gold)');
    lg.append('stop').attr('offset', '100%').attr('stop-color', 'var(--serie-1)');
    const activa = !sel || sel === r.sede;
    const dd = curva(p1, i);
    rutas.append('path').attr('d', dd).attr('class', 'pc-ruta')
      .style('fill', 'none').style('stroke', `url(#${gid})`).style('stroke-linecap', 'round')
      .style('stroke-opacity', activa ? 0.75 : 0.12)
      .style('stroke-width', 1.2 + 9 * Math.sqrt(r.n / max))
      .style('cursor', 'pointer')
      .on('mousemove', (ev) => tip.show(ev, [`${r.sede} ${r.grafia !== r.sede ? r.grafia : ''}`, L(`${r.n} inscritos`, `${r.n} voters`), L(`Sede ${V(r.estado).toLowerCase()}`, `${V(r.estado)} seat`)]))
      .on('mouseleave', () => tip.hide())
      .on('click', () => CH.alternar('sede', r.sede));
    // Flujo animado sobre las rutas activas
    if (activa) rutas.append('path').attr('d', dd).attr('class', 'pc-ruta-flujo').style('fill', 'none').style('pointer-events', 'none')
      .style('stroke', '#fff9f2').style('stroke-opacity', 0.7).style('stroke-width', Math.max(0.8, 1.6 * Math.sqrt(r.n / max)))
      .style('stroke-linecap', 'round').style('stroke-dasharray', '1.5 14').style('animation-delay', `${-i * 0.37}s`);
  });

  // Vapor sobre la ruta más concurrida (a 45 % del trayecto, orientado según la curva)
  if (filas.length) {
    const guia = rutas.append('path').attr('d', curva(proj(SEDE_XY[filas[0].sede]), 0)).style('fill', 'none').style('stroke', 'none').node();
    const L0 = guia.getTotalLength();
    if (L0 > 0) {
      const f = chico ? 0.62 : 0.45;
      const a = guia.getPointAtLength(L0 * f), b = guia.getPointAtLength(L0 * f + 2);
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      const s = chico ? 0.8 : 1.15;
      const barco = g.append('g').attr('transform', `translate(${a.x},${a.y - 9 * s}) rotate(${ang}) scale(${s})`).style('pointer-events', 'none');
      barco.append('path').attr('d', 'M-13,0 L13,0 L9,6 L-10,6 Z').style('fill', 'var(--color-fg2)');
      barco.append('rect').attr('x', -7).attr('y', -5).attr('width', 13).attr('height', 5).attr('rx', 1).style('fill', '#fff9f2').style('stroke', 'var(--color-fg2)').style('stroke-width', 0.8);
      barco.append('rect').attr('x', -1).attr('y', -11).attr('width', 4).attr('height', 6).style('fill', 'var(--serie-1)');
      barco.append('path').attr('d', 'M1,-12 q4,-4 9,-3 q4,1 7,-2').style('fill', 'none').style('stroke', '#a08060').style('stroke-width', 1).style('stroke-linecap', 'round').style('opacity', 0.7);
    }
  }

  // Extremos: sello en el delta y punto en el Norte Grande
  const pc = proj([-70.3, -23]);
  const sello = g.append('g').attr('transform', `translate(${p0[0]},${p0[1]})`).style('pointer-events', 'none');
  sello.append('circle').attr('r', chico ? 6 : 8).style('fill', 'var(--color-bg)').style('stroke', 'var(--color-seal)').style('stroke-width', 2);
  sello.append('circle').attr('r', chico ? 2.5 : 3.2).style('fill', 'var(--color-seal)');
  const et = g.append('g').style('pointer-events', 'none');
  const etiqueta = (pt, lineas, anchor, dx, dy) => {
    const t = et.append('text').attr('x', pt[0] + dx).attr('y', pt[1] + dy).attr('text-anchor', anchor)
      .style('paint-order', 'stroke').style('stroke', '#f3ead6').style('stroke-width', 4).style('stroke-linejoin', 'round');
    lineas.forEach(([txt, est], i) => t.append('tspan').attr('x', pt[0] + dx).attr('dy', i ? '1.2em' : 0).text(txt)
      .style('font-size', est.size).style('font-weight', est.bold ? 700 : null).style('fill', est.color || 'var(--color-fg)').style('font-family', est.serif ? 'var(--fuente-serif)' : null));
  };
  etiqueta(p0, chico ? [['珠江三角洲', { size: '11px', serif: true, color: 'var(--color-accent)' }]]
    : [['珠江三角洲', { size: '14px', serif: true, color: 'var(--color-accent)' }], [L('Delta del río de las Perlas', 'Pearl River Delta'), { size: '11.5px' }]], 'start', 12, 18);
  et.append('circle').attr('cx', pc[0]).attr('cy', pc[1]).attr('r', chico ? 3.5 : 4.5).style('fill', 'var(--color-fg)').style('stroke', '#fff9f2').style('stroke-width', 2);
  if (chico) etiqueta(pc, [[L('Norte Grande', 'Norte Grande'), { size: '11px', serif: true, color: 'var(--color-accent)' }]], 'end', -8, 22);
  else etiqueta(pc, [[L('Norte Grande', 'Norte Grande'), { size: '14px', serif: true, color: 'var(--color-accent)' }], [L('Iquique · Antofagasta', 'Iquique · Antofagasta'), { size: '11px' }]], 'start', 14, 0);

  // Distancia, sobre la ruta
  const km = Math.round(d3.geoDistance(ZHONGSHAN, [-70.15, -20.21]) * 6371 / 100) * 100;
  const pd = proj([-176, 34]);
  const cartel = g.append('g').attr('transform', `translate(${(p0[0] + pc[0]) / 2},${Math.max(M + 22, pd[1])})`).style('pointer-events', 'none');
  const txtKm = chico ? `≈ ${km.toLocaleString(I18N.LOC())} km` : L(`Zhongshan → Iquique · ≈ ${km.toLocaleString('es-CL')} km, casi medio globo`, `Zhongshan → Iquique · ≈ ${km.toLocaleString('en-US')} km, almost half the globe`);
  const tk = cartel.append('text').attr('text-anchor', 'middle').text(txtKm).style('font-family', 'var(--fuente-serif)').style('font-style', 'italic')
    .style('font-size', chico ? '11px' : '13px').style('fill', 'var(--color-fg2)');
  const bb = tk.node().getBBox();
  cartel.insert('rect', 'text').attr('x', bb.x - 10).attr('y', bb.y - 4).attr('width', bb.width + 20).attr('height', bb.height + 8).attr('rx', 999)
    .style('fill', 'rgba(255, 249, 242, .85)').style('stroke', '#c8ad80').style('stroke-width', 0.8);

  // Rosa de los vientos
  if (!chico) {
    const rx = W - M - 46, ry = H - M - 50;
    const rosa = g.append('g').attr('transform', `translate(${rx},${ry})`).style('pointer-events', 'none').style('opacity', 0.85);
    rosa.append('circle').attr('r', 26).style('fill', 'rgba(255, 249, 242, .6)').style('stroke', '#b0894a').style('stroke-width', 0.8);
    rosa.append('circle').attr('r', 21).style('fill', 'none').style('stroke', '#b0894a').style('stroke-width', 0.4);
    const punta = (ang, largo, color) => rosa.append('path').attr('transform', `rotate(${ang})`)
      .attr('d', `M0,${-largo} L4,0 L0,4 L-4,0 Z`).style('fill', color).style('stroke', '#8a6a35').style('stroke-width', 0.4);
    [45, 135, 225, 315].forEach((a) => punta(a, 15, '#e3d2ae'));
    [90, 180, 270].forEach((a) => punta(a, 23, '#f3ead6'));
    punta(0, 23, 'var(--color-seal)');
    rosa.append('text').attr('y', -29).attr('text-anchor', 'middle').text('N').style('font-family', 'var(--fuente-serif)').style('font-size', '11px').style('font-weight', 700).style('fill', 'var(--color-accent)');
  }

  // Marco doble
  svg.append('rect').attr('x', M).attr('y', M).attr('width', W - 2 * M).attr('height', H - 2 * M)
    .style('fill', 'none').style('stroke', '#8a6a35').style('stroke-width', 1.2);
  svg.append('rect').attr('x', M - 4).attr('y', M - 4).attr('width', W - 2 * M + 8).attr('height', H - 2 * M + 8).attr('rx', 3)
    .style('fill', 'none').style('stroke', '#c8ad80').style('stroke-width', 0.6);
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
