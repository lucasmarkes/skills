# pretty-icons bulk: reference

Spec: `docs/superpowers/specs/2026-10-12-pretty-icons-bulk-design.md` · Plan: `docs/superpowers/plans/2026-10-12-pretty-icons-bulk.md`

## examples/bulk

The final drawing is 6d3077d (the icons are as drawn in round 5, 7bd4c1e; 6d3077d is the calibration and the fixture retune). No icon carries a modifier (`badge:*` or `dot`), so all ten are in the median. `BULK_REFERENCE_INK[24]` is 111.6 (the median of the ten inks is 111.56; the placeholder was 114); the share band is `[0.25, 0.6]`, and every share falls inside it, the lowest being marks at 27.2% and the highest connectivity at 58.6%.

```
┌─────────┬────────────────┬──────┬──────┬──────┬───────┬─────────────┬────────┬──────┬───────┬────────┬─────────────────────────┬──────┐
│ (index) │ icon           │ x0   │ y0   │ w    │ h     │ keyline     │ ink    │ dx   │ dy    │ share% │ joins                   │ infl │
├─────────┼────────────────┼──────┼──────┼──────┼───────┼─────────────┼────────┼──────┼───────┼────────┼─────────────────────────┼──────┤
│ 0       │ 'all'          │ 4.25 │ 4.25 │ 17.5 │ 17.5  │ 'square'    │ 121.85 │ -0.3 │ -0.3  │ 45.5   │ '16 smooth · 0 corners' │ 0    │
│ 1       │ 'coding'       │ 2    │ 4    │ 20   │ 16    │ 'landscape' │ 110.83 │ 0.09 │ -0.16 │ 37.5   │ '23 smooth · 2 corners' │ 0    │
│ 2       │ 'connectivity' │ 2    │ 2.19 │ 20   │ 19.81 │ 'circle'    │ 97.75  │ 0    │ -0.47 │ 58.6   │ '3 smooth · 6 corners'  │ 4    │
│ 3       │ 'data'         │ 4    │ 2    │ 16   │ 20    │ 'portrait'  │ 106.13 │ 0    │ 0.31  │ 42.4   │ '8 smooth · 6 corners'  │ 0    │
│ 4       │ 'devices'      │ 2    │ 5.5  │ 20   │ 16    │ 'landscape' │ 102.63 │ 0    │ 0.07  │ 42.9   │ '16 smooth · 8 corners' │ 0    │
│ 5       │ 'empty'        │ 3    │ 2.75 │ 18   │ 17.5  │ 'square'    │ 119.09 │ 0    │ -0.13 │ 41.6   │ '6 smooth · 13 corners' │ 0    │
│ 6       │ 'interfaces'   │ 2    │ 6    │ 20   │ 16    │ 'landscape' │ 113.39 │ 0    │ 0.06  │ 58.3   │ '6 smooth · 6 corners'  │ 0    │
│ 7       │ 'machines'     │ 2.75 │ 2.75 │ 18.5 │ 18.5  │ 'square'    │ 103.42 │ 0    │ 0     │ 42.7   │ '4 smooth · 30 corners' │ 0    │
│ 8       │ 'marks'        │ 4    │ 2    │ 16   │ 20    │ 'portrait'  │ 122.1  │ 0    │ -0.43 │ 27.2   │ '8 smooth · 3 corners'  │ 0    │
│ 9       │ 'security'     │ 4    │ 2    │ 16   │ 20    │ 'portrait'  │ 112.28 │ 0    │ -0.44 │ 47.2   │ '2 smooth · 8 corners'  │ 18   │
└─────────┴────────────────┴──────┴──────┴──────┴───────┴─────────────┴────────┴──────┴───────┴────────┴─────────────────────────┴──────┘
ok
```

What changed, per icon (round 1 in f48a855, round 2 in 93b0539, round 3 in 5f2dbdf, round 4 in f2c1981, round 5 in 7bd4c1e):

- **all:** round 1 four discs; round 2 a 2x2 tile grid with a full-ink dot; round 5 four identical cells, one of them at full ink. Ink 121.85, share 45.5.
- **coding:** an angle-bracket glyph on a tile in round 1; a terminal with a `>_` prompt from round 2 on, refined in rounds 3 to 5. Ink 110.83, share 37.5.
- **connectivity:** round 1 wifi in a disc; round 2 a router with two arcs; round 3 one wifi fan, a grey sector with a full-ink inner sector; round 5 a classic wifi: a grey fan, a full-ink arc line and a dot. Its middle arc is a full-ink stroked line while the dot is a full-ink circle, so the accent mixes two finishes; a ring of bulk body would be purer but this keeps the accent at 3 elements. Ink 97.75, share 58.6, the highest in the set.
- **data:** round 1 stacked discs; round 2 a striped squircle became a database cylinder; round 4 a lid, a band and a drum; round 5 three equal bands. Ink 106.13, share 42.4.
- **devices:** round 1 a phone-like pill with side bars; round 2 a monitor on a stand; round 4 one body, monitor and stand together. Ink 102.63, share 42.9.
- **empty:** round 1 a slashed disc; round 2 an open, empty box; round 3 an inbox tray cut by a full-ink tray line; round 4 a straight tray with a rim line; round 5 a single tray body with a dark notched recess. Ink 119.09, share 41.6.
- **interfaces:** two toggles in rounds 1 and 2 (read as "toggle switches", not a window); round 3 a window with a sidebar and a top bar; round 4 a bar and a U frame; round 5 a 3.5 bar and a symmetric frame. Ink 113.39, share 58.3.
- **machines:** round 1 a robot face with an antenna; round 2 a six-tooth gear with a full-ink hub; round 4 trapezoid teeth; round 5 kept. Ink 103.42, share 42.7.
- **marks:** round 1 a bookmark on a tile; round 2 a bookmark with a check; round 4 a tag; round 5 a bookmark ribbon with a V notch and a full-ink dot. Ink 122.1, share 27.2, the lowest in the set.
- **security:** round 1 a padlock; round 2 a shield with a keyhole, kept to the end. Ink 112.28, share 47.2.

