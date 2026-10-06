# pretty-icons baseline: three runs without the skill

Three fresh agents got the same prompt, with no access to `skills/pretty-icons`. Each set was then measured with `node skills/pretty-icons/check.mjs <folder> --print`. All three sets fail. The failures that recur are the baseline that SKILL.md has to turn into passes.

## Prompt

> Draw ten SVG icons for a sidebar, 16 × 16, stroke 1.5 round caps and joins in currentColor, with a currentColor fill at 20% under every closed shape. The names: all, interfaces, data, machines, devices, coding, security, connectivity, empty, marks. Write one file per icon, `<name>.svg`, into `<scratch>/baseline-a/`. Make them sit even in a row.
>
> Work only in that folder; do not read any other files on this machine. When done, reply with one line: the folder path.

Runs B and C used the same text with `baseline-b/` and `baseline-c/`. The last paragraph was added to the plan's prompt to keep each run blind to the skill's files.

## Run A

```
┌─────────┬────────────────┬──────┬──────┬─────────────┬────────┬───────┬───────┐
│ (index) │ icon           │ w    │ h    │ keyline     │ ink    │ dx    │ dy    │
├─────────┼────────────────┼──────┼──────┼─────────────┼────────┼───────┼───────┤
│ 0       │ 'all'          │ 12.5 │ 12.5 │ 'square'    │ 102.25 │ 0     │ 0     │
│ 1       │ 'coding'       │ 13.5 │ 11.5 │ 'landscape' │ 49.21  │ 0     │ 0     │
│ 2       │ 'connectivity' │ 14   │ 13.5 │ 'circle'    │ 74.95  │ 0     │ 1.3   │
│ 3       │ 'data'         │ 11.5 │ 13   │ '—'         │ 94.87  │ 0     │ -0.12 │
│ 4       │ 'devices'      │ 9    │ 13.5 │ '—'         │ 70.27  │ 0     │ 0.19  │
│ 5       │ 'empty'        │ 13.5 │ 11.5 │ 'landscape' │ 88.97  │ 0     │ 0.6   │
│ 6       │ 'interfaces'   │ 13   │ 11.5 │ '—'         │ 95.17  │ -0.13 │ -0.11 │
│ 7       │ 'machines'     │ 12.5 │ 12.5 │ 'square'    │ 110.79 │ 0.06  │ 0     │
│ 8       │ 'marks'        │ 9.5  │ 13.5 │ '—'         │ 71.75  │ 0     │ -0.17 │
│ 9       │ 'security'     │ 11.5 │ 13.5 │ 'portrait'  │ 75.9   │ 0     │ -0.35 │
└─────────┴────────────────┴──────┴──────┴─────────────┴────────┴───────┴───────┘
radius  all  rect@2 rx 1.25 → rx 1
radius  all  rect@3 rx 1.25 → rx 1
radius  all  rect@4 rx 1.25 → rx 1
radius  all  rect@5 rx 1.25 → rx 1
count  all  4 elements → at most 3
construction  coding  no filled element → at least one body
grid  connectivity  path@5 d[0] 7.06 → a multiple of 0.25
grid  connectivity  path@5 d[1] 5.77 → a multiple of 0.25
grid  connectivity  path@5 d[2] 4.69 → a multiple of 0.25
grid  connectivity  path@5 d[3] 10.23 → a multiple of 0.25
grid  connectivity  path@5 d[4] 8.94 → a multiple of 0.25
grid  connectivity  path@5 d[5] 5.77 → a multiple of 0.25
grid  connectivity  path@5 d[6] 2.37 → a multiple of 0.25
grid  connectivity  path@5 d[7] 4.46 → a multiple of 0.25
count  connectivity  4 elements → at most 3
elements  data  line 3: <ellipse> is not one of rect, circle, line, path → only rect, circle, line, path, flat
radius  devices  rect@2 rx 1.75 → rx 1
count  empty  path@2 9 commands → at most 8
radius  interfaces  rect@2 rx 1.75 → rx 1.5
radius  machines  rect@2 rx 1.25 → rx 1
radius  machines  rect@3 rx 1.25 → rx 1
grid  machines  path@4 d[2] 0.01 → a multiple of 0.25
grid  machines  path@4 d[5] 0.01 → a multiple of 0.25
grid  security  path@2 d[6] 2.9 → a multiple of 0.25
grid  security  path@2 d[7] -2.1 → a multiple of 0.25
grid  security  path@2 d[11] -2.9 → a multiple of 0.25
grid  security  path@2 d[14] -3.35 → a multiple of 0.25
gap  all  rect@2 to rect@3 0.5 apart → ≥ 1.5 apart, or crossing
gap  all  rect@2 to rect@4 0.5 apart → ≥ 1.5 apart, or crossing
gap  all  rect@3 to rect@5 0.5 apart → ≥ 1.5 apart, or crossing
gap  all  rect@4 to rect@5 0.5 apart → ≥ 1.5 apart, or crossing
gravity  connectivity  mass +0, +1.3 → within ±0.5
keyline  data  11.5 × 13 → square 12.5 × 12.5 ±0.5
keyline  devices  9 × 13.5 → portrait 11 × 14 ±0.5
gap  devices  rect@2 to path@3 1 apart → ≥ 1.5 apart, or crossing
gravity  empty  mass +0, +0.6 → within ±0.5
keyline  interfaces  13 × 11.5 → square 12.5 × 12.5 ±0.5
gap  machines  rect@2 to rect@3 0.5 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@2 to path@4 0.75 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@3 to path@4 0.75 apart → ≥ 1.5 apart, or crossing
keyline  marks  9.5 × 13.5 → portrait 11 × 14 ±0.5
gap  security  path@2 to path@3 1.24 apart → ≥ 1.5 apart, or crossing
weight  all  ink 102.25 (+24.0%) → within ±15% of the set's median 82.43
weight  coding  ink 49.21 (-40.3%) → within ±15% of the set's median 82.43
weight  data  ink 94.87 (+15.1%) → within ±15% of the set's median 82.43
weight  interfaces  ink 95.17 (+15.4%) → within ±15% of the set's median 82.43
weight  machines  ink 110.79 (+34.4%) → within ±15% of the set's median 82.43
```

