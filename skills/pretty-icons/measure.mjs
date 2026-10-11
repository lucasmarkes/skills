/**
 * The measured rules, over a set. Each icon is rendered and measured by
 * raster.mjs; gap is read from geometry.mjs, with the stroke added.
 * At the filled finish weight reads the lines alone (no paint, no fill), and gap holds
 * every element but the paint apart (a tone, a shade, a dot: filled.mjs): line
 * from line by 1.5 strokes edge to edge, each at its own width, a mark from anything by half that.
 * At the filled finish contrast reads the base as written, every tone kept: the line tone's share of its painted pixels (`shares` in raster.mjs).
 * A modifier (modifiers.mjs) is the base's sign, not its object. Its cut moves the base's box, mass and ink,
 * so a modified icon is judged for live (the whole) and gap (without the modifier, whose halo is the modifier
 * rule's) only: not keyline, gravity or weight, and it stays out of the median. Its base is judged for those. In duotone the
 * paint is a split body's fill (stroke none): its edge is its contour's, so it is left out of gap too.
 * loose: an unfilled stroke (each subpath on its own) whose midpoint lies inside a filled body is an interior detail; it stops one stroke
 * inside the body's contour, edge to edge, and gap leaves that pair to it.
 */
import { preset, TOUCH, FORMATS, referenceInk, AIR, LOOSE } from "./presets.mjs";
import { measure, shares, resvg, NO_RASTER } from "./raster.mjs";
import { parse, compose, num, geometryKey } from "./svg.mjs";
import { isModifier } from "./modifiers.mjs";
import { sampleParts, minDistance, interiorParts } from "./geometry.mjs";
import { objectOf, linesOf, classify } from "./filled.mjs";

// `+ 0` turns -0 into 0, so a centred icon prints 0, not -0.
const r2 = (n) => Math.round(n * 100) / 100 + 0;
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });

export function nearestKeyline(G, w, h) {
  const { keylines } = preset(G);
  let best = null;
  for (const format of FORMATS) {
    const [kw, kh] = keylines[format], dw = w - kw, dh = h - kh, score = Math.abs(dw) + Math.abs(dh);
    if (!best || score < best.score) best = { format, dw, dh, score };
  }
  const { format, dw, dh } = best;
  return { format, dw, dh };
}

const isNone = (v) => v === undefined || String(v).trim().toLowerCase() === "none";

/**
 * An icon's interior details: an unfilled, uncut stroke whose midpoint lies inside a filled body.
 * The bodies: at the filled finish its tones (read at the contour's width) and shapes; in duotone
 * every currentColor-filled element. Each detail comes back with its body and the widths to read them at.
 */
function interiorDetails(parsed, els, p, c, rootW) {
  const filled = p.finish === "filled", own = (el) => num(el.attrs, "stroke-width", rootW);
  const bodies = filled ? [...c.tones, ...c.shapes] : els.filter((el) => String(el.attrs.fill ?? "").trim().toLowerCase() === "currentcolor");
  const widthOf = (b) => (filled && c.tones.includes(b) ? p.contour : own(b));
  const keys = new Set(bodies.map(geometryKey));
  const candidates = (filled ? [...c.lines, ...c.marks] : els.filter((el) => isNone(el.attrs.fill ?? parsed.attrs.fill)))
    .filter((el) => !("data-cut" in el.attrs) && !keys.has(geometryKey(el)));
  const out = [];
  for (const el of candidates) {
    const all = sampleParts(el, 0.05).length > 1;
    for (const { i, part, body } of interiorParts(el, bodies)) out.push({ el, body, part, label: all ? `${el.at}[${i}]` : el.at, w: own(el), wb: widthOf(body) });
  }
  return out;
}

