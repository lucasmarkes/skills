# The twelve rules

These make a set of icons sit even in a row. `check.mjs` measures eleven. Rule 09's metaphor needs a reader (`read.md`). Each rule says what it requires, how to keep it, and what rejects it. A rejection is one line, `rule  icon  measured → expected`, and its first word names the rule. `examples/hairline` is the finish: one body, mostly empty tint, one short accent. Its metaphors are not the bar (rule 09).

## The presets

Pick the grid the app uses. Everything else follows from it.

| Grid | Stroke | Padding | Live | Circle | Square | Portrait | Landscape | Radius ≥ 8 / < 8 | Min gap, centrelines |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | 1 | 1 | 14 | 14 | 12.5 | 11 × 14 | 14 × 11 | 1.5 / 1 | 2.5 |
| 20 | 1.25 | 1 | 18 | 18 | 16 | 14 × 18 | 18 × 14 | 2 / 1 | 3.25 |
| 24 | 1.5 | 1 | 22 | 22 | 20 | 18 × 22 | 22 × 18 | 2 / 1 | 3.75 |

Keyline sizes are sizes of ink. Ink runs to the stroke's outer edge, half a stroke past the geometry. The fill is 0.2 on every grid.

## The bodies

Each body's ink lands on its keyline. A rect's edge sits an inset inside the keyline: half the stroke, rounded up to the quarter grid (0.5 on 16, 0.75 on 20 and 24). A circle's radius is half the keyline less the inset. On 20 the ink falls 0.25 short of the keyline, inside the 0.5 it may miss by. A box or a disc copies its body from the table. Any other outline (a shield, a chart) fits its ink to the keyline's size, as `examples/hairline/security.svg`'s shield does at 11 × 14.

| Grid | Circle | Square | Portrait | Landscape |
| --- | --- | --- | --- | --- |
| 16 | `cx 8 cy 8 r 6.5` | `x 2.25 y 2.25 w 11.5 h 11.5 rx 1.5` | `x 3 y 1.5 w 10 h 13 rx 1.5` | `x 1.5 y 3 w 13 h 10 rx 1.5` |
| 20 | `cx 10 cy 10 r 8.25` | `x 2.75 y 2.75 w 14.5 h 14.5 rx 2` | `x 3.75 y 1.75 w 12.5 h 16.5 rx 2` | `x 1.75 y 3.75 w 16.5 h 12.5 rx 2` |
| 24 | `cx 12 cy 12 r 10.25` | `x 2.75 y 2.75 w 18.5 h 18.5 rx 2` | `x 3.75 y 1.75 w 16.5 h 20.5 rx 2` | `x 1.75 y 3.75 w 20.5 h 16.5 rx 2` |

Every icon on 16 starts from this root. A box body from the table sits in it like this:

```svg
<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="1.5" y="3" width="13" height="10" rx="1.5" fill="currentColor" fill-opacity=".2" />
</svg>
```

A body that is soft, natural, rounded or held in the hand comes from the kit, not from a rect: `node <skill-dir>/shapes.mjs <primitive> --grid <grid> --w <w> --h <h> --at <x>,<y>`. Beside `drop`, `leaf`, `lens`, `bean`, `crescent`, `taper`, `wedge`, `scoop` and `blob`, the kit has five bodies for what is drawn most often by hand: `dome` (a loaf, a bun, a cloche: a flat base, a round top), `sack` (a bag gathered at a neck), `bubble` (a speech bubble with its tail), `bell` (narrow on top, flaring to a flat base: a bell, a lampshade) and `bust` (a person, head and shoulders). A rect or a circle stays for what truly is a box, a card, a screen or a disc.

## 01 · grid: one canvas, on quarters, inside the padding

Every icon is `viewBox="0 0 G G"` and drawn on a grid of 0.25. Its ink stays inside the padding, from 1 to G − 1. The file is flat: `rect`, `circle`, `line` and `path`, each self-closing, directly in the root.

