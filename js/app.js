'use strict';

// ── State ──
let DB = null, ARTICLES = null;
let byId = {}, kids = {}, LINEAGE = [];
let view = 'lineage', historyTab = 'migrations';
let selId = null, genMode = 'wuhua';
let reviewMode = false, searchTimer = null;
let root = null, cs = 0.7, pendingView = null;
let currentZoomLevel = 'far';
let lang = localStorage.getItem('zupu-lang') || 'es';
let script = localStorage.getItem('zupu-script') || 'trad';

const BRANCH_COLORS = {
  chanle:'#9b3030', niankeng:'#c8941a', migrated:'#5a7a9a', chile:'#3a7a50',
  guangzhou:'#999', china_reciente:'#999', zhu:'#999',
};
const HIDDEN_BRANCHES = new Set(['guangzhou','china_reciente','zhu']);
const BRANCH_LABELS_ES = {
  chanle:'Chánglè 長樂', niankeng:'Niánkēng 粘坑', migrated:'Emigrados', chile:'Chile',
};
const BRANCH_LABELS_EN = {
  chanle:'Chánglè 長樂', niankeng:'Niánkēng 粘坑', migrated:'Emigrants', chile:'Chile',
};
const PROV_LABELS_ES = {
  'ZUPU_1943':'Zupu 1943', 'ZUPU_2025':'Zupu 2025', 'FAMILIAR':'Fuente familiar',
  'ZUPU_2025 + FAMILIAR':'Zupu 2025 + Fuente familiar',
  'ZUPU_1943 + FAMILIAR':'Zupu 1943 + Fuente familiar',
  'ZUPU_1943 + ZUPU_2025 + FAMILIAR':'Zupu 1943 + Zupu 2025 + Fuente familiar',
};
const PROV_LABELS_EN = {
  'ZUPU_1943':'Zupu 1943', 'ZUPU_2025':'Zupu 2025', 'FAMILIAR':'Family source',
  'ZUPU_2025 + FAMILIAR':'Zupu 2025 + Family source',
  'ZUPU_1943 + FAMILIAR':'Zupu 1943 + Family source',
  'ZUPU_1943 + ZUPU_2025 + FAMILIAR':'Zupu 1943 + Zupu 2025 + Family source',
};
const I18N = {
  es:{
    cover_subtitle:'Árbol genealógico de la familia Xu / Chi',
    cover_desc:'De Chánglè / Wuhuá a Héshān y Chile',
    sec_tree:'Explorar el árbol familiar', sec_articles:'Escritos e historias',
    btn_lineage:'Ruta familiar', btn_lineage_desc:'Línea directa a Chile',
    btn_tree:'Árbol genealógico', btn_tree_desc:'Árbol completo interactivo',
    btn_search:'Buscar persona', btn_search_desc:'Por nombre o lugar',
    btn_history:'Migraciones', btn_history_desc:'Rutas · clanes · cronología',
    stat_people:'Personas', stat_gen:'Generaciones', stat_mig:'Migraciones', stat_clans:'Clanes de esposas',
    footer_compiled:'Compilado por la familia', footer_years:'~900 años de historia',
    wip_main:'Sitio en construcción activa', wip_sub:'Seguimos incorporando datos e historias — algunos detalles pueden cambiar.',
    tab_lineage:'📜 Ruta familiar', tab_tree:'🌳 Árbol', tab_search:'🔍 Buscar', tab_history:'🗺️ Historia y lugares',
    lineage_title:'📜 Ruta familiar',
    lineage_intro_pre:'Treinta generaciones desde', lineage_intro_post:'de finales de la Dinastía Song (~1150), hasta la llegada a Chile. Toca una tarjeta para leer la historia.',
    search_ph:'Buscar por nombre chino, pinyin, lugar, esposa, apellido…',
    htab_mig:'🗺️ Migraciones', htab_spouse:'💍 Clanes de esposas', htab_time:'⏳ Cronología',
    gen_label:'GENERACIÓN', chile_tag:'🇨🇱 Línea directa a Chile',
    sec_identity:'Identidad', sec_family:'Familia', sec_places:'Lugares', sec_dates:'Fechas',
    sec_burial:'Entierro', sec_notes:'Notas', sec_source:'Fuente y confianza',
    sec_biography:'Biografía', sec_name_meaning:'Significado del nombre',
    f_alias:'Alias / 字', f_branch:'Rama', f_father:'Padre', f_spouses:'Esposas',
    f_civil:'Nombre civil', f_hakka:'Hakka Meixian',
    f_children:'Hijos', f_origin:'Origen', f_place:'Residencia', f_migration:'Migración',
    f_birth:'Nacimiento', f_death:'Fallecimiento',
    marriages:'matrimonio', marriages_pl:'matrimonios',
    review_active:'🔍 Modo revisión activo',
    review_sub:'— mostrando datos incompletos, dudosos y traducciones pendientes',
    review_btn:'🔍 Revisión', copy_link:'🔗 Copiar enlace', see_father:'👆 Ver padre',
    tree_years:'~900 años', back:'← Volver', no_results:'Sin resultados',
    people_found:'persona encontrada', people_found_pl:'personas encontradas',
    no_place:'Sin lugar registrado',
    legend_branches:'Ramas', legend_direct:'Línea directa',
    lineage_panel_title:'📜 Línea a Chile',
    mig_people:'pers.',
  },
  en:{
    cover_subtitle:'Family tree of the Xu / Chi family',
    cover_desc:'From Chánglè / Wuhuá to Héshān and Chile',
    sec_tree:'Explore the family tree', sec_articles:'Stories & writings',
    btn_lineage:'Family lineage', btn_lineage_desc:'Direct line to Chile',
    btn_tree:'Family tree', btn_tree_desc:'Full interactive tree',
    btn_search:'Search person', btn_search_desc:'By name or place',
    btn_history:'Migrations', btn_history_desc:'Routes · clans · timeline',
    stat_people:'People', stat_gen:'Generations', stat_mig:'Migrations', stat_clans:'Wife clans',
    footer_compiled:'Compiled by the family', footer_years:'~900 years of history',
    wip_main:'Site under active development', wip_sub:'We are still adding data and stories — some details may change.',
    tab_lineage:'📜 Lineage', tab_tree:'🌳 Tree', tab_search:'🔍 Search', tab_history:'🗺️ History',
    lineage_title:'📜 Family lineage',
    lineage_intro_pre:'Thirty generations from', lineage_intro_post:'of the late Song Dynasty (~1150), to the arrival in Chile. Tap a card to read the story.',
    search_ph:'Search by Chinese name, pinyin, place, spouse, surname…',
    htab_mig:'🗺️ Migrations', htab_spouse:'💍 Wife clans', htab_time:'⏳ Timeline',
    gen_label:'GENERATION', chile_tag:'🇨🇱 Direct line to Chile',
    sec_identity:'Identity', sec_family:'Family', sec_places:'Places', sec_dates:'Dates',
    sec_burial:'Burial', sec_notes:'Notes', sec_source:'Source & confidence',
    sec_biography:'Biography', sec_name_meaning:'Name meaning',
    f_alias:'Alias / 字', f_branch:'Branch', f_father:'Father', f_spouses:'Wife/wives',
    f_civil:'Civil name', f_hakka:'Hakka Meixian',
    f_children:'Children', f_origin:'Origin', f_place:'Residence', f_migration:'Migration',
    f_birth:'Birth', f_death:'Death',
    marriages:'marriage', marriages_pl:'marriages',
    review_active:'🔍 Review mode active',
    review_sub:'— showing incomplete data, uncertain entries and pending translations',
    review_btn:'🔍 Review', copy_link:'🔗 Copy link', see_father:'👆 View father',
    tree_years:'~900 years', back:'← Back', no_results:'No results',
    people_found:'person found', people_found_pl:'people found',
    no_place:'No location recorded',
    legend_branches:'Branches', legend_direct:'Direct line',
    lineage_panel_title:'📜 Line to Chile',
    mig_people:'pers.',
  }
};
const CLAN_INFO = {
  '何':{simp:'何',py:'Hé',py_plain:'He'},
  '余':{simp:'余',py:'Yú',py_plain:'Yu'},
  '傅':{simp:'傅',py:'Fù',py_plain:'Fu'},
  '冼':{simp:'冼',py:'Xiǎn',py_plain:'Xian'},
  '凌':{simp:'凌',py:'Líng',py_plain:'Ling'},
  '劉':{simp:'刘',py:'Liú',py_plain:'Liu'},
  '卓':{simp:'卓',py:'Zhuó',py_plain:'Zhuo'},
  '卜':{simp:'卜',py:'Bǔ',py_plain:'Bu'},
  '吳':{simp:'吴',py:'Wú',py_plain:'Wu'},
  '呂':{simp:'吕',py:'Lǚ',py_plain:'Lu'},
  '周':{simp:'周',py:'Zhōu',py_plain:'Zhou'},
  '唐':{simp:'唐',py:'Táng',py_plain:'Tang'},
  '孔':{simp:'孔',py:'Kǒng',py_plain:'Kong'},
  '屈':{simp:'屈',py:'Qū',py_plain:'Qu'},
  '廖':{simp:'廖',py:'Liào',py_plain:'Liao'},
  '張':{simp:'张',py:'Zhāng',py_plain:'Zhang'},
  '彭':{simp:'彭',py:'Péng',py_plain:'Peng'},
  '徐':{simp:'徐',py:'Xú',py_plain:'Xu'},
  '戴':{simp:'戴',py:'Dài',py_plain:'Dai'},
  '施':{simp:'施',py:'Shī',py_plain:'Shi'},
  '曹':{simp:'曹',py:'Cáo',py_plain:'Cao'},
  '曾':{simp:'曾',py:'Zēng',py_plain:'Zeng'},
  '朱':{simp:'朱',py:'Zhū',py_plain:'Zhu'},
  '李':{simp:'李',py:'Lǐ',py_plain:'Li'},
  '杜':{simp:'杜',py:'Dù',py_plain:'Du'},
  '林':{simp:'林',py:'Lín',py_plain:'Lin'},
  '梁':{simp:'梁',py:'Liáng',py_plain:'Liang'},
  '楊':{simp:'杨',py:'Yáng',py_plain:'Yang'},
  '樂':{simp:'乐',py:'Yuè',py_plain:'Yue'},
  '殷':{simp:'殷',py:'Yīn',py_plain:'Yin'},
  '湯':{simp:'汤',py:'Tāng',py_plain:'Tang'},
  '溫':{simp:'温',py:'Wēn',py_plain:'Wen'},
  '田':{simp:'田',py:'Tián',py_plain:'Tian'},
  '範':{simp:'范',py:'Fàn',py_plain:'Fan'},
  '練':{simp:'练',py:'Liàn',py_plain:'Lian'},
  '繆':{simp:'缪',py:'Miào',py_plain:'Miao'},
  '羅':{simp:'罗',py:'Luó',py_plain:'Luo'},
  '胡':{simp:'胡',py:'Hú',py_plain:'Hu'},
  '般':{simp:'般',py:'Bān',py_plain:'Ban'},
  '葉':{simp:'叶',py:'Yè',py_plain:'Ye'},
  '蕭':{simp:'萧',py:'Xiāo',py_plain:'Xiao'},
  '袁':{simp:'袁',py:'Yuán',py_plain:'Yuan'},
  '詹':{simp:'詹',py:'Zhān',py_plain:'Zhan'},
  '謝':{simp:'谢',py:'Xiè',py_plain:'Xie'},
  '譚':{simp:'谭',py:'Tán',py_plain:'Tan'},
  '賴':{simp:'赖',py:'Lài',py_plain:'Lai'},
  '輪':{simp:'轮',py:'Lún',py_plain:'Lun'},
  '邱':{simp:'邱',py:'Qiū',py_plain:'Qiu'},
  '郭':{simp:'郭',py:'Guō',py_plain:'Guo'},
  '鄧':{simp:'邓',py:'Dèng',py_plain:'Deng'},
  '鄭':{simp:'郑',py:'Zhèng',py_plain:'Zheng'},
  '鍾':{simp:'钟',py:'Zhōng',py_plain:'Zhong'},
  '陳':{simp:'陈',py:'Chén',py_plain:'Chen'},
  '陸':{simp:'陆',py:'Lù',py_plain:'Lu'},
  '顏':{simp:'颜',py:'Yán',py_plain:'Yan'},
  '馬':{simp:'马',py:'Mǎ',py_plain:'Ma'},
  '駱':{simp:'骆',py:'Luò',py_plain:'Luo'},
  '高':{simp:'高',py:'Gāo',py_plain:'Gao'},
  '黃':{simp:'黄',py:'Huáng',py_plain:'Huang'},
  '黎':{simp:'黎',py:'Lí',py_plain:'Li'},
};

