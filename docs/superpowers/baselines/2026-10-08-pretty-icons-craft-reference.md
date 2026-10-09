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

Measured with `node skills/pretty-icons/check.mjs <set> --print` (Task 3) on the twenty icons drawn before this work, in `docs/superpowers/baselines/2026-10-08-craft-before/`. Joins are smooth, corners and kinks per icon; infl is inflections.

Car set:

| icon | joins | infl |
| --- | --- | --- |
| banco | 10 smooth · 2 corners · 1 kink | 0 |
| carro | 12 smooth · 8 corners | 0 |
| chave | 0 smooth · 10 corners | 0 |
| cone | 3 smooth · 9 corners · 3 kinks | 0 |
| estrada | 0 smooth · 8 corners | 0 |
| extintor | 3 smooth · 2 corners | 0 |
| marcha | 8 smooth · 2 corners · 2 kinks | 0 |
| roda | 0 smooth · 2 corners | 0 |
| semaforo | 2 smooth · 2 corners | 0 |
| triangulo | 3 smooth · 5 corners · 6 kinks | 0 |

Car totals: 41 smooth, 50 corners, 12 kinks, 0 inflections. Matches the plan (banco 1, cone 3, marcha 2, triangulo 6 kinks).

Bakery set:

| icon | joins | infl |
| --- | --- | --- |
| batedor | 4 smooth · 2 corners | 0 |
| bolo | 8 smooth · 6 corners | 0 |
| croissant | 2 smooth · 5 corners · 3 kinks | 0 |
| farinha | 6 smooth · 9 corners | 0 |
| forno | 2 smooth · 2 corners | 0 |
| pao-de-forma | 14 smooth · 8 corners | 0 |
| pao | 5 smooth · 2 corners | 0 |
| rolo | 0 smooth · 8 corners | 0 |
| rosquinha | 6 smooth · 2 corners | 3 |
| trigo | 0 smooth · 10 corners | 0 |

Bakery totals: 47 smooth, 54 corners, 3 kinks, 3 inflections (all on rosquinha). Matches the plan (croissant 3 kinks).

## The bar: examples/garage

### Before the redraw

Measured with `node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print` at 678aa95: `ok`, median ink 328.69 of 10.

| icon | joins | infl |
| --- | --- | --- |
| battery | 2 smooth · 0 corners | 0 |
| car | 10 smooth · 6 corners | 0 |
| fuel | 6 smooth · 2 corners | 0 |
| gearshift | 0 smooth · 2 corners | 0 |
| oil | 5 smooth · 5 corners | 0 |
| speedometer | 7 smooth · 2 corners | 0 |
| steering-wheel | 0 smooth · 2 corners | 0 |
| traffic-light | 2 smooth · 2 corners | 0 |
| tyre | 0 smooth · 2 corners | 0 |
| wrench | 2 smooth · 6 corners | 0 |

The craft read, a fresh reader given `pretty-icons-sheet.png` and the craft prompt with N = 10, word for word:

> Ten icons, in sheet order:
>
> 1. battery: none
> 2. car: cabin window too small
> 3. fuel: pump nozzle looks detached
> 4. gearshift: confused silhouette, tiny H-pattern
> 5. oil: spout floats off body
> 6. speedometer: tick marks too small
> 7. steering-wheel: uneven weight, thin spokes
> 8. traffic-light: side tabs thin, detached
> 9. tyre: lug details too small
> 10. wrench: slightly wobbly, thin handle
>
> Three weakest:
> - Oil (5): the spout and drop sit loose from the can, so the silhouette reads as a floating part. The can is just a blank block.
> - Gearshift (4): a ball, stem and base that don't read as one object. The H-pattern inside the knob is too small to read at list size.
> - Tyre (9): the lug dots and the ring of tick marks are too small and fade into the dark body. Its weight is heavy next to the thin-line icons, so it looks inconsistent with the set.
>
> Steering-wheel (7) and wrench (10) came close. Their lines are thinner than the rest.

Nine of ten named a defect, and check saw none of them: no join kinks, no inflections.

Scoring, by the controller's ruling: "floating" said of a modifier (a badge, a dot or a slash cut out of its halo) is not a defect, since the halo gap is how rule 08 builds a modifier and check.mjs measures it; "floating" said of a body part still counts. No icon in this set carries a modifier, so every "floating" below is a body part and counts.

### Round 1

Redrawn: car, fuel, gearshift, oil, speedometer, steering-wheel, tyre, wrench. Battery and traffic-light stayed. Check: `ok`, no kink, infl 0 on every icon, median ink 345.13.

