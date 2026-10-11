# pretty-icons polish: reference

Spec: `docs/superpowers/specs/2026-10-11-pretty-icons-polish-design.md` · Plan: `docs/superpowers/plans/2026-10-11-pretty-icons-polish.md`

## examples/hairline

The final drawing is 384cbf8. coding, interfaces and machines carry a dot, so they are out of the median.

```
┌─────────┬────────────────┬──────┬──────┬───────┬───────┬─────────────┬───────┬───────┬───────┬─────────────────────────┬──────┐
│ (index) │ icon           │ x0   │ y0   │ w     │ h     │ keyline     │ ink   │ dx    │ dy    │ joins                   │ infl │
├─────────┼────────────────┼──────┼──────┼───────┼───────┼─────────────┼───────┼───────┼───────┼─────────────────────────┼──────┤
│ 0       │ 'all'          │ 1.75 │ 1.75 │ 12.5  │ 12.5  │ 'square'    │ 64.08 │ 0     │ 0     │ '8 smooth · 0 corners'  │ 0    │
│ 1       │ 'coding'       │ 1    │ 2.5  │ 14    │ 11    │ 'landscape' │ 73.74 │ -0.33 │ -0.29 │ '6 smooth · 6 corners'  │ 0    │
│ 2       │ 'connectivity' │ 1.06 │ 1.06 │ 13.88 │ 13.88 │ 'circle'    │ 59.65 │ 0     │ 0     │ '8 smooth · 0 corners'  │ 0    │
│ 3       │ 'data'         │ 1.75 │ 1.75 │ 12.5  │ 12.5  │ 'square'    │ 72.46 │ 0     │ 0.04  │ '4 smooth · 0 corners'  │ 0    │
│ 4       │ 'devices'      │ 2.5  │ 1    │ 11    │ 14    │ 'portrait'  │ 70.14 │ 0     │ 0.05  │ '0 smooth · 0 corners'  │ 0    │
│ 5       │ 'empty'        │ 1.75 │ 1.75 │ 12.5  │ 12.5  │ 'square'    │ 65.33 │ 0     │ 0     │ '0 smooth · 0 corners'  │ 0    │
│ 6       │ 'interfaces'   │ 1.75 │ 1.75 │ 12.5  │ 12.5  │ 'square'    │ 73.78 │ -0.28 │ -0.28 │ '6 smooth · 4 corners'  │ 0    │
│ 7       │ 'machines'     │ 1.75 │ 1.25 │ 12.5  │ 12    │ 'square'    │ 58.27 │ -0.3  │ -0.2  │ '10 smooth · 0 corners' │ 0    │
│ 8       │ 'marks'        │ 2.75 │ 1.25 │ 10.5  │ 13.5  │ 'portrait'  │ 60.54 │ 0     │ -0.24 │ '4 smooth · 3 corners'  │ 0    │
│ 9       │ 'security'     │ 2.5  │ 1    │ 11    │ 14    │ 'portrait'  │ 57.78 │ 0.01  │ -0.4  │ '0 smooth · 5 corners'  │ 0    │
└─────────┴────────────────┴──────┴──────┴───────┴───────┴─────────────┴───────┴───────┴───────┴─────────────────────────┴──────┘
ok
```

What changed, per icon (round 1 in d0d9d3a, round 2 in 94052a4, round 3 in 384cbf8):

- **all:** two paths of two circles each (r 2.25, 2.5 apart). It was a square with a floating plus and a dot. The plus read "add", and loose refuses a cross through cells, so the metaphor changed to four round cells. Unchanged since round 1. Ink 64.08, the median.
- **coding:**
  - round 1: braces kept, now in a body, not a bare `</>`; it takes a dot so that three examples stay modified;
  - round 2 ("the braces are tiny inside the frame. The status dot sits detached"): the window grows from 12.5 x 9.5 to 13 x 10, filling the landscape keyline. The braces grow from 4 to 5 tall and from 6.5 to 7.5 wide, as far as the cut contour allows (2.5 from it, rule 11). Ink 73.74, modified.
- **connectivity:**
  - round 1: kept, two nodes, a link and a dot;
  - round 2 ("the dot floats away and the link line is thin and awkward"): the dot is gone; the nodes go from r 3 to r 3.25;
  - round 3 ("read as a chain or a slider rather than a clear link; the line meets the rings awkwardly, lightest ink in the set"): two interlocking links, two stadium bodies on the diagonal, crossing through each other's middle. Their round ends are cubics on the quarter grid, because the badge:plus cut rewrites an arc at its radius, 2.83, off the grid. Ink 59.65, was 57.01 (52.23 in round 1).
- **data:**
  - round 1: kept;
  - round 2 ("detail too small (single band)"): two bands, the lid's rim and the middle, in one path of two arcs, each 1 stroke inside the walls. Ink 72.46, was 66.58.
- **devices:**
  - round 1: the body is now 10 wide (rect x 3 y 1.5, 10 x 13), with a home bar `M7 12h2`;
  - round 2: it took a dot, for examples.test's three modified icons;
  - round 3 ("A tall rounded device with a small slot or line and a corner dot … tablet, phone or appliance", named by elimination; "the tiny home-bar dash is barely readable … could be confused with the plain 'empty' rectangle"): the dot is gone. The home bar is now `M6.5 12h3`, and a speaker `M7 4h2` sits at the top, both 2.5 from the edge. Ink 70.14.
