/**
 * Reads one icon file the way check.mjs needs it: the root's attributes and
 * a flat list of its elements. It is not an XML parser. An icon is a flat
 * svg of rect, circle, line and path; anything else is reported in `errors`
 * and left for the caller to reject.
 */
const ATTR = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const TAG = /<(\/?)([\w:-]+)([^>]*?)(\/?)>/g;
export const ELEMENTS = ["rect", "circle", "line", "path"];
// XML declarations and processing instructions, comments, then DOCTYPE and
// other markup declarations. Comments come before `<!…>` so `-->` ends them.
const SKIP = /<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<![^>]*>/g;

function attrsOf(s) {
  const out = {};
  for (const m of s.matchAll(ATTR)) out[m[1]] = m[2] ?? m[3] ?? "";
  return out;
}

export function parse(text) {
  const out = { attrs: {}, elements: [], errors: [] };
  // Each skipped span keeps only its newlines, so line numbers match the original file.
  const body = text.replace(SKIP, (m) => m.replace(/[^\n]/g, ""));
  const lineAt = (i) => body.slice(0, i).split("\n").length;
  let open = 0;
  let seen = false;
  for (const m of body.matchAll(TAG)) {
    const [, close, tag, rest, selfClose] = m;
    if (tag === "svg") {
      if (close) { open--; continue; }
      open++;
      if (!seen) out.attrs = attrsOf(rest);
      else out.errors.push(`line ${lineAt(m.index)}: ${open > 1 ? "nested <svg>" : "more than one <svg> root"}`);
      seen = true;
      continue;
    }
    if (close) continue;
    if (!ELEMENTS.includes(tag)) { out.errors.push(`line ${lineAt(m.index)}: <${tag}> is not one of ${ELEMENTS.join(", ")}`); continue; }
    if (!selfClose) out.errors.push(`line ${lineAt(m.index)}: <${tag}> is not self-closing`);
    out.elements.push({ tag, attrs: attrsOf(rest), line: lineAt(m.index) });
  }
  // Where a failure points: tag@line, and tag#n@line (n counting elements from 1) when two share the line.
  const perLine = new Map();
  for (const el of out.elements) perLine.set(el.line, (perLine.get(el.line) ?? 0) + 1);
  out.elements.forEach((el, i) => { el.index = i + 1; el.at = perLine.get(el.line) > 1 ? `${el.tag}#${el.index}@${el.line}` : `${el.tag}@${el.line}`; });
  if (!seen) out.errors.push("no <svg> root");
  else if (open > 0) out.errors.push("unclosed <svg>");
  else if (open < 0) out.errors.push("stray </svg>");
  const stripped = body.replace(TAG, "").trim();
  if (stripped) out.errors.push(`text outside elements: "${stripped.slice(0, 20)}"`);
  return out;
}

// Numbers each command takes; extra numbers after it are implicit repeats (after M, implicit L).
const ARITY = { m: 2, l: 2, t: 2, h: 1, v: 1, s: 4, q: 4, c: 6, a: 7, z: 1 };
export const pathNumbers = (d) => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
/** Commands in a path, implicit repeats included: `M1 1 2 2` is a move and a line. */
export const pathCommands = (d) => (d.match(/[a-df-z][^a-df-z]*/gi) ?? []).reduce((n, g) => {
  const arity = ARITY[g[0].toLowerCase()] ?? 1;
  return n + Math.max(1, Math.ceil(pathNumbers(g.slice(1)).length / arity));
}, 0);
export const moves = (d) => (d.match(/[mM]/g) ?? []).length;

/** Whether an element draws a closed shape (a body) or an open stroke (a line). */
export function isClosed(el) {
  if (el.tag === "rect" || el.tag === "circle") return true;
  if (el.tag === "line") return false;
  return /[zZ]/.test(el.attrs.d ?? "");
}

/** The attributes that place an element; two elements with the same ones draw the same shape. */
export const GEOMETRY_ATTRS = ["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d"];
/** An element's geometry as one string, numbers and spacing normalised, for comparing two. */
export const geometryKey = (el) => el.tag + "|" + GEOMETRY_ATTRS.filter((k) => k in el.attrs).map((k) => `${k}=${String(el.attrs[k]).replace(/\s+/g, " ").replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, (n) => String(Number(n))).trim()}`).join("|");

/** An icon's text rebuilt from its root and the elements given: the way sheet and the measuring variants compose one. */
export const compose = (root, elements) => {
  const attr = (k, v) => ` ${k}="${String(v).replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z]\w*);)/gi, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")}"`;
  const tag = (name, attrs) => `<${name}${Object.entries(attrs).map(([k, v]) => attr(k, v)).join("")}`;
  return `${tag("svg", root)}>${elements.map((el) => `${tag(el.tag, el.attrs)} />`).join("")}</svg>`;
};

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

/** A standalone .svg needs the namespace to render in <img>, a CSS url() or resvg; only the root tag is touched. */
export const withNs = (text) => text.replace(/<svg\b([^>]*)>/, (m, rest) => (/\sxmlns\s*=/.test(m) ? m : `<svg xmlns="http://www.w3.org/2000/svg"${rest}>`));

/** Attributes no icon may carry; the root also refuses a transform and a fill-opacity (shared by check.mjs and bulk.mjs). */
export const FORBIDDEN_ATTRS = ["style", "opacity", "stroke-opacity", "filter", "class", "id", "mask", "clip-path", "stroke-dashoffset", "vector-effect", "paint-order"];
export const ROOT_FORBIDDEN = [...FORBIDDEN_ATTRS, "transform", "fill-opacity"];
