"""Tabla de apellidos: simplificado, pinyin, jyutping, hakka (sixian) y grafías chilenas (Kam-Ching Zambrano)."""
import json, re
import pandas as pd
from pypinyin import pinyin, Style
import pycantonese, opencc

o = pd.read_csv('out/electores.csv')
v = o.apellido.dropna().value_counts()
cc = opencc.OpenCC('t2s')
hk = json.load(open('geo/hakka/dict-hakka.json'))
H = {}
for e in hk:
    if len(e['title']) == 1:
        H.setdefault(e['title'], []).extend(e.get('heteronyms', []))

def hakka(ch):
    out = []
    for h in H.get(ch, []):
        m = re.search(r'四⃞(\S+)', h.get('pinyin', ''))
        if m:
            defs = ' '.join(d.get('def', '') for d in h.get('definitions', []))
            out.append((m.group(1), '姓' in defs))
    return out

# Correcciones de lecturas de apellido (polifónicos)
PY_FIX = {'曾': 'zēng', '翟': 'zhái', '任': 'rén', '歐陽': 'ōuyáng'}
JP_FIX = {'曾': 'zang1', '翟': 'zaak6', '任': 'jam4', '錢': 'cin4'}
HK_COMP = {'羅': 'lo¹¹', '鍾': 'zung²⁴', '鐘': 'zung²⁴'}  # deducidas de compuestos del diccionario

# Cotejo con el «Cuadro genealógico de la colectividad china» (Kam-Ching Zambrano, pp. 54–57)
G = {
 '黃': ('Wong, Bong, Bon', '76', 'Directa', ''),
 '鄭': ('Chiang, Chien', '11', 'Directa', ''),
 '陳': ('Chan, Chang, Chand, Chansán, Chen, Cheng, Ching', '3', 'Directa', ''),
 '周': ('Chau', '4', 'Directa', ''),
 '葉': ('Gac, Gat, Hap, Yap, Hipdin, Hipponí?, Hip, Hipp, Ip', '26', 'Directa', ''),
 '李': ('Lee, Ly, Li, Ley, Loris, Licán, Lypó, Lytái?, Licham?/Lisham?, Likoo, Litong?', '48', 'Directa', ''),
 '梁': ('Leon, Leong, Leung', '49', 'Directa', ''),
 '張': ('Chong, Chiong, Cho, Choney, Choy, Choyén', '16', 'Directa', ''),
 '謝': ('Chía, Chiasán?, Chée?/Chép?, Chañío?', '10', 'Directa', ''),
 '林': ('Lam, Lin, Liem, Ling, Lien, Aján, Lamión?/Lamjón?', '44', 'Directa', 'La observación «Ignacio Aján» respalda la lectura Aján.'),
 '鍾': ('Chung', '18', 'Indirecta', 'El cuadro escribe 鐘.'),
 '羅': ('Loo, Lo, Lofock, Lo Jen?/Lo Jan?, López, Lofat', '52', 'Directa', ''),
 '何': ('Ho, Joo, Hochón, Joram, Joland, Hyuontin?', '31', 'Directa', ''),
 '劉': ('Lau, Lao', '47', 'Directa', ''),
 '賴': ('Lay', '45', 'Directa', ''),
 '吳': ('Hun, Hung, Wu, Hum, Hunchi', '32', 'Directa', ''),
 '袁': ('Yueng, Yuin, Yuing · Wee', '84 · 75', 'Directa', 'Wee (fila 75) solo si se confirma la lectura 袁 de ese carácter.'),
 '鄺': ('Kong, Con, Kongshau', '41', 'Directa', ''),
 '馬': ('Ma, Mas', '55', 'Directa', ''),
 '楊': ('Yon, Young', '81', 'Directa', ''),
 '鄧': ('Tan, Tang', '68', 'Directa', ''),
 '余': ('Yi, Iwc?/Iwo? · Yu, Yi, Díaz, Kam-Ching', '79 · 82', 'Directa', ''),
 '嚴': ('Guim · Gin, Gim', '28 · 27', 'Directa', 'La fila 27 se comparte con un segundo carácter leído provisionalmente como 阮.'),
 '邱': ('Yau, Yausán', '78', 'Directa', ''),
 '馮': ('Fon, Fong, Font, Fun, Fu, Fung, Fusoy?/Fuscoy? · Fong', '23 · 25', 'Directa', 'La fila 25 es una entrada compartida con 方.'),
 '阮': ('Yun · Gin, Gim · Guin', '83 · 27 · 29', 'Directa', 'Filas 27 y 29 solo si se confirma la lectura 阮.'),
 '孫': ('Sun, Suin, Sung, Suing, Swing', '67', 'Directa', ''),
 '程': ('Ching', '15', 'Directa', ''),
 '蔡': ('Chay, Chai, Choy · Tsai', '7 · 71', 'Directa', ''),
 '潘': ('Pon, Pont', '62', 'Directa', ''),
 '伍': ('Hung-Wu', '33', 'Directa', ''),
 '甘': ('Cam, Campuy', '2', 'Directa', ''),
 '曹': ('Chaug, Chou · Chú, Chuhán, Chu-Ham, Chuang, Chuyhong?', '6 · 17', 'Directa', 'En las observaciones de la fila 6 aparece «Quintín Quintana»; no se infiere una equivalencia general.'),
 '鄒': ('Chau, Chausú, Chen', '5', 'Directa', ''),
 '歐陽': ('Hauyón', '30', 'Directa', ''),
 '黎': ('Lay', '46', 'Directa', ''),
 '尹': ('Van, Wang', '72', 'Directa', ''),
 '雷': ('Ruiz, Alurio', '63', 'Directa', 'El cuadro añade «No son nombres chinos».'),
 '胡': ('Fo, Fu · Wu, Hupat', '22 · 73', 'Directa', ''),
 '徐': ('Chi', '9', 'Directa', ''),
 '范': ('Fan, Fang', '21', 'Directa', ''),
 '高': ('Kao', '36', 'Directa', ''),
 '蘇': ('Su, Alliú, Suau, Suvayke', '66', 'Directa', ''),
 '廖': ('Liu', '50', 'Directa', ''),
 '彭': ('Pan, Pang', '60', 'Directa', ''),
 '歐': ('Au', '1', 'Directa', 'Entrada compartida con 區.'),
 '朱': ('Chiú, Chú', '13', 'Directa', ''),
 '呂': ('Luy', '54', 'Directa', ''),
 '沈': ('Zinn', '85', 'Provisional', 'Solo si se confirma la lectura 沈 del carácter.'),
 '丘': ('Yau, Yausán', '78', 'Indirecta', 'El cuadro escribe 邱.'),
 '王': ('Wong', '77', 'Directa', ''),
 '郭': ('Koc', '39', 'Directa', ''),
 '衛': ('Wai, Way, Wee', '74', 'Directa', ''),
 '趙': ('Chao, Chiú', '12', 'Directa', ''),
 '麥': ('Mac, Mak', '57', 'Directa', ''),
 '鐘': ('Chung', '18', 'Directa', ''),
 '翟': ('Chea', '8', 'Directa', ''),
 '江': ('Kon', '40', 'Directa', ''),
 '詹': ('Chim', '14', 'Provisional', 'Solo si se confirma la lectura 詹 del carácter.'),
 '戴': ('Dai, Day, Daiyán · Tai', '19 · 69', 'Directa', ''),
 '巫': ('Mu, Muckong', '58', 'Directa', ''),
 '駱': ('Lok', '51', 'Directa', ''),
 '莫': ('Mock, Bocksang', '59', 'Directa', ''),
 '蕭': ('Siú, Sius', '65', 'Directa', ''),
 '許': ('Hsu', '34', 'Directa', ''),
 '孔': ('Jong, Kon, Kun, Kung', '35', 'Directa', ''),
 '宋': ('Son, Song', '64', 'Directa', ''),
 '方': ('Fong', '25', 'Directa', 'Entrada compartida con 馮.'),
}
NOTA_SIN = {'文': 'La fila 56 (Man) corresponde a 聞, no a 文.', '候': 'Podría ser una confusión por 侯; se mantiene separado.'}

