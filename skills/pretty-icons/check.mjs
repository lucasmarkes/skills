#!/usr/bin/env node
/**
 * Checks a folder of icons as one set: `node check.mjs <folder>`. It prints
 * one line per failure, `rule  icon  measured → expected`, and exits 1; or
 * prints `ok` and exits 0. Exit 2 means the rasteriser could not be had and
 * the measured rules did not run; the last line then says `not measured`.
 * `--print` also prints every icon's measures as a table, before the failures.
 *
 * Text rules, read from the file (the duotone finish, grids 16–24; filled.mjs has the 48 grid's):
 *   canvas        viewBox="0 0 G G", the same G in every file, G a preset
 *   elements      only rect, circle, line, path; nothing nested, no text
 *   stroke        the preset's width, round caps and joins, currentColor, nothing else coloured,
 *                 no fill on the root, dashes no shorter than the stroke
 *   construction  at least one body; a filled element is closed, has a contour and the .2 fill
 *   grid          every number a multiple of 0.25
 *   contour       a filled path has at most five straight sides; a rect, a circle or a curve passes
 *   radius        rx by the shape's size (at 48, by what the object is: cut, cased, moulded or a pill)
 *   modifier      one per icon, of a known kind, its size and corner from the preset, at stroke-opacity 0.6
 *                 or none in duotone, none at 48; no other stroke inside its halo (modifiers.mjs)
 *   shadow        the filled finish only, the whole set or none: a copy of every element, first, in the
 *                 shade tone, translate(1.5 1.5), marked data-shadow (shadow.mjs writes it); every
 *                 other rule reads the icon without it
 *   count         at most three elements (a modifier and, in duotone, a cut contour left out), at most eight commands in a path (implicit repeats count);
 *                 the details (every element without a fill) at most two subpaths and eight
 *                 drawing commands between them (moves left out)
 * Measured rules, from pixels: live, keyline, weight, gravity, gap. An icon that
 * fails canvas or elements is not measured, and stays out of the set's median;
 * gap also holds the subpaths of one path apart.
 */
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preset, radiiFor, finishOf, FILL, GRIDS } from "./presets.mjs";
import { FORBIDDEN_ATTRS, ROOT_FORBIDDEN, parse, num, G as gridOf, ELEMENTS, pathNumbers, pathCommands, moves, isClosed } from "./svg.mjs";
import { straightSides } from "./geometry.mjs";
import { filledChecks } from "./filled.mjs";
import { curveFailures, curveColumns, pixelNotes } from "./curve.mjs";
import { modifierFailures, isModifier, isCut, isSplit } from "./modifiers.mjs";
import { isShadow, shadowFailures } from "./shadow.mjs";
import { bulkChecks, isKnockout, uncut } from "./bulk.mjs";

export { pathCommands, isClosed };

const COLOUR_ATTRS = ["stroke", "fill", "color", "stop-color"];
const ROUND_ATTRS = ["stroke-linecap", "stroke-linejoin"];
const DASH_RE = /^\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)\s*$/;
// A body's straight sides past this are facets (a hexagon, a cut stone); five is a house. The details' cap, over all of them.
const SIDES = 5, DETAIL_SUBPATHS = 2, DETAIL_COMMANDS = 8;
const GEOMETRY = ["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2"];

