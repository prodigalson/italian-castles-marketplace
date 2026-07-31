"""Regenerate assets/social-title-outlines.svg.

The share card sets its title in Cormorant Garamond Italic. librsvg — which sharp uses
to rasterise SVG — will not pick up a font from an @font-face data URI or a repo-local
fontconfig directory, so the title is stored as glyph outlines instead and the generated
PNG never depends on what is installed on the machine that runs it.

    pip install fonttools
    python scripts/social-title-outlines.py "Italian Historic Estates"

Coordinates are emitted in font units (1000 upem, y-up); generate-site-images.mjs applies
the scale and y-flip.
"""

import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'assets' / 'fonts' / 'CormorantGaramond-Italic.ttf'
OUTPUT = ROOT / 'assets' / 'social-title-outlines.svg'

text = sys.argv[1] if len(sys.argv) > 1 else 'Italian Historic Estates'

font = TTFont(FONT)
if 'fvar' in font:
    font = instantiateVariableFont(font, {'wght': 400}, inplace=False)

upem = font['head'].unitsPerEm
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
metrics = font['hmtx']

paths = []
advance = 0.0
for character in text:
    name = cmap.get(ord(character))
    if name is None:
        advance += upem * 0.3
        continue
    pen = SVGPathPen(glyphs, ntos=lambda value: format(value, '.1f'))
    glyphs[name].draw(pen)
    commands = pen.getCommands()
    if commands:
        paths.append('<path transform="translate(%.1f 0)" d="%s"/>' % (advance, commands))
    advance += metrics[name][0]

OUTPUT.write_text(
    '<!-- "%s" set in Cormorant Garamond Italic (wght 400) and converted\n'
    '     to outlines, so the generated share card does not depend on host-installed fonts.\n'
    '     Regenerate with scripts/social-title-outlines.py after changing the wording.\n'
    '     Glyph coordinates are in font units: %d upem, y-up, total advance %.0f. -->\n'
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.0f %d">\n<g id="title">%s</g>\n</svg>\n'
    % (text, upem, advance, advance, upem, ''.join(paths))
)
print('Wrote %s (advance %.0f units at %d upem).' % (OUTPUT.relative_to(ROOT), advance, upem))
