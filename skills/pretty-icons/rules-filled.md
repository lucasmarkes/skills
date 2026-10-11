# The ten rules at the filled finish

The grid names the finish: 16, 20 and 24 are duotone (`rules.md`), 48 is filled. The ten rules keep their names and numbers, and an eleventh, 11 · contrast, is the finish's own; this file says where each reads differently at 48, and the rest is `rules.md`'s text. An icon at 48 is shown at 16 to 64 px by CSS, wherever the person chose the filled finish. It is sharpest from 32 up, where the line is a whole pixel; below 32 it softens on a 1× screen. `examples/garage`, ten icons for one car app, is the finish; its metaphors are not the bar (rule 09).

What the finish is: a thin line over a light body, in five neutral tones and no colour. The light comes from the top: the side of the body away from it is shaded inside the body, under the line. No offset shadow, no highlight. The one exception is the paper sheen on glass (`rules.md` 09): a small paper fill, never a stroke. The line tone is the line: it fills only a dot of r 2.5 or less (a hub, a rivet); everything larger is a body, or paper (glass, a lamp that is on, a hole). Everything is told apart by paint and by order:

| Element | What it is | Paint |
| --- | --- | --- |
| tone | a body's colour: a closed element | `fill` the fill tone (or paper), `stroke="none"` |
| shade | the side away from the light: the lower or right part of the body | `fill` the shade tone, `stroke="none"`, after its tone and before its contour |
| contour | the tone's geometry pasted, nothing else on it | no `fill`, no `stroke`, `stroke-width="2"` |
| shape | a closed element filled and drawn in one: glass, a hole, a base | `fill` paper or the shade tone, never the line; no `stroke` |
| line | a part (a hose, a needle, a sign) | no `fill`, no `stroke`, no `stroke-width`: the root's line |
| mark | a secondary mark printed on the object: a minor tick, a seam (a tick or tread that names the object, a gauge's scale or a tyre's tread, takes the line tone) | `stroke` the mark tone |
| dot | a circle of r 2.5 or less: a hub, a rivet | `fill` a tone, `stroke="none"`; the one place the line tone fills |

## The preset

| Grid | Stroke | Contour | Weights | Padding | Live | Step | Circle | Square | Portrait | Landscape | Gap line · mark |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | 1.5 | 2 | 2 | 4 | 40 | 0.25 | 40 | 36 | 32 × 40 | 40 × 32 | 1.5 · 0.75 |

## The hierarchy

Two weights, one job each. The eye reads the object's outline first, then its parts.

| Weight | Draws | How |
| --- | --- | --- |
| 2 | a body's contour | `stroke-width="2"` on the contour, never on the tone |
| 1.5 | the parts: a hose, a needle, a bracket, a mark | the root's line |

A closed element at 2 with no tone under it is a contour that lost its body: `check.mjs` rejects it. An open stroke at 2 is refused: a part is drawn at the root's line.

Keylines are sizes of the object's ink, centred at **24, 24**. Tolerances: keyline ±1, gravity ±3, weight ±25% of the set's median and of the reference.

## The tones

