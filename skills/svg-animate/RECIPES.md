# Recipes

Thirteen archetypes, each one a kind of motion a drawing can already hold. They
are vocabulary, not a menu: a proposal starts from something the drawing has
(see **when the drawing has**), and the recipe is how that motion was built
once and looked right. A recipe that does not match anything in the drawing is
the wrong recipe, however good it looks on the page.

Every entry has the same five parts:

- **When the drawing has**: the feature that earns the recipe.
- **The story**: what the motion says, in one line.
- **The recipe**: the moves, and the build script when there is a worked one.
- **The numbers**: durations, curves, springs and sampling that looked right.
  Start from them; the contact sheet decides.
- **What goes wrong**: the defect this recipe produced before and its fix.

## How a build runs

Copy `kit.mjs` (below) and the build script into the scratch directory, beside
the three scripts of `VERIFY.md`. Then, for a proposal named `drop`:

```bash
node normalize.mjs <source.svg> norm          # once per drawing
node drop.mjs norm drop                       # frames in drop/, the SMIL in drop.svg
node frames.mjs drop                          # drop/sheet.png and drop/zoom.png
node check.mjs drop <source.svg>              # add --loop for a loop
```

A build reads `norm/` and writes `frame-000.svg` … into its folder, a
`critical.txt` for the zoom, and `<name>.svg`: the source with one
`<animate attributeName="d">` per moving path, `begin="indefinite"`, linear
between dense frames. An interaction writes a factory instead (see Magnet).

`check` passing is not the drawing looking right. Every defect named under
**what goes wrong** below passed `check` once: a body that lags as if glued, a
kink at a joint, a neck that turns into a teardrop or a bar. Only the sheet
and the zoom show them. Look at both, every build.

## The kit

`kit.mjs` holds what every build shares. Nothing in it is specific to a
drawing.

| Export | What it does |
| --- | --- |
| `load(norm)` | The normalised drawing: `{ svg, inv, paths: [{ d, pts, owner, starts }] }`. `pts` are every point of a path in `d` order; `owner[j]` is the anchor point `j` belongs to (a handle follows its anchor); `starts` are where each subpath begins. |
| `bones(drawing)` | One bone per body the inventory found, `{ c, r, paths }`. Add your own for a hinge or a group: `{ c: [x, y], r, paths: [i] }`. |
| `rig(drawing, bones, necks)` | `pose(mats, widths?)` → point lists. Each bone moves by an affine matrix; the drawing follows a field that blends them, weighted 1/d⁴ to the bone centres; handles turn with the field, so joints stay smooth. Between two bones of a neck the outline thins as they part and swells as they press, by (L₀/L)^1.5 clamped to 0.7–1.25, or by `widths[i]` when given. |
| `beads(drawing, bones, necks)` | `(mats)` → point lists of the same paths drawn as their bodies alone, every neck at width zero. `mix(beads(m), pose(m), u)` grows the necks back. |
| `mix(a, b, u)` | Two point lists blended, `u` from 0 to 1. |
| `frames(drawing, pose, opts)` | Samples `pose(t)` at `fps` (60) for `dur` seconds into `out/frame-NNN.svg`; the last frame is the source itself, and the first too with `loop: true`. `critical` is the text of `critical.txt`. `dress(t, text)` may edit a frame's text (a viewBox, a dash). Returns every frame's `d` strings. |
| `smil(drawing, all, { dur, loop, begin })` | The source with one `<animate>` per moving path. `begin` is `"indefinite"` for the gallery and `"0s"` for a file that plays on its own. |
| `live(drawing, bones, necks)` | The rig as browser code: `M`, `pose(mats)`, `bones`, and `d(i, pts)`, the text of a posed path. The top of an interaction's factory. |
| `spring(k, c, x, v)` | A damped spring stepped at a fixed 1/120 s: `step(target, dt)` returns the position; `set(x, v)` kicks it; `x` and `v` read it. |
| `ease(curve)`, `curves` | `cubic-bezier` as a function; `curves.out` is `0.23 1 0.32 1`, `curves.inOut` is `0.77 0 0.175 1`. |
| `M` | 2D matrices as in SVG: `id`, `mul`, `apply`, `move`, `scale(c, sx, sy)`, `rotate(c, deg)`. |
| `fmt`, `clamp` | A number to at most three decimals; a value held between two others. |

Three conventions hold for every recipe:

- **Sample, never ease, physics.** A spring or a fall is simulated at a fixed
  step and sampled into frames; the SMIL is linear between them. A curve is
  for a simple move, and then one of the two above.
- **The source is the first and last frame.** `frames` writes it for you. A
  build that ends anywhere else fails `check` on `last`.
- **One structure, morphed.** Every frame has the source's commands and point
  count. A shape that changes into another is a morph of the same points, or
  goo that converges; never a swap and never a crossfade.