## Run B

```
┌─────────┬────────────────┬──────┬──────┬─────────────┬────────┬──────┬───────┐
│ (index) │ icon           │ w    │ h    │ keyline     │ ink    │ dx   │ dy    │
├─────────┼────────────────┼──────┼──────┼─────────────┼────────┼──────┼───────┤
│ 0       │ 'all'          │ 12.5 │ 12.5 │ 'square'    │ 90.74  │ 0    │ 0     │
│ 1       │ 'coding'       │ 14   │ 12   │ '—'         │ 49.93  │ 0    │ 0     │
│ 2       │ 'connectivity' │ 14   │ 14   │ 'circle'    │ 76.28  │ 0    │ 1.36  │
│ 3       │ 'data'         │ 12   │ 12.5 │ 'square'    │ 95.25  │ 0    │ -0.01 │
│ 4       │ 'devices'      │ 14   │ 11   │ 'landscape' │ 73.52  │ 0    │ 0.42  │
│ 5       │ 'empty'        │ 13   │ 13   │ 'square'    │ 49.81  │ 0    │ 0     │
│ 6       │ 'interfaces'   │ 13.5 │ 11.5 │ 'landscape' │ 101.13 │ 0    │ -0.09 │
│ 7       │ 'machines'     │ 12.5 │ 12.5 │ 'square'    │ 108.34 │ 0.06 │ 0     │
│ 8       │ 'marks'        │ 10   │ 13.5 │ '—'         │ 73.65  │ 0    │ -0.15 │
│ 9       │ 'security'     │ 12   │ 14   │ '—'         │ 80.75  │ 0    │ -0.26 │
└─────────┴────────────────┴──────┴──────┴─────────────┴────────┴──────┴───────┘
count  all  4 elements → at most 3
construction  coding  no filled element → at least one body
grid  connectivity  path@5 d[0] 7.11 → a multiple of 0.25
grid  connectivity  path@5 d[1] 5.54 → a multiple of 0.25
grid  connectivity  path@5 d[2] 4.64 → a multiple of 0.25
grid  connectivity  path@5 d[3] 10.46 → a multiple of 0.25
grid  connectivity  path@5 d[4] 8.89 → a multiple of 0.25
grid  connectivity  path@5 d[5] 5.54 → a multiple of 0.25
grid  connectivity  path@5 d[6] 11.36 → a multiple of 0.25
grid  connectivity  path@5 d[7] 10.46 → a multiple of 0.25
count  connectivity  4 elements → at most 3
radius  devices  rect@2 rx 1.25 → rx 1
radius  machines  rect@2 rx 1.25 → rx 1
radius  machines  rect@3 rx 1.25 → rx 1
grid  machines  path@4 d[1] 4.625 → a multiple of 0.25
grid  machines  path@4 d[2] 0.01 → a multiple of 0.25
grid  machines  path@4 d[4] 11.375 → a multiple of 0.25
grid  machines  path@4 d[5] 0.01 → a multiple of 0.25
grid  machines  path@5 d[1] 4.625 → a multiple of 0.25
grid  machines  path@5 d[4] 11.375 → a multiple of 0.25
count  machines  4 elements → at most 3
keyline  coding  14 × 12 → landscape 14 × 11 ±0.5
gap  coding  path@2 to path@4 0.61 apart → ≥ 1.5 apart, or crossing
gap  coding  path@3 to path@4 0.61 apart → ≥ 1.5 apart, or crossing
gravity  connectivity  mass +0, +1.36 → within ±0.5
gap  data  path@3 to path@4 1.03 apart → ≥ 1.5 apart, or crossing
gap  devices  rect@2 to path@3 1 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@2 to rect@3 1 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@2 to path@4 0.63 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@2 to path@5 0.63 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@3 to path@4 0.63 apart → ≥ 1.5 apart, or crossing
gap  machines  rect@3 to path@5 0.63 apart → ≥ 1.5 apart, or crossing
gap  machines  path@4 to path@5 1.49 apart → ≥ 1.5 apart, or crossing
keyline  marks  10 × 13.5 → portrait 11 × 14 ±0.5
keyline  security  12 × 14 → portrait 11 × 14 ±0.5
gap  security  path@2 to path@3 1.24 apart → ≥ 1.5 apart, or crossing
weight  all  ink 90.74 (+15.6%) → within ±15% of the set's median 78.51
weight  coding  ink 49.93 (-36.4%) → within ±15% of the set's median 78.51
weight  data  ink 95.25 (+21.3%) → within ±15% of the set's median 78.51
weight  empty  ink 49.81 (-36.6%) → within ±15% of the set's median 78.51
weight  interfaces  ink 101.13 (+28.8%) → within ±15% of the set's median 78.51
weight  machines  ink 108.34 (+38.0%) → within ±15% of the set's median 78.51
```

