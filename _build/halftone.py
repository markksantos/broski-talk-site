"""Newsprint halftone hosts for direction C: black dots on transparent, dot area = darkness."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CELL, LIFT, GAMMA = 8, 0.22, 1.45
for who in ("mark", "simon"):
    src = Image.open(f"assets/hosts/{who}-bw.webp").convert("RGBA")
    W, H = src.size
    S = 3
    g = np.asarray(src.convert("L").filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    a = np.asarray(src.getchannel("A")).astype(np.float32) / 255
    out = Image.new("L", (W * S, H * S), 0)
    d = ImageDraw.Draw(out)
    ca = sa = np.sqrt(0.5)
    R = int(max(W, H) * 1.5)
    for i in range(-R // CELL, R // CELL):
        for j in range(-R // CELL, R // CELL):
            u, v = i * CELL, j * CELL
            x, y = W / 2 + u * ca - v * sa, H / 2 + u * sa + v * ca
            if not (0 <= x < W and 0 <= y < H):
                continue
            xi, yi = int(x), int(y)
            if a[yi, xi] < 0.35:
                continue
            dark = np.clip((1 - g[yi, xi] - LIFT) / (1 - LIFT), 0, 1) ** GAMMA
            r = CELL * 0.78 * np.sqrt(dark)
            if r < 0.45:
                continue
            d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=255)
    mask = np.asarray(out.resize((W, H), Image.LANCZOS)).astype(np.float32)
    m = np.minimum(mask, (a > 0.35) * 255)
    res = Image.new("RGBA", (W, H), (10, 10, 10, 0))
    res.putalpha(Image.fromarray(m.astype(np.uint8)))
    res.save(f"assets/hosts/{who}-halftone.webp", "WEBP", quality=92, method=6)
    print(who, "ok")