// ── i18n / Script utilities ──
function t(key) { return (I18N[lang]||I18N.es)[key] || I18N.es[key] || key; }
function zhFull(p) {
  if(!p) return '';
  return (script==='simp' ? p.zh_simp : p.zh) || p.zh || '';
}
function zhNameOnly(p) { return zhFull(p).replace(/^徐/, ''); }
const BIO_TRAD_TO_SIMP = {
  '亞':'亚','傑':'杰','國':'国','嶺':'岭','廣':'广','慶':'庆','東':'东',
  '業':'业','榮':'荣','樂':'乐','橫':'横','滿':'满','漣':'涟','潤':'润',
  '灣':'湾','獻':'献','發':'发','禮':'礼','統':'统','緒':'绪','縣':'县',
  '纘':'缵','義':'义','興':'兴','華':'华','訓':'训','評':'评','誨':'诲',
  '諒':'谅','謝':'谢','議':'议','貞':'贞','貴':'贵','賢':'贤','賴':'赖',
  '連':'连','達':'达','鍾':'钟','長':'长','開':'开','閩':'闽','陽':'阳',
  '顯':'显','鶴':'鹤','齡':'龄','黃':'黄','軍':'军'
};
function convertBioScript(text) {
  if(script !== 'simp' || !text) return text;
  return text.split('').map(c => BIO_TRAD_TO_SIMP[c] || c).join('');
}
function storyText(p) {
  if(!p) return '';
  const raw = (lang==='en' ? p.story_eng||p.story_spa : p.story_spa||p.story_eng) || '';
  return convertBioScript(raw);
}
function branchLabel(b) { return (lang==='en' ? BRANCH_LABELS_EN : BRANCH_LABELS_ES)[b] || b; }
function provLabel(s) { return (lang==='en' ? PROV_LABELS_EN : PROV_LABELS_ES)[s] || s; }

