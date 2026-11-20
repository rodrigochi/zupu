"""Construye los GeoJSON simplificados para el panel."""
import json, sys
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
from shapely import set_precision

G = sys.argv[1]   # carpeta geo
OUT = sys.argv[2]

def load(p): return json.load(open(f'{G}/{p}'))

def rnd(geom, nd):
    def r(c):
        if isinstance(c[0], (int, float)): return [round(c[0], nd), round(c[1], nd)]
        return [r(x) for x in c]
    m = mapping(geom)
    return {'type': m['type'], 'coordinates': r(m['coordinates'])}

def feat(geom, props, tol, nd):
    g = geom.simplify(tol, preserve_topology=True)
    if g.is_empty: return None
    # d3 espera anillos exteriores en sentido horario (orientación esférica)
    from shapely.geometry.polygon import orient
    if g.geom_type == 'Polygon': g = orient(g, sign=-1.0)
    elif g.geom_type == 'MultiPolygon':
        from shapely.geometry import MultiPolygon
        g = MultiPolygon([orient(p, sign=-1.0) for p in g.geoms])
    return {'type': 'Feature', 'properties': props, 'geometry': rnd(g, nd)}

def fc(fs): return {'type': 'FeatureCollection', 'features': [f for f in fs if f]}

# ---------- Delta del río de las Perlas: condados de 1947 ----------
dist = {}
for c in ['440100', '440300', '440400', '440600', '440700', '441200', '441300', '441400', '441900', '442000', '445300', '441800']:
    for f in load(f'repo/citys/{c}.json')['features']:
        dist[f['properties']['name']] = shape(f['geometry']).buffer(0)

GROUPS = {
    '中山': ['中山市', '香洲区', '金湾区', '斗门区'],
    '鶴山': ['鹤山市'], '東莞': ['东莞市'], '順德': ['顺德区'],
    '番禺': ['番禺区', '南沙区'], '台山': ['台山市'],
    '南海': ['南海区', '禅城区'], '新會': ['新会区', '蓬江区', '江海区'],
    '寶安': ['宝安区', '南山区', '福田区', '罗湖区', '盐田区', '龙岗区', '龙华区', '坪山区', '光明区'],
    '花縣': ['花都区'], '開平': ['开平市'], '惠陽': ['惠阳区', '惠城区'],
    '高明': ['高明区'], '高要': ['高要区', '端州区', '鼎湖区'], '三水': ['三水区'],
    '增城': ['增城区'], '恩平': ['恩平市'], '嘉應': ['梅县区', '梅江区'],
}
used = set(n for v in GROUPS.values() for n in v)
feats = []
for zh, parts in GROUPS.items():
    g = unary_union([dist[p] for p in parts]).buffer(0.0005).buffer(-0.0005)
    feats.append(feat(g, {'zh': zh, 'tipo': 'condado'}, 0.002, 3))
# Contexto: resto de distritos cercanos y ciudades de Guangdong, Hong Kong y Macao
for n, g in dist.items():
    if n not in used:
        feats.append(feat(g, {'zh': n, 'tipo': 'contexto'}, 0.003, 3))
prov = load('province_440000.json')['features']
near = {'440100', '440300', '440400', '440600', '440700', '441200', '441300', '441400', '441900', '442000', '445300', '441800'}
for f in prov:
    if str(f['properties']['adcode']) not in near:
        feats.append(feat(shape(f['geometry']).buffer(0), {'zh': f['properties']['name'], 'tipo': 'contexto'}, 0.004, 3))
china = load('china.json')['features']
for f in china:
    if str(f['properties']['adcode']) in ('810000', '820000', '450000'):
        nm = {'810000': 'Hong Kong', '820000': 'Macao', '450000': 'Guangxi'}[str(f['properties']['adcode'])]
        feats.append(feat(shape(f['geometry']).buffer(0), {'zh': nm, 'tipo': 'hkmo' if nm != 'Guangxi' else 'contexto'}, 0.002, 3))
json.dump(fc(feats), open(f'{OUT}/mapa_delta.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# ---------- China: provincias ----------
PROV_ES = {'广东省': 'Guangdong', '浙江省': 'Zhejiang', '四川省': 'Sichuan', '湖北省': 'Hubei', '湖南省': 'Hunan',
           '河北省': 'Hebei', '天津市': 'Tianjin', '安徽省': 'Anhui', '江苏省': 'Jiangsu', '福建省': 'Fujian',
           '海南省': 'Hainan', '重庆市': 'Chongqing'}
cf = []
for f in china:
    a = str(f['properties']['adcode'])
    if a == '100000': continue
    g = shape(f['geometry']).buffer(0)
    cf.append(feat(g, {'zh': f['properties']['name'], 'es': PROV_ES.get(f['properties']['name'], '')}, 0.06, 2))
json.dump(fc(cf), open(f'{OUT}/mapa_china.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# ---------- Chile: provincias de 1947 (aprox. con regiones actuales) y vecinos ----------
reg = {f['properties']['codregion']: shape(f['geometry']).buffer(0) for f in load('chile_reg.json')['features']}
BB = box(-77, -36.5, -62, -16.5)
P47 = {'Tarapacá': [15, 1], 'Antofagasta': [2], 'Atacama': [3], 'Coquimbo': [4], 'Santiago': [13]}
chf = []
usedr = set()
for n, codes in P47.items():
    g = unary_union([reg[c] for c in codes]).buffer(0.001).buffer(-0.001)
    usedr |= set(codes)
    chf.append(feat(g.intersection(BB), {'nombre': n, 'tipo': 'provincia'}, 0.01, 3))
rest = unary_union([g for c, g in reg.items() if c not in usedr]).intersection(BB)
chf.append(feat(rest, {'nombre': 'Resto de Chile', 'tipo': 'resto'}, 0.01, 3))
w = load('countries50.geo.json')['features']
for f in w:
    if f['properties']['name'] in ('Peru', 'Bolivia', 'Argentina'):
        g = shape(f['geometry']).buffer(0).intersection(BB)
        es = {'Peru': 'Perú', 'Bolivia': 'Bolivia', 'Argentina': 'Argentina'}[f['properties']['name']]
        chf.append(feat(g, {'nombre': es, 'tipo': 'vecino'}, 0.02, 2))
json.dump(fc(chf), open(f'{OUT}/mapa_chile.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# ---------- Mundo (tierra) para el mapa de la ruta ----------
land = load('land110.geo.json')
lf = [feat(shape(f['geometry']).buffer(0), {}, 0.3, 1) for f in land['features']]
json.dump(fc(lf), open(f'{OUT}/mapa_mundo.json', 'w'), separators=(',', ':'))
print('ok')
