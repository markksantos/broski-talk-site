// The new-episode email. Plain, table-based HTML that holds up in Gmail, Apple Mail and Outlook,
// light background (dark-mode clients invert it cleanly), one image, one button.
// Workspace369 adds the unsubscribe link and the sender's mailing address to every campaign.
import { SITE, esc, clock, thumb } from "./show.mjs";

export function episodeEmail(e) {
  const url = `${SITE}${e.path}?utm_source=newsletter&utm_medium=email&utm_campaign=ep${e.num}`;
  const links = (e.resources || []).filter((r) => !r.credit).length;
  const subject = `New episode: ${e.cleanTitle}`;
  const preheader = e.hook || e.summary.slice(0, 120);
  const body = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f2f2f2;">
<span style="display:none!important;opacity:0;max-height:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
  <tr><td style="background:#000;padding:18px 24px;color:#fff;font-family:Impact,'Anton','Arial Narrow',sans-serif;font-size:22px;letter-spacing:.5px;">BROSKI TALK.</td></tr>
  <tr><td><a href="${url}"><img src="${thumb(e.id)}" width="600" alt="Episode ${e.num}: ${esc(e.cleanTitle)}" style="display:block;width:100%;height:auto;border:0;"></a></td></tr>
  <tr><td style="padding:28px 28px 8px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:2px;color:#777;">NEW EPISODE · EP ${String(e.num).padStart(2, "0")}${e.seconds ? ` · ${clock(e.seconds)}` : ""}</p>
    <h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-.5px;">${esc(e.cleanTitle)}</h1>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.55;color:#333;">${esc(e.summary)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#000;border-radius:999px;">
      <a href="${url}" style="display:inline-block;padding:14px 26px;color:#fff;font-weight:700;font-size:16px;text-decoration:none;">Watch episode ${e.num} →</a>
    </td></tr></table>
    ${links ? `<p style="margin:22px 0 0;font-size:15px;line-height:1.5;color:#333;">Every link we mention is on the episode page: <a href="${url}#free" style="color:#000;font-weight:700;">${links} link${links === 1 ? "" : "s"} from this episode</a>.</p>` : ""}
  </td></tr>
  <tr><td style="padding:22px 28px 30px;font-size:15px;line-height:1.5;color:#333;">See you in the comments,<br><strong>Mark &amp; Simon</strong></td></tr>
  <tr><td style="padding:18px 28px;border-top:1px solid #eee;font-size:12px;line-height:1.5;color:#888;">You're getting this because you signed up at broskitalk.com for new Broski Talk episodes.
    <a href="https://www.youtube.com/@broskitalk" style="color:#888;">YouTube</a> · <a href="https://www.instagram.com/broskitalk/" style="color:#888;">Instagram</a> · <a href="https://www.tiktok.com/@broskitalkpod" style="color:#888;">TikTok</a></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, body, name: `Broski Talk Ep ${e.num}: ${e.cleanTitle}` };
}
