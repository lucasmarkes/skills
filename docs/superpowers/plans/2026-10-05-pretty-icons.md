# pretty-icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A skill, `skills/pretty-icons`, that draws a set of duotone sidebar icons for an app and proves, by measurement and a blind read, that they sit even in a row.

**Architecture:** Six self-contained ES modules in the skill folder. `presets.mjs` holds the three grids and derives body geometry from keylines; `svg.mjs` parses an icon file into elements; `geometry.mjs` samples element centrelines for gap and bounds; `raster.mjs` renders with `@resvg/resvg-js` from a cache folder and measures ink box, centre of mass and ink; `check.mjs` runs the text rules and the measured rules over a folder as one set; `sheet.mjs` composes the author's and the blind sheets; `emit.mjs` converts a passing set into the app's format. `SKILL.md`, `rules.md` and `read.md` are the prose, written only after a baseline run has shown what an agent gets wrong without them.

**Tech Stack:** Node ≥ 22 (built-in `node --test`, no runtime dependencies in the repo), `@resvg/resvg-js@2` installed once into the user's cache folder, SVG 1.1.

**Spec:** `docs/superpowers/specs/2026-10-05-pretty-icons-design.md`

## Global Constraints

- Node ≥ 22; the scripts run from any working directory by their path, with no `npm install` in the repo or the working directory.
- The rasteriser is `@resvg/resvg-js`, installed once into `~/Library/Caches/pretty-icons` (macOS), `%LOCALAPPDATA%\pretty-icons` (Windows), `$XDG_CACHE_HOME/pretty-icons` or `~/.cache/pretty-icons` (elsewhere); `PRETTY_ICONS_CACHE` moves it. Never into the skill or the working directory.
- Grids: 16 (stroke 1.5), 20 (stroke 1.5), 24 (stroke 2). Padding 1 in every grid. Fill opacity 0.2 in every grid.
- Keylines (ink sizes): 16 → circle 14, square 12.5, portrait 11 × 14, landscape 14 × 11. 20 → 18, 16, 14 × 18, 18 × 14. 24 → 22, 20, 18 × 22, 22 × 18.
- Radii: 16 → 1.5 / 1; 20 → 2 / 1; 24 → 2 / 1; the larger for shapes whose smaller side is 8 or more.
- Tolerances: keyline ±0.5 per side; weight ±15% of the set's median; gravity 0.5 unit per axis; grid step 0.25; gap at least one stroke outer edge to outer edge, or touching within 0.1; "almost" is anything between.
- Measures at 32×, black on transparent, a pixel is ink at alpha > 5%, ink = Σ alpha / 32² in canvas units².
- Allowed elements: `rect`, `circle`, `line`, `path`. Nothing else, no `g`, no `transform`, no `style`.
- Every failure line is `rule  icon  measured → expected`. Exit 1 on failure, 0 on `ok`, 2 when the rasteriser cannot be had (`not measured` is the last line).
- Prose files are in English, in the voice of `hairline/skills/hairline-create` (short sentences, rules with "Keep it" and "Rejected when").
- Commits: one per task, `type: subject` in lower case, as the two spec commits are.

## Review Focus

Inputs the spec implies but no task's tests exercised at planning time; each line's test was then added to the task named.

1. An SVG whose root has `width`/`height` but a `viewBox` with an origin other than `0 0`, or with `fill="none"` set on the root instead of each line — `canvas` and `construction` must still judge it, not crash. → Task 3.
2. A `path` with relative commands and an arc (`a`), as Lucide draws most icons — `geometry.mjs` must sample it correctly or `gap` lies. → Task 4.
3. A folder with one icon — `weight` has no median; it must fall back to the reference value and say so, not divide by zero or pass silently. → Task 6.
4. Two elements whose centrelines cross (a tick through a circle) — `gap` must count that as touching, not as "almost". → Task 6.
5. `emit --as react` with an icon name that is not a valid identifier (`2fa`, `my-icon`) — the component name must be a valid PascalCase identifier or emit must refuse. → Task 8.

---

## File Structure

```
skills/                                   repo root (~/estudos/skills)
  package.json                            "type": "module", scripts.test = node --test test/
  README.md  LICENSE  .gitignore
  skills/pretty-icons/
    SKILL.md  rules.md  read.md           prose (Tasks 10–12)
    presets.mjs                           grids, keylines, body geometry, tolerances (Task 1)
    svg.mjs                               parse one icon file → { attrs, elements } (Task 2)
    geometry.mjs                          sample centrelines; bbox; min distance (Task 4)
    raster.mjs                            cache dir, resvg loader, render, measure (Task 5)
    check.mjs                             text rules (Task 3) + measured rules, --print, exits (Task 6)
    sheet.mjs                             author sheet + blind sheet + key (Task 7)
    emit.mjs                              svg | react | sprite (Task 8)
    examples/hairline/*.svg               the corrected ten (Task 9)
  test/pretty-icons/
    fixtures/hairline-before/*.svg        the current ten (Task 3)
    fixtures/lucide/*.svg                 ten Lucide icons at 24 (Task 9)
    fixtures/good-16/*.svg                a synthetic set that passes every rule (Task 6)
    presets.test.mjs  svg.test.mjs  check-text.test.mjs  geometry.test.mjs
    raster.test.mjs  check.test.mjs  sheet.test.mjs  emit.test.mjs  examples.test.mjs
  docs/superpowers/{specs,plans}/
```

Every script exports its functions and runs `main()` only when it is the entry point, so tests import functions and never spawn Node:

```js
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

---

### Task 1: Repo scaffold and `presets.mjs`

**Files:**
- Create: `package.json`, `README.md`, `LICENSE`, `.gitignore`
- Create: `skills/pretty-icons/presets.mjs`
- Test: `test/pretty-icons/presets.test.mjs`

**Interfaces:**
- Produces: `PRESETS` (object keyed by grid), `preset(G)` → `{ G, stroke, pad, live, fill, radius: [big, small], keylines: { circle: [w,h], square, portrait, landscape } }` or throws `Error("no preset for grid N")`; `body(G, format)` → `{ tag: "circle", cx, cy, r }` or `{ tag: "rect", x, y, w, h, rx }`; `radiusFor(G, size)` → number; constants `KEYLINE_TOL = 0.5`, `WEIGHT_TOL = 0.15`, `GRAVITY_TOL = 0.5`, `GRID_STEP = 0.25`, `TOUCH = 0.1`, `SCALE = 32`, `INK_ALPHA = 0.05`, `RADIUS_AT = 8`.

- [ ] **Step 1: Scaffold the repo**

```bash
cd ~/estudos/skills
cat > package.json <<'EOF'
{
  "name": "@lucasmarkes/skills",
  "private": true,
  "type": "module",
  "description": "Skills for coding agents, each one a command away.",
  "engines": { "node": ">=22" },
  "scripts": { "test": "node --test test/" },
  "repository": { "type": "git", "url": "git+https://github.com/lucasmarkes/skills.git" },
  "license": "MIT"
}
EOF
cat > .gitignore <<'EOF'
node_modules/
pretty-icons/
*.png
.DS_Store
EOF
cat > README.md <<'EOF'
# skills

Skills for coding agents, each one a command away. Install with the skills CLI and it asks which:

    npx skills add lucasmarkes/skills

| Skill | What it is for |
| --- | --- |
| `pretty-icons` | A set of sidebar icons for your app, drawn in one duotone style and measured so they sit even in a row. |

Each skill is a folder under `skills/` with a `SKILL.md` and the scripts it runs. Nothing here needs `npm install`; the scripts fetch what they need once, into your cache folder.

`hairline-create` lives in [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline), beside its engine.
EOF
cp ~/estudos/hairline/LICENSE LICENSE
mkdir -p skills/pretty-icons test/pretty-icons/fixtures
```

- [ ] **Step 2: Write the failing test**

`test/pretty-icons/presets.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESETS, preset, body, radiusFor, KEYLINE_TOL, WEIGHT_TOL, GRAVITY_TOL } from "../../skills/pretty-icons/presets.mjs";

test("three grids, padding 1, fill .2", () => {
  assert.deepEqual(Object.keys(PRESETS).map(Number), [16, 20, 24]);
  for (const G of [16, 20, 24]) {
    const p = preset(G);
    assert.equal(p.pad, 1);
    assert.equal(p.fill, 0.2);
    assert.equal(p.live, G - 2);
  }
  assert.equal(preset(16).stroke, 1.5);
  assert.equal(preset(24).stroke, 2);
});

test("keylines are the spec's", () => {
  assert.deepEqual(preset(16).keylines, { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] });
  assert.deepEqual(preset(20).keylines, { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] });
  assert.deepEqual(preset(24).keylines, { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] });
});

test("body geometry sits half a stroke inside its keyline", () => {
  assert.deepEqual(body(16, "portrait"), { tag: "rect", x: 3.25, y: 1.75, w: 9.5, h: 12.5, rx: 1.5 });
  assert.deepEqual(body(16, "circle"), { tag: "circle", cx: 8, cy: 8, r: 6.25 });
  assert.deepEqual(body(24, "square"), { tag: "rect", x: 3, y: 3, w: 18, h: 18, rx: 2 });
  assert.deepEqual(body(24, "landscape"), { tag: "rect", x: 2, y: 4, w: 20, h: 16, rx: 2 });
});

test("radius by size", () => {
  assert.equal(radiusFor(16, 9.5), 1.5);
  assert.equal(radiusFor(16, 4.5), 1);
  assert.equal(radiusFor(24, 8), 2);
  assert.equal(radiusFor(24, 7.75), 1);
});

test("unknown grid throws", () => {
  assert.throws(() => preset(18), /no preset for grid 18/);
});

test("tolerances", () => {
  assert.equal(KEYLINE_TOL, 0.5);
  assert.equal(WEIGHT_TOL, 0.15);
  assert.equal(GRAVITY_TOL, 0.5);
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node --test test/pretty-icons/presets.test.mjs`
Expected: FAIL, `Cannot find module .../presets.mjs`

- [ ] **Step 4: Write `presets.mjs`**

```js
/**
 * The three grids pretty-icons draws on, and what each one fixes: stroke,
 * padding, fill, radii, and the four keylines an icon's ink lands on. A body
 * for a keyline is derived here, so the agent copies geometry instead of
 * inventing it: a rect's edge sits half a stroke inside the keyline, a
 * circle's radius is half the keyline less half a stroke.
 */
export const PRESETS = {
  16: { stroke: 1.5, radius: [1.5, 1], keylines: { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] } },
  20: { stroke: 1.5, radius: [2, 1], keylines: { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] } },
  24: { stroke: 2, radius: [2, 1], keylines: { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] } },
};

export const PAD = 1;
export const FILL = 0.2;
export const KEYLINE_TOL = 0.5;
export const WEIGHT_TOL = 0.15;
export const GRAVITY_TOL = 0.5;
export const GRID_STEP = 0.25;
export const TOUCH = 0.1;
export const SCALE = 32;
export const INK_ALPHA = 0.05;
export const RADIUS_AT = 8;
export const FORMATS = ["circle", "square", "portrait", "landscape"];

export function preset(G) {
  const p = PRESETS[G];
  if (!p) throw new Error(`no preset for grid ${G}`);
  return { G, pad: PAD, fill: FILL, live: G - 2 * PAD, ...p };
}

/** The radius a shape of this size (its smaller side) takes on this grid. */
export function radiusFor(G, size) {
  const [big, small] = preset(G).radius;
  return size >= RADIUS_AT ? big : small;
}

/** The element whose ink lands exactly on a keyline. */
export function body(G, format) {
  const { stroke, keylines } = preset(G);
  const kl = keylines[format];
  if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
  const [kw, kh] = kl;
  if (format === "circle") return { tag: "circle", cx: G / 2, cy: G / 2, r: kw / 2 - stroke / 2 };
  const w = kw - stroke, h = kh - stroke;
  return { tag: "rect", x: (G - kw) / 2 + stroke / 2, y: (G - kh) / 2 + stroke / 2, w, h, rx: radiusFor(G, Math.min(w, h)) };
}

/** A body as SVG text, with the duotone fill under its stroke. */
export function bodySvg(G, format) {
  const b = body(G, format);
  const fill = `fill="currentColor" fill-opacity="${FILL}"`;
  return b.tag === "circle"
    ? `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" ${fill} />`
    : `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}" ${fill} />`;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/pretty-icons/presets.test.mjs`
Expected: PASS, 6 tests

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: repo scaffold and pretty-icons presets"
```

---

### Task 2: `svg.mjs`, parse one icon file

**Files:**
- Create: `skills/pretty-icons/svg.mjs`
- Test: `test/pretty-icons/svg.test.mjs`

**Interfaces:**
- Produces: `parse(text)` → `{ attrs: {…root attributes…}, elements: [{ tag, attrs, line }], errors: string[] }`. `errors` holds what the parser could not accept (nested elements, text content, unknown tags, unclosed tags); the caller decides. Numbers stay strings; `num(attrs, name, fallback)` parses one. `G(attrs)` → the grid from `viewBox="0 0 G G"` or `null`.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, num, G } from "../../skills/pretty-icons/svg.mjs";

const ICON = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="2" y="7" width="3" height="6" rx="1" fill="currentColor" fill-opacity=".2" />
  <path d="M8 1.75v2M8 12.25v2" />