```js kit.mjs
// kit <norm-dir>: load the drawing normalize wrote, pose it with bones, sample the frames, write the SMIL.
// Copy beside each build script; `import { load, bones, rig, frames, smil, spring, ease, curves } from "./kit.mjs"`.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;
export const fmt = (v) => String(+v.toFixed(3));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const curves = { out: [0.23, 1, 0.32, 1], inOut: [0.77, 0, 0.175, 1] };
// cubic-bezier(x1, y1, x2, y2) as a function of progress, for the simple moves; physics is sampled, never eased
export function ease([x1, y1, x2, y2]) {
  const B = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (u) => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (B(x1, x2, m) < u) lo = m; else hi = m; } return B(y1, y2, (lo + hi) / 2); };
}
// a damped spring stepped at a fixed 1/120 s, so it moves the same at any frame rate
export function spring(k = 220, c = 16, x = 0, v = 0) {
  return { get x() { return x; }, get v() { return v; }, set(x0, v0 = 0) { x = x0; v = v0; },
    step(target, dt) { for (; dt > 1e-9; dt -= 1 / 120) { const h = Math.min(1 / 120, dt); v += (k * (target - x) - c * v) * h; x += v * h; } return x; } };
}
// 2D affine matrices [a, b, c, d, e, f], as in SVG
export const M = {
  id: () => [1, 0, 0, 1, 0, 0],
  mul: (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]],
  apply: (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]],
  move: (dx, dy) => [1, 0, 0, 1, dx, dy],
  scale: ([cx, cy], sx, sy = sx) => [sx, 0, 0, sy, cx - sx * cx, cy - sy * cy],
  rotate: ([cx, cy], deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy]; },
};
// the drawing: every path's points in d order, for every point the anchor it belongs to (a handle follows its anchor), and where each M starts
export function load(norm) {
  const svg = readFileSync(join(norm, "source.svg"), "utf8"), inv = JSON.parse(readFileSync(join(norm, "inventory.json"), "utf8"));
  const paths = [...svg.matchAll(/\sd="([^"]*)"/g)].map(([, d]) => {
    const pts = [], owner = [], starts = [];
    for (const [, c, args] of d.matchAll(/([MCZ])([^MCZ]*)/g)) {
      const v = args.match(NUM)?.map(Number) ?? [], a = pts.length - 1;
      if (c === "M") { starts.push(pts.length); owner.push(pts.length); pts.push([v[0], v[1]]); }
      if (c === "C") { pts.push([v[0], v[1]], [v[2], v[3]], [v[4], v[5]]); owner.push(a, a + 3, a + 3); }
    }
    return { d, pts, owner, starts };
  });
  return { svg, inv, paths };
}
// one bone per body the inventory found, each moving only the path it was found in; add your own for hinges and groups
export const bones = (drawing) => drawing.inv.circles.map((c) => ({ c: c.c, r: c.r, paths: [c.path] }));
// rig(drawing, bones, necks) → pose(mats): the drawing sits in a field that blends the bones' matrices, weighted 1/d⁴ to their
// centres. Each anchor moves with the field and its handles with the field's local stretch, so when two bodies part the
// tangents between them stretch too, both handles of an anchor turn together, and the joint stays smooth.
// necks: [[a, b]] pairs of bones; between them the outline thins when they part and swells when they press, by (L0/L)^1.5.
export function rig(drawing, bs, necks = []) {
  const owned = drawing.paths.map((_, i) => bs.map((b, k) => (!b.paths || b.paths.includes(i) ? k : -1)).filter((k) => k >= 0));
  const weights = (ks, q) => { const raw = ks.map((k) => Math.max(1e-9, Math.hypot(q[0] - bs[k].c[0], q[1] - bs[k].c[1])) ** -4), s = raw.reduce((a, b) => a + b, 0); return new Map(ks.map((k, n) => [k, raw[n] / s])); };
  return (mats, widths = []) => {
    const cur = bs.map((b, k) => M.apply(mats[k], b.c));
    const nk = necks.map(([a, b], i) => {
      const L0 = Math.hypot(bs[b].c[0] - bs[a].c[0], bs[b].c[1] - bs[a].c[1]), L = Math.hypot(cur[b][0] - cur[a][0], cur[b][1] - cur[a][1]) || L0;
      const n0 = [-(bs[b].c[1] - bs[a].c[1]) / L0, (bs[b].c[0] - bs[a].c[0]) / L0], n = [-(cur[b][1] - cur[a][1]) / L, (cur[b][0] - cur[a][0]) / L];
      return { a, b, f: widths[i] ?? clamp((L0 / L) ** 1.5, 0.7, 1.25), n0, n };
    });
    // where the field takes a rest point q of a path owned by bones ks
    const field = (ks, q) => {
      const w = weights(ks, q), m = [0, 0, 0, 0, 0, 0];
      for (const [k, x] of w) for (let r = 0; r < 6; r++) m[r] += x * mats[k][r];
      const p = M.apply(m, q);
      for (const { a, b, f, n0, n } of nk) {
        if (!w.has(a) || !w.has(b)) continue;
        const s = 4 * w.get(a) * w.get(b) * (f - 1) * ((q[0] - bs[a].c[0]) * n0[0] + (q[1] - bs[a].c[1]) * n0[1]);
        p[0] += s * n[0]; p[1] += s * n[1];
      }
      return p;
    };
    return drawing.paths.map((p, i) => {
      const at = p.pts.map((q, j) => {
        if (p.owner[j] !== j) return null;
        const h = 1e-3, o = field(owned[i], q), x = field(owned[i], [q[0] + h, q[1]]), y = field(owned[i], [q[0], q[1] + h]);
        return { o, J: [(x[0] - o[0]) / h, (x[1] - o[1]) / h, (y[0] - o[0]) / h, (y[1] - o[1]) / h, 0, 0] };
      });
      return p.pts.map((q, j) => {
        const a = p.pts[p.owner[j]], { o, J } = at[p.owner[j]], v = M.apply(J, [q[0] - a[0], q[1] - a[1]]);
        return [o[0] + v[0], o[1] + v[1]];
      });
    });
  };
}
// beads(drawing, bones, necks) → (mats) → point lists: the same paths drawn as their bodies alone. An anchor off every circle
// sits in a neck and goes to the axis between its two bodies; an anchor on a circle next to one goes to where that axis
// leaves its circle. Both sides of a neck land on one line, so the neck has no width and the bodies read as apart; every
// other anchor stays on its body's circle at its own angle. mix(beads(mats), pose(mats), u) grows the necks back.
export function beads(drawing, bs, necks) {
  const at = (q, k) => Math.hypot(q[0] - bs[k].c[0], q[1] - bs[k].c[1]);
  const neckOf = (x, y) => necks.find(([a, b]) => (a === x && b === y) || (a === y && b === x));
  const plan = drawing.paths.map((p, i) => {
    const ks = bs.map((b, k) => (!b.paths || b.paths.includes(i) ? k : -1)).filter((k) => k >= 0);
    // first pass: on its body's circle, or in the neck whose two bodies hold it most evenly
    const plan = p.pts.map((q, j) => {
      if (p.owner[j] !== j) return null;
      const w = ks.map((k) => at(q, k) ** -4), s = w.reduce((a, b) => a + b, 0), wk = (k) => (ks.includes(k) ? w[ks.indexOf(k)] / s : 0);
      const k = ks[w.indexOf(Math.max(...w))], round = { k, ang: Math.atan2(q[1] - bs[k].c[1], q[0] - bs[k].c[0]) };
      if (Math.abs(at(q, k) - bs[k].r) < 0.05 * bs[k].r || !necks.length) return round;
      const [a, b] = necks.reduce((x, y) => (Math.min(wk(y[0]), wk(y[1])) > Math.min(wk(x[0]), wk(x[1])) ? y : x));
      if (Math.min(wk(a), wk(b)) < 0.02) return round;
      const L0 = Math.hypot(bs[b].c[0] - bs[a].c[0], bs[b].c[1] - bs[a].c[1]), ax = [(bs[b].c[0] - bs[a].c[0]) / L0, (bs[b].c[1] - bs[a].c[1]) / L0];
      const t = clamp((q[0] - bs[a].c[0]) * ax[0] + (q[1] - bs[a].c[1]) * ax[1], bs[a].r, L0 - bs[b].r);
      return { a, b, u: (t - bs[a].r) / (L0 - bs[a].r - bs[b].r), mid: true };
    });
    // second pass: a circle anchor next to a neck of its body, or next to another body's circle across a neck, is that neck's end
    const ends = [...p.starts, p.pts.length];
    for (let n = 0; n + 1 < ends.length; n++) {
      const s = ends[n], e = ends[n + 1], closed = e - s > 3 && Math.hypot(p.pts[s][0] - p.pts[e - 1][0], p.pts[s][1] - p.pts[e - 1][1]) < 1e-6;
      const ring = [];
      for (let j = s; j < (closed ? e - 1 : e); j += 3) ring.push(j);
      const was = ring.map((j) => plan[j]);
      ring.forEach((j, r) => {
        const pl = was[r];
        if (pl.k === undefined) return;
        for (const o of [r - 1, r + 1]) {
          const nb = was[closed ? (o + ring.length) % ring.length : o];
          const nk = !nb ? null : nb.mid ? (nb.a === pl.k || nb.b === pl.k ? [nb.a, nb.b] : null) : nb.k !== pl.k ? neckOf(pl.k, nb.k) : null;
          if (nk) { plan[j] = { a: nk[0], b: nk[1], u: nk[0] === pl.k ? 0 : 1 }; return; }
        }
      });
      if (closed) plan[e - 1] = plan[s];
    }
    return plan;
  });
  const circleOf = (pl) => (pl.k !== undefined ? pl.k : pl.u === 0 ? pl.a : pl.u === 1 ? pl.b : -1);
  return (mats) => {
    const cur = bs.map((b, k) => ({ c: M.apply(mats[k], b.c), r: b.r * Math.sqrt(Math.abs(mats[k][0] * mats[k][3] - mats[k][1] * mats[k][2])) }));
    const place = (pl) => {
      if (pl.k !== undefined) return [cur[pl.k].c[0] + cur[pl.k].r * Math.cos(pl.ang), cur[pl.k].c[1] + cur[pl.k].r * Math.sin(pl.ang)];
      const A = cur[pl.a], B = cur[pl.b], L = Math.hypot(B.c[0] - A.c[0], B.c[1] - A.c[1]) || 1, ax = [(B.c[0] - A.c[0]) / L, (B.c[1] - A.c[1]) / L];
      const t = A.r + pl.u * (L - A.r - B.r);
      return [A.c[0] + ax[0] * t, A.c[1] + ax[1] * t];
    };
    return drawing.paths.map((p, i) => {
      const pts = p.pts.map((q, j) => (plan[i][j] ? place(plan[i][j]) : null));
      for (let j = 1; j + 2 < pts.length; j += 3) {
        const P0 = pts[j - 1], P3 = pts[j + 2], k = circleOf(plan[i][j - 1]);
        if (k >= 0 && k === circleOf(plan[i][j + 2])) {
          const { c, r } = cur[k], t0 = Math.atan2(P0[1] - c[1], P0[0] - c[0]), t3 = Math.atan2(P3[1] - c[1], P3[0] - c[0]);
          const dl = Math.atan2(Math.sin(t3 - t0), Math.cos(t3 - t0)), h = (4 / 3) * Math.tan(dl / 4) * r;
          pts[j] = [P0[0] - h * Math.sin(t0), P0[1] + h * Math.cos(t0)];
          pts[j + 1] = [P3[0] + h * Math.sin(t3), P3[1] - h * Math.cos(t3)];
        } else {
          pts[j] = [P0[0] + (P3[0] - P0[0]) / 3, P0[1] + (P3[1] - P0[1]) / 3];
          pts[j + 1] = [P0[0] + (2 * (P3[0] - P0[0])) / 3, P0[1] + (2 * (P3[1] - P0[1])) / 3];
        }
      }
      return pts;
    });
  };
}
// mix(a, b, u): point lists a and b blended, u from 0 (a) to 1 (b)
export const mix = (a, b, u) => a.map((pts, i) => pts.map((q, j) => [q[0] + (b[i][j][0] - q[0]) * u, q[1] + (b[i][j][1] - q[1]) * u]));
const put = (d, pts) => { const flat = pts.flat(); let j = 0; return d.replace(NUM, () => fmt(flat[j++])); };
// frames(drawing, pose, opts): pose(t) → point lists, sampled at fps for dur seconds into out/frame-NNN.svg.
// The last frame is the source itself (and the first too, for a loop). dress(t, svg) may edit a frame's text (viewBox, dashes).
export function frames(drawing, pose, { dur, fps = 60, out, critical = "", loop = false, dress = (t, s) => s }) {
  mkdirSync(out, { recursive: true });
  const n = Math.round(dur * fps), all = [];
  for (let f = 0; f <= n; f++) {
    const rest = f === n || (loop && f === 0), ds = rest ? drawing.paths.map((p) => p.d) : pose(f / fps).map((pts, i) => put(drawing.paths[i].d, pts));
    let k = 0;
    const text = drawing.svg.replace(/\sd="([^"]*)"/g, () => ` d="${ds[k++]}"`);
    writeFileSync(join(out, `frame-${String(f).padStart(3, "0")}.svg`), rest ? text : dress(f / fps, text));
    all.push(ds);
  }
  writeFileSync(join(out, "critical.txt"), critical);
  return all;
}
// smil(drawing, all, { dur, loop }): the source with one <animate attributeName="d"> per moving path, linear between the
// dense frames, begin="indefinite" so the page decides when; a loop repeats, an entrance freezes on its last frame (the source)
export function smil(drawing, all, { dur, loop = false, begin = "indefinite" }) {
  const kt = all.map((_, f) => fmt(f / (all.length - 1))).join(";");
  let k = 0;
  return drawing.svg.replace(/<path\b((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g, (all0, attrs, self) => {
    const i = k++, values = all.map((ds) => ds[i]);
    if (values.every((v) => v === values[0])) return all0;
    const anim = `<animate attributeName="d" begin="${begin}" dur="${dur}s" ${loop ? 'repeatCount="indefinite"' : 'fill="freeze"'} calcMode="linear" keyTimes="${kt}" values="${values.join(";")}" />`;
    return self ? `<path${attrs}>${anim}</path>` : `<path${attrs}>${anim}`;
  });
}
// live(drawing, bones, necks): the same rig as browser code, for an interaction. It defines M, the rig, the drawing, the
// bones, pose(mats), and d(i, pts), the text of a posed path. Paste it at the top of the interaction's factory.
export function live(drawing, bs, necks = []) {
  const lean = drawing.paths.map(({ d, pts, owner }) => ({ d, pts, owner }));
  return [`const M = { ${Object.entries(M).map(([k, f]) => `${k}: ${f}`).join(", ")} }, clamp = ${clamp}, fmt = ${fmt}, NUM = ${NUM};`, `const put = ${put};`, `${rig}`,
    `const drawing = { paths: ${JSON.stringify(lean)} }, bones = ${JSON.stringify(bs)}, pose = rig(drawing, bones, ${JSON.stringify(necks)});`,
    "const d = (i, pts) => put(drawing.paths[i].d, pts);"].join("\n");
}
```