Calibration in 6d3077d: `BULK_REFERENCE_INK = { 24: 111.6 }`. `sheet.test.mjs`, fixture c, failed the reference rule under 111.6 (+21.1%, outside ±20%); its full-size diamond became b's, `M 12 7.5 L 16.5 12 L 12 16.5 L 7.5 12 Z`, and its line moved onto that diamond's edge (ink 135.16 to 130.73, +17.1%; share 44.6 to 38.3). No rule was loosened.

## Reads

Every reader was a new sonnet agent that saw only its image. Per round the controller sent the blind, craft and set reads (`read.md`) and the studio read with a coin: the coin says which of A and B is our set and which is the reference. The studio read passes only on "both"; it never did.

| round | commit | seed | blind | craft | set | studio (coin) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | f48a855 | 87206 | 10 of 10 names; 3 by elimination (devices, empty, all) | 7 of 10 defective | 2 named (devices, machines): fail | B, the reference (A = ours): fail |
| 2 | 93b0539 | 47108 | 10 of 10 names; 2 fail (empty by elimination; interfaces read as toggles) | 8 of 10 defective | 2 named (connectivity, machines): fail | A, ours (A = ours): fail |
| 3 | 5f2dbdf | 29510 | 10 of 10 names; 2 fail (interfaces, all) | 9 of 10 defective | 2 named (data, marks): fail | A, ours (A = ours): fail |
| 4 | f2c1981 | 41827 | 10 of 10 names; 2 fail by elimination (all, marks) | 9 of 10 defective | 1 named (connectivity): pass | B, ours (B = ours): fail |
| 5 | 7bd4c1e | 63194 | 10 of 10 names; 2 fail by elimination (marks, all) | 9 of 10 defective | 1 named (security): pass | B, ours (B = ours): fail |

The craft count is the icons with a defect from the prompt's list; the controller's pass lists were: round 1 all, empty, interfaces; round 2 all, interfaces; round 3 all; round 4 machines; round 5 all.

### Round 1 (f48a855), seed 87206

Blind (verbatim):

| # | Name | Object seen |
|---|------|-------------|
| 1 | machines | Robot face with antenna |
| 2 | devices | Computer mouse (or bean) with side bars |
| 3 | connectivity | Wi-Fi signal in a circle |
| 4 | interfaces | Two toggle switches |
| 5 | marks | Bookmark ribbon on rounded tile |
| 6 | data | Stacked database discs |
| 7 | empty | Disc with diagonal slash |
| 8 | coding | Code brackets `</>` on a tile |
| 9 | security | Padlock |
| 10 | all | Four dots in a 2x2 grid |

- Competing numbers: no two numbers compete for one name. The nearest case is 1 and 2, which could both pass as machines or devices. The robot at 1 fits machines better, and 2 is left with devices.
- Letters or digits: I read none inside any icon. The `</>` in 8 is a symbol, not a letter, and it names the icon coding. The numbers 1 to 10 are only the captions under the icons.
- Names given by elimination:
  - 2 (devices): this one is weak. The shape is ambiguous, and a mouse is only a loose fit for devices. I picked it mainly because machines, interfaces, marks and connectivity were taken by clearer icons.
  - 7 (empty): this one is also partly by elimination. A slashed disc reads as none or null, which fits empty, but nothing in it is distinctive.
  - 10 (all): this one is also partly by elimination. The dot grid suggests all or a collection, but it is a generic shape.

Verdict: all ten names match the key; fail by elimination: devices, empty, all.