- **Keep it:** start from the body or outline (rule 02) and move details in steps of 0.25. Every number counts, control points and relative offsets included. Choose positions on the grid. Do not compute them.
- **Keep it, for a link between nodes:** where a slanted link meets a circle is off the grid (7.06, 5.77). Run it along a row or column to the circle's centreline at `cx ± r`, or centre to centre.
- **Keep it, for a curve:** start from a curve on the grid and adjust it by quarters, as the shield in `examples/hairline/security.svg`: `M8 1.75 12.75 3.5v4.25c0 3-2.25 5-4.75 6.5-2.5-1.5-4.75-3.5-4.75-6.5V3.5Z`. Control points at 2.9 and 10.6 make the same shape, off the grid.
- **Keep it, for a dot:** a dot is a zero-length path, `M5 8h0`. The round cap draws it, one stroke across. Not a 0.01-long segment. When centring a row gives an eighth (4.625), move it 0.125 to a quarter. The row then sits 0.125 off centre, well inside rule 06's 0.5.
- **Rejected when:** `check.mjs` prints `canvas` (rule 10 shows one), `elements` (an `<ellipse>`, a `<g>`, a `<text>`), `grid` (`grid  connectivity  path@5 d[0] 7.06 → a multiple of 0.25`) or `live` (`live  machines  ink 0,2.75–16,13.25 → inside 1–15`).

## 02 · keyline: the ink lands on a keyline

Each icon takes the format that describes it: circle, square, portrait or landscape. Its ink box, stroke included, matches that keyline: its width and its height are each within 0.5 of the keyline's. A landscape body is as wide as the live area, so a short icon does not read smaller than a tall one beside it.

- **Keep it:** choose the format in the concept, before drawing (`files — page, portrait, body + two lines`). Start from that format's body, or fit an outline to its size (The bodies). A detail never pushes the ink past the body. A round cap reaches half a stroke past a line's end, so a detail that ends on the body's centreline stays inside it.
- **Keep it, for a narrow object:** draw a phone or a bookmark at the portrait keyline's full width, from the 10-wide body. At 9 wide it misses the 11. The row compares sizes, not real proportions.
- **Keep it, for an object between two formats:** a cylinder at 11.5 × 13 or a window at 13 × 11.5 fits none. Make it one: square, portrait or landscape.
- **Keep it, for an icon with no body around it** (two nodes and a link): place the outer elements so their outer edges land on the keyline.
- **Rejected when:** `check.mjs` prints `keyline`: the ink box is more than 0.5 off every keyline in width or height. The line names the nearest keyline, which may not be the one you meant. A `coding` window 12.5 × 10.5, meant as landscape, prints `keyline  coding  12.5 × 10.5 → square 12.5 × 12.5 ±0.5`.

## 03 · stroke: one stroke, set once

One width from the preset, round caps and joins, `currentColor`. The root sets them once. Nothing else in the file sets a colour, a width or an opacity, except a body's 0.2 fill and a modifier's 0.6.

The line is light: 6.25% of the grid, 1 on 16, 1.25 on 20, 1.5 on 24. Every detail is drawn at it too; there is no second, finer weight. A detail that cannot be seen at the line's weight is a detail to drop, not to thin.

- **Keep it:** copy the root above, with your grid's stroke. An element carries only its geometry. A body adds `fill="currentColor" fill-opacity=".2"`. A dashed outline adds `stroke-dasharray="a b"`, with a and b each at least the stroke. Leave out `style`, `class`, `id`, `transform`, `opacity`, `stroke-opacity` (a modifier's excepted, below), `filter`, `mask`, `clip-path`, `stroke-dashoffset`, `vector-effect` and `paint-order`.
- **Keep it, for a dash:** round caps eat the gap. The visible gap is the dasharray's gap less one stroke. `check.mjs` rejects only a dash or gap below one stroke; by eye, keep the visible gap at least one stroke, so the dasharray's gap is at least twice the stroke: 2 on 16, 2.5 on 20, 3 on 24. `2 3` on 16 shows gaps of 2. `examples/hairline` draws no dash.
- **Keep it, for a modifier:** its elements, and only they, carry `stroke-opacity="0.6"`: one colour, one more opacity, as the 0.2 fill is. `modifiers.mjs` writes it (rule 09); `--solid` leaves it out. At 48 a modifier has none.
- **Rejected when:** `check.mjs` prints `stroke`: `stroke  machines  stroke-width 1.5 → 1`, `stroke  machines  root stroke-dasharray 0.5 0.5 → dash and gap ≥ 1`, an opacity off a modifier `stroke  data  path#2@1 stroke-opacity → not set`. Or `modifier`, for a modifier's own: `modifier  data  path@4 stroke-opacity 0.5 → 0.6, or not set (--solid)`. A shadow is the filled finish's alone: `shadow  billing  a shadow at the duotone finish → none`.

