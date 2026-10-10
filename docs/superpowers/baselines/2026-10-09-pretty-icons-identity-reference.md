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

Pending: run by the controller after this commit.
