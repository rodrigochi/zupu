// Relato: índice de partes (frutos que maduran al leer) y visor de fotos.
'use strict';

(function () {
  const Z = window.ZUPU;

  function articuloVisible() {
    return document.querySelector(`.r-texto[data-l='${Z.lang === 'en' ? 'en' : 'es'}']`);
  }

  let obs = null;
  function indice() {
    const art = articuloVisible(); if (!art) return;
    const ol = document.getElementById('r-indice');
    const partes = [...art.querySelectorAll('h2')];
    ol.innerHTML = partes.map((h) => {
      const num = h.querySelector('.r-num').textContent;
      const nombre = h.textContent.replace(num, '').trim();
      return `<li><a href="#${h.id}" data-h="${h.id}"><svg class="verde" aria-hidden="true"><use href="#fruto-verde"/></svg><svg class="roja" aria-hidden="true"><use href="#fruto"/></svg>${Z.esc(num)}. ${Z.esc(nombre)}</a></li>`;
    }).join('');
    if (obs) obs.disconnect();
    const enlaces = [...ol.querySelectorAll('a')];
    const marcar = () => {
      let actual = -1;
      partes.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * .45) actual = i; });
      enlaces.forEach((a, i) => { a.classList.toggle('leido', i <= actual); a.setAttribute('aria-current', String(i === actual)); });
      const nav = document.querySelector('.r-indice');
      const ini = art.getBoundingClientRect();
      nav.classList.toggle('visible', ini.top < innerHeight * .6 && ini.bottom > innerHeight * .4);
    };
    window.onscroll = () => requestAnimationFrame(marcar);
    marcar();
  }

  // Ids únicos por idioma (los dos artículos comparten estructura)
  document.querySelectorAll(".r-texto[data-l='en'] h2").forEach((h) => { h.id = h.id + '-en'; });

  // Visor
  const visor = document.createElement('div');
  visor.className = 'visor'; visor.hidden = true; visor.setAttribute('role', 'dialog');
  visor.innerHTML = '<img alt="">';
  document.body.appendChild(visor);
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.r-foto img');
    if (img) { visor.querySelector('img').src = img.src; visor.querySelector('img').alt = img.alt; visor.hidden = false; return; }
    if (!visor.hidden && e.target.closest('.visor')) visor.hidden = true;
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') visor.hidden = true; });

  document.addEventListener('DOMContentLoaded', () => { indice(); Z.alCambiar(indice); });
})();
