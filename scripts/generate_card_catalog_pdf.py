import json
import os
from io import BytesIO
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_ROOT / "output" / "data" / "card_catalog_data.json"
OUTPUT_DIR = PROJECT_ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "kadir-cartas-12-por-pagina.pdf"

PAGE_W, PAGE_H = landscape(A4)
MARGIN_X = 24
MARGIN_Y = 22
GAP_X = 12
GAP_Y = 14
COLS = 4
ROWS = 3

CARD_W = (PAGE_W - (MARGIN_X * 2) - (GAP_X * (COLS - 1))) / COLS
CARD_H = (PAGE_H - (MARGIN_Y * 2) - 24 - (GAP_Y * (ROWS - 1))) / ROWS

RARITY_COLORS = {
    "common": colors.HexColor("#c0c0c0"),
    "uncommon": colors.HexColor("#a85c33"),
    "rare": colors.HexColor("#4a90e2"),
    "epic": colors.HexColor("#9b59b6"),
    "legendary": colors.HexColor("#f39c12"),
    "field": colors.HexColor("#66c2ff"),
    "effect": colors.HexColor("#c896ff"),
    "essence": colors.HexColor("#7bd26b"),
}

IMAGE_CACHE = {}

ELEMENT_COLORS = {
    "fogo": colors.HexColor("#e4572e"),
    "fire": colors.HexColor("#e4572e"),
    "agua": colors.HexColor("#2e86de"),
    "água": colors.HexColor("#2e86de"),
    "water": colors.HexColor("#2e86de"),
    "terra": colors.HexColor("#77a35d"),
    "earth": colors.HexColor("#77a35d"),
    "ar": colors.HexColor("#88d7e8"),
    "air": colors.HexColor("#88d7e8"),
    "puro": colors.HexColor("#eee0bc"),
    "pure": colors.HexColor("#eee0bc"),
}


def clean(text):
    return str(text or "").replace("\n", " ").replace("\r", " ").strip()


def fit_text(c, text, font, size, max_width):
    text = clean(text)
    if stringWidth(text, font, size) <= max_width:
        return text
    ellipsis = "..."
    while text and stringWidth(text + ellipsis, font, size) > max_width:
        text = text[:-1]
    return text + ellipsis if text else ellipsis


def wrap_text(c, text, font, size, max_width, max_lines):
    words = clean(text).split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
            if len(lines) == max_lines:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) == max_lines and words:
        lines[-1] = fit_text(c, lines[-1], font, size, max_width)
    return lines


def image_reader(image_path):
    if not image_path:
        return None
    path = Path(image_path)
    if not path.exists():
        return None
    cache_key = str(path)
    if cache_key in IMAGE_CACHE:
        return IMAGE_CACHE[cache_key]
    try:
        with Image.open(path) as img:
            img = img.convert("RGB")
            img.thumbnail((620, 460), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=82, optimize=True)
            buffer.seek(0)
            reader = ImageReader(buffer)
            IMAGE_CACHE[cache_key] = reader
            return reader
    except Exception:
        return None