## Parts to whole

**Role:** entrance.

**When the drawing has:** bodies fused into one shape — lobes, beads, a chain
whose outline runs through necks.

**The story:** the pieces arrive on their own, then find each other.

**The recipe:** every body grows from a seed in reading order, apart, its
necks at width zero (`beads`); then the necks link (`mix` toward the rig).
Each body has its own spring, so they land at their own moments.

```js parts.mjs
// Parts to whole: the bodies grow from seeds one after another, apart, with their necks at width zero; then the necks link.
import { load, bones, rig, beads, mix, frames, smil, spring, M, ease, curves } from "./kit.mjs";
import { writeFileSync } from "node:fs";
const [norm, out] = process.argv.slice(2);
const d = load(norm), bs = bones(d), necks = d.inv.necks.map((n) => n.between), pose = rig(d, bs, necks), apart = beads(d, bs, necks);
const order = bs.map((_, k) => k).sort((a, b) => bs[a].c[0] - bs[b].c[0]), dur = 1.3, easeOut = ease(curves.out);
// each body's scale from its own spring, from a seed at 0.3, started 90 ms after the one before it in reading order
const STEP = 1 / 240, grow = bs.map((_, k) => { const s = spring(260, 18, 0.3), at = []; for (let t = 0; t <= dur; t += STEP) at.push(t < order.indexOf(k) * 0.09 ? 0.3 : s.step(1, STEP)); return at; });
// the necks link from 0.45 s over 0.6 s
const link = (t) => easeOut(Math.min(1, Math.max(0, (t - 0.45) / 0.6)));
const motion = (t) => bs.map((b, k) => M.scale(b.c, grow[k][Math.min(grow[k].length - 1, Math.round(t / STEP))]));
const all = frames(d, (t) => { const m = motion(t); return mix(apart(m), pose(m), link(t)); }, { dur, out, critical: "region 4 6 66 38\n006 012 018 030 036 042 076 077 078\n" });
writeFileSync(`${out}.svg`, smil(d, all, { dur }));
console.log(all.length, "frames");
```

