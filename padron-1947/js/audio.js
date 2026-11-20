// Pronunciación de los apellidos.
// - Hakka (sixian): grabaciones del 《臺灣客家語常用詞辭典》 del Ministerio de Educación de Taiwán,
//   obtenidas vía moedict.tw y guardadas en audio/hakka/ (índice en data/audio.json).
// - Mandarín: sílabas grabadas de hugolpz/audio-cmn (voz de Chen Wang, CC BY-SA), en audio/mandarin/.
// - Cantonés: voz del dispositivo (Web Speech API, zh-HK). Grafía chilena: voz en español del dispositivo.
// Uso: PRONUNCIA.tocar(apellido, 'mandarin' | 'canton' | 'hakka' | 'chile', elemento, grafia)
window.PRONUNCIA = (function () {
  const grabaciones = () => { const g = window.dash ? dash.data('audio') : null; return (g && g.status === 'ok' && g.data) || {}; };

  const player = new Audio();
  player.preload = 'none';
  // Apellidos con más de una lectura: se dice «姓X» («apellido X») para que la voz elija la lectura de apellido.
  const POLIFONICOS = new Set(['曾', '翟', '任']);
  const IDIOMAS = { mandarin: ['zh-CN', 'zh-TW', 'cmn'], canton: ['zh-HK', 'yue'], chile: ['es-CL', 'es-419', 'es-US', 'es-MX', 'es-ES', 'es'] };
  const tts = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voces = [];
  const cargarVoces = () => { try { voces = speechSynthesis.getVoices() || []; } catch (e) { voces = []; } };
  if (tts) { cargarVoces(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', cargarVoces); }

  function voz(modo) {
    const norm = (v) => String(v.lang || '').replace('_', '-').toLowerCase();
    for (const p of IDIOMAS[modo] || []) {
      const q = p.toLowerCase();
      const v = voces.find((x) => norm(x) === q) || voces.find((x) => norm(x).startsWith(q + '-'));
      if (v) return v;
    }
    if (modo === 'canton') return voces.find((x) => /cantonese|粵|粤|hong ?kong/i.test(x.name)) || null;
    return null;
  }

  let marcado = null;
  function marcar(el) {
    if (marcado) marcado.classList.remove('sonando');
    marcado = el || null;
    if (marcado) marcado.classList.add('sonando');
  }

  let toast = null, tToast = 0;
  function aviso(texto) {
    if (!toast) { toast = document.createElement('div'); toast.className = 'pc-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = I18N.zh(texto);
    toast.classList.add('visible');
    clearTimeout(tToast);
    tToast = setTimeout(() => toast.classList.remove('visible'), 3600);
    return false;
  }

  // Las voces cargan con retraso (Chrome): se espera hasta 1,5 s antes de decidir.
  function conVoces(fn) {
    cargarVoces();
    if (voces.length) return fn();
    let hecho = false;
    const listo = () => { if (hecho) return; hecho = true; cargarVoces(); fn(); };
    speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', listo, { once: true });
    setTimeout(listo, 1500);
    return true;
  }

  function decir(texto, modo, el) {
    if (!tts) return aviso(L('Este navegador no puede leer en voz alta.', 'This browser cannot read aloud.'));
    return conVoces(() => decirYa(texto, modo, el));
  }

  function decirYa(texto, modo, el) {
    const v = voz(modo);
    // Nunca leer con una voz de otro idioma: suena cualquier cosa.
    if (!v) {
      return aviso(modo === 'canton'
        ? L('Tu dispositivo no tiene una voz en cantonés. Prueba en el celular o instala la voz «Chino (Hong Kong)».', 'Your device has no Cantonese voice. Try on a phone or install the “Chinese (Hong Kong)” voice.')
        : L('Tu dispositivo no tiene una voz para este idioma.', 'Your device has no voice for this language.'));
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.voice = v; u.lang = v.lang;
    u.rate = modo === 'chile' ? 0.9 : 0.75;
    let empezo = false;
    u.onstart = () => { empezo = true; };
    u.onend = () => marcar(null);
    u.onerror = () => marcar(null);
    marcar(el);
    speechSynthesis.speak(u);
    // Algunos navegadores no tienen ninguna voz y no avisan: si no empieza a hablar, se avisa.
    setTimeout(() => {
      if (!empezo && !speechSynthesis.speaking) {
        marcar(null);
        aviso(L('No se pudo reproducir la voz: tu navegador no tiene voces instaladas para este idioma.', 'The voice could not be played: your browser has no voices installed for this language.'));
      }
    }, 1500);
    return true;
  }

  function tocar(apellido, modo, el, grafia) {
    try { player.pause(); } catch (e) { /* nada */ }
    if (tts) speechSynthesis.cancel();
    marcar(null);
    const g = grabaciones()[apellido] || {};
    if (modo === 'hakka') {
      if (!g.hakka) return aviso(L(`No hay grabación hakka de ${apellido}.`, `There is no Hakka recording of ${apellido}.`));
      return sonar([g.hakka], el);
    }
    if (modo === 'mandarin' && g.mandarin && g.mandarin.length) return sonar(g.mandarin, el);
    if (modo === 'chile') {
      const t = String(grafia || '').split(',')[0].split('/')[0].replace(/\?/g, '').trim();
      if (!t) return aviso(L(`${apellido} no tiene grafía chilena documentada.`, `${apellido} has no documented Chilean spelling.`));
      return decir(t, 'chile', el);
    }
    return decir(POLIFONICOS.has(apellido) ? '姓' + apellido : apellido, modo, el);
  }

  // Reproduce una o más grabaciones seguidas (歐陽 = ōu + yáng).
  function sonar(lista, el) {
    let i = 0;
    const siguiente = () => {
      if (i >= lista.length) { marcar(null); return; }
      player.src = lista[i++];
      player.play().catch(() => marcar(null));
    };
    player.onended = siguiente;
    player.onerror = () => { marcar(null); aviso(L('No se pudo reproducir la grabación.', 'The recording could not be played.')); };
    marcar(el);
    siguiente();
    return true;
  }

  const tieneHakka = (apellido) => !!(grabaciones()[apellido] && grabaciones()[apellido].hakka);

  // Botones 🔊 en cualquier parte de la página: <button class="pc-oir" data-ap="徐" data-modo="hakka" data-grafia="Chi">
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest('.pc-oir');
    if (!b) return;
    ev.preventDefault();
    tocar(b.dataset.ap, b.dataset.modo, b, b.dataset.grafia);
  });

  const ICONO = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function boton(apellido, modo, grafia) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pc-oir';
    b.dataset.ap = apellido; b.dataset.modo = modo;
    if (grafia) b.dataset.grafia = grafia;
    const nombre = { mandarin: L('mandarín', 'Mandarin'), canton: L('cantonés', 'Cantonese'), hakka: 'hakka', chile: L('castellano', 'Spanish') }[modo];
    b.setAttribute('aria-label', L(`Escuchar ${apellido} en ${nombre}`, `Listen to ${apellido} in ${nombre}`));
    b.title = b.getAttribute('aria-label');
    b.innerHTML = ICONO;
    return b;
  }

  return { tocar, boton, tieneHakka, ICONO };
})();