The blind read, a fresh reader given `pretty-icons-blind.png` and the read.md blind prompt with N = 10, word for word (key: 1 oil · 2 wrench · 3 steering-wheel · 4 gearshift · 5 car · 6 fuel · 7 tyre · 8 speedometer · 9 traffic-light · 10 battery):

> Read from the image only. No letters or digits appear in any icon.
>
> 1. oil: oil can with drop
> 2. wrench: open-end spanner
> 3. steering-wheel: ringed wheel with spokes. It could also pass for a crosshair or dial, but the double rim and hub fit a wheel best.
> 4. gearshift: shift knob with H-pattern
> 5. car: small sedan, side view
> 6. fuel: fuel pump with nozzle handle
> 7. tyre: dark disc with tick marks and a hub. It reads weakly as a tyre. It could be a dial, a clock face or a wheel, so I'm less sure of it than of the others.
> 8. speedometer: semicircle gauge with needle
> 9. traffic-light: three-lamp signal with the top lamp lit
> 10. battery: battery with + and - terminals.
>
> No two numbers compete for one name. Number 7 is the only one that gets its name partly because the other names are taken. Nothing else in the set could be a tyre, but the icon itself looks more like a dial or wheel face than a tyre.

Blind: 9 of 10. The tyre fails, paired partly by elimination.

The craft read, a fresh reader given `pretty-icons-sheet.png` and the craft prompt with N = 10, word for word:

> Defects per icon, from the image alone:
>
> 1. battery: none
> 2. car: wheels slightly heavy; thin roof
> 3. fuel: detail too small (hose side)
> 4. gearshift: confused silhouette (person/lever)
> 5. oil: spout floats off body
> 6. speedometer: ticks too small to read
> 7. steering-wheel: uneven weight (thin spokes/rings)
> 8. traffic-light: uneven weight; side ticks tiny
> 9. tyre: detail too small (spokes/ticks)
> 10. wrench: uneven weight; thin handle detail
>
> Three weakest:
> - oil (5): the spout and drop look detached from the can body, so the silhouette reads as separate pieces.
> - gearshift (4): the knob on a dome base looks like a person or bust, so the object is ambiguous.
> - steering-wheel (7): the thin concentric rings and hairline spokes are much lighter than the bold strokes on battery, car and fuel. The icon looks out of family and the details are hard to read at small size.
>
> Runners-up: traffic-light and tyre, whose small ticks vanish at list size.

Craft: 9 icons with a defect. The gate fails.

### Round 2

Redrawn: car (the window and shoulders), oil (the drop back under the spout), steering-wheel (the spokes a bar with a shade core, like the ring), tyre (a wheel: lug dots on the hub and a two-stroke sheen on the rubber in the mark tone, no radial ticks), speedometer (longer ticks), wrench (the slot a 2 line), gearshift (a pill base), fuel (a wider hose loop). Check: `ok`, no kink, infl 0 on every icon.

The blind read, a new reader, word for word (key: 1 battery · 2 oil · 3 speedometer · 4 gearshift · 5 tyre · 6 traffic-light · 7 steering-wheel · 8 fuel · 9 wrench · 10 car):

> Answers from the image alone:
>
> 1. battery: car battery, plus and minus terminals. The + and - are drawn symbols, not letters or digits.
> 2. oil: oil can with a drop.
> 3. speedometer: dial gauge with a needle.
> 4. gearshift: shift knob with an H-pattern. The H-pattern on the knob is a gate diagram. I read it as a pattern, not as the letter H.
> 5. tyre: black tyre with a hub.
> 6. traffic-light: three lamps, the top one filled.
> 7. steering-wheel: wheel with spokes and a hub.
> 8. fuel: fuel pump.
> 9. wrench: open-end spanner.
> 10. car: small side-view car.
>
> Two numbers compete for one name: none. All ten names are used exactly once.
>
> I read no letter or digit as a name-giving clue.
>
> No number got its name only because the other names were taken. Each one matched its own object.
>
> Number 2 (oil) was the closest call. The can with a drop could pass for fuel, but number 8 is clearly a pump, so the two are distinct.

Blind: 10 of 10, none by elimination.

The craft read, a new reader, word for word:

