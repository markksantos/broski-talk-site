"""Build the Ep 2 freebie: downloads/broski-talk-ep2-which-effort.pdf + a cover preview.
usage: python3 _build/freebie_ep2.py   (needs playwright + pillow)
Source: the Ep 2 transcript and YouTube description. Look and checks: _build/freebie_common.py.
"""
from freebie_common import build

EP = "https://youtu.be/123eSh5vNbU"
TIERS = [("S", "Medium"), ("A", "Low"), ("B", "High"), ("C", "Extra high"), ("F", "Max and UltraCode")]
FIXES = [
    ("Checkpoints.", "The work has to pass a check before it moves on."),
    ("Hard tests and limits.", "Rules on what it's allowed to put out."),
    ("Write your decisions down.", "Developers call them ADRs. The AI stops re-arguing what you already decided."),
    ("Review more than once.", "Simon runs every code review at least twice."),
    ("Use a hook, not a note.", "A line in AGENTS.md can be skipped. A hook is enforced by the computer."),
]

tiers = "".join(f'<li><span class="n" style="color:{"#DC3426" if t in "SF" else "rgba(255,255,255,.5)"}">{t}</span><p>{n}</p></li>' for t, n in TIERS)
fixes = "".join(f'<li><span class="n">{i:02d}</span><p>{a} <span style="font-weight:400;color:rgba(255,255,255,.72)">{b}</span></p></li>' for i, (a, b) in enumerate(FIXES, 1))

BODY = f"""
<section class="page">
  <div class="top">BROSKI TALK.<span>FREE · FROM EPISODE 2</span></div>
  <h1>Which<br><em>effort?</em></h1>
  <p class="lede">Effort is how hard Claude thinks before it answers: low, medium, high, extra high, max and ultra. More thinking is slower and costs more. Here's when it's worth it, from Broski Talk Ep. 2, <i>Elon Never Said That</i>.</p>
  <h2 style="margin-top:.3in;font-size:24px">The viral tier list</h2>
  <ol style="margin-top:.12in">{tiers}</ol>
  <div class="quote">
    <p>Our verdict: <em>it's a meme.</em></p>
    <small>One builder's opinion, 145K views on X. Mark runs medium for most work and extra high when it has to be great, about 50/50.</small>
  </div>
  <div class="test">
    <div><b>$26</b>High effort: one 25-second video, made in Episode 1.</div>
    <div><b>$681</b>Ultra effort: the same video. It took almost 11 hours.</div>
    <div><b>Medium</b>Our default for most tasks. Go higher only when it's needed.</div>
  </div>
  <div class="src">Watch the tier list segment at 5:19: <a href="{EP}?t=319">youtu.be/123eSh5vNbU?t=319</a></div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>AI, TECH AND BUSINESS · 1 / 2</span></div>
</section>
<section class="page">
  <div class="top">BROSKI TALK.<span>WHICH EFFORT?</span></div>
  <div class="cols" style="margin-top:.3in">
    <div class="card red">
      <span class="k">PAY FOR MORE EFFORT</span>
      <ul>
        <li>Planning something big</li>
        <li>Hard bugs the lower levels can't fix</li>
        <li>Long jobs you won't be watching</li>
      </ul>
    </div>
    <div class="card">
      <span class="k">SAVE YOUR USAGE</span>
      <ul>
        <li>Quick answers and simple questions</li>
        <li>Quick edits</li>
        <li>Or let your setup pick the effort for you</li>
      </ul>
    </div>
  </div>
  <h2 style="margin-top:.32in;font-size:30px">Why Claude finds new bugs every time</h2>
  <p class="lede" style="margin-top:8px">Same question, different answer: it's non-deterministic. Like two editors on the same video, one catches the bad cut and the other catches the typo. Five ways to make its work reliable:</p>
  <ol>{fixes}</ol>
  <div class="test">
    <div><b>40 → 2 min</b>CI checks at Owen Gretzinger's startup, after agents fixed them.</div>
    <div><b>11 min</b>How long each check waited for a machine. Now it starts in seconds.</div>
    <div><b>$230 → $4,300</b>The monthly bill. "The cheapest money we spent."</div>
  </div>
  <div class="src">Owen's 9-step guide, to give your coding agent: <a href="https://x.com/owengretzinger/status/2116291924219060319">x.com/owengretzinger</a>. Watch it at 13:36: <a href="{EP}?t=816">youtu.be/123eSh5vNbU?t=816</a></div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>MARK SANTOS &amp; SIMON DZIAK · YOUTUBE.COM/@BROSKITALK · 2 / 2</span></div>
</section>"""

build("ep-2", "broski-talk-ep2-which-effort.pdf", "Broski Talk · Which effort?", BODY)
