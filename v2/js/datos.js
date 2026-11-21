// Datos del zupu y utilidades compartidas por todas las páginas de la versión 2.
// La base vive en ../data/zupu.json (la misma que usa la versión actual).
'use strict';

window.ZUPU = (function () {
  const RAIZ = document.documentElement.dataset.raiz || './';
  const BASE = RAIZ + '../';

  // ── Preferencias de idioma y escritura ──
  const leer = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const urlLang = new URLSearchParams(location.search).get('lang');
  let lang = urlLang === 'en' || urlLang === 'es' ? urlLang : leer('zupu-lang', 'es');
  let script = leer('zupu-script', 'trad');

  const oyentes = [];
  const alCambiar = (fn) => oyentes.push(fn);
  const avisar = () => oyentes.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });

  function aplicarIdioma() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    document.documentElement.dataset.lang = lang;
    document.documentElement.dataset.script = script;
    document.querySelectorAll('[data-en]').forEach((el) => {
      if (!el.dataset.es) el.dataset.es = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll('[data-en-ph]').forEach((el) => {
      if (!el.dataset.esPh) el.dataset.esPh = el.placeholder;
      el.placeholder = lang === 'en' ? el.dataset.enPh : el.dataset.esPh;
    });
    document.querySelectorAll('[data-en-label]').forEach((el) => {
      if (!el.dataset.esLabel) el.dataset.esLabel = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.enLabel : el.dataset.esLabel);
    });
    document.querySelectorAll('[data-zh-simp]').forEach((el) => {
      if (!el.dataset.zhTrad) el.dataset.zhTrad = el.textContent;
      el.textContent = script === 'simp' ? el.dataset.zhSimp : el.dataset.zhTrad;
    });
    document.querySelectorAll('[data-pref-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.prefLang === lang)));
    document.querySelectorAll('[data-pref-script]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.prefScript === script)));
  }
  function setLang(l) { lang = l; guardar('zupu-lang', l); aplicarIdioma(); avisar(); }
  function setScript(s) { script = s; guardar('zupu-script', s); aplicarIdioma(); avisar(); }
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest('[data-pref-lang],[data-pref-script]');
    if (!b) return;
    if (b.dataset.prefLang) setLang(b.dataset.prefLang);
    else setScript(b.dataset.prefScript);
  });
  document.addEventListener('DOMContentLoaded', aplicarIdioma);

  const L = (es, en) => (lang === 'en' ? en : es);

  // ── Base de datos ──
  let DB = null, byId = {}, kids = {}, LINEA = [];
  let promesa = null;
  function cargar() {
    if (promesa) return promesa;
    promesa = fetch(BASE + 'data/zupu.json')
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((raw) => {
        DB = raw.people;
        byId = {}; kids = {};
        DB.forEach((p) => { byId[p.id] = p; });
        DB.forEach((p) => { if (p.pid && byId[p.pid]) (kids[p.pid] = kids[p.pid] || []).push(p.id); });
        Object.keys(kids).forEach((pid) => kids[pid].sort((a, b) => ((byId[a].birth_order ?? 999) - (byId[b].birth_order ?? 999))));
        LINEA = DB.filter((p) => p.rodrigo).sort((a, b) => a.gen - b.gen);
        return api;
      });
    return promesa;
  }

  // ── Nombres y textos ──
  const zh = (p) => (p ? ((script === 'simp' ? p.zh_simp : p.zh) || p.zh || '') : '');
  const zhSinApellido = (p) => zh(p).replace(/^徐/, '');
  const T2S = {
    '亞':'亚','傑':'杰','國':'国','嶺':'岭','廣':'广','慶':'庆','東':'东','業':'业','榮':'荣','樂':'乐','橫':'横','滿':'满','漣':'涟','潤':'润',
    '灣':'湾','獻':'献','發':'发','禮':'礼','統':'统','緒':'绪','縣':'县','纘':'缵','義':'义','興':'兴','華':'华','訓':'训','評':'评','誨':'诲',
    '諒':'谅','謝':'谢','議':'议','貞':'贞','貴':'贵','賢':'贤','賴':'赖','連':'连','達':'达','鍾':'钟','長':'长','開':'开','閩':'闽','陽':'阳',
    '顯':'显','鶴':'鹤','齡':'龄','黃':'黄','軍':'军','彥':'彦','煥':'焕','鄭':'郑','閏':'闰','陳':'陈','輝':'辉','禎':'祯','譽':'誉',
    '鷹':'鹰','瓊':'琼','鑾':'銮','鳳':'凤','寬':'宽','寧':'宁','瑋':'玮','蘭':'兰','錦':'锦','劉':'刘','趙':'赵','馮':'冯','鄧':'邓','葉':'叶',
    '蕭':'萧','燦':'灿','譜':'谱','裏':'里','詩':'诗','祿':'禄','禧':'禧','塘':'塘','門':'门','無':'无','邊':'边','歲':'岁','與':'与','學':'学',
    '書':'书','鄉':'乡','時':'时','後':'后','從':'从','來':'来','見':'见','說':'说','們':'们','為':'为','這':'这','個':'个','會':'会','遷':'迁',
    '號':'号','葬':'葬','墳':'坟','總':'总','區':'区','鎮':'镇','莊':'庄','場':'场','嶽':'岳','處':'处','麼':'么','觀':'观','壽':'寿','歸':'归'
  };
  const simp = (s) => (script === 'simp' && s ? String(s).replace(/[一-鿿]/g, (c) => T2S[c] || c) : s);
  const historia = (p) => simp((p && (lang === 'en' ? p.story_eng || p.story_spa : p.story_spa || p.story_eng)) || '');
  const notas = (p) => simp((p && (lang === 'en' ? p.notes_eng || p.notes : p.notes)) || '');
  const lugar = (s) => (s ? String(s).split('(')[0].replace(/^→\s*/, '').trim() : '');
  const anio = (s) => { const m = String(s || '').match(/\d{3,4}/); return m ? parseInt(m[0], 10) : null; };
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const RAMAS = {
    chanle: ['Chánglè 長樂', 'Chánglè 長樂'], niankeng: ['Niánkēng 粘坑', 'Niánkēng 粘坑'],
    migrated: ['Emigrados', 'Emigrants'], chile: ['Chile', 'Chile'],
    guangzhou: ['Guǎngzhōu', 'Guǎngzhōu'], china_reciente: ['China reciente', 'Recent China'], zhu: ['Rama Zhū', 'Zhū branch'],
  };
  const rama = (b) => { const r = RAMAS[b]; return r ? L(r[0], r[1]) : (b || '—'); };
  const PROC = {
    'ZUPU_1943': ['Zupu de 1943', 'Zupu of 1943'], 'ZUPU_2025': ['Zupu de 2025', 'Zupu of 2025'], 'FAMILIAR': ['Fuente familiar', 'Family source'],
  };
  const procedencia = (s) => String(s || '').split('+').map((x) => x.trim()).filter(Boolean).map((x) => (PROC[x] ? L(PROC[x][0], PROC[x][1]) : x)).join(' · ');

  function cadena(id) { const c = []; let cur = id; while (cur && byId[cur]) { c.push(cur); cur = byId[cur].pid; } return c; }

  function buscar(q, max) {
    const t = String(q || '').trim(); if (!t || !DB) return [];
    const ql = t.toLowerCase();
    const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const qs = sinTildes(t);
    const puntos = [];
    DB.forEach((p) => {
      let s = 0;
      if (p.zh === t || p.zh_simp === t || zhSinApellido(p) === t) s = 100;
      else if ((p.zh && p.zh.includes(t)) || (p.zh_simp && p.zh_simp.includes(t))) s = 60;
      else if (sinTildes(p.py).includes(qs) || sinTildes(p.py_plain).includes(qs)) s = 50;
      else if (sinTildes(p.civil_name_es).includes(qs) || sinTildes(p.hakka_py).includes(qs)) s = 50;
      else if (sinTildes(p.alias).includes(qs)) s = 40;
      else if (sinTildes(p.place).includes(qs) || sinTildes(p.migration).includes(qs) || sinTildes(p.origin).includes(qs)) s = 25;
      else if ((p.spouses || []).some((x) => sinTildes(x).includes(qs))) s = 20;
      else if (sinTildes(p.notes).includes(ql)) s = 10;
      if (s) puntos.push([s + (p.rodrigo ? 3 : 0), p]);
    });
    puntos.sort((a, b) => b[0] - a[0] || a[1].gen - b[1].gen);
    return puntos.slice(0, max || 50).map((x) => x[1]);
  }

  // Markdown mínimo (negritas, cursivas, párrafos y listas) para biografías.
  function md(texto) {
    const lineas = esc(texto).split(/\n{2,}/);
    return lineas.map((b) => {
      const conFormato = b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      if (/^[-•] /m.test(b)) return '<ul>' + conFormato.split(/\n/).map((l) => '<li>' + l.replace(/^[-•]\s*/, '') + '</li>').join('') + '</ul>';
      return '<p>' + conFormato.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  const api = {
    get DB() { return DB; }, get byId() { return byId; }, get kids() { return kids; }, get LINEA() { return LINEA; },
    get lang() { return lang; }, get script() { return script; },
    RAIZ, BASE, cargar, setLang, setScript, alCambiar, aplicarIdioma, L,
    zh, zhSinApellido, simp, historia, notas, lugar, anio, esc, rama, procedencia, cadena, buscar, md,
  };
  return api;
})();
