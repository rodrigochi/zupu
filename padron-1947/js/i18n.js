// Idioma (español / inglés) y escritura china (tradicional / simplificada).
// Comparte la preferencia con Zupu: mismas claves de localStorage (zupu-lang, zupu-script).
// - Bloques de texto largos: dos versiones en el HTML con data-l="es" / data-l="en" (el CSS oculta la otra).
// - Textos cortos: atributo data-en="…" (el español queda en el propio elemento).
// - Textos de los gráficos: L('español', 'English') y V(valor) para los valores de los datos.
// - Escritura: toda la página pasa por zh() en modo simplificado, salvo lo marcado con data-trad.
window.I18N = (function () {
  const leer = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const q = new URLSearchParams(location.search);
  let lang = q.get('lang') || leer('zupu-lang', 'es');
  let script = q.get('zh') || leer('zupu-script', 'trad');
  if (lang !== 'en') lang = 'es';
  if (script !== 'simp') script = 'trad';

  // Pares tradicional→simplificado de todos los caracteres de la página (generado con OpenCC; ver README).
  const PARES = /*T2S*/'亞亚個个傭佣僑侨僱雇冊册劉刘務务區区吳吴呂吕員员嚴严堅坚壽寿孫孙寶宝師师廣广張张慶庆應应懷怀會会東东棧栈楊杨業业歐欧湯汤溫温潤润無无瓊琼盧卢練练縣县羅罗聞闻臺台興兴舉举莊庄華华葉叶蔣蒋蕭萧蘇苏衛卫許许話话謝谢譚谭譜谱貨货貫贯賃赁賴赖趙赵農农連连進进達达遠远選选鄒邹鄔邬鄧邓鄭郑鄺邝醫医錢钱錫锡鍾钟鐘钟門门開开陳陈陸陆陽阳雜杂雲云韓韩順顺館馆馬马馮冯駱骆體体鶴鹤麥麦黃黄龐庞龔龚';
  const T2S = {};
  for (let i = 0; i + 1 < PARES.length; i += 2) T2S[PARES[i]] = PARES[i + 1];
  const HAN = /[㐀-鿿豈-﫿]/g;
  const HAN1 = /[㐀-鿿豈-﫿]/;
  const zh = (s) => (script === 'simp' && s ? String(s).replace(HAN, (c) => T2S[c] || c) : s);

  const L = (es, en) => (lang === 'en' ? en : es);

  // Valores de los datos (en español en padron.json) → inglés.
  const VAL = {
    Hombre: 'Male', Mujer: 'Female', 'Sin dato': 'No data', Dudoso: 'Uncertain',
    Comerciante: 'Merchant', 'Lectura por confirmar': 'Reading to be confirmed', 'Abarrotes y mercancías': 'Groceries and goods',
    Empleado: 'Employee', Obrero: 'Labourer', 'Sin empleo': 'Unemployed', Funcionario: 'Official',
    'Agricultura y hortalizas': 'Farming and market gardens', 'Médico': 'Doctor',
    Documentada: 'Documented', Propuesta: 'Proposed', 'Hipótesis': 'Hypothesis', Tentativa: 'Tentative',
    'Lectura fonética propuesta': 'Proposed phonetic reading', 'Identificada en el padrón': 'Identified in the roll',
    Directa: 'Direct', Indirecta: 'Indirect', Provisional: 'Provisional', 'Sin correspondencia': 'No match',
    Otros: 'Others', 'Otro condado': 'Other county',
    'Perú': 'Peru', 'Océano Pacífico': 'Pacific Ocean', 'Cantón': 'Canton', Macao: 'Macau',
    'La observación «Ignacio Aján» respalda la lectura Aján.': 'The remark “Ignacio Aján” supports the reading Aján.',
    'El cuadro escribe 鐘.': 'The chart writes 鐘.',
    'Wee (fila 75) solo si se confirma la lectura 袁 de ese carácter.': 'Wee (row 75) only if the reading 袁 of that character is confirmed.',
    'La fila 27 se comparte con un segundo carácter leído provisionalmente como 阮.': 'Row 27 is shared with a second character provisionally read as 阮.',
    'La fila 25 es una entrada compartida con 方.': 'Row 25 is an entry shared with 方.',
    'Filas 27 y 29 solo si se confirma la lectura 阮.': 'Rows 27 and 29 only if the reading 阮 is confirmed.',
    'En las observaciones de la fila 6 aparece «Quintín Quintana»; no se infiere una equivalencia general.': 'The remarks on row 6 mention “Quintín Quintana”; no general equivalence is inferred.',
    'El cuadro añade «No son nombres chinos».': 'The chart adds “These are not Chinese names”.',
    'Entrada compartida con 區.': 'Entry shared with 區.',
    'Solo si se confirma la lectura 沈 del carácter.': 'Only if the reading 沈 of the character is confirmed.',
    'El cuadro escribe 邱.': 'The chart writes 邱.',
    'La fila 56 (Man) corresponde a 聞, no a 文.': 'Row 56 (Man) corresponds to 聞, not 文.',
    'Solo si se confirma la lectura 詹 del carácter.': 'Only if the reading 詹 of the character is confirmed.',
    'Podría ser una confusión por 侯; se mantiene separado.': 'May be a confusion with 侯; kept separate.',
    'Entrada compartida con 馮.': 'Entry shared with 馮.',
  };
  const V = (v) => (lang === 'en' && v != null && VAL[v] !== undefined ? VAL[v] : v);

  // Números: coma decimal en español, punto en inglés.
  const N = (x) => (x === null || x === undefined ? '—' : lang === 'en' ? String(x) : String(x).replace('.', ','));
  const LOC = () => (lang === 'en' ? 'en-US' : 'es-CL');

  // ---- Texto estático ----
  function textosCortos() {
    document.querySelectorAll('[data-en]').forEach((el) => {
      if (el.dataset.es === undefined) el.dataset.es = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll('[data-en-ph]').forEach((el) => {
      if (el.dataset.esPh === undefined) el.dataset.esPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', zh(lang === 'en' ? el.dataset.enPh : el.dataset.esPh));
    });
    document.querySelectorAll('[data-en-aria]').forEach((el) => {
      if (el.dataset.esAria === undefined) el.dataset.esAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAria : el.dataset.esAria);
    });
    const t = document.querySelector('title');
    if (t) { if (t.dataset.es === undefined) t.dataset.es = t.textContent; t.textContent = zh(lang === 'en' ? t.dataset.en : t.dataset.es); }
  }

  // ---- Escritura: recorre los nodos de texto y guarda el original tradicional ----
  const originales = new WeakMap();
  function convertir(root) {
    if (!root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest('[data-trad],script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      let o = originales.get(n);
      // Si el código cambió el texto desde la última conversión, el nuevo valor es el original.
      if (o === undefined || (n.nodeValue !== o && n.nodeValue !== zhDe(o))) { o = n.nodeValue; originales.set(n, o); }
      if (!HAN1.test(o)) continue;
      const v = script === 'simp' ? zh(o) : o;
      if (n.nodeValue !== v) n.nodeValue = v;
    }
  }
  const zhDe = (o) => o.replace(HAN, (c) => T2S[c] || c);

  function botones() {
    const act = (id, on) => { const b = document.getElementById(id); if (b) { b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); } };
    act('btn-es', lang === 'es'); act('btn-en', lang === 'en'); act('btn-trad', script === 'trad'); act('btn-simp', script === 'simp');
  }

  function aplicarRaiz() {
    const h = document.documentElement;
    h.lang = lang === 'en' ? 'en' : 'es';
    h.dataset.zh = script;
  }

  function aplicar(redibujar) {
    aplicarRaiz();
    textosCortos();
    botones();
    if (redibujar && window.dash && dash.redibujarTodo) dash.redibujarTodo();
    convertir(document.body);
  }

  aplicarRaiz();

  return {
    get lang() { return lang; },
    get script() { return script; },
    L, V, N, LOC, zh, convertir,
    setLang(l) { lang = l === 'en' ? 'en' : 'es'; guardar('zupu-lang', lang); aplicar(true); },
    setScript(s) { script = s === 'simp' ? 'simp' : 'trad'; guardar('zupu-script', script); aplicar(true); },
    iniciar() { aplicar(false); },
  };
})();
window.L = I18N.L; window.V = I18N.V;