## Run C

```
┌─────────┬────────────────┬──────┬──────┬────────────┬────────┬───────┬───────┐
│ (index) │ icon           │ w    │ h    │ keyline    │ ink    │ dx    │ dy    │
├─────────┼────────────────┼──────┼──────┼────────────┼────────┼───────┼───────┤
│ 0       │ 'all'          │ 12   │ 12   │ 'square'   │ 90.74  │ 0     │ 0     │
│ 1       │ 'coding'       │ 12.5 │ 11.5 │ '—'        │ 85.57  │ -0.1  │ 0.08  │
│ 2       │ 'connectivity' │ 13.5 │ 13   │ '—'        │ 69.24  │ 0     │ 1.3   │
│ 3       │ 'data'         │ 11.5 │ 13   │ '—'        │ 94.77  │ 0     │ -0.11 │
│ 4       │ 'devices'      │ 9.5  │ 13   │ '—'        │ 70.67  │ 0     │ 0.16  │
│ 5       │ 'empty'        │ 13   │ 11.5 │ '—'        │ 86.46  │ 0     │ 0.61  │
│ 6       │ 'interfaces'   │ 12.5 │ 11.5 │ '—'        │ 92.22  │ -0.14 │ -0.11 │
│ 7       │ 'machines'     │ 12.5 │ 12   │ 'square'   │ 101.23 │ 0.06  │ 0     │
│ 8       │ 'marks'        │ 9.5  │ 13   │ '—'        │ 69.64  │ 0     │ -0.18 │
│ 9       │ 'security'     │ 11.5 │ 13.5 │ 'portrait' │ 75.17  │ 0     │ -0.3  │
└─────────┴────────────────┴──────┴──────┴────────────┴────────┴───────┴───────┘
count  all  4 elements → at most 3
radius  coding  rect@2 rx 1.75 → rx 1.5
grid  connectivity  path@5 d[0] 7.18 → a multiple of 0.25
grid  connectivity  path@5 d[1] 5.55 → a multiple of 0.25
grid  connectivity  path@5 d[2] 4.57 → a multiple of 0.25
grid  connectivity  path@5 d[3] 10.45 → a multiple of 0.25
grid  connectivity  path@5 d[4] 8.82 → a multiple of 0.25
grid  connectivity  path@5 d[5] 5.55 → a multiple of 0.25
grid  connectivity  path@5 d[6] 11.43 → a multiple of 0.25
grid  connectivity  path@5 d[7] 10.45 → a multiple of 0.25
count  connectivity  4 elements → at most 3
radius  devices  rect@2 rx 1.75 → rx 1.5
count  empty  path@2 11 commands → at most 8
radius  interfaces  rect@2 rx 1.75 → rx 1.5
radius  machines  rect@2 rx 1.75 → rx 1.5
grid  machines  path@3 d[4] 5.375 → a multiple of 0.25
grid  machines  path@3 d[5] 5.01 → a multiple of 0.25
grid  machines  path@3 d[7] 10.625 → a multiple of 0.25
grid  machines  path@3 d[8] 5.01 → a multiple of 0.25
grid  machines  path@3 d[10] 5.375 → a multiple of 0.25
grid  machines  path@3 d[13] 10.625 → a multiple of 0.25
count  machines  path@3 10 commands → at most 8
grid  security  path@2 d[6] 10.6 → a multiple of 0.25
grid  security  path@2 d[7] 10.9 → a multiple of 0.25
grid  security  path@2 d[11] 5.1 → a multiple of 0.25
grid  security  path@2 d[14] 10.6 → a multiple of 0.25
gap  all  rect@2 to rect@3 1 apart → ≥ 1.5 apart, or crossing
gap  all  rect@2 to rect@4 1 apart → ≥ 1.5 apart, or crossing
gap  all  rect@3 to rect@5 1 apart → ≥ 1.5 apart, or crossing
gap  all  rect@4 to rect@5 1 apart → ≥ 1.5 apart, or crossing
keyline  coding  12.5 × 11.5 → square 12.5 × 12.5 ±0.5
gap  coding  rect@2 to path@3 1.25 apart → ≥ 1.5 apart, or crossing
keyline  connectivity  13.5 × 13 → circle 14 × 14 ±0.5
gravity  connectivity  mass +0, +1.3 → within ±0.5
keyline  data  11.5 × 13 → square 12.5 × 12.5 ±0.5
keyline  devices  9.5 × 13 → portrait 11 × 14 ±0.5
gap  devices  rect@2 to path@3 1.25 apart → ≥ 1.5 apart, or crossing
keyline  empty  13 × 11.5 → square 12.5 × 12.5 ±0.5
gravity  empty  mass +0, +0.61 → within ±0.5
keyline  interfaces  12.5 × 11.5 → square 12.5 × 12.5 ±0.5
keyline  marks  9.5 × 13 → portrait 11 × 14 ±0.5
gap  security  path@2 to path@3 1.24 apart → ≥ 1.5 apart, or crossing
weight  connectivity  ink 69.24 (-19.5%) → within ±15% of the set's median 86.02
weight  devices  ink 70.67 (-17.8%) → within ±15% of the set's median 86.02
weight  machines  ink 101.23 (+17.7%) → within ±15% of the set's median 86.02
weight  marks  ink 69.64 (-19.0%) → within ±15% of the set's median 86.02
```

