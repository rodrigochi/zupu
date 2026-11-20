"""Normaliza el padrón de 1947 y exporta un CSV por inscripción."""
import re, sys, json
import pandas as pd

src = sys.argv[1]
out = sys.argv[2]
x = pd.ExcelFile(src)
e = pd.concat([x.parse('Electores'), x.parse('Otras listas')], ignore_index=True)

# ---------- Sede (lista) en Chile ----------
sedes_info = {
    'Santiago':    dict(grafia='智京中華商會', estado='Documentada', lat=-33.45, lon=-70.66, prov='Santiago'),
    'Iquique':     dict(grafia='旅智利意基忌中華會館', estado='Documentada', lat=-20.21, lon=-70.15, prov='Tarapacá'),
    'Antofagasta': dict(grafia='智利晏埠中華公所', estado='Documentada', lat=-23.65, lon=-70.40, prov='Antofagasta'),
    'Arica':       dict(grafia='亞埠', estado='Propuesta', lat=-18.48, lon=-70.31, prov='Tarapacá'),
    'Tocopilla':   dict(grafia='度角卑埠', estado='Propuesta', lat=-22.09, lon=-70.20, prov='Antofagasta'),
    'Copiapó':     dict(grafia='個埠', estado='Propuesta', lat=-27.37, lon=-70.33, prov='Atacama'),
    'Coquimbo':    dict(grafia='角兼步埠', estado='Propuesta', lat=-29.95, lon=-71.34, prov='Coquimbo'),
    'Taltal':      dict(grafia='達打埠', estado='Propuesta', lat=-25.40, lon=-70.48, prov='Antofagasta'),
    'Chañaral':    dict(grafia='棧夜喇埠', estado='Tentativa', lat=-26.35, lon=-70.62, prov='Atacama'),
    # Ubicaciones por hipótesis (cuadro de la encuesta de 1965, Kam-Ching Zambrano, pp. 122–123)
    'Pueblo Hundido': dict(grafia='古華埠', estado='Hipótesis', lat=-26.39, lon=-70.05, prov='Atacama'),
    'Vallenar':    dict(grafia='華思拿埠', estado='Hipótesis', lat=-28.58, lon=-70.76, prov='Atacama'),
}
sede = e.ciudad_padron.fillna(e.ciudad_propuesta).fillna(e.sede_historica)
sede = sede.replace({'Chañaral (tentativa)': 'Chañaral', '古華埠': 'Pueblo Hundido', '華思拿埠': 'Vallenar'})
e['sede'] = sede

# ---------- Localidad dentro de la lista ----------
loc_coords = {
    'Calama': (-22.46, -68.93), 'Chuquicamata': (-22.31, -68.93),
    'María Elena': (-22.35, -69.66), 'Ovalle': (-30.60, -71.20),
}
def localidad(r):
    u = str(r.ubicacion_resuelto) if pd.notna(r.ubicacion_resuelto) else ''
    if r.sede == 'Antofagasta':
        if '馬利' in u: return 'María Elena', 'Lectura fonética propuesta'
        if '朱忌' in u or '赤忌' in u or '朱□銅' in u: return 'Chuquicamata', 'Lectura fonética propuesta'
        if '林馬' in u:
            return 'Calama', ('Identificada en el padrón' if r.localidad_persona == 'Calama' else 'Lectura fonética propuesta')
    if r.sede == 'Coquimbo' and '華夜' in u:
        return 'Ovalle', 'Lectura fonética propuesta'
    return r.sede, ''
lo = e.apply(localidad, axis=1, result_type='expand')
e['localidad'], e['localidad_nota'] = lo[0], lo[1]