function syncLangBtns() {
  ['btn-es','cover-btn-es'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('active',lang==='es');});
  ['btn-en','cover-btn-en'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('active',lang==='en');});
  ['btn-trad','cover-btn-trad'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('active',script==='trad');});
  ['btn-simp','cover-btn-simp'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('active',script==='simp');});
}
function setLang(l) {
  lang = l;
  localStorage.setItem('zupu-lang', l);
  syncLangBtns();
  const lf = document.getElementById('lineflow');
  if(lf) lf.removeAttribute('data-built');
  applyI18n();
  if(root) buildTreeLegend();
  if(view==='lineage') buildLineageView();
  if(view==='history') buildHistoryView(historyTab);
  if(selId) openPanel(byId[selId]);
}

function setScript(s) {
  script = s;
  localStorage.setItem('zupu-script', s);
  syncLangBtns();
  refreshTreeNames();
  buildLineagePanelTree();
  const lf = document.getElementById('lineflow');
  if(lf) lf.removeAttribute('data-built');
  if(view==='lineage') buildLineageView();
  if(view==='history') buildHistoryView(historyTab);
  if(selId) openPanel(byId[selId]);
}

function applyI18n() {
  syncLangBtns();
  // Cover
  const covSub=document.querySelector('.cover-subtitle'); if(covSub) covSub.textContent=t('cover_subtitle');
  const covDesc=document.querySelector('.cover-desc'); if(covDesc) covDesc.textContent=t('cover_desc');
  const cst=document.querySelector('.cover-section-title'); if(cst) cst.textContent=t('sec_tree');
  const cat=document.querySelector('.cover-articles-title'); if(cat) cat.textContent=t('sec_articles');
  const cbtns=document.querySelectorAll('.cbtn');
  [['btn_lineage','btn_lineage_desc'],['btn_tree','btn_tree_desc'],['btn_search','btn_search_desc'],['btn_history','btn_history_desc']].forEach(([lk,dk],i)=>{
    if(!cbtns[i]) return;
    const lb=cbtns[i].querySelector('.clbl'); if(lb) lb.textContent=t(lk);
    const dc=cbtns[i].querySelector('.cdesc'); if(dc) dc.textContent=t(dk);
  });
  const lbls=document.querySelectorAll('.stat-card .lbl');
  ['stat_people','stat_gen','stat_mig','stat_clans'].forEach((k,i)=>{ if(lbls[i]) lbls[i].textContent=t(k); });
  const cf=document.getElementById('cover-footer-compiled'); if(cf) cf.textContent=t('footer_compiled');
  const cy=document.getElementById('cover-footer-years'); if(cy) cy.textContent=t('footer_years');
  const wm=document.getElementById('wip-main'); if(wm) wm.textContent=t('wip_main');
  const ws=document.getElementById('wip-sub'); if(ws) ws.textContent=t('wip_sub');
  // Nav tabs
  const ntabs=document.querySelectorAll('.nav-tab');
  ['tab_lineage','tab_tree','tab_search','tab_history'].forEach((k,i)=>{ if(ntabs[i]) ntabs[i].textContent=t(k); });
  // Lineage header
  const lh=document.querySelector('.lineage-header p');
  if(lh) lh.innerHTML=`${t('lineage_intro_pre')} <span class="zh">廿九郎公</span>, ${t('lineage_intro_post')}`;
  const lhTitle=document.querySelector('.lineage-header h2'); if(lhTitle) lhTitle.textContent=t('lineage_title');
  // History tabs
  const htabs=document.querySelectorAll('.htab');
  ['htab_mig','htab_spouse','htab_time'].forEach((k,i)=>{ if(htabs[i]) htabs[i].textContent=t(k); });
  // Search
  const si1=document.getElementById('search-input'); if(si1) si1.placeholder=t('search_ph');
  const si2=document.getElementById('search-view-input'); if(si2) si2.placeholder=t('search_ph');
  // Tree stats
  const ts=document.getElementById('tree-stats');
  if(ts) ts.innerHTML=`<strong id="tree-stat-n">${DB?DB.length:'—'}</strong>${t('stat_people').toLowerCase()} · ${t('tree_years')}`;
  // Review banner
  const rbS=document.querySelector('#review-banner strong'); if(rbS) rbS.textContent=t('review_active');
  const rbSp=document.querySelector('#review-banner span'); if(rbSp) rbSp.textContent=t('review_sub');
  // Panel action buttons
  const pa=document.querySelectorAll('.pp-action');
  if(pa[0]) pa[0].textContent=t('copy_link');
  const pgf=document.getElementById('pp-goto-father'); if(pgf) pgf.textContent=t('see_father');
  // Article back
  const ab=document.querySelector('.article-back'); if(ab) ab.textContent=t('back');
  // Tree legend title & lineage panel title
  const tlt=document.getElementById('tree-legend-title'); if(tlt) tlt.textContent=t('legend_branches');
  const lpt=document.getElementById('lineage-panel-title'); if(lpt) lpt.textContent=t('lineage_panel_title');
}

function refreshTreeNames() {
  if(!g) return;
  g.selectAll('.zl').text(d => {
    const nm = zhNameOnly(d.data.data);
    return nm.length > 4 ? nm.slice(0, 4) + '…' : nm;
  });
  g.selectAll('.card-zh').text(d => zhNameOnly(d.data.data));
}

// ── Boot ──
async function boot() {
  const hash = location.hash.replace('#','');
  try {
    const [dbRes, artRes] = await Promise.all([
      fetch('./data/zupu.json'),
      fetch('./content/articles.json'),
    ]);
    if (!dbRes.ok) throw new Error(`HTTP ${dbRes.status} al cargar data/zupu.json`);
    const raw = await dbRes.json();
    DB = raw.people;
    ARTICLES = artRes.ok ? await artRes.json() : [];
    processData();
    buildStats();
    buildCoverArticles();
    applyI18n();

    if (hash.startsWith('person=')) {
      enterApp('tree');
      setTimeout(() => openPerson(hash.slice(7)), 60);
    } else if (hash.startsWith('article=')) {
      enterApp('article');
      setTimeout(() => showArticle(hash.slice(8)), 60);
    } else if (pendingView) {
      const pv = pendingView; pendingView = null;
      if (pv.startsWith('article:')) {
        enterApp('article');
        showArticle(pv.slice(8));
      } else {
        enterApp(pv);
      }
    }
  } catch(err) { showError(err); }
}

function processData() {
  DB.forEach(p => { byId[p.id] = p; });
  DB.forEach(p => { if (p.pid && byId[p.pid]) (kids[p.pid]=kids[p.pid]||[]).push(p.id); });
  // Sort children by birth_order when defined
  Object.keys(kids).forEach(pid => {
    kids[pid].sort((a,b) => ((byId[a]?.birth_order??999) - (byId[b]?.birth_order??999)));
  });
  LINEAGE = DB.filter(p => p.rodrigo).sort((a,b) => a.gen - b.gen);
}

function enterApp(v) {
  document.getElementById('cover').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  // Show/hide nav for article view
  document.getElementById('nav-tabs').style.display = v === 'article' ? 'none' : '';
  setView(v);
}

function buildStats() {
  if (!DB) return;
  document.getElementById('stat-people').textContent = DB.length;
  document.getElementById('stat-gen').textContent = new Set(DB.map(p=>p.gen)).size;
  document.getElementById('stat-mig').textContent = DB.filter(p=>p.migration).length;
  document.getElementById('stat-clans').textContent = new Set(DB.flatMap(p=>p.spouse_clans||[])).size;
}