**The numbers:** 1.3 s. Seeds at scale 0.3 on springs (260, 18); 90 ms
between bodies; the link from 0.45 s over 0.6 s on the out curve. A loose
part counts as a body and takes its turn.

**What goes wrong:** the necks drawn as the two circles' tangent turn into
teardrops while the bodies are small; beads put both sides of a neck on one
line, so a neck is either there or not. A neck anchor sent to the wrong
neck draws a wedge or a bar across a body: an anchor goes to the neck whose
two bodies hold it most evenly, and a circle anchor next to a neck becomes
that neck's end. Look at the zoom at the link's first frames.

## Origin

**Role:** entrance.

**When the drawing has:** a loose part the rest could grow from — a dot, a
spark, a seed.

**The story:** everything comes out of the one small thing.

**The recipe:** the loose part appears first, from scale 0.6 with its
opacity, on the overshoot curve; the rest grows out of it, every body from a
seed at the loose part's centre to its place, the necks linking as in Parts
to whole. Nothing starts at scale 0: a seed is a small visible body.

**The numbers:** 1.28 s. The seed's arrival on `0.34 1.56 0.64 1`, the
growth on `0.22 1 0.36 1`. Seeds at radius 5 (in a 24- to 70-unit viewBox).

**What goes wrong:** `scale(0)` reads as a pop, not a birth; start from a
seed you can see. A growth that leaves from the loose part's corner instead
of its centre looks thrown, not grown.