Craft (verbatim defects, the sheet's order):

1. all: none
2. coding: chevron inner counters crowded
3. connectivity: wifi dot nearly touches arcs
4. data: uneven stripe weight and spacing
5. devices: side bars float detached
6. empty: none (slash weight slightly heavy)
7. interfaces: none
8. machines: antenna detail too small
9. marks: confused silhouette, bookmark too small
10. security: shackle floats; confused silhouette

Weakest three: security ("a kettlebell or bag, not a padlock"), marks ("a blank rounded slab with a tiny bookmark at the top"), devices ("reads as a robot head or a capsule"). Verdict: fail: coding, connectivity, data, devices, machines, marks, security.

Set (verbatim): "Icons 5 (devices) and 8 (machines) look like they come from a different set. 5 devices: thin side bars, tall pill. 8 machines: antenna and ring-eyes, busier." Verdict: fail, two named.

Studio (coin A = ours, B = the reference): "B. Consistent, tight, purposeful metaphors." Verdict: fail; the reader singled out the reference, and its words point at the metaphors (rule 09).

### Round 2 (93b0539), seed 47108

Blind (verbatim):

1: data, a stack of database discs.
2: connectivity, a Wi-Fi arc over a router bar.
3: empty, an open empty box or tray. It could also be read as "devices" or "machines", but "empty" fits best.
4: all, a 2x2 grid with one circle and three rounded squares.
5: machines, a gear with a hub.
6: interfaces, toggle switches or sliders.
7: coding, a terminal prompt (>_) in a rounded box. The ">" and "_" are symbols, not letters or digits.
8: marks, a bookmark or ribbon with a checkmark.
9: devices, a monitor or desktop display on a stand.
10: security, a shield with a keyhole.

"Competing names: none. The names that could be confused are 3 (empty, vs devices or machines), 8 (marks), and 6 (interfaces), but each has a distinct best fit."

"Letters or digits: none are legible inside any icon. The only text is the 1-10 labels under the icons. Icon 7 has the ">_" prompt glyph, and I read no letter in it."

"Names taken only by elimination: none strictly. Icon 3 (empty) is the weakest, since the open box has no unique empty-state cue and I partly reached it because the other names were already assigned. Icon 6 (interfaces) is a milder case, since toggles suggest settings and interfaces equally." Verdict: all ten match; fail: empty, interfaces (the second round read as toggles).

Craft (verbatim defects):

1. all: none (the dark dot is heavier than the grey squares, but that reads as intentional)
2. coding: prompt detail slightly cramped
3. connectivity: floating arcs, thin
4. data: stack bands crowded, uneven weight
5. devices: stand detached, thin
6. empty: lid floats off body
7. interfaces: none
8. machines: gear teeth lumpy, wobbly
9. marks: confused silhouette, notched bottom
10. security: keyhole tiny, shield uneven

Weakest three: marks, empty, data. Verdict: fail: coding, connectivity, data, devices, empty, machines, marks, security.

Set (verbatim): "Outliers: 3 (connectivity) and 8 (machines)? ... If you want a single answer, it is 3 (connectivity): detached arcs, bar, no knockout." Verdict: fail; a hedged name counts as named.

Studio (coin A = ours): "A. Cohesive, consistent shared style." Verdict: fail as written (needs "both"). The gap from round 1 closed in our favour.

### Round 3 (5f2dbdf), seed 29510

Blind (verbatim):

1. security: shield with a keyhole.
2. interfaces: browser window or panel layout. Competes with 8 (see below).
3. devices: monitor on a stand, a desktop display.
4. coding: terminal prompt window (">_").
5. marks: bookmark ribbon with a checkmark.
6. empty: open inbox tray, empty.
7. data: stacked database cylinder.
8. all: four dots or tiles in a 2x2 grid.
9. machines: gear or cog with a hub.
10. connectivity: Wi-Fi signal fan.

"Numbers 2 and 8 both fit 'interfaces'. 2 is a window or panel layout. 8 is an app-grid, which could also read as 'all'. I gave 2 'interfaces' and 8 'all'." "8 is the weakest. It reads as 'all' or 'interfaces', and I took 'all' because 2 was the better fit for 'interfaces'. 9 (gear to 'machines') is a mild fit too." Verdict: all ten match; fail: interfaces and all. Empty now reads as "open inbox tray, empty".

Craft (verbatim defects):

1 all: none (one dark dot, others grey, deliberate)
2 coding: prompt glyph slightly small
3 connectivity: wedge cut looks blunt, heavy
4 data: inner band kinks at ends
5 devices: stand tiny, floats under screen
6 empty: wavy tray line, confused silhouette
7 interfaces: details too thin to read
8 machines: gear teeth lumpy, wobbly
9 marks: confused silhouette, check heavy
10 security: keyhole slot too small

Weakest three: empty, interfaces, machines. Verdict: fail: all but `all`.

Set (verbatim): "Icons that look like a different set: 4 (data) and 9 (marks). 4 (data): a taller, heavier, detailed cylinder. 9 (marks): a different, bookmark-like shape with a bold checkmark." Verdict: fail, two named.

Studio (coin A = ours): "A. Cohesive, consistent two-tone geometry." Verdict: fail as written; the second round in a row the reader singled out ours.

### Round 4 (f2c1981), seed 41827

Blind (verbatim):

1. interfaces: browser window, top bar
2. tag... name "marks": tag with a dot (label/tag)
3. all: four rounded tiles, one a circle (app grid)
4. machines: gear with centre dot (cog)
5. data: database cylinder (stacked disks)
6. devices: monitor on a stand (computer display)
7. empty: empty inbox tray
8. security: shield with keyhole
9. connectivity: wifi signal fan
10. coding: terminal window with prompt (>_)

"3 gets 'all' mainly by elimination (a generic grid fits 'all' or 'interfaces'). 2 gets 'marks' by elimination too, since a tag has no obvious home among the other names." Verdict: all ten match; fail by elimination: all, marks.

Craft (verbatim defects):

1 all: uneven weight (dot vs squares)
2 coding: prompt glyph cramped, small
3 connectivity: confused silhouette (fan/wifi)
4 data: uneven band weight
5 devices: floating stand, bottom clipped
6 empty: confused silhouette (tray/handles)
7 interfaces: detail too small to read
8 machines: none
9 marks: confused silhouette (tag/hole)
10 security: keyhole detail small at size

Verdict: fail: nine; machines passes for the first time.

Set (verbatim): "Outlier: 3 (connectivity), because it has no inner outline, flat wedge. ... I'm not confident on this call: the sheet looks mostly like one set, so 3 is a marginal outlier." Verdict: pass, one named (connectivity, "no inner outline, flat wedge").

Studio (coin B = ours): "B. Consistent grid, shapes, weight." Verdict: fail as written. The third round in a row the reader picked our set, now with the coin flipped, so it is not a position bias.

### Round 5 (7bd4c1e), seed 63194

Blind (verbatim):

1. marks: bookmark/ribbon tag with a dot
2. data: database cylinder stack
3. devices: monitor/display on a stand
4. empty: open inbox tray, empty
5. coding: terminal window with a prompt (">_"; this is a glyph, not a letter or digit)
6. connectivity: wifi signal with a dot
7. all: four rounded squares grid (one darker)
8. interfaces: browser/window frame with title bar
9. security: shield with a keyhole
10. machines: gear/cog with a center hole

"1 (marks) is weak. A bookmark with a dot could be 'marks' by literal reading, but it also fits 'all' or 'interfaces'. 7 (all) is fairly weak. A four-square grid fits 'all' as a generic 'everything' icon, but it could also be 'interfaces' or 'machines'. 10 (machines) is a mild guess. The gear fits 'machines', but 'coding' or 'interfaces' would also be reasonable." Verdict: all ten match; fail by elimination: marks and all; machines a borderline pass ("a mild guess", not elimination).

Craft (verbatim defects):

1 all: none (top-left tile is darker, which looks intentional)
2 coding: inner prompt glyph slightly crowded
3 connectivity: top arc is oversized and clipped flat
4 data: bands uneven; dark stripe too heavy
5 devices: stand is a floating, confused wedge
6 empty: confused silhouette; tray/arrow unclear
7 interfaces: uneven weight; dark top bar heavy
8 machines: gear teeth too small and lumpy
9 marks: confused silhouette; reads as a generic bookmark
10 security: keyhole detail small; shield top edge is flat

Weakest three: empty, devices, connectivity. Verdict: fail, nine of ten (only `all` passes).

Set (verbatim): "Odd one out: 10 (security), because the keyhole shield has an outline. ... the plainest reason is 'different outline/detail style'." Verdict: pass, one named.

Studio (coin B = ours): "B. Consistent, cohesive, polished geometry." Verdict: fail as written; the fourth round in a row the reader picked ours, under both coin sides.

The cap of five rounds was reached with the set calibrated as it stands.

## Findings for the person

- **The studio reader picked our set in rounds 2 to 5, under both coin sides.**
  - Round 1 picked the reference ("Consistent, tight, purposeful metaphors."). Rounds 2 and 3 (A = ours) and rounds 4 and 5 (B = ours) picked ours: "Cohesive, consistent shared style.", "Cohesive, consistent two-tone geometry.", "Consistent grid, shapes, weight.", "Consistent, cohesive, polished geometry."
  - The studio read never answered "both", so it fails as written. It is not a position bias, because the coin flipped and the pick followed our set. The read as written asks for "both"; a reader that sees one set as more consistent may never say it. That is for the person to judge.
- **The craft read failed 9 of 10 in rounds 3, 4 and 5 (7 in round 1, 8 in round 2).** `all` passed in rounds 3 and 5, and `machines` in round 4. The set passes every measured rule and still reads as defective: silhouettes ("confused silhouette": empty, marks, connectivity, devices), parts that float (the stand of devices), and uneven weight (data, interfaces). The measured rules do not catch these.
- **Two names fail the blind read by elimination in each of rounds 4 and 5 (marks and all).** The history: `all` was named partly by elimination in round 1, passed round 2, competed with `interfaces` in round 3 (not elimination), and failed by elimination in rounds 4 and 5; `marks` passed rounds 1 to 3 and first failed by elimination in round 4. The marks tag and bookmark and the all grid are generic shapes: the reader names them only because the other eight names are taken. Rule 09 needs a more specific object for these two, and the bulk reference set itself does not give one; the ten names of the hairline set were chosen for the duotone finish.
- **The reference ink is calibrated on a set the craft read still faults.** `BULK_REFERENCE_INK[24]` = 111.6 is the median of this set; every later set is measured against it (weight within ±20% of the reference).
- **The accent of connectivity mixes two finishes** (a full-ink stroked line and a full-ink disc). It keeps the accent at 3 elements.
- **A fixture had to move, not a rule.** `sheet.test.mjs` fixture c failed the reference rule at 111.6 and was retuned.
- **From the trial, the skill's gaps (the evidence is in "The trial" below).**
  - The knockout halo reads as "floating" to the craft reader: notes search "handle detached" in every round; kitchen cup handle and kettle spout "float". The finish requires the 1.5 band, so the craft read and the rule contradict each other.
  - At bulk, a share of at most 0.6 plus the .4 body leaves no room for a concept made of several thin inner lines: the whisk could not be drawn (two wires cut most of the body, share 0.76, gaps 0.92), and the skill does not warn.
  - Weight and gravity cost most of the check runs (1 to 6 in both trials): thin icons fall under -15% of the median and dense ones rise over +15%.
  - `shapes.mjs dome --accent` prints `fill-opacity 0.2`; `squircle --rot` is ignored; `bulk.mjs` counts M and Z and splits arcs against `rules.md`; `knockout.mjs` writes a zero-length segment, merges close wires into one cut, and takes one file per call.
  - The studio read asks for the person's reference image and has no fallback when no person is present.

## The trial

Two trials, each by one fresh agent (opus) with no access to this conversation and only the skill as Task 12 left it, working in an empty scratch folder with no app. Both ran at the same time, on 2026-10-12. Each agent opened its own readers; then a fresh reader (sonnet), opened by the controller, read each final blind sheet (`sheet.mjs --seed=12`), so the verdict does not rest on the drawer's own readers. A trial passes when its drawer reported `ok` on check run 1 or 2 and the controller's blind read is 6 of 6, none by elimination.

### notes, bulk 24

The prompt as sent:

> Your working directory for this whole task is a scratch folder. It is empty, and there is no app in it. Run every command from there (cd into it first in each shell command), and write nothing outside it.
>
> Use the skill in `/Users/lucasmarques/estudos/skills/.claude/worktrees/pretty-icons-polish/skills/pretty-icons/SKILL.md` to draw six icons for the sidebar of a notes app; the sidebar text is 14px, in the bulk finish: inbox, calendar, chat, profile, search, upload. Nobody is available to answer questions, so where the skill says to ask, take its recommendation and say so. Follow every step, the reads included. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time, each icon's concept line, and each reader's answer.

The drawer took the skill's recommendations: bulk, grid 24 shown at 16px beside 14px text, plain `.svg` in `pretty-icons/`, preset grid 24, padding 2, stroke 2, band 1.5, body `fill-opacity .4`, accent a full fill or a 2px round line. It ran 20 check runs and 4 read rounds, and did not run the studio read (no reference image).

Each check run, as the agent reported it:

1. exit 1: gravity calendar +0,+0.59; share calendar 0.24; gravity chat -0.32,-0.83; keyline profile 16x19; share search 0.21; keyline upload 20x17.78; gravity upload +0.02,+1.15; weight chat 87.66 (-21.5% ref); weight inbox 115.23 (+20.0% vs median 96); weight search 82.07 (-26.5%); pixel notes chat, inbox
2. exit 1: gravity chat -0.34,-0.82; keyline search 19.03x19.03 -> circle 20; gravity search +0.51,+0.51; gravity upload +0.09,+1.04; weight chat 89.16 (-20.1%); weight upload 82.27 (-18.1% vs median 100.46; -26.3% ref); pixel notes
3. exit 1: gravity upload +0.09,+0.53; weight upload 82.27 (-21.7% vs median 105.12; -26.3% ref); pixel notes
4. exit 1: weight upload 85.12 (-19.0%; -23.7%); pixel notes
5. exit 1: gravity upload +0,+0.77; weight upload 87.45 (-16.8%; -21.6%)
6. exit 1: weight upload 89.14 (-15.2%; -20.1%)
7. exit 0: ok; pixel notes chat (1 of 2), inbox (3 of 3)
8. exit 1: weight chat 87.4 (-16.9%; -21.7%)
9. exit 1: weight chat 87.39 (-16.9%; -21.7%)
10. exit 0: ok
11. exit 0: ok (calendar redrawn as rings, header line and page)
12. exit 1: gravity chat -0.06,-1.09; diagonal search upper-left to lower-right -> lower-left to upper-right; weight inbox 119.14 (+15.8% vs median 102.85); pixel notes calendar, inbox
13. exit 0: ok (round 2 sheets)
14. exit 1: keyline chat 20x17 -> landscape 20x16 +/-0.5; gravity chat -0.1,-1.24; weight inbox 126.13 (+22.4% vs median 103.05); pixel notes calendar (1 of 3), chat (2 of 2), inbox (3 of 3)
15. exit 1: keyline inbox 20x15 -> landscape 20x16 +/-0.5; pixel notes calendar, chat
16. exit 1: weight inbox 120.53 (+17.0% vs median 103.05); pixel notes calendar, chat
17. exit 0: ok; pixel notes calendar (1 of 3), chat (2 of 2) (round 3 sheets)
18. exit 0: ok; pixel note chat (2 of 2) (round 3b sheets)
19. exit 1: keyline calendar 18x19 -> square 18x18 +/-0.5; pixel note chat
20. exit 0: ok; pixel note chat (2 of 2 straight strokes off the pixel at 24 px) (round 4 sheets, final)

`knockout.mjs` refused along the way, each fixed: calendar accents at 11 then 9 commands (limit 8); chat body at 18 commands (limit 14); a chat join of 22.6 degrees; search pill coordinates off the 0.25 grid.

Concept lines (final):

- inbox: tray, landscape. Rounded-rectangle body (r 4) with a slot line across it that dips.
- calendar: page, square. Rounded-rectangle body with two rings and a check mark, all in one line path.
- chat: speech bubble, landscape. Rounded bubble with a tail and two text lines.
- profile: person, portrait. Dome for the shoulders and a full head circle. Unchanged since round 1.
- search: magnifier, circle. Lens body with a full pill handle at the lower left, mirrored for the diagonal rule.
- upload: cloud, landscape. Cloud body with an up arrow inside.

The drawer's readers (a fresh agent every read):

- Round 1. Blind pass: inbox "A tray with a dip in the middle"; calendar "A page with two top tabs"; chat "A speech bubble with text lines"; profile "A head and shoulders silhouette"; search "A magnifying glass"; upload "A cloud with an up arrow". Craft, five fail: calendar "floating tabs, no ring/header"; chat "bubble lumpy, tail wobbly"; inbox "confused silhouette, tray unreadable"; profile "none"; search "handle detached, lens oversized"; upload "confused cloud bumps, arrow cramped". Set: "one set".
- Round 2. Blind pass: chat "speech bubble with text lines"; inbox "open tray with a dip"; upload "cloud with an up arrow"; calendar "binder page with two rings and a bar" (weakest: "could pass for a clipboard or plug"); profile "head and shoulders"; search "magnifying glass". Craft, five fail: calendar "confused silhouette, floating binder tabs, stray block" (a real knockout leftover); chat "uneven weight, text bars heavy, tail tiny"; inbox "confused silhouette, reads burger"; profile "none"; search "part floating, handle detached and heavier"; upload "confused silhouette, lumpy cloud, arrow halo crowds". Set pass, one named: upload "outlined cloud, different shading".
- Round 3. Blind pass: chat "speech bubble with text lines"; calendar "calendar page with checkmark"; inbox "open tray or box"; upload "cloud with up arrow"; search "magnifying glass, handle lower left"; profile "person, head and shoulders". Craft, five fail: calendar "wobbly lumpy cloud-like body"; chat "tail small, bubble lumpy"; inbox "detail too small to read"; profile "none"; search "lens floats off handle"; upload "confused silhouette (cloud vs. calendar)". Set pass, one named: profile "no outlined dark glyph, two-tone fill instead".
- Round 4 (final). Blind pass: calendar "calendar with a checkmark"; upload "cloud with an up arrow"; profile "head-and-shoulders person"; chat "speech bubble with text lines"; search "magnifying glass, handle lower left"; inbox "open inbox tray". Craft, four fail: chat "tail tiny, detached-looking"; inbox "confused silhouette, tray unreadable"; search "lens oversized, handle detached"; upload "confused silhouette, arrow cramped" (calendar "ring pins crowd checkmark" was not a listed defect: pass; profile "none"). Set pass, one named: search "circle is solid gray, not a ring lens".

The drawer's own words on what still fails: search "handle detached" every round, because the 1.5 knockout band always leaves a gap between a full handle and a .4 lens; inbox "confused silhouette" in rounds 1, 2 and 4; upload "confused silhouette" or a lumpy cloud every round; chat "tail tiny" in rounds 2 to 4. "A next pass needs new concepts (e.g. a ring lens for search, a tray-and-arrow for upload), not more tuning."

The controller's `check.mjs --print` on the final folder (exit 0):

```
┌─────────┬────────────┬──────┬──────┬───────┬───────┬─────────────┬────────┬───────┬───────┬────────┬──────────────────────────┬──────┐
│ (index) │ icon       │ x0   │ y0   │ w     │ h     │ keyline     │ ink    │ dx    │ dy    │ share% │ joins                    │ infl │
├─────────┼────────────┼──────┼──────┼───────┼───────┼─────────────┼────────┼───────┼───────┼────────┼──────────────────────────┼──────┤
│ 0       │ 'calendar' │ 3    │ 2    │ 18    │ 18.5  │ 'square'    │ 110.56 │ 0     │ 0     │ 38.2   │ '19 smooth · 5 corners'  │ 0    │
│ 1       │ 'chat'     │ 2    │ 5.5  │ 20    │ 16    │ 'landscape' │ 90.45  │ -0.1  │ -0.21 │ 42.3   │ '17 smooth · 5 corners'  │ 0    │
│ 2       │ 'inbox'    │ 2.25 │ 4.25 │ 19.5  │ 15.5  │ 'landscape' │ 115.02 │ 0     │ 0     │ 39.4   │ '14 smooth · 10 corners' │ 0    │
│ 3       │ 'profile'  │ 4    │ 2    │ 16    │ 20    │ 'portrait'  │ 103.99 │ 0     │ -0.31 │ 54.6   │ '3 smooth · 2 corners'   │ 0    │
│ 4       │ 'search'   │ 1.97 │ 2    │ 20.03 │ 20.03 │ 'circle'    │ 102.11 │ -0.19 │ 0.19  │ 37.8   │ '8 smooth · 0 corners'   │ 2    │
│ 5       │ 'upload'   │ 2    │ 2.56 │ 20    │ 16.44 │ 'landscape' │ 91.9   │ 0     │ 0.06  │ 30.3   │ '13 smooth · 5 corners'  │ 0    │
└─────────┴────────────┴──────┴──────┴───────┴───────┴─────────────┴────────┴───────┴───────┴────────┴──────────────────────────┴──────┘
notes
pixel  chat  2 of 2 straight strokes off the pixel at 24 px → their edges on whole pixels
ok
```

The controller's blind read (a fresh sonnet reader, `sheet.mjs --seed=12`, key: 1 upload · 2 search · 3 profile · 4 inbox · 5 calendar · 6 chat), verbatim:

> Mapping, from the image only:
>
> 1. upload: cloud with an up arrow
> 2. search: magnifying glass (circle lens, handle)
> 3. profile: person, head and shoulders
> 4. inbox: open tray with a slot
> 5. calendar: calendar with a checkmark
> 6. chat: speech bubble with text lines
>
> No two numbers compete for one name. No name was assigned only because the others were taken. I saw no letter or digit inside any icon. The only digits are the caption numbers 1 to 6 under the icons.

Blind: 6 of 6, none by elimination. Check clause: the first `ok` was on check run 7, not 1 or 2. **Fail.**

### kitchen, bulk 24

The prompt as sent: the same, with "six icons for the categories of a kitchen shop, in the bulk finish: kettle, whisk, rolling-pin, pot, cup, toaster" in place of the notes sentence.

The drawer ran 19 check runs and 5 blind rounds, and stopped at the hand-over: the blind read passed in round 5 after four failing rounds, the craft read and the set read failed and were not fixed. It took the skill's own setup (`pretty-icons/` in the working folder, the bulk preset, `examples/bulk`), did not emit, and did not run the studio read (no reference image; it runs only after craft and set pass). Its first `ok` was on run 7.

Each check run, as the agent reported it:

1. gravity cup -0.59,+0, kettle +0.71,+0.26, pot +0,-0.52; share rolling-pin 0.24, toaster 0.62, whisk 0.70; keyline whisk 19.34x19.34 -> circle 20; weight rolling-pin 83.95 (-19.0% vs median 103.67, -24.8% vs reference 111.6), toaster 137.9 (+33.0% / +23.6%), whisk 59.45 (-42.7% / -46.7%); pixel notes cup, pot
2. share whisk 0.68; weight rolling-pin 88.11 (-21.0% vs reference), toaster 119.52 (+17.1% vs median 102.08), whisk 56.74 (-44.4% / -49.2%); pixel notes cup, kettle
3. (`--print`) ink cup 104.57, kettle 99.59, pot 108.95, rolling-pin 90.69, toaster 114.38, whisk 76.93; gravity whisk +0.78,-0.78; weight whisk -24.6% / -31.1%; pixel notes
4. gravity whisk +0.73,-0.73; weight whisk 83.73 (-18.0% / -25.0%); pixel notes
5. gravity whisk +0.55,-0.63; weight whisk 88.98 (-20.3% vs reference); pixel notes
6. keyline whisk 19.25x19.75; gravity whisk +0.37,-0.51; pixel notes
7. pixel notes cup, kettle ("2 of 2 straight strokes off the pixel at 24 px"), then `ok`
8. gravity pot +0,-1.37, toaster -0.93,+0.26; share whisk 0.64; weight pot 143.31 (+40.7% vs median 101.85, +28.4% vs reference); pixel notes cup, kettle, toaster
9. pot: keyline 20x19 -> circle, gravity +0,-0.96, gap path@3[0]-[1] 1 apart (needs >= 1.5), air 1.2 wide at 12, 4.51; toaster: gravity -0.72,+0.27; whisk: keyline 18.5x18.75 -> square, gravity +0.67,-0.66, share 0.63; pixel notes
10. share whisk 0.60 (60.4%); pixel notes
11. pixel notes cup, kettle, then `ok`
12. an upright two-wire whisk: gravity +0,-1.04, gaps 0.92 between handle and wires, share 0.76, weight 82.02 (-19.2% vs median / -26.5% vs reference); reverted
13. pixel notes, then `ok`
14. share whisk 0.69; pixel notes
15. pixel notes, then `ok`
16. gravity toaster -0.51,+0.16; pixel notes
17. pixel notes, then `ok`
18. gravity cup -0.1,-0.51; pixel notes
19. note only "pixel kettle 2 of 2 straight strokes off the pixel", then `ok` (final)

Concept lines (final):

- cup: mug, square. Body with a flat rim and a round bottom, plus a C-handle line (a squircle until round 5).
- kettle: stovetop kettle, square. Dome body, a spout line and an arched handle line.
- pot: cooking pot, square. Squircle body and a flat lid line with a knob stub (started with side handles, then a full dome lid, too heavy).
- rolling-pin: rolling pin, diagonal (circle). Capsule body plus two end-handle lines.
- toaster: toaster, landscape. Squircle body, one full bread-slice accent (cap wider than the stem) and a lever line (earlier one or two plain slices).
- whisk: whisk, diagonal (circle). Balloon blob body, and a handle line that splits into two wire lines (earlier a lens loop, and an upright egg with two inner wires).

The drawer's readers (a fresh agent every read):

- Blind 1 (key 1 pot · 2 whisk · 3 toaster · 4 rolling-pin · 5 kettle · 6 cup): 1 pot read as "toaster, rounded slot body with bars above and below" (fail); 2 whisk "leaf or balloon head on diagonal handle", partly by elimination (fail); 3 toaster read as "pot, squat rounded body, dark dome on top", competing with 1 (fail); 4, 5, 6 pass: "diagonal oval roller with stick through it", "arched handle over spout body", "rounded body, C-shaped handle".
- Blind 2 (key 1 pot · 2 rolling-pin · 3 cup · 4 whisk · 5 toaster · 6 kettle): 4 whisk "leaf or feather shape on a diagonal handle", named only by elimination (fail); the others pass: "round pot with a lid line on top", "rounded pin with a stick through it" (could be a drumstick or lollipop), "mug body with a C-shaped handle", "low box with a dark slot on top and a side loop", "kettle with an arched handle and a short spout".
- Blind 3 (key 1 cup · 2 toaster · 3 whisk · 4 pot · 5 kettle · 6 rolling-pin): 2 toaster "low box, dome, oval slot", partly by elimination, "could pass as a squat mug or a lidded jar" (fail); the others pass: "rounded mug with side handle", "wire loop on a handle", "round pot with a flat lid", "spouted body with an arched handle", "dough-colored roller with stick handles".
- Blind 4 (key 1 whisk · 2 kettle · 3 cup · 4 pot · 5 rolling-pin · 6 toaster): 1 whisk "leaf-shaped loop on a stick", not a whisk (fail); 3 cup "mug with side handle" but named "because nothing else fits", like a mug on its side with a "D" handle (fail); the others pass: "spouted body, arched handle", "round body, flat lid", "rounded cylinder, diagonal handle rod", "box with bread slot, lever".
- Blind 5 (key 1 toaster · 2 pot · 3 whisk · 4 cup · 5 rolling-pin · 6 kettle): pass. "bread slice in a toaster body with a side lever"; "round body with a flat lid on top"; "wire loop on a long handle" (lowest confidence, could be a spoon or ladle); "mug body with a side handle"; "roller barrel with a handle through each end"; "domed body with a spout, a handle and a lid knob". No competition, no letters, no elimination.
- Craft (round 5, sheet order), fail: cup "handle floats, detached"; kettle "spout floats off body"; pot "none"; rolling-pin "none (handles slightly thin)"; toaster "confused silhouette, tiny slot"; whisk "confused silhouette, floating blob". Weakest three: whisk ("wire loop is a lone stroke on an unrelated shape"), toaster ("looks like a mug or a camera"), kettle (spout gap, flat-cut body); the cup a close fourth, its handle detached by the halo.
- Set (round 5), fail, two named: whisk "organic blob, thin stroke", the clearest outlier; toaster "cut-out gap, landscape proportions".

Open at the hand-over: whisk, toaster, cup and kettle. Fixing them would mean redrawing four of six, and two of those defects (the cup handle and the kettle spout read as "floating") are the knockout halo the finish requires. The cup and its handle also passed blind rounds 1 to 3 and failed round 4, and the whisk passed round 3 and failed round 4: the drawer's readers were not consistent between rounds.

The controller's `check.mjs --print` on the final folder (exit 0, after the drawer's last edit, run 19):