## 04 · construction: a body is a contour and a fill

A body is a closed contour with the 20% fill under it. A detail is a line with no fill. Never a fill without a contour, never a solid shape. Every icon has at least one body.

A body's contour is a rect, a circle, a path of at most five straight sides (a triangle, a house), or a path shaped by curves. A filled path with more than five straight sides is faceted: a hexagon, stepped blocks, a cut stone. Faceted bodies read as geometry, not as the object. Five is as many as one outline needs, a house's walls and its roof. A gem is still a triangle pointing down, not a cut stone: a 5-sided gem passes the check, but it reads as geometry. Every L, H and V counts as a side, implicit repeats included, and so does a `Z` that closes with a segment of its own. The shield in `examples/hairline/security.svg` has four straight sides and two curves, and passes. An unfilled path is a detail and is not counted.

Curves flow or corner, never kink. Where two segments meet, the tangent arriving and the tangent leaving are under 4° apart (smooth) or over 30° (a corner on purpose); between them is a kink, a curve that bends where it should flow. A cubic bends one way, or changes side once; twice is a wobble, and a segment whose chord is under 4 bends one way only. A hand-written cubic kinks because its two handles are not on one line through the anchor. A smooth curve bent tighter than one stroke's radius reads as a kink at display size, and `check.mjs` names the tightest point.

- **Keep it:** draw the object's outline as the body, then the details on it or inside it. A filled path is closed with `Z`.
- **Keep it, for a curved body:** take it from the kit and paste it. `node <skill-dir>/shapes.mjs <primitive> --grid 16 --w 12 --h 12 --at 8,8` prints the body on the quarter grid with every join smooth or a corner: `drop`, `leaf`, `lens`, `bean`, `crescent`, `taper`, `wedge`, `scoop`, the soft bodies of The bodies (`dome`, `sack`, `bubble`, `bell`, `bust`), or `blob --anchors "x,y[,t][,c] …"` from anchors of your own (`c` a cusp). `node <skill-dir>/shapes.mjs` alone lists every flag. A hand-written path is the exception.
- **Keep it, for a path you wrote or edited, before the first check:** `node <skill-dir>/shapes.mjs --from pretty-icons/<name>.svg` re-solves the handles about every kinked anchor and prints each repaired path as `path@N <d>`. Paste them back. `--from` first snaps every number to the quarter grid; `shapes.mjs` refuses a grid other than 16, 20, 24 or 48, and a scoop whose rx is over half its shorter side.
- **Keep it, for a corner:** make it one, over 30°: a cusp of the kit (`c`), or two straight sides.
- **Keep it, for an outline with corners:** take a rect, a circle or a triangle, or turn the extra sides into curves.
- **Keep it, for a house:** a house is one contour, walls and roof in one closed path, with its door as the accent. Not a rect with a roof on it: a roof narrower than the box reads as a lid (a shed, a tent, an envelope flap). On 16, the body is `M2.25 6.5 8 1.5l5.75 5v5a1 1 0 0 1-1 1h-9.5a1 1 0 0 1-1-1z` with the fill, and the door `M6.5 10.5V8.5h3v2`, stopping a stroke short of the floor, as loose asks. Its five sides are the two slopes, the walls and the floor; arcs round the floor's corners, and the round join rounds the eaves and the ridge. It is square 12.5 × 12, its mass 0.24 low; walls 0.5 taller, the door moved down with them, sink it to 0.51, past rule 06. A door run down to the floor is refused by loose, and one 3 tall reads as a notch.
- **Keep it, for a glyph:** braces are the one glyph (rule 09), and they need a body to sit in. `coding` is braces inside a landscape window, not a bare `</>`. Bare strokes have no body, and they also come out light (rule 05).
- **Keep it, for a ring:** a closed shape with a contour and no fill is a detail, and is allowed. A hub drawn as a ring inside a disc is one.
- **Rejected when:** `check.mjs` prints `construction`: `construction  coding  no filled element → at least one body`, `construction  interfaces  rect@2 stroke none → a contour on every body`. Or `contour`, for a faceted body: `contour  node  path@2 6 straight sides → at most 5, or curves`. Or `join`, for a kink: `join  leaf  path@2 10.0° at 8, 4.5 → under 4° or over 30°: smooth, or a corner on purpose`. Or `inflection`, for a wobble: `inflection  leaf  path@2 segment 2 2 inflections over a chord of 9 → at most 1, none under a chord of 4`. Or `bend`, for a tight curve: `bend  pao  path@1 radius 0.5 at 8.15, 7.52 → ≥ 1, or a cusp`. Ease it with longer handles, or make the corner a cusp on purpose. `check.mjs` also prints a `pixel` note, never a failure, for straight strokes whose edges fall between pixels at 1× and 2×: move them by 0.25 when the note names them.

