// Apellidos: grafías en Chile y pronunciaciones.

dash.calc('apellidos_tabla', {
  inputs: ['apellidos_grafias', 'electores'],
  title: 'Apellidos con sus grafías y pronunciaciones',
  description: 'Cada apellido del padrón con su forma simplificada, pinyin, jyutping, hakka y grafías chilenas, y cuántas inscripciones lo llevan con los filtros aplicados.',
  fn: (grafias, electores) => {
    const p = dash.params();
    const cuenta = {};
    electores.forEach((e) => {
      if (e.apellido && (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado)) cuenta[e.apellido] = (cuenta[e.apellido] || 0) + 1;
    });
    const total = {};
    electores.forEach((e) => { if (e.apellido) total[e.apellido] = (total[e.apellido] || 0) + 1; });
    return grafias.map((g) => ({ ...g, inscritos: cuenta[g.apellido] || 0, total: total[g.apellido] || 0 }))
      .sort((a, b) => b.inscritos - a.inscritos || b.total - a.total);
  },
});

window.CHG = { q: '', solo: false };
document.querySelectorAll('#buscar-apellido').forEach((inp) => inp.addEventListener('input', () => { CHG.q = inp.value.trim().toLowerCase(); dash.draw('tabla_grafias'); dash.draw('cuenta_grafias'); }));
document.querySelectorAll('#solo-chile').forEach((c) => c.addEventListener('change', () => { CHG.solo = c.checked; dash.draw('tabla_grafias'); dash.draw('cuenta_grafias'); }));

function filasGrafias() {
  const g = dash.data('apellidos_tabla');
  if (g.status !== 'ok' || !g.data) return null;
  const q = CHG.q;
  const campos = ['apellido', 'simplificado', 'pinyin', 'jyutping', 'hakka', 'grafias_chile'];
  const quitar = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const qq = quitar(q);
  return g.data.filter((r) => (!CHG.solo || r.grafias_chile) && (!q || campos.some((c) => r[c] && quitar(r[c]).includes(qq))));
}

dash.draw('cuenta_grafias', (el) => {
  const f = filasGrafias();
  el.textContent = f ? L(`${f.length} apellidos`, `${f.length} surnames`) : '—';
});

dash.draw('tabla_grafias', (tb) => {
  const f = filasGrafias();
  if (!f) { tb.replaceChildren(); return; }
  const sel = d3.select(tb).selectAll('tr').data(f, (d) => d.apellido);
  sel.exit().remove();
  const tr = sel.enter().append('tr').merge(sel).attr('data-key', (d) => d.apellido).order();
  tr.each(function (d) {
    const row = d3.select(this);
    row.selectAll('td').remove();
    row.append('td').attr('class', 'pc-zh pc-big').attr('data-trad', '').text(d.apellido);
    row.append('td').attr('class', d.simplificado === d.apellido ? 'pc-zh pc-muted' : 'pc-zh').text(d.simplificado);
    const oir = (td, modo, grafia) => { td.node().appendChild(PRONUNCIA.boton(d.apellido, modo, grafia)); };
    const pm = row.append('td').attr('class', 'pc-pron-td'); pm.append('span').text(d.pinyin); oir(pm, 'mandarin');
    const pc = row.append('td').attr('class', 'pc-pron-td'); pc.append('span').text(d.jyutping); oir(pc, 'canton');
    const h = row.append('td').attr('class', 'pc-pron-td');
    h.append('span').text(d.hakka || '—');
    if (d.hakka_fuente && d.hakka_fuente !== 'apellido') h.append('sup').attr('class', 'pc-mark').text(d.hakka_fuente === 'compuestos' ? 'c' : 'g');
    if (PRONUNCIA.tieneHakka(d.apellido)) oir(h, 'hakka');
    const gc = row.append('td').attr('class', 'pc-graf');
    if (d.grafias_chile) {
      gc.append('span').text(d.grafias_chile);
      oir(gc, 'chile', d.grafias_chile);
      if (d.correspondencia !== 'Directa') gc.append('span').attr('class', 'pc-tag').text(V(d.correspondencia).toLowerCase());
    } else {
      gc.append('span').attr('class', 'pc-muted').text(L('sin correspondencia en el cuadro', 'no match in the chart'));
    }
    if (d.nota) gc.append('small').attr('class', 'pc-nota').attr('data-trad', '').text(V(d.nota));
    row.append('td').attr('class', 'pc-num').text(d.filas_cuadro || '');
    row.append('td').attr('class', 'pc-num').text(d.inscritos);
  });
});