```
┌─────────┬───────────────┬──────┬──────┬──────┬───────┬─────────────┬────────┬───────┬───────┬────────┬─────────────────────────┬──────┐
│ (index) │ icon          │ x0   │ y0   │ w    │ h     │ keyline     │ ink    │ dx    │ dy    │ share% │ joins                   │ infl │
├─────────┼───────────────┼──────┼──────┼──────┼───────┼─────────────┼────────┼───────┼───────┼────────┼─────────────────────────┼──────┤
│ 0       │ 'cup'         │ 3.5  │ 3    │ 18   │ 18    │ 'square'    │ 106.09 │ -0.09 │ -0.4  │ 29.3   │ '9 smooth · 6 corners'  │ 0    │
│ 1       │ 'kettle'      │ 2.5  │ 3    │ 17.5 │ 18    │ 'square'    │ 99.59  │ 0.22  │ 0.11  │ 55.4   │ '8 smooth · 6 corners'  │ 0    │
│ 2       │ 'pot'         │ 3    │ 3    │ 18   │ 18    │ 'square'    │ 107.1  │ 0     │ -0.32 │ 36.1   │ '12 smooth · 0 corners' │ 0    │
│ 3       │ 'rolling-pin' │ 2    │ 2    │ 20   │ 20    │ 'circle'    │ 90.69  │ 0     │ 0     │ 25.7   │ '6 smooth · 0 corners'  │ 0    │
│ 4       │ 'toaster'     │ 2.25 │ 4.19 │ 19.5 │ 15.81 │ 'landscape' │ 107.24 │ -0.37 │ 0.16  │ 52.6   │ '18 smooth · 5 corners' │ 6    │
│ 5       │ 'whisk'       │ 2    │ 2.25 │ 19.5 │ 19.75 │ 'circle'    │ 95.86  │ 0.3   │ -0.3  │ 57.8   │ '8 smooth · 2 corners'  │ 11   │
└─────────┴───────────────┴──────┴──────┴──────┴───────┴─────────────┴────────┴───────┴───────┴────────┴─────────────────────────┴──────┘
notes
pixel  kettle  2 of 2 straight strokes off the pixel at 24 px → their edges on whole pixels
ok
```

