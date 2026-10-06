/**
 * The measured rules, over a set. Each icon is rendered and measured by
 * raster.mjs; gap is read from geometry.mjs, with the stroke added.
 */
import { preset, KEYLINE_TOL, WEIGHT_TOL, REFERENCE_TOL, GRAVITY_TOL, TOUCH, FORMATS, referenceInk } from "./presets.mjs";
import { measure, resvg, NO_RASTER } from "./raster.mjs";
import { parse } from "./svg.mjs";
import { sampleParts, minDistance } from "./geometry.mjs";

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

export async function measuredChecks(set, G) {
  const p = preset(G), failures = [], rows = [];
  // The rasteriser first, outside the per-icon guard: when it cannot be had, nothing is measured.
  if (set.length) resvg();
  const measures = [];
  for (const s of set) {
    // A file the text layer passed can still be one resvg or the path sampler cannot read
    // (an unclosed quote, an unknown command): one elements line, and it stays out of the median.
    try {
      const els = parse(s.text).elements;
      const parts = els.map((el) => { try { return sampleParts(el, 0.05); } catch (e) { throw new Error(`${el.at} ${e.message}`); } });
      measures.push({ ...s, els, parts, m: await measure(s.text, G) });
    } catch (e) {
      if (e?.code === NO_RASTER) throw e;
      fail(failures, "elements", s.name, String(e?.message ?? e).split("\n")[0], "a file check can measure");
    }
  }

  for (const { name, els, parts, m } of measures) {
    const { box, mass, ink } = m;
    // an empty icon has no box or mass to judge; count already reports it
    const inked = ink > 0;
    // live
    const lo = p.pad - 0.05, hi = G - p.pad + 0.05;
    if (inked && (box.x0 < lo || box.y0 < lo || box.x1 > hi || box.y1 > hi)) fail(failures, "live", name, `ink ${r2(box.x0)},${r2(box.y0)}–${r2(box.x1)},${r2(box.y1)}`, `inside ${p.pad}–${G - p.pad}`);
    // keyline
    const k = nearestKeyline(G, box.w, box.h);
    const fits = inked && Math.abs(k.dw) <= KEYLINE_TOL + 1e-9 && Math.abs(k.dh) <= KEYLINE_TOL + 1e-9;
    if (inked && !fits) fail(failures, "keyline", name, `${r2(box.w)} × ${r2(box.h)}`, `${k.format} ${p.keylines[k.format].join(" × ")} ±${KEYLINE_TOL}`);
    // gravity
    if (inked && (Math.abs(mass.dx) > GRAVITY_TOL || Math.abs(mass.dy) > GRAVITY_TOL)) fail(failures, "gravity", name, `mass ${r2(mass.dx) >= 0 ? "+" : ""}${r2(mass.dx)}, ${r2(mass.dy) >= 0 ? "+" : ""}${r2(mass.dy)}`, `within ±${GRAVITY_TOL}`);
    // gap, between every pair of elements, and between the subpaths of one path: merged dots
    // are as "almost" as separate ones. Touching (a shared end, a crossing) passes.
    const gap = (A, B, a, b) => {
      const centre = minDistance(A, B), outer = centre - p.stroke;
      if (centre > TOUCH && outer < p.stroke - 1e-9) fail(failures, "gap", name, `${a} to ${b} ${outer < 0 ? `overlapping, centrelines ${r2(centre)} apart` : `${r2(outer)} apart`}`, `≥ ${p.stroke} apart, or crossing`);
    };
    const whole = parts.map((q) => q.flat());
    for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) gap(whole[i], whole[j], els[i].at, els[j].at);
      const sub = parts[i];
      if (sub.length > 1) for (let a = 0; a < sub.length; a++) for (let b = a + 1; b < sub.length; b++) gap(sub[a], sub[b], `${els[i].at}[${a}]`, `${els[i].at}[${b}]`);
    }
    rows.push({ icon: name, x0: r2(box.x0), y0: r2(box.y0), w: r2(box.w), h: r2(box.h), keyline: fits ? k.format : "—", ink: r2(ink), dx: r2(mass.dx), dy: r2(mass.dy) });
  }

  // weight: a set of three or more against its own median and, looser, the reference, so a set
  // uniformly heavier than the finish fails; a set of one or two against the reference alone
  const inks = measures.map((x) => x.m.ink).sort((a, b) => a - b);
  const own = inks.length >= 3;
  const mid = inks.length >> 1;
  const ref = referenceInk(G);
  const median = !own ? ref : inks.length % 2 ? inks[mid] : (inks[mid - 1] + inks[mid]) / 2;
  const pct = (t) => Math.round(t * 100);
  const weigh = (name, ink, against, tol, what) => {
    const off = (ink - against) / against;
    if (Math.abs(off) > tol) fail(failures, "weight", name, `ink ${r2(ink)} (${off > 0 ? "+" : ""}${(off * 100).toFixed(1)}%)`, `within ±${pct(tol)}% of ${what} ${r2(against)}`);
  };
  for (const { name, m } of measures) {
    weigh(name, m.ink, median, WEIGHT_TOL, own ? "the set's median" : "the reference");
    if (own) weigh(name, m.ink, ref, REFERENCE_TOL, "the reference");
  }
  return { failures, rows };
}
