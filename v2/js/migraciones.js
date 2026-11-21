// Migraciones (mapa y lista), clanes de las esposas y cronología.
'use strict';

(function () {
  const Z = window.ZUPU;
  const ORIGEN = [115.8, 24.1]; // Wǔhuá / Niánkēng, de donde salieron casi todos
  const COORD = {
    'Sìchuān (四川)': [104, 30.5], 'Jiāngxī (江西)': [116, 27], 'Běiliú (北流), Guǎngxī (廣西)': [110.4, 22.7],
    'Píngxiāng (萍鄉), Jiāngxī (江西)': [113.8, 27.6], 'Guǎngxī (廣西)': [108.3, 24], 'Húnán (湖南)': [112, 27.8],
    'Hèshān (鶴山), Guǎngdōng (廣東)': [112.9, 22.8], 'Wǔhuá (五華), Guǎngdōng (廣東)': [115.8, 24.1],
    'Guǎngzhōu (廣州), Guǎngdōng (廣東)': [113.3, 23.1], 'Húguǎng (湖廣)': [112, 29.5], 'Huìzhōu (惠州), Guǎngdōng (廣東)': [114.4, 23.1],
    'Shǎnxī (陝西)': [108.9, 34.3], 'Vietnam': [106, 17], 'Wúzhōu (梧州), Guǎngxī (廣西)': [111.3, 23.5],
    'Jiéyáng (揭陽), Guǎngdōng (廣東)': [116.4, 23.5], 'Bóluó (博羅), Guǎngdōng (廣東)': [114.3, 23.2], '廣州 番禺 横江村': [113.4, 22.95],
  };
  const CLAN = {
    '何': 'Hé', '余': 'Yú', '傅': 'Fù', '冼': 'Xiǎn', '凌': 'Líng', '劉': 'Liú', '卓': 'Zhuó', '卜': 'Bǔ', '吳': 'Wú', '呂': 'Lǚ', '周': 'Zhōu', '唐': 'Táng',
    '孔': 'Kǒng', '屈': 'Qū', '廖': 'Liào', '張': 'Zhāng', '彭': 'Péng', '徐': 'Xú', '戴': 'Dài', '施': 'Shī', '曹': 'Cáo', '曾': 'Zēng', '朱': 'Zhū', '李': 'Lǐ',
    '杜': 'Dù', '林': 'Lín', '梁': 'Liáng', '楊': 'Yáng', '樂': 'Yuè', '殷': 'Yīn', '湯': 'Tāng', '溫': 'Wēn', '田': 'Tián', '範': 'Fàn', '范': 'Fàn', '練': 'Liàn',
    '繆': 'Miào', '羅': 'Luó', '胡': 'Hú', '葉': 'Yè', '蕭': 'Xiāo', '袁': 'Yuán', '詹': 'Zhān', '謝': 'Xiè', '譚': 'Tán', '賴': 'Lài', '邱': 'Qiū',
    '郭': 'Guō', '鄧': 'Dèng', '鄭': 'Zhèng', '鍾': 'Zhōng', '鐘': 'Zhōng', '陳': 'Chén', '陸': 'Lù', '顏': 'Yán', '馬': 'Mǎ', '駱': 'Luò', '高': 'Gāo',
    '黃': 'Huáng', '黎': 'Lí', '王': 'Wáng', '鄒': 'Zōu', '韓': 'Hán', '蔡': 'Cài', '鍾氏': 'Zhōng',
  };
  const S2 = { '劉': '刘', '吳': '吴', '呂': '吕', '張': '张', '楊': '杨', '樂': '乐', '湯': '汤', '溫': '温', '範': '范', '練': '练', '繆': '缪', '羅': '罗', '葉': '叶', '蕭': '萧', '詹': '詹', '謝': '谢', '譚': '谭', '賴': '赖', '鄧': '邓', '鄭': '郑', '鍾': '钟', '鐘': '钟', '陳': '陈', '陸': '陆', '顏': '颜', '馬': '马', '駱': '骆', '黃': '黄', '鄒': '邹', '韓': '韩' };
  const chip = (p) => `<a class="mi-chip" href="../arbol/#person=${encodeURIComponent(p.id)}"><span class="zh">${Z.esc(Z.zh(p))}</span></a>`;

  function grupos() {
    const g = {};
    Z.DB.filter((p) => p.migration).forEach((p) => { const d = p.migration.replace(/^→\s*/, '').trim(); (g[d] = g[d] || []).push(p); });
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  }

  let mundo = null;
  function mapa() {
    const svg = d3.select('#mi-mapa');
    const caja = document.querySelector('.mi-mapa-caja');
    const W = caja.clientWidth, H = Math.round(Math.min(W * .72, 640));
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const proj = d3.geoMercator().center([111.5, 26.5]).scale(W * (W < 600 ? 2.6 : 2.15)).translate([W / 2, H / 2]);
    const camino = d3.geoPath(proj);
    if (mundo) {
      const paises = topojson.feature(mundo, mundo.objects.countries);
      svg.append('g').selectAll('path').data(paises.features).join('path').attr('d', camino).attr('class', (d) => 'mi-tierra' + (d.id === '156' ? ' china' : ''));
    }
    const datos = grupos().filter(([d]) => COORD[d] && d !== 'Wǔhuá (五華), Guǎngdōng (廣東)');
    const max = d3.max(datos, (d) => d[1].length) || 1;
    const r = (n) => 7 + Math.sqrt(n / max) * 22;
    const o = proj(ORIGEN);
    const ramas = svg.append('g');
    datos.forEach(([d, ps]) => {
      const [x, y] = proj(COORD[d]);
      const mx = (o[0] + x) / 2, my = Math.min(o[1], y) - Math.abs(o[0] - x) * .18 - 20;
      ramas.append('path').attr('class', 'mi-rama').attr('stroke-width', 1.2 + Math.sqrt(ps.length) * 1.1).attr('d', `M${o[0]},${o[1]}Q${mx},${my} ${x},${y}`);
    });
    const puntos = svg.append('g');
    datos.forEach(([d, ps]) => {
      const [x, y] = proj(COORD[d]);
      const g = puntos.append('g').attr('class', 'mi-punto').attr('transform', `translate(${x},${y})`);
      g.append('title').text(`${d}: ${ps.length}`);
      const s = r(ps.length) * 2;
      g.append('use').attr('href', '#fruto').attr('x', -s / 2).attr('y', -s * .55).attr('width', s).attr('height', s * 1.15);
      if (ps.length >= 2 || W > 700) {
        g.append('text').attr('class', 'mi-etq').attr('y', -s * .55 - 6).attr('text-anchor', 'middle').text(`${Z.lugar(d)} ${ps.length}`);
      }
    });
    const og = svg.append('g').attr('transform', `translate(${o[0]},${o[1]})`);
    og.append('circle').attr('r', 7).attr('class', 'mi-origen');
    og.append('text').attr('class', 'mi-etq origen').attr('x', 12).attr('y', 22).text(Z.L('Wǔhuá · Niánkēng, el hogar del clan', 'Wǔhuá · Niánkēng, the clan’s home'));
  }

  function lista() {
    const gs = grupos();
    const total = gs.reduce((s, [, ps]) => s + ps.length, 0);
    document.getElementById('mi-resumen').innerHTML = Z.L(
      `${total} hombres del clan aparecen en el zupu con una migración registrada, hacia ${gs.length} destinos. Las ramas parten de Wǔhuá, donde vivió el clan desde 1403.`,
      `${total} men of the clan appear in the zupu with a recorded migration, to ${gs.length} destinations. The branches start from Wǔhuá, home of the clan from 1403.`);
    document.getElementById('mi-destinos').innerHTML = gs.map(([d, ps]) => `
      <li><div class="md-cab"><h3>${Z.esc(Z.simp(d))}</h3><span class="num">${ps.length}</span></div>
      <div class="md-chips">${ps.map(chip).join('')}</div></li>`).join('');
  }

  function clanes() {
    const m = {};
    Z.DB.forEach((p) => (p.spouse_clans || []).forEach((c) => {
      const k = (c.match(/[一-鿿]/) || [c])[0];
      if (k === '氏') return;
      (m[k] = m[k] || []).push(p);
    }));
    const lista = Object.entries(m).sort((a, b) => b[1].length - a[1].length || (CLAN[a[0]] || a[0]).localeCompare(CLAN[b[0]] || b[0]));
    const max = lista[0][1].length;
    document.getElementById('mi-clanes').innerHTML = lista.map(([c, ps]) => {
      const tam = (1.4 + Math.sqrt(ps.length / max) * 5).toFixed(2);
      const car = Z.script === 'simp' && S2[c] ? S2[c] : c;
      const maridos = ps.slice(0, 6).map((p) => Z.zh(p)).join('、') + (ps.length > 6 ? Z.L(` y ${ps.length - 6} más`, ` and ${ps.length - 6} more`) : '');
      return `<li title="${Z.esc(maridos)}"><span class="mc-car zh" style="font-size:${tam}rem">${car}</span><span class="mc-py">${CLAN[c] || ''}</span><span class="mc-n num">${ps.length}</span></li>`;
    }).join('');
  }

  function crono() {
    const filas = Z.DB.map((p) => ({ p, y: Z.anio(p.birth) || Z.anio(p.death) || Z.anio(p.migration) }))
      .filter((f) => f.y && f.y > 900).sort((a, b) => a.y - b.y);
    document.getElementById('mi-crono').innerHTML = filas.map(({ p, y }) => {
      const qué = p.birth ? Z.L('Nace', 'Born') + ' ' + p.birth : p.death ? Z.L('Muere', 'Dies') + ' ' + p.death : p.migration;
      return `<li class="${p.rodrigo ? 'directa' : ''}"><span class="mc-anio num">${y}</span>
        <a href="../arbol/#person=${encodeURIComponent(p.id)}"><span class="zh">${Z.esc(Z.zh(p))}</span> <span class="mc-pyn">${Z.esc(p.py || '')}</span></a>
        <span class="mc-que">${Z.esc(Z.simp(qué))}${p.place ? ' · ' + Z.esc(Z.simp(Z.lugar(p.place))) : ''}</span></li>`;
    }).join('');
  }

  function todo() { lista(); clanes(); crono(); mapa(); }

  Promise.all([Z.cargar(), fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then((r) => r.json()).catch(() => null)])
    .then(([, w]) => {
      mundo = w;
      todo();
      Z.alCambiar(todo);
      let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(mapa, 200); });
    })
    .catch((err) => { document.getElementById('mi-resumen').innerHTML = `<span class="error">${Z.esc(err.message)}</span>`; });
})();