The controller's blind read (a fresh sonnet reader on the final folder's sheet, `sheet.mjs --seed=12`, key: 1 whisk · 2 toaster · 3 rolling-pin · 4 pot · 5 cup · 6 kettle), verbatim:

> Image read. Assignments:
>
> 1 = whisk. Object: a wire whisk loop with a handle.
> 2 = toaster. Object: a toaster with a slot and a lever.
> 3 = rolling-pin. Object: a rolling pin with a stick through it.
> 4 = pot. Object: a lidded pot or casserole.
> 5 = cup. Object: a mug with a handle.
> 6 = kettle. Object: a kettle with a spout and handle.
>
> Competing names: none. Each number maps to one distinct name.
>
> Letters or digits inside any icon: none. The only digits I saw were the caption numbers 1 to 6 under the icons.
>
> Names assigned only because the others were taken: none. Number 2 is the least certain. It looks like a toaster with a bread shape and a lever, but the shape is ambiguous. Number 3 is also somewhat ambiguous. It reads as a rolling pin or possibly a skewered object, but the stick through the middle fits a rolling pin best.

Blind: 6 of 6, none by elimination. Check clause: the first `ok` was on check run 7, not 1 or 2. **Fail.**

Findings the kitchen drawer reported about the skill:

1. The kit squircle with a short side of 11 (radius 3) fails its own bend rule (1.62); use a short side of 12, radius 5.
2. `shapes.mjs dome --accent` prints `fill-opacity 0.2`, and the dome is inset about 1 per side at grid 24.
3. `squircle --rot` is ignored.
4. `bulk.mjs` counts M and Z and splits arcs, against how `rules.md` describes the 8-command accent limit; a two-slice toaster could not fit in 8 commands.
5. Symmetric blob anchors often fail bend.
6. `knockout.mjs` takes only one file per call.
7. `knockout.mjs` left a zero-length `L 10.14 17.39 L 10.14 17.39` segment in the whisk.
8. With two wires, `knockout.mjs` merged the space between them into one cut and removed most of the body.
9. The bulk share and weight limits, with the .4 body, make multi-wire concepts like a whisk nearly impossible; the skill does not warn.
10. The craft read calls the required knockout halo "floating" (cup handle, kettle spout), which contradicts the finish.
11. Blind readers are inconsistent between rounds.
12. `sheet.mjs` defaults to the system temp folder; one examples sheet went there before `--out` was given.
13. Pixel notes cannot be fixed by a 0.25 move with a stroke of 2.
14. The studio read needs the person's reference image, which was not provided.

### What the trial says

Both trials **fail** against the spec's success 3. Each drawer's first `ok` was on check run 7, not 1 or 2, in both trials (notes runs 1 to 6 exit 1; kitchen runs 1 to 6 exit 1). The controller's blind read is 6 of 6, none by elimination, in both, so that clause passes.

What the failures point at: weight (±15% of the median, ±20% of the reference 111.6) and gravity drove most of runs 1 to 6 in both trials; share and keyline came next. Neither drawer passed its own craft read (kitchen: whisk, toaster, cup and kettle named in round 5; its set read named whisk and toaster). The notes drawer's: search "handle detached" every round (the 1.5 band reads as a gap between a full handle and a .4 lens), inbox and upload "confused silhouette", chat "tail tiny". In the kitchen trial a whisk's several wires cannot be drawn at bulk (the knockout plus a share of at most 0.6), and the drawer's own reader failed the whisk. Candidates for a later change, for the person to judge: the weight band at bulk, which the first runs of both drawers broke by 15% to 47% on thin or on dense icons; a warning in the skill that icons resting on several thin inner lines (a whisk) do not fit bulk; and the handle gap of the 1.5 band.