## 05 · weight: the ink matches the set

Each icon's ink is within 15% of the set's median, and within 20% of the grid's reference: 63.1 on 16, 102.4 on 20, 151 on 24. The median keeps the set even; the reference keeps it at the finish, so a set drawn uniformly heavier than `examples/hairline` fails though it matches itself. A unit of free line weighs about 1 on 16, a unit² of fill 0.2. A set of three or more is measured against its own median and the reference. For an even count, the median is the mean of the two middle values. A set of one or two is measured against the reference alone, within 15%. The 16 reference is the median of `examples/hairline`; the 20 and 24 references are measured from it scaled to the grid's live area and drawn at the grid's stroke.

- **Keep it, for a heavy icon:** it has too much line or a second filled body. A badge (a box holding a glyph, rule 09) runs heavy on any grid. Shorten or drop a detail, or turn a second body into an unfilled detail. A rack of rows and dots, four cells, a cylinder's arcs and a window's bars all run heavy. A line across a filled body adds about 0.8 per unit on 16: the line, less the fill it covers.
- **Keep it, for a light icon:** it lacks a body or line. Give it a body first (rule 04), then lengthen a detail.
- **Keep it, for the body:** change details first. A body starts at the preset and can shrink by at most 0.5.
- **Keep it, after any change:** one icon's ink moves the median, so an icon you did not touch can fail. Check and read the whole set again.
- **Keep it, for a set heavy against the reference:** every icon carries too much. Drop the second detail on each (rule 09) before shrinking anything.
- **Rejected when:** `check.mjs` prints `weight`: `weight  java  ink 143.62 (-17.6%) → within ±15% of the set's median 174.37`, on 24, a body 16 wide beside two of 18.5. Against the reference: `weight  rack  ink 181.99 (+20.5%) → within ±20% of the reference 151`, on 24, a set of three drawn alike and heavy. In a set of one or two: `weight  machines  ink 31.38 (-50.3%) → within ±15% of the reference 63.1`.

## 06 · gravity: the mass is centred

The centre of mass of the ink is within 0.5 of the canvas centre on each axis. The box may sit off centre. The mass may not.

- **Keep it:** centre the mass, not the box. `check.mjs` prints the offset: `mass +0, +1.3` is 1.3 low. Move the drawing the other way, to the nearest 0.25. `examples/hairline/interfaces.svg`'s box sits 0.5 right and 0.5 low, under its pointer, and its mass sits at +0.27, +0.27.
- **Keep it, when the move would push ink out of the live area:** the layout is lopsided. Three nodes in a triangle sit 1.3 low; two on a diagonal balance (`connectivity`). A tray's floor sits it 0.6 low: lift it, or draw a shape even top to bottom.
- **Rejected when:** `check.mjs` prints `gravity`: `gravity  connectivity  mass +0, +1.3 → within ±0.5`.

## 07 · radius: two radii

Every rect is rounded by the preset. A smaller side of 8 or more takes the larger radius, a smaller one the smaller: 1.5 or 1 on 16, 2 or 1 on 20 and 24.

- **Keep it:** read the smaller side from `width` and `height`, not the ink. A phone 10 wide takes 1.5; a cell 4 wide takes 1. No 1.25, no 1.75, no rect without `rx`.
- **Rejected when:** `check.mjs` prints `radius`: `radius  machines  rect@2 rx 1.25 → rx 1`.

