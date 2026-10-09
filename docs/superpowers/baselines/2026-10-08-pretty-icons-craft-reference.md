# pretty-icons craft: reference study and reads

Companion to `docs/superpowers/specs/2026-10-08-pretty-icons-craft-design.md`. The references are the person's images in `docs/superpowers/baselines/refs/` (ignored by git, kept locally): `filled-ref-1.png` (the filled finish's bar) and `line-ref-2.png` … `line-ref-8.png` (the duotone finish's bar). Measured with `runs.py` (Task 1 of the plan); a width is in the image's own pixels, so only ratios and fractions are compared.

## Reference study

Widths are full width at half maximum (a run's pixels plus its anti-aliased edge, read from the pixel profile); the plain `runs.py --dark` cut undercounts the lighter inner lines (3 px at the cut, about 4 px at half maximum), so the ratio is taken at half maximum. The filled reference is 2000x1341, line-ref-7 is 1348x871.

| Measured | From | Default | Measured | How (image, row/col or box) | Verdict |
| --- | --- | --- | --- | --- | --- |
| contour / inner line ratio | filled reference | 2 / 1.5 = 1.33 | 1.53 median of 1.48 (tomato 6.5/4.4), 1.58 (pot lid 6.0/3.8), 1.58 (pepper 6.3/4.0), 1.38 (cup 6.5/4.7); n = 4 | widths are full width at half maximum, read from the pixel profile (not runs.py runs; at runs.py's fixed cut, `--dark 100`, the contour reads 6 and the inner line 3, ratio 2.0): `filled-ref-1.png` row 264 x 1712-1830 (tomato), pot lid: half-max profile over col 640, y 640-700; runs.py cross-check `col 640 --from 640 --to 680 --dark 100`, row 1100 x 825-935 (pepper), col 1545 y 410-530 (cup) | stays at 2 (ruling): measured 1.53 sits between the grid's 2 (1.33) and 2.5 (1.67); spec Decision 5 fixes 2, and 2.25 puts the 48 bodies' inset off the quarter grid |
| cusps per silhouette | filled reference | blob caps 6 (duotone), 10 (filled) anchors | silhouettes are smooth with 0 to 5 cusps: tomato 5 (calyx), pot 4, cup 3, pepper 2, cabbage 0; median 3 | by eye on tomato, pot, pepper, cup, cabbage | stays (count of cusps is within the caps' anchors) |
| elements per icon | filled reference | 8 at 48 | tomato 8, pot 10, pepper 8, cup 7, cabbage 6; median 8 (fill, offset shadow, outline, details) | by eye, same five | stays |
| where the gesture sits and what it is | filled reference | seam, dot pair, tuft, steam, paper sheen, lean | tomato: white specular at upper left plus two seams; pot: three steam wisps above the lid plus a vertical sheen at the left; pepper: specular at the left plus three seams; cup: foam tuft at the top; cabbage: veins; every icon carries an offset tint shadow at the lower right | by eye, same five | stays (seam, steam, tuft, sheen and lean all appear) |
| modifier size / live area | line reference | 0.36 (`MODIFIER`) | 0.40 median of coins+plus 0.40 (12/30), coins+x 0.33 (10/30), coins+percent 0.33 (10/30), card+plus 0.48 (15/31), card+lock 0.45 (14/31) | `line-ref-7.png` row 280-307 x 945-1042 (coin icons), row 351-378 x 673-1043 (card icons); ink widths from bounding boxes of pixels under 200 | stays |
| halo width / stroke | line reference | 1.5 strokes beyond the modifier's ink | 1.0 stroke (clear gap of about 2 px against a 2 px stroke: card+heart, +lock, +pencil, +refresh 2 px; card+plus about 1.5 px) | `line-ref-7.png` card icons x 673-1043 y 351-378, gap between the base line's end and the badge; stroke from `row 365 --from 673 --to 705` = 2 | stays (1.0 sits at the lower edge of the 1 to 2 band) |
| modifier corner | line reference | `br` | card badges sit br (6 of 6); coin badges sit tr (7 of 7) | `line-ref-7.png`, by eye | stays br (ruling): cards 6/6 br, coins 7/7 tr — the corner is per family; br is the default and --corner tr covers the coin case |
| strokes per icon, terminals | line reference | 3 elements, 8 commands | leaf 2 elements, feather 3, flame 2, drop with sheen 2, plain drop 1; median 2; open ends median 2 (the grey sheen or vein), base outlines closed | `line-ref-6.png` row 205-250 x 620-880 and row 135-180 x 1100-1290, by eye | stays (2 against 3 is under half off) |
| curve-to-straight ratio | line reference | `--bulge 0.55` | about 70 percent of the outline curved (leaf 85, feather 40, flame 70, drops 70-75) | `line-ref-6.png`, by eye on the same five | stays |
| modifier tone / base tone | line reference | 0.6 | 0.51 ((255 - 141) / (255 - 33)); the grey is 141 against a base 33 | `line-ref-2.png` box 0 0 200 200 gives darkest 30 lightest 255; modifier and base darkest from `line-ref-7.png` card icons (modifier 141, base 33, white 255) | stays (0.51 sits at the lower edge of the 0.5 to 0.7 band) |

## The before

## The bar: examples/garage

## The bar: examples/hairline

## The after

## The trial
