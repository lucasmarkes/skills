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
| craft score (icons with a list defect) | not read: `sheet.mjs` refuses the before set, which fails check on weight | 7 of 10 |

Across the four craft reads, the count went 8, 8, 7, 7. Three icons are named in every read: extintor (the hose, then the horn), semaforo (the lamps, the stand) and banco (the headrest joint). Marcha's read-3 "kink" is the solid stem meeting the boot's arc. Check finds no kink there, since the two are separate elements.

## The trial