function buildCoverArticles() {
  const container = document.getElementById('cover-articles-grid');
  if (!container || !ARTICLES || !ARTICLES.length) return;
  container.innerHTML = ARTICLES.map(a => `
    <button class="abtn" onclick="startArticle('${a.id}')">
      <div class="aicon">${a.icon||'📄'}</div>
      <div class="atxt">
        <div class="albl">${escHtml(a.buttonLabel||a.title)}</div>
        <div class="adesc">${escHtml(a.subtitle||'')}</div>
      </div>
    </button>
  `).join('');
}

function showError(err) {
  document.getElementById('error-screen').classList.add('show');
  document.getElementById('error-msg').textContent = err.message;
}

// ── Cover entry points (global) ──
window.startApp = function(v) {
  if (DB) enterApp(v); else pendingView = v;
};
window.startArticle = function(id) {
  if (DB) { enterApp('article'); showArticle(id); }
  else pendingView = 'article:' + id;
};
window.goHome = function() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('cover').classList.remove('hidden');
  location.hash = '';
};

// ── Navigation ──
function setView(v) {
  view = v;
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view===v));
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id==='v-'+v));
  if (v==='tree')    { if(!root) initTree(); }
  else if (v==='lineage')  buildLineageView();
  else if (v==='history')  buildHistoryView(historyTab);
  else if (v==='search')   setTimeout(()=>document.getElementById('search-view-input').focus(),100);
}

// ── LINEAGE VIEW ──
function buildLineageView() {
  const c = document.getElementById('lineflow');
  if (c.dataset.built) return;
  c.dataset.built='1';
  c.innerHTML = LINEAGE.map((p,i) => {
    const isChile = /chile/i.test(p.migration||'')||/chile/i.test(p.place||'');
    const role = buildLRole(p);
    const story = storyText(p);
    const storyHtml = story ? renderMd(story) : '';
    const kcount = (kids[p.id]||[]).length;
    return `<div class="lcard rod" onclick="openPerson('${p.id}')">
      ${isChile?`<div class="chile-badge">🇨🇱 Chile</div>`:''}
      <div class="lgen">${t('gen_label')} ${p.gen}</div>
      <div class="lzh zh">${zhFull(p)}</div>
      ${p.civil_name_es?`<div class="lcivil">${escHtml(p.civil_name_es)}</div>`:''}
      <div class="lpy">${p.py||''}</div>
      ${p.hakka_py?`<div class="lhakka"><span class="hk-lbl">客家</span> ${escHtml(p.hakka_py)}</div>`:''}
      ${storyHtml?`<div class="lstory">${storyHtml}</div>`:role?`<div class="lrole">${role}</div>`:''}
      <div class="lmeta">
        ${p.birth?`<span>🗓 <b>${p.birth}</b></span>`:''}
        ${p.place?`<span>📍 <b>${p.place.split('(')[0].trim()}</b></span>`:''}
        ${(p.spouses&&p.spouses.length)?`<span>👰 ${p.spouses.length}</span>`:''}
        ${kcount?`<span>👶 ${kcount}</span>`:''}
      </div>
    </div>${i<LINEAGE.length-1?'<div class="lconn"><div class="lconn-dot"></div></div>':''}`;
  }).join('');
}
function buildLRole(p) {
  const parts = [];
  if (p.founder) parts.push(`🏛️ ${p.founder}`);
  if (p.migration) parts.push(`🚶 ${p.migration}`);
  if (!p.founder&&!p.migration&&p.notes) {
    const c = p.notes.replace(/\[.*?\]/g,'').trim();
    if (c) parts.push(c.slice(0,100)+(c.length>100?'…':''));
  }
  return parts.slice(0,2).join('<br>');
}

// ── TREE VIEW ──
let svg, g, treeLayout, Z;
const W=()=>document.getElementById('tree-canvas').clientWidth;
const H=()=>document.getElementById('tree-canvas').clientHeight;
function colFor(p){return p.rodrigo?'#c8941a':(BRANCH_COLORS[p.branch]||'#888');}

function initTree() {
  svg = d3.select('#tree-svg');
  svg.selectAll('*').remove();
  Z = d3.zoom().scaleExtent([0.03,3]).on('zoom', e=>{
    g.attr('transform', e.transform);
    cs = e.transform.k;
    applyZoomLevel();
  });
  svg.call(Z).on('dblclick.zoom', null);
  g = svg.append('g').attr('class', 'zoom-far');

  treeLayout = d3.tree().nodeSize([48, 135]);

  function makeNode(id) {
    const p=byId[id]; if(!p) return null;
    const ch=(kids[id]||[]).map(makeNode).filter(Boolean);
    return {data:p, children:ch.length?ch:null, _children:null};
  }
  const rootData = makeNode('ANC_NIANJIULANG');
  root = d3.hierarchy(rootData, d=>d.children);

  root.descendants().forEach(d=>{
    if(!d.data.data.rodrigo && d.children && d.data.data.gen>7){
      d._children=d.children; d.children=null;
    }
  });

  document.getElementById('tree-stat-n').textContent = DB.length;
  buildTreeLegend();
  buildLineagePanelTree();
  updateTree(root);
  setTimeout(resetView, 80);
}

function applyZoomLevel() {
  const level = cs<0.18?'far': cs<0.55?'mid':'close';
  if (level !== currentZoomLevel) {
    currentZoomLevel = level;
    g.classed('zoom-far', level==='far')
     .classed('zoom-mid', level==='mid')
     .classed('zoom-close', level==='close');
  }
}

function buildTreeLegend() {
  const present = [...new Set(DB.map(p=>p.branch).filter(b=>b&&!HIDDEN_BRANCHES.has(b)))];
  document.getElementById('tree-legend-body').innerHTML = [
    ...present.map(b=>`<div class="leg-item"><div class="leg-dot" style="background:${BRANCH_COLORS[b]||'#888'}"></div>${branchLabel(b)}</div>`),
    `<div class="leg-item"><div class="leg-dot" style="background:#c8941a;box-shadow:0 0 4px rgba(200,148,26,.5)"></div>${t('legend_direct')}</div>`
  ].join('');
}

function buildLineagePanelTree() {
  document.getElementById('ll').innerHTML = LINEAGE.map(p=>`
    <div class="lp-item" data-id="${p.id}" onclick="focusNode('${p.id}')">
      <div class="lpi-gen">Gen ${p.gen}</div>
      <div class="lpi-zh zh">${zhFull(p)}</div>
      <div class="lpi-py">${p.py_plain||p.py||''}</div>
    </div>
  `).join('');
}