rows = []
for s, n in v.items():
    py = PY_FIX.get(s) or ''.join(x[0] for x in pinyin(s, style=Style.TONE))
    jp = JP_FIX.get(s) or ' '.join(j for _, j in pycantonese.characters_to_jyutping(s))
    hk_parts, fuente = [], []
    for ch in s:
        r = hakka(ch)
        sur = [x for x, f in r if f]
        if sur:
            hk_parts.append(' / '.join(sur)); fuente.append('apellido')
        elif ch in HK_COMP:
            hk_parts.append(HK_COMP[ch]); fuente.append('compuestos')
        elif r:
            hk_parts.append(' / '.join(dict.fromkeys(x for x, _ in r))); fuente.append('general')
        else:
            hk_parts.append(''); fuente.append('')
    hk_txt = '' if '' in hk_parts else ' '.join(hk_parts)
    hk_f = '' if not hk_txt else ('apellido' if all(f == 'apellido' for f in fuente) else ('compuestos' if 'compuestos' in fuente else 'general'))
    if s == '任':  # el diccionario solo da la lectura general (擔任), no la de apellido
        hk_f = 'general'
    g = G.get(s)
    rows.append({
        'apellido': s, 'simplificado': cc.convert(s), 'pinyin': py, 'jyutping': jp,
        'hakka': hk_txt, 'hakka_fuente': hk_f,
        'grafias_chile': g[0] if g else '', 'filas_cuadro': g[1] if g else '',
        'correspondencia': g[2] if g else 'Sin correspondencia',
        'nota': (g[3] if g else NOTA_SIN.get(s, '')),
    })
missing = set(G) - set(v.index)
assert not missing, missing
json.dump(rows, open('out/apellidos_grafias.json', 'w'), ensure_ascii=False, indent=0)
print(len(rows), sum(1 for r in rows if r['grafias_chile']), sum(1 for r in rows if not r['hakka']))
for r in rows[:5] + [r for r in rows if r['apellido'] in ('曾', '翟', '任', '房', '歐陽', '羅')]:
    print(r)