const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
const keyword = (v) => String(v).trim().toLowerCase();
const isCurrent = (v) => v !== undefined && keyword(v) === "currentcolor";
const isNone = (v) => v !== undefined && keyword(v) === "none";
export const formatFailure = (f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`;

export function readSet(folder) {
  const dir = resolve(folder);
  return readdirSync(dir).filter((f) => f.endsWith(".svg")).sort()
    .map((f) => ({ name: basename(f, ".svg"), path: join(dir, f), text: readFileSync(join(dir, f), "utf8") }));
}

/** A detail's subpaths and drawing commands: a circle, rect or line is one of each; a path's moves are not drawing. */
export function detailCounts(el) {
  if (el.tag !== "path") return { subpaths: 1, drawing: 1 };
  const d = el.attrs.d ?? "";
  return { subpaths: Math.max(1, moves(d)), drawing: pathCommands(d) - moves(d) };
}
const onGrid = (n, step) => Math.abs(n / step - Math.round(n / step)) < 1e-9;

function checkDash(failures, icon, where, v, stroke) {
  const m = DASH_RE.exec(v);
  if (!m || Number(m[1]) < stroke || Number(m[2]) < stroke) fail(failures, "stroke", icon, `${where} stroke-dasharray ${v}`, `dash and gap ≥ ${stroke}`);
}

export function textChecks(icon, text, expectG, finish) {
  const failures = [];
  const parsed = parse(text);
  const G = gridOf(parsed.attrs);
  const root = parsed.attrs;

  if (G === null) fail(failures, "canvas", icon, `viewBox ${root.viewBox ?? "missing"}`, `0 0 ${expectG} ${expectG}`);
  else if (G !== expectG) fail(failures, "canvas", icon, `viewBox ${root.viewBox}`, `0 0 ${expectG} ${expectG}`);
  if (!GRIDS[expectG]) { fail(failures, "canvas", icon, `grid ${expectG}`, `one of ${Object.keys(GRIDS).join(", ")}`); return { G, failures, parsed }; }
  const want = GRIDS[expectG].finish === "filled" ? "filled" : finish ?? finishOf(root) ?? "duotone";
  let p;
  try { p = preset(expectG, want); } catch (e) { fail(failures, "canvas", icon, `finish ${want}`, e.message); return { G, failures, parsed }; }
  const bulk = p.finish === "bulk";

  for (const e of parsed.errors) fail(failures, "elements", icon, e, `only ${ELEMENTS.join(", ")}, flat`);
  // a root that declares the other finish: one line, not a rule-by-rule report of a file judged by the wrong finish
  const declared = finishOf(root);
  if (declared && p.finish !== "filled" && declared !== p.finish) {
    fail(failures, "stroke", icon, `root finish ${declared}`, `${p.finish}, the set's`);
    return { G, failures, parsed };
  }

  if (!bulk) {
    // stroke: the root carries it once; no element may set another width, cap, join or opacity
    const sw = num(root, "stroke-width");
    if (sw !== p.stroke) fail(failures, "stroke", icon, `stroke-width ${root["stroke-width"] ?? "missing"}`, `${p.stroke}`);
    if (root["stroke-linecap"] !== "round") fail(failures, "stroke", icon, `stroke-linecap ${root["stroke-linecap"] ?? "missing"}`, "round");
    if (root["stroke-linejoin"] !== "round") fail(failures, "stroke", icon, `stroke-linejoin ${root["stroke-linejoin"] ?? "missing"}`, "round");
    for (const a of ROOT_FORBIDDEN) if (a in root) fail(failures, "stroke", icon, `root ${a}`, "not set");
    if ("fill" in root && !isNone(root.fill)) fail(failures, "stroke", icon, `fill ${root.fill}`, "none");
    if ("stroke-dasharray" in root) checkDash(failures, icon, "root", root["stroke-dasharray"], p.stroke);
  }
  // the icon's own elements: a shadow copy is shadow.mjs's, judged by shadowFailures alone
  const own = parsed.elements.filter((el) => !isShadow(el));
  for (const el of own) {
    if (bulk) break; // bulkChecks judges the paint
    const a = el.attrs, where = el.at;
    for (const k of FORBIDDEN_ATTRS) if (k in a && !(k === "stroke-opacity" && isModifier(el))) fail(failures, "stroke", icon, `${where} ${k}`, "not set");
    if ("stroke-width" in a && !p.weights.includes(num(a, "stroke-width"))) fail(failures, "stroke", icon, `${where} stroke-width ${a["stroke-width"]}`, p.finish === "filled" ? `not set: the root's ${p.stroke}, or ${p.contour} on a contour` : p.weights.length ? `the root's, or ${p.weights.join(" or ")}` : "the root's");
    for (const k of ROUND_ATTRS) if (k in a && a[k] !== "round") fail(failures, "stroke", icon, `${where} ${k} ${a[k]}`, "round");
    if ("stroke-dasharray" in a) checkDash(failures, icon, where, a["stroke-dasharray"], p.stroke);
  }

  // grid, radius and the per-path count, on every finish
  for (const el of own) {
    const a = el.attrs, where = el.at;
    if (bulk && isKnockout(el)) continue; // a cut body: knockout.mjs wrote its d
    const nums = el.tag === "path" ? pathNumbers(a.d ?? "").map((n, i) => [`d[${i}]`, n]) : Object.entries(a).filter(([k]) => GEOMETRY.includes(k)).map(([k, v]) => [k, Number(v)]);
    for (const [k, n] of nums) if (!onGrid(n, p.step)) fail(failures, "grid", icon, `${where} ${k} ${n}`, `a multiple of ${p.step}`);
    if (el.tag === "rect" && !bulk) {
      const size = Math.min(num(a, "width"), num(a, "height"));
      const want = radiiFor(expectG, size), rx = num(a, "rx", 0);
      if (!want.includes(rx)) fail(failures, "radius", icon, `${where} rx ${rx}`, want.length > 1 ? `rx ${want.slice(0, 3).join(", ")} or ${want[3]}: cut, cased, moulded or a pill` : `rx ${want[0]}`);
    }
    if (el.tag === "path") {
      const n = pathCommands(a.d ?? "");
      if (n > p.commands) fail(failures, "count", icon, `${where} ${n} commands`, `at most ${p.commands}`);
    }
  }
  // the base, without its modifier: what the finish's rules and the count judge
  const base = { ...parsed, elements: own.filter((el) => !isModifier(el)) };
  if (p.finish === "filled") failures.push(...filledChecks(icon, base, expectG));
  else if (bulk) failures.push(...bulkChecks(icon, { ...parsed, elements: own }, p, { folder: textChecks.folder }));
  else duotoneChecks(failures, icon, base, p);

  // a split body's contour is one element with its paint; any other cut stroke counts as the one it was
  const counted = base.elements.filter((el) => !isSplit(el)).length;
  if (counted > p.elements) fail(failures, "count", icon, `${counted} elements`, `at most ${p.elements}`);
  if (own.length === 0) fail(failures, "count", icon, "0 elements", "at least 1");
  // curves, after every other text rule; each path once, since a contour repeats its tone's
  const seen = new Set();
  for (const el of own) {
    const whole = bulk ? uncut(el) : el;
    if (el.tag !== "path" || seen.has(whole.attrs.d)) continue;
    seen.add(whole.attrs.d);
    failures.push(...curveFailures(icon, whole, p?.stroke));
  }
  failures.push(...modifierFailures(icon, parsed, expectG));
  failures.push(...shadowFailures(icon, parsed, expectG));

  return { G, failures, parsed };
}

