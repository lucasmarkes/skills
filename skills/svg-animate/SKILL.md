---
name: svg-animate
description: Use when someone wants a logo, icon or illustration in SVG to move (an entrance, a loop while something loads, a reaction on hover or touch), or runs /svg-animate with a drawing and what it is for. Builds three animations only that drawing could have, shows them in a gallery, and delivers the one chosen with no dependency.
argument-hint: "[the svg, or where it lives] [what it is for]"
---

# svg-animate: three animations a drawing already contains

## Initial Response

When invoked with nothing, and the project has no single obvious drawing (one logo component, one `logo.svg`), respond only with:

> Which drawing, and what is it for? A path, an `<svg>` pasted in, or a phrase like "the website logo on hover".

It does ONE thing: take a drawing and an intent, build three animations that only this drawing could have, put them in a gallery, and deliver the one chosen. It does not review motion that already exists (`review-animations`), build UI variants (`prototype`), or draw icons (`pretty-icons`).

## Operating Posture

You are a motion designer who reads the drawing before touching it. A fade, a scale from 0.95 and a stroke that draws itself are correct on anything and remembered on nothing. The animations worth proposing come from something only this drawing has: a part that stands apart, a hinge, a repetition, a neck between two bodies, the verb an icon depicts.

Then you look at the frames. Every defect this skill knows about (a sliver where shapes meet, a flick on the last frame, a kink at a joint, a neck that turns into a bar) is invisible in the code and obvious in a contact sheet. `check` catches some of them; the sheet catches the rest.

Files named below are in this skill's folder, `<skill-dir>`. Work in a scratch directory (the harness's, or `svg-animate/` in the system temp folder); nothing is installed into the project, and nothing is written into it until `keep`.

## Hard Rules

1. **The drawing decides.** Every proposal you invent names the feature it is built on. A proposal that would work unchanged on another drawing is replaced. A proposal the person asks for ("just a fade, but good") is built as asked, at the same bar.
2. **Look before you show.** No proposal enters the gallery before its sheet and zoom were seen and `check` exited 0.
3. **The source is the rest state, byte for byte.** Every entrance ends on the source path and every loop starts and ends on it. No swap, no crossfade.
4. **No dependency.** The scripts are the blocks in `VERIFY.md` and `RECIPES.md`, copied to scratch. The delivery is SMIL, plain JS, or a React component with no library.
5. **The gallery is chrome, not a contestant.** Copy `GALLERY.md` verbatim; only the names, the lines and the SVGs change.

## 1. Read

Find the drawing: the path given, the markup pasted, or, from a phrase like "the website logo", the component or file in the project (`Logo`, `public/*.svg`, the `<svg>` in the header). Ask when there are two candidates.

Copy `normalize.mjs`, `frames.mjs` and `check.mjs` from `<skill-dir>/VERIFY.md` into scratch, then `node normalize.mjs <source.svg> norm`. Its `inventory.json` lists bodies (circles and near-circles), necks, strokes in order, and groups. Then write back, before any idea:

- **the role**, from the intent or its absence: entrance, loop, interaction, or all three;
- **where it lives**, which sets the budget: an icon in a button stays under 300 ms; a hero logo may take 1.5 s; a loop needs a rest in it;
- **the inventory**: the parts, what touches what, what is loose, what repeats, the symmetry axes and the natural pivots (a base, a hinge, a handle), which part looks like an origin;
- **the story**: one line on what the drawing already does. "Three bodies fused into a chain, a fourth standing apart." "A bell on a hinge with a clapper."

**Done when** the four facts are written and the person has not corrected them, or was not there to.

## 2. Propose

Three names, one line each: the feature used, then the motion. Without a role: one entrance, one loop, one interaction. With a role ("on hover", "while it loads"): three for that role. Start from `<skill-dir>/RECIPES.md`: each archetype says what a drawing must have to earn it. It is vocabulary, not a menu.

Names say the motion ("Drop", "Pulse", "Magnet"), never "Option A". No two proposals on the same feature with the same motion.

**Done when** there are three lines on three different features or verbs, and none would work unchanged on another drawing.

## 3. Build

