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

### Fix round 1

The controller calibrated the craft gate on the references. Fresh sonnet readers given the craft prompt named a defect for 24 of the filled reference's 40 icons (60%) and for 20 of the line reference's 26 (77%). So a reference set itself fails a gate of zero, and the gate becomes: a fresh reader names a defect for at most 6 of 10. The blind gate stays 10 of 10 with no elimination, and check stays `ok`, no kink, infl 0. Up to three more redraw rounds, each with a new blind reader and a new craft reader. Traffic-light (byte for byte) and steering-wheel (`filled.test.mjs` pins bar and core) stay out of the redraw. "Floating" said of a modifier is not a defect; said of a body part it counts, as before.

An icon is scored as failed when the reader names a defect from the prompt's list for it (read.md, "The craft read"). A remark outside the list ("clunky", "wheels crowd the body", "wheels slightly oversized") is recorded and not counted.

#### Fix round 1, read 1

Redrawn, bigger and fewer:
- car: a dome cabin with one window, and wheels that are two circles, so the car still refuses `badge:check` on `circle@7`;
- fuel: a short hose hook at 3.5;
- gearshift: the gate in 3.5 on a round knob;
- oil: a motor-oil bottle, its cap crossing the contour, with a drop;
- speedometer: three ticks at 3.5, a needle at 2 on a solid hub;
- tyre: five lug dots on a hub of r 12;
- wrench: the slot dropped, the hole r 2.25.

Check: `ok`, infl 0 on every icon, median ink 340.09.

The blind read, word for word (key: 1 battery · 2 speedometer · 3 traffic-light · 4 wrench · 5 oil · 6 fuel · 7 steering-wheel · 8 car · 9 gearshift · 10 tyre):

> 1. battery: car battery with + and - marks. A "+" and "−" are drawn on it, so these are symbols (a letter/digit-like read), but the object is plainly a battery.
> 2. speedometer: dial gauge with needle.
> 3. traffic-light: three-lamp signal, top lamp lit.
> 4. wrench: open-end spanner.
> 5. oil: oil can/bottle with drop.
> 6. fuel: fuel pump with window and hose.
> 7. steering-wheel: wheel with spokes and hub.
> 8. car: small side-view car.
> 9. gearshift: shift knob with H-pattern, on a base.
> 10. tyre: dark tyre with a hubcap and lug holes.
>
> No two numbers compete for one name. Every number has its own name, and none was named only because the other names were taken. No letter or digit is drawn on any icon, apart from the + and - marks on the battery.

Blind: 10 of 10, none by elimination. The + and − on the battery are signs, and the battery is unchanged since 678aa95.

The craft read, word for word:

> 1. battery: none (terminal posts slightly heavy)
> 2. car: detail too small (windows)
> 3. fuel: uneven weight (hose and nozzle)
> 4. gearshift: detail too small (shift pattern)
> 5. oil: none (cap is a bit blocky)
> 6. speedometer: detail too small (ticks and needle)
> 7. steering-wheel: uneven weight (thin spokes)
> 8. traffic-light: confused silhouette (side ticks)
> 9. tyre: detail too small (hub dots)
> 10. wrench: uneven weight (thin shaft)
>
> Three weakest:
> - Tyre (9): the hub dots and the highlight arc are tiny and muddy. The mostly black disc is much heavier than its neighbours. The pale hub pattern reads as a button or a cookie, not a wheel.
> - Steering-wheel (7): the hairline double rim and thin spokes are much lighter than the bold strokes on battery, oil and fuel. The inner details blur at small size.
> - Gearshift (4): the shift-pattern knob has a very fine grid. The base plate and stem are thin next to the heavy knob, so the weight is uneven. The silhouette is ambiguous at small size.
>
> Traffic-light (8) is a close runner-up. Its side ticks are small and fussy, and the body is narrow.

Craft: 8 icons with a list defect (battery and oil "none"). The gate fails.

#### Fix round 1, read 2

Changed:
- car: the window grown to a top of 13.25, the hubs to r 2;
- fuel: the hose at 2, out to x 39;
- speedometer: longer ticks, the needle at 3.5, the hub r 3.25;
- wrench: the lower half of the shaft in shade.

Check: `ok`, infl 0.

The blind read, word for word (key: 1 gearshift · 2 oil · 3 fuel · 4 battery · 5 traffic-light · 6 car · 7 steering-wheel · 8 tyre · 9 speedometer · 10 wrench):

> Readings from the image alone (no letters or digits appear inside any icon; the only numerals are the grid labels):
>
> 1. gearshift: shift knob with H-pattern on a base plate. The H-pattern is drawn lines, not a letter.
> 2. oil: oil can with a droplet.
> 3. fuel: fuel pump with a hose.
> 4. battery: battery with + and - terminals. The plus and minus are symbols, not letters or digits.
> 5. traffic-light: three-lamp signal, top lamp filled.
> 6. car: small side-view car.
> 7. steering-wheel: wheel with spokes and hub.
> 8. tyre: dark tyre with a lug-nut hub. It is the dark disc with a bolt-circle hub.
> 9. speedometer: dial gauge with a needle.
> 10. wrench: open-end spanner.
>
> No two numbers compete for one name. Every name is used once, and each number matches its name on what it shows. No number got its name only because the others were taken.
>
> The weakest reads are 8 (tyre) and 2 (oil). Both still read clearly: 8 is a tyre because of the dark tread ring and lug holes, and 2 is oil because of the can and drop.

Blind: 10 of 10, none by elimination.

The craft read, word for word:

> Defects per icon (from the image alone):
> 1. battery: terminal posts slightly clunky
> 2. car: wheels crowd the body
> 3. fuel: hose detail floats, uneven
> 4. gearshift: knob detail too dense
> 5. oil: cap floats, off-center
> 6. speedometer: tick marks uneven weight
> 7. steering-wheel: thin spokes, weight mismatch
> 8. traffic-light: side ticks detached, tiny
> 9. tyre: hub dots too small
> 10. wrench: thin outline, uneven weight
>
> Three weakest:
> - Tyre (9): the five hub dots and the highlight arc shrink to mush at small size. The silhouette is heavy and filled, so it also looks unlike the outlined icons.
> - Traffic-light (8): the tiny side ticks look detached from the body. The lamps are thin rings next to one solid filled lamp, so the weight is uneven.
> - Wrench (10): its stroke is thinner and lighter than the rest of the set. The open jaw is hard to read, and it looks like a different family from the heavy battery and oil icons.
>
> Close runners-up are fuel (the hose floats off the body) and gearshift (the knob detail is too fine).

Craft: 8 icons with a list defect: fuel (floats, a body part), gearshift, oil (the cap floats, a body part), speedometer, steering-wheel, traffic-light, tyre and wrench. Battery's "clunky" and car's "wheels crowd the body" are not on the list. The gate fails.

#### Fix round 1, read 3

Changed:
- fuel: the hose runs from y 11 down to y 39.5 and back into the body;
- oil: the cap centred and 12 wide;
- speedometer: the ticks as marks at 2, longer;
- wrench: the hole a solid line disc.

Tried and dropped before any reader saw them:
- the gearshift gate at 2, which read as the letter H at list size;
- the tyre with four filled lug dots, at +27.9% and with a fill on an open path.

Check: `ok`, infl 0.

The blind read, word for word (key: 1 steering-wheel · 2 traffic-light · 3 battery · 4 wrench · 5 gearshift · 6 fuel · 7 car · 8 oil · 9 speedometer · 10 tyre):