def draw_cover_image(c, reader, x, y, w, h):
    if reader is None:
        c.setFillColor(colors.HexColor("#17131f"))
        c.rect(x, y, w, h, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#f2d384"))
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(x + w / 2, y + h / 2 - 6, "K")
        return

    iw, ih = reader.getSize()
    scale = max(w / iw, h / ih)
    sw, sh = iw * scale, ih * scale
    ix = x - (sw - w) / 2
    iy = y - (sh - h) / 2
    c.saveState()
    path = c.beginPath()
    path.rect(x, y, w, h)
    c.clipPath(path, stroke=0, fill=0)
    c.drawImage(reader, ix, iy, sw, sh)
    c.restoreState()


def rounded_rect(c, x, y, w, h, radius, fill, stroke, stroke_width=1):
    c.setLineWidth(stroke_width)
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def pill(c, x, y, text, fill, text_color, max_w=None):
    c.setFont("Helvetica-Bold", 6.2)
    label = fit_text(c, text, "Helvetica-Bold", 6.2, max_w - 12) if max_w else clean(text)
    width = min(max_w or 999, stringWidth(label, "Helvetica-Bold", 6.2) + 12)
    c.setFillColor(fill)
    c.roundRect(x, y, width, 12, 6, fill=1, stroke=0)
    c.setFillColor(text_color)
    c.drawString(x + 6, y + 3.4, label)
    return width


def draw_card(c, card, x, y):
    rarity_color = RARITY_COLORS.get(card.get("rarity"), colors.HexColor("#c0c0c0"))
    element_key = clean(card.get("element")).lower()
    element_color = ELEMENT_COLORS.get(element_key, colors.HexColor("#d8d0bd"))

    rounded_rect(
        c,
        x,
        y,
        CARD_W,
        CARD_H,
        8,
        colors.HexColor("#0d0b13"),
        rarity_color,
        1.2,
    )

    pad = 7
    header_h = 18
    art_h = CARD_H * 0.48
    footer_h = 22

    c.setFillColor(colors.HexColor("#121019"))
    c.roundRect(x + pad, y + CARD_H - pad - header_h, CARD_W - pad * 2, header_h, 5, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 7.8)
    c.drawString(x + pad + 6, y + CARD_H - pad - 12.5, fit_text(c, card.get("name"), "Helvetica-Bold", 7.8, CARD_W - 74))

    number = clean(card.get("number"))
    if number:
        c.setFillColor(colors.HexColor("#f5d36b"))
        c.setFont("Helvetica-Bold", 6.5)
        c.drawRightString(x + CARD_W - pad - 6, y + CARD_H - pad - 12.2, f"#{str(number).zfill(3)}")

    art_x = x + pad
    art_y = y + CARD_H - pad - header_h - art_h - 4
    art_w = CARD_W - pad * 2
    reader = image_reader(card.get("image"))
    c.roundRect(art_x, art_y, art_w, art_h, 5, fill=0, stroke=0)
    draw_cover_image(c, reader, art_x, art_y, art_w, art_h)
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.18))
    c.roundRect(art_x, art_y, art_w, art_h, 5, fill=0, stroke=1)

    meta_y = art_y - 16
    used = pill(c, x + pad, meta_y, card.get("rarityName"), rarity_color, colors.black, max_w=58)
    pill(c, x + pad + used + 4, meta_y, card.get("element"), element_color, colors.black, max_w=52)
    c.setFillColor(colors.HexColor("#f3c75e"))
    c.setFont("Helvetica-Bold", 7)
    c.drawRightString(x + CARD_W - pad, meta_y + 3.5, f"{card.get('value', '')} m")

    info_y = meta_y - 12
    c.setFillColor(colors.HexColor("#cfc5ad"))
    c.setFont("Helvetica-Bold", 6.2)
    info_parts = [clean(card.get("type"))]
    if card.get("hp"):
        info_parts.append(f"HP {card.get('hp')}")
    if card.get("cost") != "":
        info_parts.append(f"Custo {card.get('cost')}")
    c.drawString(x + pad, info_y, fit_text(c, " | ".join(info_parts), "Helvetica-Bold", 6.2, CARD_W - pad * 2))

    desc = card.get("summary") or card.get("description")
    c.setFillColor(colors.HexColor("#eee5cf"))
    c.setFont("Helvetica", 5.8)
    for i, line in enumerate(wrap_text(c, desc, "Helvetica", 5.8, CARD_W - pad * 2, 3)):
        c.drawString(x + pad, info_y - 9 - (i * 7), line)

    c.setFillColor(colors.HexColor("#0f0d15"))
    c.roundRect(x + pad, y + pad, CARD_W - pad * 2, footer_h, 5, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#f3c75e"))
    c.setFont("Helvetica-Bold", 6.2)
    c.drawString(x + pad + 5, y + pad + 13, "ID")
    c.setFillColor(colors.white)
    c.drawString(x + pad + 18, y + pad + 13, fit_text(c, card.get("id"), "Helvetica", 6.2, 60))
    c.setFillColor(colors.HexColor("#f3c75e"))
    c.drawRightString(x + CARD_W - pad - 5, y + pad + 13, clean(card.get("rarityName")))


def main():
    with DATA_PATH.open("r", encoding="utf-8") as f:
        cards = json.load(f)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT_PATH), pagesize=landscape(A4))
    c.setTitle("Kadir Card Game - Catalogo de Cartas")

    pages = (len(cards) + (COLS * ROWS) - 1) // (COLS * ROWS)
    for page in range(pages):
        c.setFillColor(colors.HexColor("#08070c"))
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#f3c75e"))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN_X, PAGE_H - 18, "Kadir Card Game - Catalogo de Cartas")
        c.setFillColor(colors.HexColor("#b9ad96"))
        c.setFont("Helvetica", 8)
        c.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 17, f"Pagina {page + 1}/{pages} - 12 cartas por pagina")

        page_cards = cards[page * COLS * ROWS : (page + 1) * COLS * ROWS]
        for idx, card in enumerate(page_cards):
            row = idx // COLS
            col = idx % COLS
            x = MARGIN_X + col * (CARD_W + GAP_X)
            y = PAGE_H - MARGIN_Y - 24 - CARD_H - row * (CARD_H + GAP_Y)
            draw_card(c, card, x, y)
        c.showPage()

    c.save()
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
