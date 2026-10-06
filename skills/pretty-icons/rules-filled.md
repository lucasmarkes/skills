# The ten rules at the filled finish

The grid names the finish: 16, 20 and 24 are duotone (`rules.md`), 48 is filled. The ten rules keep their names and numbers; this file says where each reads differently at 48, and the rest is `rules.md`'s text. An icon at 48 is shown at 32, 48 or 64 by CSS, in a feature grid, a category list or an empty state, never in a sidebar. `examples/pantry`, eight icons for one kitchen app, is the finish; its metaphors are not the bar (rule 09).

What the finish is: an ink contour over a flat colour, a copy of the silhouette one shade darker set down and right under it, the object's own details drawn in that shade, and one short white highlight on the top-left of a round body. Everything is told apart by paint alone:

| Element | What it is | Paint |
| --- | --- | --- |
| shadow | the first element: a body's geometry copied exactly, moved by `transform="translate(3 3)"` | `fill` the body's shade, `stroke="none"` |
| body | the silhouette, or a part of it with its own colour: a closed element | `fill` a palette fill; no `stroke` (the root's ink draws the contour) |
| detail | what is on the object: seeds, stripes, holes, a label line | `stroke` a shade or paper, no `fill`; or a dot: `fill` a shade and `stroke="none"` |
| part | what is of the object but not on it: a stem, a handle, a spout | no `fill`, no `stroke` (ink) |

## The preset

| Grid | Stroke | Padding | Live | Step | Circle | Square | Portrait | Landscape | Radius ≥ 16 / < 16 | Gap ink · detail | Shadow |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | 2.5 | 2 | 44 | 0.25 | 41 | 37 | 33 × 41 | 41 × 33 | 3 / 1.5 | 2.5 · 1.25 | 3, 3 |

Keylines are sizes of the object's ink without its shadow. The object and its shadow together fill the live area: the keyline is the live area less the shadow's offset, and it is centred at **22.5, 22.5**, half the offset up and left of the canvas centre. The shadow hangs off it down and right to 46. Tolerances: keyline ±1, gravity ±3, weight ±25% of the median and of the reference.

## The palette

One ink, one paper, fourteen colours in pairs. A body takes a fill; its shadow and its details take the shade of that fill. Nothing in a file is a hex the table does not hold.

| Name | Fill | Shade |
| --- | --- | --- |
| ink | `#2e3955` | — |
| paper | `#ffffff` | — |
| red | `#d26352` | `#ad4a43` |
| orange | `#df8f51` | `#b56a3b` |
| yellow | `#f3d35e` | `#d4ad3c` |
| tan | `#d5ae73` | `#ad8b55` |
| brown | `#9b6d49` | `#6b4a30` |
| cocoa | `#714b33` | `#4b301e` |
| green | `#8aa968` | `#5f7d47` |
| leaf | `#c7dd9e` | `#93ad74` |
| blue | `#9db5db` | `#7288b0` |
| mist | `#f4f4f2` | `#bcc6d6` |
| cream | `#efe0b4` | `#d1b67a` |
| pink | `#e8b4ab` | `#c98a80` |
| plum | `#a63d5b` | `#7e2f47` |
| grey | `#c3c0b8` | `#9b9b9b` |

## The bodies

Each body's ink lands on its keyline, centred at 22.5. A rect's edge sits half a stroke inside the keyline; a circle's radius is half the keyline less half a stroke. An outline of your own (an egg, a pear, a fish) fits its ink to the keyline's size, as the egg below does at 33 × 41.

| Circle | Square | Portrait | Landscape |
| --- | --- | --- | --- |
| `cx 22.5 cy 22.5 r 19.25` | `x 5.25 y 5.25 w 34.5 h 34.5 rx 3` | `x 7.25 y 3.25 w 30.5 h 38.5 rx 3` | `x 3.25 y 7.25 w 38.5 h 30.5 rx 3` |

Every icon starts from this root. `examples/pantry/egg.svg`, an egg on the portrait keyline, is the whole construction in six elements: the shadow, the body, the highlight, three speckles in the shade:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#2e3955" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M22.5 3.25C13.5 3.25 7.25 16 7.25 27C7.25 36 14 41.75 22.5 41.75C31 41.75 37.75 36 37.75 27C37.75 16 31.5 3.25 22.5 3.25Z" fill="#d1b67a" stroke="none" transform="translate(3 3)" />
  <path d="M22.5 3.25C13.5 3.25 7.25 16 7.25 27C7.25 36 14 41.75 22.5 41.75C31 41.75 37.75 36 37.75 27C37.75 16 31.5 3.25 22.5 3.25Z" fill="#efe0b4" />
  <path d="M12.75 30C13 22 15.5 15 19.5 10" stroke="#ffffff" />
  <circle cx="27" cy="33" r="1.5" stroke="#d1b67a" />
  <circle cx="31" cy="24" r="1.5" stroke="#d1b67a" />
  <circle cx="25.5" cy="18.5" r="1.5" stroke="#d1b67a" />
</svg>
```

The egg's path runs from 7.25 to 37.75 across and 3.25 to 41.75 down: with the stroke, 33 × 41. The shadow is the same `d`, pasted, with the cream's shade and the offset. The speckles are rings of r 1.5 in the shade: at this stroke a ring that small is a dot, and a ring is a line, so it counts for weight (rule 05). A speckle as a shade-filled dot with `stroke="none"` is allowed too, and weighs nothing.

## 01 · grid

`viewBox="0 0 48 48"`, every number a multiple of 0.25, every pixel inside 2–46, the shadow included: an object that reaches 44 pushes its shadow to 47 and fails `live`. The file is flat: `rect`, `circle`, `line` and `path`, self-closing, in the root. `transform` is allowed on one element, the shadow, and only as `translate(3 3)`.

- **Rejected when:** `grid  pear  path@3 d[4] 4.125 → a multiple of 0.25`; `live  tomato  ink 2,3–47,46 → inside 2–46`; `construction  tomato  path@4 transform → only on the shadow, the first element`.

## 02 · keyline

The object's ink box, without its shadow, is within 1 of circle 41, square 37, portrait 33 × 41 or landscape 41 × 33. Its centre is 22.5: a circle body runs from 2 to 43, a landscape body from 2 to 43 across and 6 to 39 down. The shadow then runs to 46.

- **Keep it:** choose the format in the concept, start from the bodies table or fit an outline to the size. A part that sticks out of the silhouette (a stem, a spout, a handle) is ink and counts: the pear's stem reaches 3.5 so the body stops at 41.75, 33 × 41 together. A detail never pushes the box out.
- **Keep it, for an object that is wider than tall by a little:** a cupcake 39 × 38 fits nothing. Widen the frosting to the circle, or narrow the cup to the square.
- **Rejected when:** `keyline  cupcake  39.06 × 38.31 → square 37 × 37 ±1`.

## 03 · stroke, and the palette

The root is `stroke="#2e3955" stroke-width="2.5"`, round caps and joins, `fill="none"`. No element sets a width, a cap, a join, an opacity or a dash. An element sets `fill` and `stroke` only to say what it is (the table above), and only from the palette.

- **Rejected when:** `stroke  apple  stroke currentColor → #2e3955, the ink`; `stroke  apple  path@3 stroke-width 2 → the root's`; `palette  apple  path@3 fill #c0392b → a palette fill, or none`; `palette  apple  path@5 stroke #333 → a palette shade, paper or ink`.

## 04 · construction

One shadow, first in the file; at least one body; details in the shade or in paper; parts in ink. The shadow is a body's geometry pasted, not redrawn and not a `<use>`: `check.mjs` compares it with every body's. A body with two colours (a jar and its lid, a pear and its leaf) is two bodies; one of them casts the shadow, the larger. A body's contour is a rect, a circle, a path of at most five straight sides, or a path shaped by curves (`rules.md` 04).

- **Keep it, for the highlight:** one open path in paper, two to four units long, on the top-left of a round body, curving with the contour, a stroke and a half inside it (rule 08). A flat body (a jar, a grater) can carry one too, on its left side. At most one per icon: a second shine is a second accent (rule 09).
- **Keep it, for a hole, a seed or a speckle:** a shade-filled `circle` with `stroke="none"`, r 1.5 to 2, or a short shade stroke (`M18 17.5H21`). A hole in ink reads as a mark on top of the object, not in it.
- **Keep it, for a part:** a stem, a handle, a spout or a sprout is an open path in ink, touching the body (rule 08). It casts no shadow.
- **Rejected when:** `construction  apple  no shadow → the first element: a body's geometry, transform="translate(3 3)", its shade, stroke none`; `construction  apple  path@2 shadow → a body's geometry, copied exactly`; `construction  apple  path@2 fill #c0392b → #ad4a43, the shade of path@3's fill`; `construction  apple  path@2 stroke missing → stroke none on the shadow`; `construction  mug  rect@4 fill #ffffff → paper only as a stroke, the highlight`; `construction  mug  2 highlights → one stroke in paper`; `construction  mug  path@3 stroke none → a contour on every body`.

## 05 · weight

Ink is the line alone: every fill dropped, the shadow dropped, every stroke read as ink. A solid tomato and a hollow whisk weigh by their contours and their lines, not their area. Within 25% of the set's median and of the reference, 459.6, the median of `examples/pantry`. A unit of line weighs about 2.5; a ring of r 1.5 about 24; a shade-filled dot nothing.

- **Keep it, for a light icon:** a single contour with a highlight (the egg, 324) is under the bar. Give it the details the object has: speckles as rings, a band in the shade, a longer highlight.
- **Keep it, for a heavy icon:** a label line, a third gill, a fourth rib: drop one.
- **Rejected when:** `weight  egg  ink 324.17 (-28.2%) → within ±25% of the set's median 459.57`.

## 06 · gravity

The object's mass, without its shadow, is within 3 of 22.5 on each axis. A pear, a grater or a cupcake sits low by nature; 3 lets it. Past 3, lift the body a quarter at a time, or lighten what sits low.

- **Rejected when:** `gravity  grater  mass +0, +3.56 → within ±3`.

## 07 · radius

A rect whose smaller side is 16 or more takes `rx="3"`; below, `rx="1.5"`. A jar's lid 22.5 × 8 takes 1.5.

## 08 · gap

Ink to ink: touch, or one stroke apart, 2.5. Any pair that includes a detail: touch, or half a stroke apart, 1.25, so stripes, holes and a highlight fit inside a body. The shadow is left out; it overlaps everything by design. The subpaths of one path are held to the rule: holes merged into one path are as close as separate ones.

- **Keep it, for the highlight:** a stroke and a half inside the contour: the egg's contour at x 7.25 to 9, its highlight at 12.75, outer edges 1.25 apart.
- **Keep it, for a row of holes:** dashes 2.5 long, 6.5 apart centre to centre, as the grater's.
- **Keep it, for a part:** it ends on the body's centreline, or crosses it: the pear's stem `M22.5 10V3.5` starts on the body's top.
- **Rejected when:** `gap  honey  path@3 to path@6 1.13 apart → ≥ 1.25 apart, or crossing`; `gap  fish  path@3 to circle@5 1.88 apart → ≥ 2.5 apart, or crossing` (an ink eye near an ink contour: make it a shade dot, or move it).

## 09 · metaphor

One object, nameable in one or two words, from at most eight elements: the shadow, one or two bodies, the parts, two or three details, one highlight. A path takes at most twelve commands. No letters, digits, logos or initials. Draw with curves and one asymmetry (a leaf to one side, a spout on the left and a handle on the right): a symmetric rect with a shadow reads as a button.

- **Keep it, for the details:** draw the two or three the object has, in the shade: an onion's bands, a fish's gills, a grater's holes, a jar's label. Not a realistic surface. Not a face.
- **Keep it, for an object that is wires, a frame or a cage** (a whisk, a basket, a rack): the wires are ink parts, open paths, and the one solid piece (the handle) is the body that casts the shadow. A whisk drawn as a solid balloon with the wires on it in the shade read as garlic.
- **Keep it, for the examples:** do not copy `examples/pantry`'s metaphors; draw your own objects at its finish.
- **Rejected when:** `count  grater  9 elements → at most 8`; `count  teapot  path@3 13 commands → at most 12`; or read (`read.md`).

## 10 · set

One grid, one palette, measured together. A colour may repeat across icons; a fill the palette does not hold may not appear once.

## How check.mjs measures

Keyline, gravity and live are read from a render without the shadow for the first two and with it for the third; weight from a render with every fill removed, the shadow dropped and every stroke in ink; gap from the centrelines of every element but the shadow. `--print` shows the object's box and its line ink.
