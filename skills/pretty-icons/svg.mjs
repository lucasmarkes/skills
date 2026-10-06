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