# ---------- Origen (籍貫) normalizado a condados de 1947 ----------
COUNTY = {  # clave: (condado, cantonés, pinyin, provincia, grupo de mapa)
    '中山': ('Zhongshan', 'Chungshan', 'Zhōngshān', 'Guangdong'),
    '鶴山': ('Heshan', 'Hokshan', 'Hèshān', 'Guangdong'),
    '東莞': ('Dongguan', 'Tungkun', 'Dōngguǎn', 'Guangdong'),
    '順德': ('Shunde', 'Shuntak', 'Shùndé', 'Guangdong'),
    '番禺': ('Panyu', 'Punyu', 'Pānyú', 'Guangdong'),
    '台山': ('Taishan', 'Toishan', 'Táishān', 'Guangdong'),
    '南海': ('Nanhai', 'Namhoi', 'Nánhǎi', 'Guangdong'),
    '新會': ('Xinhui', 'Sunwui', 'Xīnhuì', 'Guangdong'),
    '寶安': ('Bao’an', 'Po On', 'Bǎo’ān', 'Guangdong'),
    '赤溪': ('Chixi', 'Chikkai', 'Chìxī', 'Guangdong'),
    '花縣': ('Huaxian', 'Fa Yuen', 'Huāxiàn', 'Guangdong'),
    '開平': ('Kaiping', 'Hoiping', 'Kāipíng', 'Guangdong'),
    '惠陽': ('Huiyang', 'Waiyeung', 'Huìyáng', 'Guangdong'),
    '高明': ('Gaoming', 'Koming', 'Gāomíng', 'Guangdong'),
    '高要': ('Gaoyao', 'Koyiu', 'Gāoyào', 'Guangdong'),
    '三水': ('Sanshui', 'Samshui', 'Sānshuǐ', 'Guangdong'),
    '增城': ('Zengcheng', 'Tsangshing', 'Zēngchéng', 'Guangdong'),
    '恩平': ('Enping', 'Yanping', 'Ēnpíng', 'Guangdong'),
    '嘉應': ('Jiaying', 'Kaying', 'Jiāyìng', 'Guangdong'),
    '瓊州': ('Qiongzhou (Hainan)', 'Kingchow', 'Qióngzhōu', 'Guangdong'),
    '雲霄': ('Yunxiao', '', 'Yúnxiāo', 'Fujian'),
    '青田': ('Qingtian', '', 'Qīngtián', 'Zhejiang'),
    '吳興': ('Wuxing', '', 'Wúxīng', 'Zhejiang'),
    '成都': ('Chengdu', '', 'Chéngdū', 'Sichuan'),
    '巴縣': ('Baxian', '', 'Bāxiàn', 'Sichuan'),
    '武昌': ('Wuchang', '', 'Wǔchāng', 'Hubei'),
    '江陵': ('Jiangling', '', 'Jiānglíng', 'Hubei'),
    '衡陽': ('Hengyang', '', 'Héngyáng', 'Hunan'),
    '通縣': ('Tongxian', '', 'Tōngxiàn', 'Hebei'),
    '天津': ('Tianjin', '', 'Tiānjīn', 'Hebei'),
    '盱眙': ('Xuyi', '', 'Xūyí', 'Anhui'),
    '懷遠': ('Huaiyuan', '', 'Huáiyuǎn', 'Anhui'),
    '武進': ('Wujin', '', 'Wǔjìn', 'Jiangsu'),
    '無錫': ('Wuxi', '', 'Wúxī', 'Jiangsu'),
}
ALIAS = {'臺山': ('台山', 'Variante gráfica'), '岡山': ('鶴山', 'Lectura probable de 鶴山'), '水步': ('台山', 'Localidad de Taishan'),
         '香山': ('中山', 'Nombre antiguo de Zhongshan'), '斗門': ('中山', 'Parte de Zhongshan en 1947'),
         '新安': ('寶安', 'Nombre antiguo de Bao’an'), '宝安': ('寶安', 'Variante gráfica'),
         '肇慶': ('高要', 'Sede de la prefectura, en Gaoyao'), '商鶴山': ('鶴山', 'Prefijo desplazado'),
         '瓊州島': ('瓊州', 'Isla de Hainan')}
PROVPREF = ['廣東', '浙江', '四川', '湖北', '湖南', '河北', '安徽', '江蘇', '福建']
SHIFTED = {'商', '傭員', '籍貫', '木匠', '昌興業', '雜貨', '五十三', '五十二'}

def origen(v):
    if pd.isna(v) or str(v).strip() == '':
        return '', 'Sin dato', ''
    s = str(v).strip()
    for p in PROVPREF:
        if s.startswith(p) and len(s) > len(p):
            s = s[len(p):]
            break
    if s in ALIAS:
        k, nota = ALIAS[s]
        return k, 'Normalizado', nota
    if s in COUNTY:
        return s, 'Directo', ''
    if s == '廣東':
        return '', 'Solo provincia', 'Guangdong sin condado'
    if s in SHIFTED:
        return '', 'Sin dato', 'La casilla contiene otro campo (desplazamiento de columna)'
    return '', 'Lectura dudosa', s