</svg>`;

test("root attrs and elements", () => {
  const s = parse(ICON);
  assert.deepEqual(s.errors, []);
  assert.equal(s.attrs.viewBox, "0 0 16 16");
  assert.equal(s.attrs["stroke-width"], "1.5");
  assert.equal(s.elements.length, 2);
  assert.equal(s.elements[0].tag, "rect");
  assert.equal(s.elements[0].attrs["fill-opacity"], ".2");
  assert.equal(s.elements[0].line, 2);
  assert.equal(s.elements[1].attrs.d, "M8 1.75v2M8 12.25v2");
});

test("num and G", () => {
  const s = parse(ICON);
  assert.equal(num(s.elements[0].attrs, "x"), 2);
  assert.equal(num(s.elements[0].attrs, "fill-opacity"), 0.2);
  assert.equal(num(s.elements[0].attrs, "rx", 0), 1);
  assert.equal(num(s.elements[1].attrs, "rx", 0), 0);
  assert.equal(G(s.attrs), 16);
  assert.equal(G({ viewBox: "0 0 24 20" }), null);
  assert.equal(G({ viewBox: "1 1 16 16" }), null);
});

test("what it refuses is reported, not thrown", () => {
  const s = parse(`<svg viewBox="0 0 16 16"><g><rect x="1" y="1" width="2" height="2"/></g><text x="1" y="1">a</text><circle cx="8" cy="8" r="2"/></svg>`);
  assert.ok(s.errors.some((e) => /<g>/.test(e)));
  assert.ok(s.errors.some((e) => /<text>/.test(e)));
  assert.equal(s.elements.length, 2); // rect and circle are still read
});

test("single-quoted attributes and attributes without spaces", () => {
  const s = parse(`<svg viewBox='0 0 16 16'><rect x='1' y="1" width='2'height="2"/></svg>`);
  assert.equal(s.elements[0].attrs.width, "2");
  assert.equal(s.elements[0].attrs.height, "2");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/pretty-icons/svg.test.mjs`
Expected: FAIL, module not found

- [ ] **Step 3: Write `svg.mjs`**

```js
/**
 * Reads one icon file the way check.mjs needs it: the root's attributes and
 * a flat list of its elements. It is not an XML parser. An icon is a flat
 * svg of rect, circle, line and path; anything else is reported in `errors`
 * and left for the caller to reject.
 */
const ATTR = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const TAG = /<(\/?)([\w:-]+)([^>]*?)(\/?)>/g;
export const ELEMENTS = ["rect", "circle", "line", "path"];

function attrsOf(s) {
  const out = {};
  for (const m of s.matchAll(ATTR)) out[m[1]] = m[2] ?? m[3] ?? "";
  return out;
}

export function parse(text) {
  const out = { attrs: {}, elements: [], errors: [] };
  const lineAt = (i) => text.slice(0, i).split("\n").length;
  let open = 0;
  for (const m of text.matchAll(TAG)) {
    const [, close, tag, rest, selfClose] = m;
    if (tag.startsWith("?") || tag.startsWith("!")) continue;
    if (tag === "svg") { if (close) open--; else { open++; out.attrs = attrsOf(rest); if (open > 1) out.errors.push(`line ${lineAt(m.index)}: nested <svg>`); } continue; }
    if (close) continue;
    if (!ELEMENTS.includes(tag)) { out.errors.push(`line ${lineAt(m.index)}: <${tag}> is not one of ${ELEMENTS.join(", ")}`); continue; }
    if (!selfClose) out.errors.push(`line ${lineAt(m.index)}: <${tag}> is not self-closing`);
    out.elements.push({ tag, attrs: attrsOf(rest), line: lineAt(m.index) });
  }
  const stripped = text.replace(TAG, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  if (stripped) out.errors.push(`text outside elements: "${stripped.slice(0, 20)}"`);
  return out;
}

export function num(attrs, name, fallback = NaN) {
  const v = attrs[name];
  if (v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

/** The grid from `viewBox="0 0 G G"`, or null when the box is not square at the origin. */
export function G(attrs) {
  const m = /^\s*0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*$/.exec(attrs.viewBox ?? "");
  return m && m[1] === m[2] ? Number(m[1]) : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/pretty-icons/svg.test.mjs`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: svg.mjs reads an icon's elements"
```

---

### Task 3: `check.mjs`, the text rules, and the `hairline-before` fixture

**Files:**
- Create: `skills/pretty-icons/check.mjs` (text layer, `main` with exit codes; the measured layer comes in Task 6)
- Create: `test/pretty-icons/fixtures/hairline-before/{all,interfaces,data,machines,devices,coding,security,connectivity,empty,marks}.svg`
- Test: `test/pretty-icons/check-text.test.mjs`

**Interfaces:**
- Produces: `textChecks(name, text, expectG)` → `{ G, failures: Failure[], parsed }` where `Failure = { rule, icon, got, want }`; `readSet(folder)` → `[{ name, path, text }]` sorted by name; `formatFailure(f)` → `` `${rule}  ${icon}  ${got} → ${want}` ``; `main(argv)`.
- Rule names (text layer): `canvas`, `elements`, `stroke`, `construction`, `grid`, `radius`, `count`.

- [ ] **Step 1: Write the fixture, the ten current icons**

They are the ten of `hairline/apps/site/components/catalogue.tsx` (lines 23–88), with JSX attribute names turned to SVG ones. Each file's root is the wrapper on line 17 of that file.

```bash
cd ~/estudos/skills && F=test/pretty-icons/fixtures/hairline-before && mkdir -p $F
ROOT='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
FILL='fill="currentColor" fill-opacity=".2"'
w() { printf '%s\n%s\n</svg>\n' "$ROOT" "$2" > $F/$1.svg; }
w all "  <rect x=\"2\" y=\"2\" width=\"5\" height=\"5\" rx=\"1.5\" $FILL />
  <rect x=\"9\" y=\"2\" width=\"5\" height=\"5\" rx=\"1.5\" $FILL />
  <rect x=\"2\" y=\"9\" width=\"5\" height=\"5\" rx=\"1.5\" $FILL />
  <rect x=\"9\" y=\"9\" width=\"5\" height=\"5\" rx=\"1.5\" $FILL />"
w interfaces "  <rect x=\"1.75\" y=\"2.75\" width=\"12.5\" height=\"10.5\" rx=\"2.5\" $FILL stroke=\"none\" />
  <path d=\"M1.75 6h12.5\" />"
w data "  <rect x=\"2\" y=\"7\" width=\"3\" height=\"6\" rx=\"1\" $FILL />
  <rect x=\"6.5\" y=\"3\" width=\"3\" height=\"10\" rx=\"1\" $FILL />
  <rect x=\"11\" y=\"5\" width=\"3\" height=\"8\" rx=\"1\" $FILL />"
w machines "  <circle cx=\"8\" cy=\"8\" r=\"4.25\" $FILL />
  <circle cx=\"8\" cy=\"8\" r=\"1.25\" />
  <path d=\"M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2\" />"
w devices "  <rect x=\"4.75\" y=\"1.75\" width=\"6.5\" height=\"12.5\" rx=\"1.75\" $FILL />
  <path d=\"M7 12h2\" />"
w coding "  <rect x=\"1.75\" y=\"2.75\" width=\"12.5\" height=\"10.5\" rx=\"2.5\" $FILL stroke=\"none\" />
  <path d=\"M6 5c-1 0-1.25.5-1.25 1.25v.5C4.75 7.5 4.5 8 3.75 8c.75 0 1 .5 1 1.25v.5C4.75 10.5 5 11 6 11M10 5c1 0 1.25.5 1.25 1.25v.5c0 .75.25 1.25 1 1.25-.75 0-1 .5-1 1.25v.5c0 .75-.25 1.25-1.25 1.25\" />"
w security "  <path d=\"M8 1.75 13 3.75v4.5c0 3-2.5 5-5 6-2.5-1-5-3-5-6v-4.5L8 1.75Z\" $FILL />
  <path d=\"M6 8l1.5 1.5L10 6.5\" />"
w connectivity "  <circle cx=\"4\" cy=\"11.5\" r=\"2.25\" $FILL />
  <circle cx=\"12\" cy=\"4.5\" r=\"2.25\" $FILL />
  <path d=\"m5.6 10 4.8-4.1\" />"
w empty "  <rect x=\"2.25\" y=\"2.25\" width=\"11.5\" height=\"11.5\" rx=\"3\" $FILL stroke=\"none\" />
  <rect x=\"2.25\" y=\"2.25\" width=\"11.5\" height=\"11.5\" rx=\"3\" stroke-dasharray=\"2 2.4\" />"
w marks "  <path d=\"M8 2.5 13.5 12h-11L8 2.5Z\" $FILL />
  <circle cx=\"12.25\" cy=\"4.25\" r=\"1.5\" />"
ls $F | wc -l   # 10
```

- [ ] **Step 2: Write the failing test**

`test/pretty-icons/check-text.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { textChecks, readSet, formatFailure } from "../../skills/pretty-icons/check.mjs";

const FIX = new URL("./fixtures/hairline-before/", import.meta.url);
const read = (n) => readFileSync(new URL(`${n}.svg`, FIX), "utf8");
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();

test("readSet lists the ten by name", () => {
  const set = readSet(FIX.pathname);
  assert.equal(set.length, 10);
  assert.deepEqual(set.map((s) => s.name).slice(0, 3), ["all", "coding", "connectivity"]);
});

test("a clean icon passes the text layer", () => {
  const r = textChecks("machines", read("machines"), 16);
  assert.equal(r.G, 16);
  assert.deepEqual(r.failures, []);
});

test("construction: a fill without a contour is rejected", () => {
  for (const n of ["interfaces", "coding", "empty"]) {
    const r = textChecks(n, read(n), 16);
    assert.ok(rules(r).includes("construction"), `${n}: ${rules(r)}`);
  }
});

test("radius: a 12.5-wide rect with rx 2.5 is not the preset's 1.5", () => {
  const r = textChecks("interfaces", read("interfaces"), 16);
  const f = r.failures.find((f) => f.rule === "radius");
  assert.ok(f);
  assert.equal(f.got, "rx 2.5");
  assert.equal(f.want, "rx 1.5");
});

test("count: four elements is one too many", () => {
  const r = textChecks("all", read("all"), 16);
  assert.ok(rules(r).includes("count"));
});

test("stroke: a colour of its own", () => {
  const bad = read("machines").replace('stroke="currentColor"', 'stroke="#f00"');
  const r = textChecks("machines", bad, 16);
  assert.ok(rules(r).includes("stroke"));
});

test("canvas: the set's grid must match", () => {
  const r = textChecks("machines", read("machines"), 24);
  const f = r.failures.find((f) => f.rule === "canvas");
  assert.equal(f.got, "viewBox 0 0 16 16");
  assert.equal(f.want, "0 0 24 24");
});

test("canvas: an origin other than 0 0 is a canvas failure, not a crash", () => {
  const r = textChecks("x", read("machines").replace('viewBox="0 0 16 16"', 'viewBox="1 1 16 16"'), 16);
  assert.ok(rules(r).includes("canvas"));
});

test("construction: fill=none on the root counts for every line", () => {
  const r = textChecks("machines", read("machines"), 16);
  assert.ok(!rules(r).includes("construction"));
});

test("grid: a number off the quarter grid", () => {
  const bad = read("machines").replace('cx="8" cy="8" r="1.25"', 'cx="8.1" cy="8" r="1.25"');
  const r = textChecks("machines", bad, 16);
  const f = r.failures.find((f) => f.rule === "grid");
  assert.equal(f.got, "cx 8.1");
});

test("elements: a g or a text is rejected by name", () => {
  const r = textChecks("x", `<svg viewBox="0 0 16 16"><g><rect x="1" y="1" width="2" height="2"/></g></svg>`, 16);
  assert.ok(rules(r).includes("elements"));
});

test("formatFailure", () => {
  assert.equal(formatFailure({ rule: "radius", icon: "interfaces", got: "rx 2.5", want: "rx 1.5" }), "radius  interfaces  rx 2.5 → rx 1.5");
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node --test test/pretty-icons/check-text.test.mjs`
Expected: FAIL, module not found

- [ ] **Step 4: Write `check.mjs`, text layer and `main`**

```js
#!/usr/bin/env node
/**
 * Checks a folder of icons as one set: `node check.mjs <folder>`. It prints
 * one line per failure, `rule  icon  measured → expected`, and exits 1; or
 * prints `ok` and exits 0. Exit 2 means the rasteriser could not be had and
 * the measured rules did not run; the last line then says `not measured`.
 * `--print` prints every icon's measures as a table instead.
 *
 * Text rules, read from the file:
 *   canvas        viewBox="0 0 G G", the same G in every file, G a preset
 *   elements      only rect, circle, line, path; nothing nested, no text
 *   stroke        the preset's width, round caps and joins, currentColor, nothing else coloured
 *   construction  a closed element has a contour and the .2 fill; a line has no fill
 *   grid          every number a multiple of 0.25
 *   radius        rx by the shape's size
 *   count         at most three elements, at most eight commands in a path
 * Measured rules, from pixels (Task 6): live, keyline, weight, gravity, gap.
 */
import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preset, radiusFor, FILL, GRID_STEP, PRESETS } from "./presets.mjs";
import { parse, num, G as gridOf, ELEMENTS } from "./svg.mjs";

const COLOUR_ATTRS = ["stroke", "fill", "color", "stop-color"];
const FORBIDDEN_ATTRS = ["style", "transform", "opacity", "stroke-opacity", "filter", "class", "id"];
const DASH_RE = /^\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)\s*$/;