> Defects per icon, judged from the sheet image alone:
>
> 1. battery: none
> 2. car: wheels slightly oversized, heavy
> 3. fuel: handle detail looks cramped
> 4. gearshift: shift-pattern too small to read
> 5. oil: spout floats off the body
> 6. speedometer: tick marks too small and faint
> 7. steering-wheel: uneven weight, thin spokes
> 8. traffic-light: side tabs thin and floating
> 9. tyre: hub dots too small to read
> 10. wrench: thin, uneven weight, tiny hole
>
> Three weakest:
> - **oil:** The spout looks detached from the can, and the drop is crowded against the body. The silhouette is confused.
> - **gearshift:** The H-pattern inside the knob is too small to read at list size. The base and stem are also thin next to the knob.
> - **traffic-light:** The side tabs are hairline and float off the body, and the stroke weight is lighter than in the other icons. The lamps are small.
>
> Runners-up are the speedometer ticks and the tyre hub dots, both too small to read.

Craft: 9 icons with a defect (the traffic light's "floating" tabs are a body part, so it counts). The gate fails.

### Round 3

Redrawn: car (wheels r 4, two circles again, so the right hub, circle@7, still lies under badge:check's halo), oil (can and spout one body under a domed top: five straight sides, 11 commands), gearshift (knob r 12, a wider three-prong pattern), fuel (narrower body, the hose clear of it), speedometer (ticks in the line tone), wrench (the slot a solid 3.5 line, the hole r 2). Check: `ok`, no kink, infl 0 on every icon.

The blind read, a new reader, word for word (key: 1 fuel · 2 battery · 3 car · 4 traffic-light · 5 speedometer · 6 tyre · 7 wrench · 8 oil · 9 gearshift · 10 steering-wheel):

> 1. fuel: fuel pump with nozzle
> 2. battery: battery with plus and minus signs. I read "+" and "−" on it, which are symbols rather than letters or digits, and they name the icon.
> 3. car: small cartoon sedan
> 4. traffic-light: three-lamp signal, top lamp lit
> 5. speedometer: dial gauge with needle
> 6. tyre: black wheel with lug holes
> 7. wrench: open-end spanner
> 8. oil: oil can with drop
> 9. gearshift: H-pattern gear knob on base
> 10. steering-wheel: wheel with spokes and hub
>
> No two numbers compete for one name. No number got its name only because the other names were taken. I read no letter or digit anywhere. The only marks that could count as text are the "+" and "−" on the battery.

Blind: 10 of 10, none by elimination. The battery's + and − are signs, not letters or digits, as the reader says; the battery is drawn as it was at 678aa95.

The craft read, a new reader, word for word:

> Defects per icon (from the image alone):
> 1. battery: none
> 2. car: wobbly roofline curve
> 3. fuel: uneven weight (handle thinner)
> 4. gearshift: detail too small (H pattern)
> 5. oil: confused silhouette (spout and drop)
> 6. speedometer: ticks too small to read
> 7. steering-wheel: uneven weight (thin spokes and rim)
> 8. traffic-light: detail too small (side tick marks)
> 9. tyre: detail too small (hub dots, arc highlight)
> 10. wrench: uneven weight (thin shaft against heavy head)
>
> Three weakest:
> - oil: the spout, drop and body read as separate parts. The spout looks like it floats off the can, and the silhouette is confused.
> - steering-wheel: the strokes are thin and double-lined compared with the heavy battery and tyre. The weight is uneven and the spokes are hard to read at small size.
> - gearshift: the H-pattern is cramped inside the knob and clogs at small size. The base plate and stem also feel disconnected from the knob.

Craft: 9 icons with a defect. The gate fails for the third round, so the redraw stops here (the brief's limit). The blind gate holds; the craft gate does not.

### After the redraw

Measured with `node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print`: `ok`, median ink 342.46 of 10, so `REFERENCE_INK[48]` moves from 328.7 to 342.5.

| icon | joins | infl |
| --- | --- | --- |
| battery | 2 smooth · 0 corners | 0 |
| car | 10 smooth · 6 corners | 0 |
| fuel | 8 smooth · 2 corners | 0 |
| gearshift | 0 smooth · 2 corners | 0 |
| oil | 11 smooth · 4 corners | 0 |
| speedometer | 7 smooth · 2 corners | 0 |
| steering-wheel | 0 smooth · 2 corners | 0 |
| traffic-light | 2 smooth · 2 corners | 0 |
| tyre | 0 smooth · 2 corners | 0 |
| wrench | 2 smooth · 6 corners | 0 |

The defects every craft reader named, round after round, are the same few. Check cannot see them, and a redraw within the rules has not cleared them:
- the traffic light's side tabs, which stay byte for byte;
- the steering wheel's bars with a core, whose two 1.0 edges read thinner than a 2 contour; `filled.test.mjs` pins the bar-and-core construction;
- detail at list size: the speedometer's ticks, the gearshift's gate, the tyre's lug dots;
- the oil can's spout, still read as floating after it became one body with the can.

## The bar: examples/hairline

## The after

## The trial
