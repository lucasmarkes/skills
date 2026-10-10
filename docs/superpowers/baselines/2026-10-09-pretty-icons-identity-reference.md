# pretty-icons identity: reference

Spec: `docs/superpowers/specs/2026-10-09-pretty-icons-identity-design.md` · Plan: `docs/superpowers/plans/2026-10-09-pretty-icons-identity.md`

## examples/garage

```
┌─────────┬──────────────────┬──────┬──────┬───────┬───────┬─────────────┬────────┬───────┬───────┬───────┬─────────────────────────┬──────┐
│ (index) │ icon             │ x0   │ y0   │ w     │ h     │ keyline     │ ink    │ dx    │ dy    │ line% │ joins                   │ infl │
├─────────┼──────────────────┼──────┼──────┼───────┼───────┼─────────────┼────────┼───────┼───────┼───────┼─────────────────────────┼──────┤
│ 0       │ 'battery'        │ 4    │ 8    │ 40    │ 32.25 │ 'landscape' │ 321.07 │ 0     │ 1.55  │ 27    │ '2 smooth · 0 corners'  │ 0    │
│ 1       │ 'car'            │ 4    │ 9    │ 40    │ 31.25 │ 'landscape' │ 335.51 │ 0     │ 1.82  │ 38    │ '8 smooth · 6 corners'  │ 0    │
│ 2       │ 'fuel'           │ 8.75 │ 4    │ 31.25 │ 40    │ 'portrait'  │ 345.22 │ -2.02 │ -0.61 │ 35    │ '8 smooth · 6 corners'  │ 0    │
│ 3       │ 'gearshift'      │ 8    │ 4    │ 32    │ 39.75 │ 'portrait'  │ 356.65 │ 0     │ 0.93  │ 39    │ '0 smooth · 2 corners'  │ 0    │
│ 4       │ 'oil'            │ 8    │ 4.25 │ 32    │ 39.75 │ 'portrait'  │ 307.59 │ 0     │ 2.39  │ 28    │ '15 smooth · 3 corners' │ 0    │
│ 5       │ 'speedometer'    │ 4    │ 8    │ 40    │ 32    │ 'landscape' │ 278.32 │ 0     │ 1.68  │ 28    │ '7 smooth · 2 corners'  │ 0    │
│ 6       │ 'steering-wheel' │ 4.5  │ 4.5  │ 39    │ 39    │ 'circle'    │ 386    │ 0     │ 0     │ 34    │ '0 smooth · 14 corners' │ 0    │
│ 7       │ 'traffic-light'  │ 8    │ 4    │ 32    │ 40    │ 'portrait'  │ 386.1  │ 0     │ 0     │ 40    │ '6 smooth · 6 corners'  │ 0    │
│ 8       │ 'tyre'           │ 4    │ 4    │ 40    │ 40    │ 'circle'    │ 391.29 │ 0     │ 0     │ 33    │ '0 smooth · 2 corners'  │ 0    │
│ 9       │ 'wrench'         │ 5.78 │ 5.53 │ 36.69 │ 36.69 │ 'square'    │ 289.26 │ 0.12  │ -0.12 │ 44    │ '6 smooth · 8 corners'  │ 0    │
└─────────┴──────────────────┴──────┴──────┴───────┴───────┴─────────────┴────────┴───────┴───────┴───────┴─────────────────────────┴──────┘
ok
```