## Gather

**Role:** entrance.

**When the drawing has:** many parts and a centre they share — a burst, a
grid, a logo of separate marks.

**The story:** scattered parts are pulled into their places.

**The recipe:** every part starts out along the ray from the centre through
its own centre, turned a little, and arrives in a sweep that overshoots by a
few degrees and settles. A "big bang" is the same move outward first: from
seeds at the centre, explode, then settle.

**The numbers:** 1.5 s. Explode over the first half, settled by 0.92. The
whole turns −70° → 3° → 0°. Seeds at radius 5. A loose part trails by 75 ms.

**What goes wrong:** parts that all arrive at once read as a fade; let the
distance set the arrival, the far ones last. A rotation that does not
overshoot looks mechanical.

## Goo

**Role:** entrance.

**When the drawing has:** bodies that meet — circles that touch, lobes that
fuse.

**The story:** drops that run together.

**The recipe:** the bodies arrive as circles under an SVG goo filter, a blur
then an alpha threshold, so they melt into each other as they meet; the blur
goes down to zero while the circles morph into the drawing's own paths, and
when it is at zero the filter is removed. The last frame is the source with
no filter at all.

**The numbers:** 2.4 s. The bodies 95 ms apart. Blur 10 → 0 by 0.98; the
filter off at 0.99. The circles are the paths' own points placed on circles,
morphed to the source within the first 0.4.

**What goes wrong:** a filter left on at rest softens every edge of the mark
forever; it must reach σ = 0 and then go. A crossfade from circles to the
paths shows two shapes at once; morph the same points.

## Relink

**Role:** entrance, loop.

**When the drawing has:** a chain whose links could join differently — two
rows, two strands, a knot.

**The story:** the links let go and take each other's hands again.

**The recipe:** the necks part (the bodies become beads), the chain swaps
partners through a moment where every body is a bead, and the necks link
again. Two chains overlap at the bead moments, so the motion never stops.
A light goo hides the frames where the outline is thinnest.

**The numbers:** 2.2 s on the in-out curve. Phases: part 0.05–0.23, cross
0.37–0.49, part again 0.57–0.68, link 0.80–0.93. Goo σ 0 → 5 → 0.

**What goes wrong:** relinking through a swap of paths flickers; every frame
is one structure, morphed. Without the overlap the loop pauses at the beads
and reads as two animations.

## Drop

**Role:** entrance.

**When the drawing has:** a floor under filled bodies — a mark that sits on a
line, a stack, a row.

**The story:** it falls, lands, squashes, and a second bounce settles it.

**The recipe:** simulate the fall once at a fixed step: gravity, restitution
at the floor, and a squash spring kicked by the impact speed, scaling from
the point on the floor and keeping the area. A body on top hangs from the set
on its own spring, so it keeps falling when the set stops; a loose part falls
on its own, a beat later.