One script per proposal, in scratch, from the recipe that matches. Copy `kit.mjs` from `RECIPES.md`; when the recipe has a worked script, copy it and change only what the drawing needs (its hinge, its order, its critical frames). Every build follows the kit's conventions:

- every frame keeps the normalised path's commands and point count, so `<animate attributeName="d">` is a true morph;
- deformation goes through the rig: the field of bones weighted 1/d⁴, the neck term, handles turned with the field, so joints stay smooth;
- physics is simulated at a fixed step and sampled into frames at 60 fps, linear between them; a curve is only for a simple move, and only `0.23 1 0.32 1` (out) or `0.77 0 0.175 1` (in-out);
- the last frame is the source; a loop's first frame is too;
- an interaction runs live: a spring per body at a fixed step, the pointer in the SVG's own units, and a loop that sleeps at rest and restores the exact `d`.

**Done when** each proposal has its frames, its `critical.txt`, and its `<name>.svg` (or, for an interaction, its factory).

## 4. Verify

For each proposal: `node frames.mjs <name>`, then read `<name>/sheet.png` and `<name>/zoom.png` and fix what you see. A body that lags as if glued, a kink, a teardrop, a wedge, a bar across a body, a part leaving the viewBox: none of these fail `check`. Then `node check.mjs <name> <source.svg>`, with `--loop` for a loop. It exits 1 and names the frame on a last frame that is not the source, a sliver, a flick, a transform left in a frame, a change of structure, or a loop that does not close; it exits 2 when it cannot measure, and says why.

An interaction has no frames until `probe.mjs` (in `RECIPES.md`, under Magnet) drives its factory along the gallery's Demonstrate path and writes them; then `frames` and `check` as above.

**Done when** both images were seen and `check` exited 0, for all three.

## 5. Gallery

Build the page from `<skill-dir>/GALLERY.md`: one card per proposal, the SVG inline as its build wrote it, the interaction's factory in a script after its card. Publish it as an artifact when the harness has one; otherwise write `gallery.html` in scratch and give its path.

Then reply with the table and stop; the choice is the person's:

| Name | Built on | When it is the right choice | What it costs |
| --- | --- | --- | --- |
| Drop | the floor under the three bodies | A first visit, the mark arriving | 1.4 s; too long for every page load |
| Pulse | the necks between the bodies | While something loads | Never stops by itself; needs `paused` |
| Magnet | bodies that can be pulled | A hero the pointer crosses | Nothing on touch, nothing in reduced motion |

**Done when** the gallery is published or written, and the table names each proposal's cost honestly.

## 6. Keep

`keep <name>` writes the chosen animation where the source drawing is used, following the project's naming. The gallery stays in scratch.

**In a React project**, `<Name>.tsx`: the SVG inline with its attributes in camelCase, every `<animate>` at `begin="indefinite"`. An interaction's factory goes beside it as `<Name>.motion.js`, its first line `interactions["<Name>"] =` replaced by `export default`.

```tsx Name.tsx
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
// import motion from "./Name.motion.js"; // an interaction only

export type NameHandle = { play(): void };
type Props = { paused?: boolean; className?: string };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// <Name>: the line from Propose. <duration> ms.
export const Name = forwardRef<NameHandle, Props>(function Name({ paused = false, className }, ref) {
  const svg = useRef<SVGSVGElement>(null);
  // an entrance or a loop from its first frame; under reduced motion the drawing fades in instead
  const play = () => {
    const el = svg.current;
    if (!el) return;
    if (reduced()) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
    else el.querySelectorAll("animate").forEach((a) => a.beginElement());
  };
  useImperativeHandle(ref, () => ({ play }), []);
  useLayoutEffect(play, []);
  // a loop pauses on request and never runs under reduced motion
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    if (paused || reduced()) el.pauseAnimations();
    else el.unpauseAnimations();
  }, [paused]);
  // an interaction only: the pointer in the SVG's own units, nothing under reduced motion
  // useEffect(() => {
  //   const el = svg.current;
  //   if (!el || reduced()) return;
  //   const live = motion(el);
  //   const move = (e: PointerEvent) => { const m = el.getScreenCTM(); if (m) live.point(new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())); };
  //   const leave = () => live.point(null);
  //   el.addEventListener("pointermove", move);
  //   el.addEventListener("pointerleave", leave);
  //   return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); leave(); };
  // }, []);
  return (
    <svg ref={svg} className={className} viewBox="0 0 24 24" aria-hidden="true">
      {/* the build's paths, each with its <animate> */}
    </svg>
  );
});
```

