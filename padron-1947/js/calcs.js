// Cálculos a partir del padrón. Cada uno aplica los filtros de la página (lista y condado) donde corresponde.

dash.calc('resumen', {
  inputs: ['electores'],
  title: 'Resumen de la selección',
  description: 'Totales de las inscripciones que pasan los filtros de lista y condado.',
  fn: (electores) => {
    const p = dash.params();
    const r = electores.filter((e) => (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado));
    const edades = r.map((e) => Number(e.edad)).filter((v) => v > 0).sort((a, b) => a - b);
    const mitad = Math.floor(edades.length / 2);
    const mediana = edades.length ? (edades.length % 2 ? edades[mitad] : (edades[mitad - 1] + edades[mitad]) / 2) : null;
    const conCondado = r.filter((e) => e.origen_condado);
    const cuenta = {};
    conCondado.forEach((e) => { cuenta[e.origen_condado] = (cuenta[e.origen_condado] || 0) + 1; });
    const orden = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
    return [{
      inscritos: r.length,
      total: electores.length,
      listas: new Set(r.map((e) => e.sede)).size,
      edad_mediana: mediana === null ? null : Math.round(mediana),
      edad_min: edades.length ? edades[0] : null,
      edad_max: edades.length ? edades[edades.length - 1] : null,
      pct_comerciantes: pct(r.filter((e) => e.ocupacion_cat === 'Comerciante').length, r.length),
      mujeres: r.filter((e) => e.sexo === 'Mujer').length,
      pct_guangdong: pct(conCondado.filter((e) => e.origen_provincia === 'Guangdong').length, conCondado.length),
      condados: orden.length,
      condado_principal: orden.length ? orden[0][0] : '—',
      pct_condado_principal: orden.length ? pct(orden[0][1], r.length) : null,
    }];
  },
});

dash.calc('por_lista', {
  inputs: ['electores'],
  title: 'Inscritos por lista',
  description: 'Inscripciones por lista (sede) en Chile, de norte a sur, con el filtro de condado aplicado.',
  fn: (electores) => {
    const p = dash.params();
    const orden = ['Arica', 'Iquique', 'Tocopilla', 'Antofagasta', 'Taltal', 'Chañaral', 'Copiapó', 'Coquimbo', 'Santiago', '古華埠', '華思拿埠'];
    const r = electores.filter((e) => !p.condado || e.origen_condado === p.condado);
    return orden.map((sede) => {
      const de = electores.filter((e) => e.sede === sede);
      const n = r.filter((e) => e.sede === sede).length;
      return { sede, grafia: de[0] ? de[0].sede_grafia : '', estado: de[0] ? de[0].sede_estado : '', provincia: de[0] ? de[0].provincia_chile : '', n, pct: r.length ? Math.round((n / r.length) * 100) : 0 };
    });
  },
});

dash.calc('por_localidad', {
  inputs: ['electores'],
  title: 'Inscritos por localidad',
  description: 'Inscripciones por localidad en Chile (sede o localidad leída en el domicilio), con el filtro de condado aplicado.',
  fn: (electores) => {
    const p = dash.params();
    const r = electores.filter((e) => (!p.condado || e.origen_condado === p.condado) && e.lat);
    const m = new Map();
    r.forEach((e) => {
      const k = e.localidad;
      if (!m.has(k)) m.set(k, { localidad: k, sede: e.sede, lat: Number(e.lat), lon: Number(e.lon), nota: e.localidad_nota || '', n: 0 });
      m.get(k).n += 1;
    });
    return [...m.values()].sort((a, b) => b.lat - a.lat);
  },
});

dash.calc('por_provincia', {
  inputs: ['electores'],
  title: 'Inscritos por provincia chilena',
  description: 'Inscripciones por provincia de 1947, con el filtro de condado aplicado. Excluye las listas sin identificar.',
  fn: (electores) => {
    const p = dash.params();
    const provs = ['Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Santiago'];
    const r = electores.filter((e) => !p.condado || e.origen_condado === p.condado);
    return provs.map((provincia) => ({ provincia, n: r.filter((e) => e.provincia_chile === provincia).length }));
  },
});

dash.calc('por_condado', {
  inputs: ['electores'],
  title: 'Inscritos por condado de origen',
  description: 'Inscripciones por condado de origen (籍貫 normalizado), con el filtro de lista aplicado.',
  fn: (electores) => {
    const p = dash.params();
    const r = electores.filter((e) => (!p.sede || e.sede === p.sede) && e.origen_condado);
    const m = new Map();
    r.forEach((e) => {
      if (!m.has(e.origen_condado)) m.set(e.origen_condado, { condado: e.origen_condado, zh: e.origen_zh, canton: e.origen_canton || '', pinyin: e.origen_pinyin, provincia: e.origen_provincia, n: 0 });
      m.get(e.origen_condado).n += 1;
    });
    return [...m.values()].map((d) => ({ ...d, pct: Math.round((d.n / r.length) * 1000) / 10 })).sort((a, b) => b.n - a.n);
  },
});