> Read from the image alone:
>
> 1. steering-wheel: round wheel with spokes
> 2. traffic-light: three-lamp signal, top lamp filled
> 3. battery: box with two terminals, + and −
> 4. wrench: open-end spanner, diagonal
> 5. gearshift: shifter knob with H-pattern on a base
> 6. fuel: pump with a window and a hose
> 7. car: side-view small sedan
> 8. oil: bottle with a drop
> 9. speedometer: half-dial gauge with needle
> 10. tyre: dark wheel with a patterned hub
>
> No two numbers compete for one name. No number got its name only because the other names were taken.
>
> I read the + and − signs on 3 as symbols, not letters or digits. The H-pattern on 5 is a shift pattern, not a letter. Two caveats:
> - 5 could be read as a gear-lever or joystick, but gearshift is the only fit.
> - 8 shows a bottle with a drop and no can spout. It reads as oil and fits no other name.

Blind: 10 of 10. The gearshift's caveat names the object it shows, a shifter knob with an H-pattern, so it does not count as elimination.

The craft read, word for word:

> Defects per icon (from the image alone):
> 1. battery: none
> 2. car: wheels slightly oversized
> 3. fuel: hose reads as a separate bracket
> 4. gearshift: shift pattern too small to read
> 5. oil: none
> 6. speedometer: tick marks tiny and faint
> 7. steering-wheel: uneven weight, spokes thin
> 8. traffic-light: side tabs too small; lens details cramped
> 9. tyre: hub dots too small to read
> 10. wrench: uneven weight, loose silhouette
>
> Three weakest:
> 1. Tyre. The five hub dots are too small and low-contrast to read. At small sizes it collapses into a dark disc with a vague highlight.
> 2. Gearshift. The H-pattern inside the knob is too fine and crowded. The knob, stem and base also feel disconnected, so the silhouette is a little confused.
> 3. Fuel (traffic-light is a near tie). The hose or handle on the right is a thin, detached-looking loop that doesn't join the pump body cleanly. The pump window and slot are also faint. Traffic-light's side tabs and lens outlines are similarly cramped.

Craft: 7 icons with a list defect: fuel, gearshift, speedometer, steering-wheel, traffic-light, tyre and wrench. Battery and oil are "none", and car's "wheels slightly oversized" is not on the list. The gate (at most 6) fails by one icon, and the three rounds are spent.

#### After fix round 1

Measured with `node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print`: `ok`, median ink 341.25 of 10. That is 1.2 from 342.5, so `REFERENCE_INK[48]` moves to 341.3.

| icon | joins | infl | ink |
| --- | --- | --- | --- |
| battery | 2 smooth · 0 corners | 0 | 333.18 |
| car | 8 smooth · 6 corners | 0 | 335.51 |
| fuel | 8 smooth · 2 corners | 0 | 376.44 |
| gearshift | 0 smooth · 2 corners | 0 | 408.27 |
| oil | 15 smooth · 3 corners | 0 | 307.59 |
| speedometer | 7 smooth · 2 corners | 0 | 333.97 |
| steering-wheel | 0 smooth · 2 corners | 0 | 361.12 |
| traffic-light | 2 smooth · 2 corners | 0 | 347 |
| tyre | 0 smooth · 2 corners | 0 | 418.56 |
| wrench | 3 smooth · 9 corners | 0 | 259.13 |

Across the four craft reads, the count of icons with a list defect went 9, 8, 8, 7. The reference sets fail at 60% and 77%. Two of the remaining seven are fixed points (traffic-light, steering-wheel). The other five are named in every read:
- the tyre's lug dots;
- the gearshift's gate;
- the speedometer's ticks;
- the fuel hose;
- the wrench's weight, the lightest icon at 259.

After the reads, a re-review found the wrench's solid hole broke rules-filled.md ("Glass and a hole: paper"). The hole is now paper with the line contour, at r 2.5. Wrench ink is 261.47, check is `ok`, and the median is unchanged at 341.25. No reader saw this change.

## The bar: examples/hairline