## Failures in two or more runs

Each line gives the rule, what the agents did, and the runs it happened in.

- `count`: all drawn as four separate rects, not one path of four cells (A, B, C).
- `count`: connectivity drawn as three circles plus one path of edges, four elements (A, B, C).
- `count`: machines over the limit, as four elements (B) or as a path of 10 commands (C).
- `count`: the empty tray drawn as a path over 8 commands (A, C).
- `construction`: coding drawn as bare strokes, `</>` with no filled body (A, B).
- `radius`: rx 1.25 and 1.75 instead of the 1 or 1.5 the preset gives for the shape's smaller side (A, B, C).
- `grid`: connectivity edges computed to end on the circles, at coordinates like 7.06 and 5.77 (A, B, C).
- `grid`: machines status dots drawn as 0.01-long segments (A, B, C), with rows off the grid at 4.625 and 11.375 (B) or 5.375 and 10.625 (C).
- `grid`: the security shield's curves at 2.9, 10.6 and 10.9 (A, C).
- `keyline`: the marks bookmark is 9.5 to 10 wide against the portrait 11 × 14 (A, B, C).
- `keyline`: the devices phone is 9 to 9.5 wide against the portrait 11 (A, C).
- `keyline`: the data cylinder is 11.5 × 13, between square and portrait (A, C).
- `keyline`: interfaces is 12.5 to 13 × 11.5, between square and landscape (A, C).
- `keyline`: coding misses every keyline, at 14 × 12 (B) and 12.5 × 11.5 (C).
- `gap`: the security check sits 1.24 from the shield (A, B, C).
- `gap`: the device detail sits 1 to 1.25 from its body (A, B, C).
- `gap`: the all cells are 0.5 to 1 apart (A, C).
- `gap`: the machines rows and dots are 0.5 to 1.49 apart (A, B).
- `gap`: the coding details are 0.61 to 1.25 from each other or from the body (B, C).
- `gravity`: connectivity's mass sits 1.3 low, because its box was centred and its mass was not (A, B, C).
- `gravity`: the empty tray's mass sits 0.6 low (A, C).
- `weight`: machines is 17 to 38% heavier than the set (A, B, C).
- `weight`: all, data and interfaces are 15 to 29% heavier (A, B).
- `weight`: coding is 36 to 40% lighter, because it has no body (A, B).

