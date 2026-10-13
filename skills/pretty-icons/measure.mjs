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
 * inside the body's contour, edge to edge, and gap and air leave that subpath to it; the path's other subpaths they still judge.
 * air: the paper rendered at 8 px a stroke, opened at radius 0.75 stroke; what stays narrow, or a hole under 2 strokes, is named with its place.
 * Gap and air may both name one pair of parallel lines.
 * diagonal: the base's ink axes; an elongated icon at 45° rising to the right counts, a set holds at most max(1, round(0.3 × N)), and one falling to the right is refused.
 */
import { preset, TOUCH, FORMATS, referenceInk, AIR, LOOSE, COUNTER, DIAGONAL, SHADOW, STACK_TOL } from "./presets.mjs";
import { measure, shares, resvg, air, elongation, band, NO_RASTER } from "./raster.mjs";
import { parse, compose, num, geometryKey } from "./svg.mjs";
import { isModifier } from "./modifiers.mjs";
import { isShadow } from "./shadow.mjs";
import { sampleParts, minDistance, interiorParts, subpaths } from "./geometry.mjs";
import { objectOf, linesOf, classify } from "./filled.mjs";
import { classify as bulkClassify, relations, isKnockout, uncut } from "./bulk.mjs";

// `+ 0` turns -0 into 0, so a centred icon prints 0, not -0.
const r2 = (n) => Math.round(n * 100) / 100 + 0;
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });

export function nearestKeyline(G, w, h, finish) {
  const { keylines } = preset(G, finish);
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
    for (const { i, part, body } of interiorParts(el, bodies)) out.push({ el, body, i, part, label: all ? `${el.at}[${i}]` : el.at, w: own(el), wb: widthOf(body) });
  }
  return out;
}

