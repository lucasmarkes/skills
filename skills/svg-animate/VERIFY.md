# Verify

Three scripts the agent copies verbatim into the scratch directory and runs
there. Node 22 or later and nothing else, except a rasteriser for `frames` and
`check`: `rsvg-convert` when it is on the machine, then `resvg`, then
`npx @resvg/resvg-js-cli`, which downloads once into the npm cache.
`SVG_RASTER=rsvg-convert`, `resvg` or `npx` picks one. A browser is not a
rasteriser here: its screenshots are not repeatable to the pixel.

```bash
node normalize.mjs <source.svg> norm      # norm/source.svg and norm/inventory.json
node frames.mjs <dir>                     # <dir>/sheet.png and <dir>/zoom.png
node check.mjs <dir> <source.svg>         # add --loop for a loop
```

## normalize

Every shape becomes a `<path>` of absolute cubics, with transforms baked in
and `style` read as attributes, and nothing else in the file changes:
gradients, clip paths and ids still work. Every frame a build writes keeps
these paths' commands and point counts, so one `<animate attributeName="d">`
morphs between any two of them. Without a `viewBox`, the canvas comes from
`width` and `height`.

`inventory.json` is what Read lists: the `viewBox`; `circles`, the bodies
(circles, and the arcs of a path that lie on one, with the path they belong
to, a centre and a radius); `necks`, where two bodies of one path meet, with
the two bones `between` and the two sides `at`; `strokes`, the stroked paths
in drawing order; `groups`, every `<g id>` with its bounds; `touches`, the
shapes that meet; and `paths`.

## frames

Reads every `frame-NNN.svg` in a folder. `sheet.png` holds up to 32 of
them, evenly picked, 8 across, numbered. `zoom.png` holds the frames named in
`critical.txt`, twice the size: a first line `region x y w h` narrows the
viewBox to that region, and the next lines list frame numbers; without it,
the zoom holds the last three frames. Read both
images, every build: `check` passes broken frames that the sheet shows at a
glance.

## check

Renders every frame and exits 1, one line per failure as
`rule  frame  measured → expected`, when:

| Rule | Means |
| --- | --- |
| `last` | the last frame is not the source, to the pixel |
| `loop` | with `--loop`, the first frame is not the last |
| `sliver` | a gap of background under half a unit opens between shapes that touch at rest |
| `flick` | a frame moves more than three times the median step of its neighbours, and more than 1% of the drawing |
| `flat` | a frame carries a `transform`, which the SMIL would not |
| `swap` | a frame has different commands or point counts from the one before |

It prints `ok  N frames` and exits 0 when none fail, and exits 2 with
`not measured` and the reason when it cannot render or there are fewer than
two frames.