o = e.origen_resuelto.apply(origen).apply(pd.Series)
e['origen_zh'], e['origen_calidad'], e['origen_nota'] = o[0], o[1], o[2]
e['origen_condado'] = e.origen_zh.map(lambda k: COUNTY[k][0] if k else '')
e['origen_canton'] = e.origen_zh.map(lambda k: COUNTY[k][1] if k else '')
e['origen_pinyin'] = e.origen_zh.map(lambda k: COUNTY[k][2] if k else '')
e['origen_provincia'] = e.origen_zh.map(lambda k: COUNTY[k][3] if k else '')
e.loc[e.origen_calidad == 'Solo provincia', 'origen_provincia'] = 'Guangdong'

# ---------- Oficio ----------
OFI = {
    '商': 'Comerciante', '商人': 'Comerciante',
    '雜貨': 'Abarrotes y mercancías', '貨': 'Abarrotes y mercancías', '貨員': 'Abarrotes y mercancías', '僱貨': 'Empleado',
    '僱員': 'Empleado', '傭員': 'Empleado', '雇員': 'Empleado',
    '工': 'Obrero', '政': 'Funcionario', '醫生': 'Médico',
    '農業': 'Agricultura y hortalizas', '菜業': 'Agricultura y hortalizas',
    '失業': 'Sin empleo',
    '工人': 'Obrero', '兼商': 'Comerciante', '商業': 'Comerciante', '僱': 'Empleado',
    '木匠': 'Carpintero', '自由職業': 'Profesión liberal', '肉店': 'Carnicería',
    '主婦': 'Dueña de casa', '厨工': 'Cocinero', '教員': 'Profesor', '牙醫師': 'Dentista', '鑛務': 'Minería',
}
def oficio(v):
    if pd.isna(v) or str(v).strip() == '':
        return 'Sin dato'
    return OFI.get(str(v).strip(), 'Lectura por confirmar')
e['ocupacion_cat'] = e.ocupacion_resuelto.map(oficio)

# ---------- Sexo ----------
def sexo(v):
    if pd.isna(v): return 'Sin dato'
    v = str(v)
    if v == '男': return 'Hombre'
    if v == '女': return 'Mujer'
    return 'Dudoso'
e['sexo'] = e.sexo_literal.map(sexo)

# ---------- Apellido ----------
SUR = {
 '鄭': ('Cheng', 'Zhèng'), '黃': ('Wong', 'Huáng'), '陳': ('Chan', 'Chén'), '周': ('Chau', 'Zhōu'),
 '葉': ('Yip', 'Yè'), '李': ('Lee', 'Lǐ'), '梁': ('Leung', 'Liáng'), '張': ('Cheung', 'Zhāng'),
 '謝': ('Tse', 'Xiè'), '林': ('Lam', 'Lín'), '鍾': ('Chung', 'Zhōng'), '羅': ('Lo', 'Luó'),
 '何': ('Ho', 'Hé'), '賴': ('Lai', 'Lài'), '吳': ('Ng', 'Wú'), '劉': ('Lau', 'Liú'),
 '袁': ('Yuen', 'Yuán'), '鄺': ('Kwong', 'Kuàng'), '馬': ('Ma', 'Mǎ'), '楊': ('Yeung', 'Yáng'),
 '鄧': ('Tang', 'Dèng'), '余': ('Yu', 'Yú'), '嚴': ('Yim', 'Yán'), '邱': ('Yau', 'Qiū'),
 '馮': ('Fung', 'Féng'), '阮': ('Yuen', 'Ruǎn'), '孫': ('Suen', 'Sūn'), '歐陽': ('Au-Yeung', 'Ōuyáng'),
 '歐': ('Au', 'Ōu'), '程': ('Ching', 'Chéng'), '蔡': ('Choi', 'Cài'), '潘': ('Poon', 'Pān'),
 '伍': ('Ng', 'Wǔ'), '甘': ('Kam', 'Gān'), '曹': ('Cho', 'Cáo'), '鄒': ('Chau', 'Zōu'),
 '曾': ('Tsang', 'Zēng'), '黎': ('Lai', 'Lí'), '譚': ('Tam', 'Tán'), '尹': ('Wan', 'Yǐn'),
 '雷': ('Lui', 'Léi'), '胡': ('Wu', 'Hú'), '徐': ('Tsui', 'Xú'), '范': ('Fan', 'Fàn'),
 '高': ('Ko', 'Gāo'), '蘇': ('So', 'Sū'), '唐': ('Tong', 'Táng'), '古': ('Ku', 'Gǔ'),
 '廖': ('Liu', 'Liào'), '彭': ('Pang', 'Péng'), '朱': ('Chu', 'Zhū'), '呂': ('Lui', 'Lǚ'),
 '沈': ('Sham', 'Shěn'), '溫': ('Wan', 'Wēn'), '丘': ('Yau', 'Qiū'), '王': ('Wong', 'Wáng'),
 '郭': ('Kwok', 'Guō'), '董': ('Tung', 'Dǒng'), '衛': ('Wai', 'Wèi'), '趙': ('Chiu', 'Zhào'),
}
SIMPL = {'刘': '劉', '黄': '黃', '陈': '陳', '叶': '葉', '张': '張', '谢': '謝', '钟': '鍾', '罗': '羅',
         '赖': '賴', '吴': '吳', '邝': '鄺', '马': '馬', '杨': '楊', '邓': '鄧', '严': '嚴', '冯': '馮'}