export async function measuredChecks(set, G, finish) {
  const p = preset(G, finish), bulk = p.finish === "bulk", failures = [], rows = [];
  // The rasteriser first, outside the per-icon guard: when it cannot be had, nothing is measured.
  if (set.length) resvg();
  const measures = [];
  for (const s of set) {
    // A file the text layer passed can still be one resvg or the path sampler cannot read
    // (an unclosed quote, an unknown command): one elements line, and it stays out of the median.
    try {
      const filled = p.finish === "filled";
      const parsed = parse(s.text);
      const els = parsed.elements.filter((el) => !(filled && "transform" in el.attrs) && (bulk || !isModifier(el)) && !isShadow(el));
      // at bulk a modifier is a full accent: measured with the rest, the band and the share included
      const modified = !bulk && parsed.elements.some(isModifier), shadowed = parsed.elements.some(isShadow);
      const base = !modified && !shadowed ? s.text : compose(parsed.attrs, parsed.elements.filter((el) => !isModifier(el) && !isShadow(el)));
      const c = filled ? classify(els) : bulk ? bulkClassify({ ...parsed, elements: els }) : null;
      const details = new Set(filled ? c.details.map((el) => el.at) : []);
      const paint = new Set(filled ? [...c.paint].map((el) => el.at) : bulk ? [] : els.filter((el) => String(el.attrs.stroke).trim().toLowerCase() === "none").map((el) => el.at));
      const rootW = bulk ? 0 : num(parsed.attrs, "stroke-width", p.stroke);
      const parts = els.map((el) => { try { return sampleParts(el, 0.05); } catch (e) { throw new Error(`${el.at} ${e.message}`); } });
      const whole = await measure(s.text, G);
      const m = filled
        ? { ...(await measure(objectOf(base), G)), live: whole.box, ink: (await measure(linesOf(base), G)).ink }
        : { ...(await measure(base, G)), live: whole.box };
      const e = await elongation(filled ? objectOf(base) : base, G);
      const share = filled ? await shares(base, G) : null;
      const accentInk = bulk ? (await measure(compose(parsed.attrs, c.accents), G)).ink : null;
      const inner = bulk ? [] : interiorDetails(parsed, els, p, c, rootW);
      // air reads the base without its interior details, subpath by subpath: those are loose's, a stroke from the contour;
      // a path with a detail and an outside part keeps the outside part
      const innerParts = new Map();
      for (const { el, i } of inner) innerParts.set(el.at, (innerParts.get(el.at) ?? new Set()).add(i));
      // at bulk an overlapping pair (a stack or an overprint) is depth's, not gap's or air's: air sees every
      // element uncut and full, less the lines and accents that overprint, so a stack's gap is not paper
      const rel = bulk ? relations(els.filter((el) => el.tag !== "rect")) : [];
      const full = (list) => list.map((el) => { const { "fill-opacity": _, "data-cut": __, "data-body": ___, ...a } = el.attrs; return { ...el, attrs: a }; });
      const over = new Set(rel.filter((r) => r.how === "overprint").map((r) => r.front));
      const outside = bulk
        ? full(els.filter((el) => !over.has(el)).map(uncut))
        : els.flatMap((el) => {
          const drop = innerParts.get(el.at);
          if (!drop) return [el];
          const keep = el.tag === "path" ? subpaths(el.attrs.d ?? "").filter((_, i) => !drop.has(i)) : [];
          return keep.length ? [{ ...el, attrs: { ...el.attrs, d: keep.join("") } }] : [];
        });
      const narrow = await air(compose(parsed.attrs, outside), G, bulk ? p.gap / AIR : p.stroke);
      // a detail and its body (and the body's contour, the same geometry) are loose's, not gap's: keyed by the detail's subpath
      const skip = new Set();
      if (bulk) for (const r of rel) { skip.add(`${r.behind.at}|${r.front.at}`); skip.add(`${r.front.at}|${r.behind.at}`); }
      else for (const { el, i, body } of inner) for (const x of els) if (geometryKey(x) === geometryKey(body)) skip.add(`${el.at}#${i}|${x.at}`);
      // the stack's gap, on every cut element: the cut, its uncut geometry, and the solids in front of it, each rendered full
      const bands = [];
      if (bulk) for (const b of els.filter(isKnockout)) {
        const fronts = rel.filter((r) => r.how === "stack" && r.behind === b).map((r) => uncut(r.front));
        if (!fronts.length) continue; // bulkChecks reports a stale cut
        bands.push(...(await band(compose(parsed.attrs, full([b])), compose(parsed.attrs, full([uncut(b)])), compose(parsed.attrs, full(fronts)), G, p.stack, STACK_TOL)));
      }
      // the biggest piece: each element's painted area, alone and full, after any cut
      const areas = [];
      if (bulk) for (const el of els) if (el.tag !== "rect") areas.push({ el, body: c.bodies.includes(el), area: (await measure(compose(parsed.attrs, full([el])), G)).ink });
      const bodyAt = bulk ? new Set(c.bodies.map((b) => b.at)) : new Set();
      measures.push({ ...s, els, parts, details, paint, m, modified, share, accentInk, rootW, inner, skip, narrow, e, shadowed, bands, bodyAt, areas });
    } catch (e) {
      if (e?.code === NO_RASTER) throw e;
      fail(failures, "elements", s.name, String(e?.message ?? e).split("\n")[0], "a file check can measure");
    }
  }

  for (const { name, els, parts, details, paint, m, modified, share, accentInk, rootW, inner, skip, narrow, shadowed, bands, bodyAt, areas } of measures) {
    const { box, mass, ink, live } = m;
    // an empty icon has no box or mass to judge; count already reports it
    const inked = live.w > 0;
    // live: every pixel of the file; a shadowed icon's shadow may run SHADOW past it, down and right
    const edge = G - p.pad + (shadowed ? SHADOW : 0), lo = p.pad - 0.05, hi = edge + 0.05;
    if (inked && (live.x0 < lo || live.y0 < lo || live.x1 > hi || live.y1 > hi)) fail(failures, "live", name, `ink ${r2(live.x0)},${r2(live.y0)}–${r2(live.x1)},${r2(live.y1)}`, `inside ${p.pad}–${edge}`);
    // keyline
    const k = nearestKeyline(G, box.w, box.h, finish);
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
      if (bulk && skip.has(`${ka}|${kb}`)) return;
      const min = bulk ? p.gap : (details.has(ka) || details.has(kb) ? AIR / 2 : AIR) * p.stroke;
      const centre = minDistance(A, B), outer = centre - (width.get(ka) + width.get(kb)) / 2;
      if (centre > TOUCH && outer < min - 1e-9) fail(failures, "gap", name, `${a} to ${b} ${outer < 0 ? `overlapping, centrelines ${r2(centre)} apart` : `${r2(outer)} apart`}`, `≥ ${+min.toFixed(3)} apart, or crossing`);
    };
    const whole = parts.map((q) => q.flat());
    // what of element i gap holds apart from element j: the whole, or, when some subpaths are details
    // inside j (loose's), each other subpath on its own, named by its index
    const side = (i, j) => {
      const keep = parts[i].map((q, k) => [q, k]).filter(([, k]) => !skip.has(`${els[i].at}#${k}|${els[j].at}`));
      if (keep.length === parts[i].length) return [[whole[i], els[i].at]];
      return keep.map(([q, k]) => [q, parts[i].length > 1 ? `${els[i].at}[${k}]` : els[i].at]);
    };
    for (let i = 0; i < els.length; i++) {
      if (paint.has(els[i].at)) continue;
      for (let j = i + 1; j < els.length; j++) if (!paint.has(els[j].at)) for (const [A, a] of side(i, j)) for (const [B, b] of side(j, i)) gap(A, B, a, b);
      const sub = parts[i];
      if (sub.length > 1 && !bodyAt.has(els[i].at) && !(bulk && isKnockout(els[i]))) for (let a = 0; a < sub.length; a++) for (let b = a + 1; b < sub.length; b++) gap(sub[a], sub[b], `${els[i].at}[${a}]`, `${els[i].at}[${b}]`);
    }
    // air: paper narrower than AIR strokes between inks that do not touch, or a counter under COUNTER
    for (const a of narrow) {
      const unit = bulk ? "" : " strokes";
      if (a.kind === "paper") fail(failures, "air", name, `paper ${a.across.toFixed(1)}${unit} wide at ${a.at[0]}, ${a.at[1]}`, `≥ ${AIR} apart, or touching`);
      else fail(failures, "air", name, `counter ${a.across.toFixed(1)}${unit} across at ${a.at[0]}, ${a.at[1]}`, `≥ ${COUNTER} across`);
    }
    if (bulk && ink > 0) {
      const sh = accentInk / ink;
      if (sh < p.share[0] || sh > p.share[1]) fail(failures, "share", name, `accent ${sh.toFixed(2)} of the ink`, `${p.share[0]} to ${p.share[1]}`);
      // the body is the biggest piece: no accent, alone, paints more than the largest body
      const biggest = Math.max(0, ...areas.filter((x) => x.body).map((x) => x.area));
      if (biggest > 0) for (const x of areas) if (!x.body && x.area > biggest + 1e-9) fail(failures, "share", name, `${x.el.at} area ${Math.round(x.area)}`, `under the largest body's ${Math.round(biggest)}: the gray body is the biggest piece`);
    }
    for (const b of bands) fail(failures, "stack", name, `paper ${b.width} wide at ${b.at[0]}, ${b.at[1]}`, `${p.stack}: re-run knockout.mjs`);
    rows.push({ icon: name, x0: r2(box.x0), y0: r2(box.y0), w: r2(box.w), h: r2(box.h), keyline: fits ? k.format : "—", ink: r2(ink), dx: r2(dx), dy: r2(dy), ...(share ? { "line%": share.paint ? Math.round((1000 * share.dark) / share.paint) / 10 : 0 } : {}), ...(bulk && ink > 0 ? { "share%": Math.round((1000 * accentInk) / ink) / 10 } : {}) });
  }

  // diagonal: an elongated icon may lie at 45°, lower-left to upper-right, in a share of the set; never the other way
  const long = measures.filter((x) => x.e.ratio >= DIAGONAL.ratio);
  for (const x of long) if (Math.abs(x.e.angle + 45) <= DIAGONAL.tol) fail(failures, "diagonal", x.name, "upper-left to lower-right", "lower-left to upper-right");
  const diag = long.filter((x) => Math.abs(x.e.angle - 45) <= DIAGONAL.tol), cap = Math.max(1, Math.round(DIAGONAL.share * measures.length));
  if (diag.length > cap) fail(failures, "diagonal", "set", `${diag.length} of ${measures.length} on the diagonal (${diag.map((x) => x.name).join(", ")})`, `at most ${cap}`);

  // weight: a set of three or more against its own median and, looser, the reference, so a set
  // uniformly heavier than the finish fails; a set of one or two against the reference alone
  const weighed = measures.filter((x) => !x.modified);
  const inks = weighed.map((x) => x.m.ink).sort((a, b) => a - b);
  const own = inks.length >= 3;
  const mid = inks.length >> 1;
  const ref = referenceInk(G, finish);
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
