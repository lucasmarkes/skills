# The rules at the bulk finish

The root names the finish: `fill="currentColor"` and no `stroke` is bulk, on 24 only, shown at 16 to 32 px by CSS. Duotone on 24 declares `stroke="currentColor" fill="none"`; `check.mjs --finish=bulk|duotone` overrides a folder's vote, and a file of the other finish in a set gets `stroke  icon  root finish bulk → duotone, the set's`. The rules keep their names and numbers; this file says where each reads differently at bulk, and the rest is `rules.md`'s text. `examples/bulk`, ten icons with `examples/hairline`'s names, is the finish; its metaphors are not the bar (rule 09). The bar itself is a reference set of forty icons.

What the finish is: one colour, two inks, separate pieces. A **body** is a closed shape filled at `fill-opacity=".4"`: the gray, and the biggest piece. An **accent** is full: a closed shape filled by the root, or a line at stroke 1.75 with round caps and joins. Nothing has a contour; there is no second width; there is no shadow. Black is a small detail on the gray, or a piece behind it; never a blob that fills the keyline. Document order is depth: a later element is in front. Where two elements overlap they either **overprint** or **stack**:

- **Overprint.** A line over anything, or a filled accent lying wholly inside a body: the black goes straight on the gray, nothing is cut.
- **Stack.** A later solid (a body, a filled accent, a modifier) lying partly over an earlier filled element: the one behind is cut by the front's outline grown by 0.75, a gap of paper between the two. `knockout.mjs` cuts it, never a hand.

On a dark page `currentColor` turns light and 0.4 of it is still the body: the file does not change.

Element positions in a message count lines: the root is line 1, so the first element is `@2`.

| Element | What it is | Paint |
| --- | --- | --- |
| body | the object's mass: a squircle, a circle, a pill, a closed path from the kit | `fill-opacity=".4"`, nothing else |
| accent, filled | the gesture, as a shape | nothing: the root fills it |
| accent, line | the gesture, as a line | `fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"` |
| cut element | a body or a filled accent with a stack in front of it | as before, plus `data-cut="knockout" data-body="<the uncut d>"`, written by `knockout.mjs` |

`data-cut` and `data-body` are stripped when `emit.mjs` writes the component; `fill-opacity` becomes `fillOpacity` in React.

## The preset

Grid 24, padding 2, live 20 (2 to 22), step 0.25. Keylines as sizes of ink: circle 20, square 18, portrait 16 × 20, landscape 20 × 16. A line's ink runs 0.875 past its geometry, so a line accent from 3 to 21 nearly fills the 20 keyline. Stroke 1.75, stack 0.75, air 1.5, share 0.25 to 0.6. Corner radius 4 when the body's short side is 12 or more, 2.75 from 6 to 12; below 6, a pill.

## 01 · grid

- As `rules.md`. A cut element's numbers are exempt: `knockout.mjs` writes them. The uncut geometry in `data-body` is judged.

## 02 · keyline

- The 24 keylines above, ±0.5. A body alone rarely fills a keyline: the accents are part of the ink. A line accent reaches a keyline side at its end plus 0.875.

## 03 · stroke

- The root: `viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"`, no `stroke`, no `stroke-width`. A line declares its five paint attributes itself; a body `fill-opacity=".4"`; a filled accent nothing.
- **Rejected when:** `stroke  edit  root stroke-width 1.75 → not set at bulk`; `stroke  edit  path@3 stroke-width 2 → 1.75`; `stroke  edit  circle@2 stroke-linecap missing → round`; `stroke  edit  circle@2 stroke-linejoin missing → round`.
- A root `stroke`, `stroke-linecap` or `stroke-linejoin` is the same message with its own name; a `stroke-dasharray` or any other paint on the root prints `stroke  icon  root <attr> → not set`.

## 04 · construction

- A body is a closed shape at 0.4; an accent is a closed shape or a line, full. Every icon has at least one body and at least one accent. A closed element with a fill and a stroke is a contour, and is refused. The accent is rule 09's gesture; it is sized to read at 16 px: a filled accent no side under 2, a line accent no shorter than 3.
- **Keep it, for a body:** `node <skill-dir>/shapes.mjs squircle --w 18 --h 18 --at 12,12 --finish bulk` prints the square body: `<path d="M 7 3 H 17 C 17.75 3 18.5 3 19.75 4.25 C 21 5.5 21 6.25 21 7 V 17 C 21 17.75 21 18.5 19.75 19.75 C 18.5 21 17.75 21 17 21 H 7 C 6.25 21 5.5 21 4.25 19.75 C 3 18.5 3 17.75 3 17 V 7 C 3 6.25 3 5.5 4.25 4.25 C 5.5 3 6.25 3 7 3 Z" fill-opacity=".4" />`. Every primitive takes `--finish bulk` and prints the body alone; `--accent` prints it full.
- **Keep it, for the pieces:** the object as separate pieces, the gray the biggest. A detail goes on the gray (a line, or a small filled accent inside the body: an overprint). A second piece goes in front of the first, partly over it (a stack: `knockout.mjs` cuts the gap), or 1.5 away from it.
- **Rejected when:** `construction  edit  circle@2 fill and stroke → a body at .4 or an accent, no contour`; `construction  edit  no accent → at least one accent, full`; `construction  edit  path@3 1.5 wide → a filled accent no side under 2`; `construction  edit  path@3 2 long → a line accent no shorter than 3`; `construction  edit  path@3 open and unstroked → a line declares stroke`.
- A file with no body prints `construction  icon  no body → at least one body at .4`; a `fill-opacity` on a line prints `construction  icon  <at> fill-opacity on a line → not set`; a body at another opacity prints `construction  icon  <at> fill-opacity <n> → .4`.

