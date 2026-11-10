// Refreshes the static fallback copy of the home page's episode sections from netlify/data/seed.json.
// The live site fills the same sections on every request (netlify/functions/pages.mjs), so this
// only matters if the function is down. Run: node _build/render-home.mjs
import fs from "node:fs";
import { loadShow } from "../netlify/lib/show.mjs";
import { fillHome } from "../netlify/lib/render.mjs";
const show = await loadShow();
const html = fillHome(fs.readFileSync("index.html", "utf8"), show).replace(/\/\.netlify\/images\?url=([^&"]+)&w=\d+&q=72/g, (_, u) => decodeURIComponent(u));
fs.writeFileSync("index.html", html);
console.log("home sections filled from", show.episodes.length, "episodes and", show.shorts.length, "shorts");