function updateTree(src) {
  treeLayout(root);
  const nodes = root.descendants();
  const links = root.links();
  const oy = 40;

  // Links
  const link = g.selectAll('.link').data(links, d=>d.target.data.data.id);
  link.exit().transition().duration(200).style('opacity',0).remove();
  link.enter().append('path')
    .attr('class', d=>'link'+(d.source.data.data.rodrigo&&d.target.data.data.rodrigo?' rod-link':''))
    .style('opacity',0)
    .merge(link)
    .transition().duration(260).style('opacity',null)
    .attr('d', d=>`M${d.source.x},${d.source.y+oy}C${d.source.x},${(d.source.y+d.target.y)/2+oy} ${d.target.x},${(d.source.y+d.target.y)/2+oy} ${d.target.x},${d.target.y+oy}`);

  // Nodes
  const node = g.selectAll('.node').data(nodes, d=>d.data.data.id);
  node.exit().transition().duration(200).style('opacity',0).remove();

  const ne = node.enter().append('g')
    .attr('transform', d=>`translate(${d.x0??d.x},${(d.y0??d.y)+oy})`)
    .style('opacity',0);

  // Circle
  ne.append('circle').attr('r',0);

  // Compact labels (mid zoom)
  const compact = ne.append('g').attr('class','n-compact');
  compact.append('text').attr('class','nl')
    .attr('text-anchor','middle').attr('dy','-1.1em')
    .attr('font-size','8px').attr('font-family','Segoe UI,sans-serif');
  compact.append('text').attr('class','zl')
    .attr('text-anchor','middle').attr('dy','1.6em')
    .attr('font-size','9.5px').attr('font-family','Noto Serif TC,serif');

  // Card (close zoom)
  const card = ne.append('g').attr('class','n-card');
  card.append('rect')
    .attr('x',-22).attr('y',11).attr('width',44).attr('height',30)
    .attr('rx',5).attr('ry',5)
    .attr('fill','#fff9f2').attr('stroke','#e8d8c0').attr('stroke-width',0.8);
  card.append('text').attr('class','card-zh')
    .attr('text-anchor','middle').attr('y',25)
    .attr('font-size','10px').attr('font-family','Noto Serif TC,serif');
  card.append('text').attr('class','card-py')
    .attr('text-anchor','middle').attr('y',36)
    .attr('font-size','7.5px').attr('font-family','Segoe UI,sans-serif').attr('fill','#a08060');

  ne.on('click',(e,d)=>{toggleNode(d);e.stopPropagation();})
    .on('mouseover',(e,d)=>showTip(e,d.data.data))
    .on('mouseout',()=>{document.getElementById('tooltip').style.opacity=0;});

  const all = node.merge(ne);
  all.transition().duration(260).style('opacity',null)
    .attr('transform',d=>`translate(${d.x},${d.y+oy})`);

  all.attr('class', d=>{
    let c='node';
    if(d.data.data.rodrigo) c+=' rod-node';
    if(d.data.data.id===selId) c+=' selected';
    return c;
  });

  all.select('circle').transition().duration(260)
    .attr('r', d=>d.data.data.rodrigo?9:(d._children?7:4))
    .attr('fill', d=>{const c=colFor(d.data.data); return d.data.data.rodrigo?c:(d._children?c:c+'55');})
    .attr('stroke', d=>d.data.data.rodrigo?'#fff8ec':'none')
    .attr('stroke-width',1.5);

  // Compact label text
  all.select('.nl')
    .text(d=>{const n=genNum(d.data.data);return n==='—'?'':n;})
    .attr('fill', d=>colFor(d.data.data)+'99');
  all.select('.zl')
    .text(d=>{const nm=zhNameOnly(d.data.data); return nm.length>4?nm.slice(0,4)+'…':nm;})
    .attr('fill', d=>colFor(d.data.data));

  // Card text
  all.select('.card-zh')
    .text(d=>zhNameOnly(d.data.data))
    .attr('fill', d=>colFor(d.data.data));
  all.select('.card-py')
    .text(d=>{const py=d.data.data.py_plain||''; return py.replace(/^Xu /i,'').replace(/^Xú /i,'').split(' ').slice(0,2).join('');});

  nodes.forEach(d=>{d.x0=d.x;d.y0=d.y;});
}

function toggleNode(d) {
  if(d.children){d._children=d.children;d.children=null;}
  else if(d._children){d.children=d._children;d._children=null;}
  selId=d.data.data.id;
  updateTree(d);
  openPanel(d.data.data);
  location.hash='person='+d.data.data.id;
}
function focusNode(id) {
  if(!root) return;
  expandChain(id); selId=id;
  updateTree(root); centerOnNode(id); openPanel(byId[id]);
  location.hash='person='+id;
}
function expandChain(id) {
  const chain=ancestorChain(id);
  chain.forEach(cid=>root.each(d=>{if(d.data.data.id===cid&&d._children){d.children=d._children;d._children=null;}}));
}
function ancestorChain(id){const c=[];let cur=id;while(cur){c.push(cur);cur=byId[cur]?.pid;}return c;}
function centerOnNode(id){
  root.each(d=>{if(d.data.data.id===id) svg.transition().duration(500).call(Z.transform,d3.zoomIdentity.translate(W()/2-d.x*cs,H()/3-(d.y+40)*cs).scale(cs));});
}
function showTip(e,p){
  const tip=document.getElementById('tooltip');
  const rect=document.getElementById('tree-canvas').getBoundingClientRect();
  tip.innerHTML=`<span class="tz">${zhFull(p)}</span>${p.py||''}<br><small style="color:var(--dim)">Gen ${p.gen} · ${branchLabel(p.branch)}</small>${p.place?`<br>📍 ${p.place.split('(')[0].trim()}`:''}`;
  tip.style.left=(e.clientX-rect.left+14)+'px';
  tip.style.top=(e.clientY-rect.top-10)+'px';
  tip.style.opacity=1;
}
function expandAll(){root.each(d=>{if(d._children){d.children=d._children;d._children=null;}});updateTree(root);}
function collapseAll(){root.each(d=>{if(d.children&&d.depth>0){d._children=d.children;d.children=null;}});updateTree(root);}
function resetView(){svg.transition().duration(500).call(Z.transform,d3.zoomIdentity.translate(W()/2,60).scale(cs));}