```js normalize.mjs
// normalize <svg> <out-dir>: every shape becomes a <path> of absolute cubics, transforms baked in.
// Writes <out-dir>/source.svg and <out-dir>/inventory.json, and prints the inventory without the paths.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error("usage: node normalize.mjs <svg> <out-dir>"); process.exit(2); }
const fmt = (v) => String(+v.toFixed(3));
// attributes, with the declarations of a style attribute read as attributes too (exports from design tools put fill there)
const attrs = (s) => { const a = Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1], m[2] ?? m[3]]));
  for (const d of (a.style ?? "").split(";")) { const [k, v] = d.split(":").map((t) => t.trim()); if (k && v) a[k] = v; } return a; };
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const apply = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]], lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function transform(s = "") {
  let m = [1, 0, 0, 1, 0, 0];
  for (const [, op, args] of s.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const [a = 0, b, c, d, e, f] = args.split(/[\s,]+/).filter(Boolean).map(Number), r = (a * Math.PI) / 180, cos = Math.cos(r), sin = Math.sin(r);
    const n = { translate: [1, 0, 0, 1, a, b ?? 0], scale: [a, 0, 0, b ?? a, 0, 0], matrix: [a, b, c, d, e, f], skewX: [1, 0, Math.tan(r), 1, 0, 0],
      skewY: [1, Math.tan(r), 0, 1, 0, 0], rotate: [cos, sin, -sin, cos, (b ?? 0) * (1 - cos) + (c ?? 0) * sin, (c ?? 0) * (1 - cos) - (b ?? 0) * sin] }[op];
    m = mul(m, n);
  }
  return m;
}
// SVG arc (spec F.6.5) as cubics of at most 90° each; circular arcs are recorded for the inventory
function arc(p1, rx, ry, phi, large, sweep, p2, arcs, from) {
  if (!rx || !ry) return [[lerp(p1, p2, 1 / 3), lerp(p1, p2, 2 / 3), p2]];
  rx = Math.abs(rx); ry = Math.abs(ry);
  const f = (phi * Math.PI) / 180, co = Math.cos(f), si = Math.sin(f), dx = (p1[0] - p2[0]) / 2, dy = (p1[1] - p2[1]) / 2;
  const x = co * dx + si * dy, y = -si * dx + co * dy, l = (x * x) / (rx * rx) + (y * y) / (ry * ry);
  if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, (rx * rx * ry * ry - rx * rx * y * y - ry * ry * x * x) / (rx * rx * y * y + ry * ry * x * x)));
  const ux = (k * rx * y) / ry, uy = (-k * ry * x) / rx, c = [co * ux - si * uy + (p1[0] + p2[0]) / 2, si * ux + co * uy + (p1[1] + p2[1]) / 2];
  const t1 = Math.atan2((y - uy) / ry, (x - ux) / rx);
  let dt = Math.atan2((-y - uy) / ry, (-x - ux) / rx) - t1;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  const E = (t) => [c[0] + rx * Math.cos(t) * co - ry * Math.sin(t) * si, c[1] + rx * Math.cos(t) * si + ry * Math.sin(t) * co];
  const D = (t) => [-rx * Math.sin(t) * co - ry * Math.cos(t) * si, -rx * Math.sin(t) * si + ry * Math.cos(t) * co];
  const n = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-6)), h = dt / n, q = (4 / 3) * Math.tan(h / 4), segs = [];
  for (let i = 0; i < n; i++) {
    const a = t1 + i * h, A = E(a), B = i === n - 1 ? p2 : E(a + h), da = D(a), db = D(a + h);
    segs.push([[A[0] + q * da[0], A[1] + q * da[1]], [B[0] - q * db[0], B[1] - q * db[1]], B]);
  }
  if (Math.abs(rx - ry) < 1e-6) arcs.push({ c, r: rx, deg: (Math.abs(dt) * 180) / Math.PI, from, to: from + n });
  return segs;
}
function parse(d) {
  const subs = []; let i = 0, cmd = "", cur = [0, 0], start = [0, 0], prev = null, sub = null;
  const take = (re) => { const m = re.exec(d.slice(i)); if (!m) throw new Error(`bad path data at ${i}: ${d.slice(i, i + 20)}`); i += m[0].length; return +m[1]; };
  const num = () => take(/^[\s,]*([-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?)/i), flag = () => take(/^[\s,]*([01])/);
  const add = (segs, ctrl = null) => { sub.segs.push(...segs); cur = segs.at(-1)[2]; prev = ctrl; };
  const reflect = (kind) => (prev?.[0] === kind ? [2 * cur[0] - prev[1][0], 2 * cur[1] - prev[1][1]] : cur);
  while (i < d.length) {
    const c = /^[\s,]*([a-zA-Z])/.exec(d.slice(i));
    if (c) {
      cmd = c[1]; i += c[0].length;
      if (/z/i.test(cmd)) { if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 1e-9) add([[lerp(cur, start, 1 / 3), lerp(cur, start, 2 / 3), start]]); sub.closed = true; cur = start; continue; }
    } else if (!/^[\s,]*[-+.\d]/.test(d.slice(i))) break;
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), P = () => { const x = num(), y = num(); return rel ? [cur[0] + x, cur[1] + y] : [x, y]; };
    const line = (p) => add([[lerp(cur, p, 1 / 3), lerp(cur, p, 2 / 3), p]]);
    if (C === "M") { cur = start = P(); subs.push((sub = { start, segs: [], arcs: [] })); cmd = rel ? "l" : "L"; prev = null; }
    else if (C === "L") line(P());
    else if (C === "H") { const v = num(); line([rel ? cur[0] + v : v, cur[1]]); }
    else if (C === "V") { const v = num(); line([cur[0], rel ? cur[1] + v : v]); }
    else if (C === "C" || C === "S") { const a = C === "C" ? P() : reflect("C"), b = P(), p = P(); add([[a, b, p]], ["C", b]); }
    else if (C === "Q" || C === "T") { const q = C === "Q" ? P() : reflect("Q"), p = P(); add([[lerp(cur, q, 2 / 3), lerp(p, q, 2 / 3), p]], ["Q", q]); }
    else if (C === "A") { const rx = num(), ry = num(), phi = num(), la = flag(), sw = flag(), p = P(); add(arc(cur, rx, ry, phi, la, sw, p, sub.arcs, sub.segs.length)); }
  }
  return subs;
}
const SHAPES = {
  path: (a) => a.d ?? "", line: (a) => `M${a.x1 ?? 0} ${a.y1 ?? 0}L${a.x2 ?? 0} ${a.y2 ?? 0}`, polyline: (a) => `M${a.points}`, polygon: (a) => `M${a.points}Z`,
  circle: (a) => SHAPES.ellipse({ ...a, rx: a.r, ry: a.r }),
  ellipse: ({ cx = 0, cy = 0, rx, ry }) => `M${cx} ${cy - ry}A${rx} ${ry} 0 0 1 ${cx} ${+cy + +ry}A${rx} ${ry} 0 0 1 ${cx} ${cy - ry}Z`,
  rect: ({ x = 0, y = 0, width: w, height: h, rx, ry }) => {
    [x, y, w, h] = [x, y, w, h].map(Number); const r = Math.min(+(rx ?? ry ?? 0), w / 2), s = Math.min(+(ry ?? rx ?? 0), h / 2), A = (px, py) => `A${r} ${s} 0 0 1 ${px} ${py}`;
    return r ? `M${x + r} ${y}H${x + w - r}${A(x + w, y + s)}V${y + h - s}${A(x + w - r, y + h)}H${x + r}${A(x, y + h - s)}V${y + s}${A(x + r, y)}Z` : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
  },
};
const GEOM = new Set(["d", "x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "points", "transform"]);
const stack = [{ m: [1, 0, 0, 1, 0, 0], fill: "black", stroke: "none", group: null }], paths = [], groups = {}, circles = [], necks = [];
let viewBox = null;
const svg = readFileSync(src, "utf8").replace(/<(\/?)([\w:-]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g, (all, close, tag, rest, self) => {
  if (close) { if (tag === "g" || tag === "svg") stack.pop(); return SHAPES[tag] ? "</path>" : all; }
  const a = attrs(rest), top = stack.at(-1), m = mul(top.m, transform(a.transform));
  const st = { m, fill: a.fill ?? top.fill, stroke: a.stroke ?? top.stroke, group: tag === "g" && a.id ? a.id : top.group };
  if (tag === "svg" || tag === "g") {
    if (tag === "svg") viewBox ??= (a.viewBox ?? `0 0 ${parseFloat(a.width)} ${parseFloat(a.height)}`).split(/[\s,]+/).map(Number);
    if (!self) stack.push(st);
    return all.replace(/\s+transform\s*=\s*("[^"]*"|'[^']*')/, "");
  }
  if (!SHAPES[tag]) return all;
  const subs = parse(SHAPES[tag](a)).map((s) => ({ ...s, start: apply(m, s.start), segs: s.segs.map((g) => g.map((p) => apply(m, p))) }));
  const d = subs.map((s) => `M${fmt(s.start[0])} ${fmt(s.start[1])}` + s.segs.map((g) => "C" + g.map((p) => `${fmt(p[0])} ${fmt(p[1])}`).join(" ")).join("") + (s.closed ? "Z" : "")).join("");
  const pts = subs.flatMap((s) => [s.start, ...s.segs.flat()]), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], i = paths.length, scale = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
  const length = subs.reduce((t, s) => s.segs.reduce((u, g, j) => u + Math.hypot(g[2][0] - (j ? s.segs[j - 1][2][0] : s.start[0]), g[2][1] - (j ? s.segs[j - 1][2][1] : s.start[1])), t), 0);
  paths.push({ i, id: a.id ?? null, tag, group: st.group, cubics: subs.reduce((t, s) => t + s.segs.length, 0), box: box.map((v) => +fmt(v)), fill: st.fill, stroke: st.stroke, length: +fmt(length), d });
  if (st.group) groups[st.group] = groups[st.group] ? [...groups[st.group].slice(0, 2).map((v, k) => Math.min(v, box[k])), ...groups[st.group].slice(2).map((v, k) => Math.max(v, box[k + 2]))] : box;
  // bodies: circular arcs that share a centre and sweep 150° or more between them; a neck is the run of segments between two bodies
  subs.forEach((s) => {
    const bodies = [];
    for (const r of s.arcs) { const b = bodies.find((b) => Math.hypot(b.c[0] - r.c[0], b.c[1] - r.c[1]) < 0.5 && Math.abs(b.r - r.r) < 0.5) ?? bodies[bodies.push({ c: r.c, r: r.r, deg: 0, segs: [] }) - 1]; b.deg += r.deg; for (let j = r.from; j < r.to; j++) b.segs.push(j); }
    const own = s.segs.map((_, j) => bodies.filter((b) => b.deg >= 150).findIndex((b) => b.segs.includes(j)));
    bodies.filter((b) => b.deg >= 150).forEach((b) => circles.push({ path: i, c: apply(m, b.c).map((v) => +fmt(v)), r: +fmt(b.r * scale) }));
    const base = circles.length - bodies.filter((b) => b.deg >= 150).length, first = own.findIndex((o) => o >= 0);
    for (let k = 1, last = own[first], gap = []; first >= 0 && k <= own.length; k++) {
      const j = (first + k) % own.length, o = own[j];
      if (o < 0) { gap.push(s.segs[j][2]); continue; }
      if (o !== last && gap.length) { const at = gap.reduce((p, q) => [p[0] + q[0] / gap.length, p[1] + q[1] / gap.length], [0, 0]).map((v) => +fmt(v)), pair = [base + last, base + o].sort();
        const n = necks.find((n) => n.path === i && n.between.join() === pair.join()); n ? n.at.push(at) : necks.push({ path: i, between: pair, at: [at] }); }
      last = o; gap = [];
    }
  });
  return `<path${Object.entries(a).filter(([k]) => !GEOM.has(k)).map(([k, v]) => ` ${k}="${v}"`).join("")} d="${d}"${self ? " /" : ""}>`;
});
const touches = []; for (const p of paths) for (const q of paths) if (p.i < q.i && p.box[0] <= q.box[2] && q.box[0] <= p.box[2] && p.box[1] <= q.box[3] && q.box[1] <= p.box[3]) touches.push([p.i, q.i]);
const inventory = { viewBox, paths, circles, necks, strokes: paths.filter((p) => p.stroke !== "none" && p.fill === "none").map((p) => p.i),
  groups: Object.entries(groups).map(([id, b]) => ({ id, box: b.map((v) => +fmt(v)) })), touches };
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/source.svg`, svg); writeFileSync(`${out}/inventory.json`, JSON.stringify(inventory, null, 1));
console.log(JSON.stringify({ ...inventory, paths: paths.map(({ d, ...p }) => p) }, null, 1));
```

```js frames.mjs
// frames <dir>: tiles frame-NNN.svg into sheet.png (8 across, at most 32, evenly picked) and the
// frames named in critical.txt into zoom.png, twice the size, with the viewBox narrowed to its `region`.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
const [dir] = process.argv.slice(2);
if (!dir) { console.error("usage: node frames.mjs <dir>"); process.exit(2); }
const has = (bin) => { try { execFileSync(bin, ["--version"], { stdio: "ignore" }); return true; } catch { return false; } };
const RASTER = process.env.SVG_RASTER ?? (has("rsvg-convert") ? "rsvg-convert" : has("resvg") ? "resvg" : "npx");
function render(i, o, width) {
  if (RASTER === "rsvg-convert") execFileSync("rsvg-convert", ["-w", String(width), "-o", o, i]);
  else if (RASTER === "resvg") execFileSync("resvg", ["-w", String(width), i, o]);
  else if (RASTER === "npx") execFileSync("npx", ["--yes", "@resvg/resvg-js-cli", "--fit-width", String(width), i, o], { stdio: "ignore" });
  else throw new Error(`SVG_RASTER is ${RASTER}, not rsvg-convert, resvg or npx`);
}
const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1], m[2] ?? m[3]]));
const files = readdirSync(dir).filter((f) => /^frame-\d+\.svg$/.test(f)).sort();
if (!files.length) { console.error(`frames: no frame-NNN.svg in ${dir}`); process.exit(2); }
const number = (f) => f.match(/\d+/)[0];
// one frame as a nested <svg>, its ids suffixed so that filters and gradients of different cells never collide
function cell(file, k, x, y, w, region) {
  const text = readFileSync(join(dir, file), "utf8"), m = /<svg\b([^>]*)>([\s\S]*)<\/svg>/.exec(text), a = attrs(m[1]);
  const vb = region ?? a.viewBox ?? `0 0 ${parseFloat(a.width)} ${parseFloat(a.height)}`, [, , vw, vh] = vb.split(/[\s,]+/).map(Number), h = (w * vh) / vw;
  const keep = Object.entries(a).filter(([n]) => !/^(xmlns.*|width|height|x|y|class|style|viewBox|preserveAspectRatio)$/.test(n)).map(([n, v]) => ` ${n}="${v}"`).join("");
  const inner = m[2].replace(/\bid="([^"]+)"/g, `id="$1-c${k}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-c${k})`).replace(/href="#([^"]+)"/g, `href="#$1-c${k}"`);
  return { h, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#e5e5e5"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}"${keep}>${inner}</svg>` +
    `<text x="${x + 4}" y="${y + h + 13}" font-family="monospace" font-size="11" fill="#888">${number(file)}</text>` };
}
function sheet(list, w, out, region) {
  const cols = Math.min(8, list.length), cells = [];
  let y = 8, rowH = 0;
  list.forEach((f, k) => {
    if (k && k % cols === 0) { y += rowH + 22; rowH = 0; }
    const c = cell(f, k, 8 + (k % cols) * (w + 8), y, w, region); rowH = Math.max(rowH, c.h); cells.push(c.svg);
  });
  const W = 8 + cols * (w + 8), H = y + rowH + 22;
  writeFileSync(join(dir, out.replace(".png", ".svg")), `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fafafa"/>${cells.join("")}</svg>`);
  render(join(dir, out.replace(".png", ".svg")), join(dir, out), W);
  console.log(join(dir, out));
}
const pick = files.length <= 32 ? files : Array.from({ length: 32 }, (_, i) => files[Math.round((i * (files.length - 1)) / 31)]);
sheet(pick, 160, "sheet.png");
const crit = existsSync(join(dir, "critical.txt")) ? readFileSync(join(dir, "critical.txt"), "utf8") : "";
const region = /^region\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/m.exec(crit)?.slice(1).join(" ");
const named = crit.replace(/^region.*$/m, "").match(/\d+/g)?.map((n) => files.find((f) => +number(f) === +n)).filter(Boolean);
sheet(named?.length ? named : files.slice(-3), 320, "zoom.png", region);
```

```js check.mjs
// check <dir> <source.svg> [--loop]: the frames end on the source, never jump, never open a sliver.
// One line per failure, `rule  frame  measured → expected`; exit 1 on failure, 0 on `ok`, 2 when nothing could render.
import { readFileSync, writeFileSync, readdirSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { inflateSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join } from "node:path";
const args = process.argv.slice(2), [dir, source] = args.filter((a) => !a.startsWith("--")), loop = args.includes("--loop");
if (!dir || !source) { console.error("usage: node check.mjs <dir> <source.svg> [--loop]"); process.exit(2); }
const tmp = mkdtempSync(join(tmpdir(), "svg-check-"));
const has = (bin) => { try { execFileSync(bin, ["--version"], { stdio: "ignore" }); return true; } catch { return false; } };
const RASTER = process.env.SVG_RASTER ?? (has("rsvg-convert") ? "rsvg-convert" : has("resvg") ? "resvg" : "npx");
function render(svg, width) {
  const i = join(tmp, "in.svg"), o = join(tmp, "out.png");
  writeFileSync(i, svg);
  if (RASTER === "rsvg-convert") execFileSync("rsvg-convert", ["-w", String(width), "-o", o, i]);
  else if (RASTER === "resvg") execFileSync("resvg", ["-w", String(width), i, o]);
  else if (RASTER === "npx") execFileSync("npx", ["--yes", "@resvg/resvg-js-cli", "--fit-width", String(width), i, o], { stdio: "ignore" });
  else throw new Error(`SVG_RASTER is ${RASTER}, not rsvg-convert, resvg or npx`);
  return decode(readFileSync(o));
}
function decode(buf) {
  let w = 0, h = 0; const idat = [];
  for (let p = 8; p < buf.length; p += 12 + buf.readUInt32BE(p)) {
    const type = buf.toString("ascii", p + 4, p + 8), len = buf.readUInt32BE(p);
    if (type === "IHDR") { w = buf.readUInt32BE(p + 8); h = buf.readUInt32BE(p + 12); if (buf[p + 16] !== 8 || buf[p + 17] !== 6 || buf[p + 20]) throw new Error("expected an 8-bit RGBA PNG"); }
    if (type === "IDAT") idat.push(buf.subarray(p + 8, p + 8 + len));
  }
  const raw = inflateSync(Buffer.concat(idat)), s = w * 4, px = new Uint8Array(s * h);
  for (let y = 0; y < h; y++) for (let x = 0, f = raw[y * (s + 1)]; x < s; x++) {
    const a = x >= 4 ? px[y * s + x - 4] : 0, b = y ? px[(y - 1) * s + x] : 0, c = x >= 4 && y ? px[(y - 1) * s + x - 4] : 0;
    const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
    px[y * s + x] = raw[y * (s + 1) + 1 + x] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
  }
  return { w, h, px };
}
const TAG = /<(\/?)([\w:-]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g, SHAPE = /^(path|circle|ellipse|rect|line|polyline|polygon)$/;
const attrs = (s) => { const a = Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1], m[2] ?? m[3]]));
  for (const d of (a.style ?? "").split(";")) { const [k, v] = d.split(":").map((t) => t.trim()); if (k && v) a[k] = v; } return a; };
