#!/usr/bin/env python3
"""TameFeed v0.1.0 - generates icons/icon{16,32,48,128}.png (needs Pillow). Run: python3 scripts/make_icons.py

Design: dark rounded square with three "feed lines"; the top line is accent blue, the rest fade out,
suggesting a feed reduced to plain text.
"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
BG, ACCENT, LINE, DIM = (15, 20, 25, 255), (29, 155, 240, 255), (231, 233, 234, 255), (113, 118, 123, 255)


def draw(size):
    s = size * 8  # supersample, then downscale for smooth edges
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=BG)
    left, thick = s * 0.22, s * 0.13
    for y, right, colour in ((0.27, 0.78, ACCENT), (0.50, 0.66, LINE), (0.73, 0.48, DIM)):
        top = s * y - thick / 2
        d.rounded_rectangle([left, top, s * right, top + thick], radius=thick / 2, fill=colour)
    return img.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for size in (16, 32, 48, 128):
        draw(size).save(os.path.join(OUT, 'icon%d.png' % size))
