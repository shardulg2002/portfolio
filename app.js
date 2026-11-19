/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const touchMode = () => matchMedia("(hover: none)").matches;
function hashStr(s){ let h = 2166136261; for (const ch of s){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- generative cover art: one image per project, reused everywhere ---------- */
const STYLES = ["rings", "dots", "stripes", "waves"];
function drawCover(p){
  const S = 640, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d"), r = rng(hashStr(p.id));
  const { bg, ink, accent } = p.cover;
  const style = p.cover.style || STYLES[hashStr(p.id) % STYLES.length];
  g.fillStyle = bg; g.fillRect(0, 0, S, S);

  if (style === "rings"){
    const cx = S * (0.58 + r() * 0.14), cy = S * (0.6 + r() * 0.12);
    g.lineWidth = 2.2;
    for (let i = 1; i < 24; i++){
      g.strokeStyle = ink; g.globalAlpha = Math.max(0.07, 1 - i / 20);
      g.beginPath(); g.arc(cx, cy, i * 24, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 0.22; g.fillStyle = accent;
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, S, -2.5, -1.95); g.closePath(); g.fill();
    g.globalAlpha = 1; g.beginPath(); g.arc(cx, cy, 30, 0, Math.PI * 2); g.fill();
  }
  if (style === "dots"){
    const n = 12, step = S / n;
    for (let y = 2; y < n; y++) for (let x = 0; x < n; x++){
      const v = r();
      const wave = Math.sin((x + y * 0.7) / 2.6) * 0.5 + 0.5;
      const rad = step * (0.07 + 0.33 * Math.pow(wave, 1.3) * (0.65 + v * 0.35));
      g.fillStyle = v > 0.92 ? accent : ink; g.globalAlpha = v > 0.92 ? 1 : 0.88;
      g.beginPath(); g.arc(step * (x + 0.5), step * (y + 0.5), rad, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }
  if (style === "stripes"){
    let y = S * 0.44;
    while (y < S){ const h = 8 + r() * 40; g.fillStyle = r() < 0.2 ? accent : ink; g.fillRect(0, y, S, h); y += h + 7 + r() * 16; }
    g.fillStyle = accent; g.beginPath(); g.arc(S * 0.74, S * 0.27, S * 0.1, 0, Math.PI * 2); g.fill();
  }
  if (style === "waves"){
    g.lineWidth = 3;
    for (let i = 0; i < 26; i++){
      const y0 = S * 0.18 + i * 19, hi = i % 7 === 3;
      g.strokeStyle = hi ? accent : ink; g.globalAlpha = hi ? 1 : 0.62;
      const amp = 8 + r() * 28, f = 0.008 + r() * 0.01, ph = r() * 6;
      g.beginPath();
      for (let x = 0; x <= S; x += 8){ const yy = y0 + Math.sin(x * f + ph) * amp * (x / S); x === 0 ? g.moveTo(x, yy) : g.lineTo(x, yy); }
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // paper grain
  const img = g.getImageData(0, 0, S, S), d = img.data;
  for (let i = 0; i < d.length; i += 4){ const k = (r() - 0.5) * 18; d[i] += k; d[i + 1] += k; d[i + 2] += k; }
  g.putImageData(img, 0, 0);
  return c.toDataURL("image/jpeg", 0.88);
}

PROJECTS.forEach((p, i) => {
  p.catalog = `${SITE.catalogPrefix}-${String(i + 1).padStart(3, "0")}`;
  p.coverUrl = drawCover(p);
});
const ordered = PROJECTS.map((p, i) => ({ p, i })).sort((a, b) => b.p.year - a.p.year || b.i - a.i).map(x => x.p);

/* ---------- markup builders ---------- */
const vinylHTML = (label, extra = "") =>
  `<span class="vinyl-wrap ${extra}" style="--label:${label}" aria-hidden="true"><span class="vinyl"></span><span class="vinyl-shine"></span></span>`;
const metaHTML = p =>
  `<div class="sleeve-meta" style="--ink:${p.cover.ink}"><span class="sleeve-title">${esc(p.title)}</span><span class="sleeve-cat">${p.catalog}</span></div>` + (p.award ? `<span class="sticker" style="--sticker-bg:${p.cover.accent}">${esc(p.award)}</span>` : "");
const tagsHTML = list => list.map(t => `<li class="tag">${esc(t)}</li>`).join("");

const ICONS = {
  video: `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M4 2.5v9l7.5-4.5z"/></svg>`,
  repo:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"/></svg>`,
  deck:  `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 1.8h5.5L12.5 5v9.2H4z"/><path d="M9.3 1.8V5h3.2M6 8.5h4.5M6 11h4.5"/></svg>`,
  demo:  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10L10 4M5 4h5v5"/></svg>`
};
const LINKS = [
  ["demo",  "Try the live demo",    "Opens the app"],
  ["video", "Watch the full walkthrough", "YouTube"],
  ["repo",  "Browse the code",      "GitHub repository"],
  ["deck",  "Read the case study",  "PDF / slides"]
];

function barcodeHTML(seed){
  const r = rng(hashStr(seed)); let s = "";
  for (let i = 0; i < 46; i++){ const w = 1 + Math.floor(r() * 3); s += `<i class="${i % 2 ? "gap" : ""}" style="width:${w}px"></i>`; }
  return s;
}

const teamHTML = p => p.team && p.team.length
  ? `<p class="credits-team">Made with ${p.team.map(t => t.url ? `<a href="${t.url}" target="_blank" rel="noopener">${esc(t.name)}</a>` : esc(t.name)).join(", ")} and ${esc(SITE.artist)}</p>`
  : "";

/* ---------- featured release ---------- */
function renderFeatured(){
  const p = PROJECTS.find(x => x.featured) || ordered[0];
  $("#featured").innerHTML = `
    <div class="featured-art" data-open="${p.id}" role="button" tabindex="0" aria-label="Open ${esc(p.title)}">
      ${vinylHTML(p.cover.accent, "spinning")}
      <div class="sleeve" style="background-image:url(${p.coverUrl});--cover-bg:${p.cover.bg}">${metaHTML(p)}</div>
    </div>
    <div class="featured-text">
      <div class="mono">Featured release · ${p.catalog} · ${p.year}</div>
      <h2>${esc(p.title)}</h2>
      <p>${esc(p.short)}</p>
      <ul class="tags">${tagsHTML(p.stack)}</ul>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-open="${p.id}">View project →</button>
        ${p.links.repo ? `<a class="btn btn-ghost" href="${p.links.repo}" target="_blank" rel="noopener">Source code ↗</a>` : ""}
      </div>
    </div>`;
}

/* ---------- grid wall + filters ---------- */
let activeGenre = "All";
function renderCrate(){
  $("#crate").innerHTML = ordered.map(p => `
    <article class="card" data-id="${p.id}" data-genre="${esc(p.genre)}">
      <div class="card-art">
        ${vinylHTML(p.cover.accent)}
        <div class="sleeve" style="background-image:url(${p.coverUrl});--cover-bg:${p.cover.bg}">
          ${metaHTML(p)}
          <div class="sleeve-overlay">
            <p>${esc(p.short)}</p>
            <ul class="tags">${tagsHTML(p.stack.slice(0, 3))}</ul>
            <button class="btn btn-primary btn-sm" type="button" data-open="${p.id}">View project →</button>
          </div>
        </div>
      </div>
      <div class="card-info">
        <h3>${esc(p.title)}</h3>
        <span class="mono">${p.year} · ${esc(p.genre)}</span>
      </div>
    </article>`).join("") +
    `<div class="slot" aria-hidden="true"><div class="slot-art"><span>Next release<br>in the studio</span></div></div>`;
}
function renderFilters(){
  const counts = {};
  PROJECTS.forEach(p => counts[p.genre] = (counts[p.genre] || 0) + 1);
  const genres = ["All", ...Object.keys(counts).sort()];
  $("#filters").innerHTML = genres.map(g =>
    `<button class="chip" type="button" data-genre="${esc(g)}" aria-pressed="${g === activeGenre}">${esc(g)}<span class="n">${g === "All" ? PROJECTS.length : counts[g]}</span></button>`
  ).join("");
}
function applyFilter(genre){
  activeGenre = genre; let shown = 0;
  const matches = el => genre === "All" || el.dataset.genre === genre;
  document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.genre === genre));
  document.querySelectorAll(".card").forEach(card => {
    const show = matches(card);
    card.hidden = !show; card.classList.remove("is-open", "fade-in");
    if (show){ shown++; void card.offsetWidth; card.classList.add("fade-in"); }
  });
  document.querySelectorAll(".spine").forEach(sp => { sp.hidden = !matches(sp); });
  const active = document.querySelector(".spine.is-active");
  if (!active || active.hidden){ const first = document.querySelector(".spine:not([hidden])"); if (first) setStand(first.dataset.id); }
  $("#disco-count").textContent = `${shown} ${shown === 1 ? "record" : "records"} ${currentView === "shelf" ? "on the shelf" : "on the wall"}`;
}

/* ---------- shelf view ---------- */
let currentView = "wall";
function renderShelf(){
  $("#shelf").innerHTML = ordered.map(p => `
    <button class="spine" type="button" role="listitem" data-id="${p.id}" data-genre="${esc(p.genre)}"
      style="--cover-bg:${p.cover.bg};--ink:${p.cover.ink};--proj:${p.cover.accent}" aria-label="${esc(p.title)}, ${p.year}, ${esc(p.genre)}">
      <span class="spine-title">${esc(p.title)}</span>
      <span class="spine-cat">${p.catalog}</span>
    </button>`).join("") +
    `<div class="shelf-empty-slot" aria-hidden="true"><span>Next release</span></div>`;
}
function setStand(id){
  const p = PROJECTS.find(x => x.id === id); if (!p) return;
  document.querySelectorAll(".spine").forEach(s => s.classList.toggle("is-active", s.dataset.id === id));
  $("#stand").innerHTML = `
    <div class="mono">Pulled from the shelf</div>
    <div class="featured-art" data-open="${p.id}" role="button" tabindex="0" aria-label="Open ${esc(p.title)}">
      ${vinylHTML(p.cover.accent, "spinning")}
      <div class="sleeve" style="background-image:url(${p.coverUrl});--cover-bg:${p.cover.bg}">${metaHTML(p)}</div>
    </div>
    <div><h3>${esc(p.title)}</h3><span class="mono">${p.year} · ${esc(p.genre)} · ${p.catalog}</span></div>
    <p>${esc(p.short)}</p>
    <button class="btn btn-primary btn-sm" type="button" data-open="${p.id}">View project →</button>`;
}
function setView(view){
  currentView = view === "shelf" ? "shelf" : "wall";
  $("#crate").hidden = currentView !== "wall";
  $("#shelf-view").hidden = currentView !== "shelf";
  document.querySelectorAll(".seg").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === currentView));
  try { localStorage.setItem("vinyl-view", currentView); } catch (_) {}
  applyFilter(activeGenre);
}
$("#shelf").addEventListener("mouseover", e => { const sp = e.target.closest(".spine"); if (sp && !touchMode() && !sp.classList.contains("is-active")) setStand(sp.dataset.id); });
$("#shelf").addEventListener("focusin", e => { const sp = e.target.closest(".spine"); if (sp) setStand(sp.dataset.id); });
function renderSkills(){ $("#skills").innerHTML = tagsHTML(SITE.tools); }

/* ---------- player: front + back of the sleeve ---------- */
const dlg = $("#player"), flipper = $("#flipper"), flipBtn = $("#flip-btn");
let currentId = null, flipTimer = null;

function setFlipped(on){
  flipper.classList.toggle("is-flipped", on);
  flipBtn.textContent = on ? "Show front" : "Show back";
}
function renderPlayer(p){
  dlg.style.setProperty("--proj", p.cover.accent);
  const front = $("#face-front");
  front.style.backgroundImage = `url(${p.coverUrl})`;
  front.style.backgroundColor = p.cover.bg;
  front.innerHTML = metaHTML(p);

  const links = LINKS.filter(([k]) => p.links[k]).map(([k, label, sub]) => `
    <a class="link-tile" href="${p.links[k]}" target="_blank" rel="noopener">
      <span class="link-icon">${ICONS[k]}</span>
      <span><strong>${label}</strong><span class="sub">${sub}${k === "video" && p.videoLength ? " · " + esc(p.videoLength) : ""} ↗</span></span>
    </a>`).join("");
  const track = (list, side) => list.map((t, i) => `<li><span class="no">${side}${i + 1}</span><span>${esc(t)}</span></li>`).join("");

  $("#face-back").innerHTML = `
    <div class="back">
      <div class="back-top"><span class="mono">${p.catalog}</span><span class="mono">33⅓ RPM · Stereo · ${p.year}</span></div>
      <div class="back-head">
        ${vinylHTML(p.cover.accent, "spinning")}
        <div>
          <h2 id="player-title">${esc(p.title)}</h2>
          <p class="back-sub">${p.team && p.team.length ? "Team project" : esc(SITE.artist)} · ${esc(p.genre)}</p>
        </div>
      </div>
      <p class="back-short">${esc(p.short)}</p>
      ${clipHTML(p)}
      <div class="back-links">${links}</div>
      <div class="sides">
        <div class="side"><h3>Side A · ${esc(p.sideATitle || "Features")}</h3><ol class="tracklist">${track(p.sideA, "A")}</ol></div>
        <div class="side"><h3>Side B · ${esc(p.sideBTitle || "Under the hood")}</h3><ol class="tracklist">${track(p.sideB, "B")}</ol></div>
      </div>
      <div class="liner"><h3>Liner notes</h3><p>${esc(p.notes)}</p></div>
      <div class="credits"><h3>Credits · Built with</h3><ul class="tags">${tagsHTML(p.stack)}</ul>${teamHTML(p)}</div>
      <div class="back-foot">
        <div class="barcode" aria-hidden="true">${barcodeHTML(p.catalog)}</div>
        <span class="mock-note">${p.context ? esc(p.context) : `© ${p.year} ${esc(SITE.artist)}`}</span>
      </div>
    </div>`;
}
/* ---------- demo clip ----------
   On the real site this becomes:
     <video src="clips/pulse.mp4" poster="clips/pulse.jpg" autoplay muted loop playsinline></video>
   In this prototype a canvas animation stands in, because the preview can't load video files. */
const CLIP_MS = 8000;
let clip = null;
const PLAY_SVG = `<svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><path d="M1 .8v10.4L10.2 6z"/></svg>`;
const PAUSE_SVG = `<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="0" y="0" width="3.4" height="12" rx="1"/><rect x="6.6" y="0" width="3.4" height="12" rx="1"/></svg>`;
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
function rr(g, x, y, w, h, r){
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function clipHTML(p){
  if (!p.clip) return "";
  return `<figure class="clip">
    <div class="clip-frame">
      <canvas id="clip-canvas" width="960" height="540" role="img" aria-label="Looping demo clip of ${esc(p.title)}"></canvas>
      <span class="clip-badge"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M1.5 4.5h2l3-2.5v8l-3-2.5h-2z" fill="currentColor"/><path d="M8.5 4.5l3 3M11.5 4.5l-3 3" stroke-linecap="round"/></svg>Muted loop</span>
      <div class="clip-controls">
        <button class="clip-play" id="clip-play" type="button" aria-label="Pause clip">${PAUSE_SVG}</button>
        <div class="clip-track"><div class="clip-progress" id="clip-progress"></div></div>
        <span class="clip-time" id="clip-time">0:00 / 0:08</span>
      </div>
    </div>
    ${p.mock ? `<figcaption>Prototype stand-in. On the real site, a 10–20 second muted screen recording loops here.</figcaption>` : ""}
  </figure>`;
}
function drawClipFrame(g, p, d, pr){
  const W = 960, H = 540, { bg, ink, accent } = p.cover;
  g.fillStyle = "#0c0c0e"; g.fillRect(0, 0, W, H);
  const wx = 40, wy = 34, ww = W - 80, wh = H - 68;
  g.save(); rr(g, wx, wy, ww, wh, 14); g.fillStyle = "#151518"; g.fill(); g.clip();
  // title bar
  g.fillStyle = bg; g.fillRect(wx, wy, ww, 40);
  g.fillStyle = ink; g.globalAlpha = .45;
  for (let i = 0; i < 3; i++){ g.beginPath(); g.arc(wx + 22 + i * 18, wy + 20, 5, 0, Math.PI * 2); g.fill(); }
  g.globalAlpha = 1; g.font = "600 15px Inter, system-ui, sans-serif"; g.textAlign = "center";
  g.fillText(p.title, wx + ww / 2, wy + 25); g.textAlign = "left";
  // sidebar
  const sx = wx, sy = wy + 40, sw = 170;
  g.fillStyle = "#111114"; g.fillRect(sx, sy, sw, wh - 40);
  const active = pr < 0.55 ? 1 : 2;
  for (let i = 0; i < 5; i++){ g.fillStyle = i === active ? accent : "#2a2a30"; rr(g, sx + 16, sy + 24 + i * 36, sw - 32 - (i % 3) * 18, 14, 4); g.fill(); }
  // KPI tiles
  const mx = sx + sw + 24, my = sy + 22, mw = ww - sw - 48, tw = (mw - 24) / 3;
  for (let i = 0; i < 3; i++){
    const x = mx + i * (tw + 12);
    g.fillStyle = "#1d1d22"; rr(g, x, my, tw, 64, 8); g.fill();
    g.fillStyle = "#3a3a42"; rr(g, x + 14, my + 14, tw * .4, 8, 3); g.fill();
    const w = (tw - 28) * d.kpi[i] * ease(pr / .25);
    if (w > 4){ g.fillStyle = i === 0 ? accent : ink; g.globalAlpha = .9; rr(g, x + 14, my + 32, w, 14, 4); g.fill(); g.globalAlpha = 1; }
  }
  // line chart drawing itself
  const cx0 = mx, cy0 = my + 84, cw = mw, ch = 180, n = d.pts.length;
  g.fillStyle = "#18181c"; rr(g, cx0, cy0, cw, ch, 8); g.fill();
  g.strokeStyle = "#26262c"; g.lineWidth = 1;
  for (let i = 1; i < 4; i++){ g.beginPath(); g.moveTo(cx0 + 12, cy0 + i * ch / 4); g.lineTo(cx0 + cw - 12, cy0 + i * ch / 4); g.stroke(); }
  const px = i => cx0 + 16 + i * (cw - 32) / (n - 1), py = v => cy0 + ch - 16 - v * (ch - 32);
  const upto = ease((pr - .08) / .5) * (n - 1);
  if (upto > 0){
    const whole = Math.floor(upto), f = upto - whole;
    let lx = px(0), ly = py(d.pts[0]);
    g.beginPath(); g.moveTo(lx, ly);
    for (let i = 1; i <= whole; i++){ lx = px(i); ly = py(d.pts[i]); g.lineTo(lx, ly); }
    if (f > 0 && whole + 1 < n){ lx = px(whole) + (px(whole + 1) - px(whole)) * f; ly = py(d.pts[whole]) + (py(d.pts[whole + 1]) - py(d.pts[whole])) * f; g.lineTo(lx, ly); }
    g.strokeStyle = accent; g.lineWidth = 3; g.lineJoin = "round"; g.stroke();
    g.lineTo(lx, cy0 + ch - 16); g.lineTo(px(0), cy0 + ch - 16); g.closePath();
    g.fillStyle = accent; g.globalAlpha = .12; g.fill(); g.globalAlpha = 1;
    g.beginPath(); g.arc(lx, ly, 5, 0, Math.PI * 2); g.fill();
  }
  // bar chart growing
  const by = cy0 + ch + 18, bh = wh - (by - wy) - 24, nb = d.bars.length, bw = (mw - (nb - 1) * 8) / nb;
  for (let i = 0; i < nb; i++){
    const h = bh * d.bars[i] * ease((pr - .42 - i * .02) / .25);
    if (h < 3) continue;
    g.fillStyle = i === d.hi && pr > .8 ? accent : "#34343c";
    rr(g, mx + i * (bw + 8), by + bh - h, bw, h, 4); g.fill();
  }
  // cursor moves to a bar and clicks it
  if (pr > .6 && pr < .95){
    const t = ease((pr - .62) / .16);
    const tx = mx + d.hi * (bw + 8) + bw / 2, ty = by + bh - bh * d.bars[d.hi] * .5;
    const x = mx + mw * .2 + (tx - mx - mw * .2) * t, y = my + 40 + (ty - my - 40) * t;
    if (pr > .8){ const k = (pr - .8) / .12; g.strokeStyle = "#fff"; g.globalAlpha = Math.max(0, 1 - k); g.lineWidth = 2; g.beginPath(); g.arc(x, y, 6 + k * 22, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    g.fillStyle = "#fff"; g.strokeStyle = "#111"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 20); g.lineTo(x + 5, y + 15); g.lineTo(x + 9, y + 23); g.lineTo(x + 12, y + 21); g.lineTo(x + 8, y + 14); g.lineTo(x + 14, y + 14); g.closePath(); g.fill(); g.stroke();
  }
  g.restore();
  if (pr > .93){ g.fillStyle = "#0c0c0e"; g.globalAlpha = (pr - .93) / .07; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
}
function startClip(p){
  stopClip();
  const cv = document.getElementById("clip-canvas"); if (!cv) return;
  const g = cv.getContext("2d"), r = rng(hashStr(p.id + "-clip"));
  const pts = []; let v = .3 + r() * .2;
  for (let i = 0; i < 32; i++){ v += (r() - .42) * .12; v = Math.min(.92, Math.max(.08, v)); pts.push(v); }
  const d = { pts, bars: Array.from({ length: 10 }, () => .25 + r() * .75), kpi: [.5 + r() * .4, .4 + r() * .5, .3 + r() * .6], hi: Math.floor(r() * 10) };
  const prog = $("#clip-progress"), time = $("#clip-time");
  clip = { elapsed: 0, last: null, paused: false, raf: null };
  clip.paint = () => {
    const pr = (clip.elapsed % CLIP_MS) / CLIP_MS;
    drawClipFrame(g, p, d, pr);
    prog.style.width = (pr * 100) + "%";
    time.textContent = `0:0${Math.floor(pr * CLIP_MS / 1000)} / 0:0${CLIP_MS / 1000}`;
  };
  clip.tick = t => {
    if (!clip) return;
    if (clip.last != null && !clip.paused) clip.elapsed += t - clip.last;
    clip.last = t; clip.paint(); clip.raf = requestAnimationFrame(clip.tick);
  };
  if (reduceMotion()){ clip.elapsed = CLIP_MS * .82; clip.paused = true; clip.paint(); }
  else clip.raf = requestAnimationFrame(clip.tick);
  setPlayIcon();
}
function stopClip(){ if (clip && clip.raf) cancelAnimationFrame(clip.raf); clip = null; }
function setPlayIcon(){
  const b = $("#clip-play"); if (!b || !clip) return;
  b.innerHTML = clip.paused ? PLAY_SVG : PAUSE_SVG;
  b.setAttribute("aria-label", clip.paused ? "Play clip" : "Pause clip");
}
function toggleClip(){
  if (!clip) return;
  clip.paused = !clip.paused; clip.last = null;
  if (!clip.raf) clip.raf = requestAnimationFrame(clip.tick);
  setPlayIcon();
}

function openProject(id){
  const p = PROJECTS.find(x => x.id === id); if (!p) return;
  currentId = id;
  renderPlayer(p);
  startClip(p);
  clearTimeout(flipTimer);
  flipper.style.transition = "none"; setFlipped(false); void flipper.offsetWidth; flipper.style.transition = "";
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
  flipTimer = setTimeout(() => setFlipped(true), reduceMotion() ? 0 : 550);
  if (location.hash !== "#" + id) location.hash = id;
}
function closePlayer(){
  clearTimeout(flipTimer);
  if (dlg.open) dlg.close();
}
dlg.addEventListener("close", () => {
  currentId = null;
  stopClip();
  if (PROJECTS.some(p => "#" + p.id === location.hash)){
    try { history.replaceState(null, "", location.pathname + location.search); } catch (_) { location.hash = ""; }
  }
});
dlg.addEventListener("click", e => { if (e.target === dlg) closePlayer(); });
$("#close-btn").addEventListener("click", closePlayer);
flipBtn.addEventListener("click", () => setFlipped(!flipper.classList.contains("is-flipped")));
$("#copy-link").addEventListener("click", e => {
  const btn = e.currentTarget, url = location.href.split("#")[0] + "#" + currentId;
  const done = msg => { btn.textContent = msg; setTimeout(() => btn.textContent = "Copy link to project", 1800); };
  try { navigator.clipboard.writeText(url).then(() => done("Link copied"), () => done("#" + currentId)); } catch (_) { done("#" + currentId); }
});

function syncFromHash(){
  const id = location.hash.slice(1);
  if (PROJECTS.some(p => p.id === id)){ if (!(dlg.open && currentId === id)) openProject(id); }
  else if (dlg.open) closePlayer();
}
window.addEventListener("hashchange", syncFromHash);

/* ---------- interactions ---------- */
function closeCards(except){ document.querySelectorAll(".card.is-open").forEach(c => { if (c !== except) c.classList.remove("is-open"); }); }
document.addEventListener("click", e => {
  if (e.target.closest("#clip-play")){ toggleClip(); return; }
  const opener = e.target.closest("[data-open]");
  if (opener){ e.preventDefault(); openProject(opener.dataset.open); return; }
  const chip = e.target.closest(".chip");
  if (chip){ applyFilter(chip.dataset.genre); return; }
  const seg = e.target.closest(".seg");
  if (seg){ setView(seg.dataset.view); return; }
  const spine = e.target.closest(".spine");
  if (spine){
    if (touchMode() && !spine.classList.contains("is-active")) setStand(spine.dataset.id);
    else openProject(spine.dataset.id);
    return;
  }
  const card = e.target.closest(".card");
  if (card){
    if (touchMode() && !card.classList.contains("is-open")){ closeCards(card); card.classList.add("is-open"); }
    else if (!touchMode()) openProject(card.dataset.id);
    return;
  }
  closeCards();
});
document.addEventListener("keydown", e => {
  const t = e.target.closest && e.target.closest(".featured-art");
  if (t && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); openProject(t.dataset.open); }
});
$("#copy-email").addEventListener("click", e => {
  const btn = e.currentTarget, text = $("#email").textContent;
  const fallback = () => { const range = document.createRange(); range.selectNodeContents($("#email")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); btn.textContent = "Selected, press copy"; };
  try { navigator.clipboard.writeText(text).then(() => { btn.textContent = "Copied"; setTimeout(() => btn.textContent = "Copy email", 1800); }, fallback); } catch (_) { fallback(); }
});

/* ---------- boot ---------- */
["#brand-name", "#hero-name", "#foot-name"].forEach(s => $(s).textContent = SITE.artist);
$("#email").textContent = SITE.email;
renderFeatured();
renderFilters();
renderCrate();
renderShelf();
setStand((PROJECTS.find(x => x.featured) || ordered[0]).id);
let savedView = "wall";
try { savedView = localStorage.getItem("vinyl-view") || "wall"; } catch (_) {}
setView(savedView);
renderSkills();
syncFromHash();