```js drop.mjs
// Drop: the set falls onto its floor and squashes, the top body lands late, the loose part lands a beat after.
import { load, bones, rig, frames, smil, spring, M } from "./kit.mjs";
import { writeFileSync } from "node:fs";
const [norm, out] = process.argv.slice(2);
const d = load(norm), bs = bones(d), pose = rig(d, bs, d.inv.necks.map((n) => n.between));
// the set is the path with the most bodies; every other body is loose. The floor is the set's lowest point.
const count = (i) => bs.filter((b) => b.paths[0] === i).length, setPath = d.paths.map((_, i) => i).sort((a, b) => count(b) - count(a))[0];
const set = bs.filter((b) => b.paths[0] === setPath), floor = Math.max(...set.map((b) => b.c[1] + b.r));
const base = [set.reduce((x, b) => x + b.c[0], 0) / set.length, floor], H = 40, g = 2600, e = 0.32;
// simulate once at a fixed step, sample by time: a fall with restitution e, a squash spring kicked at each impact
const STEP = 1 / 240, sim = [];
{
  let y = -H, v = 0, dotY = -H * 0.8, dotV = 0;
  const sq = spring(380, 15), dsq = spring(380, 15), top = spring(220, 16, -H);
  for (let t = 0; t <= 1.6; t += STEP) {
    v += g * STEP; y += v * STEP;
    if (y > 0) { y = 0; sq.set(sq.x, sq.v + v * 0.0011); v = Math.abs(v) > 60 ? -v * e : 0; }
    if (t > 0.1) { dotV += g * STEP; dotY += dotV * STEP; if (dotY > 0) { dotY = 0; dsq.set(dsq.x, dsq.v + dotV * 0.0011); dotV = Math.abs(dotV) > 60 ? -dotV * e : 0; } }
    sq.step(0, STEP); dsq.step(0, STEP);
    // the top body hangs from the set on a spring: it keeps falling when the set stops
    top.step(y, STEP);
    sim.push({ y, s: sq.x, b: top.x - y, dy: t > 0.1 ? dotY : -H * 0.8, ds: dsq.x });
  }
}
const at = (t) => sim[Math.min(sim.length - 1, Math.round(t / STEP))];
// squash keeps the area: 1 + s/2 wide for 1 − s tall, from the point on the floor
const squash = (s, c) => M.scale(c, 1 + 0.5 * s, 1 - s);
const motion = (t) => {
  const { y, s, b, dy, ds } = at(t);
  return bs.map((bone) => {
    if (bone.paths[0] !== setPath) return M.mul(M.move(0, dy), squash(ds, [bone.c[0], bone.c[1] + bone.r]));
    const fall = M.mul(M.move(0, y), squash(s, base));
    return bone.c[1] + bone.r < floor - 0.5 ? M.mul(fall, M.move(0, b)) : fall;
  });
};
const all = frames(d, (t) => pose(motion(t)), { dur: 1.4, out, critical: "region 4 0 66 44\n016 017 018 019 020 021 082 083 084\n" });
writeFileSync(`${out}.svg`, smil(d, all, { dur: 1.4 }));
console.log(all.length, "frames");
```

**The numbers:** 1.4 s. Height 40, g 2600, restitution 0.32. Squash spring
(380, 15) kicked by v · 0.0011. The top body on (220, 16). The loose part
0.1 s late.

**What goes wrong:** a top body that moves with the set looks glued: give it
its own spring and it lands late. A squash from the centre lifts the floor;
squash from the point on the floor. Every frame passed `check` while the top
body was glued; the sheet showed it.

## Pulse

**Role:** loop.

**When the drawing has:** a path for something to travel — necks between
bodies, a stroke, a row.

**The story:** a breath goes through it, end to end, and rests.

**The recipe:** a swell crosses the chain in reading order; each body grows
and shrinks on the in-out curve as the swell passes, the necks thickening
between them. Then stillness: a loop that never rests is noise.

```js pulse.mjs
// Pulse: a swell travels the chain from one end to the other, through the necks, then rests. A loop.
import { load, bones, rig, frames, smil, M, ease, curves } from "./kit.mjs";
import { writeFileSync } from "node:fs";
const [norm, out] = process.argv.slice(2);
const d = load(norm), bs = bones(d), pose = rig(d, bs, d.inv.necks.map((n) => n.between));
// the chain is the path with the most bodies, read left to right
const count = (i) => bs.filter((b) => b.paths[0] === i).length, setPath = d.paths.map((_, i) => i).sort((a, b) => count(b) - count(a))[0];
const chain = bs.map((_, k) => k).filter((k) => bs[k].paths[0] === setPath).sort((a, b) => bs[a].c[0] - bs[b].c[0] || bs[a].c[1] - bs[b].c[1]);
// 2.4 s: the wave crosses in 1.5 s, the rest is stillness
const dur = 2.4, travel = 1.5, inOut = ease(curves.inOut);
const swell = (t, k) => {
  const t0 = (chain.indexOf(k) / chain.length) * travel * 0.6, u = (t - t0) / (travel * 0.55);
  return u <= 0 || u >= 1 ? 0 : 0.12 * Math.sin(Math.PI * inOut(u));
};
const motion = (t) => bs.map((b, k) => (chain.includes(k) ? M.scale(b.c, 1 + swell(t, k)) : M.id()));
const all = frames(d, (t) => pose(motion(t)), { dur, out, loop: true, critical: "region 4 6 66 38\n010 020 030 040 050 060\n" });
writeFileSync(`${out}.svg`, smil(d, all, { dur, loop: true }));
console.log(all.length, "frames");
```

**The numbers:** 2.4 s: the wave in 1.5 s, 0.9 s of rest. Swell 0.12 of a
body's size; each body starts 0.6 · 1.5 / n after the one before it. On a
smaller mark: lobe + 8 % radius and 5 units up, neck + 20 %, 1.7 s of wave
and 0.7 s of rest.

