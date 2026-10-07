# The gallery

One page and three cards. The page is chrome, not a contestant: it is the same
every round, so the only thing that changes between two galleries is the
motion. Copy the page below verbatim. Change only what the comments mark: the
title, the intent line, and one `<article>` per proposal.

## The card

```html
<article class="card" data-kind="entrance" data-name="Drop" data-duration="1400">
  <div class="stage">
    <span class="tag">entrance</span>
    <!-- the proposal's SVG, inline, as its build wrote it -->
    <button class="act" type="button">Replay</button>
  </div>
  <div class="body">
    <h2>Drop</h2>
    <p>The line from Propose: the feature, then the motion.</p>
    <p class="feature">a floor under three filled bodies</p>
  </div>
</article>
```

- `data-kind` is `entrance`, `loop` or `interaction`. It decides what the
  button does: Replay, Pause, or Demonstrate.
- `data-duration` is the animation's length in milliseconds. The hover replay
  waits for it, and 150 ms more, before it plays again.
- An entrance or a loop is the SMIL `.svg` its build wrote, with
  `begin="indefinite"` on every `<animate>`. The page begins them: an entrance
  at load, on Replay and on hover; a loop at load.
- An interaction registers itself in a `<script>` after the card:
  `interactions["Magnet"] = (svg) => ({ point(p) { … } })`. The page calls
  `point` with the pointer in the SVG's own units, and with `null` when the
  pointer leaves. An interaction that only plays (a bell that rings when
  touched) needs no script: its SMIL plays on pointer enter.
- Three cards inline the same drawing three times. Prefix every `id` in a
  card's SVG with the card's name, and every `url(#…)` and `href="#…"` that
  points to one, or the cards share one gradient and one clip.

## What the page does for you

| Concern | The page |
| --- | --- |
| Hover replay | Only under `(hover: hover) and (pointer: fine)`, and never while the animation plays |
| A loop that never stops | A Pause button in its card, which pauses that SVG's clock |
| An interaction nobody can try on a phone | Demonstrate: a cursor that crosses the stage in an S, 1800 ms |
| Reduced motion | Entrances fade in 300 ms, loops stay still, the pointer does nothing, the buttons that would move something are hidden |
| A drawing only seen on one background | A Dark / Light stage toggle |

Publish the page as an artifact when the harness has one; otherwise write it
as `gallery.html` in the scratch directory and give the path.

## The page