/** The duotone finish's own rules: currentColor everywhere, the .2 fill under a contour, three elements, the details' cap. */
function duotoneChecks(failures, icon, parsed, p) {
  const root = parsed.attrs;
  if (!isCurrent(root.stroke)) fail(failures, "stroke", icon, `stroke ${root.stroke ?? "missing"}`, "currentColor");
  for (const k of ["color", "stop-color"]) if (k in root && !isCurrent(root[k]) && !isNone(root[k])) fail(failures, "stroke", icon, `root ${k} ${root[k]}`, "currentColor or none");
  let bodies = 0, subpaths = 0, drawing = 0;
  for (const [i, el] of parsed.elements.entries()) {
    const a = el.attrs, where = el.at;
    // a stroke the modifier cut was judged before it was cut (modifiers.mjs checks the base first);
    // a split body's paint, just before its cut contour, carries the body's rules
    const cutAfter = isSplit(parsed.elements[i + 1]);
    if ("transform" in a) fail(failures, "stroke", icon, `${where} transform`, "not set");
    for (const k of COLOUR_ATTRS) if (k in a && !isCurrent(a[k]) && !isNone(a[k])) fail(failures, "stroke", icon, `${where} ${k} ${a[k]}`, "currentColor or none");
    // a cut stroke still passes the colour and transform checks above; only the body and detail accounting skips it
    if (isCut(el)) continue;
    // construction: a filled element is a closed body with a contour and the .2 fill;
    // a closed element with a contour and no fill (a ring, a hub) is allowed
    if (isCurrent(a.fill)) {
      bodies++;
      if (isNone(a.stroke) && !cutAfter) fail(failures, "construction", icon, `${where} stroke none`, "a contour on every body");
      if (num(a, "fill-opacity") !== FILL) fail(failures, "construction", icon, `${where} fill-opacity ${a["fill-opacity"] ?? "1"}`, `${FILL}`);
      if (!isClosed(el)) fail(failures, "construction", icon, `${where} fill ${a.fill}`, "none on a line");
      // contour: a body is a rect, a circle, a path of up to five straight sides, or a path shaped by curves; more is faceted.
      // A path the sampler cannot read is left to measure, which says so in one elements line.
      if (el.tag === "path") {
        let sides = 0;
        try { sides = straightSides(a.d ?? ""); } catch {}
        if (sides > SIDES) fail(failures, "contour", icon, `${where} ${sides} straight sides`, `at most ${SIDES}, or curves`);
      }
    } else {
      const c = detailCounts(el);
      subpaths += c.subpaths; drawing += c.drawing;
    }
  }
  if (bodies === 0 && parsed.elements.length > 0) fail(failures, "construction", icon, "no filled element", "at least one body");
  if (subpaths > DETAIL_SUBPATHS) fail(failures, "count", icon, `details ${subpaths} subpaths`, `at most ${DETAIL_SUBPATHS}`);
  if (drawing > DETAIL_COMMANDS) fail(failures, "count", icon, `details ${drawing} drawing commands`, `at most ${DETAIL_COMMANDS}`);
}