**What goes wrong:** a pulse with no rest reads as a loader; a loop is a
gesture and a pause. A first and last frame that differ flash once a cycle:
build with `loop: true` and check with `--loop`.

## Pendulum

**Role:** entrance, loop.

**When the drawing has:** a natural hinge or pivot — a hanging part, a
pin, a corner something swings from.

**The story:** it is set down, and the hanging part swings to rest.

**The recipe:** the set appears with a short scale and opacity, from its own
centre; the hanging part swings around the pivot, a damped swing that
overshoots each way less, and arrives a beat after the set.

**The numbers:** the set 420 ms on the out curve from scale 0.96 with
opacity. The swinging part 1100 ms, 160 ms late, rotating 40° → −7° → 2.5° →
0° around the pivot.

**What goes wrong:** a pivot at the part's centre makes it spin, not swing;
find where it hangs from. A swing wide enough to leave the viewBox is
clipped: check the extremes on the sheet.

## Camera

**Role:** entrance.

**When the drawing has:** geometry worth travelling along — a long mark, a
detail worth a close-up, a path that leads somewhere.

**The story:** the frame moves, not the drawing.

**The recipe:** animate the `viewBox`: start on a detail, close, and pull out
to the whole drawing in one in-out move. The drawing's own paths do not
move. Use `frames` with a `dress` that rewrites the viewBox, and keep the
aspect ratio of the source in every frame.

**The numbers:** 1.1 s on `0.77 0 0.175 1`.

**What goes wrong:** a viewBox whose aspect ratio changes stretches the mark
on the way out. A start too close shows nothing recognisable; start where
one feature is already readable.

## Magnet

**Role:** interaction.

**When the drawing has:** bodies that can be pulled — circles, lobes, beads.

**The story:** the drawing notices the pointer.

**The recipe:** every body leans toward the pointer on its own spring, the
nearest one swells, and the necks follow through the rig. The pull
saturates, so the mark is never torn apart; the reach is a few body radii.
When the pointer leaves, the springs bring everything home and the loop
sleeps, every path back to its exact source `d`. The build writes the
factory a card or a keep registers: `interactions[name] = (svg) => ({ point(p) })`,
with `p` in viewBox units or `null`.

```js magnet.mjs
// Magnet: every body leans toward the pointer on its own spring, the nearest one swells, the necks follow. Writes the factory a gallery card or a keep registers.
import { load, bones, live } from "./kit.mjs";
import { writeFileSync } from "node:fs";
const [norm, out, name = "Magnet"] = process.argv.slice(2);
const dr = load(norm), bs = bones(dr);
writeFileSync(out, `interactions[${JSON.stringify(name)}] = (svg) => {
${live(dr, bs, dr.inv.necks.map((n) => n.between))}
  const els = [...svg.querySelectorAll("path")], rest = els.map((p) => p.getAttribute("d"));
  const K = 220, C = 16, STEP = 1 / 120, state = bones.map(() => [0, 0, 0, 0, 0, 0]);
  let ptr = null, raf = 0, last = 0;
  // the pull toward the pointer, saturating at 0.38 r; the nearest body swells by up to 0.07 r
  const target = (b) => {
    if (!ptr) return [0, 0, 0];
    const vx = ptr.x - b.c[0], vy = ptr.y - b.c[1], dist = Math.hypot(vx, vy) || 1;
    const m = 0.16 * dist * Math.exp(-((dist / (4.5 * b.r)) ** 2)), s = m / Math.hypot(1, m / (0.38 * b.r));
    return [(vx / dist) * s, (vy / dist) * s, 0.07 * b.r * Math.exp(-((dist / (1.9 * b.r)) ** 2))];
  };
  function tick(now) {
    let dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const tg = bones.map(target);
    for (; dt > 1e-6; dt -= STEP) {
      const h = Math.min(STEP, dt);
      for (const [k, s] of state.entries()) for (let j = 0; j < 3; j++) { s[3 + j] += (K * (tg[k][j] - s[j]) - C * s[3 + j]) * h; s[j] += s[3 + j] * h; }
    }
    if (ptr || state.some((s) => s.some((v) => Math.abs(v) > 0.01))) {
      const posed = pose(bones.map((b, k) => M.mul(M.move(state[k][0], state[k][1]), M.scale(b.c, 1 + state[k][2] / b.r))));
      posed.forEach((pts, i) => els[i].setAttribute("d", d(i, pts)));
      raf = requestAnimationFrame(tick);
    } else {
      // asleep: back to the exact source
      for (const s of state) s.fill(0);
      els.forEach((p, i) => p.setAttribute("d", rest[i]));
      raf = 0;
    }
  }
  return { point(p) { ptr = p; if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } } };
};
`);
```

An interaction has no frames of its own. `probe.mjs` drives any factory
along the gallery's Demonstrate path, without a browser, and writes what it
draws as frames, so `frames` and `check` see an interaction like any other
proposal: `node magnet.mjs norm magnet.js`, then
`node probe.mjs norm magnet.js magnet Magnet`. The last frame is the sleeping
drawing, so `check` holds it to the source.

