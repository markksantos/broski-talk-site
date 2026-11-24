"""Build the Ep 3 freebie: downloads/broski-talk-ep3-fine-print.pdf + a cover preview.
usage: python3 _build/freebie_ep3.py   (needs playwright + pillow)
Source: the Ep 3 transcript and YouTube description. Look and checks: _build/freebie_common.py.
"""
from freebie_common import build

EP = "https://youtu.be/sOLQ0Vl8A50"
FACTS = [
    ("Two limits.", "The lawsuit is about plans that count usage per 5-hour session and per week. Mark says the 5-hour limit has since been dropped."),
    ("5x and 20x is per session.", "Max multiplies the session. The weekly cap grows less: the plaintiffs put it at about 3.5x and 6x Pro's week."),
    ("One session can eat your week.", "One subscriber says a single full 5-hour session on the $200 plan burned about 15% of his weekly usage."),
    ("Enterprise is seats plus usage.", "Anthropic's pricing page: $20 a seat plus usage at API rates."),
]
TIPS = [
    ("Drop the effort.", "Mark moved a lot of work from extra high to medium and burns usage slower."),
    ("Watch the weekly cap.", "It's the one that runs out."),
    ("Join the Claude Duet waitlist.", "People who applied and got access were given two free resets."),
]

facts = "".join(f'<li><span class="n">{i:02d}</span><p>{a} <span style="font-weight:400;color:rgba(255,255,255,.72)">{b}</span></p></li>' for i, (a, b) in enumerate(FACTS, 1))
tips = "".join(f'<li>{a} <span style="color:rgba(255,255,255,.65)">{b}</span></li>' for a, b in TIPS)

BODY = f"""
<section class="page">
  <div class="top">BROSKI TALK.<span>FREE · FROM EPISODE 3</span></div>
  <h1 style="font-size:84px;margin-top:.3in">Read the<br><em>fine print.</em></h1>
  <p class="lede">What your Claude plan actually gives you, and how to make it last. From Broski Talk Ep. 3, <i>Nvidia's CEO and the Alleged Spy</i>.</p>
  <div class="quote">
    <p>A judge says "20x more usage" is <em>plausibly misleading.</em></p>
    <small>Nov 6, 2026: a federal magistrate judge in California let a proposed class action by two subscribers move forward. Nothing is proven yet, no class is certified, and some claims were thrown out. The plans were renamed Max and Ultra on Oct 30.</small>
  </div>
  <h2 style="margin-top:.2in;font-size:24px">How the limits work</h2>
  <ol style="margin-top:.12in">{facts}</ol>
  <div class="cols" style="margin-top:.18in">
    <div class="card red">
      <span class="k">MAKE YOUR USAGE LAST</span>
      <ul>{tips}</ul>
    </div>
    <div class="card">
      <span class="k">STILL HITTING THE WALL?</span>
      <ul>
        <li>Mark runs seven Claude Ultra subscriptions and still hits the weekly limit, sometimes on all seven.</li>
        <li>Simon can burn a whole subscription in one day, depending on how much runs at once.</li>
      </ul>
    </div>
  </div>
  <div class="src">Watch the fine print segment at 4:55: <a href="{EP}?t=295">youtu.be/sOLQ0Vl8A50?t=295</a> · Claude Duet waitlist: <a href="https://claude.com/product/claude-duet">claude.com/product/claude-duet</a></div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>AI, TECH AND BUSINESS · 1 / 2</span></div>
</section>
<section class="page">
  <div class="top">BROSKI TALK.<span>THE AI BACKLASH</span></div>
  <h2 style="margin-top:.32in;font-size:44px;line-height:.95">Is the AI backlash <span style="color:#DC3426">right?</span></h2>
  <p class="lede" style="margin-top:10px">The numbers each side uses, as covered in the episode. Make up your own mind.</p>
  <div class="cols">
    <div class="card red">
      <span class="k">THE CASE FOR THE BACKLASH</span>
      <ul>
        <li><b>Meta</b> scrapped Project OT, a plan to shrink some teams by up to 60% and hand the work to AI agents. Reuters reported internal incidents up 40%.</li>
        <li><b>80%+</b> of companies saw no effect on productivity or jobs over three years (Atlanta Fed survey of about 6,000 executives).</li>
        <li><b>40 of 41</b> local votes said no to data centers.</li>
        <li><b>Virginia:</b> some people pay more at peak hours because of data centers.</li>
      </ul>
    </div>
    <div class="card">
      <span class="k">THE CASE AGAINST IT</span>
      <ul>
        <li><b>Water:</b> US golf used 531 billion gallons in 2024. US data centers used about 17 billion on site in 2023, about 3% of that.</li>
        <li><b>Power bills:</b> after inflation, 2025 US electricity prices were only 3% above 2019, and fell in 29 states.</li>
        <li><b>The main driver</b> of bills is utilities rebuilding old power grids.</li>
        <li><b>Cooling water</b> is cleaned and reused, not destroyed.</li>
      </ul>
    </div>
  </div>
  <div class="test">
    <div><b>531B gal</b>US golf courses, 2024. Poured on grass.</div>
    <div><b>17B gal</b>US data centers, on site, 2023. Power plants use water too.</div>
    <div><b>686B gal</b>Data centers worldwide, 2025 estimate (2.6 trillion liters). Not the same scope as the US golf number.</div>
  </div>
  <h2 style="margin-top:.3in;font-size:24px">Tools from this episode</h2>
  <ol style="margin-top:.12in">
    <li><span class="n">01</span><p>Claude Duet waitlist <span style="font-weight:400;color:rgba(255,255,255,.72)">Anthropic's proactive agent, research preview for Pro, Max and Ultra in the US. <a style="color:#fff" href="https://claude.com/product/claude-duet">claude.com/product/claude-duet</a></span></p></li>
    <li><span class="n">02</span><p>Apple's Xcode plugin for Claude Code <span style="font-weight:400;color:rgba(255,255,255,.72)">Builds and tests iPhone apps, shows SwiftUI previews, drives simulators and phones. <a style="color:#fff" href="https://github.com/anthropics/claude-plugins-official">github.com/anthropics/claude-plugins-official</a></span></p></li>
    <li><span class="n">03</span><p>ArtificialWatch <span style="font-weight:400;color:rgba(255,255,255,.72)">Mark's AI launch tracker. <a style="color:#fff" href="https://artificialwatch.com/model/fable-5-5">artificialwatch.com</a></span></p></li>
  </ol>
  <div class="src">Watch the backlash debate at 11:20: <a href="{EP}?t=680">youtu.be/sOLQ0Vl8A50?t=680</a>. Comment on the video: is the backlash right or wrong?</div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>MARK SANTOS &amp; SIMON DZIAK · YOUTUBE.COM/@BROSKITALK · 2 / 2</span></div>
</section>"""

build("ep-3", "broski-talk-ep3-fine-print.pdf", "Broski Talk · Read the fine print", BODY)