```html gallery.html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bell motion</title><!-- the drawing's name, then "motion": two to four words -->
<style>
  :root {
    --bg: #f2f3f1; --fg: #16181b; --card: #ffffff; --line: #dcdfdc; --muted: #5b6268; --accent: #0b7f9e;
    --stage: #f7f8f6; --mark: #111214;
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --font: system-ui, -apple-system, "Segoe UI", sans-serif;
    --mono: ui-monospace, "SF Mono", Menlo, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg: #0f1113; --fg: #e8ebed; --card: #16191c; --line: #262b30; --muted: #8d959c; --accent: #5cc7e4; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --bg: #0f1113; --fg: #e8ebed; --card: #16191c; --line: #262b30; --muted: #8d959c; --accent: #5cc7e4; color-scheme: dark; }
  .dark-stages { --stage: #0c0d0f; --mark: #ffffff; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 var(--font); }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 40px 16px 56px; display: grid; gap: 24px; }
  header { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 12px; }
  h1 { margin: 0; font-size: clamp(24px, 4vw, 34px); line-height: 1.1; letter-spacing: -0.01em; }
  .intent { margin: 4px 0 0; color: var(--muted); }
  .seg { display: inline-flex; gap: 3px; padding: 3px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
  .seg button { border: 0; border-radius: 5px; padding: 6px 12px; background: transparent; color: var(--muted); font: 500 13px var(--font); cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--fg); color: var(--bg); }
  .grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
  @media (min-width: 980px) { .grid { grid-template-columns: repeat(3, 1fr); } }
  .card { min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 14px; background: var(--card); }
  .stage { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; overflow: hidden; background: var(--stage); color: var(--mark); touch-action: pan-y; transition: background-color 250ms ease; }
  .stage svg { width: 62%; max-height: 80%; height: auto; overflow: visible; }
  .stage svg.fade { animation: fade 300ms ease-out; }
  @keyframes fade { from { opacity: 0; } }
  .tag { position: absolute; left: 12px; top: 12px; font: 500 11px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.55; }
  .act { position: absolute; right: 12px; bottom: 12px; border: 0; border-radius: 999px; padding: 6px 12px; background: rgba(127, 127, 127, 0.18); color: var(--mark); font: 500 12px var(--font); cursor: pointer; transition: transform 160ms var(--ease-out), background-color 160ms ease; }
  .act:hover { background: rgba(127, 127, 127, 0.3); }
  .act:active, .seg button:active { transform: scale(0.97); }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ghost { position: absolute; left: 0; top: 0; width: 14px; height: 14px; margin: -7px 0 0 -7px; border: 2px solid var(--mark); border-radius: 50%; opacity: 0; pointer-events: none; transition: opacity 160ms ease; }
  .ghost.on { opacity: 0.8; }
  .body { display: grid; gap: 8px; padding: 18px; }
  .body h2 { margin: 0; font-size: 20px; line-height: 1.2; }
  .body p { margin: 0; color: var(--muted); font-size: 14px; }
  .body .feature { font: 12.5px var(--mono); color: var(--fg); }
  .body .feature::before { content: "built on "; color: var(--muted); }
  @media (prefers-reduced-motion: reduce) {
    .card:is([data-kind="loop"], [data-kind="interaction"]) .act { display: none; }
  }
</style>
<script>window.interactions = {};</script>
</head>
<body><!-- class="dark-stages" when the drawing is light, and swap aria-pressed on the two stage buttons -->
<div class="wrap">
  <header>
    <div>
      <h1>Bell motion</h1><!-- the same as the title -->
      <p class="intent">Three ways the bell could move on hover.</p><!-- the intent, in one sentence -->
    </div>
    <div class="seg" role="group" aria-label="Stage">
      <button type="button" data-stage="light" aria-pressed="true">Light</button>
      <button type="button" data-stage="dark" aria-pressed="false">Dark</button>
    </div>
  </header>
  <main class="grid">
    <!-- one <article class="card"> per proposal, and after it the script of an interaction, if it has one -->
  </main>
</div>
<!-- the interactions' scripts go in <main>, after their cards; this script stays last -->
<script>
  const canHover = matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const lastPlay = new WeakMap();
  const svgOf = (card) => card.querySelector(".stage svg");
  const starts = (svg) => svg.querySelectorAll("[begin='indefinite']");
  const duration = (card) => Number(card.dataset.duration) || 1000;

  // an entrance or an interaction's SMIL, from its first frame; under reduced motion, the source fading in
  function play(card) {
    const svg = svgOf(card);
    lastPlay.set(card, performance.now());
    if (reduce.matches) {
      svg.classList.remove("fade");
      void svg.getBoundingClientRect();
      svg.classList.add("fade");
      return;
    }
    for (const a of starts(svg)) a.beginElement();
  }
  const playing = (card) => performance.now() - (lastPlay.get(card) ?? -Infinity) < duration(card) + 150;

  // the pointer, in the SVG's own units
  function toSvg(svg, x, y) {
    const m = svg.getScreenCTM();
    return m ? new DOMPoint(x, y).matrixTransform(m.inverse()) : null;
  }

  // Demonstrate: a cursor that enters left, crosses the stage in an S, and leaves right
  function demonstrate(card, live) {
    const svg = svgOf(card), stage = card.querySelector(".stage");
    const ghost = stage.querySelector(".ghost") || stage.appendChild(Object.assign(document.createElement("span"), { className: "ghost" }));
    const vb = svg.viewBox.baseVal, mid = vb.y + vb.height / 2, t0 = performance.now();
    let crossed = false;
    ghost.classList.add("on");
    requestAnimationFrame(function step(now) {
      const u = Math.min(1, (now - t0) / 1800);
      const p = { x: vb.x - 0.2 * vb.width + 1.4 * vb.width * u, y: mid - 0.35 * vb.height * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * u) };
      const m = svg.getScreenCTM(), r = stage.getBoundingClientRect();
      if (m) {
        const s = new DOMPoint(p.x, p.y).matrixTransform(m);
        ghost.style.transform = `translate(${s.x - r.left}px, ${s.y - r.top}px)`;
      }
      if (live) live.point(u < 1 ? p : null);
      else if (!crossed && u >= 0.5) { crossed = true; play(card); }
      if (u < 1) requestAnimationFrame(step);
      else ghost.classList.remove("on");
    });
  }

  for (const card of document.querySelectorAll(".card")) {
    const svg = svgOf(card), stage = card.querySelector(".stage"), act = card.querySelector(".act"), kind = card.dataset.kind;
    if (kind === "entrance") {
      requestAnimationFrame(() => play(card));
      act.textContent = "Replay";
      act.addEventListener("click", () => play(card));
      stage.addEventListener("pointerenter", () => { if (canHover.matches && !playing(card)) play(card); });
    }
    if (kind === "loop") {
      if (!reduce.matches) for (const a of starts(svg)) a.beginElement();
      act.textContent = "Pause";
      act.setAttribute("aria-pressed", "false");
      act.addEventListener("click", () => {
        const paused = svg.animationsPaused();
        if (paused) svg.unpauseAnimations(); else svg.pauseAnimations();
        act.textContent = paused ? "Pause" : "Play";
        act.setAttribute("aria-pressed", String(!paused));
      });
    }
    if (kind === "interaction") {
      const factory = window.interactions[card.dataset.name], live = factory ? factory(svg) : null;
      act.textContent = "Demonstrate";
      act.addEventListener("click", () => { if (!reduce.matches) demonstrate(card, live); });
      if (live) {
        stage.addEventListener("pointermove", (e) => { if (!reduce.matches) live.point(toSvg(svg, e.clientX, e.clientY)); });
        stage.addEventListener("pointerleave", () => live.point(null));
      } else {
        stage.addEventListener("pointerenter", () => { if (!reduce.matches && !playing(card)) play(card); });
      }
    }
  }

  // the stage background, for a drawing that has to work on both
  for (const b of document.querySelectorAll("[data-stage]")) {
    b.addEventListener("click", () => {
      document.body.classList.toggle("dark-stages", b.dataset.stage === "dark");
      for (const o of document.querySelectorAll("[data-stage]")) o.setAttribute("aria-pressed", String(o === b));
    });
  }
</script>
</body>
</html>
```
