// Motor mínimo de la página: carga los datos, calcula y redibuja los gráficos.
// Ofrece la misma interfaz que usan los demás archivos (dash.data, dash.calc, dash.draw, dash.params).
(function () {
  const fuentes = {};          // id -> datos ya cargados
  const calculos = {};         // id -> { inputs, fn }
  const memo = new Map();      // id -> { v, data }
  const dibujos = {};          // nombre -> fn(el)
  const anchos = new WeakMap();
  let params = { sede: '', condado: '' };
  let version = 0;
  let cargado = false;
  let pendiente = false;

  const ARCHIVOS = {
    electores: 'data/padron.json',
    apellidos_grafias: 'data/apellidos_grafias.json',
    mapa_mundo: 'data/mapa_mundo.json',
    mapa_chile: 'data/mapa_chile.json',
    mapa_delta: 'data/mapa_delta.json',
    mapa_china: 'data/mapa_china.json',
  };

  function ejecutar(nombre) {
    const fn = dibujos[nombre];
    if (!fn) return;
    document.querySelectorAll(`[data-draw="${nombre}"]`).forEach((el) => {
      try { fn(el); anchos.set(el, el.clientWidth); I18N.convertir(el); } catch (e) { console.error('Gráfico', nombre, e); }
    });
  }
  function todo() { Object.keys(dibujos).forEach(ejecutar); avisarAltura(); }
  function programar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; todo(); });
  }

  // Si la página está dentro de un iframe, avisa su altura al documento que la contiene.
  function avisarAltura() {
    if (window.parent === window) return;
    const h = document.documentElement.scrollHeight;
    window.parent.postMessage({ tipo: 'padron-1947-altura', altura: h }, '*');
  }

  window.dash = {
    colors: ['var(--serie-1)', 'var(--serie-2)', 'var(--serie-3)'],
    params: () => ({ ...params }),
    setParams(o) {
      params = { ...params, ...o };
      version += 1;
      const q = new URLSearchParams();
      if (params.sede) q.set('lista', params.sede);
      if (params.condado) q.set('condado', params.condado);
      const hash = q.toString();
      history.replaceState(null, '', hash ? `#${hash}` : location.pathname + location.search);
      programar();
    },
    resetParams() { this.setParams({ sede: '', condado: '' }); },
    redibujarTodo() { if (cargado) todo(); },
    calc(id, def) { calculos[id] = def; },
    loader() {},
    onData(fn) { fn(); },
    setLink() {},
    data(id) {
      if (!cargado) return { status: 'loading', data: [] };
      if (id in fuentes) return { status: 'ok', data: fuentes[id] };
      const c = calculos[id];
      if (!c) return { status: 'missing', data: [] };
      const m = memo.get(id);
      if (m && m.v === version) return { status: 'ok', data: m.data };
      try {
        const ins = c.inputs.map((i) => window.dash.data(i).data);
        const data = c.fn(...ins);
        memo.set(id, { v: version, data });
        return { status: 'ok', data };
      } catch (e) {
        console.error('Cálculo', id, e);
        return { status: 'error', data: null };
      }
    },
    draw(nombre, fn) {
      if (fn) { dibujos[nombre] = typeof fn === 'function' ? fn : fn.update; return; }
      ejecutar(nombre);
      avisarAltura();
    },
  };

  // Filtros iniciales desde el enlace (#lista=Iquique&condado=Heshan).
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('lista')) params.sede = h.get('lista');
  if (h.get('condado')) params.condado = h.get('condado');

  // Redibuja un gráfico cuando cambia su ancho.
  let temporizador = null;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      let cambio = false;
      document.querySelectorAll('[data-draw]').forEach((el) => { if (anchos.get(el) !== el.clientWidth) cambio = true; });
      if (cambio) todo(); else avisarAltura();
    }, 150);
  });

  window.addEventListener('DOMContentLoaded', () => {
    I18N.iniciar();
    Promise.all(Object.entries(ARCHIVOS).map(([id, url]) => fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return r.json();
    }).then((j) => {
      if (id === 'electores') {
        fuentes[id] = j.filas.map((f) => Object.fromEntries(j.columnas.map((c, i) => [c, f[i]])));
      } else {
        fuentes[id] = j;
      }
    }))).then(() => {
      cargado = true;
      todo();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(todo);
    }).catch((e) => {
      console.error(e);
      document.querySelectorAll('.pc-cargando').forEach((el) => { el.hidden = false; el.textContent = L('No se pudieron cargar los datos. La página debe abrirse desde un servidor (por ejemplo GitHub Pages), no como archivo local.', 'The data could not be loaded. Open the page from a web server (e.g. GitHub Pages), not as a local file.'); });
    });
  });
})();