def apellido(n):
    if pd.isna(n) or not str(n).strip(): return ''
    n = str(n).strip()
    if n.startswith('歐陽'): return '歐陽'
    c = SIMPL.get(n[0], n[0])
    return '' if c == '□' else c
e['apellido'] = e.nombre_literal.map(apellido)
e['apellido_canton'] = e.apellido.map(lambda s: SUR.get(s, ('', ''))[0])
e['apellido_pinyin'] = e.apellido.map(lambda s: SUR.get(s, ('', ''))[1])

# ---------- Edad ----------
e['edad'] = e.edad_numero
e['nacimiento_aprox'] = (1947 - e.edad).where(e.edad.notna())

e['firma'] = e.firma_literal.notna().map({True: 'Sí', False: ''})
e['lista_tipo'] = e.tipo.map({'electores': 'Padrón', 'otra_lista': 'Otra lista'})
e['id'] = range(1, len(e) + 1)
for c in ['sede_grafia', 'sede_estado', 'sede_lat', 'sede_lon', 'provincia_chile']:
    pass
e['sede_grafia'] = e.sede.map(lambda s: sedes_info[s]['grafia'])
e['sede_estado'] = e.sede.map(lambda s: sedes_info[s]['estado'])
e['provincia_chile'] = e.sede.map(lambda s: sedes_info[s]['prov'])
def ll(r):
    if r.localidad in loc_coords: return loc_coords[r.localidad]
    i = sedes_info[r.sede]; return (i['lat'], i['lon'])
c = e.apply(ll, axis=1, result_type='expand')
e['lat'], e['lon'] = c[0], c[1]

cols = ['id', 'archivo', 'folio', 'columna', 'lista_tipo', 'sede', 'sede_grafia', 'sede_estado', 'provincia_chile',
        'localidad', 'localidad_nota', 'lat', 'lon', 'ubicacion_literal',
        'nombre_literal', 'apellido', 'apellido_canton', 'apellido_pinyin', 'sexo', 'edad', 'nacimiento_aprox',
        'origen_literal', 'origen_zh', 'origen_condado', 'origen_canton', 'origen_pinyin', 'origen_provincia',
        'origen_calidad', 'origen_nota', 'ocupacion_literal', 'ocupacion_resuelto', 'ocupacion_cat', 'firma', 'duda']
o = e[cols].rename(columns={'nombre_literal': 'nombre'})
o['edad'] = o.edad.astype('Int64')
o['nacimiento_aprox'] = o.nacimiento_aprox.astype('Int64')
o['duda'] = o.duda.fillna('').str.replace('\n', ' ')
for k in ['ubicacion_literal', 'origen_literal', 'ocupacion_literal', 'ocupacion_resuelto', 'nombre']:
    o[k] = o[k].fillna('').astype(str).str.replace('\n', ' / ')
o.to_csv(out, index=False)
print(len(o))
print(o.origen_calidad.value_counts().to_dict())
print(o.origen_condado.value_counts().to_dict())
print(o.ocupacion_cat.value_counts().to_dict())
print(o.localidad.value_counts().to_dict())
print(o[o.origen_calidad == 'Lectura dudosa'].origen_nota.value_counts().to_dict())
