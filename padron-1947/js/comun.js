// Utilidades compartidas, barra de filtros, cifras y tablas. (Versión web: sin nombres de personas.)
window.CH = (function () {
  const ORDEN = ['Arica', 'Iquique', 'Tocopilla', 'Antofagasta', 'Taltal', 'Chañaral', 'Copiapó', 'Coquimbo', 'Santiago', '古華埠', '華思拿埠'];
  const CONDADOS = ['Zhongshan', 'Heshan', 'Dongguan'];
  const CH = {
    ORDEN, CONDADOS,
    estadoCruce: 'pct',
    busqueda: '',
    colorCondado(c) { const i = CONDADOS.indexOf(c); return i >= 0 ? dash.colors[i % dash.colors.length] : 'var(--cds-chart-muted)'; },
    seq(t) { const v = Math.max(0, Math.min(1, t)); return `color-mix(in oklab, ${dash.colors[0]} ${Math.round(10 + v * 85)}%, var(--color-panel))`; },
    mix(color, pct) { return `color-mix(in oklab, ${color} ${Math.round(pct)}%, var(--color-panel))`; },
    // Lee varios orígenes; devuelve null y pinta el estado si alguno no está listo.
    listo(el, ids) {
      const ds = ids.map((id) => dash.data(id));
      if (ds.every((d) => d.status === 'ok')) return ds.map((d) => d.data);
      if (ds.some((d) => d.status === 'error' || d.status === 'missing')) {
        el.replaceChildren(); const p = document.createElement('div'); p.className = 'pc-fail'; p.textContent = 'No se pudo cargar'; el.appendChild(p);
      } else if (!el.firstChild || el.firstChild.nodeType !== 3) { el.replaceChildren('—'); }
      return null;
    },
    filas(geo) {
      if (!geo) return [];
      if (Array.isArray(geo)) return geo.map((f) => (typeof f.geometry === 'string' ? { ...f, geometry: JSON.parse(f.geometry) } : f));
      if (geo.features) return geo.features;
      return [];
    },
    tip(el) {
      el.style.position = 'relative';
      const t = document.createElement('div');
      t.className = 'pc-tip'; t.hidden = true; el.appendChild(t);
      return {
        show(ev, lines) {
          t.replaceChildren();
          lines.forEach((l, i) => { const d = document.createElement('div'); if (i === 0) { const b = document.createElement('b'); b.textContent = l; d.appendChild(b); } else { d.textContent = l; if (i > 1) d.className = 'pc-tip-m'; } t.appendChild(d); });
          t.hidden = false;
          const r = el.getBoundingClientRect();
          let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
          const w = t.offsetWidth, h = t.offsetHeight;
          if (x + w > el.clientWidth) x = Math.max(0, ev.clientX - r.left - w - 14);
          if (y + h > el.clientHeight + 40) y = Math.max(0, ev.clientY - r.top - h - 10);
          t.style.left = x + 'px'; t.style.top = y + 'px';
        },
        hide() { t.hidden = true; },
      };
    },
    alternar(nombre, valor) { const p = dash.params(); dash.setParams({ [nombre]: p[nombre] === valor ? '' : valor }); },
    num(v) { return v === null || v === undefined || v === '' ? '—' : String(v); },
    svg(el, w, h, label) {
      const s = d3.select(el).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('role', 'img').attr('aria-label', label);
      return s;
    },
  };
  return CH;
})();

// ---- Controles ----
document.querySelectorAll('#limpiar').forEach((b) => b.addEventListener('click', () => { dash.setParams({ sede: '', condado: '' }); }));
document.querySelectorAll('#buscar').forEach((inp) => inp.addEventListener('input', () => { CH.busqueda = inp.value.trim().toLowerCase(); dash.draw('tabla_padron'); dash.draw('cuenta_tabla'); }));
document.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => {
  CH.estadoCruce = b.getAttribute('data-modo');
  document.querySelectorAll('[data-modo]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  dash.draw('cruce');
}));

dash.draw('f_sede', (sel) => {
  const g = dash.data('por_lista');
  const filas = g.status === 'ok' ? g.data : [];
  sel.replaceChildren(new Option('Todas las listas', ''), ...filas.map((r) => new Option(r.sede === r.grafia ? `${r.sede} (sin identificar)` : `${r.sede} · ${r.grafia}`, r.sede)));
  sel.value = dash.params().sede || '';
  sel.onchange = () => dash.setParams({ sede: sel.value || '' });
});

dash.draw('f_condado', (sel) => {
  const g = dash.data('electores');
  const cuenta = {};
  if (g.status === 'ok') g.data.forEach((e) => { if (e.origen_condado) cuenta[e.origen_condado] = { n: ((cuenta[e.origen_condado] || {}).n || 0) + 1, zh: e.origen_zh }; });
  const ops = Object.entries(cuenta).sort((a, b) => b[1].n - a[1].n);
  sel.replaceChildren(new Option('Todos los condados', ''), ...ops.map(([c, v]) => new Option(`${v.zh} ${c}`, c)));
  sel.value = dash.params().condado || '';
  sel.onchange = () => dash.setParams({ condado: sel.value || '' });
});

