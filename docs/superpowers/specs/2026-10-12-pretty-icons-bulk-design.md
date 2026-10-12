# pretty-icons: the bulk finish

Date: 2026-10-12 · Repo: `lucasmarkes/skills` · Skill: `skills/pretty-icons` · Branch: `pretty-icons-polish` · Follows: `2026-10-11-pretty-icons-polish-design.md`

## Why

The skill draws two finishes: duotone, a thin stroke with a 20% tint, on 16 to 24; and filled, a line over toned bodies with shade, on 48. Both measure well and read as one set. Beside the set the person holds up as the bar (the bulk reference sheet), they look built, not made: thin, pale, polite. The bar is the opposite construction:

1. no contour at all: a body is a flat tone, an accent is a flat ink;
2. heavy: the ink is about 2 on 24, with round ends;
3. a band of paper wherever the accent crosses the body, so nothing touches by accident;
4. corners of continuous curvature, not a rect with `rx`;
5. elements that fill the keyline, and an accent large enough to read at 16 px.

This pass adds that construction as a third finish, **bulk**, beside the two that exist. The thin duotone stays for apps that are thin; the filled 48 stays as it is. Nothing in either changes.

## What success is

1. `examples/bulk`, ten icons with the names of `examples/hairline`, passes `check.mjs`, the blind read, the craft read and the set read.
2. The studio read: a fresh reader is given the `examples/bulk` sheet and the bar side by side, lettered at random, and asked which set looks drawn by an icon studio, A, B or both. Success is "both". A set it singles out goes back to the drawing with its words.
3. The trial: two fresh agents, with the skill alone, each draw six icons in an empty folder (a notes app's sidebar; a shop's categories). Each reaches `ok` on `check.mjs` run 1 or 2, and a fresh blind reader names 6 of 6, none by elimination.
4. A drawer never writes a knockout edge by hand: every cut in every passing file was written by `knockout.mjs`.

## Decisions

**The finish.** One colour, two inks. Everything is `currentColor`: a **body** carries `fill-opacity=".4"`, an **accent** is full. No element has a contour. An element is a closed shape with a fill, or a line at stroke 2 with round caps and joins; either may be body or accent; there is no second width. The finish is named by the root: `fill="currentColor"` and no `stroke`. Duotone's root is `stroke="currentColor" fill="none"`, so a file on 24 declares which finish it is; `check.mjs --finish=bulk|duotone` overrides.

**The grid.** 24 only, shown at 16 to 32 px by CSS, as the reference set does. Padding 2, live 20, step 0.25. Keylines, as sizes of ink: circle 20, square 18, portrait 16 × 20, landscape 20 × 16. A line's ink runs 1 past its geometry.

**The knockout.** Where an accent crosses a body, a band of paper 1.5 wide follows the accent's outline, cut out of the body. `knockout.mjs` cuts it; a drawer never does. An accent that does not cross a body obeys gap as today: touching (centrelines within 0.1) or 1.5 apart, edge to edge. A crossing with no cut is refused.

**Corners.** A rect in this finish is a squircle: a closed path of continuous curvature printed by `shapes.mjs squircle`, radius 5 when the smaller side is 12 or more, 3 below, or a pill. A `rect` with `rx` is refused: the continuous curve is part of what makes the bar look made.

**Weight and share.** Weight is measured as today, from rendered alpha, so a body counts at 0.4 and an accent at 1; the reference is the median of `examples/bulk`, within 15% of the set's median and 20% of the reference. **Share**, new, is the accent's ink over the icon's whole ink: a band, 0.25 to 0.6 to start, calibrated on the example. A body with no accent is pale; an accent with no body is a glyph; both are refused by construction before share sees them.

**Dark mode.** The file does not change: `currentColor` turns light, and 0.4 of it is still the body.

**Modifiers.** `badge:plus`, `badge:minus`, `badge:check`, `badge:x` and `dot` exist at this finish as full accents with a knockout, written through `knockout.mjs`. `slash`, `lock` and `arrow:*` are not in this pass. There is no shadow.

**Dependencies.** `paper` (paper.js, 0.12.18) joins `@resvg/resvg-js` in the cache `raster.mjs` keeps, installed on first use, never into the app. It is used for one thing: subtracting a halo from a body while keeping the body's cubics. A spike confirmed it runs headless in Node and that a halo built from stadiums per straight segment subtracts cleanly: a squircle body less a rotated rect accent came out as 8 + 16 segments, arcs exact as cubics, no fitting needed.