dash.calc('cruce', {
  inputs: ['electores'],
  title: 'Condado de origen por lista',
  description: 'Inscripciones por lista y condado (los ocho condados mayores, el resto como Otros), con su parte dentro de cada lista. Sin filtros.',
  fn: (electores) => {
    const listas = ['Arica', 'Iquique', 'Tocopilla', 'Antofagasta', 'Taltal', 'Chañaral', 'Copiapó', 'Coquimbo', 'Santiago', '古華埠', '華思拿埠'];
    const tot = {};
    electores.forEach((e) => { if (e.origen_condado) tot[e.origen_condado] = (tot[e.origen_condado] || 0) + 1; });
    const mayores = Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 8).map((d) => d[0]);
    const grupo = (e) => (!e.origen_condado ? 'Sin dato' : mayores.includes(e.origen_condado) ? e.origen_condado : 'Otros');
    const filas = [];
    [...mayores, 'Otros', 'Sin dato'].forEach((condado, i) => {
      listas.forEach((sede) => {
        const deLista = electores.filter((e) => e.sede === sede);
        const n = deLista.filter((e) => grupo(e) === condado).length;
        const zh = condado === 'Otros' || condado === 'Sin dato' ? '' : (electores.find((e) => e.origen_condado === condado) || {}).origen_zh;
        filas.push({ condado, zh, orden: i, sede, n, pct_lista: deLista.length ? Math.round((n / deLista.length) * 100) : 0 });
      });
    });
    return filas;
  },
});

dash.calc('hallazgos', {
  inputs: ['electores'],
  title: 'Cifras citadas en el texto',
  description: 'Partes y conteos que citan las frases de la página, sobre todo el padrón (sin filtros).',
  fn: (electores) => {
    const de = (sede) => electores.filter((e) => e.sede === sede);
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
    const cnt = (rows, condado) => rows.filter((e) => e.origen_condado === condado).length;
    const menores = electores.filter((e) => ['Arica', 'Tocopilla', 'Taltal', 'Chañaral', 'Copiapó', 'Coquimbo'].includes(e.sede));
    const ape = (a) => electores.filter((e) => e.apellido === a);
    return [{
      heshan_iquique_pct: pct(cnt(de('Iquique'), 'Heshan'), de('Iquique').length),
      heshan_santiago_pct: pct(cnt(de('Santiago'), 'Heshan'), de('Santiago').length),
      heshan_antofagasta_n: cnt(de('Antofagasta'), 'Heshan'),
      antofagasta_n: de('Antofagasta').length,
      zhongshan_menores_pct: pct(cnt(menores, 'Zhongshan'), menores.length),
      dongguan_antofagasta_pct: pct(cnt(de('Antofagasta'), 'Dongguan'), de('Antofagasta').length),
      dongguan_guhua_pct: pct(cnt(de('古華埠'), 'Dongguan'), de('古華埠').length),
      zheng_n: ape('鄭').length,
      zheng_zhongshan: cnt(ape('鄭'), 'Zhongshan'),
      lai_n: ape('賴').length,
      lai_heshan: cnt(ape('賴'), 'Heshan'),
    }];
  },
});

dash.calc('edades', {
  inputs: ['electores'],
  title: 'Edades en tramos de cinco años',
  description: 'Inscripciones con edad legible por tramo de cinco años, con los filtros aplicados.',
  fn: (electores) => {
    const p = dash.params();
    const r = electores.filter((e) => (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado) && Number(e.edad) > 0);
    const filas = [];
    for (let desde = 10; desde < 90; desde += 5) {
      const n = r.filter((e) => Number(e.edad) >= desde && Number(e.edad) < desde + 5).length;
      filas.push({ desde, hasta: desde + 4, tramo: `${desde}–${desde + 4}`, nacidos: `${1947 - desde - 4}–${1947 - desde}`, n, pct: r.length ? Math.round((n / r.length) * 1000) / 10 : 0 });
    }
    return filas;
  },
});