- **empty:** kept, an empty tinted square, the body alone. Ink 65.33.
- **interfaces:**
  - round 1: kept, an open window and a filled pointer;
  - round 2 ("the cursor arrow overlaps the broken frame corner … thin cursor strokes against a heavy frame"): the window is closed, with the cursor inside it, loose, and a dot in its corner;
  - round 3 ("cursor weight uneven … biggest mass offset, looks off-centre"): the cursor is an outline, `M5.5 5.5 11.25 8.5 9 9 8.5 11.25Z`, and the window's tone is the one fill. A filled cursor on a toned window fails the counter, at 1.7. The cursor reaches 11.25, as far as the cut contour allows (at 11.75 it fails gap, 1 apart). Mass -0.28, -0.28, was -0.58, -0.55. Ink 73.78, modified.
- **machines:**
  - round 1: kept, a body, an antenna and a screen, with a dot;
  - round 2 ("robot face, antenna, inner slot and badge dot are crammed into a 12x12 box"): the dot is gone; the body is 11.5 wide, and the slot is a visor;
  - round 3 ("A small handheld radio or remote with antenna and a screen", named devices; "antenna and inner slot tiny"): a robot head 11.5 x 9 under the antenna `M8 3.75V1.75`, with a face of two eyes. The eyes are one filled path of two r 0.5 discs, because eye strokes would put the details over the cap of 2 subpaths. A status dot is the third modifier, as a machine's running or power light. Ink 58.27, modified.
- **marks:** kept, a bookmark, a body alone. Ink 60.54.
- **security:** the shield redrawn in 5 commands, `M8 1.5 13 3.25C13 10 11.5 13 8 14.5 4.5 13 3 10 3 3.25Z` (it was 9 and refused the slash), with the check `M6.25 8.75l1.5 1.5L10 7.75`, larger and lower for gravity. Ink 57.78.

## examples/garage

The final drawing is d0d9d3a. The shadow is **off**: the shadow read picked the unshadowed sheet, and `shadow.mjs --off` changed no files.

```
┌─────────┬──────────────────┬──────┬──────┬───────┬───────┬─────────────┬────────┬───────┬───────┬───────┬─────────────────────────┬──────┐
│ (index) │ icon             │ x0   │ y0   │ w     │ h     │ keyline     │ ink    │ dx    │ dy    │ line% │ joins                   │ infl │
├─────────┼──────────────────┼──────┼──────┼───────┼───────┼─────────────┼────────┼───────┼───────┼───────┼─────────────────────────┼──────┤
│ 0       │ 'battery'        │ 4    │ 8    │ 40    │ 32.25 │ 'landscape' │ 321.07 │ 0     │ 1.55  │ 26.9  │ '2 smooth · 0 corners'  │ 0    │
│ 1       │ 'car'            │ 4    │ 9    │ 40    │ 32.25 │ 'landscape' │ 348.86 │ 0     │ 2.28  │ 37.2  │ '8 smooth · 6 corners'  │ 0    │
│ 2       │ 'fuel'           │ 8.75 │ 4    │ 31.25 │ 40    │ 'portrait'  │ 345.22 │ -2.02 │ -0.61 │ 34.7  │ '8 smooth · 6 corners'  │ 0    │
│ 3       │ 'gearshift'      │ 8    │ 4    │ 32    │ 39.75 │ 'portrait'  │ 355.91 │ 0     │ 0.93  │ 39.4  │ '0 smooth · 2 corners'  │ 0    │
│ 4       │ 'oil'            │ 8    │ 4.25 │ 32    │ 39.75 │ 'portrait'  │ 307.59 │ 0     │ 2.39  │ 28.2  │ '15 smooth · 3 corners' │ 0    │
│ 5       │ 'speedometer'    │ 4    │ 8    │ 40    │ 32    │ 'landscape' │ 270.16 │ 0     │ 1.68  │ 26.9  │ '7 smooth · 2 corners'  │ 0    │
│ 6       │ 'steering-wheel' │ 4.5  │ 4.5  │ 39    │ 39    │ 'circle'    │ 386.04 │ 0     │ 0     │ 33.8  │ '0 smooth · 14 corners' │ 0    │
│ 7       │ 'traffic-light'  │ 8    │ 4    │ 32    │ 40    │ 'portrait'  │ 371.99 │ 0     │ 0     │ 37.4  │ '6 smooth · 6 corners'  │ 0    │
│ 8       │ 'tyre'           │ 4    │ 4    │ 40    │ 40    │ 'circle'    │ 386.15 │ 0     │ 0     │ 32.1  │ '0 smooth · 2 corners'  │ 0    │
│ 9       │ 'wrench'         │ 5.78 │ 5.53 │ 36.69 │ 36.69 │ 'square'    │ 265.75 │ 0.12  │ -0.12 │ 40.6  │ '6 smooth · 8 corners'  │ 0    │
└─────────┴──────────────────┴──────┴──────┴───────┴───────┴─────────────┴────────┴───────┴───────┴───────┴─────────────────────────┴──────┘
ok
```

What changed, per icon:

- **car:** the body is kept; the wheels are r 5 (they were r 4), with a hub dot of r 1.5 in each and 2.75 of air around the hub. Ink 349, was 330.
- **tyre:** the body is kept (r 19, a paper hole of r 9, a hub dot). The tread is ten short dashes at 50 degrees, in two paths of five, 2.3 clear of the contour and 2.4 of the hole. Before, there were twelve floating ticks. Ink 386, was 408.
- **wrench:** the body is kept and the hole is dropped. At r 2.25 it sits 1.66 from the handle's edge (rule 11), and at r 1.5 it is a speck. It is on the diagonal, lower left to upper right, the only one of at most 3 (ratio 1.95). Ink 266.
- **traffic-light:** kept as the worked example, with seven elements: the top lens lit in paper and the lower two in shade. Ink 372.
- **Kept:** battery (cased body, two terminals, plus and minus), fuel (pump, window, the hose to the nozzle on the pump's side), gearshift (a knob with its H gate, the stem through the knob, a base pill), oil (can, cap, drop), speedometer (dome dial, three ticks, the needle on its hub), steering-wheel (rim, hub and three spokes).

## Reads

Every reader was a new agent with nothing but its images and its prompt. The "before" of every ranking read is the blind sheet of the drawing at 8d41531, at seed 11. The prompts, sent word for word:

- **Blind:** `read.md` "## How", on `pretty-icons-blind.png`, with N = 10 and the names in alphabetical order (hairline: all, coding, connectivity, data, devices, empty, interfaces, machines, marks, security; garage: battery, car, fuel, gearshift, oil, speedometer, steering-wheel, traffic-light, tyre, wrench): "This image shows N numbered icons from one app. Below are N names in alphabetical order: <names>. Read no file but the image. For each number, say the name it stands for and, in five words or fewer, the object you see. If two numbers compete for one name, say so. If you read a letter or a digit anywhere, name the icon. If a number gets its name only because the other names are taken, say so."
- **Craft:** `read.md` "## The craft read", on `pretty-icons-sheet.png`, N = 10, numbered in the sheet's alphabetical order: "These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why."
- **Set:** `read.md` "## The set read", on `pretty-icons-sheet.png`, N = 10: "These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does."
- **Ranking:** three readers, one pair each, `r<R>-rank-<set>-<i>-A.png` and `-B.png`: "These are two sets of 10 icons, A and B, drawn for the same app. Which set is better drawn, as a set, A or B? Answer with the letter and, in five words or fewer, why."
- **Shadow (garage):** `read.md` "## The shadow read", on `pretty-icons-shadow-A.png` and `-B.png`, N = 10: "These are two versions of one set of N icons, A and B. Which set looks better as a set, A or B? Answer with the letter and, in five words or fewer, why."

The gate for a set is blind and ranking. Craft and set are read and recorded every round. A craft count names the icons with a defect from the prompt's list. "Floating" said of the modifier alone is not counted, as `read.md` says.

| round | set | drawing commit | blind | craft | set | ranking (new picked k of 3) | shadow | result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | hairline | d0d9d3a | pass 10/10 | 4 of 10 (connectivity, data, interfaces, machines) | one set | 0 of 3 | — | **fail** |
| 1 | garage | d0d9d3a | pass 10/10 | 8 of 10 | one set | 2 of 3 | off (B, "Cleaner, no drop shadows.") | **pass** |
| 2 | hairline | 94052a4 | FAIL (machines↔devices swapped, devices's name by elimination) | 4 of 10 (connectivity, devices, interfaces, machines) | one set | 2 of 3 | — | **fail** |
| 3 | hairline | 384cbf8 | 10/10, with the `all` note | 4 of 10 (coding, connectivity, devices, machines) | one set | 3 of 3 | — | **passed by the person's decision** |

### Round 1 (d0d9d3a), seed 7919

#### hairline

Blind key: 1 devices · 2 connectivity · 3 marks · 4 all · 5 machines · 6 coding · 7 empty · 8 data · 9 security · 10 interfaces. Ranking letters: read 1 A=new B=old, read 2 A=old B=new, read 3 A=new B=old.

##### Blind read
Answer (verbatim):
1. devices: a tablet or phone
2. connectivity: a chain link with a dot
3. marks: a bookmark ribbon
4. all: four circles in a grid
5. machines: a small robot with an antenna and a dot
6. coding: a code-bracket screen with a dot
7. empty: a plain blank square
8. data: a database cylinder
9. security: a shield with a checkmark
10. interfaces: a cursor arrow on a square
No two numbers compete for one name. No icon has a letter or digit in it; the only digits are the caption labels under each icon. Icon 6 shows "</>"-style bracket marks, which I read as code symbols and not letters.
No number got its name only because the other names were taken, though 5 (machines) and 1 (devices) are the least certain. Icon 7 (empty) also fits only loosely, since a blank square could be "empty" or a generic placeholder.

Verdict: pass. All 10 of 10 match the key, none by elimination.

##### Craft read
Answer (verbatim):
1 all: none (slightly small circles)
2 coding: badge dot floats off body
3 connectivity: thin link line, dot floats
4 data: detail too small (single band)
5 devices: none (home bar tiny)
6 empty: none
7 interfaces: confused silhouette (cursor overlaps frame gap)
8 machines: detail too small, dot floats
9 marks: none
10 security: none (check slightly small)
Three weakest:
1. machines (8): robot face, antenna, inner slot and badge dot are crammed into a 12x12 box. At list size it reads as a blob, and the dot floats off the body.
2. coding (2): the braces are tiny inside the frame. The status dot sits detached at the corner and looks added on, not part of the shape.
3. interfaces (7): the cursor arrow overlaps the broken frame corner. The silhouette is ambiguous and the weight is uneven, with thin cursor strokes against a heavy frame. Connectivity (3) is close behind: the dot floats away and the link line is thin and awkward.

Verdict: recorded, not gating. 4 of 10 have a defect: connectivity, data, interfaces and machines. coding's is the dot alone.

##### Set read
Answer (verbatim): one set. "None of the 10 icons looks like it comes from a different set. They share a similar stroke weight, rounded corners, a light grey fill and a dark outline. The small dark dot on coding (2), connectivity (3) and machines (8) looks like a deliberate shared accent, not a mismatch."

Verdict: pass.

##### Ranking reads
- read 1 (A=new): "B: more consistent weight and badge treatment" → old
- read 2 (A=old): "A — more consistent, cleaner silhouettes" → old
- read 3 (A=new): "B — more consistent, balanced, weightier strokes." → old

Verdict: FAIL. The new set was picked 0 of 3.

#### garage

Blind key: 1 oil · 2 fuel · 3 tyre · 4 battery · 5 traffic-light · 6 car · 7 speedometer · 8 gearshift · 9 wrench · 10 steering-wheel. Ranking letters: read 1 A=new B=old, read 2 A=old B=new, read 3 A=new B=old. Shadow pair (seed 7919): A on · B off.

##### Blind read
Answer (verbatim):
1. oil: a bottle or can with a drop on it. 2. fuel: a petrol pump with a nozzle. 3. tyre: a wheel with a tread ring and a hub. 4. battery: a battery with + and - terminals. 5. traffic-light: a signal with three lamps. 6. car: a small side-view car. 7. speedometer: a half-dial gauge with a needle. 8. gearshift: a stick with an H pattern. 9. wrench: a spanner. 10. steering-wheel: a wheel with spokes and a center hub. (No competition for any.)
No two numbers compete for one name. Every number matches its name directly, and none got its name only because the other names were taken. I read two symbols as pictured marks: the "+" and "-" on the battery (4) and the H-shaped shift pattern on the gearshift knob (8). I read no letter or digit as text inside any icon, apart from the numbers under each icon. Of these, the "+" and "-" on the battery are the closest to marks that carry meaning, but they are the usual battery terminal symbols and not letters or digits.

Verdict: pass. All 10 of 10 match the key, none by elimination.

##### Craft read
Answer (verbatim):
1 battery: none (terminals slightly small)
2 car: wheels slightly overlap body, busy
3 fuel: nozzle floats off the body
4 gearshift: knob heavy, stem thin
5 oil: cap floats, uneven weight
6 speedometer: ticks and needle too small
7 steering-wheel: confused silhouette, spokes cluttered
8 traffic-light: side brackets confuse the silhouette
9 tyre: tread marks too small, busy
10 wrench: none (head slightly lumpy)
Three weakest: tyre (9): tread ticks and hub ring tiny and cluttered; at list size reads as a donut or a dial, not a tyre. steering-wheel (7): spokes and inner details crowd together, the shaded lower half muddies the shape; at small size it turns into a blob. fuel (3): nozzle is a small wedge off the pump body, reads detached; pump has little weight on its right side. Close behind: speedometer (6), tick marks too thin to read small; oil (5), cap sits like a separate piece.

Verdict: recorded, not gating. 8 of 10 have a defect: every icon except battery and wrench.

##### Set read
Answer (verbatim): one set

Verdict: pass.

##### Ranking reads
- read 1 (A=new): "A. Its set looks more consistent: the tire, gauge and car are cleaner and the shading and detail are more even. B's tire has spiky, noisy treads and its gauge is a bit uneven." → new
- read 2 (A=old): "B: more consistent, balanced detail." → new
- read 3 (A=new): "B: more consistent, legible detailing" → old

Verdict: pass. The new set was picked 2 of 3.

##### Shadow read (after the gate passed)
Answer (verbatim): "B. Cleaner, no drop shadows."

Verdict: B, which is off. `shadow.mjs skills/pretty-icons/examples/garage --off` changed no files, so there was no commit.

### Round 2 (94052a4), seed 15838, hairline only

Blind key: 1 machines · 2 data · 3 interfaces · 4 empty · 5 all · 6 coding · 7 devices · 8 connectivity · 9 security · 10 marks. Ranking letters: read 1 A=old B=new, read 2 A=old B=new, read 3 A=new B=old.

##### Blind read
Answer (verbatim):
1. devices. A small handheld radio or remote with antenna and a screen. Low confidence.
2. data. A database cylinder.
3. interfaces. A cursor arrow in a window or frame, with a dot at the corner.
4. empty. A plain blank rounded square.
5. all. Four circles in a 2x2 grid.
6. coding. Code brackets {} inside a rect, with a corner dot. I read the braces as a symbol, not a letter or digit.
7. machines. A tall rounded device with a small slot or line and a corner dot. It could be a tablet, phone or appliance. This is a weak match, and I picked "machines" partly because the other names were taken.
8. connectivity. Two circles joined by a link.
9. security. A shield with a check mark.
10. marks. A bookmark ribbon.
Competing names: 1 and 7 both fit "devices" or "machines". I gave 1 to devices and 7 to machines. Name by elimination: 7 got "machines" mostly because the other names were taken. Number 1 could also be machines. Letters or digits: none in the icons.

Verdict: FAIL. 1 (machines) was named devices, and 7 (devices) was named machines by elimination.

##### Craft read
Answer (verbatim):
1 all: none (the four circles are even)
2 coding: dot floats off corner
3 connectivity: confused silhouette, ambiguous link
4 data: none (the middle band reads slightly heavy)
5 devices: dot floats, detail tiny
6 empty: none
7 interfaces: dot floats, cursor weight uneven
8 machines: antenna and inner slot tiny
9 marks: none (a slightly sharp notch)
10 security: none (the check is small but readable)
Three weakest: connectivity (3): two circles joined by a diagonal read as a chain or a slider rather than a clear link; the line meets the rings awkwardly, lightest ink in the set. devices (5): the corner dot sits detached from the body; the tiny home-bar dash is barely readable; tablet/phone could be confused with the plain "empty" rectangle. interfaces (7): cursor weight uneven, frame broken at the corner, dot looks stuck on the outside; biggest mass offset, looks off-centre. Close behind: coding (2) same floating corner dot; machines (8) antenna and slot detail disappear at 12px.

Verdict: recorded, not gating. 4 of 10 have a defect: connectivity, devices, interfaces and machines. coding's is the dot alone.

##### Set read
Answer (verbatim): one set

Verdict: pass.

##### Ranking reads
- read 1 (A=old B=new): "B — more consistent, cleaner, balanced." → new
- read 2 (A=old B=new): "B. More consistent, cohesive visual weight." → new
- read 3 (A=new B=old): "B. Consistent weight, cleaner, more coherent." → old

Verdict: pass. The new set was picked 2 of 3.

### Round 3 (384cbf8), seed 23757, hairline only

Blind key: 1 connectivity · 2 marks · 3 all · 4 machines · 5 interfaces · 6 empty · 7 data · 8 devices · 9 coding · 10 security.

Ranking letters: the seed gave A=new B=old for all three reads. To balance position, the controller swapped read 2's letters, so that reader saw A=old B=new.

##### Blind read
Answer (verbatim):
1. connectivity: two interlocking chain links.
2. marks: bookmark ribbon.
3. all: 2x2 grid of four circles. This is a slightly weak match. It could pass for "interfaces", but "all" fits the grid of items better.
4. machines: robot face with antenna and a status dot. This competes with 5, 8 and 9 for the remaining names.
5. interfaces: cursor arrow in a window or box, with a dot.
6. empty: plain blank rounded square.
7. data: database cylinder.
8. devices: phone or tablet, upright.
9. coding: code brackets "<>" in a frame, with a dot. The brackets are symbols, not a letter or digit.
10. security: shield with a checkmark.
Competition and weak names: No two numbers compete for the same name. Number 3 (all) gets its name partly by elimination, since nothing else on the list fits a four-circle grid. Number 5 (interfaces) is a moderate match, because the cursor-in-window reading is not unique. Number 4 (machines) is a robot, so the match is a little loose, but nothing else fits it. No letters or digits are visible in the icons.

Verdict: all 10 of 10 match the key, with one flag.

- The reader wrote: "Number 3 (all) gets its name partly by elimination, since nothing else on the list fits a four-circle grid." `read.md` fails an icon on that phrase.
- Round 3 was the last, so the controller stopped and the person decided: **"Aprovar com nota"**. Hairline is recorded as PASSED, with this note.
- `all` has not changed since round 1 (d0d9d3a). It read clean in round 1 ("four circles in a grid") and in round 2 ("Four circles in a 2x2 grid.").

##### Craft read
Answer (verbatim):
1 all: none / 2 coding: dot detached, braces tiny / 3 connectivity: link overlap muddled, heavy / 4 data: none / 5 devices: detail too small (speaker/home bars) / 6 empty: none / 7 interfaces: corner dot floats off body / 8 machines: antenna tiny; dot floats off / 9 marks: none / 10 security: none (shield curve slightly uneven)
Three weakest: coding (corner dot off the bottom-right reads as a stray part; braces small and cramped); machines (eyes, antenna stub too small at 16px; status dot floats; part robot part screen); connectivity (interlocking capsules overlap into a muddy crossing; heaviest glyph; reads as a blob or bandage). Interfaces close fourth (floating corner dot).

Verdict: recorded, not gating. 4 of 10 have a defect: coding, connectivity, devices and machines. interfaces' is the dot alone.

##### Set read
Answer (verbatim): one set

Verdict: pass.

##### Ranking reads
- read 1 (A=new): "A — consistent weight, cleaner, more uniform." → new
- read 2 (shown A=old B=new): "B: more consistent, cleaner silhouettes" → new
- read 3 (A=new): "A. Consistent weight, cleaner, coherent." → new

Verdict: pass. The new set was picked 3 of 3.

`REFERENCE_INK`: `{ 16: 63.1, 20: 102.4, 24: 151, 48: 337.5 }` → `{ 16: 64.1, 20: 103.5, 24: 152.6, 48: 347 }`. Rounds 2 and 3 kept the median of the seven unmodified hairline icons at all's 64.08, so the values did not move after round 1.

## Findings for the person

- **The modifier dot read as floating in all three rounds of craft reads.**
  - The craft readers' words: round 1 "badge dot floats off body"; round 2 "dot floats off corner" and "dot looks stuck on the outside"; round 3 "corner dot off the bottom-right reads as a stray part".
  - This is the rule-08 halo, not the drawing. The halo is the reach plus one stroke plus half the base stroke, which comes to 3 for the dot on 16. That leaves one stroke of paper between the dot and the cut contour, and `modifiers.mjs` fails anything closer.
  - The halo is a candidate for a later change.
- **Hairline passed by the person's decision ("Aprovar com nota").**
  - The round 3 blind reader named all 10, but said `all` got its name "partly by elimination".
  - `all` is unchanged since round 1 and read clean in rounds 1 and 2.
- **Garage passed in round 1, but its round 1 craft read named 8 of 10.** The gate is blind and ranking, so it was not redrawn. The worst three were:
  - tyre, which reads "as a donut or a dial";
  - steering-wheel, which "turns into a blob";
  - fuel, whose nozzle "reads detached".
- **The round 3 hairline craft read still names:**
  - connectivity: "heaviest glyph; reads as a blob or bandage";
  - machines: "part robot part screen";
  - coding: "braces small and cramped".
- **The round 3 seed put the new set on A in all three ranking pairs.** The controller swapped read 2's letters to balance position.

## The trial

Two trials, each by one fresh agent (opus) with no access to this conversation and only the skill as Task 11 left it, working in an empty scratch folder with no app. Both ran at the same time. Each agent opened its own readers; then a fresh reader (sonnet), opened by the controller, read each final blind sheet (`sheet.mjs --seed=12`), so the verdict does not rest on the drawer's own readers. A trial passes when its drawer reported `ok` on check run 1 or 2 and the controller's blind read is 6 of 6, none by elimination.

### notes, duotone 16

The prompt as sent:

> Your working directory for this whole task is `<scratch>/trial16.4QAo`. It is empty, and there is no app in it. Run every command from there (cd into it first in each shell command), and write nothing outside it.
>
> Use the skill in `/Users/lucasmarques/estudos/skills/skills/pretty-icons/SKILL.md` to draw six icons for the sidebar of a notes app; the sidebar text is 14px, in the duotone finish: inbox, calendar, chat, profile, search, upload. Nobody is available to answer questions, so where the skill says to ask, take its recommendation and say so. Follow every step, the reads included. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time, each icon's concept line, and each reader's answer.

The agent took the skill's recommendations: duotone on 16 (14px text), plain `.svg` (no app), its own concept lines. It emitted `.svg` into its folder.

Each check run, as the agent reported it (`pixel` notes printed on most runs and never failed it; scratch runs on variants are not numbered):

1. fail: `gravity profile mass +0, +1.21` · `gravity upload mass +0, +1.92` · `weight calendar ink 64.02 (+16.9%) → within ±15% of the set's median 54.77` · `weight inbox ink 74.63 (+36.3%)` · `weight search ink 49.61 (-22.6%) → within ±20% of the reference 64.1` · `weight upload ink 50.81 (-20.7%)` against the reference
2. fail: `gravity search mass -0.61, -0.61` · `weight inbox ink 73.83 (+28.1%)` (median 57.63) · `weight upload ink 47.52 (-17.5%)` against the median, `(-25.9%)` against the reference
3. fail: `gravity upload +0.61` · `weight inbox ink 69.04 (+19.8%)` · `weight upload ink 48.98 (-15.0%)` against the median, `(-23.6%)` against the reference
4. fail: `keyline upload 13.25 × 8.69 → landscape 14 × 11 ±0.5` · `gravity upload +0.12, +1.35` · `loose upload path@3[0]` and `path@3[1] 0.7 strokes from path@2 → ≥ 1 stroke inside the contour` · `weight inbox ink 69.04 (+19.8%)` · `weight upload ink 50.84 (-20.7%)` against the reference
5. fail: `gravity upload mass +0, +0.93` · `weight inbox ink 69.04 (+15.9%)` (median 59.56)
6. `ok`; reads round 1
7. fail: `weight inbox ink 68.76 (+15.1%) → within ±15% of the set's median 59.76`
8. `ok`; reads round 2
9. `ok`; reads round 3
10. `ok`; reads round 4, the final set

`check.mjs --print`, run by the controller on the final folder (exit 0):

```
┌─────────┬────────────┬──────┬──────┬───────┬───────┬─────────────┬───────┬───────┬───────┬────────────────────────┬──────┐
│ (index) │ icon       │ x0   │ y0   │ w     │ h     │ keyline     │ ink   │ dx    │ dy    │ joins                  │ infl │
├─────────┼────────────┼──────┼──────┼───────┼───────┼─────────────┼───────┼───────┼───────┼────────────────────────┼──────┤
│ 0       │ 'calendar' │ 1.75 │ 1.25 │ 12.5  │ 13    │ 'square'    │ 62.97 │ 0     │ 0.36  │ '0 smooth · 0 corners' │ 0    │
│ 1       │ 'chat'     │ 1.5  │ 2    │ 13    │ 12    │ 'square'    │ 62.1  │ -0.28 │ -0.36 │ '4 smooth · 2 corners' │ 1    │
│ 2       │ 'inbox'    │ 1.25 │ 2.75 │ 13.5  │ 10.5  │ 'landscape' │ 69.1  │ 0     │ 0.2   │ '0 smooth · 2 corners' │ 0    │
│ 3       │ 'profile'  │ 2    │ 1    │ 12    │ 12    │ 'square'    │ 53.42 │ 0     │ 0.08  │ '0 smooth · 4 corners' │ 0    │
│ 4       │ 'search'   │ 1.25 │ 1.25 │ 13.75 │ 13.75 │ 'circle'    │ 52.43 │ -0.41 │ -0.41 │ '0 smooth · 0 corners' │ 0    │
│ 5       │ 'upload'   │ 1.16 │ 2.5  │ 13.84 │ 10.5  │ 'landscape' │ 58.25 │ -0.23 │ 0.24  │ '2 smooth · 1 corners' │ 0    │
└─────────┴────────────┴──────┴──────┴───────┴───────┴─────────────┴───────┴───────┴───────┴────────────────────────┴──────┘
notes
pixel  calendar  4 of 6 straight strokes off the pixel at 16 px, 4 at 32 px → their edges on whole pixels
pixel  inbox  4 of 5 straight strokes off the pixel at 16 px, 4 at 32 px → their edges on whole pixels
ok
```

The agent's concept lines (final): inbox — tray, landscape, body + notch line · calendar — page with binding rings, square, body + two rings · chat — speech bubble, square, bubble + two text lines · profile — head and shoulders, square (the kit's `bust` in rounds 1–2, a hand-drawn single contour in 3–4) · search — magnifier, circle, lens + handle · upload — first "an arrow rising off a base", swapped after it kept failing weight and gravity to "a cloud with an up arrow, landscape".

The agent's reads, each by a fresh reader it opened, four rounds:
- Blind: passed all four rounds, none by elimination; inbox the least sure each time ("basket", "bag", "smile").
- Set: "one set" in round 1; one icon named in rounds 2 (search) and 3 (upload); round 4 named two: "Icon 2 (chat) and icon 6 (upload) look different from the rest, but it's a close call. Chat has a thicker, heavier stroke, and upload looks thicker and rounder."
- Craft: failed all four rounds. Round 4: chat "tail bulges, slightly wobbly bubble"; inbox "tray detail too small to read"; profile "confused silhouette, flat-bottom bust"; upload "lumpy cloud, uneven bumps"; calendar and search none.
- The agent stopped after round 4 by its own judgment ("the readers' notes weren't converging") and reported two limits it met: a bolder inbox notch puts inbox over the ±15% weight band, its box already at the smallest landscape keyline; a profile in two pieces could not meet gravity and weight together on 16.

The controller's blind read (key `1 upload · 2 search · 3 profile · 4 inbox · 5 calendar · 6 chat`), verbatim:

> 1. upload: cloud with up arrow.
> 2. search: magnifying glass.
> 3. profile: head and shoulders person.
> 4. inbox: open tray with a dip.
> 5. calendar: square with two top tabs.
> 6. chat: speech bubble with text lines.
>
> No two numbers compete for one name. I read no letter or digit inside any icon; the only digits are the labels 1 to 6. No number got its name only because the other names were taken. Icon 5 is the least certain, since it is a blank square with ring tabs and no grid. I still read it as a calendar, not a generic page.

Verdict: **held**. The blind read is 6 of 6, none by elimination, but `check.mjs` first printed `ok` on run 6; run 1 was held first by `gravity` (profile, upload) and `weight` (calendar, inbox, search, upload). The agent's own set read named two icons in its last round.

### kitchen, filled 48

The prompt as sent:

> Your working directory for this whole task is `<scratch>/trial48.CpZI`. It is empty, and there is no app in it. Run every command from there (cd into it first in each shell command), and write nothing outside it.
>
> Use the skill in `/Users/lucasmarques/estudos/skills/skills/pretty-icons/SKILL.md` to draw six icons for a kitchen shop's category grid, in the filled finish: kettle, whisk, rolling-pin, pot, cup, toaster. Nobody is available to answer questions, so where the skill says to ask, take its recommendation and say so. Follow every step, the reads included. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time, each icon's concept line, and each reader's answer.

The agent took the skill's recommendations: filled for a category grid, plain `.svg` (no app), the conventional concepts. It did not emit, since the craft read had not passed.

Each check run, as the agent reported it:

1. fail: `contour` pot and rolling-pin (6 straight sides each) · `gravity` kettle · `live` pot · `gap` pot and rolling-pin · `air` toaster · `weight` whisk −30.2% · `contrast` whisk 68.1%
2. and 3. fail: join, bend, keyline, air, loose and gap
4. fail: `air kettle counter 1.2 strokes across at 27, 11`
5. `ok`
6. `ok` (the toaster's toast redrawn as a bread slice, after its proof read as a handbag)
7. `ok`
8. fail: `contour cup path@2 6 straight sides → at most 5, or curves` · `gravity kettle mass +1.68, +5.52 → within ±3` · `gap toaster path@3 to rect@8 1.58 apart → ≥ 2.25 apart, or crossing`
9. fail: `gravity kettle mass +1.74, +4.01 → within ±3`
10. `ok`
11. fail: `construction whisk path@2 stroke-width 2 → the root's line on a filled element; only a contour sets a width`, and the same for path@3 · `air whisk paper 1.6 strokes wide at 19.5, 20.58 and at 27.42, 28.49` · `contrast whisk line tone on 46.4% of the paint`
12. `ok`
13. fail: `gap toaster path@3 to path@5 2 apart → ≥ 2.25 apart, or crossing` · `loose whisk path@5[0] 0.8 strokes from path@2 → ≥ 1 stroke inside the contour`, and the same for path@5[1] · `weight whisk ink 254.78 (-26.6%) → within ±25% of the reference 347`
14. fail: `loose whisk path@5[0] 0.9 strokes from path@2` · `contrast whisk line tone on 46.6% of the paint → 20% to 45%`
15. fail: `keyline whisk 37.13 × 37.13 → square 36 × 36 ±1`
16. `ok` (whisk ink 270.68, line% 44.8)
17. `ok`, after `shadow.mjs --off`

`check.mjs --print`, run by the controller on the final folder (exit 0):

```
┌─────────┬───────────────┬──────┬──────┬───────┬───────┬─────────────┬────────┬───────┬───────┬───────┬─────────────────────────┬──────┐
│ (index) │ icon          │ x0   │ y0   │ w     │ h     │ keyline     │ ink    │ dx    │ dy    │ line% │ joins                   │ infl │
├─────────┼───────────────┼──────┼──────┼───────┼───────┼─────────────┼────────┼───────┼───────┼───────┼─────────────────────────┼──────┤
│ 0       │ 'cup'         │ 6    │ 6    │ 37    │ 36    │ 'square'    │ 316.98 │ -2.04 │ -0.47 │ 28.9  │ '8 smooth · 12 corners' │ 0    │
│ 1       │ 'kettle'      │ 5    │ 4.75 │ 36    │ 35.75 │ 'square'    │ 387.1  │ 1.27  │ 1.31  │ 35.1  │ '4 smooth · 12 corners' │ 0    │
│ 2       │ 'pot'         │ 4    │ 7    │ 40    │ 33    │ 'landscape' │ 329.62 │ 0     │ 0.79  │ 33.6  │ '11 smooth · 6 corners' │ 0    │
│ 3       │ 'rolling-pin' │ 5.94 │ 5.94 │ 36.13 │ 36.13 │ 'square'    │ 292.96 │ 0     │ 0     │ 37.2  │ '16 smooth · 6 corners' │ 0    │
│ 4       │ 'toaster'     │ 4    │ 7.5  │ 40    │ 32.5  │ 'landscape' │ 386.21 │ 0     │ 1.19  │ 28.9  │ '14 smooth · 6 corners' │ 8    │
│ 5       │ 'whisk'       │ 6.75 │ 4.31 │ 36.94 │ 36.94 │ 'square'    │ 270.68 │ 2.1   │ -2.1  │ 44.8  │ '11 smooth · 5 corners' │ 3    │
└─────────┴───────────────┴──────┴──────┴───────┴───────┴─────────────┴────────┴───────┴───────┴───────┴─────────────────────────┴──────┘
ok
```

The agent's concept lines: kettle — stovetop kettle, square; round body, arched handle, spout (the spout a curved body from round 3, the handle a shaded band in round 4) · whisk — diagonal; handle, ferrule, wire loops (round 4: handle and a balloon head with wires, no ferrule) · rolling-pin — diagonal; barrel and two handles · pot — cooking pot, landscape; body, lid with knob, side handles · cup — mug, square; body and handle · toaster — landscape; body, toast slice, lever (round 4: body and two slices, no lever). Two diagonals, the limit.

The agent's reads, each by a fresh reader it opened, four rounds:
- Blind: passed all four rounds, none by elimination. Round 4 on the whisk: "whisk-like utensil with loop head. Weak read; the head looks like a paddle or fan with a thin handle."
- Set: "one set" in rounds 1, 3 and 4; round 2 named cup ("flat side-split shading, thinner outline").
- Craft: failed all four rounds; pot and rolling-pin passed every one. Round 4: cup "handle ring looks detached/heavy"; kettle "confused silhouette, spout/handle arc"; toaster "slots read as ear-like bumps"; whisk "wire detail too small".
- Shadow: run though the craft read had not passed; the reader picked off ("A. Cleaner, consistent, crisp edges."), and the agent ran `shadow.mjs --off`.
- The agent stopped after round 4: the same complaints came back each round.

The controller's blind read (key `1 whisk · 2 toaster · 3 rolling-pin · 4 pot · 5 cup · 6 kettle`), verbatim:

> 1 = whisk: whisk with oval wire head. Whole-image check: no letters or digits inside any icon (only the 1-6 labels).
> 2 = toaster: two-slot toaster with bread slices.
> 3 = rolling-pin: diagonal pin with handles.
> 4 = pot: lidded two-handled cooking pot.
> 5 = cup: tall mug with side handle.
> 6 = kettle: domed kettle with spout.
>
> No two numbers compete for one name. No number got its name only because the other names were taken. All six matched on their own shape.

Verdict: **held**. The blind read is 6 of 6, none by elimination, but `check.mjs` first printed `ok` on run 5; run 1 was held first by `contour` (pot, rolling-pin: six straight sides each), then gravity, live, gap, air, weight and contrast.

### What the trial says

Both sets are named by a fresh reader from the picture alone, 6 of 6, at both finishes, and both reach `ok`. Neither reaches it in two runs: the notes drawer took six, the kitchen drawer five, and each spent most of its runs on weight and gravity (notes) or on the filled finish's construction rules (kitchen). Neither passed its own craft read in four rounds, and both drawers stopped by judgment because the readers' notes moved between rounds. Candidates for a later change, for the person to judge: the duotone weight band on 16, which leaves a small tray no room for a readable notch; a two-piece bust on 16, which the drawer could not balance; the kit's soft bodies, which the notes drawer used for profile and chat and then hand-drew past.