/** The set's grid: the one most files declare, so one odd file fails canvas rather than all the others. */
/** The finish a set declares, by majority of roots; `forced` wins. */
export function setFinish(set, forced) {
  if (forced) return forced;
  const votes = new Map();
  for (const s of set) {
    const f = finishOf(parse(s.text).attrs);
    if (f) votes.set(f, (votes.get(f) ?? 0) + 1);
  }
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function setGrid(set, forced) {
  if (forced) return Number(forced);
  const votes = new Map();
  for (const s of set) { const g = gridOf(parse(s.text).attrs); if (g) votes.set(g, (votes.get(g) ?? 0) + 1); }
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 16;
}

/** A missing measure.mjs, or a rasteriser that cannot be installed or loaded (raster.mjs's NO_RASTER): the measured rules are skipped, not failed. */
const unmeasurable = (e) => e?.code === "ERR_MODULE_NOT_FOUND" || e?.code === "PRETTY_ICONS_NO_RASTER";

export async function checkSet(folder, { grid, finish, measure = true, loadMeasure = () => import("./measure.mjs") } = {}) {
  const set = readSet(folder);
  // nothing to measure, so nothing was left unmeasured
  if (set.length === 0) return { failures: [{ rule: "set", icon: folder, got: "no .svg files", want: "at least one" }], measured: true, why: "", G: null, finish: null, rows: [], notes: [] };
  const G = setGrid(set, grid);
  const F = GRIDS[G]?.finish === "filled" ? "filled" : setFinish(set, finish) ?? GRIDS[G]?.finish ?? "duotone";
  textChecks.folder = folder;
  const failures = [];
  // An icon the text layer could not read (elements) or placed on another canvas is not measured:
  // its text line already says why, and a renderer would only throw on it or skew the median.
  const unreadable = new Set(), readable = [];
  for (const s of set) {
    const { failures: f, parsed } = textChecks(s.name, s.text, G, F);
    // a root of the other finish is reported once and, like an unreadable file, kept out of the medians
    if (f.some((x) => x.rule === "elements" || x.rule === "canvas" || (x.rule === "stroke" && x.got.startsWith("root finish ")))) unreadable.add(s.name);
    else readable.push([s.name, parsed]);
    failures.push(...f);
  }
  // A grid with no preset has nothing to measure against; canvas has failed every icon.
  if (!GRIDS[G]) return { G, finish: F, failures, measured: true, why: "", rows: [], notes: [] };
  // the shadow is the set's: every icon or none
  const shadowed = readable.filter(([, parsed]) => parsed.elements.some(isShadow)).length;
  if (F === "filled" && shadowed && shadowed < readable.length) fail(failures, "shadow", "set", `${shadowed} of ${readable.length} shadowed`, "all or none (shadow.mjs --on|--off)");
  const ownOf = (parsed) => ({ ...parsed, elements: parsed.elements.filter((el) => !isShadow(el)) });
  // notes never fail the set: they say what a person may want to look at
  const notes = readable.flatMap(([name, parsed]) => pixelNotes(name, ownOf(parsed), G));
  const columns = new Map(readable.map(([name, parsed]) => [name, curveColumns(ownOf(parsed).elements)]));
  let measured = false, rows = [], why = "";
  if (measure) {
    try {
      const { measuredChecks } = await loadMeasure();
      const r = await measuredChecks(set.filter((s) => !unreadable.has(s.name)), G, F);
      failures.push(...r.failures); rows = r.rows.map((row) => ({ ...row, ...columns.get(row.icon) })); measured = true;
    } catch (e) {
      if (!unmeasurable(e)) throw e;
      why = e.message;
    }
  }
  return { G, finish: F, failures, measured, why, rows, notes };
}

export async function main(argv) {
  const folder = argv.find((a) => !a.startsWith("--"));
  const grid = argv.find((a) => a.startsWith("--grid="))?.slice(7);
  const finish = argv.find((a) => a.startsWith("--finish="))?.slice(9);
  const usage = "usage: node check.mjs <folder> [--grid=16|20|24|48] [--finish=bulk|duotone] [--print]";
  if (!folder || (finish !== undefined && !["bulk", "duotone"].includes(finish))) { console.error(usage); process.exit(1); }
  let isDir = false;
  try { isDir = statSync(folder).isDirectory(); } catch {}
  if (!isDir) { console.log(formatFailure({ rule: "set", icon: folder, got: "not a folder", want: "an existing folder" })); process.exit(1); }
  const r = await checkSet(folder, { grid, finish });
  if (argv.includes("--print")) { console.table(r.rows); }
  for (const f of r.failures) console.log(formatFailure(f));
  if (r.notes.length) { console.log("notes"); for (const n of r.notes) console.log(formatFailure(n)); }
  if (!r.measured) { console.log(`not measured: ${r.why}`); process.exit(2); }
  if (r.failures.length) process.exit(1);
  console.log("ok");
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