## Architecture

New and changed, beside what exists; the duotone and filled paths are not touched.

| File | Change |
| --- | --- |
| `presets.mjs` | `BULK_PRESETS[24]`: `finish: "bulk"`, `stroke: 2`, `pad: 2`, `knockout: 1.5`, `gap: 1.5`, `share: [0.25, 0.6]`, squircle radii `[5, 3]` at 12, keylines above. `preset(G, finish)` takes the finish; `finishOf(root)` reads it from the root's `fill`/`stroke`. `GRIDS` keeps 24 as duotone unless the finish says bulk. |
| `bulk.mjs` (new) | The pair of `filled.mjs`. Classifies each element as body, accent or line; refuses a contour (a closed element with both fill and stroke), a `stroke` on the root, a `fill-opacity` other than 0.4, a `rect` with `rx`, a width other than 2; requires one body and one accent; measures share; finds every accent/body crossing and requires a `data-cut="knockout"` body with a paper band of the preset's width around that accent (measured as air is, at pixel level, between the accent's ink and the body's). |
| `knockout.mjs` (new) | `node knockout.mjs <icon.svg> [--print]`. Reads the body and the accents. Builds each accent's halo: its outline offset by `knockout`: a stadium per straight segment, a circle at each vertex; a curve flattened at 0.25 then the same, the result refit with `simplify` at 0.05. Subtracts the halos from the body with paper.js and writes the body back with `data-cut="knockout"` and the uncut geometry in `data-body`, so a second run starts from the original and is idempotent. A body with no crossing is left as it was. Refuses when the cut would leave a piece under 1 across (the crumb rule modifiers already keep). |
| `shapes.mjs` | `squircle --w --h --at [--r]` prints a continuous-curvature rounded rect as cubics on the quarter grid. `--finish bulk` on every primitive prints the body alone, filled, no contour, no shade; `--accent` prints it full instead of at 0.4. |
| `check.mjs` | Reads the finish from the root; calls `bulkChecks` when it is bulk; `data-cut` numbers are exempt from grid, as a modifier's cuts are. |
| `modifiers.mjs` | At bulk, a badge or a dot is a full accent; `addModifier` places it, then calls `knockout.mjs`'s cut on the bodies it crosses instead of cutting strokes. Other kinds refuse at this finish with a one-line message. |
| `sheet.mjs`, `proof.mjs` | The reference row for a bulk set is `examples/bulk`. The proof colours the knockout band so a drawer sees the cut. The dark row renders on dark with `currentColor` light, as duotone does. |
| `emit.mjs` | `fill-opacity` → `fillOpacity` in React; `data-cut` and `data-body` are stripped on emit, as `data-modifier` is today. |
| `raster.mjs` | The cache installs `paper@0.12.18` beside resvg; `paper()` returns it, loaded once. |
| `rules-bulk.md` (new) | The finish's rules, in `rules-filled.md`'s form: only where a rule reads differently at bulk. |
| `SKILL.md` | Step 1 offers three finishes and recommends bulk for a sidebar, nav or tabs when the app wants presence, duotone when the app is thin, filled for grids and empty states. Step 3's loop gains `knockout.mjs` after repair and before check. The What-goes-wrong table gains the bulk rows. |

## The rules at bulk

`rules-bulk.md` says, rule by rule, where bulk differs. The rest is `rules.md`.

