# Bulk with cuts: ai-v5, six segment sets and the ai-v6 primitive kit (2026-10-27)

Bulk drawn by hand against the reference set, with cuts between the tones: black in front of gray, gray in front of black, and a white gap between them. 75 icons, 24 grid.

| Folder | What it is |
|---|---|
| `ai-v5/` | the fifteen AI icons of v3, redrawn with cuts in both directions |
| `ai-v6/` | ai-v5 with every sparkle rebuilt by `kit.mjs`, plus redrawn sparkles, head and agent |
| `ai-v6/agent-variants/` | agent A (cursor on a tile, the one kept), B (bust with a badge), C (loop around a sparkle) |
| `ai-v6/comparison-v5-v6.png` | v5 against v6, large and at 24 px |
| `segments/{finance,ecommerce,health,travel,food,media}/` | ten icons each in the same style, to test it outside AI |
| `kit.mjs` | the primitives ai-v6 is built from |

Each folder has a `grid.png` at 24 px.

## The format

- `viewBox 0 0 24 24`, root `fill="currentColor"`.
- Gray is `fill-opacity=".4"`, black is full opacity, white is the gap or a knockout.
- Lines are 1.75 with round caps and joins.
- A cut is a `<defs><mask>`: a white rect and the front piece in black with a black stroke, so the gap is half that stroke. A hole inside one piece is `fill-rule="evenodd"`.

## What the audit of ai-v5 and the segments found

- Gaps drift: 0.75 in 38 cuts, 0.875 in 13 (line cutters of 3.25 or 3.5), 1 in sparkles, 0 in the agent and chip knockouts.
- More than 45 distinct corner radii.
- 349 `Q` commands, mostly corners drawn as quadratic joins instead of arcs.
- 35% of coordinates are off the 0.25 grid.
- Every visible stroke is already 1.75; circles and lines needed nothing.

## The kit

`kit.mjs` fixes those in one place:

- `GAP = 0.75` and `LINE = 1.75`; `mask(id, cut, { line })` builds the cutter from them, so every cut has the same gap.
- `R = { xs: 1, s: 1.5, m: 2.5, l: 3.5, xl: 4.5 }`, a short radius scale.
- `star(cx, cy, r)`: a geometric four-point sparkle with cubic sides; each tip opens at a fixed angle and is filleted by a true arc, and `r` is the visible radius.
- `roundPoly(pts, r)`: a polygon with every corner filleted by a true arc (triangles, the cursor, arrowheads).
- `rrect`, `circle`, and the `svg`, `gray`, `black`, `line` writers.

ai-v6 uses it for every sparkle and for the three redrawn icons. The segment sets are still the hand-drawn v5 primitives.

## The translator

`translate.mjs` does not yet read this style. It fails on evenodd knockouts, line fronts, more than one mask per icon, stroke masks and gray bodies made of several pieces.

## Open

- Pass the sixty segment icons through the kit.
- Make bulk with cuts the skill's drawn style: the kit as the skill's primitives, the rules recalibrated to it, and the translator taught the new cuts. The skill's rules and examples are unchanged in this commit.