```js probe.mjs
// probe <norm-dir> <factory.js> <out-dir> [name]: drive an interaction's factory without a browser, along the gallery's
// Demonstrate path (a pointer crossing the drawing in an S for 1.8 s, then leaving), and write what it draws as frames.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const [norm, file, out, name = "Magnet"] = process.argv.slice(2);
const svg = readFileSync(join(norm, "source.svg"), "utf8"), [x, y, w, h] = JSON.parse(readFileSync(join(norm, "inventory.json"), "utf8")).viewBox;
// a page with paths that hold a d, a clock, and a frame queue pumped by hand
const els = [...svg.matchAll(/\sd="([^"]*)"/g)].map(([, d]) => ({ d, getAttribute() { return this.d; }, setAttribute(_, v) { this.d = v; } }));
const interactions = {}, queue = [];
let now = 0;
new Function("interactions", "requestAnimationFrame", "performance", readFileSync(file, "utf8"))(interactions, (f) => queue.push(f), { now: () => now });
const live = interactions[name]({ querySelectorAll: () => els });
mkdirSync(out, { recursive: true });
const write = (f) => { let k = 0; writeFileSync(join(out, `frame-${String(f).padStart(3, "0")}.svg`), svg.replace(/\sd="([^"]*)"/g, () => ` d="${els[k++].d}"`)); };
write(0);
let f = 1;
for (; f <= 108; f++) {
  const u = f / 108;
  live.point(u < 1 ? { x: x - 0.2 * w + 1.4 * w * u, y: y + h / 2 - 0.35 * h * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * u) } : null);
  now += 1000 / 60;
  for (const tick of queue.splice(0)) tick(now);
  write(f);
}
// after the pointer leaves: until the loop sleeps, at most three more seconds
for (; queue.length && f < 288; f++) {
  now += 1000 / 60;
  for (const tick of queue.splice(0)) tick(now);
  write(f);
}
writeFileSync(join(out, "critical.txt"), [27, 54, 81, f - 3, f - 2, f - 1].map((n) => String(n).padStart(3, "0")).join(" ") + "\n");
console.log(f, "frames", queue.length ? "still moving" : "asleep");
```

**The numbers:** springs (220, 16) stepped at 1/120 s. The pull saturates at
0.38 r; its reach is 4.5 r. The swell is 0.07 r with a reach of 1.9 r.

**What goes wrong:** a pull tied straight to the pointer, with no spring,
feels artificial. A loop that keeps running after the pointer leaves costs a
frame forever; sleep, and restore the exact `d` so the rest state is the
source, not a near copy of it.

## Draw

**Role:** entrance.

**When the drawing has:** strokes, in the order a hand would draw them.

**The story:** someone draws it.

**The recipe:** each stroke reveals itself with `stroke-dasharray` and
`stroke-dashoffset`, in the inventory's stroke order, each starting a little
before the last one ends. Use `frames` with a `dress` that writes the dashes;
the path lengths come from sampling the cubics. The last frame has no dashes.

**The numbers:** about 1.2 s for an icon, each stroke's share by its length,
on the out curve, each overlapping the one before by a third.

**What goes wrong:** strokes drawn backwards, or all at once, read as a
wipe. A fill that pops in at the end is a swap; let the outline finish and
the fill rise with opacity, or leave fills out of a Draw.

## Rig

**Role:** loop, interaction.

**When the drawing has:** groups with a hierarchy — a figure, a face, a
scene of named parts.

**The story:** it is alive: it breathes, looks, reacts.

**The recipe:** one bone per group at its anchor (a torso at its base, a
head at its neck); a child's matrix is its parent's times its own, so a
breath of the body carries the head. A loop is a breath; an interaction is
a look toward the pointer on springs, as in Magnet.

**The numbers:** a breath of 2.4 s: 1.6 s of wave, 0.8 s of rest, scale a
few percent from the base. Looks on springs (220, 16).

**What goes wrong:** every group breathing alike reads as a zoom; the
children lag their parent a little. A bone at a group's centre lifts it off
the floor: anchor it where it rests.

## Verb

**Role:** interaction.

**When the drawing has:** an icon that depicts an action — a bell, a paper
plane, a lock, a trash can.

**The story:** it does what it says, once.

**The recipe:** play the verb: a bell rings, a plane leaves and comes back,
a lock's shackle drops, a can's lid lifts. A rigid part turns or moves
around its own hinge; a part hanging from it answers late. The card plays it
on hover or press, so it is short.

```js ring.mjs
// Ring on the bell: the bell swings on its hinge and dies out; the clapper hangs from the same hinge and answers 50 ms late.
import { load, frames, smil, M } from "./kit.mjs";
import { writeFileSync } from "node:fs";
const [norm, out] = process.argv.slice(2);
const d = load(norm), hinge = [12, 2], dur = 0.9;
// no bodies here: one bone per part, both on the hinge, so each part turns rigidly
const swing = (t) => (t <= 0 ? 0 : 10 * Math.exp(-4.2 * t) * Math.sin(2 * Math.PI * 3.2 * t));
const pose = (t) => d.paths.map((p, i) => { const m = M.rotate(hinge, swing(i === 0 ? t - 0.05 : t)); return p.pts.map((q) => M.apply(m, q)); });
const all = frames(d, pose, { dur, out, critical: "008 016 024 052 053 054\n" });
writeFileSync(`${out}.svg`, smil(d, all, { dur }));
console.log(all.length, "frames");
```

**The numbers:** ring 0.9 s: the swing is `10 · e^(−4.2 t) · sin(2π · 3.2 t)`
degrees around the hinge, the clapper 50 ms late.

**What goes wrong:** at 14° the bell left the viewBox and was clipped; 10°
reads as the same ring and stays inside. A hinge at the bell's centre makes
it wobble; the hinge is where it hangs. A verb longer than a second feels
like a wait.
