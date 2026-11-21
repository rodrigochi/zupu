"""Genera v2/la-mitad-de-un-meridiano/index.html a partir de texto-es.md y texto-en.md.

Uso: python3 v2/fuentes/relato.py
Los textos usan el formato del documento original: **I. Título** para cada parte,
[FOTO n] donde va cada foto y, en el párrafo siguiente, «Foto n. …» como pie.
"""
import html
import re
from pathlib import Path

DIR = Path(__file__).resolve().parent.parent / 'la-mitad-de-un-meridiano'

ALT = {
    1: ('El akún, ya anciano, sentado en un sillón junto a su nieto pequeño.', 'The akún, already elderly, sitting on a sofa next to his young grandson.'),
    2: ('Sobre de correo aéreo de 1989 con sellos chinos y la dirección escrita a mano.', 'A 1989 airmail envelope with Chinese stamps and a handwritten address.'),
    3: ('Retrato en blanco y negro: una anciana sentada en una silla de madera, una mujer de pie y un niño con gorra y abrigo largo frente a un muro de ladrillos.', 'Black-and-white portrait: an elderly woman on a wooden chair, a standing woman and a boy in a cap and long coat in front of a brick wall.'),
    4: ('Una familia sentada a la mesa en una sala, con Marcela y Rodrigo entre ellos.', 'A family seated at a table in a living room, with Marcela and Rodrigo among them.'),
    5: ('Altar con la estatua de Xu Sanlang vestida de rojo y ofrendas.', 'Altar with the statue of Xu Sanlang dressed in red, with offerings.'),
    6: ('Grupo de personas posando en la comisaría de Gonghe.', 'A group of people posing at the Gonghe police station.'),
    7: ('Casa de ladrillo en una colina, con un camino mojado por la lluvia.', 'A brick house on a hill, with a road wet from the rain.'),
    8: ('Página del zupu con el poema generacional escrito en columnas verticales.', 'A page of the zupu with the generation poem written in vertical columns.'),
}
TAM = {}


def tam(n):
    from PIL import Image
    if n not in TAM:
        TAM[n] = Image.open(DIR / 'fotos' / f'foto{n}.jpg').size
    return TAM[n]


CJK = re.compile(r'([　-〿一-鿿＀-￯]+(?:[，。、·\s]*[一-鿿]+)*)')


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\*(.+?)\*', r'<em>\1</em>', t)
    t = CJK.sub(r'<span class="zh" lang="zh">\1</span>', t)
    return t


def articulo(md, lang):
    bloques = [b.strip() for b in md.split('\n\n') if b.strip()]
    titulo = bloques.pop(0).strip('*')
    bloques.pop(0)  # autor
    out = []
    pendiente = None
    parte = 0
    for b in bloques:
        m = re.fullmatch(r'\*\*(.+)\*\*', b)
        if m:
            parte += 1
            num, _, nombre = m.group(1).partition('. ')
            out.append(f'<h2 id="parte-{parte}"><span class="r-num">{num}</span> {inline(nombre)}</h2>')
            continue
        m = re.fullmatch(r'\[FOTO (\d+)\]', b)
        if m:
            pendiente = int(m.group(1))
            continue
        if pendiente:
            n = pendiente
            pendiente = None
            pie = re.sub(r'^(Foto|Photo) \d+\.\s*', '', b)
            w, h = tam(n)
            forma = 'vertical' if h > w else ('ancha' if n in (2, 6, 7, 8) else 'normal')
            alt = ALT[n][0 if lang == 'es' else 1]
            out.append(
                f'<figure class="r-foto {forma}" id="foto-{n}-{lang}">'
                f'<img src="fotos/foto{n}.jpg" width="{w}" height="{h}" loading="lazy" decoding="async" alt="{html.escape(alt)}">'
                f'<figcaption><span class="r-fnum">{n}</span><span>{inline(pie)}</span></figcaption></figure>')
            continue
        clase = ' class="dialogo"' if b.startswith('—') else ''
        if b.startswith('—*Welcome back home.*'):
            clase = ' class="dialogo cierre"'
        out.append(f'<p{clase}>{inline(b)}</p>')
    return titulo, '\n'.join(out)


def main():
    es_t, es = articulo((DIR / 'texto-es.md').read_text(encoding='utf-8'), 'es')
    en_t, en = articulo((DIR / 'texto-en.md').read_text(encoding='utf-8'), 'en')
    plantilla = (DIR / 'plantilla.html').read_text(encoding='utf-8')
    pagina = plantilla.replace('{{ES}}', es).replace('{{EN}}', en)
    (DIR / 'index.html').write_text(pagina, encoding='utf-8')
    print('ok', es_t, '/', en_t)


if __name__ == '__main__':
    main()
