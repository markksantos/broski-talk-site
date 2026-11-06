"""Copy web-sized Broski Talk assets out of the brand kit into ./assets.
Hosts are placed with the kit's own eye_placed(): same pupil distance, same eye line,
so any two host images shown at the same CSS size line up eye-to-eye."""
import os, sys, subprocess, shutil
KIT = "/Users/markksantos/Pictures/Branding/Broski Talk"
sys.path.insert(0, os.path.join(KIT, "_build"))
import common as c
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
W, H, IPD, EX, EY = 1200, 1400, 200, 600, 560

for name, short in (("mark-santos", "mark"), ("simon-dziak", "simon")):
    col = c.host(name)
    for tag, img in (("color", col), ("bw", c.bw(col))):
        im, (x, y), s = c.eye_placed(name, IPD, EX, EY, im=img)
        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        canvas.alpha_composite(im, (x, y)) if x >= 0 and y >= 0 else canvas.paste(im, (x, y), im)
        p = os.path.join(OUT, "hosts", f"{short}-{tag}.webp")
        canvas.save(p, "WEBP", quality=88, method=6)
        print(p, canvas.getchannel("A").getbbox())

def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert("RGBA" if src.endswith(".png") else "RGB")
    if w and im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=q, method=6)

T = os.path.join(KIT, "03 Thumbnails")
for f in sorted(os.listdir(T)):
    if f.endswith(".jpg"):
        webp(os.path.join(T, f), os.path.join(OUT, "thumbs", f.replace(".jpg", ".webp")), 1280)
S = os.path.join(KIT, "06 Shorts Thumbnails")
for f in sorted(os.listdir(S)):
    if f.endswith(".jpg"):
        webp(os.path.join(S, f), os.path.join(OUT, "thumbs", f.replace(".jpg", ".webp")), 720)
C = os.path.join(KIT, "07 Channel & Video Assets")
webp(os.path.join(C, "podcast-cover-1400.png"), os.path.join(OUT, "thumbs", "podcast-cover.webp"), 1000)
webp(os.path.join(KIT, "02 YouTube Banners", "banner-12-waveform.png"), os.path.join(OUT, "thumbs", "banner-waveform.webp"), 2560)
L = os.path.join(KIT, "01 Logos", "option-01-anton")
for f in ("logo-horizontal-white-transparent.png", "logo-square-white-transparent.png", "logo-square-black-transparent.png"):
    im = Image.open(os.path.join(L, f)); im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, "logo", f.replace(".png", ".webp")), "WEBP", quality=90, method=6)
shutil.copy(os.path.join(L, "youtube-profile-800.png"), os.path.join(OUT, "logo", "favicon.png"))
for f in ("Anton.ttf", "InterTight.ttf"):
    shutil.copy(os.path.join(KIT, "05 Fonts", f), os.path.join(OUT, "fonts", f))

A = os.path.join(KIT, "08 Animated Assets")
def enc(src, dst, extra):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, *extra, dst], check=True)
enc(os.path.join(A, "broski-intro-5s-with-sound.mp4"), os.path.join(OUT, "video", "intro.mp4"),
    ["-c:v", "libx264", "-crf", "24", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k"])
enc(os.path.join(A, "broski-spotify-canvas-8s-loop.mp4"), os.path.join(OUT, "video", "canvas-loop.mp4"),
    ["-vf", "scale=720:-2", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"])
enc(os.path.join(A, "broski-sting-vertical-3s.mp4"), os.path.join(OUT, "video", "sting-vertical.mp4"),
    ["-vf", "scale=720:-2", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"])
SND = os.path.join(KIT, "09 Sound")
enc(os.path.join(SND, "music-background-loop-80s.wav"), os.path.join(OUT, "audio", "loop.mp3"), ["-c:a", "libmp3lame", "-b:a", "160k"])
enc(os.path.join(SND, "music-intro-5s.wav"), os.path.join(OUT, "audio", "intro.mp3"), ["-c:a", "libmp3lame", "-b:a", "160k"])
print("done")
