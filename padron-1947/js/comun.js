// Utilidades compartidas, barra de filtros, cifras y tablas. (Versión web con nombres y enlaces al expediente.)
window.CH = (function () {
  const ORDEN = ['Arica', 'Iquique', 'Tocopilla', 'Antofagasta', 'Taltal', 'Chañaral', 'Pueblo Hundido', 'Copiapó', 'Vallenar', 'Coquimbo', 'Santiago'];
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
        el.replaceChildren(); const p = document.createElement('div'); p.className = 'pc-fail'; p.textContent = L('No se pudo cargar', 'Could not load'); el.appendChild(p);
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
          lines.filter((l) => l !== '' && l !== null && l !== undefined).forEach((l, i) => { l = typeof l === 'object' ? l.trad : I18N.zh(l); const d = document.createElement('div'); if (i === 0) { const b = document.createElement('b'); b.textContent = l; d.appendChild(b); } else { d.textContent = l; if (i > 1) d.className = 'pc-tip-m'; } t.appendChild(d); });
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
    // Enlace a una imagen del expediente en el visor del 國史館 (código de página tras «#»).
    urlImagen(img) {
      const c = window.PADRON_CONFIG || {};
      const cod = img && c.paginas ? c.paginas[Number(img)] : null;
      return (c.urlExpediente || '') + (cod ? '#' + cod : '');
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
  sel.replaceChildren(new Option(L('Todas las listas', 'All lists'), ''), ...filas.map((r) => new Option(`${r.sede} · ${r.grafia}${r.estado === 'Hipótesis' ? L(' (hipótesis)', ' (hypothesis)') : ''}`, r.sede)));
  sel.value = dash.params().sede || '';
  sel.onchange = () => dash.setParams({ sede: sel.value || '' });
});

dash.draw('f_condado', (sel) => {
  const g = dash.data('electores');
  const cuenta = {};
  if (g.status === 'ok') g.data.forEach((e) => { if (e.origen_condado) cuenta[e.origen_condado] = { n: ((cuenta[e.origen_condado] || {}).n || 0) + 1, zh: e.origen_zh }; });
  const ops = Object.entries(cuenta).sort((a, b) => b[1].n - a[1].n);
  sel.replaceChildren(new Option(L('Todos los condados', 'All counties'), ''), ...ops.map(([c, v]) => new Option(`${v.zh} ${c}`, c)));
  sel.value = dash.params().condado || '';
  sel.onchange = () => dash.setParams({ condado: sel.value || '' });
});

dash.draw('estado_filtro', (el) => {
  const p = dash.params();
  const partes = [];
  if (p.sede) partes.push(L(`lista ${p.sede}`, `list ${p.sede}`));
  if (p.condado) partes.push(L(`condado ${p.condado}`, `county ${p.condado}`));
  el.textContent = partes.length ? L(`Filtrando por ${partes.join(' y ')}`, `Filtered by ${partes.join(' and ')}`) : L('Sin filtros: todo el padrón', 'No filters: the whole roll');
  el.classList.toggle('pc-status-on', partes.length > 0);
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
    tr.selectAll('td').data(cols.map((c) => ({ c, v: d[c.k], d }))).join('td')
      .attr('class', (x) => x.c.cls || null)
      .each(function (x) {
        const td = this; td.replaceChildren(); td.removeAttribute('data-trad');
        const vacio = x.v === null || x.v === undefined || x.v === '';
        if (x.c.k === 'img') {
          if (vacio) return;
          const a = document.createElement('a'); a.href = CH.urlImagen(x.v); a.target = '_blank'; a.rel = 'noopener';
          a.className = 'pc-fuente'; a.textContent = `img. ${x.v}`;
          a.title = L(`Ver la imagen ${x.v} del expediente 033-020104-0091 en el 國史館`, `See image ${x.v} of file 033-020104-0091 at the 國史館 archive`);
          td.appendChild(a); return;
        }
        if (x.c.k === 'nombre') {
          td.setAttribute('data-trad', ''); // tal como en el manuscrito
          td.textContent = vacio ? '□' : x.v;
          if (x.d.nombre_dudoso) {
            const s = document.createElement('sup'); s.className = 'pc-dudoso'; s.textContent = '?';
            s.title = L('Lectura dudosa: revisar en la imagen', 'Uncertain reading: check the image'); td.appendChild(s);
          }
          return;
        }
        td.textContent = vacio ? '' : V(x.v);
      });
  }).order();
}

