---
name: pretty-icons
description: Use when an app needs a set of icons drawn to match each other, small ones for a sidebar, nav or tabs, or larger shaded ones in neutral tones for feature grids, categories or empty states; or when existing icons look uneven in a row (one bigger, one lighter, one off centre); or when someone runs /pretty-icons with a list of names or a file.
argument-hint: "[names, or a file with the nav]"
---

# pretty-icons: a set that sits even

You are drawing a set of icons for one app in one of two finishes. **Duotone**, on 16, 20 or 24: a stroke in `currentColor` with a `currentColor` fill at 20% under every body, for a sidebar. **Filled**, on 48: a thin line over a light body in five neutral tones, the side away from the light shaded inside the body, no shadow and no colour, for icons shown at 16–64 px by CSS. The person chooses the finish; the grid follows from it. What makes them a set is measurement: `check.mjs` measures every icon against the others and the keylines, and a reader who has seen none of your work names each from the picture alone. `examples/hairline` (ten sidebar icons) and `examples/garage` (ten car icons) are the finishes; their metaphors are not the bar (rule 09).

Files named below are in this skill's folder, `<skill-dir>`. Draw icons in `pretty-icons/` in the person's working directory; run the scripts from there.

## 1. Read

The argument is names, a file, or nothing. With nothing, find the app's navigation and icons. Before drawing, write back:

- the names to cover;
- the finish, which the person chooses: duotone (one colour, the text's, that follows hover and active states) or filled (neutral tones, light and shade, the same in every state). Ask, and recommend from where the icon is shown: duotone in a sidebar, a nav, tabs or a table row, beside text; filled in a feature grid, a category list, a card header or an empty state. With nobody to ask, take the recommendation and say so;
- the grid, from the finish. Duotone is drawn at the size it is shown: measure the existing icon's rendered box, 16 beside 13–14px text, 20 beside 15–16px, 24 beside larger; never draw 24 for a 16px slot. Filled is drawn on 48 and shown at 16–64 px by CSS; below 32 its line is under one pixel on a 1× screen, so say so when the slot is that small. Never draw duotone for a 48 px slot;
- how the app takes icons: React (and any wrapper, like `svg(children)`), `.svg` files, or a sprite.

Copy the app's icons in this style into `pretty-icons/` first: they are the set (rule 10).

## 2. Conceive

One line per name: *name — object, format, elements*, as in `billing — receipt, portrait, body + lines`. Check each against rule 09. Present the list for approval or swaps. With nobody to ask, take the conventional one and say so. Split a name longer than two words, or hand it back. A brand name with no object goes to the hand-back list, not to a guess (rule 09).

## 3. Draw

`node <skill-dir>/sheet.mjs <skill-dir>/examples/hairline` (duotone) or `<skill-dir>/examples/garage` (filled) and look at the sheet: that is the finish. Draw your own objects at that finish (rule 09).

Read `rules.md` first; for the filled finish, then `rules-filled.md`, which says where each rule reads differently at 48 and gives the tones, the radii, the bodies and a worked traffic light. Write one file per icon, `pretty-icons/<name>.svg`, from its root. Start every body from the bodies table or the kit. Use only `rect`, `circle`, `line` and short `path`s. At the filled finish, draw each body as tone, shade, contour: the contour is the tone's geometry pasted, never redrawn.

The kit is the normal way to draw a curved body; a hand-written path is the exception (rule 04). Draw each icon in a loop:

1. Compose. `node <skill-dir>/shapes.mjs <primitive> --grid <grid> --w <w> --h <h> --at <x>,<y>` prints the body; paste it into the file, then add the details and the one gesture (rule 09) by hand.
2. `node <skill-dir>/check.mjs pretty-icons/`. Fix each line by its rule. After a hand edit kinks a curve, `node <skill-dir>/shapes.mjs --from pretty-icons/<name>.svg` repairs it.
3. `node <skill-dir>/sheet.mjs pretty-icons/ --proof --only <name>` writes `pretty-icons-proof.png` and prints its path. Look at it: the construction (anchors, handles, every join coloured, green smooth, blue a corner, red a kink), the finish, the silhouette at 16 and 24, the pixels at display size, under a reference row from the examples.
4. Adjust and go back to 2, until no join is red, the silhouette alone names the object, and the icon sits with the reference row.

A state (add, off, locked, new) is the base icon plus `node <skill-dir>/modifiers.mjs pretty-icons/<name>.svg --add <kind>`, run once the base passes (rule 09).

## 4. Check

1. `node <skill-dir>/check.mjs pretty-icons/`. Fix each line by its rule until it prints `ok`. The first run installs `@resvg/resvg-js` into a cache (`PRETTY_ICONS_CACHE` moves it).
2. `node <skill-dir>/sheet.mjs pretty-icons/`. It writes `pretty-icons-sheet.png` and `pretty-icons-blind.png` to a temp folder of this set's own (`--out=<dir>` moves them) and prints their paths and the key. Never put them in the app. Look at the sheet.
3. Do the blind read in `read.md`. A failure goes back to step 3, then all of step 4, with a new reader.
4. Do the craft read in `read.md`, with another new reader, once the blind read passes. A named defect goes back to step 3, then all of step 4.

On exit 2, sheet and emit refuse; without Node, answer the text checks atop `check.mjs` by hand. Either way, deliver the `.svg` files; say `not measured`, **not read blind** and **not read for craft**.

## 5. Hand over

`node <skill-dir>/emit.mjs pretty-icons/ --as svg|react|sprite --to <path>`, in step 1's format. `--to` is a folder holding only the set for `svg`, a file for `react` and `sprite`. It replaces the app's icons as one set; never emit beside the old one. `--wrapper svg@./icon` imports a wrapper; bare `--wrapper svg` needs it in scope. Emitted `.tsx` needs the automatic runtime (`jsx: react-jsx`). Commit the `pretty-icons/` sources with the emitted file. Then say, one line each:

- the finish and the preset;
- the reader's result: which failed first, what changed, any you could not redraw;
- the craft reader's result: the defects named, the three weakest and why; or **not read for craft**;
- the names handed back: they need the brands' own marks (rule 09);
- anything not measured, not read blind or not read for craft.

## 6. Adjust

Edit only that icon's `.svg`. Run steps 4 and 5 for the set.

## What goes wrong

| If you catch yourself | Do this instead |
| --- | --- |
| writing coordinates that are not on the quarter grid | take the body from the table in `rules.md` and move details by 0.25 |
| drawing a body with no contour because the fill reads as a shape | rule 04: a body is contour plus fill, always |
| making a landscape icon narrower so it "looks lighter" | rule 02: it fills the landscape keyline; lighten it by shortening a detail |
| placing a detail a little away from the body so they "don't merge" | rule 08: a stroke apart, or touching on the centreline; nothing between |
| adding a fourth element to make the metaphor clearer | rule 09: three at most; if it needs a fourth, the metaphor is wrong |
| drawing a badge, initials, a logo or a bare `</>` | rule 09: draw the thing the name means; braces only, in a body |
| adding a chimney, a shine, steam or a fold | rule 09: one accent per body, drawn as one gesture from the catalogue |
| writing a cubic by hand for a curved body | rule 04: take it from `shapes.mjs`; `--from` repairs a kink |
| drawing a plus, a slash or a lock onto an icon | rule 09: `modifiers.mjs --add`, which cuts its halo out of the base |
| looking at the icons only on the finished sheet | step 3: `sheet.mjs --proof --only <name>` after every check |
| drawing a hexagon, cut gem or stepped body | rule 04: a rect, circle, triangle, house or curved outline |
| reading the sheet yourself and calling it read | `read.md`: a second agent, or say "not read blind" |
| drawing cells, nodes or rows as separate elements | rule 09: one path, eight commands at most |
| reaching for a colour, or a grey that "looks closer" | `rules-filled.md` 03: the five tones, nothing else; a dark page swaps them, the file never does |
| shading the top or the left, or a stripe across the body | `rules-filled.md` 04: the light is from the top; the shade is the lower or right part, inside the outline |
| adding an offset shadow or a white shine | `rules-filled.md` 04: neither; depth is the shade inside the body. The one sheen allowed is a paper fill on glass, a gesture from rule 09 |
| doubling a ring or a spoke to make it read thicker | `rules-filled.md` 04: a bar at 3.5 and its core, a tube |
| rounding every rect the same | `rules-filled.md` 07: cut, cased, moulded or a pill, by what the object is |