export async function measuredChecks(set, G) {
  const p = preset(G), failures = [], rows = [];
  // The rasteriser first, outside the per-icon guard: when it cannot be had, nothing is measured.
  if (set.length) resvg();
  const measures = [];
  for (const s of set) {
    // A file the text layer passed can still be one resvg or the path sampler cannot read
    // (an unclosed quote, an unknown command): one elements line, and it stays out of the median.
    try {
      const filled = p.finish === "filled";
      const parsed = parse(s.text);
      const els = parsed.elements.filter((el) => !(filled && "transform" in el.attrs) && !isModifier(el));
      const modified = parsed.elements.some(isModifier), base = !modified ? s.text : compose(parsed.attrs, parsed.elements.filter((el) => !isModifier(el)));
      const c = filled ? classify(els) : null;
      const details = new Set(filled ? c.details.map((el) => el.at) : []);
      const paint = new Set(filled ? [...c.paint].map((el) => el.at) : els.filter((el) => String(el.attrs.stroke).trim().toLowerCase() === "none").map((el) => el.at));
      const rootW = num(parsed.attrs, "stroke-width", p.stroke);
      const parts = els.map((el) => { try { return sampleParts(el, 0.05); } catch (e) { throw new Error(`${el.at} ${e.message}`); } });
      const whole = await measure(s.text, G);
      const m = filled
        ? { ...(await measure(objectOf(base), G)), live: whole.box, ink: (await measure(linesOf(base), G)).ink }
        : { ...(await measure(base, G)), live: whole.box };
      const share = filled ? await shares(base, G) : null;
      const inner = interiorDetails(parsed, els, p, c, rootW), innerAt = new Set(inner.map((x) => x.el.at));
      // a detail and its body (and the body's contour, the same geometry) are loose's, not gap's
      const skip = new Set();
      for (const { el, body } of inner) for (const x of els) if (geometryKey(x) === geometryKey(body)) skip.add(`${el.at}|${x.at}`).add(`${x.at}|${el.at}`);
      measures.push({ ...s, els, parts, details, paint, m, modified, share, rootW, inner, innerAt, skip });
    } catch (e) {
      if (e?.code === NO_RASTER) throw e;
      fail(failures, "elements", s.name, String(e?.message ?? e).split("\n")[0], "a file check can measure");
    }
  }

  for (const { name, els, parts, details, paint, m, modified, share, rootW, inner, skip } of measures) {
    const { box, mass, ink, live } = m;
    // an empty icon has no box or mass to judge; count already reports it
    const inked = live.w > 0;
    // live: every pixel of the file
    const lo = p.pad - 0.05, hi = G - p.pad + 0.05;
    if (inked && (live.x0 < lo || live.y0 < lo || live.x1 > hi || live.y1 > hi)) fail(failures, "live", name, `ink ${r2(live.x0)},${r2(live.y0)}–${r2(live.x1)},${r2(live.y1)}`, `inside ${p.pad}–${G - p.pad}`);
    // keyline
    const k = nearestKeyline(G, box.w, box.h);
    const fits = inked && modified ? true : inked && Math.abs(k.dw) <= p.keylineTol + 1e-9 && Math.abs(k.dh) <= p.keylineTol + 1e-9;
    if (inked && !modified && !fits) fail(failures, "keyline", name, `${r2(box.w)} × ${r2(box.h)}`, `${k.format} ${p.keylines[k.format].join(" × ")} ±${p.keylineTol}`);
    // gravity: the object's mass about its keyline's centre
    const dx = mass.dx + G / 2 - p.centre[0], dy = mass.dy + G / 2 - p.centre[1];
    if (inked && !modified && (Math.abs(dx) > p.gravityTol || Math.abs(dy) > p.gravityTol)) fail(failures, "gravity", name, `mass ${r2(dx) >= 0 ? "+" : ""}${r2(dx)}, ${r2(dy) >= 0 ? "+" : ""}${r2(dy)}`, `within ±${p.gravityTol}`);
    // loose: a detail inside a body stops a stroke inside its contour
    for (const { el, body, part, label, w, wb } of inner) {
      const centre = minDistance(part, sampleParts(body, 0.05).flat()), edge = centre - (w + wb) / 2;
      if (centre <= TOUCH || edge < 0) fail(failures, "loose", name, `${label} touches ${body.at}`, `end it ≥ ${LOOSE} stroke inside the contour`);
      else if (edge < LOOSE * p.stroke - 1e-9) fail(failures, "loose", name, `${label} ${(edge / p.stroke).toFixed(1)} strokes from ${body.at}`, `≥ ${LOOSE} stroke inside the contour`);
    }
    // gap, between every pair of elements, and between the subpaths of one path: merged dots
    // are as "almost" as separate ones. Touching (a shared end, a crossing) passes.
    // each element at its own width: a contour's edge is at 2, the parts' at the root's
    const width = new Map(els.map((el) => [el.at, num(el.attrs, "stroke-width", rootW)]));
    const gap = (A, B, a, b) => {
      const ka = a.replace(/\[\d+\]$/, ""), kb = b.replace(/\[\d+\]$/, "");
      if (skip.has(`${ka}|${kb}`)) return;
      const min = (details.has(ka) || details.has(kb) ? AIR / 2 : AIR) * p.stroke;
      const centre = minDistance(A, B), outer = centre - (width.get(ka) + width.get(kb)) / 2;
      if (centre > TOUCH && outer < min - 1e-9) fail(failures, "gap", name, `${a} to ${b} ${outer < 0 ? `overlapping, centrelines ${r2(centre)} apart` : `${r2(outer)} apart`}`, `≥ ${+min.toFixed(3)} apart, or crossing`);
    };
    const whole = parts.map((q) => q.flat());
    for (let i = 0; i < els.length; i++) {
      if (paint.has(els[i].at)) continue;
      for (let j = i + 1; j < els.length; j++) if (!paint.has(els[j].at)) gap(whole[i], whole[j], els[i].at, els[j].at);
      const sub = parts[i];
      if (sub.length > 1) for (let a = 0; a < sub.length; a++) for (let b = a + 1; b < sub.length; b++) gap(sub[a], sub[b], `${els[i].at}[${a}]`, `${els[i].at}[${b}]`);
    }
    rows.push({ icon: name, x0: r2(box.x0), y0: r2(box.y0), w: r2(box.w), h: r2(box.h), keyline: fits ? k.format : "—", ink: r2(ink), dx: r2(dx), dy: r2(dy), ...(share ? { "line%": share.paint ? Math.round((1000 * share.dark) / share.paint) / 10 : 0 } : {}) });
  }

  // weight: a set of three or more against its own median and, looser, the reference, so a set
  // uniformly heavier than the finish fails; a set of one or two against the reference alone
  const weighed = measures.filter((x) => !x.modified);
  const inks = weighed.map((x) => x.m.ink).sort((a, b) => a - b);
  const own = inks.length >= 3;
  const mid = inks.length >> 1;
  const ref = referenceInk(G);
  const median = !own ? ref : inks.length % 2 ? inks[mid] : (inks[mid - 1] + inks[mid]) / 2;
  const pct = (t) => Math.round(t * 100);
  const weigh = (name, ink, against, tol, what) => {
    const off = (ink - against) / against;
    if (Math.abs(off) > tol) fail(failures, "weight", name, `ink ${r2(ink)} (${off > 0 ? "+" : ""}${(off * 100).toFixed(1)}%)`, `within ±${pct(tol)}% of ${what} ${r2(against)}`);
  };
  for (const { name, m } of weighed) {
    weigh(name, m.ink, median, p.weightTol, own ? "the set's median" : "the reference");
    if (own) weigh(name, m.ink, ref, p.referenceTol, "the reference");
  }
  // contrast: the line tone's share of the paint, the base as written (a modifier left out, like weight)
  if (p.contrast) for (const { name, share } of measures) {
    if (!share.paint) continue; // an empty icon: the ink rule reports it
    const s = share.dark / share.paint;
    if (s < p.contrast[0] || s > p.contrast[1]) fail(failures, "contrast", name, `line tone on ${(s * 100).toFixed(1)}% of the paint`, `${pct(p.contrast[0])}% to ${pct(p.contrast[1])}%`);
  }
  return { failures, rows };
}