- **01 grid.** As today. A `data-cut` body's numbers are exempt, as a modifier's cuts are.
- **02 keyline.** The 24 keylines above, ±0.5.
- **03 stroke.** The root: `viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"`, no `stroke`. A line declares `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. A body declares `fill-opacity=".4"`. No other paint attribute anywhere.
- **04 construction.** A body is a closed shape at 0.4; an accent is a closed shape or a line, full. Every icon has at least one body and at least one accent. A closed element with a fill and a stroke is a contour and is refused. The accent is rule 09's gesture; it is sized to read at 16 px: a filled accent no side under 2, a line accent no shorter than 3. Curves keep the join rules (smooth under 4°, a corner over 30°, no kink, no bend tighter than one stroke).
- **05 weight.** ±15% of the set's median, ±20% of the reference, the median of `examples/bulk`.
- **06 gravity.** ±0.5, as today.
- **07 radius.** A squircle from `shapes.mjs`, 5 or 3 by the smaller side at 12, or a pill. A `rect` with `rx`, or any `rect`, is refused: `radius  edit  rect@2 → shapes.mjs squircle`.
- **08 gap, and the knockout.** Accent to body: crossing with a knockout of 1.5, touching, or 1.5 apart, edge to edge. Accent to accent: touching or 1.5 apart. A crossing without a cut: `knockout  edit  path@3 crosses path@2 without a cut → node knockout.mjs pretty-icons/edit.svg`. A cut narrower or wider than the preset's: `knockout  edit  paper 1.1 wide at 12, 14 → 1.5: re-run knockout.mjs`.
- **09 metaphor.** As today: one object, at most three elements, eight drawing commands across the accents. The accent is the gesture; a body takes no second accent.
- **10 set.** As today.
- **11 share.** The accent's ink over the whole ink, in the preset's band: `share  empty  accent 0.12 of the ink → 0.25 to 0.6`.
- **12 air, loose, diagonal.** Air at 1.5 strokes of paper and a counter of 2 strokes, as today, with the stroke at 2. Loose is the knockout: an accent inside a body stops 1.5 from the body's edge, edge to edge, which the cut provides. Diagonal as today.

## The example

`examples/bulk`: all, coding, connectivity, data, devices, empty, interfaces, machines, marks, security, drawn at bulk. The names match `examples/hairline` so the finishes compare name for name. The reference weight and the share band are its medians. It is drawn with the motor, in rounds, until `check.mjs` prints `ok` and the blind, craft, set and studio reads pass, and its rounds are recorded in the reference.

## The trial

Two fresh agents (opus), no access to this conversation, the skill as the plan leaves it, each in an empty scratch folder with no app, run at the same time: a notes app's sidebar (inbox, calendar, chat, profile, search, upload; 14px text, so bulk is the recommendation to take) and a kitchen shop's categories (kettle, whisk, rolling-pin, pot, cup, toaster). Each agent opens its own readers; a fresh reader opened by the controller reads each final blind sheet. A trial passes when the drawer reported `ok` on check run 1 or 2 and the controller's blind read is 6 of 6, none by elimination. The prompt is the polish trial's, with "bulk" where the finish is named.

## Testing

Tests live in `test/pretty-icons/<module>.test.mjs`, run with `node --test 'test/**/*.test.mjs'` from the repo root, as the polish pass left them. New modules get a file each; changed modules get cases in theirs.

- `presets.test`: `finishOf` reads bulk from a root with `fill="currentColor"` and no `stroke`, duotone from `stroke="currentColor" fill="none"`; `--finish` overrides; 24 without a hint is duotone.
- `bulk.test`: each refusal above on a one-line fixture; share on a known pair of areas; a crossing without a cut; a cut of the wrong width.
- `knockout.test`: a squircle less a rotated rect gives a band of 1.5 everywhere along the accent (measured with `air` at pixel level); a body with no crossing is unchanged byte for byte; running twice gives the same file; a cut leaving a crumb refuses; a curved accent's halo is within 0.05 of the exact offset at 65 samples.
- `shapes.test`: `squircle` is on the quarter grid, every join smooth, its ink box within 0.5 of `--w --h`; `--finish bulk` prints one element.
- `modifiers.test`: a badge at bulk is a full accent with a cut; `slash` at bulk refuses.
- `check.test`: `examples/bulk` prints `ok`; `examples/hairline` and `examples/garage` still print `ok`, so the duotone and filled paths are untouched.
- `emit.test`: a bulk icon to React carries `fillOpacity` and no `data-` attribute.

## Publishing

On `pretty-icons-polish`, in small commits: motor first (presets, bulk, knockout, shapes), then the rules, then the example in rounds, then the trial and the reference, then `SKILL.md`. `CONTEXT.md` gains a line for the bulk finish. No merge, no push, no PR in this pass; the branch stays as it is, as the person asked.

## Out of scope

- Any change to the duotone 16/20/24 rules or to the filled 48 rules.
- `slash`, `lock`, `arrow:*` at bulk; a shadow at bulk.
- Bulk on 16 or 20; the finish is 24 scaled by CSS.
- Matching the bar's metaphors; only its construction.