dash.calc('edad_por_lista', {
  inputs: ['electores'],
  title: 'Edad por lista',
  description: 'Mediana y percentiles 25 y 75 de la edad en cada lista, con el filtro de condado aplicado.',
  fn: (electores) => {
    const p = dash.params();
    const listas = ['Arica', 'Iquique', 'Tocopilla', 'Antofagasta', 'Taltal', 'Chañaral', 'Copiapó', 'Coquimbo', 'Santiago', '古華埠', '華思拿埠'];
    const q = (s, f) => { if (!s.length) return null; const i = (s.length - 1) * f; const lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
    return listas.map((sede) => {
      const s = electores.filter((e) => e.sede === sede && (!p.condado || e.origen_condado === p.condado) && Number(e.edad) > 0).map((e) => Number(e.edad)).sort((a, b) => a - b);
      return { sede, n: s.length, mediana: q(s, 0.5), p25: q(s, 0.25), p75: q(s, 0.75) };
    });
  },
});

dash.calc('oficios', {
  inputs: ['electores'],
  title: 'Oficios',
  description: 'Inscripciones por categoría de oficio, con las grafías del padrón que agrupa, con los filtros aplicados.',
  fn: (electores) => {
    const p = dash.params();
    const r = electores.filter((e) => (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado));
    const m = new Map();
    r.forEach((e) => {
      const c = e.ocupacion_cat;
      if (!m.has(c)) m.set(c, { categoria: c, n: 0, t: {} });
      const g = m.get(c);
      g.n += 1;
      if (e.ocupacion_resuelto) g.t[e.ocupacion_resuelto] = (g.t[e.ocupacion_resuelto] || 0) + 1;
    });
    return [...m.values()].map((g) => ({
      categoria: g.categoria,
      terminos: Object.entries(g.t).sort((a, b) => b[1] - a[1]).slice(0, 5).map((d) => d[0]).join(' · '),
      n: g.n,
      pct: r.length ? Math.round((g.n / r.length) * 1000) / 10 : 0,
    })).sort((a, b) => (['Lectura por confirmar', 'Sin dato'].includes(a.categoria) - ['Lectura por confirmar', 'Sin dato'].includes(b.categoria)) || b.n - a.n);
  },
});

dash.calc('apellidos', {
  inputs: ['electores'],
  title: 'Apellidos más frecuentes',
  description: 'Los 40 apellidos más frecuentes, con el condado donde más se concentra cada uno, con los filtros aplicados.',
  fn: (electores) => {
    const p = dash.params();
    const r = electores.filter((e) => (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado) && e.apellido);
    const m = new Map();
    r.forEach((e) => {
      if (!m.has(e.apellido)) m.set(e.apellido, { apellido: e.apellido, canton: e.apellido_canton || '', pinyin: e.apellido_pinyin || '', n: 0, c: {} });
      const g = m.get(e.apellido);
      g.n += 1;
      if (e.origen_condado) g.c[e.origen_condado] = (g.c[e.origen_condado] || 0) + 1;
    });
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 40).map((g) => {
      const c = Object.entries(g.c).sort((a, b) => b[1] - a[1]);
      return {
        apellido: g.apellido, canton: g.canton, pinyin: g.pinyin, n: g.n,
        condado_principal: c.length ? c[0][0] : '',
        n_principal: c.length ? c[0][1] : 0,
        pct_principal: c.length ? Math.round((c[0][1] / g.n) * 100) : 0,
        desglose: c.slice(0, 4).map((d) => `${d[0]} ${d[1]}`).join(' · '),
      };
    });
  },
});

dash.calc('fuera_gd', {
  inputs: ['electores'],
  title: 'Inscritos de fuera de Guangdong',
  description: 'Inscripciones cuyo origen está en otra provincia, con los filtros aplicados.',
  fn: (electores) => {
    const p = dash.params();
    return electores.filter((e) => e.origen_provincia && e.origen_provincia !== 'Guangdong' && (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado))
      .map((e) => ({ id: e.id, apellido: e.apellido, apellido_canton: e.apellido_canton, sexo: e.sexo, edad: e.edad, origen_zh: e.origen_zh, origen_condado: e.origen_condado, origen_provincia: e.origen_provincia, ocupacion_resuelto: e.ocupacion_resuelto, sede: e.sede }));
  },
});

dash.calc('mujeres', {
  inputs: ['electores'],
  title: 'Mujeres inscritas',
  description: 'Inscripciones con sexo 女, con los filtros aplicados.',
  fn: (electores) => {
    const p = dash.params();
    return electores.filter((e) => e.sexo === 'Mujer' && (!p.sede || e.sede === p.sede) && (!p.condado || e.origen_condado === p.condado))
      .map((e) => ({ id: e.id, apellido: e.apellido, apellido_canton: e.apellido_canton, edad: e.edad, origen_zh: e.origen_zh, origen_condado: e.origen_condado, ocupacion_resuelto: e.ocupacion_resuelto, sede: e.sede }));
  },
});
