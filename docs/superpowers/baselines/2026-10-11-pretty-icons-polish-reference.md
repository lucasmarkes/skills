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