// ── PERSON PANEL ──
function openPanel(p) {
  if(!p) return;
  selId=p.id;
  document.getElementById('pp-zh').textContent=zhFull(p);
  document.getElementById('pp-py').textContent=p.py||'';
  const civEl=document.getElementById('pp-civil');
  if(civEl) civEl.textContent=p.civil_name_es||'';
  const hkEl=document.getElementById('pp-hakka');
  if(hkEl) hkEl.textContent=p.hakka_py?`客家: ${p.hakka_py}`:'';
  buildBreadcrumb(p.id);
  document.getElementById('pp-body').innerHTML=buildPanelHTML(p);
  const panel=document.getElementById('person-panel');
  panel.classList.remove('hidden');
  if(window.innerWidth<=700) panel.classList.add('open');
  const fb=document.getElementById('pp-goto-father');
  if(fb) fb.style.display=p.pid?'':'none';
  document.querySelectorAll('.lp-item').forEach(el=>el.classList.toggle('active',el.dataset.id===p.id));
}
function buildBreadcrumb(id){
  if(!id) return;
  const chain=ancestorChain(id).reverse().slice(-5);
  document.getElementById('pp-breadcrumb').innerHTML=chain.map((cid,i)=>{
    const p=byId[cid]; if(!p) return '';
    return `${i?'<span class="sep">→</span>':''}<span onclick="openPerson('${cid}')">${zhFull(p)}</span>`;
  }).join('');
}
function buildPanelHTML(p) {
  let h='';
  if(p.rodrigo) h+=`<div class="chile-tag">${t('chile_tag')}</div>`;
  h+=`<div class="gen-tags">
    <span class="gen-tag">Gen ${p.gen} global</span>
    ${p.gen_wuhua?`<span class="gen-tag">Gen ${p.gen_wuhua} Wuhua</span>`:''}
    ${p.gen_heling?`<span class="gen-tag">Gen ${p.gen_heling} Hèlíng</span>`:''}
  </div>`;

  // Identidad
  h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_identity')}</div>`;
  if(p.civil_name_es) h+=ppField(t('f_civil'),p.civil_name_es);
  if(p.alias) h+=ppField(t('f_alias'),p.alias);
  h+=ppField(t('f_branch'),branchLabel(p.branch)||'—');
  if(p.hakka_py) h+=ppField(t('f_hakka'),p.hakka_py);
  h+=`</div>`;

  // Familia
  const father=p.pid?byId[p.pid]:null;
  const children=(kids[p.id]||[]).map(cid=>byId[cid]).filter(Boolean);
  h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_family')}</div>`;
  if(father) h+=`<div class="pp-field"><label>${t('f_father')}</label><p><span class="nav-chip" onclick="openPerson('${father.id}')"><span class="zh">${zhFull(father)}</span></span></p></div>`;
  if(p.spouses&&p.spouses.length){
    h+=`<div class="pp-field"><label>${t('f_spouses')}</label>`;
    p.spouses.forEach(s=>{const ps=parseSpouse(s);h+=`<div class="spouse-box"><span class="sp-zh">${escHtml(ps.zh||ps.raw)}</span>${ps.clan?`<span class="sp-clan"> · ${escHtml(ps.clan)}</span>`:''}${ps.type?`<br><span class="sp-clan">${escHtml(ps.type)}</span>`:''}</div>`;});
    h+=`</div>`;
  }
  if(children.length){
    h+=`<div class="pp-field"><label>${t('f_children')} (${children.length})</label><p>`;
    children.forEach(k=>{h+=`<span class="nav-chip" onclick="openPerson('${k.id}')"><span class="zh">${zhFull(k)}</span></span>`;});
    h+=`</p></div>`;
  }
  h+=`</div>`;

  // Lugares
  if(p.origin||p.place||p.migration){
    h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_places')}</div>`;
    if(p.origin)    h+=ppField(t('f_origin'),p.origin);
    if(p.place)     h+=ppField(t('f_place'),p.place);
    if(p.migration) h+=ppField(t('f_migration'),p.migration);
    h+=`</div>`;
  }

  // Fechas
  if(p.birth||p.death){
    h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_dates')}</div>`;
    if(p.birth) h+=ppField(t('f_birth'),p.birth);
    if(p.death) h+=ppField(t('f_death'),p.death);
    h+=`</div>`;
  }

  // Entierro
  const burialText = reviewMode ? p.burial : (p.burial_spa||p.burial);
  if(burialText){
    h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_burial')}</div>`;
    h+=`<div class="pp-field"><p>${escHtml(burialText)}</p></div>`;
    if(reviewMode && p.burial && p.burial_spa){
      h+=`<div class="pp-field"><label>Original (zupu)</label><p style="font-size:11px;color:var(--dim)">${escHtml(p.burial)}</p></div>`;
    }
    h+=`</div>`;
  }

  // Biografía / Significado del nombre
  const pStory = storyText(p);
  if(pStory) {
    const sLabel = p.branch==='chile' ? t('sec_name_meaning') : (p.rodrigo ? t('sec_biography') : null);
    if(sLabel) {
      h+=`<div class="pp-section"><div class="pp-section-title">${sLabel}</div>`;
      h+=`<div class="pp-field md-body">${renderMd(pStory)}</div>`;
      h+=`</div>`;
    }
  }

  // Notas
  const notesText = lang==='en' ? (p.notes_eng||p.notes) : p.notes;
  if(notesText){
    h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_notes')}</div>`;
    h+=`<div class="pp-field"><p>${escHtml(notesText)}</p></div>`;
    h+=`</div>`;
  }

  // Revisión
  if(reviewMode && p.flags&&p.flags.length&&p.flags.some(f=>f!=='traduccion_por_revisar')){
    h+=`<div class="review-flag">🔍 ${buildFlagsHTML(p.flags.filter(f=>f!=='traduccion_por_revisar'))}</div>`;
  }

  // Fuente
  h+=`<div class="pp-section"><div class="pp-section-title">${t('sec_source')}</div>`;
  if(p.provenance){
    const label=provLabel(p.provenance);
    const cls=/familiar/i.test(p.provenance)?'badge-fam':/ZUPU_2025/i.test(p.provenance)?'badge-pdf':'badge-doc';
    h+=`<span class="badge ${cls}">📖 ${escHtml(label)}</span>`;
  }
  if(reviewMode && p.flags&&p.flags.includes('traduccion_por_revisar')){
    h+=`<span class="badge badge-flag-warn">🔍 ${lang==='en'?'Translation pending':'Traducción por revisar'}</span>`;
  }
  h+=`</div>`;
  return h;
}
function buildFlagsHTML(flags){
  const labels={dato_sospechoso:'⚠️ Dato dudoso',datos_incompletos:'📋 Incompleto',registro_incompleto:'📋 Incompleto',fecha_notable:'📅 Fecha notable',curiosidad:'💡 Curiosidad',adopcion:'👨‍👧 Adopción'};
  const cls={dato_sospechoso:'badge-flag-warn',datos_incompletos:'badge-flag-warn',registro_incompleto:'badge-flag-warn',fecha_notable:'badge-flag-info',curiosidad:'badge-flag-info',adopcion:'badge-flag-bad'};
  return flags.map(f=>`<span class="badge ${cls[f]||'badge-flag-warn'}">${labels[f]||f}</span>`).join('');
}
function ppField(label,val){if(!val)return'';return`<div class="pp-field"><label>${label}</label><p>${escHtml(String(val))}</p></div>`;}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function parseSpouse(s){
  const zh=(s.match(/[一-鿿]+/)||[])[0]||'';
  const clan=(s.match(/([A-ZÁÉÍÓÚ][a-záéíóú]+)\s+shì/)||[])[0]||'';
  const type=(s.match(/\(([^)]+)\)/)||[])[1]||'';
  return{raw:s,zh,clan,type};
}
function closePanel(){
  const panel=document.getElementById('person-panel');
  panel.classList.add('hidden');panel.classList.remove('open');selId=null;
}

// ── OPEN PERSON ──
window.openPerson = function(id) {
  const p=byId[id]; if(!p) return;
  if(view!=='tree') setView('tree');
  selId=id;
  if(!root){initTree();setTimeout(()=>{expandChain(id);updateTree(root);centerOnNode(id);openPanel(p);},200);}
  else{expandChain(id);updateTree(root);centerOnNode(id);openPanel(p);}
  location.hash='person='+id;
};

// ── ARTICLE SYSTEM ──
let loadedMd = {};

async function showArticle(id) {
  const art = ARTICLES && ARTICLES.find(a=>a.id===id);
  if(!art){showToast('Artículo no encontrado'); return;}

  view = 'article';
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  document.getElementById('v-article').classList.add('active');
  document.getElementById('nav-tabs').style.display='none';
  location.hash='article='+id;

  // Render shell immediately
  const wrap=document.getElementById('article-content-wrap');
  wrap.innerHTML=`
    <div class="article-icon">${art.icon||'📄'}</div>
    <h1 class="article-title">${escHtml(art.title)}</h1>
    <p class="article-subtitle">${escHtml(art.subtitle||'')}</p>
    <div class="article-tags">${(art.tags||[]).map(t=>`<span class="article-tag">${escHtml(t)}</span>`).join('')}</div>
    <div class="article-divider"></div>
    <div id="article-md-body" class="md-body"><div class="article-loading">Cargando…</div></div>
  `;

  // Load markdown
  const el=document.getElementById('article-md-body');
  if(loadedMd[id]){
    el.innerHTML=renderMd(loadedMd[id]);
  } else {
    try{
      const res=await fetch('./content/'+art.file);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const md=await res.text();
      loadedMd[id]=md;
      el.innerHTML=renderMd(md);
    }catch(e){
      el.innerHTML=`<div class="article-error">⚠️ No se pudo cargar el artículo: ${escHtml(e.message)}<br><small>Asegúrate de que el archivo ./content/${escHtml(art.file||'')} exista.</small></div>`;
    }
  }
}