What changed, per icon: tyre (a ring from the kit, hole 10; was a bar at 3.5 with a core), steering-wheel (a disc with a paper face; a ring weighed 529), gearshift (the gate at 1.5; was 3.5), speedometer (the needle's hub a dot r 2; was r 3.25 in the line tone), traffic-light (paper lenses and a dot), battery, car, oil (their line-tone parts in the shade tone). `REFERENCE_INK[48]` 341.3 → 328.3.

Redrawn after the round-1 craft read (8 of 10 named), each for the defect the reader named: tyre ("tiny lug dots, uneven highlight": the five lug dots and the two mark arcs dropped; the kit's ring with hole 8 and one hub dot of r 2.5, so the rubber reads fat and nothing on it is tiny); traffic-light ("side tabs too thin/small": the four one-line brackets became two side panels, one shape in the shade tone, 5 wide, each ending on the housing's straight side); gearshift ("floating knob, thin stem": the stem a pill 5 wide in the shade tone, run from inside the knob into the base, so the knob sits on it; the gate drawn larger, 13 wide); speedometer ("ticks too small, uneven": the three ticks 7 long, all from r 10 to r 17 about the hub; were 5.25, at uneven radii); steering-wheel ("spokes crowd hub; detail too small": the hub a shade disc of r 4, the spokes ending on its edge; the face r 11, so the weight stays in band); fuel ("detail too small (hose/panel)": the grey panel line dropped). `REFERENCE_INK[48]` 328.3 → 334.6, the new median.

Redrawn after the round-2 reads (blind FAIL: tyre named only by elimination; set FAIL: wrench, speedometer), each for what the reader said: tyre ("a record, a disc or a target"; "concentric circles, no tread or sidewall": drawn three-quarter, the face an ellipse 11 by 19 with a paper hub and one dot, the tread a band in the shade tone with five grooves across it, so it is a tyre and not a wheel or a disc; portrait now, ink 391.17); wrench ("lighter stroke, lacks the gray base fill"; "jaw curve kinked": a wider body, the handle 11.3 across and the head r 11.5, the lower-right half in the shade tone from jaw to tail, the jaw bottom and the tail one cubic each, tangent to their sides, and a ring hole at the tail; ink 260.13 → 289.26); speedometer ("ticks faint, uneven weight": the three ticks in the line tone, not the mark, all from r 9.25 to r 16.25 about the hub); fuel ("hose and nozzle a blank rounded block; pump alone would read as a phone": the closed hose loop dropped; a hose out of the pump's foot, turned up its side into a nozzle, one shape in the shade tone, its spout toward the pump). `REFERENCE_INK[48]` 334.6 → 339.6, the new median.

Redrawn after the round-3 reads (blind PASS 10 of 10; craft PASS 3 of 10; set FAIL: steering-wheel, tyre), each for what the reader said: tyre ("drawn in a 3/4 perspective with ribbed tread, where the others are flat front-on"; "tread ribs on the right with a flat left face read as a drum or roller": front-on again, a disc r 19 of thick rubber round a small paper rim r 9 and one hub dot, twelve tread grooves in the line tone cut slanted into the outer edge, from r 19.25 to r 16, 12° off the radius and turned 15° off the clock's hours, so they read as tread and not as ticks or gear teeth; the shade a crescent along the lower edge; circle now, ink 391.29); steering-wheel ("flat spokes, heavier fill"; "its lower half is a solid grey fill and it has a double ring": the paper face split into three openings by the spokes, so there is no inner ring, the spokes are part of the rim's body and widen into a hub pad round the horn dot; the shade a crescent along the lower rim, not the lower half; the rim r 18.5; ink 404.88 → 386, from +21% to +13% of the reference); fuel ("nozzle floats off pump body": the nozzle's spout run on to the pump's side, its tip on the contour's centreline at 30.75, 13, so hose, nozzle and pump are one object). R8: a tick or tread that names the object (a gauge's scale, a tyre's tread) takes the line tone; the mark tone stays for secondary marks, rules-filled.md's role and tone tables and its rule for what is printed amended. `REFERENCE_INK[48]` 339.6 → 340.4, the new median.

### Reads

Each round used three new readers who had seen none of the icons. The prompts, sent word for word:

- Blind: `read.md` "## How" on `pretty-icons-blind.png`, N = 10, names in alphabetical order (battery, car, fuel, gearshift, oil, speedometer, steering-wheel, traffic-light, tyre, wrench).
- Craft: `read.md` "## The craft read" on `pretty-icons-sheet.png`, N = 10, numbered in the sheet's alphabetical order.
- Set: "These 10 icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does." on `pretty-icons-sheet.png`.

| round | drawing | blind | craft | set |
| --- | --- | --- | --- | --- |
| 1 | ba8ef08 | pass | FAIL 8/10 | pass |
| 2 | 7acd710 | FAIL (tyre by elimination) | pass 6/10 | FAIL (wrench; speedometer, hedged) |
| 3 | 35de5ac | pass | pass 3/10 | FAIL (steering-wheel, tyre) |
| 4 | d9becb4 | pass | pass 4/10 | FAIL (wrench, tyre) |

Left for the person: the set read did not pass after round 1. The wrench ("no grey fill band", "thinner stroke") and the tyre (its tread, in every form tried) are the recurring outliers. The redraws stopped after round 4 by the controller's ruling; the blind and craft reads pass on the committed drawing.

#### Round 1 (ba8ef08)

Sheet seed 649786535; key: 1 fuel · 2 battery · 3 car · 4 speedometer · 5 wrench · 6 traffic-light · 7 gearshift · 8 oil · 9 tyre · 10 steering-wheel

##### Set read (pretty-icons-sheet.png)
Prompt: "These 10 icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does."
Answer (verbatim): "Wrench: no gray fill band."
Verdict: pass (one icon named).

##### Craft read (pretty-icons-sheet.png; numbered 1 battery, 2 car, 3 fuel, 4 gearshift, 5 oil, 6 speedometer, 7 steering-wheel, 8 traffic-light, 9 tyre, 10 wrench)
Prompt: read.md "## The craft read", N = 10.
Answer (verbatim):
1 battery: none
2 car: roof/window shape slightly confused
3 fuel: detail too small (hose/panel)
4 gearshift: floating knob, thin stem
5 oil: none
6 speedometer: ticks too small, uneven
7 steering-wheel: spokes crowd hub; detail too small
8 traffic-light: side tabs too thin/small
9 tyre: tiny lug dots, uneven highlight
10 wrench: head silhouette slightly confused
Three weakest: 1. Tyre (9): small-size legibility fails; the lug dots and the highlight arc become noise, fill heavier than others. 2. Traffic-light (8): side tabs and small ring circles go thin and spiky at small size; fussy next to heavy-outlined icons. 3. Gearshift (4): knob on a thin stem above a flat base looks disconnected; the H-pattern is tiny. Runners-up: speedometer (tick marks), steering-wheel (crowded hub).
Verdict: FAIL — 8 of 10 named with a listed defect (pass is at most 6).

##### Blind read (pretty-icons-blind.png)
Prompt: read.md "## How", N = 10, names: battery, car, fuel, gearshift, oil, speedometer, steering-wheel, traffic-light, tyre, wrench.
Answer (verbatim):
Each number gets its own name, and no two compete for one. No name was assigned only because the others were taken.
1. fuel: fuel pump, nozzle at the side
2. battery: battery with terminals, plus and minus signs
3. car: small side-view car
4. speedometer: dial gauge with needle
5. wrench: open-end spanner
6. traffic-light: three-lamp signal
7. gearshift: shift knob with H-pattern, on a base
8. oil: oil can with a drop
9. tyre: wheel with tread and hub
10. steering-wheel: wheel with spokes and a hub
I read no letter or digit. Two things came close: Icon 2: the plus and minus marks are symbols, not letters or digits. Icon 7: the shift-pattern lines on the knob form an H-like grid. It reads as a gear pattern, not a letter, but it is the closest thing to one.
Verdict: pass — 10 of 10 against the key, no elimination.

#### Round 2 (7acd710)

Sheet seed 650692174; blind key: 1 wrench · 2 battery · 3 steering-wheel · 4 fuel · 5 tyre · 6 gearshift · 7 car · 8 speedometer · 9 oil · 10 traffic-light

##### Set read (pretty-icons-sheet.png)
Prompt: as round 1.
Answer (verbatim):
Outliers: wrench (thin, no bottom fill). Possibly speedometer (thinner needle and ticks). Everything else looks like one set.
Wrench: lighter stroke, lacks the gray base fill the other icons have.
Speedometer: weaker, borderline mismatch; only the needle and ticks are lighter.
Verdict: FAIL by ruling R6 — two named (wrench firm, speedometer hedged).

##### Blind read (pretty-icons-blind.png)
Prompt: as round 1.
Answer (verbatim):
1. wrench. Open-end spanner.
2. battery. Battery with + and - terminals.
3. steering-wheel. Round wheel with three spokes. It competes with 5 for "tyre". I picked 3 as the steering wheel because of its spokes and hub ring.
4. fuel. Fuel pump with a window.
5. tyre. A disc with a centre hub. I named it tyre only because the other names are taken. Without the list I would have said a record, a disc or a target.
6. gearshift. Gear knob with an H pattern, on a base.
7. car. Small sedan, side view.
8. speedometer. Half-round gauge with a needle.
9. oil. Can with a drop.
10. traffic-light. Three-lamp signal.
Competing names: 3 and 5 both pull toward "tyre". 3 reads as a wheel and could be a tyre or a steering wheel. 5 reads as a tyre only by elimination.
Letters or digits: none. The H pattern on 6 reads as a shift pattern. The + and - on 2 read as terminal signs.
Name got only by elimination: 5 (tyre).
Verdict: FAIL — 10/10 against the key, but tyre named by elimination (3 and 5 compete).

##### Craft read (pretty-icons-sheet.png; numbered alphabetically)
Prompt: as round 1.
Answer (verbatim):
1. battery: none
2. car: none
3. fuel: hose reads as plain block
4. gearshift: none
5. oil: none
6. speedometer: ticks faint, uneven weight
7. steering-wheel: hub and spokes slightly confused
8. traffic-light: lamps small, side bumps muddy
9. tyre: confused silhouette, reads as disc
10. wrench: thinner weight, jaw curve kinked
Three weakest: 9 tyre (concentric circles, no tread or sidewall, reads as a record or disc); 10 wrench (strokes look lighter, open-jaw curve has a slight kink); 3 fuel (hose and nozzle a blank rounded block; pump alone would read as a phone).
Verdict: pass — 6 of 10 named with a listed defect (pass is at most 6).

#### Round 3 (35de5ac)

Sheet seed 651876911; blind key: 1 oil · 2 gearshift · 3 tyre · 4 car · 5 battery · 6 speedometer · 7 steering-wheel · 8 wrench · 9 traffic-light · 10 fuel

##### Set read (pretty-icons-sheet.png)
Prompt: as round 1.
Answer (verbatim):
Steering-wheel: flat spokes, heavier fill. Tyre: different perspective, ribbed tread.
Everything else (battery, car, fuel, gearshift, oil, speedometer, traffic-light, wrench) looks consistent: same outline weight, same grey base fill, same rounded style.
Steering-wheel is the clearest outlier. Its lower half is a solid grey fill and it has a double ring. Tyre is a milder case: it is drawn in a 3/4 perspective with ribbed tread, where the others are flat front-on.
Verdict: FAIL — two named (steering-wheel, tyre).

##### Blind read (pretty-icons-blind.png)
Prompt: as round 1.
Answer (verbatim):
1 oil: oil bottle with drop
2 gearshift: gear stick with shift pattern
3 tyre: tyre, angled view with tread
4 car: small cartoon car, side view
5 battery: car battery with plus and minus
6 speedometer: dial gauge with needle
7 steering-wheel: steering wheel, front view
8 wrench: open-end wrench
9 traffic-light: traffic light, three lamps
10 fuel: fuel pump with nozzle
Competing names: none.
Letters or digits: none. The + and - on 5 are symbols, not a letter or digit.
Names got by elimination: none. I would have named every icon without the list. Minor note: 7 could pass for a wheel or tyre, but 3 reads clearly as a tyre, so 7 takes steering-wheel.
Verdict: pass — 10/10 against the key, no elimination.

##### Craft read (pretty-icons-sheet.png; numbered alphabetically)
Prompt: as round 1.
Answer (verbatim):
1 battery: none
2 car: none
3 fuel: nozzle floats off pump body
4 gearshift: none
5 oil: none
6 speedometer: none
7 steering-wheel: none
8 traffic-light: side bumps confuse silhouette
9 tyre: confused silhouette, tread ribs ambiguous
10 wrench: none
Three weakest: tyre (tread ribs on the right with a flat left face read as a drum or roller; perspective inconsistent); fuel (nozzle and hose sit apart from the pump body); traffic-light (side bumps blur the outline into a capsule; lamps tight).
Verdict: pass — 3 of 10 named with a listed defect (pass is at most 6).

#### Round 4 (d9becb4)

Sheet seed 652918599; blind key: 1 steering-wheel · 2 wrench · 3 fuel · 4 oil · 5 traffic-light · 6 battery · 7 speedometer · 8 car · 9 gearshift · 10 tyre

##### Blind read (pretty-icons-blind.png)
Prompt: as round 1.
Answer (verbatim):
1. steering-wheel: round wheel with hub, spokes
2. wrench: open-end spanner
3. fuel: fuel pump with nozzle
4. oil: bottle with a drop
5. traffic-light: vertical three-light signal
6. battery: car battery, plus/minus terminals
7. speedometer: semicircle gauge with needle
8. car: small side-view car
9. gearshift: shift knob with H pattern
10. tyre: tire with hub
No two numbers compete for one name. None of the names was assigned by elimination.
Letters and digits: none read as letters or digits. The "+" and "−" on 6 are battery polarity marks, and the H-pattern on 9 is a shift gate, so neither is a letter. (6 and 9 flagged borderline; neither read as a badge.)
Notes: 3 a fuel pump, not a kiosk; 4 the drop could read as "liquid" or "water" before "oil"; 5 a side bump on each side, slightly ambiguous, still a traffic light.
Verdict: pass — 10/10 against the key, no elimination.

##### Set read (pretty-icons-sheet.png)
Prompt: as round 1.
Answer (verbatim):
wrench: no bottom-band shading, thinner stroke.
tyre: busy serrated tread, finer detail.
The other eight look like one set.
Verdict: FAIL — two named (wrench, tyre).

##### Craft read (pretty-icons-sheet.png; numbered alphabetically)
Prompt: as round 1.
Answer (verbatim):
1. battery: none
2. car: none
3. fuel: nozzle detached from pump body
4. gearshift: none
5. oil: none
6. speedometer: none
7. steering-wheel: spokes slightly cramped, busy
8. traffic-light: side clamps read oddly
9. tyre: tread teeth uneven, busy
10. wrench: none
Three weakest: tyre (tread teeth small and busy, weight uneven around the rim); steering-wheel (inner spokes cramped, detail small); fuel (nozzle sits as a separate wedge beside the pump body).
Verdict: pass — 4 of 10 named with a listed defect (pass is at most 6).