dash.draw('tabla_fuera', (tb) => {
  const g = dash.data('fuera_gd');
  if (g.status !== 'ok') { tb.replaceChildren(); return; }
  filasTabla(tb, g.data, [{ k: 'nombre', cls: 'pc-zh pc-nombre' }, { k: 'sexo' }, { k: 'edad', cls: 'pc-num' }, { k: 'origen_zh', cls: 'pc-zh' }, { k: 'origen_provincia' }, { k: 'ocupacion_resuelto', cls: 'pc-zh' }, { k: 'sede' }, { k: 'img' }]);
});

dash.draw('tabla_mujeres', (tb) => {
  const g = dash.data('mujeres');
  if (g.status !== 'ok') { tb.replaceChildren(); return; }
  filasTabla(tb, g.data, [{ k: 'nombre', cls: 'pc-zh pc-nombre' }, { k: 'edad', cls: 'pc-num' }, { k: 'origen_zh', cls: 'pc-zh' }, { k: 'origen_condado' }, { k: 'ocupacion_resuelto', cls: 'pc-zh' }, { k: 'sede' }, { k: 'img' }]);
});

function filasPadron() {
  const g = dash.data('electores');
  if (g.status !== 'ok') return null;
  const p = dash.params();
  const q = CH.busqueda;
  const campos = ['nombre', 'apellido', 'apellido_canton', 'apellido_pinyin', 'origen_zh', 'origen_condado', 'origen_canton', 'ocupacion_resuelto', 'ocupacion_cat', 'sede', 'localidad'];
  return g.data.filter((e) => (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado) &&
    (!q || campos.some((c) => e[c] && [String(e[c]).toLowerCase(), I18N.zh(String(e[c])), String(V(e[c])).toLowerCase()].some((s) => s.includes(q)))));
}
dash.draw('tabla_padron', (tb) => {
  const f = filasPadron();
  if (!f) { tb.replaceChildren(); return; }
  filasTabla(tb, f, [{ k: 'nombre', cls: 'pc-zh pc-nombre' }, { k: 'sexo' }, { k: 'edad', cls: 'pc-num' }, { k: 'origen_zh', cls: 'pc-zh' }, { k: 'origen_condado' }, { k: 'ocupacion_resuelto', cls: 'pc-zh' }, { k: 'ocupacion_cat' }, { k: 'sede' }, { k: 'localidad' }, { k: 'img' }]);
});
dash.draw('cuenta_tabla', (el) => {
  const f = filasPadron();
  el.textContent = f ? L(`${f.length} inscripciones`, `${f.length} entries`) : '—';
});

// ---- Enlaces configurables (contacto y expediente) ----
(function () {
  const c = window.PADRON_CONFIG || {};
  document.querySelectorAll('a[data-contacto]').forEach((a) => { a.href = c.contacto || '#'; a.target = '_blank'; a.rel = 'noopener'; });
  document.querySelectorAll('a[data-expediente]').forEach((a) => { a.href = c.urlExpediente || '#'; a.target = '_blank'; a.rel = 'noopener'; });
})();

// ---- Enlaces que buscan en la tabla: <a href="#explorar" data-buscar="孫邦華"> ----
document.addEventListener('click', (ev) => {
  const a = ev.target.closest && ev.target.closest('a[data-buscar]');
  if (!a) return;
  ev.preventDefault();
  dash.setParams({ sede: '', condado: '' });
  const inp = document.getElementById('buscar');
  if (inp) { inp.value = I18N.zh(a.dataset.buscar); inp.dispatchEvent(new Event('input')); }
  const sec = document.getElementById('explorar');
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
