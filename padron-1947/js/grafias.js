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
  el.textContent = f ? `${f.length} apellidos` : '—';
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
    row.append('td').attr('class', 'pc-zh pc-big').text(d.apellido);
    row.append('td').attr('class', d.simplificado === d.apellido ? 'pc-zh pc-muted' : 'pc-zh').text(d.simplificado);
    row.append('td').text(d.pinyin);
    row.append('td').text(d.jyutping);
    const h = row.append('td');
    h.append('span').text(d.hakka || '—');
    if (d.hakka_fuente && d.hakka_fuente !== 'apellido') h.append('sup').attr('class', 'pc-mark').text(d.hakka_fuente === 'compuestos' ? 'c' : 'g');
    const gc = row.append('td').attr('class', 'pc-graf');
    if (d.grafias_chile) {
      gc.append('span').text(d.grafias_chile);
      if (d.correspondencia !== 'Directa') gc.append('span').attr('class', 'pc-tag').text(d.correspondencia.toLowerCase());
    } else {
      gc.append('span').attr('class', 'pc-muted').text('sin correspondencia en el cuadro');
    }
    if (d.nota) gc.append('small').attr('class', 'pc-nota').text(d.nota);
    row.append('td').attr('class', 'pc-num').text(d.filas_cuadro || '');
    row.append('td').attr('class', 'pc-num').text(d.inscritos);
  });
});