## 08 · gap: touch, or air between

Two elements either touch or sit at least one and a half strokes apart, outer edge to outer edge: two and a half strokes on their centrelines, 2.5 on 16, 3.25 on 20, 3.75 on 24. A mark (rule 09's tick, a dot) needs half that. They touch when their centrelines come within 0.1 of each other: one ends on the other, or crosses it. Anything between is "almost", and is rejected. Two outlines that meet edge to edge, `0 apart`, are almost too. The subpaths of one path are held to the same rule: dots merged into one path are as close as separate ones. A detail inside a body is the one exception: it is held one stroke from the body's contour, not one and a half (`loose`, below).

- **Keep it, to make a detail touch a body:** end the path on the body's centreline, on the grid. A rect that runs from x 2.75 to 13.75 takes a cross `M2.75 8.25h11`, centreline to centreline. Not the stroke's outer edge, 0.5 further out.
- **Keep it, to keep a detail clear:** put its centreline two and a half strokes from the body's: 2.5 on 16, 3.25 on 20, 3.75 on 24. In `examples/hairline/devices.svg` the home bar at y 11.25 sits 3 above the phone's edge at 14.25, and clear.
- **Keep it, for a line that meets a body:** a part that meets a body from outside (a handle, a stem, a nozzle) ends on the body's edge, and never runs under the body and out the other side, because the 20% fill shows it through.
- **Keep it, for a detail inside a body** (a seam, a slit, a score, a stripe, a title bar, a line of text): it stops short of the contour, its nearest ink at least one stroke from the contour's, edge to edge: its centreline 2 strokes inside the contour's, 2 on 16. A detail is inside when its midpoint lies inside a filled body. A stripe or a title bar that ran from edge to edge now floats in its body, a stroke clear at each end.
- **Keep it, for a near miss:** a check in its shield, a home bar in its phone, cells, rows, dots or braces: move each to touch or to two and a half strokes apart. Cells that cannot sit that far apart become one body with a cross that ends on its edges.
- **Keep it, for a modifier:** it sits in a halo: the glyph's real reach (its farthest ink, never less than half its box) plus one stroke of clear space and half the base's stroke. Nothing else crosses the halo. `modifiers.mjs` cuts every stroke the halo crosses where it enters, drops a piece shorter than 1, and keeps the paint whole, so the 20% fill shows in the halo. Never cut it or draw it by hand. Gap leaves the modifier out: the halo is its gap.
- **Rejected when:** `check.mjs` prints `gap`: `gap  marks  path@2 to circle@3 0.3 apart → ≥ 1.5 apart, or crossing`. Overlapping outlines whose centrelines stay apart print `gap  overlap  rect@2 to path@3 overlapping, centrelines 0.75 apart → ≥ 1.5 apart, or crossing`. Two subpaths of one path print their indexes from 0: `gap  dots  path@3[0] to path@3[1] 0 apart → ≥ 1.5 apart, or crossing`. Two elements on one line print their place among the elements: `path#2@3`. A stroke left in a modifier's halo prints `modifier`: `modifier  data  rect#1@1 2.85 inside badge:plus's halo → clear of it: add the modifier with modifiers.mjs, which cuts the stroke`. A detail inside a body prints `loose`: `loose  billing  path#2@1 touches rect#1@1 → end it ≥ 1 stroke inside the contour` for one that runs to the contour, `loose  billing  path#2@1 0.5 strokes from rect#1@1 → ≥ 1 stroke inside the contour` for one that stops too near.

## 09 · metaphor: one object, three elements

One object per icon, nameable in one or two words, from at most three elements. A path counts as one element, however many subpaths it holds, up to eight commands. Implicit repeats count: `M1 1 2 2` is a move and a line, two commands.

No letters, digits, logos or initials, ever. A brand name is drawn as the thing the name means (ruby → a gem, java → a cup), never as its mark or its initials. A brand name that means no thing is handed back. Braces are the one glyph allowed, as an accent inside a body (`coding`). A box drawn to hold a glyph is a badge, not a body.

A body carries one accent: the part that names the object, the home bar on a phone, the title bar on a window, the check in a shield. An accent inside the body is loose (08): it stops a stroke short of the contour. A second mark for realism (a chimney, a white streak, a second wisp of steam, a fold, a shadow) is dropped. Measured across all the details, every element without a fill: at most two subpaths and eight drawing commands between them. A `circle`, `rect` or `line` detail is one of each; moves are not drawing commands, implicit repeats are. Two subpaths are for one symmetric thing: a cross, a pair of braces.

The accent is drawn as a gesture: the one thing that makes a body a thing and not a shape. Pick one per body from the catalogue; two are noise. When the accent is a part (a door, a handle, a home bar), that part is the gesture, and the body takes no other but the lean.

| Gesture | What it is | For |
| --- | --- | --- |
| **seam** | a line inside the body that follows its form | a croissant's folds, a loaf's score, a ball's stitch |
| **dot pair** | two dots, a stroke and a half apart | a button's holes, a plug's pins, seeds |
| **tuft** | one short stroke or a small leaf off the top | a fruit's stem, a carrot's leaves, a bag's tie |
| **steam** | one wisp over the body, never three | a thing named by its heat: an oven, a hot drink |
| **paper sheen** | a small paper fill on glass, at 48 only | a bottle, a jar, a screen; never a white stroke |
| **lean** | the body's belly slid to one side, `shapes.mjs --lean` | a drop, a pear, a sack; it costs no element |

- **Keep it, for the count:** merge details into one path. `all` is a body and one path, `M8.25 2.75v11M2.75 8.25h11`, not four rects. A connection is two nodes and a link, not three nodes. A machine is one body and one detail, not a rack. A rounded box is a `rect` with `rx`; as a path it takes ten commands. When a merged path would pass eight, split it across the elements left. When the details together pass eight drawing commands, drop one.
- **Keep it, for the object:** draw what the name means. A gear's teeth do not fit at 16 under the count and contour rules: draw settings as sliders, two knobs and two tracks, each track starting at its knob's edge and running one way (rule 08). On 16: knobs `cx 4.5 cy 4.5 r 3` and `cx 11.5 cy 11.5 r 3`, tracks `M7.5 4.5h7M1.5 11.5h7`, on the circle keyline. Knobs of r 2.5 come out light (50.7, against 63.1). A dashed ring reads as loading. Do not draw:
  - interfaces as a layout window (it reads "layout" or "browser") or a card with a stripe ("payments");
  - devices, or any plural name, as one device (a phone reads "mobile");
  - empty as an inbox tray ("inbox") or a dashed circle ("loading", "placeholder");
  - a dashed ring for settings, with or without a hub ("loading", "spinner");
  - a shield for a type system (typescript): it reads "security", and only by meaning.
- **Keep it, for a brand** (a language, a framework, a product, a service, a company): draw the thing, not the mark or the badge. `JS` or `TS` in a square, `GO` in a box or `n` in a hexagon reads as a logo, and a set of them as a row of badges. Draw an object only when the name means a thing: ruby → a gem, java → a cup. A name that means no thing (typescript, go, php, node.js, html, css, javascript) has no metaphor in this style, and any object drawn for it is a guess: braces and a tag compete, a shield reads by meaning, not by sight. Hand it back. Say that the set needs the brands' own marks, from the brand or a set like Simple Icons, and that this skill keeps those rows even by size only if the person asks.
- **Keep it, for a family that is not a brand** (file types): its members share one object and differ by a single accent.
- **Keep it, for the accent:** name the one part that makes the object itself and draw only that. A house is its door, not a door and a chimney. A cup is its handle, not three wisps of steam. A magnifier is its handle, not a white streak on the lens.
- **Keep it, for a familiar pick:** a 2 × 2 grid, a cylinder, a bookmark or a shield with a check is neither good nor bad. The test is whether the reader names the object you meant: a shield with a check, for security, passes.
- **Keep it, for a state** (add, remove, done, cancel, off, locked, new, up, down): the base icon and one modifier, never a fourth element drawn by hand. `node <skill-dir>/modifiers.mjs pretty-icons/<name>.svg --add <kind>` writes it in, once the base passes `check.mjs`. The kinds are `badge:plus`, `badge:minus`, `badge:check`, `badge:x`, `slash`, `lock`, `dot` and `arrow:up`, `arrow:right`, `arrow:down`, `arrow:left`; `--corner br|tr|bl|tl` moves it (default `br`), `--print` prints instead of writing. One per icon. The modifier, and a contour it split from its paint, are not counted. A modified icon is measured for live and gap only, and stays out of the set's median. The command refuses a corner whose halo would cover a whole body, and a cut that `check.mjs` would reject, such as a stub left nearer a body than a stroke: try another `--corner` or another kind.
- **Keep it, for the examples:** do not copy `examples/hairline`'s metaphors. Its devices is one phone, on the list above, and its interfaces a pointer on an open window, which one reader of two named only by elimination.
- **Rejected when:** `check.mjs` prints `count` (`count  all  4 elements → at most 3`, `count  empty  path@2 9 commands → at most 8`), or `count` on the details: three wisps and a handle print `count  java  details 4 subpaths → at most 2`, a glyph `count  php  details 11 drawing commands → at most 8`. Or read: the reader gives another name, puts two numbers on one name, does not know, reads a letter or a digit, gets the name only by elimination, or names an object that does not mean the name (`read.md`).

## 10 · set: measured together

Every icon in a set shares the preset. A new icon is measured against the icons already there, never alone.

- **Keep it:** draw a new icon into the folder that holds the set, and check the folder. Use the set's grid, stroke and radii. Copy the app's existing icons in this style into the folder first: they are the set.
- **Rejected when:** `check.mjs` prints `canvas` for a file on another grid (`canvas  data  viewBox 0 0 24 24 → 0 0 16 16`), or `weight` against the set's median.

## 11 · air: paper you can see

Paper between inks is part of the drawing. Where two inks do not touch, the paper between them is at least one and a half strokes wide, and a closed counter (a hole, an eye, the inside of a ring) is at least two strokes across. Rule 08 measures centrelines; air measures the pixels, so it also sees a band of paper inside one element, between two curves, or in a counter.

- **Keep it:** drop a detail rather than squeeze it in. Two parallel lines sit 2.5 apart on 16, or become one. A counter opens to two strokes across, or closes: a hole of 1.5 is a speck, not a hole.
- **Keep it, for a detail inside a body:** it is `loose`'s, held at one stroke (08); air reads the icon without it.
- **Rejected when:** `check.mjs` prints `air`, with the paper's width in strokes and its place: `air  oil  paper 1.1 strokes wide at 8, 8 → ≥ 1.5 apart, or touching`, two lines 2 apart on 16; `air  eye  counter 1.5 strokes across at 8, 8 → ≥ 2 across`, a ring of r 1.25. A region under one square stroke is anti-aliasing and is not reported.

## 12 · diagonal: some lie at 45°

An elongated object (a wrench, a pen, a key, a rolling pin, a whisk, a stalk) may lie on the diagonal, lower left to upper right, so a set is not a row of upright things. At most three in ten do, so the set stays calm: `check.mjs` counts the icons whose ink is twice as long as it is wide, its long axis within 10° of 45°, and refuses those past `round(0.3 × N)`, never fewer than one.

- **Keep it:** stand the fourth one upright, or lay it flat. A diagonal object runs from the lower left to the upper right, its heavier end low.
- **Rejected when:** `check.mjs` prints `diagonal`: `diagonal  set  4 of 10 on the diagonal (brush, key, pen, wrench) → at most 3`; and for one that falls the wrong way, `diagonal  key  upper-left to lower-right → lower-left to upper-right`: mirror it.

## How check.mjs measures

Each icon is rendered at 32× in black. A pixel is ink when its alpha is over 5%. The ink box bounds those pixels, the mass is their alpha-weighted centre, and ink is Σ alpha / 32². Gap samples centrelines instead of pixels. `--print` shows every icon's measures.

Air renders the icon at 8 px per stroke, without its modifiers and its interior details, and opens the paper with an exact distance transform: paper narrower than 1.5 strokes, or a closed counter under 2, that is left over is reported with its width and its centre. Loose finds an unfilled element whose midpoint lies inside a filled body and measures its least distance to the body's contour, edge to edge. Bend samples every smooth cubic at 65 points and reports the tightest radius under one stroke; a cusp and a stalled sample are skipped. Diagonal takes each icon's ink's principal axes: a ratio of 2 or more, the long axis within 10° of 45°.
