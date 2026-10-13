# pretty-icons: bulk, overprint and stack

Date: 2026-10-13 · Repo: `lucasmarkes/skills` · Skill: `skills/pretty-icons` · Branch: `pretty-icons-polish` · Follows: `2026-10-12-pretty-icons-bulk-design.md`

## Why

The first bulk set read heavy and childish beside a reference set of forty icons. Every accent wore a band of paper 1.5 wide, the line was 2, and a black accent often filled most of the keyline. A hand spike of three finance icons (a wallet, cards, charts) fixed it, and the person approved it. Measured on the reference set:

1. a line accent is 1.75 wide, not 2;
2. an accent lying on a body sits straight on it: no paper around it;
3. where two solids overlap, the one behind is cut by a gap of about 0.75;
4. the biggest single piece is always a gray body; black is a detail or a back piece.

This pass replaces the knockout halo with that model. Duotone and filled do not change.

## The rules

1. **Stroke 1.75**, round caps and joins, on every line accent. Preset `stroke: 1.75`, `weights: [1.75]`.
2. **Overprint.** A line drawn after a body, anywhere over it, or a filled accent lying entirely inside a body, is not cut: black prints straight on the gray. The 1.5 paper band is gone.
3. **Stack, gap 0.75.** Document order is depth. When a later solid (a body or a filled accent) lies partly over an earlier filled element, the earlier one is cut by the later one's outline grown by 0.75. `knockout.mjs` writes the cut (`data-cut="knockout"`, `data-body` the uncut `d`), on a body or a filled accent alike, never by hand. Preset key `stack: 0.75` replaces `knockout: 1.5`; the rule is named `stack`.
4. **Refusals.** A later filled element over an earlier line is refused (draw the line in front, or keep them apart). A later body lying entirely inside an earlier element is refused (a gray detail vanishes: make it an accent, or a stack). A filled accent entirely inside an earlier filled accent (black on black) and an element hidden under a later one are refused too.
5. **The body is the biggest piece.** No accent element, by its painted area after any cut, may be larger than the largest body after its cut. A new `share` failure: `path@3 area 207 → under the largest body's 33: the gray body is the biggest piece`. The share band 0.25 to 0.6 stays.
6. **Radius.** A squircle's radius is 4 when its short side is 12 or more, 2.75 from 6 to 12, and a pill below 6 (was 5 and 3).
7. **Air 1.5** between separate parts. A stacked pair is held at the gap; an overprinted pair is exempt.
8. **Measured gap.** The measured band becomes the stack gap, 0.75 ± 0.25 (`STACK_TOL`), with the cure `re-run knockout.mjs`.
9. **Modifiers** follow the model: the badge is a later filled accent; partly over a body or accent it stacks, fully inside a body it overprints.
10. **Weight reference.** `BULK_REFERENCE_INK` stays the median ink of `examples/bulk`, recomputed after the redraw: 125.9 on 24.

## Examples and fixtures

The ten `examples/bulk` icons are redrawn in the spike's manner: a gray main object, separate pieces with air, black only as a small detail or a back piece, no blob filling the keyline. `devices`, `empty` and `marks` show the stack; `coding`, `connectivity` and `security` show a line overprinted.

`test/pretty-icons/fixtures/bulk-finance/` holds the spike redrawn with the kit (squircles and pills from `shapes.mjs`, the cut from `knockout.mjs`, no `rect`, no `mask`); it passes check. `bulk-black-front/cards.svg` is the rejected look, the front card full black, and fails rule 5.

## Not changed

Duotone, filled, the keylines, padding 2, the share band, the element and command budgets, and the studio read.