const viewBox = (svg) => { const a = attrs(/<svg\b([^>]*)>/.exec(svg)[1]); return (a.viewBox ?? `0 0 ${parseFloat(a.width)} ${parseFloat(a.height)}`).split(/[\s,]+/).map(Number); };
const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;
const points = (svg) => [...viewBox(svg), ...[...svg.matchAll(/\sd\s*=\s*"([^"]*)"/g)].flatMap((m) => (m[1].match(NUM) ?? []).map(Number))];
// every shape painted rgb(k,0,0) at full opacity, so an opaque pixel says which shape it belongs to
function label(svg) {
  let k = 0; const st = [{ fill: "black", stroke: "none" }];
  return svg.replace(TAG, (all, close, tag, rest, self) => {
    if (close) { if (tag === "g" || tag === "svg") st.pop(); return all; }
    const a = attrs(rest), top = st.at(-1), fill = a.fill ?? top.fill, stroke = a.stroke ?? top.stroke;
    const bare = rest.replace(/\s(fill|stroke|opacity|fill-opacity|stroke-opacity|style)\s*=\s*("[^"]*"|'[^']*')/g, "");
    if (tag === "g" || tag === "svg") { if (!self) st.push({ fill, stroke }); return `<${tag}${bare}${self}>`; }
    if (!SHAPE.test(tag)) return all;
    const c = `rgb(${Math.min(255, ++k)},0,0)`;
    return `<${tag}${bare} fill="${fill === "none" ? "none" : c}" stroke="${stroke === "none" ? "none" : c}"${self}>`;
  });
}
// a pixel is labelled only when its four neighbours share its colour: the blend at a seam is never mistaken for a third shape
function labels({ w, h, px }) {
  const u = new Uint32Array(px.buffer, px.byteOffset, w * h);
  return Uint8Array.from(u, (c, p) => (px[p * 4 + 3] >= 250 && !px[p * 4 + 1] && !px[p * 4 + 2] && c === u[p - 1] && c === u[p + 1] && c === u[p - w] && c === u[p + w] ? px[p * 4] : 0));
}
// every run of unlabelled pixels between two shapes, along rows and columns: { pair, gap, bg }
function runs(svg, width) {
  const img = render(label(svg), width), lab = labels(img), out = [], { w, h, px } = img;
  const scan = (n, len, at) => { for (let r = 0; r < n; r++) for (let c = 0, last = 0, gap = 0, bg = 0; c < len; c++) {
    const p = at(r, c), l = lab[p];
    if (!l) { gap++; if (px[p * 4 + 3] < 64) bg++; continue; }
    if (last && l !== last) out.push({ pair: [last, l].sort((x, y) => x - y).join("/"), gap, bg });
    last = l; gap = 0; bg = 0;
  } };
  scan(h, w, (r, c) => r * w + c); scan(w, h, (r, c) => c * w + r);
  return out;
}
const differ = (a, b) => { let n = 0; for (let i = 0; i < a.px.length; i += 4) if ([0, 1, 2, 3].some((j) => Math.abs(a.px[i + j] - b.px[i + j]) > 96)) n++; return a.w === b.w && a.h === b.h ? n : Infinity; };
const files = readdirSync(dir).filter((f) => /^frame-\d+\.svg$/.test(f)).sort();
if (files.length < 2) { console.error(`check: ${dir} needs frame-000.svg and at least one more frame`); process.exit(2); }
const frames = files.map((f) => readFileSync(join(dir, f), "utf8")), name = (i) => files[i].replace(".svg", ""), src = readFileSync(source, "utf8");
const [, , vw, vh] = viewBox(src), W = Math.min(2048, Math.round(vw * Math.max(1024 / Math.max(vw, vh), 8))), fails = [];
try {
  frames.forEach((f, i) => { const t = /\stransform\s*=\s*"[^"]*"/.exec(f); if (t) fails.push(`flat  ${name(i)}  ${t[0].trim()} → transforms baked into d`); });
  const last = frames.length - 1, end = render(frames[last], W), off = differ(end, render(src, W));
  if (off) fails.push(`last  ${name(last)}  ${off} px differ from the source → 0`);
  if (loop) { const o = differ(render(frames[0], W), end); if (o) fails.push(`loop  ${name(0)}  ${o} px differ from the last frame → 0`); }
  // flick: a step more than three times the median of its neighbours' steps, and over 1% of the drawing
  const pts = frames.map(points), size = Math.max(vw, vh), steps = [];
  for (let i = 0; i < last; i++) {
    const a = pts[i], b = pts[i + 1];
    if (a.length !== b.length) { steps.push(null); const o = differ(render(frames[i], W), render(frames[i + 1], W)); if (o) fails.push(`swap  ${name(i)} → ${name(i + 1)}  the paths change shape and ${o} px jump → one structure, morphed`); continue; }
    let m = 0; for (let j = 0; j < a.length; j += 2) m = Math.max(m, Math.hypot(a[j] - b[j], (a[j + 1] ?? 0) - (b[j + 1] ?? 0))); steps.push(m);
  }
  steps.forEach((s, i) => {
    const near = [i - 2, i - 1, i + 1, i + 2].map((j) => steps[j]).filter((v) => v != null).sort((x, y) => x - y);
    const med = near.length % 2 ? near[(near.length - 1) / 2] : (near[near.length / 2 - 1] + near[near.length / 2]) / 2;
    if (s != null && near.length && s > 3 * med && s > 0.01 * size) fails.push(`flick  ${name(i)} → ${name(i + 1)}  moves ${s.toFixed(2)}, its neighbours ${med.toFixed(2)} → at most ${(3 * med).toFixed(2)}`);
  });
  // sliver: background narrower than half a unit between two shapes that touch in the last frame
  const restRuns = runs(frames[last], W), touch = new Set(restRuns.filter((r) => r.gap <= 4 && !r.bg).map((r) => r.pair));
  const tally = (rs, w) => rs.reduce((m, r) => (touch.has(r.pair) && r.bg && r.gap <= w + 2 ? m.set(r.pair, (m.get(r.pair) ?? 0) + r.bg) : m), new Map());
  const rest = tally(restRuns, (0.5 * W) / vw);
  frames.forEach((f, i) => {
    if (i === last) return;
    const w = (0.5 * W) / viewBox(f)[2];
    for (const [pair, n] of tally(runs(f, W), w)) if (n > (rest.get(pair) ?? 0) + w) fails.push(`sliver  ${name(i)}  shapes ${pair} leave ${n} px of background under 0.5 units → none`);
  });
} catch (e) { console.log(`not measured  ${RASTER}  ${e.message.split("\n")[0]}`); process.exit(2); }
for (const f of fails) console.log(f);
console.log(fails.length ? `${fails.length} failing` : `ok  ${files.length} frames`);
process.exit(fails.length ? 1 : 0);
```
