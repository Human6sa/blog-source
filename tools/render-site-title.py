#!/usr/bin/env python3
"""Render the fixed site name; the font itself is never copied into the site."""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--font", type=Path, required=True, help="Segoe Print Regular TTF")
parser.add_argument("--text", default="Human6sa's Blog")
parser.add_argument(
    "--output",
    type=Path,
    default=Path(__file__).resolve().parents[1] / "source/img/site-title-segoe-print.png",
)
args = parser.parse_args()

# Four times the intended desktop font size, with transparent padding for edges.
font = ImageFont.truetype(str(args.font), 192)
if font.getname() != ("Segoe Print", "Regular"):
    parser.error("Expected Segoe Print Regular; refusing to substitute another font.")
left, top, right, bottom = font.getbbox(args.text)
padding = 16
image = Image.new(
    "RGBA", (right - left + padding * 2, bottom - top + padding * 2), (0, 0, 0, 0)
)
ImageDraw.Draw(image).text(
    (padding - left, padding - top), args.text, font=font, fill=(255, 255, 255, 255)
)
args.output.parent.mkdir(parents=True, exist_ok=True)
image.save(args.output, optimize=True)
print(f"{args.output}: {image.width} x {image.height}, {args.output.stat().st_size} bytes")