Three icons carry a modifier, added with `modifiers.mjs --add`: `all`, `connectivity` and `machines`, each a dot. None was refused. `data`, `devices` and `security` (the proof's reference row) and `coding` carry none. Redrawn from the reads: `marks` (a triangle over a circle, read as generic shapes) is a bookmark; `machines` (a disc with a hub, paired by elimination) is a robot head with an antenna and a visor; `interfaces` (a window with a top bar, read as a card) is a pointer on an open window; `empty` (a dashed box with a plus, paired by elimination) is a plain square; `data` (two bars, read as uneven) is a cylinder. `check.mjs` prints `ok`, no kink. The 16 median of the seven plain icons is 83.48; the references are 83.5 on 16, 115.4 on 20 and 183 on 24.

Gates: **not met.** The craft gate, at most 6 of 10 icons with a defect (fix round 1's bar), is met: 6 on the committed set. The blind gate, 10 of 10 with no elimination, is not: the best read on a committable set scored 8 of 10 (fix round 1, redraw 2, the committed set). Stopped after three more redraw rounds.

Each read was a fresh agent given only the image and the prompt from `read.md`, N = 10.

### Round 1 (step 3's set, unchanged bases)

Key: 1 machines · 2 marks · 3 data · 4 devices · 5 security · 6 interfaces · 7 connectivity · 8 empty · 9 all · 10 coding.

Blind read, word for word:

> | # | Name | Object seen |
> |---|------|-------------|
> | 1 | machines | Disc or drive with a dot |
> | 2 | marks | Triangle and circle shapes |
> | 3 | data | Bar chart |
> | 4 | devices | Phone |
> | 5 | security | Shield with a check |
> | 6 | interfaces | Card or window panel |
> | 7 | connectivity | Chain link with a check |
> | 8 | empty | Dashed empty box with a plus |
> | 9 | all | Four-pane grid |
> | 10 | coding | Code brackets in a box |
>
> - **Competition:** Numbers 1 and 3 both fit "data". The disc could be storage, but the bar chart is the stronger fit, so 3 gets "data".
> - **Names given by elimination:** Number 1 gets "machines" only because the other names are taken. A disc does not clearly say machine. Number 6 gets "interfaces" and number 9 gets "all" mostly by elimination too. The card could also be a payment object, and the grid could also be an interface.
> - **Letters and digits:** I read none inside any icon. The only digits are the 1 to 10 captions under the icons.

Score: 5 of 10. Fail: machines (elimination), marks (generic shapes), interfaces (card; elimination), all (elimination), data (competes with 1).

### Round 2 (marks, machines, interfaces redrawn)

Key: 1 interfaces · 2 data · 3 empty · 4 marks · 5 security · 6 coding · 7 devices · 8 all · 9 connectivity · 10 machines.

Blind read, word for word:

> Each number gets its own name, so no two numbers compete for one name. I read only the image.
>
> 1 = interfaces: window with two title-bar dots
> 2 = data: bar chart on a baseline
> 3 = empty: dashed selection box with plus
> 4 = marks: bookmark ribbon
> 5 = security: shield with checkmark
> 6 = coding: panel with code brackets
> 7 = devices: phone or tablet
> 8 = all: four-square grid
> 9 = connectivity: chain link with check
> 10 = machines: small robot with antenna
>
> Letters and digits: I read none. Icon 6 has a bracket-like glyph ({} or </>), which is a symbol, not a letter. I named it coding from the brackets.
>
> Named by elimination:
> - Icon 3 gets "empty" mostly because the other nine names are taken. A dashed placeholder box fits "empty" loosely, but it could also read as a selection tool.
> - Icon 1 ("interfaces") is a milder case. It is a generic window, and it could be mistaken for 6, which is a window with code in it.

Score: 8 of 10. Fail: empty (elimination), interfaces (elimination, milder).

Craft read on the same sheet, word for word:

> Defects by icon, going by the proof row in the image:
>
> 1. all: none
> 2. coding: braces slightly cramped, tiny
> 3. connectivity: confused silhouette, floating check
> 4. data: uneven weight, baseline heavier
> 5. devices: none
> 6. empty: plus floats off the body, uneven dashes
> 7. interfaces: dots too small to read
> 8. machines: floating badge dot, confused silhouette
> 9. marks: none
> 10. security: check too small
>
> Three weakest:
> - **machines (8):** the robot head, antenna and corner badge dot don't read as one object. The badge floats off the body and the stroke weight is inconsistent. It has the lowest ink coverage (70.8) and the largest mass offset (-0.4, -0.36).
> - **connectivity (3):** the two chain links tangle into a confusing silhouette, and the grey check floats off the body. It also has a visible curve kink where the links cross.
> - **empty (6):** the "+" is detached from the dashed square and is lighter than the dashes. The dash lengths and gaps are uneven. It has the lowest ink (61.2) and the worst mass offset (-0.72, -0.71), so it sits visibly off-balance.

Defects named for 7 icons.

### Round 3 (empty's dash `3 3`): the set committed before fix round 1

Key: 1 security · 2 empty · 3 all · 4 coding · 5 marks · 6 interfaces · 7 data · 8 connectivity · 9 machines · 10 devices.

Blind read, word for word:

> 1. security: shield with a checkmark.
> 2. empty: dashed empty box with a plus. This is a placeholder or empty-state look, and it's the least certain of the ten.
> 3. all: a 2x2 grid of squares.
> 4. coding: window with angle brackets (<>).
> 5. marks: bookmark ribbon.
> 6. interfaces: plain window or card with two dots.
> 7. data: bar chart on a baseline.
> 8. connectivity: chain link with a check.
> 9. machines: small robot with an antenna.
> 10. devices: smartphone.
>
> Competing names: none. Number 4 could pass for interfaces because it is a window, but the brackets make it coding. That leaves 6 for interfaces.
>
> Letters or digits: I read none. The <> in number 4 is a symbol, not a letter, so no icon is named for one.
>
> Names given only by elimination: number 2 gets "empty" mostly because no other name fits a dashed placeholder box. Number 6 gets "interfaces" mainly because the window-like names were already taken. Number 3 gets "all" fairly naturally.

Score: 8 of 10. Fail: empty (elimination), interfaces (elimination).

Craft read on the committed set (a new reader, after round 4), word for word:

> Defects per icon, numbered in the sheet's reading order: all, coding, connectivity, data, devices, empty, interfaces, machines, marks, security.
>
> 1. all: none
> 2. coding: braces too small
> 3. connectivity: confused silhouette, floating check
> 4. data: uneven bar heights, weight
> 5. devices: none
> 6. empty: floating plus, dashes uneven
> 7. interfaces: dots too small to read
> 8. machines: floating dot, confused silhouette
> 9. marks: none
> 10. security: none
>
> Three weakest:
> - connectivity (3): the chain links tangle into an unclear shape, and the grey check floats detached at the corner.
> - machines (8): the robot head is hard to read, the antenna is tiny, and the dark dot at the bottom right floats off the body.
> - empty (6): the dashes are uneven and the plus hangs off the corner. It also has the least ink (54%), so it looks weak next to the others.
>
> Close runner-ups are interfaces (7), whose two dots barely read, and coding (2), whose braces are small.

Defects named for 6 icons: coding, connectivity, data, empty, interfaces, machines.

### Round 4 (interfaces as sliders; reverted)

Key: 1 all · 2 empty · 3 devices · 4 coding · 5 marks · 6 machines · 7 data · 8 connectivity · 9 security · 10 interfaces.

Blind read, word for word:

> Read from the image alone. I saw no letters or digits inside any icon, only the caption numbers under them.
>
> 1. all: four-square grid in a rounded square. It's the only whole-set icon, so the match is clear.
> 2. empty: dashed selection box with a plus. A dashed empty slot fits "empty".
> 3. devices: phone or tablet outline.
> 4. coding: code brackets "<>" in a rounded rectangle. They are shapes, not letters.
> 5. marks: bookmark.
> 6. machines: small robot or bot head with antenna and a dot.
> 7. data: bar chart.
> 8. connectivity: chain link with a check mark.
> 9. security: shield with a check mark.
> 10. interfaces: slider or toggle controls.
>
> Conflicts: no two numbers compete for one name. Number 8 and number 9 both have check marks, but their objects (link versus shield) separate them cleanly.
>
> Names taken only by elimination:
> - 10 gets "interfaces" mostly because it is the name left over; sliders are a plausible UI-controls icon, but not a strong match.
> - 2 gets "empty" partly by elimination too, though the dashed placeholder does fit.
> - 6 gets "machines" because the bot is the best remaining fit.

Score: 7 of 10. Fail: interfaces, empty, machines (elimination). Sliders scored below the window, and rule 09 keeps sliders for settings, so `interfaces` went back to the window with a dot pair (round 3's set).

### Fix round 1

The controller's rulings for this round:

1. "Floating" said of a modifier alone is not a defect, since the halo is its gap (rule 08). Said of a body part, it counts, and a confused silhouette counts on any icon. `read.md` says so.
2. Leaving `coding`, `data`, `devices` and `security` without a modifier forbids a modifier, not a redraw.
3. The blind gate stays at 10 of 10 with no elimination. The craft gate became: a fresh reader names a defect for at most 6 of 10 icons, scored per ruling 1.

Calibration for the craft gate: the controller ran the same craft prompt with fresh sonnet readers on the references. A reader named a defect for 24 of 40 filled-reference icons (60%) and for 20 of 26 line-reference icons (77%).

Three redraws, each read by two new sonnet readers, one at a time, given only the PNG path and the prompt. The craft readers numbered the sheet in its order: all, coding, connectivity, data, devices, empty, interfaces, machines, marks, security.

#### Redraw 1 (empty a plain square, interfaces a toggle, data a cylinder, machines plain)

The set: `empty` is a plain square, `x2.25 y2.25 w11.5 h11.5 rx1.5`, ink 85.07. `interfaces` is a toggle: a pill `M6.25 3.5H9.75A4.5 4.5 0 0 1 9.75 12.5H6.25A4.5 4.5 0 0 1 6.25 3.5Z` and a knob of r 1.5 at (9.75, 8). `data` is a cylinder, `M2.75 4.5V11.5A5.25 2.25 0 0 0 13.25 11.5V4.5A5.25 2.25 0 0 0 2.75 4.5Z` with its rim `M2.75 4.5A5.25 2.25 0 0 0 13.25 4.5`. `machines` is a robot head with a visor slot and no modifier. `all` and `connectivity` take a dot. Only two icons carried a modifier, under the three the brief asks for, and the toggle refuses `badge:plus` at br (a stub 1.43 from the pill), which `modifiers.test.mjs` needs. So this set could not be committed as it stood.

Key: 1 coding · 2 marks · 3 interfaces · 4 data · 5 security · 6 all · 7 connectivity · 8 machines · 9 devices · 10 empty.

Blind read, word for word:

> Image read alone. No letter or digit appears inside any icon. The small numerals 1-10 are only the captions below them.
>
> 1. coding. A code-brackets window `{/}`. Clear fit.
> 2. marks. A bookmark ribbon. Clear fit.
> 3. connectivity? A pill-shaped toggle or switch. Weaker fit. It could be "interfaces" (a UI switch).
> 4. data. A database cylinder. Clear fit.
> 5. security. A shield with a checkmark. Clear fit.
> 6. all. A four-cell grid with a dot. Reasonable fit, since the grid reads as "everything".
> 7. connectivity. Chain links with a dot. This competes with 3 for the name "connectivity". Links are the stronger match, so 7 takes it.
> 8. machines. A robot face with an antenna. Clear fit.
> 9. devices. A phone or tablet. Clear fit.
> 10. empty. A blank rounded square. Clear fit.
>
> Competition: 3 and 7 both compete for "connectivity". 7 wins, so 3 is left with "interfaces".
>
> Name by elimination: 3 gets "interfaces" only because the other names are taken. A toggle is a plausible UI-control icon, but nothing in the image says so on its own. 6 getting "all" is a mild case of the same thing.
>
> Final mapping: 1 coding, 2 marks, 3 interfaces (by elimination), 4 data, 5 security, 6 all, 7 connectivity, 8 machines, 9 devices, 10 empty.

Score: 9 of 10, or 8 if the "mild case" counts. Fail: interfaces (elimination, competes with connectivity); all (mild elimination).

Craft read, word for word:

> Defects per icon (from the image alone):
> 1. all: dot floats off the body (it also breaks the grid corner).
> 2. coding: braces too small to read.
> 3. connectivity: confused silhouette (chain link reads as a diagonal).
> 4. data: none (the lower rim curve may be slightly flat).
> 5. devices: none (the home-bar detail is small).
> 6. empty: none.
> 7. interfaces: knob detail small, but it reads. Weight is uneven (thick outline against a thin inner ring).
> 8. machines: antenna is tiny and detached-looking, and the face detail is too small.
> 9. marks: none (the notch is slightly sharp, not a real kink).
> 10. security: uneven weight (the check is heavier than the outline).
>
> Three weakest:
> 1. all: the detached dot floats off the grid corner, and the bottom-right corner of the grid has a gap.
> 2. connectivity: the silhouette is confused. The two rings, the link and the stray dot don't read as one object, and its ink is the lowest in the set (72.08).
> 3. machines: the antenna and the eyes/mouth are too small to read at 16px, and the head is a confused shape. Coding is a close fourth, since its braces are cramped.

Scored per ruling 1: defects for 5 icons (coding, connectivity, interfaces, machines, security). `all`'s floating dot is the modifier and does not count. Passes the craft gate (at most 6).

#### Redraw 2 (interfaces a pointer on a window, machines with a dot): the committed set

The set: `interfaces` is a pointer on an open window, the window `M13.5 7V4A1.5 1.5 0 0 0 12 2.5H4A1.5 1.5 0 0 0 2.5 4V12A1.5 1.5 0 0 0 4 13.5H7` and the pointer `M7.5 7.5 14 10.75 11.25 11.25 10.75 14Z`, ink 72.95. `machines` is the robot head (rect `x2.5 y4 w11 h9`, antenna `M8 4V1.75`, visor `x5.5 y7 w5 h3 rx1`) with a dot. `all`, `connectivity` and `machines` carry a dot. `empty` and `data` are as in redraw 1.

Key: 1 data · 2 interfaces · 3 empty · 4 marks · 5 devices · 6 machines · 7 connectivity · 8 coding · 9 all · 10 security.

Blind read, word for word:

> Reading from the image alone. I saw no letters or digits inside any icon. The only digits are the caption numbers 1-10.
>
> 1. data: a database cylinder.
> 2. interfaces: a cursor arrow on a window.
> 3. empty: a plain blank rounded square.
> 4. marks: a bookmark ribbon.
> 5. devices: a phone or tablet.
> 6. machines: a robot or bot head with an antenna. It has a small dot badge at lower right.
> 7. connectivity: two linked chain rings, with a dot at lower right.
> 8. coding: a code-brackets "{ }" or "<>" chip. The brackets are glyphs, not letters.
> 9. all: a four-pane grid (window or apps), with a dot badge at lower right.
> 10. security: a shield with a check mark.
>
> Competition and leftovers:
> - No two numbers compete for one name. The one near-tie is 2 against 8 for "interfaces" and "coding". I gave 2 to interfaces (cursor on a window) and 8 to coding (brackets).
> - Number 3 gets "empty" only because the other names are taken. A blank square has no content, so it reads as empty by elimination.
> - Number 9 gets "all" partly by elimination too. A grid fits "all", but it could also be "interfaces".
> - Numbers 6, 7 and 9 share a dot badge at lower right, while 1-5, 8 and 10 have none. The dot may mark a group, but I can't tell what it means.

Score: 8 of 10. Fail: empty (elimination), all (partly by elimination).

Craft read, word for word:

> Defects by icon (from the image alone):
> 1. all: dot overlaps the grid corner
> 2. coding: braces too small, cramped
> 3. connectivity: confused silhouette; link reads unclear
> 4. data: none
> 5. devices: home-bar detail too small
> 6. empty: none
> 7. interfaces: uneven weight; cursor thinner than frame
> 8. machines: floating dot; busy, confused silhouette
> 9. marks: none
> 10. security: check small, thin vs shield
>
> Three weakest:
> - machines (8): the antenna, face, ear dot and corner dot crowd a small body. The dot floats off the body, and the silhouette doesn't read as one object.
> - connectivity (3): the two rings and bar make a muddled shape, and the corner dot floats away from the link. At small sizes it blurs into a blob.
> - all (1): the corner dot collides with the grid's lower-right edge and breaks the square. The dot also looks tacked on rather than part of the form.
>
> Close runners-up are coding (braces are tiny) and interfaces (the cursor is lighter than the thick frame).

Scored per ruling 1: defects for 6 icons (coding, connectivity, devices, interfaces, machines, security). `machines` counts for its confused silhouette, not its dot. `all`'s "dot overlaps the grid corner" is said of the modifier and names no defect from the list, so it is not counted; counted, the total is 7. Passes the craft gate at 6.

#### Redraw 3 (empty a slashed circle, all plain, a larger check and home bar)

The set: `empty` is a circle `cx8 cy8 r6.25` with `--add slash`, read as the empty set. `all` drops its dot. The three modifiers are `connectivity` (dot), `machines` (dot) and `empty` (slash). `security`'s check is `M6.5 8l1.5 1.5L9.75 6.25`, and `devices`' home bar is `M6.5 11.25h3`.

Key: 1 empty · 2 machines · 3 data · 4 connectivity · 5 security · 6 marks · 7 devices · 8 coding · 9 all · 10 interfaces.

Blind read, word for word:

> Readings from the image alone. No letters or digits appear inside any icon. The only digits are the caption numbers 1 to 10 under each icon.
>
> 1. empty: a circle with a diagonal slash (a "none" or null sign).
> 2. machines: a small robot head with an antenna and a status dot.
> 3. data: a database cylinder.
> 4. connectivity: two linked nodes with a small dot.
> 5. security: a shield with a checkmark.
> 6. marks: a bookmark ribbon.
> 7. devices: a phone or tablet.
> 8. coding: a rounded box with a code-bracket glyph.
> 9. all: a 2x2 grid or window.
> 10. interfaces: a square with a cursor arrow.
>
> Competing numbers: none. Each name maps to exactly one number.
>
> Names given only because the others were taken: 9 (all) and 10 (interfaces). Both are the weakest matches. A 2x2 grid could also mean interfaces or "all". A cursor in a box fits interfaces, but it is the leftover name. Number 1 (empty) is a mild case too, since the slashed circle reads as "none".

Score: 7 of 10. Fail: all, interfaces (elimination), empty (mild elimination).

Craft read, word for word:

> Defects per icon, judged from the image alone:
>
> 1. all: none
> 2. coding: braces too small
> 3. connectivity: floating dot; uneven link weight
> 4. data: none (slightly thin ellipse rim)
> 5. devices: none (tiny slot detail)
> 6. empty: slash heavier than ring
> 7. interfaces: cursor detached from frame; confused silhouette
> 8. machines: floating dot; detail too small
> 9. marks: none
> 10. security: check detail slightly small
>
> Three weakest:
> - **machines (8):** The robot reads as a small, cluttered form. The antenna, eyes and mouth are too small at list size. The detached dot at lower right floats off the body and confuses the silhouette. It has the largest mass offset on the sheet (-0.39).
> - **connectivity (3):** The two rings and the link are tangled, and the dot at lower right floats away from the group. The silhouette is hard to parse at small size. It has low ink coverage (72%), so it looks lighter than the others.
> - **interfaces (7):** The frame has an open gap, and the cursor sits half-detached from it. The corner reads as a broken stroke and the weight is uneven. The sheet does not show whether the cursor is meant to be a separate element.
>
> The "empty" icon (6) is a close fourth. Its heavy gray slash against the thinner ring looks like uneven weight, and it has the lowest ink coverage (64%).

Scored per ruling 1: defects for 6 icons (coding, connectivity for its link weight, empty, interfaces, machines for its small detail, security). The floating dots do not count. Passes the craft gate at 6.

Redraw 3 read worse blind than redraw 2, so redraw 2's set is committed. Its references: the 16 median of the seven plain icons is 83.48 (reference 83.5, unchanged); 20 is 115.4 (was 113.7) and 24 is 183 (was 180.8).

### What stands

- Every craft read before fix round 1 named the modifiers as floating (`floating check`, `plus floats off the body`, `floating dot`). The halo is the modifier's gap by design (rule 08), and `read.md` now says that "floating" said of a modifier alone is not a defect.
- `coding` is named for small braces in every read. Its braces fill the landscape body's inner box (3 from each edge, rule 08), and a square body makes them read as parentheses. `security`'s check and `devices`' home bar were named small. Redraw 3's larger check and home bar did not lift the blind read and were not kept.
- `empty` and `interfaces` are the names left to elimination. Across fix round 1, `empty` was named directly once as a plain square ("Clear fit") and by elimination once, and the slashed circle was a "mild case". `interfaces` was named directly once as a pointer on a window and by elimination once; the toggle competed with `connectivity`. `all` is a "mild", "partial" or full elimination in all three blind reads of fix round 1, with or without its dot.
- Readers disagree: the same plain square and the same pointer were named directly by one reader and by elimination by the next.

## The after

### car

Redrawn from scratch with the kit at 48, filled finish, in `docs/superpowers/baselines/2026-10-08-craft-after/car/`, keeping each name, object and format. The kinked four (banco, cone, marcha, triangulo) were drawn first: every round corner is a cubic with its handles on the sides' own directions, so the joins are smooth and the points stay on the quarter grid. The kit's `blob` gave a wobbly seat and a concave triangle, so those two outlines are hand-built.

Scoring, by the controller's ruling: the craft gate allows a list defect on at most 6 of 10; "floating" said of a modifier does not count, and no icon in this set carries a modifier, so every "floating" below is a body part and counts. The blind gate is 10 of 10 with no name won by elimination.

#### Read 0, the first draw

Check: `ok`, no kink, infl 0 on every icon.

The blind read, a fresh reader given `pretty-icons-blind.png` and the read.md blind prompt with N = 10, word for word (key: 1 carro · 2 banco · 3 estrada · 4 chave · 5 cone · 6 semaforo · 7 marcha · 8 triangulo · 9 roda · 10 extintor):

> Readings, by number:
>
> 1. carro: a front-view car.
> 2. banco: a car seat in side view. Nothing else fits it, but this is the weakest read: it could be taken for a boot or a chair.
> 3. estrada: a road in perspective with a dashed center line.
> 4. chave: a key.
> 5. cone: a traffic cone.
> 6. semaforo: a traffic light with three lamps.
> 7. marcha: a gear-shift stick on a base.
> 8. triangulo: a warning triangle.
> 9. roda: a tire or wheel with a hub.
> 10. extintor: a fire extinguisher with a hose.
>
> No two numbers compete for one name. No number got its name only because the other names were taken, except possibly 2 as noted above. I saw no letters or digits inside any icon. The only digits are the caption numbers below the icons.

Blind: 10 of 10 named, but the reader says banco may have its name "only because the other names were taken". That counts as elimination, so the blind gate fails.

The craft read, a fresh reader given `pretty-icons-sheet.png` and the craft prompt, word for word:

> Defects per icon, judged from the sheet at its large and proof sizes:
>
> 1. banco: seat/headrest joint confused; neck looks pinched.
> 2. carro: none. The wheel arches are slightly heavy.
> 3. chave: bow hole small; bit teeth tiny.
> 4. cone: stripe band reads faint, uneven weight.
> 5. estrada: dashes tiny; the left edge looks heavier.
> 6. extintor: hose curve kinks; the handle floats off the body.
> 7. marcha: base arc wobbly; thin, gap-like highlight.
> 8. roda: spokes tiny, confused star shape.
> 9. semaforo: lights too small, stand floating.
> 10. triangulo: none. The inner triangle's stroke is a bit thin.
>
> Three weakest:
> - extintor (6): the hose and handle are a kinked curve and read as detached from the body. The silhouette is hard to identify, since it looks like a hook.
> - roda (8): the white spoke shapes inside the dark disc are small and irregular, so the detail is lost at small sizes and the star looks muddled.
> - banco (1): the headrest-to-seat transition is awkward and the outline weight is uneven, so the silhouette is the least recognizable seat shape.
>
> Close runners-up are semaforo (tiny lights) and chave (tiny bit teeth).

Craft: 8 icons with a list defect: banco, chave, cone, estrada, extintor (the handle floats, a body part), marcha, roda and semaforo (the stand floats, a body part). Carro and triangulo are "none". The gate fails.

#### Round 1, read 1

Changed:
- banco: the back leans, the headrest sits on it with no post, a mark seam runs down the back;
- roda: the five spokes out; a rim of r 11.5 and a solid hub;
- estrada: the dashes are three solid trapezoids that widen down the road;
- chave: the two bit bars are one solid bit; the hole r 4;
- cone: the stripe is solid line;
- semaforo: a taller housing set straight on its base, no pole, lamps r 3.25;
- marcha: the boot is one elliptical arc; the seam out;
- extintor: the hose leaves the head at its middle and ends in a solid nozzle.

Check: `ok`, no kink, infl 0.

The blind read, a new reader, word for word (key: 1 banco · 2 chave · 3 triangulo · 4 carro · 5 extintor · 6 cone · 7 roda · 8 estrada · 9 semaforo · 10 marcha):

> Blind read of the image only (no other file read).
>
> 1. banco - car seat in side view
> 2. chave - key with round head
> 3. triangulo - warning triangle, inner triangle
> 4. carro - small front-view car
> 5. extintor - fire extinguisher with hose
> 6. cone - striped traffic cone
> 7. roda - tire with hub
> 8. estrada - road with dashed center
> 9. semaforo - traffic light on base
> 10. marcha - gear stick, round knob
>
> Competing names: none. Each name has exactly one clear object.
> Names taken only by elimination: none. Every icon was identifiable on its own. Number 10 (marcha) was the least direct, since a gear lever reads as a joystick-like shape, but "marcha" is the natural fit and nothing else competes for it.
> Letters or digits inside any icon: none seen. The only numerals are the captions below the icons.

Blind: 10 of 10. The marcha caveat names the object it shows, a gear lever, so it does not count as elimination. The blind gate passes.

The craft read, a new reader, word for word:

> Defects per icon, from the sheet image only. I did not open the SVG sources.
>
> 1. banco (seat): seat back and base look confused. The headrest is tiny, and the grey stripe is thin and floats loose.
> 2. carro (car): windshield detail too small.
> 3. chave (key): handle ring heavy, shaft joint awkward.
> 4. cone: base is thin and light; the stripe band is a flat wedge.
> 5. estrada (road): none. The road markings are small but readable.
> 6. extintor (extinguisher): hose and nozzle read as confused. The nozzle is a thin stray stroke, and the hose is a loose curve.
> 7. marcha (gear lever): knob and base are disconnected. The thin stem is uneven weight.
> 8. roda (wheel): none. It is the cleanest of the ten.
> 9. semaforo (traffic light): lights too small. The base also has a different weight from the body.
> 10. triangulo (warning triangle): inner triangle has a thin, uneven stroke. The fill is also very faint.
>
> Three weakest:
> 1. extintor: the hose and nozzle are the least readable part of the set. The top is a confused tangle of thin strokes, and it is hard to tell it from a hose or pipe.
> 2. banco: the seat's silhouette is awkward. The headrest and back merge into the L-shaped base, and the highlight stripe is thin and floats on the body.
> 3. marcha: the knob, thin stem and flat base read as separate parts. The stem is much lighter than the outline weight used elsewhere, so the icon looks sparse next to the others. The semaforo is a close fourth, because its three small lights almost vanish at the small sizes in the left columns.

Craft: 8 icons with a list defect: banco (the stripe floats, a body part), carro, chave, cone, extintor, marcha, semaforo and triangulo. Estrada and roda are "none". The gate fails.

#### Round 2, read 2

Changed:
- banco: the seam out, the headrest 15 × 10.5, the cushion to x 40.5;
- marcha: the stem is a solid line part 5 wide;
- semaforo: the housing to y 40.5, lamps r 3.75, the base a solid line pill;
- extintor: the hose and nozzle replaced by a solid horn off the head;
- cone: the base is solid line;
- carro: the windshield taller; the wheels 8.5 tall, to keep the weight inside ±25% of the median;
- chave: the hole r 5, centred.

Tried and dropped before any reader saw it: the triangulo hole with a contour at 2, which check refuses (a filled element takes the root's line).

Check: `ok`, no kink, infl 0.

The blind read, a new reader, word for word (key: 1 chave · 2 carro · 3 marcha · 4 roda · 5 extintor · 6 semaforo · 7 cone · 8 estrada · 9 banco · 10 triangulo):

> 1. chave: round-headed key, or a magnifier. See the flag below.
> 2. carro: small car, front view.
> 3. marcha: gear-shift lever on a base.
> 4. roda: tire with hub.
> 5. extintor: fire extinguisher with handle.
> 6. semaforo: traffic light, three lamps.
> 7. cone: striped traffic cone.
> 8. estrada: road with dashed center line.
> 9. banco: car seat, side view.
> 10. triangulo: warning triangle.
>
> No two numbers compete for one name.
>
> I read no letter or digit inside any icon. The only digits I saw were the captions under each icon.
>
> Flag on icon 1: it gets "chave" mostly because the other nine names are taken. Without that, it reads as a magnifying glass, a ring head on a thick handle. It could pass as a key with a round bow, but a wrench is not what I see. Of the ten, it is the weakest read.

Blind: 10 of 10 named, but chave is named by elimination: the centred hole r 5 made the key a magnifier. The blind gate fails.

The craft read, a new reader, word for word:

> 1 banco: heel/foot curve slightly lumpy; headrest detached-looking
> 2 carro: none (wheel arches heavy)
> 3 chave: handle-to-shaft join awkward
> 4 cone: none (band tiny but readable)
> 5 estrada: road dashes small, uneven
> 6 extintor: hose/nozzle reads confused
> 7 marcha: none (base slightly flat)
> 8 roda: hub detail heavy, tyre uneven
> 9 semaforo: lamp details too small
> 10 triangulo: inner triangle thin, uneven weight
>
> Three weakest:
> 1. extintor: the hose and nozzle is a wedge that doesn't read as a hose. It also sits off the body, and the silhouette is confused.
> 2. banco: the seat-back curve has a visible lump at the bend. The headrest looks pasted on. The overall shape is ambiguous at small size.
> 3. semaforo: the three lamp rings are too small at 16-20px and nearly vanish. Its outline is also heavier than the interior detail, so the weight is uneven.
>
> Close runners-up are chave (awkward handle-to-shaft join) and triangulo (thin inner stroke against a heavy outer stroke).

Craft: 7 icons with a list defect: banco, chave, estrada, extintor, roda, semaforo and triangulo. Carro, cone and marcha are "none". The gate fails by one icon.

#### Round 3, read 3

Changed:
- chave: the hole back to r 4, off-centre toward the bow's top;
- semaforo: all three lamps solid line;
- triangulo: the inner line at 2, as a paper fill and a separate stroke;
- banco: the bend from back to cushion is a wider curve;
- roda: the hub r 3.5.

Check: `ok`, no kink, infl 0.

The blind read, a new reader, word for word (key: 1 semaforo · 2 banco · 3 marcha · 4 roda · 5 extintor · 6 carro · 7 triangulo · 8 cone · 9 chave · 10 estrada):

> 1. semaforo: traffic light, three lamps
> 2. banco: car seat, headrest and cushion
> 3. marcha: gear stick with round knob
> 4. roda: tire with hub
> 5. extintor: fire extinguisher with nozzle
> 6. carro: front view of a car
> 7. triangulo: warning triangle
> 8. cone: traffic cone
> 9. chave: key
> 10. estrada: road in perspective
>
> - Competing numbers: none. Each name has exactly one number.
> - Names by elimination: none, though 2 is the weakest read. "Banco" could also mean a bench or a bank, but the shape clearly reads as a car seat. I would have picked it without the process of elimination.
> - Letters or digits: I read none inside any icon. The only numerals are the captions under the icons.

Blind: 10 of 10. The reader says banco is the weakest read but "would have picked it without the process of elimination", so it does not count. The blind gate passes.

The craft read, a new reader, word for word:

> Defects per icon (from the sheet image):
>
> 1. banco: head and back join awkwardly (confused silhouette)
> 2. carro: none
> 3. chave: handle and bit weight mismatch (uneven weight)
> 4. cone: none
> 5. estrada: road stripes too small (detail too small)
> 6. extintor: nozzle and hose look disconnected (part floating)
> 7. marcha: base and stem join abruptly (kink)
> 8. roda: none
> 9. semaforo: lights cramped; base detached (part floating)
> 10. triangulo: inner triangle border thinner (uneven weight)
>
> Three weakest:
> 1. extintor: the black hose and nozzle bar is bulky and angled, and it reads as a separate part resting on the cylinder. The silhouette is hard to identify, and the black bar is much heavier than the thin body outline.
> 2. banco: the seat is a lumpy L whose headrest block floats on a narrow neck. The contour changes weight along its length, so it reads as a boot or a chair, not a car seat.
> 3. chave: the key's bow is large and thin-stroked while the shaft and bit are heavy, so the weight is uneven. The bit is cluttered at small size and the whole icon is hard to read.
>
> The semaforo and estrada icons are close behind. In both, the interior detail gets crowded at 24px.

Craft: 7 icons with a list defect: banco, chave, estrada, extintor (part floating, a body part), marcha, semaforo (base detached, a body part) and triangulo. Carro, cone and roda are "none". The gate (at most 6) fails by one icon, and the three rounds are spent.

#### After round 3

Measured with `node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-after/car --print`: `ok`, median ink 319.35 of 10. The answers are read 3's.

| icon | joins | infl | blind answer | craft answer |
| --- | --- | --- | --- | --- |
| banco | 16 smooth · 4 corners | 0 | car seat, headrest and cushion | head and back join awkwardly (confused silhouette) |
| carro | 14 smooth · 4 corners | 0 | front view of a car | none |
| chave | 3 smooth · 11 corners | 0 | key | handle and bit weight mismatch (uneven weight) |
| cone | 2 smooth · 9 corners | 0 | traffic cone | none |
| estrada | 0 smooth · 20 corners | 0 | road in perspective | road stripes too small (detail too small) |
| extintor | 2 smooth · 6 corners | 0 | fire extinguisher with nozzle | nozzle and hose look disconnected (part floating) |
| marcha | 0 smooth · 7 corners | 0 | gear stick with round knob | base and stem join abruptly (kink) |
| roda | 0 smooth · 2 corners | 0 | tire with hub | none |
| semaforo | 2 smooth · 2 corners | 0 | traffic light, three lamps | lights cramped; base detached (part floating) |
| triangulo | 10 smooth · 5 corners | 0 | warning triangle | inner triangle border thinner (uneven weight) |

Car totals, after beside before:

| | before | after |
| --- | --- | --- |
| kinks | 12 | 0 |
| double inflections (infl > 1) | 0 | 0 |
| blind score | 10 of 10 (the spec's "read 20 of 20") | 10 of 10, no elimination |
| craft score (icons with a list defect) | 6 of 10, read at 6bc79a7 (see "Both sets") | 7 of 10 |

Across the four craft reads, the count went 8, 8, 7, 7. Three icons are named in every read: extintor (the hose, then the horn), semaforo (the lamps, the stand) and banco (the headrest joint). Marcha's read-3 "kink" is the solid stem meeting the boot's arc. Check finds no kink there, since the two are separate elements.

### bakery

The ten bakery icons were redrawn from scratch with the kit in `docs/superpowers/baselines/2026-10-08-craft-after/bakery/`. Each keeps its name, object and format. Bodies are filled: a tone, then a shade over the lower or right part, then the contour at 2. A hole or glass is paper (#ffffff). Curves are convex cubics and arcs written by hand, so there is no kink and no inflection.

Scoring follows the controller's ruling:
- An icon fails the craft read when the reader names a defect from the prompt's list for it. The gate is at most 6 of 10.
- "Floating" said of a modifier alone does not count. A remark outside the list is recorded and not counted.
- The blind read must be 10 of 10, with no name won by elimination.

#### Read 1

Check: `ok`. No kink, and infl is 0 on every icon. Joins: batedor 8 smooth · 4 corners, bolo 8 · 5, croissant 5 · 4, farinha 4 · 9, forno 2 · 2, pao-de-forma 14 · 6, pao 5 · 2, rolo 8 · 2, rosquinha 0 · 2, trigo 28 · 0.

The blind read: a fresh reader was given `pretty-icons-blind.png` and the read.md blind prompt with N = 10. Its answer, word for word (key: 1 batedor · 2 pao-de-forma · 3 trigo · 4 rosquinha · 5 farinha · 6 rolo · 7 bolo · 8 croissant · 9 forno · 10 pao):

> Nenhum ícone tem letra ou dígito desenhado. Os números 1 a 10 são só as legendas abaixo de cada ícone. Dois números não disputam o mesmo nome, e nenhum número ficou com o nome só por sobra.
>
> 1 batedor: batedor de arame (fouet)
> 2 pao-de-forma: fatia de pão de forma
> 3 trigo: espiga de trigo
> 4 rosquinha: donut com furo
> 5 farinha: saco de farinha amarrado
> 6 rolo: rolo de massa inclinado
> 7 bolo: bolo com cobertura e cereja
> 8 croissant: croissant em meia-lua
> 9 forno: forno com visor e botões
> 10 pao: pão redondo com cortes
>
> O 8 é o mais fraco. Ele parece mais uma meia-lua com uma reentrância do que um croissant com camadas. Mesmo assim, croissant era o único nome restante que serve, e nenhum outro ícone o disputa.

Ten of ten. The reader says no name was won by elimination, but it calls 8 (croissant) the weakest and says croissant "era o único nome restante que serve". That is close to an elimination.

The craft read: a fresh reader was given `pretty-icons-sheet.png` and the craft prompt with N = 10. Its answer, word for word:

> Defects per icon, judged from the sheet image at the sizes shown. The list follows the sheet order:
>
> 1. batedor: tiny wire loops, crowded (detail too small to read)
> 2. bolo: scallop icing bumpy; tiny topper (detail too small to read)
> 3. croissant: confused silhouette; reads as a helmet
> 4. farinha: uneven weight; neck/tie detail muddy
> 5. forno: none (the dots are slightly small)
> 6. pao-de-forma: none (slice reads cleanly)
> 7. pao: none (the slash marks are a bit thin)
> 8. rolo: uneven weight; pin ends thin
> 9. rosquinha: sprinkles too small to read
> 10. trigo: thin grains, wobbly stem (uneven weight)
>
> Three weakest:
> 1. croissant. The shape isn't a croissant. It reads as a helmet or hood, because the inner curved lines and the pale wedge on the right don't describe crescent segments. The silhouette is confused, so the subject isn't recognisable.
> 2. batedor. The wire loops are the finest detail on the sheet, and they crowd together and turn muddy at the small sizes. The handle is also heavy against the thin wires, so the weight is uneven.
> 3. trigo (close call with rolo). It has the lightest, thinnest strokes on the sheet and a long diagonal stem, so it looks lighter than its neighbours. The grains are small and cluttered, and the stem looks slightly wobbly. It also uses a different, blue-dashed bounding box from the other icons.

Seven of ten named a defect from the list: batedor, bolo, croissant, farinha, rolo, rosquinha and trigo. The gate failed.

#### Round 1

These icons were redrawn:
- croissant: a new design in three pieces, a centre ellipse over two horns.
- batedor: two wide wires and the centre wire, inside a paper balloon, with a fuller handle.
- trigo: fewer, larger grains on grid-vector ellipses, with a shorter stalk.
- rolo: a wider barrel, round knobs and two bands.
- rosquinha: a paper hole and four longer sprinkles at 3.5.
- bolo: icing at three larger scallops, and a larger cherry.
- farinha: a fuller sack and a heavier tie at 3.5.

Forno, pao-de-forma and pao kept their drawing, apart from the pao-de-forma seam, which was inset to clear a gap.

Check: `ok`. No kink, infl 0 on every icon, median ink 355.07.

The blind read: a fresh reader, with the same prompt as read 1. Its answer, word for word (key: 1 croissant · 2 batedor · 3 rosquinha · 4 forno · 5 pao-de-forma · 6 farinha · 7 pao · 8 rolo · 9 trigo · 10 bolo):

> Readings from the image only:
>
> 1. croissant - crescent pastry
> 2. batedor - whisk with handle
> 3. rosquinha - ring donut, sprinkles
> 4. forno - oven front, window
> 5. pao-de-forma - sliced sandwich bread slice
> 6. farinha - tied flour sack
> 7. pao - round scored loaf
> 8. rolo - rolling pin
> 9. trigo - wheat ear stalk
> 10. bolo - cake with cherry
>
> Competing names: none. Each name has one clear fit, though 5 (pao-de-forma) and 7 (pao) are the closest pair. 5 is a sandwich-loaf slice, so it takes pao-de-forma. 7 is a round loaf, so it takes pao.
>
> Letters or digits inside any icon: none. The only digits are the caption numbers under the icons.
>
> Names taken only because the others are used up: none. Every number has a positive match.

Ten of ten, with no elimination.

The craft read: a fresh reader, with the same prompt as read 1. Its answer, word for word:

> Defects per icon (from the sheet image, at the large and 40px views):
>
> 1. batedor: handle joins whisk awkwardly (floating-ish)
> 2. bolo: cherry blob heavy, crowds top
> 3. croissant: confused silhouette, reads as a hat
> 4. farinha: none (the bag neck is slightly sharp)
> 5. forno: none (the knob dots are small)
> 6. pao-de-forma: none
> 7. pao: none (the slash marks are slightly uneven in length)
> 8. rolo: handle knobs float off body
> 9. rosquinha: sprinkles too small, uneven
> 10. trigo: uneven weight, thin stem
>
> Three weakest:
> - croissant (3): the silhouette is the most confused. The inner fold and the split shading read as a hat or helmet, not a croissant. It lacks the segmented crescent cue.
> - rosquinha (9): the sprinkles are small and scattered, so they read as noise at small sizes. The ring and hole are fine, but the detail is too fine for the weight.
> - rolo (8): the end knobs sit off the body as separate rings. The rolling pin also has a thin handle next to a heavy body, so the weight is uneven.
>
> Runners-up: trigo (thin stem and uneven stroke weight against the others) and batedor (the handle and whisk joint).
>
> This is based on viewing the sheet only. I ran no measurements.

Six of ten, counted conservatively: batedor, bolo, croissant, rolo, rosquinha and trigo.
- Batedor's "floating-ish" is said of the handle, a body part, so it counts.
- Rolo's "float off body" is said of the knobs, also body parts, so it counts.
- Bolo's "cherry blob heavy" is not in the list's words. It is counted as uneven weight. Read strictly, it would be outside the list, and the count would be 5.

The gate passes, at its limit. The croissant was named a confused silhouette in both reads.

#### The final set

| icon | joins | infl | blind answer | craft answer |
| --- | --- | --- | --- | --- |
| batedor | 7 smooth · 3 corners | 0 | whisk with handle | handle joins whisk awkwardly (floating-ish) |
| bolo | 8 smooth · 4 corners | 0 | cake with cherry | cherry blob heavy, crowds top |
| croissant | 7 smooth · 11 corners | 0 | crescent pastry | confused silhouette, reads as a hat |
| farinha | 4 smooth · 8 corners | 0 | tied flour sack | none |
| forno | 2 smooth · 2 corners | 0 | oven front, window | none |
| pao-de-forma | 14 smooth · 6 corners | 0 | sliced sandwich bread slice | none |
| pao | 5 smooth · 2 corners | 0 | round scored loaf | none |
| rolo | 12 smooth · 2 corners | 0 | rolling pin | handle knobs float off body |
| rosquinha | 0 smooth · 2 corners | 0 | ring donut, sprinkles | sprinkles too small, uneven |
| trigo | 20 smooth · 0 corners | 0 | wheat ear stalk | uneven weight, thin stem |

Check: `ok`, median ink 355.07 of 10.

| | before | after |
| --- | --- | --- |
| joins | 47 smooth · 54 corners · 3 kinks | 79 smooth · 40 corners · 0 kinks |
| inflections | 3 (all on rosquinha) | 0 |
| blind read | 20 of 20, per the spec | 10 of 10, no elimination |
| craft read | 7 of 10, read at 6bc79a7 (see "Both sets") | 6 of 10 named a defect (5 strict); gate ≤ 6 passes |

### Both sets

The before sets fail today's check on weight, so `sheet.mjs` refuses them on this branch. Their sheets were rendered with the skill as it stood at 6bc79a7, and each was read once for craft by a fresh reader with the same prompt and N = 10. The answers follow word for word.

#### Before, car (defect named for 6 of 10: banco, chave, extintor, roda, semaforo, triangulo; none: carro, cone, estrada, marcha)

1. banco: headrest floats off seat back
2. carro: none
3. chave: teeth too small to read
4. cone: none
5. estrada: none
6. extintor: hose/nozzle arc kinked, floating
7. marcha: none
8. roda: hub detail too small, muddy
9. semaforo: lights too small, thin-weight
10. triangulo: uneven weight, confused silhouette

Three weakest:
1. extintor: the hose and nozzle arc looks detached from the body and kinks. The silhouette is hard to identify.
2. triangulo: the outer shape is a rounded blob with uneven line weight. It reads as a warning triangle only through the inner triangle.
3. roda: the hub and spokes are tiny and muddy against the black disc. It reads as a plain black circle at small sizes. (banco and chave are close behind: the headrest floats, and the key teeth are too small.)

#### Before, bakery (defect named for 7 of 10: batedor, croissant, farinha, forno, rolo, rosquinha, trigo; none: bolo, pao-de-forma, pao)

1. batedor: handle slightly thin, loop uneven
2. bolo: none (icing scallops a bit busy)
3. croissant: confused silhouette, ribs unclear
4. farinha: tie/neck detail small, cluttered
5. forno: details too small to read
6. pao-de-forma: none (double outline slightly heavy)
7. pao: none
8. rolo: part floating off body (handle knobs)
9. rosquinha: center detail too small, busy
10. trigo: uneven weight, thin leaves

Three weakest:
- rosquinha (9): the icing and hole at the center are tiny and busy, and the dark ring plus the double concentric outline make it read as a button or record, not a donut.
- croissant (3): the silhouette is an arch or helmet, not a croissant, and the thin inner ribs are faint.
- rolo (8): the end knobs and the handle look detached from the body, and the pin reads as a diagonal tool or pencil.

forno (5) is close behind: its tiny dots and bar are hard to read at small sizes.

#### Totals

| | before | after |
| --- | --- | --- |
| kinks | 15 (car 12, bakery 3) | 0 |
| double inflections | 3 (rosquinha) | 0 |
| blind read | 20 of 20 | 20 of 20, no elimination |
| craft read (icons with a list defect) | 13 of 20 (car 6, bakery 7) | 13 of 20 (car 7, bakery 6; 12 with bolo read strictly) |

The calibrated gate is at most 12 of 20. The after is at 13, one over, and it is no lower than the before. The craft read does not separate the two sets. With one reader per set, its count moves about ±15% between reads. The geometry does separate them: every kink and every double inflection is gone, and the blind read holds at 20 of 20 with no elimination. The icons the readers name in every round are extintor, semaforo and banco in the car set, and croissant in the bakery set.

## The trial