function renderMd(md) {
  if(typeof marked !== 'undefined') {
    try { return marked.parse(md, {breaks:false, gfm:true}); } catch(e) {}
  }
  return basicMd(md);
}

function basicMd(md) {
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^#{3}\s+(.+)$/gm,'<h3>$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm,'<h2>$1</h2>')
    .replace(/^#{1}\s+(.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^>\s*(.+)$/gm,'<blockquote><p>$1</p></blockquote>')
    .replace(/^-{3,}$/gm,'<hr>')
    .replace(/\n{2,}/g,'</p><p>')
    .replace(/^(.+)$/gm, (line) => line.startsWith('<') ? line : `<p>${line}</p>`)
    .replace(/<p><\/p>/g,'');
}

function goBackFromArticle() {
  document.getElementById('nav-tabs').style.display='';
  goHome();
}

// ── SEARCH ──
function onSearchInput(input,isView){
  clearTimeout(searchTimer);
  const q=input.value.trim();
  if(!q){
    if(isView){document.getElementById('search-view-results').innerHTML='';document.getElementById('search-count').textContent='';}
    else{document.getElementById('search-results').style.display='none';}
    return;
  }
  searchTimer=setTimeout(()=>{
    if(isView) buildSearchResults(q);
    else{
      const res=searchPeople(q,10);
      const dr=document.getElementById('search-results');
      if(!res.length){dr.style.display='none';return;}
      dr.innerHTML=`<div class="sr-head">${res.length} ${res.length===1?t('people_found'):t('people_found_pl')}</div>`+res.map(p=>`<div class="sr-item" onclick="openPerson('${p.id}')"><span class="sri-zh zh">${zhFull(p)}</span><span class="sri-py">${p.py||''}</span><span class="sri-meta">${p.place?p.place.split('(')[0].trim():''}<br>Gen ${p.gen}</span></div>`).join('');
      dr.style.display='block';
    }
  },180);
}
function buildSearchResults(q){
  const res=searchPeople(q,120);
  const cnt=res.length;
  document.getElementById('search-count').textContent=cnt?`${cnt} ${cnt===1?t('people_found'):t('people_found_pl')}`:t('no_results');
  document.getElementById('search-view-results').innerHTML=res.map(p=>`
    <div class="search-result-item" onclick="openPerson('${p.id}')">
      <div class="sri-main">
        <div class="sri-zh zh">${zhFull(p)}</div>
        <div class="sri-py">${p.py||''}</div>
        <div class="sri-info">${[p.place,p.migration].filter(Boolean).map(s=>s.split('(')[0].trim()).join(' · ')||t('no_place')}</div>
      </div>
      <div class="sri-side">Gen ${p.gen}<br>${branchLabel(p.branch)}</div>
    </div>`).join('');
}
function searchPeople(q,max){
  const ql=q.toLowerCase();
  return DB.filter(p=>
    (p.zh&&p.zh.includes(q))||(p.zh_simp&&p.zh_simp.includes(q))||
    (p.py&&p.py.toLowerCase().includes(ql))||
    (p.py_plain&&p.py_plain.toLowerCase().includes(ql))||(p.place&&p.place.toLowerCase().includes(ql))||
    (p.migration&&p.migration.toLowerCase().includes(ql))||(p.alias&&p.alias.toLowerCase().includes(ql))||
    (p.spouses&&p.spouses.some(s=>s.toLowerCase().includes(ql)))||
    (p.notes&&p.notes.toLowerCase().includes(ql))
  ).slice(0,max);
}
function hideSearchDropdown(){setTimeout(()=>{document.getElementById('search-results').style.display='none';},200);}

// ── HISTORY VIEW ──
function buildHistoryView(tab){
  historyTab=tab;
  document.querySelectorAll('.htab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  const body=document.getElementById('history-body');
  if(tab==='migrations'){body.innerHTML=buildMigrationsHTML();renderMigrationMap();}
  else if(tab==='spouses') body.innerHTML=buildSpousesHTML();
  else if(tab==='timeline') body.innerHTML=buildTimelineHTML();
}
function buildMigrationsHTML(){
  const grouped={};
  DB.filter(p=>p.migration).forEach(p=>{
    const dest=p.migration.replace(/^→\s*/,'').trim();
    (grouped[dest]=grouped[dest]||[]).push(p);
  });
  const listHTML=Object.keys(grouped).sort((a,b)=>grouped[b].length-grouped[a].length).map(dest=>`
    <div class="migrations-group">
      <h3>${escHtml(dest)}<span class="count">${grouped[dest].length} ${t('mig_people')}</span></h3>
      <div>${grouped[dest].map(p=>`<div class="mig-chip" onclick="openPerson('${p.id}')"><span class="mzh zh">${zhFull(p)}</span> ${p.py_plain||p.py||''}</div>`).join('')}</div>
    </div>`).join('');
  return `<div class="mig-map-wrap"><svg id="mig-map-svg"></svg><div class="mig-map-chile" id="mig-chile-note"></div></div>${listHTML}`;
}

const MIG_COORDS={
  'Sìchuān (四川)':[104,30.5],
  'Jiāngxī (江西)':[116,27],
  'Běiliú (北流), Guǎngxī (廣西)':[110.4,22.7],
  'Píngxiāng (萍鄉), Jiāngxī (江西)':[113.8,27.6],
  'Guǎngxī (廣西)':[108.3,24],
  'Húnán (湖南)':[112,27.8],
  'Hèshān (鶴山), Guǎngdōng (廣東)':[112.9,22.8],
  'Wǔhuá (五華), Guǎngdōng (廣東)':[115.8,24.1],
  'Guǎngzhōu (廣州), Guǎngdōng (廣東)':[113.3,23.1],
  'Húguǎng (湖廣)':[112,29],
  'Huìzhōu (惠州), Guǎngdōng (廣東)':[114.4,23.1],
  'Shǎnxī (陝西)':[108.9,34.3],
  'Vietnam':[108,16],
  'Wúzhōu (梧州), Guǎngxī (廣西)':[111.3,23.5],
  'Jiéyáng (揭陽), Guǎngdōng (廣東)':[116.4,23.5],
  'Bóluó (博羅), Guǎngdōng (廣東)':[114.3,23.2]
};
const MIG_LABELS={
  'Sìchuān (四川)':'Sìchuān','Jiāngxī (江西)':'Jiāngxī',
  'Běiliú (北流), Guǎngxī (廣西)':'Běiliú','Píngxiāng (萍鄉), Jiāngxī (江西)':'Píngxiāng',
  'Guǎngxī (廣西)':'Guǎngxī','Húnán (湖南)':'Húnán',
  'Hèshān (鶴山), Guǎngdōng (廣東)':'Hèshān','Wǔhuá (五華), Guǎngdōng (廣東)':'Wǔhuá',
  'Guǎngzhōu (廣州), Guǎngdōng (廣東)':'Guǎngzhōu','Húguǎng (湖廣)':'Húguǎng',
  'Huìzhōu (惠州), Guǎngdōng (廣東)':'Huìzhōu','Shǎnxī (陝西)':'Shǎnxī',
  'Vietnam':'Vietnam','Wúzhōu (梧州), Guǎngxī (廣西)':'Wúzhōu',
  'Jiéyáng (揭陽), Guǎngdōng (廣東)':'Jiéyáng','Bóluó (博羅), Guǎngdōng (廣東)':'Bóluó'
};

function renderMigrationMap(){
  const svg=document.getElementById('mig-map-svg');
  if(!svg) return;
  const W=svg.parentElement.clientWidth||500;
  const H=Math.round(W*0.7);
  svg.setAttribute('width',W); svg.setAttribute('height',H);

  const counts={};
  DB.filter(p=>p.migration).forEach(p=>{
    const k=p.migration.replace(/^→\s*/,'').trim();
    if(k!=='Chile') counts[k]=(counts[k]||0)+1;
  });
  const chileN=DB.filter(p=>p.migration==='→ Chile').length;
  const note=document.getElementById('mig-chile-note');
  if(note&&chileN) note.innerHTML=`🇨🇱 <b>Chile</b>: ${chileN} ${t('mig_people')} — emigración al otro lado del mundo`;

  const maxN=Math.max(...Object.values(counts),1);
  const rScale=n=>4+Math.sqrt(n/maxN)*18;

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
    .then(r=>r.json()).then(world=>{
      const proj=d3.geoMercator().center([108,26]).scale(W*2.1).translate([W*0.48,H*0.42]);
      const pathGen=d3.geoPath().projection(proj);
      const countries=topojson.feature(world,world.objects.countries);
      const S=d3.select(svg);
      S.selectAll('*').remove();
      S.append('rect').attr('width',W).attr('height',H).attr('fill','#ddeeff').attr('rx',6);
      S.append('g').selectAll('path').data(countries.features).join('path')
        .attr('d',pathGen).attr('fill','#eee8df').attr('stroke','#c8b898').attr('stroke-width',0.5);

      const pts=Object.entries(counts).map(([k,n])=>{
        const xy=proj(MIG_COORDS[k]||[0,0]);
        return{k,n,x:xy[0],y:xy[1],label:MIG_LABELS[k]||k};
      }).filter(pt=>pt.x>0&&pt.x<W&&pt.y>0&&pt.y<H);

      pts.forEach(pt=>{
        const g=S.append('g').attr('cursor','default');
        g.append('title').text(`${pt.label}: ${pt.n} ${t('mig_people')}`);
        g.append('circle').attr('cx',pt.x).attr('cy',pt.y)
          .attr('r',rScale(pt.n)).attr('fill','#c0392b99').attr('stroke','#922b21').attr('stroke-width',1);
        if(pt.n>=3){
          g.append('text').attr('x',pt.x).attr('y',pt.y-rScale(pt.n)-3)
            .attr('text-anchor','middle').attr('font-size','10').attr('fill','#3a2a1a')
            .attr('font-family','Noto Serif TC,serif').text(`${pt.label} ${pt.n}`);
        }
      });
    }).catch(()=>{
      d3.select(svg).append('text').attr('x',W/2).attr('y',H/2)
        .attr('text-anchor','middle').attr('fill','#666').text('Mapa no disponible (sin conexión)');
    });
}
function buildSpousesHTML(){
  const clanMap={};
  DB.forEach(p=>(p.spouse_clans||[]).forEach(c=>{
    const key=(c.match(/[一-鿿]/)||[c])[0];
    (clanMap[key]=clanMap[key]||[]).push(p);
  }));
  const sorted=Object.keys(clanMap).sort((a,b)=>{
    const ap=(CLAN_INFO[a]||{}).py_plain||a, bp=(CLAN_INFO[b]||{}).py_plain||b;
    return ap.localeCompare(bp);
  });
  return`<div class="clan-grid">${sorted.map(trad=>{
    const info=CLAN_INFO[trad]||{};
    const simp=info.simp||trad;
    const py=info.py||'';
    const py_plain=info.py_plain||'';
    const count=clanMap[trad].length;
    const primary = script==='simp' ? simp : trad;
    const secondary = script==='simp' ? trad : simp;
    const header = primary===secondary ? primary : `${primary} / ${secondary}`;
    const mLabel = count===1?t('marriages'):t('marriages_pl');
    return`<div class="clan-card">
      <h3 class="zh">${header}</h3>
      <div class="cn">${py?`${py} · `:''}${py_plain||''}</div>
      <div class="cn">${count} ${mLabel}</div>
      <div class="hus">${clanMap[trad].slice(0,8).map(p=>`<span onclick="openPerson('${p.id}')">${zhFull(p)}</span>`).join(', ')}${count>8?` +${count-8} más`:''}</div>
    </div>`;
  }).join('')}</div>`;
}
function buildTimelineHTML(){
  return`<div class="timeline-wrap">${DB.filter(p=>p.birth||p.death||p.migration)
    .map(p=>({p,yr:extractYear(p.birth||p.death||p.migration||'')}))
    .sort((a,b)=>a.yr-b.yr)
    .map(({p,yr})=>`<div class="tl-item${p.rodrigo?' rod':''}" onclick="openPerson('${p.id}')">
      ${yr<9999?`<div class="tl-year">~${yr}</div>`:''}
      <div class="tl-name zh">${zhFull(p)} <span class="tl-py">${p.py||''}</span></div>
      <div class="tl-desc">${escHtml([p.birth,p.migration,p.place].filter(Boolean).slice(0,1).join(' '))}</div>
    </div>`).join('')}</div>`;
}
function extractYear(s){const m=String(s).match(/\d{3,4}/);return m?parseInt(m[0]):9999;}

// ── REVIEW MODE ──
function toggleReview(){
  reviewMode=!reviewMode;
  document.querySelector('.review-btn').classList.toggle('on',reviewMode);
  document.getElementById('review-banner').classList.toggle('on',reviewMode);
  if(selId&&reviewMode) openPanel(byId[selId]);
}

// ── GEN MODE ──
function genLabel(){return{wuhua:'Wuhua',heling:'Hèlíng',tian:'Tiān Pā'}[genMode];}
function genNum(p){const n=p['gen_'+genMode];return(!n||n<=0)?'—':String(n);}

// ── COPY LINK ──
function copyPersonLink(id){
  if(!id) return;
  const url=location.origin+location.pathname+'#person='+id;
  navigator.clipboard.writeText(url).then(()=>showToast('Enlace copiado ✓')).catch(()=>prompt('Copia este enlace:',url));
}
function copyArticleLink(id){
  const url=location.origin+location.pathname+'#article='+id;
  navigator.clipboard.writeText(url).then(()=>showToast('Enlace copiado ✓')).catch(()=>prompt('Copia este enlace:',url));
}

// ── TOAST ──
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2400);
}

// ── HASH NAV ──
window.addEventListener('hashchange',()=>{
  const h=location.hash.replace('#','');
  if(h.startsWith('person=')&&DB) openPerson(h.slice(7));
  else if(h.startsWith('article=')&&ARTICLES) showArticle(h.slice(8));
  else if(h===''&&document.getElementById('app')&&!document.getElementById('app').classList.contains('hidden')) goHome();
});

// ── CLICK OUTSIDE SEARCH ──
document.addEventListener('click',e=>{
  if(!document.getElementById('search-wrap')?.contains(e.target))
    document.getElementById('search-results').style.display='none';
});

boot();