// ---- 徐 en el padrón: la familia Chi ----
dash.draw('familia_xu', (el) => {
  const d = CH.listo(el, ['electores', 'apellidos_grafias', 'audio']);
  if (!d) return;
  const [electores, grafias] = d;
  const xu = electores.filter((e) => e.apellido === '徐');
  const g = grafias.find((r) => r.apellido === '徐');
  el.replaceChildren();
  if (!xu.length || !g) return;
  const cuenta = (k) => Object.entries(xu.reduce((m, e) => { const v = e[k] || L('sin dato', 'no data'); m[v] = (m[v] || 0) + 1; return m; }, {}))
    .sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v} ${n}`).join(' · ');
  const canton = (xu.find((e) => e.apellido_canton) || {}).apellido_canton || '';
  const cap = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : '');
  const h = (tag, cls, txt) => { const x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; };

  const sello = h('div', 'xu-sello', '徐'); sello.setAttribute('aria-hidden', 'true');
  const cuerpo = h('div');
  cuerpo.appendChild(h('p', 'xu-t', L('徐 en el padrón: la familia Chi', '徐 in the roll: the Chi family')));
  const p = h('p', 'xu-p');
  p.append(L('El padrón tiene ', 'The roll lists '), h('b', '', String(xu.length)), L(' inscritos con el apellido 徐. Condados: ', ' voters with the surname 徐. Counties: '),
    cuenta('origen_condado'), L('. Listas: ', '. Lists: '), cuenta('sede'), '.');
  cuerpo.appendChild(p);
  const pron = h('div', 'xu-pron');
  [['普通話', cap(g.pinyin), 'mandarin'], ['廣東話', `${canton}${g.jyutping ? ` (${g.jyutping})` : ''}`, 'canton'], ['客家話', cap(g.hakka), 'hakka'], [L('En Chile', 'In Chile'), g.grafias_chile, 'chile']].forEach(([k, v, modo], i) => {
    const s = h('span', i >= 2 ? 'xu-match' : '', `${k} ${v || '—'}`);
    if (modo !== 'hakka' || PRONUNCIA.tieneHakka('徐')) s.appendChild(PRONUNCIA.boton('徐', modo, modo === 'chile' ? g.grafias_chile : undefined));
    pron.appendChild(s);
  });
  cuerpo.appendChild(pron);
  cuerpo.appendChild(h('p', 'xu-p', L('La grafía chilena «Chi» se acerca a la lectura hakka (qi), no a la mandarina (xú) ni a la cantonesa (Tsui).',
    'The Chilean spelling “Chi” is close to the Hakka reading (qi), not to the Mandarin (xú) or Cantonese (Tsui) one.')));
  const acc = h('div', 'xu-acc');
  const ver = h('button', '', L('Ver los 徐 en la tabla', 'Show the 徐 in the table'));
  ver.type = 'button';
  ver.addEventListener('click', () => {
    dash.setParams({ sede: '', condado: '' });
    const inp = document.getElementById('buscar');
    if (inp) { inp.value = I18N.zh('徐'); inp.dispatchEvent(new Event('input')); }
    const sec = document.getElementById('explorar');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const arbol = h('a', '', L('Abrir el árbol familiar →', 'Open the family tree →'));
  arbol.href = '../';
  acc.append(ver, arbol);
  cuerpo.appendChild(acc);
  el.append(sello, cuerpo);
});
