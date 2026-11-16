#!/usr/bin/env python3
"""TameFeed v0.1.0 - generates Chrome Web Store promo tiles in store/ (needs Pillow).
Run: python3 scripts/make_store_assets.py

Writes store/promo-small-440x280.png and store/promo-marquee-1400x560.png as 24-bit PNG (no alpha),
which is what the store requires. Screenshots are real captures and are not generated here.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from make_icons import draw as draw_icon, BG, LINE  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), '..', 'store')
FONT_DIRS = ['/usr/share/fonts/truetype/ubuntu', '/usr/share/fonts/truetype/dejavu']
BOLD, REGULAR = ['Ubuntu-B.ttf', 'DejaVuSans-Bold.ttf'], ['Ubuntu-R.ttf', 'DejaVuSans.ttf']
TAGLINE = 'Block media. Hide clutter. Just read.'
TAG_COLOUR = (139, 152, 165)


def font(names, size):
    for d in FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    raise SystemExit('no usable font found; edit FONT_DIRS')


def tile(w, h, icon, title, tag, gap):
    img = Image.new('RGB', (w, h), BG[:3])
    d = ImageDraw.Draw(img)
    ft, fg = font(BOLD, title), font(REGULAR, tag)
    tw, gw = d.textlength('TameFeed', font=ft), d.textlength(TAGLINE, font=fg)
    # Icon on a slightly lighter plate so it stays visible on the same dark background.
    plate = Image.new('RGB', (icon, icon), (22, 32, 42))
    mask = Image.new('L', (icon, icon), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, icon - 1, icon - 1], radius=int(icon * 0.22), fill=255)
    ic = draw_icon(icon)
    total = icon + gap + title + gap // 2 + tag
    y = (h - total) // 2
    img.paste(plate, ((w - icon) // 2, y), mask)
    # Re-draw the feed lines over the plate (the icon's own background is the tile colour).
    px = ic.load()
    for yy in range(icon):
        for xx in range(icon):
            r, g, b, a = px[xx, yy]
            if a and (r, g, b) != BG[:3] and max(r, g, b) > 60:
                img.putpixel(((w - icon) // 2 + xx, y + yy), (r, g, b))
    y += icon + gap
    d.text(((w - tw) / 2, y), 'TameFeed', font=ft, fill=LINE[:3])
    y += title + gap // 2
    d.text(((w - gw) / 2, y), TAGLINE, font=fg, fill=TAG_COLOUR)
    return img


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    tile(440, 280, 96, 44, 19, 22).save(os.path.join(OUT, 'promo-small-440x280.png'))
    tile(1400, 560, 200, 96, 38, 44).save(os.path.join(OUT, 'promo-marquee-1400x560.png'))
