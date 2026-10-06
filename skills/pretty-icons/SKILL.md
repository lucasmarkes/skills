---
name: pretty-icons
description: Use when an app needs a set of icons drawn to match each other, small ones for a sidebar, nav or tabs, or larger illustrated ones with flat colour for feature grids, categories or empty states; or when existing icons look uneven in a row (one bigger, one lighter, one off centre); or when someone runs /pretty-icons with a list of names or a file.
argument-hint: "[names, or a file with the nav]"
---

# pretty-icons: a set that sits even

You are drawing a set of icons for one app in one of two finishes. **Duotone**, on 16, 20 or 24: a stroke in `currentColor` with a `currentColor` fill at 20% under every body, for a sidebar. **Filled**, on 48: an ink contour over a flat colour from one palette, a shadow in the colour's shade set down and right, the object's details in that shade and one white highlight, for icons shown at 32–64 px. The grid names the finish. What makes them a set is measurement: `check.mjs` measures every icon against the others and the keylines, and a reader who has seen none of your work names each from the picture alone. `examples/hairline` (ten sidebar icons) and `examples/pantry` (eight kitchen icons) are the finishes; their metaphors are not the bar (rule 09).

Files named below are in this skill's folder, `<skill-dir>`. Draw icons in `pretty-icons/` in the person's working directory; run the scripts from there.

## 1. Read

The argument is names, a file, or nothing. With nothing, find the app's navigation and icons. Before drawing, write back:

- the names to cover;
- the finish and the grid, from where the icon is shown. In a sidebar, a nav, tabs or a table row, beside text, it is duotone; measure the existing icon's rendered box: 16 beside 13–14px text, 20 beside 15–16px, 24 beside larger. Never draw 24 for a 16px slot. In a feature grid, a category list, a card header or an empty state, at 32 px or more, or when the person asks for colour or an illustrated look, it is filled, on 48, shown at its size by CSS. Never draw filled for a 16–24 px slot, and never duotone for a 48 px one;
- how the app takes icons: React (and any wrapper, like `svg(children)`), `.svg` files, or a sprite.

Copy the app's icons in this style into `pretty-icons/` first: they are the set (rule 10).

## 2. Conceive

One line per name: *name — object, format, elements*, as in `billing — receipt, portrait, body + lines`. Check each against rule 09. Present the list for approval or swaps. With nobody to ask, take the conventional one and say so. Split a name longer than two words, or hand it back. A brand name with no object goes to the hand-back list, not to a guess (rule 09).

## 3. Draw

`node <skill-dir>/sheet.mjs <skill-dir>/examples/hairline` (duotone) or `<skill-dir>/examples/pantry` (filled) and look at the sheet: that is the finish. Draw your own objects at that finish (rule 09).

Read `rules.md` first; for the filled finish, then `rules-filled.md`, which says where each rule reads differently at 48 and gives the palette, the bodies and a worked egg. Write one file per icon, `pretty-icons/<name>.svg`, from its root. Start every body from the bodies table. Use only `rect`, `circle`, `line` and short `path`s. At the filled finish, paste the body's geometry as the first element for its shadow; never redraw it.

## 4. Check

1. `node <skill-dir>/check.mjs pretty-icons/`. Fix each line by its rule until it prints `ok`. The first run installs `@resvg/resvg-js` into a cache (`PRETTY_ICONS_CACHE` moves it).
2. `node <skill-dir>/sheet.mjs pretty-icons/`. It writes `pretty-icons-sheet.png` and `pretty-icons-blind.png` to a temp folder of this set's own (`--out=<dir>` moves them) and prints their paths and the key. Never put them in the app. Look at the sheet.
3. Do the blind read in `read.md`. A failure goes back to step 3, then all of step 4, with a new reader.

On exit 2, sheet and emit refuse; without Node, answer the text checks atop `check.mjs` by hand. Either way, deliver the `.svg` files; say `not measured` and **not read blind**.

## 5. Hand over

`node <skill-dir>/emit.mjs pretty-icons/ --as svg|react|sprite --to <path>`, in step 1's format. `--to` is a folder holding only the set for `svg`, a file for `react` and `sprite`. It replaces the app's icons as one set; never emit beside the old one. `--wrapper svg@./icon` imports a wrapper; bare `--wrapper svg` needs it in scope. Emitted `.tsx` needs the automatic runtime (`jsx: react-jsx`). Commit the `pretty-icons/` sources with the emitted file. Then say, one line each:

- the finish and the preset;
- the reader's result: which failed first, what changed, any you could not redraw;
- the names handed back: they need the brands' own marks (rule 09);
- anything not measured or not read blind.

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
| adding a chimney, a shine, steam or a fold | rule 09: one accent per body |
| drawing a hexagon, cut gem or stepped body | rule 04: a rect, circle, triangle, house or curved outline |
| reading the sheet yourself and calling it read | `read.md`: a second agent, or say "not read blind" |
| drawing cells, nodes or rows as separate elements | rule 09: one path, eight commands at most |
| picking a colour that "looks closer" than the palette's | `rules-filled.md`: the fourteen pairs, ink and paper, nothing else; the shade comes with the fill |
| drawing a seed, a hole or a stripe in ink | `rules-filled.md` 04: details take the body's shade; ink is the contour and the parts |
| redrawing the shadow, or using `<use>` or `<defs>` | `rules-filled.md` 04: the body's `d` pasted, `translate(3 3)`, its shade, `stroke="none"`, first in the file |
| filling a whisk's balloon, a basket or a rack as a body | `rules-filled.md` 09: wires are ink parts; the solid piece is the body |
| drawing a filled body on the 44 keyline | `rules-filled.md` 02: the object's keyline is 41 wide, centred at 22.5; the shadow fills the rest |