Five tones, nothing else. A file holds the light ones; a dark page swaps each for its twin (`toDark` in `presets.mjs`; the sheet's dark row does it).

| Name | Light | Dark | Takes |
| --- | --- | --- | --- |
| line | `#25262a` | `#f1f1ee` | every contour, parts, dots |
| fill | `#ececea` | `#3d3e43` | the body |
| shade | `#cfcfcb` | `#2c2d31` | the side away from the light, a base |
| paper | `#ffffff` | `#5a5b61` | glass, a lamp that is on, a hole |
| mark | `#8b8c90` | `#9d9ea3` | minor ticks and seams, as a stroke only; a scale or a tread that names the object takes the line |

## The radii

A rect's radius says what the object is, then how big: read its smaller side.

| Character | Objects | ≥ 16 | 8 to 16 | < 8 |
| --- | --- | --- | --- | --- |
| cut | a sheet, a board, a card, a screen: real edges | 2 | 1.5 | 1 |
| cased | a box, a can, a battery, a pump | 6 | 2.5 | 1.5 |
| moulded | a hood, a cap, a knob, a lamp's housing: cast, held in the hand | 8 | 4 | 2.5 |
| pill | a base, a handle, a slot | half the smaller side | | |

A path's corners take the same radius as arcs: the oil can's body `rx 6` and its shade's `A6 6`. When in doubt, cased.

## The bodies

Each body's ink lands on its keyline, centred at 24. A rect's edge sits half a contour (1) inside the keyline; a circle's radius is half the keyline less half a contour. An outline of your own (a car, a wrench) fits its ink to the keyline's size.

| Circle | Square | Portrait | Landscape |
| --- | --- | --- | --- |
| `cx 24 cy 24 r 19` | `x 7 y 7 w 34 h 34 rx 6` | `x 9 y 5 w 30 h 38 rx 6` | `x 5 y 9 w 38 h 30 rx 6` |

Every icon starts from this root. `examples/garage/traffic-light.svg`, a moulded housing on the portrait keyline, is the whole construction in seven elements: the side panels, the tone, the shade, the contour and three lenses:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M13.75 14C11 15.5 8.75 17 8.75 20V28C8.75 31 11 32.5 13.75 34ZM34.25 14C37 15.5 39.25 17 39.25 20V28C39.25 31 37 32.5 34.25 34Z" fill="#cfcfcb" />
  <rect x="13.75" y="5" width="20.5" height="38" rx="8" fill="#ececea" stroke="none" />
  <path d="M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z" fill="#cfcfcb" stroke="none" />
  <rect x="13.75" y="5" width="20.5" height="38" rx="8" stroke-width="2" />
  <circle cx="24" cy="13" r="3.5" fill="#ffffff" />
  <circle cx="24" cy="24" r="3.5" fill="#cfcfcb" />
  <circle cx="24" cy="35" r="3.5" fill="#cfcfcb" />
</svg>
```

The housing is 20.5 wide, moulded: `rx 8`. The tone is the rect with `stroke="none"`; the shade is the right third of it, its corners the same arcs, so the contour pasted after it covers the seam; the contour is the tone's rect again, at 2. The side panels come first, one shape in the shade tone: each ends on the housing's straight side, between its corner arcs, so the contour covers its seam. A bracket of one line goes thin at 16 to 24 px; a panel 5 wide holds. The three lenses are drawn by the root's line. The lamp that is on is the lens in paper (glass and lit lamps are paper); the two that are off are the lens in the shade tone. A lens filled in the line tone is a solid and is refused (`solid`), and a dot of the line tone inside a lens leaves a ring of paper under 2 strokes across, which `air` refuses.

## 01 · grid

`viewBox="0 0 48 48"`, every number a multiple of 0.25, every pixel inside 4–44. The file is flat: `rect`, `circle`, `line` and `path`, self-closing, in the root. No `transform`, no `<use>`, no `<defs>`.

- **Rejected when:** `grid  tyre  path@3 d[1] 10.4 → a multiple of 0.25`; `construction  traffic-light  rect@3 transform → no offset shadow: the shade sits inside the body`.

## 02 · keyline

The object's ink box is within 1 of circle 40, square 36, portrait 32 × 40 or landscape 40 × 32. Ink runs to each stroke's outer edge: 1 past a contour's geometry, 0.75 past a line's. A part that sticks out of the body (a bracket, a hose, a terminal) is ink and counts.

- **Keep it:** write the box before you draw: portrait x 8 to 40, y 4 to 44; landscape x 4 to 44, y 8 to 40; square 6 to 42; circle 4 to 44. Name the element that reaches each of its four sides, and put that element's outermost geometry inside the side by its half stroke: a contour at x 9 and 39 on the portrait keyline. A curve reaches a side only at an anchor whose handles run along that side, so put an anchor there. `shapes.mjs --w --h` take the ink's size, before `--rot`; `blob --anchors` takes the geometry, so its outermost anchors sit 1 inside the box, as the croissant's at x 5 and 43.
- **Keep it, for an object with its own proportions:** draw it to the keyline, not true. A watering can 40 wide stands 31 to 33 tall, from the top of its handle to its base; a glove 40 tall is 31 to 33 wide. The row compares sizes (`rules.md` 02).
- **Keep it, after a run:** `check.mjs --print` gives the ink box as x0, y0, w and h. Move the element on the short side by what is missing.
- **Rejected when:** `keyline  steering-wheel  38 × 38 → circle 40 × 40 ±1`; `keyline  watering-can  39.5 × 29.28 → landscape 40 × 32 ±1`, a can drawn true, 29 tall.

## 03 · stroke, and the tones

The root is `stroke="#25262a" stroke-width="1.5"`, round caps and joins, `fill="none"`. An element sets `stroke-width` only to 2, and only on a contour; never a cap, a join, an opacity or a dash. Every other line and every filled element keeps the root's width. A modifier (`modifiers.mjs`) keeps its own weights and is measured apart: 03, the dot limit and 11 do not read it. The fill and the shade tones are never a stroke. Every `fill` and `stroke` is one of the five tones.

- **Rejected when:** `stroke  traffic-light  stroke #2e3955 → #25262a, the line tone`; `stroke  traffic-light  stroke-width 2.5 → 1.5`; `stroke  traffic-light  path@9 stroke-width 3.5 → not set: the root's 1.5, or 2 on a contour`; `palette  traffic-light  rect@3 fill #e8b4ab → one of the five tones: #25262a #ececea #cfcfcb #ffffff #8b8c90`.

## 04 · construction

Tone, shade, contour, in that order, for every body (a small part may leave its shade out: the light, below); at least one body in the fill tone. The contour is the tone's geometry pasted, not redrawn: `check.mjs` matches them. A shade is the lower or right part of its body, its edges on the body's outline, so the contour covers its seam. A body's contour is a rect, a circle, or a path of at most five straight sides; curves between them are free, so round a notched outline's corners with arcs rather than adding sides (`rules.md` 04).

- **Keep it, for an organic body** (bread, a fruit, a leaf, a drop): take it from the kit. `node <skill-dir>/shapes.mjs <primitive> --w 40 --h 32` prints the three elements, tone, shade and contour, the contour at 2. The shade is the outline's own stretch from one anchor to another, closed by a seam (`--shade right|lower|none`, `--seam straight|curved`), so the contour covers it. Then add the one gesture (`rules.md` 09) by hand. The croissant, on the landscape keyline, is `node <skill-dir>/shapes.mjs blob --anchors "12,39,c 5,25.5 24,8.5 43,25.5 36,39,c 24,30"` pasted, and two seams for its folds:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 39C11.5 33 5 31.5 5 25.5C5 15.5 14 8.5 24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39C33 34 29.75 30 24 30C18.25 30 15 34 12 39Z" fill="#ececea" stroke="none" />
  <path d="M24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39Z" fill="#cfcfcb" stroke="none" />
  <path d="M12 39C11.5 33 5 31.5 5 25.5C5 15.5 14 8.5 24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39C33 34 29.75 30 24 30C18.25 30 15 34 12 39Z" stroke-width="2" />
  <path d="M17 15.25C19 19.75 19.25 23.25 18.5 26.75M31 15.25C29 19.75 28.75 23.25 29.5 26.75" />
</svg>
```

Its horns are the two cusps (`c`), and they turn in: a crescent whose horns point straight down reads as a bell. The seams stop clear of the contour, 4 from its centreline, so they do not touch it by almost (08). Its ink is 40 × 32.5, its mass 1.5 high, its line ink 274.9.
- **Keep it, for the light:** `check.mjs` compares the centre of the shade's box with the centre of its tone's box. The shade passes when its centre is lower, or further right. A shade run from end to end of a slanted body (a leaf or a lens at 30° to 60°) has the tone's own box, centre on centre, and fails on either side. Never shade a body with a copy of its whole tone. The kit's shade passes the light check at every `--rot`; when it cannot, it says so. At a slant it shades one segment, from the lower belly to a tip (the tip on the right with `--shade right`), closed by its chord, even with `--seam curved`. For a body you drew yourself, or with `--from`, do the same by hand: copy that segment from the contour and close it with `Z`. For `leaf --w 16 --h 8 --at 16,12 --rot -45` that is `M21 7C19.25 9 20.5 11.75 18.5 13.75Z`, the kit's own shade. A small part beside a larger body (a leaf on a stem, a grain on an ear) may take `--shade none`; the larger body carries the light.
- **Keep it, for a ring** (a rim, a tyre, a hoop): a body with a hole. `node <skill-dir>/shapes.mjs ring --r 19 --hole 10` prints five elements: the tone, the shade (the ring's lower half), the contour, the hole in paper and its contour, both contours at 2. Refused when the hole leaves less than a contour and its gap: `--hole` at most `--r` less 3.
- **Keep it, for a small dark part:** a hub, a rivet: a dot, a circle of r 2.5 or less in the line tone, `stroke="none"`. A wheel, a lens, a band or a cap larger than that is a body (tone, shade, contour), or paper. Glass and a hole: paper.
- **Keep it, for what is printed:** a tick or tread that names the object (a gauge's scale, a tyre's tread) is a line, in the line tone at the root's width; the mark tone stays for secondary marks, a minor tick or a seam, at the root's width.
- **Rejected when:** `light  seedling  path@5 shade centred at 16.25, 12.5 → below or right of path@4's centre 16.25, 12.5: the light comes from the top`; `construction  traffic-light  rect@3 fill #ececea stroke none → its contour after it: the same geometry, no fill, at 2`; `construction  traffic-light  path@5 shade → between a body's tone and its contour, so the line covers its edge`; `construction  traffic-light  path@9 stroke #ffffff → no highlight: paper only as a fill (glass, a lamp that is on)`; `construction  traffic-light  circle@8 fill #8b8c90 → the mark tone only as a stroke`; `construction  traffic-light  path@9 stroke #ececea → the fill tone only as a fill`; `solid  traffic-light  circle@9 r 3 filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5`; `stroke  traffic-light  rect@5 contour at 1.5 → 2`; `construction  traffic-light  circle@9 contour without a tone → a tone before it with the same geometry, or the root's line`; `construction  traffic-light  no body → a closed element in the fill tone, #ececea`.

## 05 · weight

Ink is the line alone: tones, shades and dots dropped, every other stroke read in the line tone. It is the lines' area, so it goes by length: a contour weighs 2 for each unit, a line 1.5, a shape its outline at 1.5. Where lines cross, they count once. A tyre is a `ring` (`shapes.mjs`), its tone and its contour; paint adds nothing. Within 25% of the set's median and of the reference, 337.5, the median of `examples/garage`.

A body at its keyline weighs about 240 to 250: the circle 239, a rect with `rx 6` 251. The details carry the other 90 or so: a line 60 long. A thin object (a bone, a brush, a key) has less outline than a body at its keyline, and comes in light. A bulky one with a second body (a cage, a jar, a bowl of food) comes in heavy.

- **Keep it, after a run:** the percentage is the move. Read it against the number the line names, not against the icon: `-30%` of 340 leaves the icon about 100 short, so add about 100, a third of the reference, which is about 43% of the icon's own ink; `+30%` is about 100 over, so take about 100 away. A minus adds line, a plus takes it away. Aim at the reference, not the edge: the set's median moves as the others change.
- **Keep it, for a light icon:** give it what the object has: a hole, a slot, a tick. The wrench gained a hole and passed.
- **Keep it, for a thin object:** fill its keyline first, its ends out to the box's sides or corners. Then draw a handle or a shaft as a body, two contours, not one line: a pill 20 × 4 weighs 89, its line 32. Give it larger ends (a bone's knobs, a brush's head), or a band across it, as a second body: a ferrule.
- **Keep it, for a heavy icon:** a double ring, a third spoke, a fourth tread: drop one, or shrink the hole. For a bulky object: a smaller second body or detail. `examples/garage/tyre.svg` weighs 391 with its two rows of treads, and 357 with one row dropped; `gearshift.svg` weighs 357 with its gate at the root's line, and 340.6 with its middle stroke dropped.
- **Rejected when:** `weight  wrench  ink 246.01 (-27.7%) → within ±25% of the set's median 340.37` and `weight  wrench  ink 246.01 (-27.7%) → within ±25% of the reference 340.4`, `examples/garage` with the wrench's hole taken out and its jaw's notch filled in (a straight edge from 32.5 20.5 to 35.25 7.75); `weight  brush  ink 229.19 (-33.1%) → within ±25% of the set's median 342.51`, a brush at 255 the run before, moved the wrong way.

## 06 · gravity

The object's mass is within 3 of 24 on each axis. The mass is the centre of every painted pixel, tone and shade as much as line: the centre of the silhouette's area. Weight (05) reads the lines alone; gravity does not. So a wide part (a brim, a rake's head, a can's body) holds the mass, and a handle, a stem or a spout weighs little however long: a line 20 long, 1.5 wide, is 30 of area; a head 30 × 4 is 120. `check.mjs --print` gives the offset as dx and dy: `mass +0, +3.05` is 3.05 low, a plus low or right. A gearshift sits low by nature; 3 lets it. A bowl and a cage, wide at the foot and round at the top, sit low too, often just past 3.

- **Keep it, on the keyline's short side:** a landscape box is 32 tall in a live area 40 tall, and a portrait box 32 wide in 40: it can slide 4 that way. Slide the whole drawing against the offset, a quarter at a time: a bowl on the landscape keyline slides up.
- **Keep it, on the long side:** the box fills the live area, 4 to 44, and cannot slide. Move area instead, before you draw: put the widest part across the middle, not at an end; give the light end area, a handle as a body rather than a line; shorten what sits at the heavy end. A long-handled tool (a rake, a broom, a spade) needs its handle given area and its head shortened. A cage on the portrait keyline needs a slimmer foot and a fuller dome.
- **Keep it, for a triangle** (a tent, a cone): it holds its mass in its base: bow its sides outward.
- **Rejected when:** `gravity  rake  mass +0, +5.46 → within ±3`: the head, the widest part, at the bottom end; `gravity  food-bowl  mass +0, +3.05 → within ±3`: a bowl centred, with room above it to slide up.

## 07 · radius

By character, by the smaller side: the radii table. A rect whose `rx` is none of its four (cut, cased, moulded, pill) is rejected.

- **Rejected when:** `radius  traffic-light  rect@3 rx 5 → rx 2, 6, 8 or 10.25: cut, cased, moulded or a pill`.

## 08 · gap

Line to line: touch, or one stroke apart, 1.5, outer edge to outer edge. A mark from anything: touch, or half a stroke apart, 0.75. `check.mjs` measures centrelines, and counts every stroke as 1.5, a contour's 2 too: two touch at 0.1 or less, and sit a stroke apart at 3 or more, 2.25 from a mark. Between is almost. Tones, shades and dots are paint and are left out.

- **Keep it, for a part that meets a body:** end it on the contour's centreline at an anchor or on a straight side, where the point is on the grid: the fuel pump's nozzle ends on the pump's straight side, at 30.75, 13. Or cross it: run the part on into the body and draw it before the body's tone, so the tone covers its end, as the gearshift's stem. Ending near a curve between anchors is a guess: a stem that stops 0.25 short of a leaf's edge is already almost.
- **Keep it, for two bodies that meet** (two leaves on a stem, a lid on a pot): give both contours the same anchor, or let one cross the other.
- **Rejected when:** `gap  wrench  path@4 to circle@5 0.07 apart → ≥ 1.5 apart, or crossing`; `gap  seedling  path@2 to path@6 overlapping, centrelines 0.5 apart → ≥ 1.5 apart, or crossing`: a part stopped near a leaf's edge, neither on it nor through it.

## 09 · metaphor

One object, nameable in one or two words, from at most eight elements. A path takes at most twelve commands. No letters, digits, logos or initials: a battery's signs are a plus and a minus, two strokes. Shade with the shape of the body, never as a stripe across it.

- **Keep it, for a row of things** (treads, ticks, lugs): one path, its subpaths; two paths if it passes twelve commands.
- **Keep it, for the examples:** do not copy `examples/garage`'s metaphors; draw your own objects at its finish.
- **Rejected when:** `count  tyre  path@4 15 commands → at most 12`; or read (`read.md`).

## 10 · set

One grid, five tones, measured together.

## 11 · contrast

The line tone is 20% to 45% of the icon's paint, `CONTRAST_BAND` in `presets.mjs`. The paint is every pixel of the icon as written at half alpha or more; a pixel is in the line tone when it is darker than the midpoint of the line and the mark tones. A modified icon is measured without its modifier. `check.mjs --print` gives the share as `line%`. A reference set of forty icons runs 17% to 48%, median near 30; `examples/garage` runs 27 to 44.

- **Keep it, for a dark icon:** a part filled in the line tone becomes a body (tone, shade, contour) or paper; a part that must stay dark shrinks to a dot. A small body crowded with line takes fewer lines or grows to its keyline.
- **Keep it, for a pale icon:** give it a line: the contour it lacks, a printed detail, a part.
- **Rejected when:** `contrast  wheel  line tone on 64.8% of the paint → 20% to 45%`, a ring of r 10 and a cross; `contrast  plate  line tone on 1.0% of the paint → 20% to 45%`, a tone with no contour and one short line.

## How check.mjs measures

Keyline and gravity are read from a render of the icon as drawn, every painted pixel at full weight; light from the boxes of a shade and its tone; weight from a render of its lines alone (`linesOf` in `filled.mjs`); contrast from a render of the base as written, its tones kept (`shares` in `raster.mjs`); gap from the centrelines of every element but the paint. `--print` shows the object's box, its line ink and its `line%`.