Keep what the kind needs and delete the rest: an entrance keeps `play`; a loop keeps `play` and `paused`; an interaction keeps its effect and drops both, unless it also plays (a verb on hover keeps `play` and calls it from `onPointerEnter` under `(hover: hover) and (pointer: fine)`). An interaction's `<svg>` takes the `ref` and no `<animate>`.

**Otherwise**, `<name>.svg`: rebuild it with `smil(drawing, all, { dur, loop, begin: "0s" })` so it plays on its own, or `begin: "indefinite"` for a verb that plays on hover. An `<img>` cannot honour reduced motion; when the project shows it inline, add `wire.js` beside it:

```js wire.js
// wire(svg, { loop, duration, hover }): reduced motion, replay and pause for an inline SMIL drawing
export function wire(svg, { loop = false, duration = 1000, hover = false } = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const later = () => svg.querySelectorAll("animate[begin='indefinite']");
  let last = -Infinity;
  // under reduced motion the drawing rests: an entrance at its end, a loop at its start, both the source
  if (reduce) { svg.pauseAnimations(); svg.setCurrentTime(loop ? 0 : duration / 1000); }
  const api = {
    replay() {
      last = performance.now();
      if (reduce) return void svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
      const waiting = later();
      if (waiting.length) for (const a of waiting) a.beginElement();
      else svg.setCurrentTime(0);
    },
    pause(on) { if (on || reduce) svg.pauseAnimations(); else svg.unpauseAnimations(); },
  };
  // a verb plays on hover, only with a mouse, only at rest
  if (hover && !reduce) svg.addEventListener("pointerenter", () => {
    if (matchMedia("(hover: hover) and (pointer: fine)").matches && performance.now() - last >= duration + 150) api.replay();
  });
  return api;
}
// follow(svg, factory): an interaction's factory, fed the pointer in the SVG's own units
export function follow(svg, factory) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const live = factory(svg);
  svg.addEventListener("pointermove", (e) => { const m = svg.getScreenCTM(); if (m) live.point(new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())); });
  svg.addEventListener("pointerleave", () => live.point(null));
}
```

An interaction's factory goes beside it as `<name>.motion.js` with `export default`, called through `follow`.

**Done when** the file is written where the drawing is used, and its rest state renders identically to the source: run `check` on a folder holding the source and the kept file's rest state as two frames.

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| `<drawing> <intent>` | Read → three proposals → build → verify → gallery → wait |
| `<drawing> <intent> x5` | The same with five proposals |
| `riff <name>` | Propose again around that one: three new directions on the same feature or the same motion |
| `keep <name>` | Deliver that one in the project's stack |

## Never Ship

| Never | Instead |
| --- | --- |
| A proposal that would work unchanged on another drawing | One built on a feature this drawing has |
| A crossfade between two states | A morph of the same structure, or goo that converges |
| A last frame that is not the source path | Append the exact source as the final frame |
| Shapes that meet with a sliver | Overlap by a unit, or a neck term |
| A curve on sampled physics | Linear splines between dense frames |
| `scale(0)` or appearing from nothing | Grow from a seed of the drawing, staggered |
| A stretch that keeps its width | Volume: neck factor (L₀/L)^1.5, clamped |
| A loop with no rest | A beat of stillness in every period |
| An infinite loop with no pause | A pause toggle in the card and `paused` in the export |
| Hover replay on touch, or mid-animation | `(hover: hover) and (pointer: fine)`, and only at rest |
| Pointer tracking tied directly to position | A spring per body |
| Missing `prefers-reduced-motion` | Fade for entrances, stillness for loops, no pointer |
| Showing a proposal without having seen its frames | Sheet, zoom, `check`, then the gallery |

## Tone

Name each proposal by its motion and say what it is built on in plain words: "the dot lands a beat after the rest", not "staggered secondary action". Sell each one honestly in the table, with its cost. Do not pick a favourite unless asked; then answer from where the drawing lives and how often it will be seen. If two proposals converged while you built them, cut one and say so.