const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
export const formatFailure = (f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`;

export function readSet(folder) {
  const dir = resolve(folder);
  return readdirSync(dir).filter((f) => f.endsWith(".svg")).sort()
    .map((f) => ({ name: basename(f, ".svg"), path: join(dir, f), text: readFileSync(join(dir, f), "utf8") }));
}

/** Whether an element draws a closed shape (a body) or an open stroke (a line). */
export function isClosed(el) {
  if (el.tag === "rect" || el.tag === "circle") return true;
  if (el.tag === "line") return false;
  return /[zZ]\s*$/.test(el.attrs.d ?? "") || /[zZ]/.test(el.attrs.d ?? "");
}

const pathNumbers = (d) => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
const pathCommands = (d) => (d.match(/[a-df-z]/gi) ?? []).length;
const onGrid = (n) => Math.abs(n / GRID_STEP - Math.round(n / GRID_STEP)) < 1e-9;

export function textChecks(icon, text, expectG) {
  const failures = [];
  const parsed = parse(text);
  const G = gridOf(parsed.attrs);
  const root = parsed.attrs;

  if (G === null) fail(failures, "canvas", icon, `viewBox ${root.viewBox ?? "missing"}`, `0 0 ${expectG} ${expectG}`);
  else if (G !== expectG) fail(failures, "canvas", icon, `viewBox ${root.viewBox}`, `0 0 ${expectG} ${expectG}`);
  if (!PRESETS[expectG]) { fail(failures, "canvas", icon, `grid ${expectG}`, `one of ${Object.keys(PRESETS).join(", ")}`); return { G, failures, parsed }; }
  const p = preset(expectG);

  for (const e of parsed.errors) fail(failures, "elements", icon, e, `only ${ELEMENTS.join(", ")}, flat`);

  // stroke: the root carries it once; no element may set another colour, width or opacity
  const sw = num(root["stroke-width"]);
  if (sw !== p.stroke) fail(failures, "stroke", icon, `stroke-width ${root["stroke-width"] ?? "missing"}`, `${p.stroke}`);
  if (root.stroke !== "currentColor") fail(failures, "stroke", icon, `stroke ${root.stroke ?? "missing"}`, "currentColor");
  if (root["stroke-linecap"] !== "round") fail(failures, "stroke", icon, `stroke-linecap ${root["stroke-linecap"] ?? "missing"}`, "round");
  if (root["stroke-linejoin"] !== "round") fail(failures, "stroke", icon, `stroke-linejoin ${root["stroke-linejoin"] ?? "missing"}`, "round");
  for (const a of FORBIDDEN_ATTRS) if (a in root) fail(failures, "stroke", icon, `root ${a}`, "not set");

  for (const el of parsed.elements) {
    const a = el.attrs, where = `${el.tag}@${el.line}`;
    for (const k of FORBIDDEN_ATTRS) if (k in a) fail(failures, "stroke", icon, `${where} ${k}`, "not set");
    if ("stroke-width" in a) fail(failures, "stroke", icon, `${where} stroke-width ${a["stroke-width"]}`, "the root's");
    for (const k of COLOUR_ATTRS) if (k in a && !["currentColor", "none"].includes(a[k])) fail(failures, "stroke", icon, `${where} ${k} ${a[k]}`, "currentColor or none");
    if ("stroke-dasharray" in a) {
      const m = DASH_RE.exec(a["stroke-dasharray"]);
      if (!m || Number(m[1]) < p.stroke || Number(m[2]) < p.stroke) fail(failures, "stroke", icon, `${where} stroke-dasharray ${a["stroke-dasharray"]}`, `dash and gap ≥ ${p.stroke}`);
    }

    // construction
    const closed = isClosed(el);
    const hasContour = a.stroke !== "none";
    const fillOn = a.fill === "currentColor";
    if (closed) {
      if (!hasContour) fail(failures, "construction", icon, `${where} stroke none`, "a contour on every body");
      if (!fillOn) fail(failures, "construction", icon, `${where} fill ${a.fill ?? "none"}`, `currentColor at ${FILL}`);
      else if (num(a, "fill-opacity") !== FILL) fail(failures, "construction", icon, `${where} fill-opacity ${a["fill-opacity"] ?? "1"}`, `${FILL}`);
    } else if (fillOn || (a.fill && a.fill !== "none")) fail(failures, "construction", icon, `${where} fill ${a.fill}`, "none on a line");

    // grid
    const nums = el.tag === "path" ? pathNumbers(a.d ?? "").map((n, i) => [`d[${i}]`, n]) : Object.entries(a).filter(([k]) => ["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2"].includes(k)).map(([k, v]) => [k, Number(v)]);
    for (const [k, n] of nums) if (!onGrid(n)) fail(failures, "grid", icon, `${where} ${k} ${n}`, `a multiple of ${GRID_STEP}`);

    // radius
    if (el.tag === "rect") {
      const size = Math.min(num(a, "width"), num(a, "height"));
      const want = radiusFor(expectG, size), rx = num(a, "rx", 0);
      if (rx !== want) fail(failures, "radius", icon, `rx ${rx}`, `rx ${want}`);
    }

    // count, per path
    if (el.tag === "path" && pathCommands(a.d ?? "") > 8) fail(failures, "count", icon, `${where} ${pathCommands(a.d)} commands`, "at most 8");
  }
  if (parsed.elements.length > 3) fail(failures, "count", icon, `${parsed.elements.length} elements`, "at most 3");
  if (parsed.elements.length === 0) fail(failures, "count", icon, "0 elements", "at least 1");

  return { G, failures, parsed };
}

/** The set's grid: the one most files declare, so one odd file fails canvas rather than all the others. */
export function setGrid(set, forced) {
  if (forced) return Number(forced);
  const votes = new Map();
  for (const s of set) { const g = gridOf(parse(s.text).attrs); if (g) votes.set(g, (votes.get(g) ?? 0) + 1); }
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 16;
}

export async function checkSet(folder, { grid, measure = true } = {}) {
  const set = readSet(folder);
  if (set.length === 0) return { failures: [{ rule: "set", icon: folder, got: "no .svg files", want: "at least one" }], measured: false, G: null, rows: [] };
  const G = setGrid(set, grid);
  const failures = [];
  for (const s of set) failures.push(...textChecks(s.name, s.text, G).failures);
  let measured = false, rows = [], why = "";
  if (measure) {
    try {
      const { measuredChecks } = await import("./measure.mjs");
      const r = await measuredChecks(set, G);
      failures.push(...r.failures); rows = r.rows; measured = true;
    } catch (e) { why = e.message; }
  }
  return { G, failures, measured, why, rows };
}

export async function main(argv) {
  const folder = argv.find((a) => !a.startsWith("--"));
  const grid = argv.find((a) => a.startsWith("--grid="))?.slice(7);
  if (!folder) { console.error("usage: node check.mjs <folder> [--grid=16|20|24] [--print]"); process.exit(1); }
  const r = await checkSet(folder, { grid });
  if (argv.includes("--print")) { console.table(r.rows); }
  for (const f of r.failures) console.log(formatFailure(f));
  if (!r.measured) { console.log(`not measured: ${r.why}`); process.exit(2); }
  if (r.failures.length) process.exit(1);
  console.log("ok");
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

`./measure.mjs` does not exist yet; `checkSet` catches the import error and reports `not measured`, which is the exit-2 path. Task 6 creates it.

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/pretty-icons/check-text.test.mjs`
Expected: PASS, 12 tests. If `construction` for `empty` does not fail, note the first `rect` there has `stroke="none"`: that is what must trip it.

- [ ] **Step 6: Try the command**

Run: `node skills/pretty-icons/check.mjs test/pretty-icons/fixtures/hairline-before`
Expected: lines for `construction` (interfaces, coding, empty), `radius` (interfaces, coding, devices, empty), `count` (all), then `not measured: Cannot find module …/measure.mjs`, exit 2.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: check.mjs text rules and the hairline-before fixture"
```

---

### Task 4: `geometry.mjs`, centrelines, bounds and distance

**Files:**
- Create: `skills/pretty-icons/geometry.mjs`
- Test: `test/pretty-icons/geometry.test.mjs`

**Interfaces:**
- Produces: `sample(el, step = 0.1)` → `number[][]` points `[x, y]` along the element's centreline (closed shapes come back around to the start); `bounds(points)` → `{ x0, y0, x1, y1 }`; `minDistance(A, B)` → the smallest distance between a point of A and a point of B; `pathPoints(d, step)` for a `d` string (used by `sample`).

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { sample, bounds, minDistance, pathPoints } from "../../skills/pretty-icons/geometry.mjs";

const near = (a, b, eps = 0.02) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const el = (tag, attrs) => ({ tag, attrs: Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, String(v)])) });

test("rect bounds, with and without rx", () => {
  const b = bounds(sample(el("rect", { x: 2, y: 3, width: 5, height: 4 })));
  assert.deepEqual([b.x0, b.y0, b.x1, b.y1].map((n) => +n.toFixed(2)), [2, 3, 7, 7]);
  const r = bounds(sample(el("rect", { x: 2, y: 3, width: 5, height: 4, rx: 1.5 })));
  near(r.x0, 2); near(r.x1, 7); near(r.y0, 3); near(r.y1, 7);
});

test("circle bounds", () => {
  const b = bounds(sample(el("circle", { cx: 8, cy: 8, r: 4.25 })));
  near(b.x0, 3.75); near(b.x1, 12.25); near(b.y0, 3.75); near(b.y1, 12.25);
});

test("path: absolute and relative, H V, subpaths", () => {
  const pts = pathPoints("M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2", 0.1);
  const b = bounds(pts);
  near(b.x0, 1.75); near(b.x1, 14.25); near(b.y0, 1.75); near(b.y1, 14.25);
});

test("path: cubic and quadratic curves are flattened", () => {
  const b = bounds(pathPoints("M0 0C0 4 4 4 4 0", 0.1));
  near(b.x0, 0); near(b.x1, 4); near(b.y1, 3, 0.1); // a cubic's peak is 3/4 of its handles
  const q = bounds(pathPoints("M0 0Q2 4 4 0", 0.1));
  near(q.y1, 2, 0.1);
});

test("path: an arc, as Lucide writes them, relative", () => {
  // a half circle of radius 2 from (2,4) to (6,4), bulging up
  const b = bounds(pathPoints("M2 4a2 2 0 0 1 4 0", 0.05));
  near(b.x0, 2); near(b.x1, 6); near(b.y0, 2, 0.05); near(b.y1, 4);
  // the same written absolute with the other sweep bulges down
  const d = bounds(pathPoints("M2 4A2 2 0 0 0 6 4", 0.05));
  near(d.y1, 6, 0.05);
});

test("path: Z closes back to the subpath start", () => {
  const pts = pathPoints("M0 0L4 0L4 4Z", 1);
  const last = pts.at(-1);
  near(last[0], 0); near(last[1], 0);
});

test("minDistance: parallel lines, touching, crossing", () => {
  const a = sample(el("line", { x1: 0, y1: 0, x2: 10, y2: 0 }));
  near(minDistance(a, sample(el("line", { x1: 0, y1: 3, x2: 10, y2: 3 }))), 3);
  near(minDistance(a, sample(el("line", { x1: 10, y1: 0, x2: 10, y2: 5 }))), 0);
  near(minDistance(a, sample(el("line", { x1: 5, y1: -2, x2: 5, y2: 2 }))), 0, 0.06);
});

test("minDistance: a tick ending on a circle's edge touches it", () => {
  const c = sample(el("circle", { cx: 8, cy: 8, r: 4.25 }), 0.05);
  const tick = pathPoints("M8 1.75v2", 0.05);
  near(minDistance(c, tick), 0, 0.06);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/pretty-icons/geometry.test.mjs`
Expected: FAIL, module not found

- [ ] **Step 3: Write `geometry.mjs`**

```js
/**
 * Centrelines as points. check.mjs measures ink from pixels; what it needs
 * from geometry is only where each element's stroke runs, to tell a shared
 * edge from an "almost" gap. Curves are flattened, arcs are converted the
 * SVG way (endpoint to centre), and everything comes back as [x, y] samples
 * about `step` apart.
 */
const n = (a, k, d = 0) => { const v = Number(a[k]); return Number.isNaN(v) || a[k] === undefined ? d : v; };

export function bounds(points) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of points) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
}

export function minDistance(A, B) {
  let best = Infinity;
  for (const [ax, ay] of A) for (const [bx, by] of B) { const d = Math.hypot(ax - bx, ay - by); if (d < best) best = d; }
  return best;
}

function segment(out, x0, y0, x1, y1, step) {
  const len = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.ceil(len / step));
  for (let i = 1; i <= k; i++) out.push([x0 + (x1 - x0) * i / k, y0 + (y1 - y0) * i / k]);
}

function cubic(out, p0, p1, p2, p3, step) {
  const k = Math.max(4, Math.ceil(Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) / step) * 2);
  for (let i = 1; i <= k; i++) {
    const t = i / k, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
}

/** SVG arc, endpoint form to centre form, then sampled. */
function arc(out, x0, y0, rx, ry, rot, large, sweep, x1, y1, step) {
  if (rx === 0 || ry === 0) return segment(out, x0, y0, x1, y1, step);
  const phi = rot * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (x0 - x1) / 2, dy = (y0 - y1) / 2;
  const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
  rx = Math.abs(rx); ry = Math.abs(ry);
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
  const sign = large === sweep ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = sign * Math.sqrt(Math.max(0, num / den));
  const cxp = coef * (rx * y1p / ry), cyp = coef * (-ry * x1p / rx);
  const cx = cos * cxp - sin * cyp + (x0 + x1) / 2, cy = sin * cxp + cos * cyp + (y0 + y1) / 2;
  const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
  const t0 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI; else if (sweep && dt < 0) dt += 2 * Math.PI;
  const k = Math.max(4, Math.ceil(Math.abs(dt) * Math.max(rx, ry) / step));
  for (let i = 1; i <= k; i++) {
    const t = t0 + dt * i / k, ex = rx * Math.cos(t), ey = ry * Math.sin(t);
    out.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]);
  }
}

const TOKENS = /[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g;
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

export function pathPoints(d, step = 0.1) {
  const out = [];
  const toks = d.match(TOKENS) ?? [];
  let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = "";
  const next = () => Number(toks[i++]);
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    else if (cmd === "M") cmd = "L"; else if (cmd === "m") cmd = "l";
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (!(C in ARGS)) throw new Error(`path: unknown command "${cmd}"`);
    const a = Array.from({ length: ARGS[C] }, next);
    const X = (v) => (rel ? x + v : v), Y = (v) => (rel ? y + v : v);
    switch (C) {
      case "M": x = X(a[0]); y = Y(a[1]); sx = x; sy = y; out.push([x, y]); break;
      case "L": segment(out, x, y, X(a[0]), Y(a[1]), step); x = X(a[0]); y = Y(a[1]); break;
      case "H": segment(out, x, y, X(a[0]), y, step); x = X(a[0]); break;
      case "V": segment(out, x, y, x, Y(a[0]), step); y = Y(a[0]); break;
      case "C": cubic(out, [x, y], [X(a[0]), Y(a[1])], [X(a[2]), Y(a[3])], [X(a[4]), Y(a[5])], step); px = X(a[2]); py = Y(a[3]); x = X(a[4]); y = Y(a[5]); break;
      case "S": { const r = /[CS]/.test(prev) ? [2 * x - px, 2 * y - py] : [x, y]; cubic(out, [x, y], r, [X(a[0]), Y(a[1])], [X(a[2]), Y(a[3])], step); px = X(a[0]); py = Y(a[1]); x = X(a[2]); y = Y(a[3]); break; }
      case "Q": { const q1 = [X(a[0]), Y(a[1])], q2 = [X(a[2]), Y(a[3])]; cubic(out, [x, y], [x + 2 / 3 * (q1[0] - x), y + 2 / 3 * (q1[1] - y)], [q2[0] + 2 / 3 * (q1[0] - q2[0]), q2[1] + 2 / 3 * (q1[1] - q2[1])], q2, step); px = q1[0]; py = q1[1]; x = q2[0]; y = q2[1]; break; }
      case "T": { const q1 = /[QT]/.test(prev) ? [2 * x - px, 2 * y - py] : [x, y], q2 = [X(a[0]), Y(a[1])]; cubic(out, [x, y], [x + 2 / 3 * (q1[0] - x), y + 2 / 3 * (q1[1] - y)], [q2[0] + 2 / 3 * (q1[0] - q2[0]), q2[1] + 2 / 3 * (q1[1] - q2[1])], q2, step); px = q1[0]; py = q1[1]; x = q2[0]; y = q2[1]; break; }
      case "A": arc(out, x, y, a[0], a[1], a[2], a[3] !== 0, a[4] !== 0, X(a[5]), Y(a[6]), step); x = X(a[5]); y = Y(a[6]); break;
      case "Z": segment(out, x, y, sx, sy, step); x = sx; y = sy; break;
    }
    prev = C;
  }
  return out;
}

export function sample(el, step = 0.1) {
  const a = el.attrs;
  switch (el.tag) {
    case "line": { const o = [[n(a, "x1"), n(a, "y1")]]; segment(o, n(a, "x1"), n(a, "y1"), n(a, "x2"), n(a, "y2"), step); return o; }
    case "circle": { const cx = n(a, "cx"), cy = n(a, "cy"), r = n(a, "r"), k = Math.max(16, Math.ceil(2 * Math.PI * r / step)); return Array.from({ length: k + 1 }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / k), cy + r * Math.sin(2 * Math.PI * i / k)]); }
    case "rect": {
      const x = n(a, "x"), y = n(a, "y"), w = n(a, "width"), h = n(a, "height"), rx = Math.min(n(a, "rx", n(a, "ry")), w / 2), ry = Math.min(n(a, "ry", rx), h / 2);
      const d = rx > 0
        ? `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`
        : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      return pathPoints(d, step);
    }
    case "path": return pathPoints(a.d ?? "", step);
    default: throw new Error(`geometry: no sampler for <${el.tag}>`);
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/pretty-icons/geometry.test.mjs`
Expected: PASS, 8 tests. If the arc test's `y0` is 6 instead of 2, the `sign` or the sweep correction is inverted; SVG's y axis points down, so sweep 1 with these endpoints bulges up.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: geometry.mjs samples centrelines"
```

---

### Task 5: `raster.mjs`, the rasteriser from the cache, and `measure()`

**Files:**
- Create: `skills/pretty-icons/raster.mjs`
- Test: `test/pretty-icons/raster.test.mjs`

**Interfaces:**
- Produces: `cacheDir(env, platform, home)` → path; `resvg()` → the `Resvg` class, installing `@resvg/resvg-js@2` into the cache when missing, throwing `Error` with a reason when it cannot; `render(svgText, widthPx, { background })` → `{ width, height, pixels: Uint8Array (RGBA) }`; `png(svgText, widthPx, opts)` → PNG `Buffer`; `measure(svgText, G)` → `{ box: { x0, y0, x1, y1, w, h }, mass: { dx, dy }, ink }` in canvas units, `box` being the ink box, `mass` the centre of mass's offset from the canvas centre.
- Consumes: `SCALE`, `INK_ALPHA` from `presets.mjs`.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cacheDir, measure, render } from "../../skills/pretty-icons/raster.mjs";

const near = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const ROOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`;

test("cacheDir by platform and env", () => {
  assert.equal(cacheDir({}, "darwin", "/Users/x"), "/Users/x/Library/Caches/pretty-icons");
  assert.equal(cacheDir({ XDG_CACHE_HOME: "/xdg" }, "linux", "/home/x"), "/xdg/pretty-icons");
  assert.equal(cacheDir({}, "linux", "/home/x"), "/home/x/.cache/pretty-icons");
  assert.equal(cacheDir({ LOCALAPPDATA: "C:\\Users\\x\\AppData\\Local" }, "win32", "C:\\Users\\x").replace(/\\/g, "/"), "C:/Users/x/AppData/Local/pretty-icons");
  assert.equal(cacheDir({ PRETTY_ICONS_CACHE: "/else" }, "darwin", "/Users/x"), "/else");
});

test("a centred stroked square measures its ink box", async () => {
  // rect 2.5..13.5 with stroke 1.5: ink 1.75..14.25, 12.5 wide, centred
  const m = await measure(`${ROOT}<rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill="currentColor" fill-opacity=".2" /></svg>`, 16);
  near(m.box.x0, 1.75); near(m.box.x1, 14.25); near(m.box.w, 12.5); near(m.box.h, 12.5);
  near(m.mass.dx, 0); near(m.mass.dy, 0);
  assert.ok(m.ink > 50 && m.ink < 100, `ink ${m.ink}`);
});

test("a square in the top-left has its mass off centre", async () => {
  const m = await measure(`${ROOT}<rect x="2" y="2" width="4" height="4" rx="1" /></svg>`, 16);
  assert.ok(m.mass.dx < -3 && m.mass.dy < -3, JSON.stringify(m.mass));
});

test("currentColor renders as ink", async () => {
  const r = await render(`${ROOT}<path d="M2 8h12" /></svg>`, 160);
  assert.equal(r.width, 160);
  let inked = 0;
  for (let i = 3; i < r.pixels.length; i += 4) if (r.pixels[i] > 12) inked++;
  assert.ok(inked > 100, `${inked} inked pixels`);
});

test("the cache dir can be moved for a test", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-"));
  assert.equal(cacheDir({ PRETTY_ICONS_CACHE: dir }), dir);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/pretty-icons/raster.test.mjs`
Expected: FAIL, module not found

- [ ] **Step 3: Write `raster.mjs`**

```js
/**
 * Pixels for check.mjs and sheet.mjs. The rasteriser is @resvg/resvg-js,
 * installed once into a cache folder of the user's (PRETTY_ICONS_CACHE moves
 * it), never into the skill or the working directory. `currentColor` is
 * turned to black before rendering, so ink is alpha.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { SCALE, INK_ALPHA } from "./presets.mjs";

const PKG = "@resvg/resvg-js@2";

export function cacheDir(env = process.env, platform = process.platform, home = homedir()) {
  if (env.PRETTY_ICONS_CACHE) return resolve(env.PRETTY_ICONS_CACHE);
  if (platform === "darwin") return join(home, "Library", "Caches", "pretty-icons");
  if (platform === "win32") return join(env.LOCALAPPDATA || join(home, "AppData", "Local"), "pretty-icons");
  return join(env.XDG_CACHE_HOME || join(home, ".cache"), "pretty-icons");
}

let Resvg;
/** The Resvg class from the cache, installed there first when it is not. Throws with a reason when it cannot be had. */
export function resvg() {
  if (Resvg) return Resvg;
  const dir = cacheDir();
  const req = createRequire(join(dir, "raster.cjs"));
  const has = () => { try { req.resolve("@resvg/resvg-js"); return true; } catch { return false; } };
  if (!has()) {
    console.error(`installing ${PKG} once, into ${dir}`);
    mkdirSync(dir, { recursive: true });
    const win = process.platform === "win32";
    const run = spawnSync(win ? "npm.cmd" : "npm", ["install", PKG, "--prefix", dir, "--no-audit", "--no-fund", "--loglevel=error"], { encoding: "utf8", shell: win });
    const why = run.error?.code === "ENOENT" ? "npm is not on the PATH" : run.error?.message ?? /Error: (.*)$/m.exec(run.stderr ?? "")?.[1] ?? (run.stderr ?? "").trim().split("\n")[0];
    if (run.status !== 0 || !has()) throw new Error(`could not install ${PKG} into ${dir}: ${why || "npm failed"}`);
  }
  Resvg = req("@resvg/resvg-js").Resvg;
  return Resvg;
}

const black = (svg) => svg.replace(/currentColor/g, "#000");
const withNs = (svg) => (/xmlns=/.test(svg) ? svg : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'));

export function render(svgText, widthPx, { background } = {}) {
  const R = resvg();
  const r = new R(withNs(black(svgText)), { fitTo: { mode: "width", value: widthPx }, background, font: { loadSystemFonts: true } }).render();
  return { width: r.width, height: r.height, pixels: r.pixels };
}

export function png(svgText, widthPx, opts) {
  const R = resvg();
  return new R(withNs(black(svgText)), { fitTo: { mode: "width", value: widthPx }, background: opts?.background, font: { loadSystemFonts: true } }).render().asPng();
}

/** Ink box, centre of mass and ink of one icon, in canvas units. Async so a caller can await an install. */
export async function measure(svgText, G) {
  const N = G * SCALE;
  const { pixels } = render(svgText, N);
  let x0 = N, y0 = N, x1 = -1, y1 = -1, sum = 0, sx = 0, sy = 0;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const a = pixels[(y * N + x) * 4 + 3] / 255;
    if (a > INK_ALPHA) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    sum += a; sx += a * (x + 0.5); sy += a * (y + 0.5);
  }
  if (x1 < 0) return { box: { x0: 0, y0: 0, x1: 0, y1: 0, w: 0, h: 0 }, mass: { dx: 0, dy: 0 }, ink: 0 };
  const u = (v) => v / SCALE;
  return {
    box: { x0: u(x0), y0: u(y0), x1: u(x1 + 1), y1: u(y1 + 1), w: u(x1 - x0 + 1), h: u(y1 - y0 + 1) },
    mass: { dx: u(sx / sum) - G / 2, dy: u(sy / sum) - G / 2 },
    ink: sum / SCALE / SCALE,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `PRETTY_ICONS_CACHE=$(mktemp -d) node --test test/pretty-icons/raster.test.mjs`
Expected: `installing @resvg/resvg-js@2 once, into …` on stderr, then PASS, 5 tests. Needs the network once. Run it a second time without `PRETTY_ICONS_CACHE` to install into the real cache; it must pass again with no install line.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: raster.mjs renders with resvg from the cache and measures ink"
```

---

### Task 6: `measure.mjs`, the measured rules, `--print`, and the `good-16` fixture

**Files:**
- Create: `skills/pretty-icons/measure.mjs`
- Create: `test/pretty-icons/fixtures/good-16/{disc,card,phone,tile}.svg`
- Modify: `skills/pretty-icons/check.mjs` (already imports `./measure.mjs` lazily; add `REFERENCE_INK` use for a set under three)
- Modify: `skills/pretty-icons/presets.mjs` (add `REFERENCE_INK`)
- Test: `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Produces: `measuredChecks(set, G)` → `{ failures: Failure[], rows: Row[] }` with `Row = { icon, w, h, keyline, ink, dx, dy }` (numbers rounded to 2 decimals, `keyline` the matched format or `"—"`); `nearestKeyline(G, w, h)` → `{ format, dw, dh }`.
- Rule names: `live`, `keyline`, `weight`, `gravity`, `gap`.
- `REFERENCE_INK` in `presets.mjs`: `{ 16: <median ink of examples/hairline> }`; Task 9 fills the number; until then `{ 16: 70 }`, the median of the current set rounded, so the fallback is a real figure.

- [ ] **Step 1: Write the `good-16` fixture**

Four icons built on the body geometry of Task 1, one per keyline, with one line each so weight sits close:

```bash
cd ~/estudos/skills && F=test/pretty-icons/fixtures/good-16 && mkdir -p $F
ROOT='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
FILL='fill="currentColor" fill-opacity=".2"'
w() { printf '%s\n%s\n</svg>\n' "$ROOT" "$2" > $F/$1.svg; }
w disc  "  <circle cx=\"8\" cy=\"8\" r=\"6.25\" $FILL />
  <circle cx=\"8\" cy=\"8\" r=\"1.25\" />"
w tile  "  <rect x=\"2.5\" y=\"2.5\" width=\"11\" height=\"11\" rx=\"1.5\" $FILL />
  <path d=\"M5.5 8h5\" />"
w phone "  <rect x=\"3.25\" y=\"1.75\" width=\"9.5\" height=\"12.5\" rx=\"1.5\" $FILL />
  <path d=\"M7 11.75h2\" />"
w card  "  <rect x=\"1.75\" y=\"3.25\" width=\"12.5\" height=\"9.5\" rx=\"1.5\" $FILL />
  <path d=\"M1.75 6.25h12.5\" />"
```

- [ ] **Step 2: Write the failing test**

`test/pretty-icons/check.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet } from "../../skills/pretty-icons/check.mjs";
import { nearestKeyline } from "../../skills/pretty-icons/measure.mjs";

const fix = (n) => new URL(`./fixtures/${n}/`, import.meta.url).pathname;
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();
const of = (r, rule) => r.failures.filter((f) => f.rule === rule).map((f) => f.icon).sort();

test("nearestKeyline", () => {
  assert.equal(nearestKeyline(16, 14, 10.9).format, "landscape");
  assert.equal(nearestKeyline(16, 13.6, 13.4).format, "circle");
  assert.equal(nearestKeyline(16, 12.4, 12.6).format, "square");
  assert.equal(nearestKeyline(16, 8, 14).format, "portrait");
});

test("good-16 passes every rule", async () => {
  const r = await checkSet(fix("good-16"));
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures, []);
  assert.equal(r.rows.length, 4);
  assert.deepEqual(r.rows.map((x) => x.keyline).sort(), ["circle", "landscape", "portrait", "square"]);
});

test("hairline-before fails on keyline, construction, weight and gap", async () => {
  const r = await checkSet(fix("hairline-before"));
  assert.equal(r.measured, true);
  for (const rule of ["keyline", "construction", "weight", "gap"]) assert.ok(rules(r).includes(rule), `${rule} in ${rules(r)}`);
  assert.ok(of(r, "keyline").includes("coding"), "coding is 12.5 × 10.5, no keyline");
  assert.ok(of(r, "keyline").includes("devices"), "devices is 8 × 14, no keyline");
  assert.ok(of(r, "weight").includes("all") && of(r, "weight").includes("interfaces"), "the heaviest and the lightest");
  assert.ok(of(r, "gap").includes("all"), "the four squares are 0.5 apart outer edge to outer edge");
});

test("gravity: an icon whose mass sits off centre", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-"));
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "corner.svg"), readFileSync(join(fix("good-16"), "tile.svg"), "utf8").replace('d="M5.5 8h5"', 'd="M4.5 5h2"'));
  const r = await checkSet(dir);
  assert.ok(of(r, "gravity").includes("corner"));
});

test("gap: crossing counts as touching, almost does not", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-"));
  cpSync(fix("good-16"), dir, { recursive: true });
  const disc = readFileSync(join(fix("good-16"), "disc.svg"), "utf8");
  writeFileSync(join(dir, "cross.svg"), disc.replace('<circle cx="8" cy="8" r="1.25" />', '<path d="M8 4v8" />'));
  writeFileSync(join(dir, "almost.svg"), disc.replace('<circle cx="8" cy="8" r="1.25" />', '<circle cx="8" cy="8" r="4.5" />'));
  const r = await checkSet(dir);
  assert.ok(!of(r, "gap").includes("cross"), "a line through the body touches it");
  assert.ok(of(r, "gap").includes("almost"), "two rings 1.75 apart centre to centre are 0.25 apart outer edge to outer edge");
});

test("live: ink past the padding", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-"));
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "wide.svg"), readFileSync(join(fix("good-16"), "card.svg"), "utf8").replace('d="M1.75 6.25h12.5"', 'd="M1 6.25h14"'));
  const r = await checkSet(dir);
  assert.ok(of(r, "live").includes("wide"));
});

test("weight with one icon falls back to the reference and says so", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-"));
  writeFileSync(join(dir, "disc.svg"), readFileSync(join(fix("good-16"), "disc.svg"), "utf8"));
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  const w = r.failures.filter((f) => f.rule === "weight");
  for (const f of w) assert.match(f.want, /reference/);
});

test("a set with no svg files fails on set", async () => {
  const r = await checkSet(mkdtempSync(join(tmpdir(), "pi-")));
  assert.deepEqual(rules(r), ["set"]);
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node --test test/pretty-icons/check.test.mjs`
Expected: FAIL, `measure.mjs` not found

- [ ] **Step 4: Add `REFERENCE_INK` to `presets.mjs`**

Append:

```js
/** Median ink of examples/hairline per grid, for a set too small to have a median of its own; scaled by (G/16)² for other grids. */
export const REFERENCE_INK = { 16: 70 };
export const referenceInk = (G) => (REFERENCE_INK[G] ?? REFERENCE_INK[16] * (G / 16) ** 2);
```

- [ ] **Step 5: Write `measure.mjs`**

```js
/**
 * The measured rules, over a set. Each icon is rendered and measured by
 * raster.mjs; gap is read from geometry.mjs, with the stroke added.
 */
import { preset, KEYLINE_TOL, WEIGHT_TOL, GRAVITY_TOL, TOUCH, FORMATS, referenceInk } from "./presets.mjs";
import { measure } from "./raster.mjs";
import { parse } from "./svg.mjs";
import { sample, minDistance } from "./geometry.mjs";

const r2 = (n) => Math.round(n * 100) / 100;
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });

export function nearestKeyline(G, w, h) {
  const { keylines } = preset(G);
  let best = null;
  for (const format of FORMATS) {
    const [kw, kh] = keylines[format], dw = w - kw, dh = h - kh, score = Math.abs(dw) + Math.abs(dh);
    if (!best || score < best.score) best = { format, dw, dh, score };
  }
  return best;
}

export async function measuredChecks(set, G) {
  const p = preset(G), failures = [], rows = [];
  const measures = [];
  for (const s of set) measures.push({ ...s, m: await measure(s.text, G) });

  for (const { name, text, m } of measures) {
    const { box, mass, ink } = m;
    // live
    const lo = p.pad - 0.05, hi = G - p.pad + 0.05;
    if (box.x0 < lo || box.y0 < lo || box.x1 > hi || box.y1 > hi) fail(failures, "live", name, `ink ${r2(box.x0)},${r2(box.y0)}–${r2(box.x1)},${r2(box.y1)}`, `inside ${p.pad}–${G - p.pad}`);
    // keyline
    const k = nearestKeyline(G, box.w, box.h);
    const fits = Math.abs(k.dw) <= KEYLINE_TOL + 1e-9 && Math.abs(k.dh) <= KEYLINE_TOL + 1e-9;
    if (!fits) fail(failures, "keyline", name, `${r2(box.w)} × ${r2(box.h)}`, `${k.format} ${p.keylines[k.format].join(" × ")} ±${KEYLINE_TOL}`);
    // gravity
    if (Math.abs(mass.dx) > GRAVITY_TOL || Math.abs(mass.dy) > GRAVITY_TOL) fail(failures, "gravity", name, `mass ${r2(mass.dx) >= 0 ? "+" : ""}${r2(mass.dx)}, ${r2(mass.dy) >= 0 ? "+" : ""}${r2(mass.dy)}`, `within ±${GRAVITY_TOL}`);
    // gap, between every pair of elements
    const els = parse(text).elements;
    const lines = els.map((el) => sample(el, 0.05));
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      const centre = minDistance(lines[i], lines[j]);
      const outer = centre - p.stroke;
      if (centre > TOUCH && outer < p.stroke - 1e-9) fail(failures, "gap", name, `${els[i].tag}@${els[i].line} to ${els[j].tag}@${els[j].line} ${r2(Math.max(0, outer))} apart`, `≥ ${p.stroke} or touching`);
    }
    rows.push({ icon: name, w: r2(box.w), h: r2(box.h), keyline: fits ? k.format : "—", ink: r2(ink), dx: r2(mass.dx), dy: r2(mass.dy) });
  }

  // weight, against the set's median or the reference
  const inks = measures.map((x) => x.m.ink).sort((a, b) => a - b);
  const own = inks.length >= 3;
  const median = own ? inks[Math.floor(inks.length / 2)] : referenceInk(G);
  for (const { name, m } of measures) {
    const off = (m.ink - median) / median;
    if (Math.abs(off) > WEIGHT_TOL) fail(failures, "weight", name, `ink ${r2(m.ink)} (${off > 0 ? "+" : ""}${Math.round(off * 100)}%)`, `within ±${WEIGHT_TOL * 100}% of ${own ? "the set's median" : "the reference"} ${r2(median)}`);
  }
  return { failures, rows };
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test test/pretty-icons/check.test.mjs`
Expected: PASS, 8 tests. Likely adjustments, each a fixture or a reading, not a tolerance: if `good-16` fails `weight`, make the lighter icons' lines longer or the heavier shorter until the four sit within ±15% (print with `node skills/pretty-icons/check.mjs test/pretty-icons/fixtures/good-16 --print`); if it fails `gap` on `card` (the line sits on the body's edge), that is touching and must pass, so check `TOUCH` against the sampled distance.

- [ ] **Step 7: Run the whole command on both fixtures**

Run: `node skills/pretty-icons/check.mjs test/pretty-icons/fixtures/good-16` → `ok`, exit 0.
Run: `node skills/pretty-icons/check.mjs test/pretty-icons/fixtures/hairline-before --print` → the table, then the failure lines, exit 1. Keep the table: it is the "before" column of the hand-over.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: measured rules: live, keyline, weight, gravity, gap"
```

---

### Task 7: `sheet.mjs`, the author's sheet and the blind sheet

**Files:**
- Create: `skills/pretty-icons/sheet.mjs`
- Test: `test/pretty-icons/sheet.test.mjs`

**Interfaces:**
- Produces: `composeSheet(set, G, rows)` → SVG text (rows with labels at 1× and 2×, light and dark, then a tile per icon with its ink box over its keyline); `composeBlind(set, G, seed)` → `{ svg, key: [{ n, name }] }`; `writeSheets(folder, { out = folder's parent, seed })` → `{ sheet, blind, key }` paths and key; `main(argv)` prints the two paths and the key.
- Consumes: `checkSet` from `check.mjs` (the sheet refuses a set that fails, as emit does), `png` from `raster.mjs`, `preset` from `presets.mjs`.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { composeBlind, composeSheet, writeSheets } from "../../skills/pretty-icons/sheet.mjs";
import { readSet, checkSet } from "../../skills/pretty-icons/check.mjs";

const fix = new URL("./fixtures/good-16/", import.meta.url).pathname;

test("the author's sheet has every label, both themes and both scales", async () => {
  const set = readSet(fix);
  const { rows } = await checkSet(fix);
  const svg = composeSheet(set, 16, rows);
  for (const s of set) assert.ok(svg.includes(`>${s.name}<`), s.name);
  assert.ok(svg.includes('data-theme="light"') && svg.includes('data-theme="dark"'));
  assert.ok(svg.includes('data-scale="1"') && svg.includes('data-scale="2"'));
  assert.ok(svg.includes("data-keyline"), "a keyline tile per icon");
});

test("the blind sheet has no names and a shuffled key", () => {
  const set = readSet(fix);
  const a = composeBlind(set, 16, 7), b = composeBlind(set, 16, 8);
  for (const s of set) assert.ok(!a.svg.includes(s.name), `${s.name} leaked`);
  assert.equal(a.key.length, 4);
  assert.deepEqual(a.key.map((k) => k.n), [1, 2, 3, 4]);
  assert.deepEqual([...a.key.map((k) => k.name)].sort(), set.map((s) => s.name));
  assert.notDeepEqual(a.key.map((k) => k.name), b.key.map((k) => k.name), "two seeds, two orders");
  assert.deepEqual(composeBlind(set, 16, 7).key, a.key, "one seed, one order");
});

test("writeSheets writes two pngs and refuses a failing set", async () => {
  const out = mkdtempSync(join(tmpdir(), "pi-"));
  const r = await writeSheets(fix, { out, seed: 1 });
  assert.ok(existsSync(r.sheet) && statSync(r.sheet).size > 1000);
  assert.ok(existsSync(r.blind) && statSync(r.blind).size > 1000);
  assert.equal(r.key.length, 4);
  await assert.rejects(writeSheets(new URL("./fixtures/hairline-before/", import.meta.url).pathname, { out }), /check/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/pretty-icons/sheet.test.mjs`
Expected: FAIL, module not found

- [ ] **Step 3: Write `sheet.mjs`**

```js
#!/usr/bin/env node
/**
 * Two sheets for a set that passes check.mjs: `node sheet.mjs <folder>`.
 *   pretty-icons-sheet.png   for the author: the set in sidebar rows at 1× and 2×, light and dark,
 *                            then a tile per icon with its ink box over the keyline it matched
 *   pretty-icons-blind.png   for the reader: icons only, 2×, shuffled and numbered
 * The key (number → name) is printed, for the author alone. `--seed=<n>`
 * fixes the shuffle; `--out=<dir>` moves the files (default: beside the folder).
 */
import { realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSet, readSet, formatFailure } from "./check.mjs";
import { preset } from "./presets.mjs";
import { png } from "./raster.mjs";
import { parse } from "./svg.mjs";

const FONT = `font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"`;
const THEMES = { light: { bg: "#fafafa", ink: "#737373", text: "#171717" }, dark: { bg: "#0a0a0a", ink: "#8a8a8a", text: "#ededed" } };

/** An icon's inner markup, placed at (x, y) and scaled to `size` px, coloured. Ink is the stroke colour; the fill is currentColor so it follows. */
function place(s, G, x, y, size, colour) {
  const inner = s.text.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const root = parse(s.text).attrs;
  return `<g transform="translate(${x} ${y}) scale(${size / G})" fill="none" stroke="${colour}" color="${colour}" stroke-width="${root["stroke-width"]}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
}

function rowsBlock(set, G, scale, theme, x, y) {
  const t = THEMES[theme], icon = G * scale, rowH = 28 * scale, w = 180 * scale, pad = 10 * scale;
  let out = `<g data-theme="${theme}" data-scale="${scale}"><rect x="${x}" y="${y}" width="${w}" height="${set.length * rowH + pad * 2}" rx="${8 * scale}" fill="${t.bg}" />`;
  set.forEach((s, i) => {
    const cy = y + pad + i * rowH + rowH / 2;
    out += place(s, G, x + pad, cy - icon / 2, icon, t.ink);
    out += `<text x="${x + pad + icon + 10 * scale}" y="${cy + 4.5 * scale}" ${FONT} font-size="${13 * scale}" fill="${t.text}">${s.name}</text>`;
  });
  return out + "</g>";
}

function keylineTiles(set, G, rows, x, y) {
  const S = 6, tile = G * S + 24, perRow = 5;
  let out = `<g data-keyline="tiles">`;
  set.forEach((s, i) => {
    const row = rows.find((r) => r.icon === s.name) ?? {};
    const tx = x + (i % perRow) * (tile + 12), ty = y + Math.floor(i / perRow) * (tile + 36);
    out += `<rect x="${tx}" y="${ty}" width="${G * S}" height="${G * S}" fill="#fff" stroke="#e5e5e5" />`;
    for (let g = 1; g < G; g++) out += `<path d="M${tx + g * S} ${ty}v${G * S}M${tx} ${ty + g * S}h${G * S}" stroke="#f0f0f0" />`;
    if (row.keyline && row.keyline !== "—") {
      const [kw, kh] = preset(G).keylines[row.keyline];
      out += `<rect x="${tx + (G - kw) / 2 * S}" y="${ty + (G - kh) / 2 * S}" width="${kw * S}" height="${kh * S}" fill="none" stroke="#3b82f6" stroke-dasharray="4 3" />`;
    }
    out += place(s, G, tx, ty, G * S, "#262626");
    out += `<text x="${tx}" y="${ty + G * S + 16}" ${FONT} font-size="11" fill="#525252">${s.name} · ${row.w} × ${row.h} · ${row.keyline ?? "—"} · ink ${row.ink} · mass ${row.dx >= 0 ? "+" : ""}${row.dx}, ${row.dy >= 0 ? "+" : ""}${row.dy}</text>`;
  });
  return out + "</g>";
}

export function composeSheet(set, G, rows) {
  const left = 24, top = 24, gapX = 24;
  const h1 = set.length * 28 + 20, h2 = set.length * 56 + 40;
  const tilesY = top + Math.max(h1, h2) + 48, tilesH = Math.ceil(set.length / 5) * (G * 6 + 60);
  const W = 24 + 180 + gapX + 180 + gapX + 360 + gapX + 360 + 24, H = tilesY + tilesH + 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff" />`
    + rowsBlock(set, G, 1, "light", left, top) + rowsBlock(set, G, 1, "dark", left + 180 + gapX, top)
    + rowsBlock(set, G, 2, "light", left + 2 * (180 + gapX), top) + rowsBlock(set, G, 2, "dark", left + 2 * (180 + gapX) + 360 + gapX, top)
    + keylineTiles(set, G, rows, left, tilesY) + "</svg>";
}

/** mulberry32: a small seeded shuffle so a test can pin the order. */
function shuffled(items, seed) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function composeBlind(set, G, seed = Date.now()) {
  const order = shuffled(set, seed), icon = G * 2, cell = icon + 48, perRow = 5;
  const W = 24 * 2 + perRow * cell, H = 24 * 2 + Math.ceil(order.length / perRow) * cell;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fafafa" />`;
  const key = order.map((s, i) => {
    const x = 24 + (i % perRow) * cell + 24, y = 24 + Math.floor(i / perRow) * cell + 8;
    svg += place(s, G, x, y, icon, "#737373");
    svg += `<text x="${x + icon / 2}" y="${y + icon + 18}" text-anchor="middle" ${FONT} font-size="12" fill="#171717">${i + 1}</text>`;
    return { n: i + 1, name: s.name };
  });
  return { svg: svg + "</svg>", key };
}

export async function writeSheets(folder, { out, seed } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : dirname(dir);
  const r = await checkSet(dir);
  if (!r.measured) throw new Error(`check: not measured: ${r.why}`);
  if (r.failures.length) throw new Error(`check failed:\n${r.failures.map(formatFailure).join("\n")}`);
  const set = readSet(dir);
  const sheet = join(dest, "pretty-icons-sheet.png"), blind = join(dest, "pretty-icons-blind.png");
  const sheetSvg = composeSheet(set, r.G, r.rows);
  writeFileSync(sheet, png(sheetSvg, Number(/width="(\d+)"/.exec(sheetSvg)[1])));
  const b = composeBlind(set, r.G, seed);
  writeFileSync(blind, png(b.svg, Number(/width="(\d+)"/.exec(b.svg)[1])));
  return { sheet, blind, key: b.key };
}

export async function main(argv) {
  const folder = argv.find((a) => !a.startsWith("--"));
  if (!folder) { console.error("usage: node sheet.mjs <folder> [--seed=<n>] [--out=<dir>]"); process.exit(1); }
  const seed = argv.find((a) => a.startsWith("--seed="))?.slice(7), out = argv.find((a) => a.startsWith("--out="))?.slice(6);
  try {
    const r = await writeSheets(folder, { out, seed: seed ? Number(seed) : undefined });
    console.log(r.sheet); console.log(r.blind);
    console.log("key: " + r.key.map((k) => `${k.n} ${k.name}`).join(" · "));
  } catch (e) { console.error(e.message); process.exit(1); }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

`png()` from raster.mjs turns `currentColor` to black; `place()` sets `stroke` and `color` on the group so the icon's own `currentColor` references resolve to the theme's ink before that replacement. If resvg does not resolve `color` for `currentColor` inside the group, `place()` must instead replace `currentColor` in `inner` with `colour` directly; do that and keep the test.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/pretty-icons/sheet.test.mjs`
Expected: PASS, 3 tests

- [ ] **Step 5: Look at the sheet yourself**

Run: `node skills/pretty-icons/sheet.mjs test/pretty-icons/fixtures/good-16 --out=/tmp` and open `/tmp/pretty-icons-sheet.png` (the Read tool shows images). The four rows must show grey icons beside dark labels on a light card and light labels on a dark card; the tiles must show a dashed blue keyline round each icon. If the label text is missing, resvg found no system font: pass `font: { loadSystemFonts: true, defaultFontFamily: "Helvetica" }` in `raster.mjs`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: sheet.mjs writes the author's sheet and the blind sheet"
```

---

### Task 8: `emit.mjs`, delivery as svg, react or sprite

**Files:**
- Create: `skills/pretty-icons/emit.mjs`
- Test: `test/pretty-icons/emit.test.mjs`

**Interfaces:**
- Produces: `toReact(set, { wrapper })` → TSX text; `toSprite(set)` → SVG text; `toIndex(set)` → TS text; `componentName(name)` → PascalCase identifier or throws; `emit(folder, { as, to, wrapper })` → `string[]` of written paths; `main(argv)`.
- `--as svg` writes `<name>.svg` files plus `index.ts` into `--to`; `--as react` writes `--to` as one `.tsx` file; `--as sprite` writes `--to` as one `.svg`.
- `--wrapper <fn>`: with it, the react file is `export const ICONS = { name: fn(<>…</>), … }` (the Hairline pattern); without it, one exported component per icon taking `SVGProps<SVGSVGElement>`.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { componentName, toReact, toSprite, toIndex, emit } from "../../skills/pretty-icons/emit.mjs";
import { readSet } from "../../skills/pretty-icons/check.mjs";

const fix = new URL("./fixtures/good-16/", import.meta.url).pathname;

test("componentName", () => {
  assert.equal(componentName("all"), "AllIcon");
  assert.equal(componentName("my-icon"), "MyIconIcon");
  assert.equal(componentName("two_fa"), "TwoFaIcon");
  assert.throws(() => componentName("2fa"), /identifier/);
  assert.throws(() => componentName("a b"), /identifier/);
});

test("react: one component per icon, attributes camel-cased", () => {
  const tsx = toReact(readSet(fix), {});
  assert.ok(tsx.includes("export const CardIcon"));
  assert.ok(tsx.includes("fillOpacity={0.2}") || tsx.includes('fillOpacity=".2"'));
  assert.ok(tsx.includes("strokeWidth"));
  assert.ok(!tsx.includes("fill-opacity"), "no kebab attributes in JSX");
  assert.ok(tsx.includes("aria-hidden"));
  assert.ok(tsx.includes("SVGProps<SVGSVGElement>"));
});

test("react with a wrapper: the Hairline shape", () => {
  const tsx = toReact(readSet(fix), { wrapper: "svg" });
  assert.ok(tsx.includes("export const ICONS = {"));
  assert.ok(tsx.includes("card: svg("));
  assert.ok(!tsx.includes("export const CardIcon"));
});

test("sprite: one symbol per icon with the root's viewBox", () => {
  const svg = toSprite(readSet(fix));
  assert.equal((svg.match(/<symbol /g) ?? []).length, 4);
  assert.ok(svg.includes('id="card"') && svg.includes('viewBox="0 0 16 16"'));
});

test("index", () => {
  const ts = toIndex(readSet(fix));
  assert.ok(ts.includes('import card from "./card.svg";'));
  assert.ok(ts.includes("export const icons = { card, disc, phone, tile }"));
});

test("emit svg writes files and refuses a failing set", async () => {
  const to = mkdtempSync(join(tmpdir(), "pi-"));
  const written = await emit(fix, { as: "svg", to });
  assert.equal(written.length, 5);
  assert.ok(existsSync(join(to, "card.svg")) && existsSync(join(to, "index.ts")));
  await assert.rejects(emit(new URL("./fixtures/hairline-before/", import.meta.url).pathname, { as: "svg", to }), /check/);
});

test("emit react and sprite write one file each", async () => {
  const to = mkdtempSync(join(tmpdir(), "pi-"));
  assert.deepEqual(await emit(fix, { as: "react", to: join(to, "icons.tsx") }), [join(to, "icons.tsx")]);
  assert.deepEqual(await emit(fix, { as: "sprite", to: join(to, "icons.svg") }), [join(to, "icons.svg")]);
  assert.ok(readFileSync(join(to, "icons.tsx"), "utf8").includes("CardIcon"));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/pretty-icons/emit.test.mjs`
Expected: FAIL, module not found

- [ ] **Step 3: Write `emit.mjs`**

```js
#!/usr/bin/env node
/**
 * Writes a passing set where the app consumes icons:
 *   node emit.mjs <folder> --as svg    --to <dir>          one .svg per icon and an index.ts
 *   node emit.mjs <folder> --as react  --to <file.tsx>     one component per icon; --wrapper <fn> for the ICONS = { name: fn(<>…</>) } shape
 *   node emit.mjs <folder> --as sprite --to <file.svg>     one <symbol> per icon
 * It converts; it never draws or moves a coordinate, and it runs check.mjs first.
 */
import { copyFileSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSet, readSet, formatFailure } from "./check.mjs";
import { parse } from "./svg.mjs";

const JSX = { "fill-opacity": "fillOpacity", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "stroke-dasharray": "strokeDasharray", "fill-rule": "fillRule", "clip-rule": "clipRule" };
const KEEP = ["viewBox", "width", "height", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "aria-hidden"];

export function componentName(name) {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) throw new Error(`"${name}" cannot become an identifier: start with a letter, use letters, digits, - or _`);
  return name.split(/[-_]/).map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Icon";
}

const jsxAttrs = (attrs) => Object.entries(attrs).map(([k, v]) => `${JSX[k] ?? k}="${v}"`).join(" ");
const inner = (s) => parse(s.text).elements.map((el) => `<${el.tag} ${jsxAttrs(el.attrs)} />`);
const rootAttrs = (s) => Object.fromEntries(Object.entries(parse(s.text).attrs).filter(([k]) => KEEP.includes(k)));

export function toReact(set, { wrapper } = {}) {
  if (wrapper) {
    const entries = set.map((s) => `  ${/^[a-z_$][\w$]*$/i.test(s.name) ? s.name : JSON.stringify(s.name)}: ${wrapper}(\n    <>\n${inner(s).map((l) => `      ${l}`).join("\n")}\n    </>,\n  ),`);
    return `// Drawn by pretty-icons; edit the .svg sources and emit again rather than this file.\nexport const ICONS = {\n${entries.join("\n")}\n};\n`;
  }
  const comps = set.map((s) => {
    const root = rootAttrs(s);
    return `export const ${componentName(s.name)} = (props: SVGProps<SVGSVGElement>) => (\n  <svg ${jsxAttrs(root)} {...props}>\n${inner(s).map((l) => `    ${l}`).join("\n")}\n  </svg>\n);`;
  });
  return `import type { SVGProps } from "react";\n\n// Drawn by pretty-icons; edit the .svg sources and emit again rather than this file.\n\n${comps.join("\n\n")}\n`;
}

export function toSprite(set) {
  const symbols = set.map((s) => {
    const root = rootAttrs(s);
    const attrs = Object.entries(root).filter(([k]) => k !== "width" && k !== "height" && k !== "aria-hidden").map(([k, v]) => `${k}="${v}"`).join(" ");
    return `  <symbol id="${s.name}" ${attrs}>\n${parse(s.text).elements.map((el) => `    <${el.tag} ${Object.entries(el.attrs).map(([k, v]) => `${k}="${v}"`).join(" ")} />`).join("\n")}\n  </symbol>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n")}\n</svg>\n`;
}

export function toIndex(set) {
  const names = set.map((s) => s.name);
  return `${names.map((n) => `import ${n} from "./${n}.svg";`).join("\n")}\n\nexport const icons = { ${names.join(", ")} };\n`;
}

export async function emit(folder, { as, to, wrapper }) {
  const dir = resolve(folder);
  const r = await checkSet(dir);
  if (!r.measured) throw new Error(`check: not measured: ${r.why}`);
  if (r.failures.length) throw new Error(`check failed:\n${r.failures.map(formatFailure).join("\n")}`);
  const set = readSet(dir), dest = resolve(to);
  if (as === "svg") {
    mkdirSync(dest, { recursive: true });
    const written = set.map((s) => { const p = join(dest, `${s.name}.svg`); copyFileSync(s.path, p); return p; });
    const idx = join(dest, "index.ts"); writeFileSync(idx, toIndex(set)); written.push(idx);
    return written;
  }
  mkdirSync(dirname(dest), { recursive: true });
  if (as === "react") { writeFileSync(dest, toReact(set, { wrapper })); return [dest]; }
  if (as === "sprite") { writeFileSync(dest, toSprite(set)); return [dest]; }
  throw new Error(`--as must be svg, react or sprite, not "${as}"`);
}

export async function main(argv) {
  const folder = argv.find((a) => !a.startsWith("--"));
  const flag = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3); };
  const as = flag("as"), to = flag("to"), wrapper = flag("wrapper");
  if (!folder || !as || !to) { console.error("usage: node emit.mjs <folder> --as svg|react|sprite --to <path> [--wrapper <fn>]"); process.exit(1); }
  try { for (const p of await emit(folder, { as, to, wrapper })) console.log(p); }
  catch (e) { console.error(e.message); process.exit(1); }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

Note `folder` detection in `main`: `--as svg` puts `svg` as a bare argument too, so take `folder` as the first bare argument that is not the value of a flag: `argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--") )[0]`. Use that expression.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/pretty-icons/emit.test.mjs`
Expected: PASS, 7 tests

- [ ] **Step 5: Run the whole suite once**

Run: `npm test`
Expected: every test passes (presets 6, svg 4, check-text 12, geometry 8, raster 5, check 8, sheet 3, emit 7).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: emit.mjs writes a set as svg, react or sprite"
```

---

### Task 9: The corrected Hairline set, the Lucide fixture, and the reference ink

**Files:**
- Create: `skills/pretty-icons/examples/hairline/{all,interfaces,data,machines,devices,coding,security,connectivity,empty,marks}.svg`
- Create: `test/pretty-icons/fixtures/lucide/*.svg` (ten)
- Modify: `skills/pretty-icons/presets.mjs` (`REFERENCE_INK[16]`)
- Test: `test/pretty-icons/examples.test.mjs`

**Interfaces:**
- Consumes: `checkSet`, `writeSheets`, `body` / `bodySvg`.
- Produces: the set `rules.md` cites, and the number `REFERENCE_INK[16]`.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { checkSet } from "../../skills/pretty-icons/check.mjs";
import { REFERENCE_INK } from "../../skills/pretty-icons/presets.mjs";

const examples = new URL("../../skills/pretty-icons/examples/hairline/", import.meta.url).pathname;
const lucide = new URL("./fixtures/lucide/", import.meta.url).pathname;

test("examples/hairline: ten icons, every rule passes", async () => {
  assert.equal(readdirSync(examples).filter((f) => f.endsWith(".svg")).length, 10);
  const r = await checkSet(examples);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon}`), []);
});

test("the reference ink is the examples' median, rounded to one decimal", async () => {
  const r = await checkSet(examples);
  const inks = r.rows.map((x) => x.ink).sort((a, b) => a - b);
  assert.equal(REFERENCE_INK[16], Math.round(inks[5] * 10) / 10);
});

test("lucide at 24 passes live, gap and gravity", async () => {
  assert.equal(readdirSync(lucide).filter((f) => f.endsWith(".svg")).length, 10);
  const r = await checkSet(lucide, { grid: 24 });
  assert.equal(r.measured, true);
  const own = r.failures.filter((f) => ["live", "gap", "gravity"].includes(f.rule));
  assert.deepEqual(own.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/pretty-icons/examples.test.mjs`
Expected: FAIL, folders missing

- [ ] **Step 3: Fetch the Lucide fixture**

Lucide is ISC-licensed; the ten are chosen for being one or two elements on a clear keyline. Keep their files as published, with the licence line in the fixture folder:

```bash
cd ~/estudos/skills && F=test/pretty-icons/fixtures/lucide && mkdir -p $F
for n in circle square smartphone shield code-xml layout-grid link-2 chart-column target triangle; do
  curl -fsSL "https://unpkg.com/lucide-static@latest/icons/$n.svg" -o "$F/$n.svg"
done
printf 'Ten icons from Lucide (https://lucide.dev), ISC licence, unchanged. They are here to show that live, gap and gravity are no narrower than Lucide draws.\n' > $F/LICENSE.txt
ls $F | wc -l   # 11
node skills/pretty-icons/check.mjs $F --grid=24 --print
```

Expected from the last command: failures on `stroke` (Lucide's root has `stroke-width="2"` ✓ but `width="24" height="24"` and a `class`: `class` is a `stroke`-rule failure by our FORBIDDEN_ATTRS), `construction` (no fills), `radius`, `keyline`, `weight`; **none on `live`, `gap`, `gravity`**. If `gap` fails on one, read the line: the two elements in question either touch (then `TOUCH` must be read against sampled distance at the step used) or Lucide really leaves less than 2 px there, in which case swap that icon for another of the same shape and say which in the commit message. If `gravity` fails on `shield` or `triangle`, that is the shape's own top-heaviness; Lucide centres by bounds there, so swap for an icon centred by gravity (`circle-dot`, `hexagon`) rather than loosening `GRAVITY_TOL`.

- [ ] **Step 4: Draw the corrected ten**

Start every body from `body(16, format)`. The concept list (object, keyline, elements) is fixed by the current icons; only geometry changes:

| icon | format | start from | detail |
| --- | --- | --- | --- |
| all | square | four `rect` 4.5 × 4.5 rx 1 at x,y ∈ {2.5, 9} → edges 1.75..14.25; but four elements break `count` (3). Draw it as **one** body square 12.5 and one path of a cross `M8 2.5v11M2.5 8h11` (two subpaths in one path): a window of four panes | one `path` |
| interfaces | landscape | `rect x 1.75 y 3.25 w 12.5 h 9.5 rx 1.5` | `path M1.75 6.75h12.5` (a title bar; it shares the body's edge, so it touches) |
| data | landscape | three bars inside the landscape keyline: `rect x 2.5 y 8 w 2.5 h 5.25 rx 1`, `rect x 6.75 y 3.25 w 2.5 h 10 rx 1`, `rect x 11 y 5.75 w 2.5 h 7.5 rx 1`; gaps between bars must be ≥ 1.5 outer to outer (centre to centre 1.75 → 0.25 outer: **fails**), so widen: `x 2.5 w 2.25`, `x 6.875`… no, stay on the 0.25 grid: bars at x 2.5, 6.75, 11, width 2 → centreline gap 2.25, outer 0.75: still fails. Use **two** bars and a baseline: `rect x 3.25 y 6.5 w 3 h 6.75 rx 1`, `rect x 9.75 y 3.25 w 3 h 10 rx 1`, `path M1.75 13.25h12.5` touching both | — |
| machines | circle | `circle cx 8 cy 8 r 6.25` | `circle cx 8 cy 8 r 1.5` (a hub; gap 6.25−1.5−1.5 = 3.25 ≥ 1.5 ✓) |
| devices | portrait | `rect x 3.25 y 1.75 w 9.5 h 12.5 rx 1.5` | `path M7 11.75h2` (home bar; 12.5 − 11.75 = 0.75 + stroke… it must be ≥ 1.5 from the body's bottom edge centreline at 14.25 → 2.5 ✓) |
| coding | landscape | `rect x 1.75 y 3.25 w 12.5 h 9.5 rx 1.5` | braces as one path, `M6 5.75c-1 0-1.25.5-1.25 1.25v.5c0 .75-.25 1.25-1 1.25.75 0 1 .5 1 1.25v.5c0 .75.25 1.25 1.25 1.25M10 5.75c1 0 1.25.5 1.25 1.25v.5c0 .75.25 1.25 1 1.25-.75 0-1 .5-1 1.25v.5c0 .75-.25 1.25-1.25 1.25` (that is 14 commands: over `count`'s 8; write each brace as `M6 5.75Q4.75 5.75 4.75 7v.5Q4.75 8 3.75 8Q4.75 8 4.75 9v.5Q4.75 10.25 6 10.25` = 7 commands, one path per brace, two paths + body = 3 elements ✓; the brace's left tip at x 3.75 is 2 from the body's left centreline at 1.75 → outer 0.5: **gap fails**; move the braces in: tips at x 4.75 and 11.25 (gap 3 → outer 1.5 ✓) |
| security | portrait | a shield path inside the portrait keyline: `M8 1.75 12.75 3.5v4.25c0 3-2.25 5-4.75 6.5-2.5-1.5-4.75-3.5-4.75-6.5V3.5Z` (ink 11 wide: 3.25−0.75=2.5 … 12.75+0.75=13.5 ✓; tall 1.75−0.75=1 … 14.25 ✓) | `path M6 8l1.5 1.5L10 6.5` |
| connectivity | landscape | two nodes and a link, as now, but on the landscape keyline and with gap ≥ 1.5: `circle cx 4 cy 10.5 r 1.5`, `circle cx 12 cy 5.5 r 1.5`, `path M5.25 9.75l5.5-3.5` (its ends sit 0.25 from each ring's centreline → outer −1.25 → touching? `TOUCH` is 0.1: so end the path **on** the ring: `M5.3 9.7` is off-grid. Put rings at `cx 4 cy 11 r 1.5` and `cx 12 cy 5 r 1.5`, link `M5.5 10.25 10.5 5.75` whose ends lie on the rings within 0.1 (check: distance from (5.5,10.25) to (4,11) is 1.68 ≈ r 1.5 + 0.18 — too far; iterate with `check.mjs` until `gap` reads touching) | — |
| empty | square | `rect x 2.5 y 2.5 w 11 h 11 rx 1.5` with `stroke-dasharray="2 2.5"` and the fill on the same element (one body, dashed) | — |
| marks | landscape | triangle `M8 3.75 13.5 12.25h-11Z` plus `circle cx 12.5 cy 4.5 r 1.5` (gap from the triangle's right edge: measure) | — |

Write each as a file with the root of the `hairline-before` fixture, then iterate:

```bash
cd ~/estudos/skills
node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline --print
```

Read every failure line and fix that icon; for `weight`, move ink between icons (a shorter or longer detail line) rather than changing a body. Repeat until `ok`.

- [ ] **Step 5: Look, then read blind**

```bash
node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/hairline --out=/tmp --seed=3
```

Open `/tmp/pretty-icons-sheet.png` and look at the four row blocks: the ten must sit as one weight and one height. Then open a fresh subagent (general-purpose) with **only** this prompt and the blind image path, and no other context:

> This image shows 10 numbered icons from one sidebar. Below are 10 names in alphabetical order: all, coding, connectivity, data, devices, empty, interfaces, machines, marks, security. Read no file but the image. For each number, say the name it stands for and, in five words or fewer, the object you see. If two numbers compete for one name, say so.

Compare with the key `sheet.mjs` printed. Any icon the reader does not pair goes back to Step 4; a new reader (a new subagent) gets the new sheet. Record the reader's answers verbatim in the commit message of Step 7: they are the hand-over's "what the reader got wrong first".

- [ ] **Step 6: Set the reference ink**

From `check.mjs … --print`, take the median of the ten `ink` values (the sixth when sorted), round to one decimal, and set `REFERENCE_INK = { 16: <that> }` in `presets.mjs`.

- [ ] **Step 7: Run the test to verify it passes**

Run: `node --test test/pretty-icons/examples.test.mjs && npm test`
Expected: PASS, all

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: the corrected hairline set, the lucide fixture, the reference ink

blind read (seed 3): <paste the reader's ten lines>"
```

---

### Task 10: Baseline, the skill's RED

**Files:**
- Create: `docs/superpowers/baselines/2026-10-05-pretty-icons-baseline.md`

**Interfaces:**
- Consumes: `check.mjs`, the ten Hairline names.
- Produces: the list of what an agent gets wrong without the skill, which Tasks 11–12 must address and nothing more.

- [ ] **Step 1: Run the scenario without the skill**

Open a fresh subagent (general-purpose) with **only** this prompt; give it a scratch folder and no access to `skills/pretty-icons`:

> Draw ten SVG icons for a sidebar, 16 × 16, stroke 1.5 round caps and joins in currentColor, with a currentColor fill at 20% under every closed shape. The names: all, interfaces, data, machines, devices, coding, security, connectivity, empty, marks. Write one file per icon, `<name>.svg`, into `<scratch>/baseline-a/`. Make them sit even in a row.

Then run `node skills/pretty-icons/check.mjs <scratch>/baseline-a --print` and save the table and the failure lines.

- [ ] **Step 2: Run it twice more**

Two more fresh subagents, same prompt, folders `baseline-b` and `baseline-c`. Three runs are the minimum to tell a habit from an accident.

- [ ] **Step 3: Write the baseline note**

`docs/superpowers/baselines/2026-10-05-pretty-icons-baseline.md`: the prompt, then per run the `--print` table and the failure lines, then a list of the failures that appeared in two or more runs, one line each, as a rule name and what the agent did (e.g. `keyline: landscape bodies drawn 12 wide`, `gap: details 0.5 from the body`, `construction: fill on the detail lines`, `grid: coordinates like 4.33`). Those lines are the baseline the SKILL.md must turn into passes. Also record anything the agent did that no rule catches (e.g. a metaphor nobody would read, letters as icons) — that goes to `read.md`'s criteria and the "what goes wrong" table.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: pretty-icons baseline, three runs without the skill"
```

---

### Task 11: `rules.md` and `read.md`

**Files:**
- Create: `skills/pretty-icons/rules.md`
- Create: `skills/pretty-icons/read.md`

**Interfaces:**
- Consumes: the spec's rules and presets, the baseline's failure list, `REFERENCE_INK`, `body()` geometry.
- Produces: the two reference files `SKILL.md` points at.

- [ ] **Step 1: Write `rules.md`**

In the voice of `hairline/skills/hairline-create/rules.md`: a one-paragraph head, then the preset table and the body-geometry table from the spec (the body table printed from `body()` so the numbers cannot drift: `node -e 'import("./skills/pretty-icons/presets.mjs").then(m => { for (const G of [16,20,24]) for (const f of m.FORMATS) console.log(G, f, JSON.stringify(m.body(G, f))) })'`), then the ten rules, each as:

```markdown
## 02 · keyline: the ink lands on a keyline

Each icon takes the format that describes it (circle, square, portrait, landscape) and its ink, stroke included, fills that keyline within half a unit on each side. A landscape body is as wide as the live area so a short icon does not read smaller than a tall one beside it.

- **Keep it:** start from the body for that format in the table above; a detail never pushes the ink past the body. For an icon with no body (two nodes and a link), place the outer elements so their outer edges land on the keyline.
- **Rejected when:** `check.mjs` prints `keyline`: the ink box is off every keyline by more than 0.5 on a side. A 12.5 × 10.5 landscape (0.75 too narrow, 0.5 too short) is the common case.
```

Every "Rejected when" names the `check.mjs` rule that prints it, or says "read" when only the reader catches it (rule 9). Rule 5 states the reference ink and that a set of three or more is measured against its own median. Rule 8's "Keep it" says how to make a detail touch a body: end the path on the body's centreline, on the grid. Rule 9's "Keep it" lists the baseline's bad metaphors as what not to draw. Each line of the baseline's failure list must be answerable by pointing at one rule's "Keep it".

- [ ] **Step 2: Write `read.md`**

```markdown
# The blind read

`check.mjs` proves the set is even. It cannot tell a shield from a leaf. That is the reader's job: a second agent that has seen none of your work.

## When

After `check.mjs` says `ok` and `sheet.mjs` has written `pretty-icons-blind.png`. Every time the set changes.

## How

Open a fresh agent with no access to this conversation. Give it the blind image and this prompt, with N and the names filled in, the names in alphabetical order:

> This image shows N numbered icons from one sidebar. Below are N names in alphabetical order: <names>. Read no file but the image. For each number, say the name it stands for and, in five words or fewer, the object you see. If two numbers compete for one name, say so.

Compare its answers with the key `sheet.mjs` printed.

## Pass and fail

An icon passes when the reader gives its name, or names the object you declared in the concept (`security → "shield with a check"` counts). It fails when the reader gives a wrong name, says two numbers compete for one name, or says it does not know.

A failed icon goes back to the drawing. Then the whole set runs `check.mjs` again (the median moved), `sheet.mjs` again, and a **new** reader gets the new sheet. A reader who saw the old sheet is not blind.

## Without a second agent

Say so in the hand-over, in these words: **not read blind**. Do not read the sheet yourself and call it read.
```

- [ ] **Step 3: Check the body table against `body()`**

Run the `node -e` line from Step 1 and diff by eye against the table in `rules.md`; every number must match.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: pretty-icons rules.md and read.md"
```

---

### Task 12: `SKILL.md`, then the GREEN run

**Files:**
- Create: `skills/pretty-icons/SKILL.md`
- Modify: `docs/superpowers/baselines/2026-10-05-pretty-icons-baseline.md` (append the with-skill results)

**Interfaces:**
- Consumes: everything above.
- Produces: the installable skill.

- [ ] **Step 1: Write `SKILL.md`**

Frontmatter and body in the shape of `hairline/skills/hairline-create/SKILL.md`. The description names triggers only, not the process:

```markdown
---
name: pretty-icons
description: Use when an app needs a set of small UI icons (sidebar, nav, tabs, categories) drawn to match each other, or when existing icons look uneven in a row (one bigger, one lighter, one off centre), or when someone runs /pretty-icons with a list of names or a file.
argument-hint: "[names, or a file with the nav]"
---

# pretty-icons: a set that sits even

You are drawing a set of icons for one app in one style: a stroke in `currentColor` with a `currentColor` fill at 20% under every body, on one of three grids. What makes them a set is not taste but measurement: `check.mjs` reads and measures every icon against the others and against the keylines, and a reader who has seen none of your work must name each one from the picture alone. `examples/hairline` is the bar: ten icons for one sidebar, drawn to these rules.

Every file named below is in this skill's folder. Icons are drawn in the person's working directory, in a folder `pretty-icons/`; run the scripts from there, by their path in this folder.

## 1. Read

… (the spec's step 1, as instructions: what to look for, where, and the three facts to write back before drawing; name the preset table in `rules.md`)

## 2. Conceive

… (one line per name: object, format, elements; present the whole list; wait; without a person, take the conventional one and say so)

## 3. Draw

… (read `rules.md` first; start every body from the table; `rect`, `circle`, `line`, short `path`; one file per icon)

## 4. Check

… (`node check.mjs pretty-icons/` to `ok`; `node sheet.mjs pretty-icons/`; look at the sheet; then `read.md`)

## 5. Hand over

… (`node emit.mjs …` with the format from step 1; the three lines of the hand-over)

## 6. Adjust

… (edit one `.svg`, run 4 and 5 for the whole set)

## What goes wrong

| If you catch yourself | Do this instead |
| --- | --- |
| writing coordinates that are not on the quarter grid | take the body from the table in `rules.md` and move details by 0.25 |
| drawing a body with no contour because the fill reads as a shape | rule 04: a body is contour plus fill, always |
| making a landscape icon narrower so it "looks lighter" | rule 02: it fills the landscape keyline; lighten it by shortening a detail |
| placing a detail a little away from the body so they "don't merge" | rule 08: a stroke apart, or touching on the centreline; nothing between |
| adding a fourth element to make the metaphor clearer | rule 09: three at most; if it needs a fourth, the metaphor is wrong |
| drawing a letter or a digit | rule 09: geometry, unless the glyph is the subject |
| reading the sheet yourself and calling it read | `read.md`: a second agent, or say "not read blind" |
| editing emit's output by hand | edit the `.svg`, run check, emit again |
| skipping check for a one-icon change | weight and median belong to the set; check the set |
```

Fill every "…" with the instruction text, two to eight lines each, in the voice of hairline-create's SKILL.md. Add a row to "What goes wrong" for each baseline failure that no row above covers. `wc -w skills/pretty-icons/SKILL.md` must stay under 900 words; the detail lives in `rules.md`.

- [ ] **Step 2: Run the scenario with the skill**

Three fresh subagents, same prompt as the baseline's, each told in one extra line: "Use the skill at `<repo>/skills/pretty-icons` (read its SKILL.md first)". Folders `with-a`, `with-b`, `with-c`. For each: `node skills/pretty-icons/check.mjs <folder> --print`; then `sheet.mjs` and one blind reader per set, as `read.md` says.

Pass when: at least two of three sets reach `ok` on `check.mjs` without the executor's help, and in every set the reader pairs at least nine of ten.

- [ ] **Step 3: Close the loopholes**

For each failure line that still appears in two or more of the with-skill runs, find the step or rule the agent read and did not follow, and tighten that text (a number instead of an adjective, a "Rejected when" instead of advice, a row in "What goes wrong" quoting the agent's own words). Re-run the three with-skill agents after each change until Step 2's bar is met. Append every run's results and every text change to the baseline note.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: pretty-icons SKILL.md, with-skill runs recorded"
```

---

### Task 13: Install from the repo and replace the Hairline icons

**Files:**
- Modify: `~/estudos/hairline/apps/site/components/catalogue.tsx:16-88`
- Create: `~/estudos/hairline/apps/site/components/shelf-icons.tsx`

**Interfaces:**
- Consumes: `emit.mjs --as react --wrapper svg`, `examples/hairline`.

- [ ] **Step 1: Push the repo and install the skill as a user would**

```bash
cd ~/estudos/skills && gh repo create lucasmarkes/skills --public --source=. --push
cd ~/estudos/hairline && npx skills add lucasmarkes/skills
```

Expected: the CLI lists `pretty-icons` and installs it for the chosen agents. If `npx skills add` cannot see the repo yet, wait for GitHub to index and retry once.

- [ ] **Step 2: Emit the corrected set into the Hairline site**

```bash
cd ~/estudos/hairline && git checkout -b pretty-icons
node ~/estudos/skills/skills/pretty-icons/emit.mjs ~/estudos/skills/skills/pretty-icons/examples/hairline --as react --wrapper svg --to apps/site/components/shelf-icons.tsx
```

Then in `shelf-icons.tsx` add at the top the wrapper and the type, moved from `catalogue.tsx` lines 14–20:

```tsx
import type { ReactNode } from "react";
import type { ShelfId } from "@/lib/catalogue";

export type Filter = "all" | ShelfId;

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
```

and type the emitted object `export const ICONS: Record<Filter, ReactNode> = { … }`. In `catalogue.tsx`, delete lines 14–88 (the `Filter` type, `svg`, `ICONS`) and add `import { ICONS, type Filter } from "./shelf-icons";`.

- [ ] **Step 3: Run the site's checks**

```bash
cd ~/estudos/hairline && pnpm --filter site typecheck && pnpm --filter site test
```

Expected: both pass. `apps/site/test/figures.spec.ts` mentions the shelf titles; if it snapshots icon markup, update the snapshot and say so in the commit.

- [ ] **Step 4: Look at it running**

Run the site (`pnpm --filter site dev`) and open the catalogue; screenshot the shelf list at 1× and compare with the user's image: the ten must sit as one height and weight in the row, and Coding must no longer sit smaller than Security.

- [ ] **Step 5: Commit on the branch**

```bash
cd ~/estudos/hairline && git add -A && git commit -m "site: shelf icons redrawn with pretty-icons

before/after measures from check.mjs --print:
<paste both tables>"
```

Leave the branch for the user to open the PR.

---

## Self-review

**Spec coverage.** Decisions 1–5 → Tasks 1 (presets, one style), 8 (delivery formats), 9 + 11 (blind reader), 5 (resvg from cache), repo layout (Task 1, no site). Presets and body geometry → Task 1. Ten rules: 1 grid → Task 3 (`grid`) + Task 6 (`live`); 2 → 6; 3 → 3; 4 → 3; 5 → 6; 6 → 6; 7 → 3; 8 → 6 via Task 4; 9 → 3 (`count`) + reader (Task 11); 10 → `checkSet` reads the folder as a set (Task 3) and `weight` uses its median (Task 6). Five steps of the skill → Task 12. `check.mjs` layers, exit codes, `--print` → Tasks 3, 6. `sheet.mjs` two outputs → Task 7. `emit.mjs` three formats, wrapper → Task 8. Cache dir and install → Task 5. Blind read prompt and criteria → Task 11. Repo tree → Tasks 1, 9, 10 (the baseline folder is new; it is `docs/superpowers/baselines/`, beside specs and plans). Success 1 → Task 9's test; success 2 → Task 9 Step 5 and Task 12 Step 2; success 3 → Task 13.

**Placeholders.** The "…" blocks in Task 12 Step 1 are filled by the executor from the spec's "The skill" section, which the step names; each has its content listed in parentheses. `REFERENCE_INK` starts at a real figure (70, the current set's rounded median) and is replaced in Task 9 by a measured one. No "TBD".

**Type consistency.** `Failure = { rule, icon, got, want }` everywhere; `checkSet` returns `{ G, failures, measured, why, rows }` and is awaited in sheet, emit and the tests; `readSet` returns `{ name, path, text }`; `measure` returns `{ box, mass, ink }` and `measuredChecks` turns it into `rows` of `{ icon, w, h, keyline, ink, dx, dy }`, which `composeSheet` reads by `icon`. `body()` and `bodySvg()` live in presets; `nearestKeyline` in measure.

**Review Focus.** 1 → Task 3 tests "origin other than 0 0" and "fill=none on the root". 2 → Task 4 tests relative arc and `H`/`V`. 3 → Task 6 test "weight with one icon". 4 → Task 6 test "crossing counts as touching". 5 → Task 8 test `componentName` throws on `2fa`.