dash.draw('estado_filtro', (el) => {
  const p = dash.params();
  const partes = [];
  if (p.sede) partes.push(`lista ${p.sede}`);
  if (p.condado) partes.push(`condado ${p.condado}`);
  el.textContent = partes.length ? `Filtrando por ${partes.join(' y ')}` : 'Sin filtros: todo el padrón';
});

// ---- Cifras ----
const campos = { k1: 'inscritos', k1t: 'total', k2: 'edad_mediana', k2a: 'edad_min', k2b: 'edad_max', k3: 'pct_comerciantes', k4: 'mujeres', k5: 'pct_guangdong', k6: 'condados',
  k_inscritos: 'inscritos', k_listas: 'listas', k_mediana2: 'edad_mediana', k_com2: 'pct_comerciantes', k_top: 'condado_principal', k_toppct: 'pct_condado_principal' };
Object.entries(campos).forEach(([nombre, campo]) => {
  dash.draw(nombre, (el) => {
    const g = dash.data('resumen');
    if (g.status === 'loading') return;
    el.classList.remove('dash-skeleton');
    el.textContent = g.status === 'ok' && g.data && g.data[0] ? CH.num(g.data[0][campo]) : '—';
  });
});
['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11'].forEach((nombre) => {
  const campo = { h1: 'heshan_iquique_pct', h2: 'heshan_santiago_pct', h3: 'heshan_antofagasta_n', h4: 'antofagasta_n', h5: 'zhongshan_menores_pct', h6: 'dongguan_antofagasta_pct', h7: 'dongguan_guhua_pct', h8: 'zheng_n', h9: 'zheng_zhongshan', h10: 'lai_n', h11: 'lai_heshan' }[nombre];
  dash.draw(nombre, (el) => {
    const g = dash.data('hallazgos');
    el.textContent = g.status === 'ok' && g.data && g.data[0] ? CH.num(g.data[0][campo]) : '—';
  });
});

// ---- Tablas ----
function filasTabla(tbody, filas, cols) {
  const sel = d3.select(tbody).selectAll('tr').data(filas, (d) => d.id);
  sel.exit().remove();
  const nuevas = sel.enter().append('tr');
  nuevas.merge(sel).attr('data-key', (d) => d.id).each(function (d) {
    const tr = d3.select(this);
    tr.selectAll('td').data(cols.map((c) => ({ c, v: d[c.k] }))).join('td')
      .attr('class', (x) => x.c.cls || null)
      .text((x) => (x.v === null || x.v === undefined || x.v === '' ? '' : x.v));
  }).order();
}

dash.draw('tabla_fuera', (tb) => {
  const g = dash.data('fuera_gd');
  if (g.status !== 'ok') { tb.replaceChildren(); return; }
  filasTabla(tb, g.data, [{ k: 'apellido', cls: 'pc-zh' }, { k: 'apellido_canton' }, { k: 'sexo' }, { k: 'edad', cls: 'pc-num' }, { k: 'origen_zh', cls: 'pc-zh' }, { k: 'origen_provincia' }, { k: 'ocupacion_resuelto', cls: 'pc-zh' }, { k: 'sede' }]);
});

dash.draw('tabla_mujeres', (tb) => {
  const g = dash.data('mujeres');
  if (g.status !== 'ok') { tb.replaceChildren(); return; }
  filasTabla(tb, g.data, [{ k: 'apellido', cls: 'pc-zh' }, { k: 'apellido_canton' }, { k: 'edad', cls: 'pc-num' }, { k: 'origen_zh', cls: 'pc-zh' }, { k: 'origen_condado' }, { k: 'ocupacion_resuelto', cls: 'pc-zh' }, { k: 'sede' }]);
});

function filasPadron() {
  const g = dash.data('electores');
  if (g.status !== 'ok') return null;
  const p = dash.params();
  const q = CH.busqueda;
  const campos = ['apellido', 'apellido_canton', 'apellido_pinyin', 'origen_zh', 'origen_condado', 'origen_canton', 'ocupacion_resuelto', 'ocupacion_cat', 'sede', 'localidad'];
  return g.data.filter((e) => (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado) &&
    (!q || campos.some((c) => e[c] && String(e[c]).toLowerCase().includes(q))));
}
dash.draw('tabla_padron', (tb) => {
  const f = filasPadron();
  if (!f) { tb.replaceChildren(); return; }
  filasTabla(tb, f, [{ k: 'apellido', cls: 'pc-zh' }, { k: 'apellido_canton' }, { k: 'sexo' }, { k: 'edad', cls: 'pc-num' }, { k: 'origen_zh', cls: 'pc-zh' }, { k: 'origen_condado' }, { k: 'ocupacion_resuelto', cls: 'pc-zh' }, { k: 'ocupacion_cat' }, { k: 'sede' }, { k: 'localidad' }]);
});
dash.draw('cuenta_tabla', (el) => {
  const f = filasPadron();
  el.textContent = f ? `${f.length} inscripciones` : '—';
});
