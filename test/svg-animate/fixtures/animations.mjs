// Three worked animations, one per fixture, and the three planted defects, written as frame folders.
// Each reads the folder normalize wrote (source.svg + inventory.json) and moves the points of its paths.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;
const fmt = (v) => String(+v.toFixed(3));
const rotate = ([cx, cy], deg) => ([x, y]) => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};
const scale = ([cx, cy], k) => ([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k];

function writer(norm, dir) {
  const svg = readFileSync(join(norm, "source.svg"), "utf8");
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const write = (text) => writeFileSync(join(dir, `frame-${String(n++).padStart(3, "0")}.svg`), text);
  return {
    // move(k, [x, y]) → [x, y], called for every point of path k
    frame(move) {
      let k = 0;
      write(svg.replace(/\sd="([^"]*)"/g, (_, d) => {
        const v = d.match(NUM).map(Number), out = [], i = k++;
        for (let j = 0; j < v.length; j += 2) out.push(...move(i, [v[j], v[j + 1]]));
        let j = 0;
        return ` d="${d.replace(NUM, () => fmt(out[j++]))}"`;
      }));
    },
    rest: () => write(svg),
    critical: (text) => writeFileSync(join(dir, "critical.txt"), text),
  };
}

export const animations = {
  // lobes, entrance: the bodies fall onto the floor and bounce to rest; the loose dot lands a beat later.
  // planted "flick": every frame sits 3 units low, so the appended source jumps.
  drop(norm, dir, { flick = false } = {}) {
    const w = writer(norm, dir), bounce = (t, h) => (t <= 0 ? -h : -h * Math.exp(-3.5 * t) * Math.abs(Math.cos(5.6 * t)));
    for (let f = 0; f < 84; f++) {
      const t = f / 60;
      w.frame((k, [x, y]) => [x, y + (k === 1 ? bounce(t - 0.1, 30) : bounce(t, 40)) + (flick ? 3 : 0)]);
    }
    w.rest();
    w.critical("region 4 6 66 38\n017 023 081 082 083 084\n");
  },
  // bell, interaction played as a sequence: the bell swings on its hinge, the clapper follows 50 ms late.
  // planted "off": the last frame is the source moved one unit right.
  ring(norm, dir, { off = false } = {}) {
    const w = writer(norm, dir), angle = (t) => (t <= 0 ? 0 : 16 * Math.exp(-3.2 * t) * Math.sin(2 * Math.PI * 2.6 * t));
    for (let f = 0; f < 90; f++) {
      const t = f / 60;
      w.frame((k, p) => rotate([12, 2], angle(k === 0 ? t - 0.05 : t))(p));
    }
    if (off) w.frame((k, [x, y]) => [x + 1, y]);
    else w.rest();
    w.critical("088 089 090\n");
  },
  // scene, loop: the crown breathes from its base, the rays reach out, then 0.8 s of stillness.
  // planted "sliver": the tree hops 1.7 units, which opens a hairline over the hill at the top of the hop.
  breathe(norm, dir, { sliver = false } = {}) {
    const w = writer(norm, dir), wave = (t) => (t < 1.6 ? Math.sin((Math.PI * t) / 1.6) ** 2 : 0);
    w.rest();
    for (let f = 1; f < 72; f++) {
      const t = f / 30, u = wave(t);
      w.frame((k, p) => {
        if (k === 1) return scale([74, 16], 1 + 0.12 * u)(p);
        if (k === 7) p = scale([54.5, 35], 1 + 0.05 * u)(p);
        if (sliver && (k === 6 || k === 7)) return [p[0], p[1] - 1.7 * Math.sqrt(u)];
        return p;
      });
    }
    w.rest();
    w.critical("region 44 18 20 28\n024 036 071 072\n");
  },
};