## 05 · weight

- ±15% of the set's median, ±20% of the reference, the median of `examples/bulk`. The ink is rendered alpha: a body counts at 0.4, an accent at 1, so a body 18 square weighs about as much as a line accent 20 long. Move weight with the body's size first, then the accent's.

## 06 · gravity

- ±0.5, as `rules.md`. The body sets the mass; an accent in a corner pulls it. Centre the body on the keyline and let the accent's pull stay under 0.5, or move the body the other way by a quarter.

## 07 · radius

- A squircle from the kit: radius 4 when the short side is 12 or more, 2.75 from 6 to 12, and below 6 a pill (`--r` half the short side). No `rect`.
- **Rejected when:** `radius  edit  rect@2 → shapes.mjs squircle`.

## 08 · gap, and the stack

- Two elements that overlap are a stack or an overprint, judged in document order on the uncut geometry. A line in front of anything overprints; a filled accent wholly inside a body overprints. A later solid partly over an earlier body or filled accent stacks: the one behind is cut, 0.75 of paper around the front. Two elements that do not overlap touch (edges within 0.1) or keep 1.5 apart, edge to edge.
- **Add the cut:** `node <skill-dir>/knockout.mjs pretty-icons/<name>.svg` cuts every stack and writes the file; `--print` prints it instead. It prints `edit  cut path@2 under path@3`, or `edit  nothing to cut`. Run it again after any edit: it starts from `data-body`, so a second run gives the same file. Crumbs are judged by thickness, the widest circle that fits a piece: no cut piece under 1 across. A cut that would leave one refuses: `crumb  edit  path@2 a piece 0.75 across under path@3 → at least 1: move the piece in front`.
- **Rejected when:** `stack  edit  path@3 overlaps path@2 without a cut → node knockout.mjs pretty-icons/edit.svg` (the path is the file's own); `stack  edit  path@3 overlaps circle@2 without a cut → node knockout.mjs pretty-icons/edit.svg` (a circle is named as a circle until it is cut); `gap  edit  circle@2 to path@3 1.31 apart → ≥ 1.5 apart, or crossing`; `gap  edit  path@3 to path@4 1 apart → ≥ 1.5 apart, or crossing`.
- **Refused, whatever the cut:** a later filled element over an earlier line, `stack  edit  path@4 over the line path@3 → draw the line in front, or keep them apart`; a later body wholly inside an earlier element, `stack  edit  path@3 inside path@2 → a gray detail vanishes: make it an accent, or a stack`. A filled accent wholly inside another filled accent prints `stack  icon  <at> inside <at> → black on black: keep them apart, or a stack`; an element wholly under a later one prints `stack  icon  <at> hidden under <at> → draw it in front, or keep them apart`.
- A stack's gap measured off 0.75 by more than 0.25 prints `stack  icon  paper <w> wide at <x>, <y> → 0.75: re-run knockout.mjs` (a gap cut by hand); a cut element with nothing left in front of it prints `stack  icon  <at> cut with no overlap → re-run knockout.mjs`; `data-cut` on a line prints `stack  icon  <at> data-cut → only on a body or a filled accent`. The first two are cured by running `knockout.mjs` again, never by editing the cut.

## 09 · metaphor

- As `rules.md`: one object, at most three elements, eight drawing commands across the accents: a line counts its drawing commands, a filled accent one per subpath. Do not copy `examples/bulk`'s metaphors.
- **Rejected when:** `count  edit  accents 9 drawing commands → at most 8`.

## 10 · set

- As `rules.md`.

## 11 · share

- The accent's ink over the whole ink, 0.25 to 0.6. Under it the icon is a pale blob; over it, a glyph on a sliver.
- The body is the biggest piece: every element is rendered alone and full, and no accent's area may pass the largest body's. Black in front of a small gray back is a black icon with a gray rim.
- **Keep it, for a pale icon:** a larger accent, or a second line in the same path (two bars, not one). **For a dark one:** a larger body, or a thinner gesture; for a black piece bigger than the gray, swap their inks.
- **Rejected when:** `share  empty  accent 0.03 of the ink → 0.25 to 0.6`; `share  cards  path@3 area 207 → under the largest body's 33: the gray body is the biggest piece`.

## 12 · air, loose and diagonal

- Air: paper 1.5 wide and a counter of 2, in grid units, between parts that do not overlap. A stacked pair is held at the gap, 0.75, not at the air; an overprinted pair is exempt. A strip of 1 unit is reported as 1.1 wide, the measure being rounded up by an eighth. Loose is not judged at bulk: a detail overprinted inside a body may sit anywhere in it. Diagonal as `rules.md`.
- Air prints as `air  icon  paper <w> wide at <x>, <y> → ≥ 1.5 apart, or touching` or `air  icon  counter <w> across at <x>, <y> → ≥ 2 across`, with the place.

## 13 · modifiers

- `badge:plus`, `badge:minus`, `badge:check`, `badge:x` and `dot` only, as a later filled accent: `node <skill-dir>/modifiers.mjs pretty-icons/<name>.svg badge:plus` places the glyph and writes the file. Where it lies partly over a body or a filled accent it stacks, and the one behind is cut by 0.75; wholly inside a body it overprints. A line is never under it. No shadow at bulk. The kit guarantees the gap, a live glyph and the cut; it does not guarantee the share or the weight, so after adding a modifier run `check.mjs`.
- **Refused when:** `slash is not drawn at bulk: badge:plus, badge:minus, badge:check, badge:x or dot`.