The rest of the failure lines above appear in one run only, for example data drawn with `<ellipse>` (A) and the light devices and marks (C). They are kept in the run blocks but do not count as habits.

## What no rule catches

- **The same stock metaphors in every run.** All three sets use the same picks: a 2 × 2 grid, a three-node triangle, a cylinder, a server rack, a bookmark, and a shield with a check. They are readable but generic. The reader has to judge whether a metaphor fits the name, not whether it looks familiar.
- **Interfaces drawn as a window or a card.** Runs A and C drew a layout window, which reads as "layout" or "browser". Run B drew a card with a stripe, which reads as "payments".
- **A plural name drawn singular.** Every run drew devices as one device: a phone in A and C, a laptop in B. A phone reads as "mobile".
- **Empty drawn as something else.** Runs A and C drew an inbox tray, which reads as "inbox". Run B drew a dashed circle, which reads as "loading" or "placeholder". Its dash pattern passes, since dash and gap are both at least the stroke. Only its weight fails.

These four go to `read.md`'s criteria.

## How the agents worked

None of the agents measured the rendered set. Runs A and C rendered a preview to look at, and run B did not. "Sit even in a row" was handled by centring each bounding box, which leaves mass off centre, as connectivity's gravity failure shows. The keyline failures are size choices: each body was drawn to look right alone, not to fill a shared keyline. This goes to SKILL.md's "what goes wrong" table.

## With the skill: three runs

Three fresh agents got the same prompt, writing to `with-a/`, `with-b/` and `with-c/`, plus a short paragraph: "Use the skill at `skills/pretty-icons` (read its SKILL.md first)", no subagents, stop after the sheet, deliver nothing, and reply with the folder and `check.mjs`'s last line. They were not allowed to read `examples/`, `docs/` or `test/`, because `examples/hairline` draws the same ten names. Each agent stopped after `sheet.mjs`. The controller then re-ran `check.mjs --print`, rendered its own blind sheet with a fresh seed, and gave it to a new reader with the prompt from `read.md`.

| Run | `check.mjs` | Ink range (median) | Blind read |
|---|---|---|---|
| A | `ok` | 69.50–92.09 (81.55) | 10/10 |
| B | `ok` | 73.35–91.26 (82.02) | 10/10 |
| C | `ok` | 71.07–95.07 (83.04) | 10/10 |

Every icon in every run sits on a keyline, and every mass offset is within ±0.5. Not one failure line was printed.

Objects the readers named:

- **A:** Wi-Fi arcs, bookmark, shield, slashed circle, terminal prompt, two-unit server, cylinder, stacked layers, cursor arrow, phone beside tablet.
- **B:** slashed circle, terminal, robot head, cylinder, layers, monitor and phone, toggle switch, bookmark, router with antennas, padlock.
- **C:** monitor and phone, toggle switch, robot head, cylinder, shield with keyhole, terminal prompt, bookmark, slashed circle, four-square grid, power plug.

What changed against the baseline:

- **Bodies converged.** In A and B, marks is the same bookmark path and empty is the same slashed disc. Coding is the same 12.5 × 9.5 rect in all three runs. The table's bodies account for the rect and the bookmark. The disc, at r 4.75, is not a table body, so its match came from the agents drawing alike.
- **Plurals.** Devices is drawn as two objects in all three runs, where the baseline drew one device in every run.
- **Familiar picks stayed. The three-node triangle and the check inside the shield went.** Readers still named a bookmark in all three runs, a cylinder in all three, a shield in A and C, a four-square grid in C and a server in A. Rule 09 calls these familiar picks neither good nor bad.
- **One agent measured and redrew.** Run C's first connectivity, a Wi-Fi icon, came out too light, and the agent replaced it with a plug.

What stays weak:

- **Interfaces** is a toggle in B and C. Both readers called it their least certain match. C's reader paired it because no other name was left. B's reader said it could read as a toggle for a setting. In A it is a cursor arrow.
- **Connectivity in C** read as a "power plug". The object belongs to no name.
- **Machines and devices** sit close in B and C. Both readers paired them by choosing the closer fit, not because the drawings were distinct. A's reader said its server could also read as data.
- **Sheet location.** All three agents were surprised that `sheet.mjs` writes its PNGs beside the folder, not inside it.

Bar: at least two of three sets `ok`, and every reader pairs at least 9 of 10. Met on the first round, so the skill text was not changed after these runs.
