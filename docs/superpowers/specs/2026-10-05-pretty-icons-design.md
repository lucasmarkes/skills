# pretty-icons: a set of sidebar icons that measures the same

Date: 2026-10-05 · Repo: `lucasmarkes/skills` (new) · Skill: `skills/pretty-icons`

## Why

The Hairline site's shelf icons (`hairline/apps/site/components/catalogue.tsx`,
16-grid, stroke 1.5, a 20% fill under a line) were asked about twice: where
they came from, and why Coding sits smaller than Security in the same row.
Measured by rasterisation, the ten icons have no shared keyline (Coding is
12.5 × 10.5, Security 11.5 × 14), two constructions (Interfaces and Coding
have a fill with no contour and half the ink of the others), a 2.7× spread of
ink (41.9 to 113.9) and centres of mass up to 0.87 px off the canvas centre.
Each is a thing a script can measure. The skill is that script, with the
rules that make the set pass it, and a blind reader for what the script
cannot see.

## What success is

1. `check.mjs` rejects the ten current Hairline icons (on `keyline`,
   `construction`, `weight` and `gap`), accepts the corrected ten shipped as
   `examples/hairline`, and accepts ten Lucide icons at 24 converted to the
   duotone construction (so the tolerances are not narrower than a known
   good set).
2. A blind reader given the corrected set, unlabelled, pairs every icon with
   its name.
3. The corrected set replaces the current one in the Hairline site, in one
   PR, with no change to the row's CSS.

## Decisions

1. **One house style, scaled to the app.** The look is always the duotone:
   a stroke in `currentColor` with a `currentColor` fill at 20% under every
   closed body. What adapts to the app is the system: grid (16, 20 or 24),
   stroke, radii, and how the icons are consumed.
2. **The icons are delivered in the form the codebase already uses**
   (components, loose `.svg`, sprite), detected in the first step; loose
   `.svg` plus an index when nothing is detected.
3. **Recognisability is judged by a blind reader**: a second agent that sees
   the unlabelled sheet and the list of names and pairs them. The author's
   own look does not count.
4. **The validator rasterises.** `@resvg/resvg-js`, installed once into a
   cache outside the skill, renders each icon and the sheets; the measures
   (ink box, centre of mass, ink) come from pixels. Pure-geometry bounds
   would miss the two measures that explain the misalignment; a browser
   would add weight for nothing the sheet needs.
5. **No site.** The skill lives in `lucasmarkes/skills` and installs from
   there. A line on lucasmarkes.com/skills is out of scope.

## The system

### Presets

The person picks the grid the app uses. Everything below scales with it.
Keylines follow Material's proportions: the circle fills the live area, the
square is 90% of it, portrait and landscape are 80% on one side.

| Grid | Stroke | Padding | Live | Circle | Square | Portrait | Landscape | Radius ≥ 8 / < 8 | Min gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | 1.5 | 1 | 14 | 14 | 12.5 | 11 × 14 | 14 × 11 | 1.5 / 1 | 1.5 |
| 20 | 1.5 | 1 | 18 | 18 | 16 | 14 × 18 | 18 × 14 | 2 / 1 | 1.5 |
| 24 | 2 | 2 | 20 | 20 | 18 | 16 × 20 | 20 × 16 | 2 / 1 | 2 |

Keyline sizes are sizes of **ink**: the stroke's outer edge, not the
element's geometry. `rules.md` carries the geometry that lands on each
keyline, so the agent copies a body instead of inventing coordinates:

| Grid | Circle | Square | Portrait | Landscape |
| --- | --- | --- | --- | --- |
| 16 | `cx 8 cy 8 r 6.25` | `x 2.5 y 2.5 w 11 h 11` | `x 3.25 y 1.75 w 9.5 h 12.5` | `x 1.75 y 3.25 w 12.5 h 9.5` |
| 20 | `cx 10 cy 10 r 8.25` | `x 2.75 y 2.75 w 14.5 h 14.5` | `x 3.75 y 1.75 w 12.5 h 16.5` | `x 1.75 y 3.75 w 16.5 h 12.5` |
| 24 | `cx 12 cy 12 r 9` | `x 4 y 4 w 16 h 16` | `x 5 y 3 w 14 h 18` | `x 3 y 5 w 18 h 14` |

Fill opacity is 0.2 in every preset. Dashes are allowed (`stroke-dasharray`),
with dash and gap each at least one stroke.

### The ten rules

Written in `rules.md` in the hairline-create form: what it says, how to keep
it, when it is rejected. `[m]` marks a rule `check.mjs` measures from pixels;
the others it reads from the SVG's text.

1. **grid** — one canvas, `viewBox="0 0 G G"`, every number a multiple of
   0.25, no ink outside the live area. `[m]`
2. **keyline** — each icon takes the format that describes it (circle,
   square, portrait, landscape) and its ink box lands on that keyline within
   ±0.5 on each side. `[m]`
3. **stroke** — one width from the preset, centred, round caps and joins,
   `currentColor`; nothing else in the file sets a colour, a width or an
   opacity other than the fill's.
4. **construction** — a body is a contour plus the 20% fill; a detail is a
   line with no fill. Never a fill without a contour, never a solid shape.
5. **weight** — each icon's ink is within ±15% of the set's median. With
   fewer than three icons, the median is taken from the reference values in
   `rules.md`, scaled by (G / 16)². `[m]`
6. **gravity** — the centre of mass of the ink is within 0.5 units of the
   canvas centre on each axis. The box may sit off centre; the mass may not.
   `[m]`
7. **radius** — by the preset: shapes of 8 units or more take the larger
   radius, smaller ones the smaller.
8. **gap** — distinct elements are at least one stroke apart, outer edge to
   outer edge, or share an edge exactly. Between 0.1 and one stroke is
   "almost", and rejected. `[m]`
9. **metaphor** — one object per icon, at most three elements, nameable in
   one or two words; no letters or digits unless the glyph is the subject
   (braces for code).
10. **set** — every icon in a set shares the preset, and a new icon is
    measured against the icons already there, never alone.

Measures are made at 32× in black on transparent; a pixel is ink when its
alpha exceeds 5%. Ink is Σ alpha / 32², in canvas units squared, so the 20%
fill weighs a fifth of a stroke. The tolerances in 2, 5, 6 and 8 are
hypotheses; the acceptance tests under "What success is" are what fixes them.

## The skill

`/pretty-icons [what needs icons]`. Five steps; the SKILL.md ends with a
"what goes wrong" table as hairline-create's does.

### 1. Read

The argument is a list of names, a path (a sidebar component, a nav array),
or nothing; with nothing, the skill looks for the app's navigation and its
existing icons. It writes three facts back before drawing:

- the names to cover;
- the grid and stroke: measured from icons the app already has, or the
  preset nearest the row's text size;
- how the app consumes icons: React components (and any wrapper like
  `svg(children)`), loose `.svg` files, or a sprite.

If the app already has a set in this style, the new icons join it and are
measured against it (rule 10).

### 2. Conceive

One line per name: *object, keyline format, elements*. For example
`security — shield, portrait, body + check`. The person approves the whole
list at once or swaps metaphors. With nobody to ask, the skill takes the most
conventional metaphor for each and says which it took. A name that will not
fit one or two words is split or handed back.

### 3. Draw

One `.svg` per icon in a working folder `pretty-icons/`, from `rect`,
`circle`, `line` and short `path`s only, starting from the body geometry in
`rules.md` for the chosen keyline.

### 4. Check

`node check.mjs pretty-icons/` until it exits 0. Then
`node sheet.mjs pretty-icons/` and the blind read (below). Back to 3 until
both pass.

### 5. Hand over

`node emit.mjs pretty-icons/ --as <svg|react|sprite> --to <path>` writes the
set where the app consumes icons. The hand-over says, one line each: the
preset; the reader's result (which icons failed first and what changed);
anything not measured or not read blind.

### Adjust

A requested change edits only that icon's `.svg`, then repeats 4 and 5 for
the whole set: weight and median belong to the set.

## The scripts

All three are self-contained ES modules in the skill folder, run from the
person's working directory by their path, with no install in the repo.

### `check.mjs <folder>`

Reads every `.svg` in the folder as one set. Two layers.

Text (always runs, no dependency):

- `canvas` — `viewBox="0 0 G G"`, the same G in every file, G in a preset.
- `elements` — only `rect`, `circle`, `line`, `path`; no `text`, `image`,
  `filter`, `defs`, `style`, `transform`, `g`.
- `stroke` — the preset's width, `round`/`round`, `currentColor`; no other
  colour, width or opacity attribute (rule 3).
- `construction` — every closed element has a contour; fill is
  `currentColor` at 0.2; lines have `fill="none"` or none (rule 4).
- `grid` — every number a multiple of 0.25 (rule 1).
- `radius` — `rx` by the shape's size (rule 7).
- `count` — at most three elements, at most eight commands per path
  (rule 9).

Measured (needs the rasteriser):

- `live` — ink inside the live area (rule 1).
- `keyline` — ink box within ±0.5 of one keyline; prints which matched
  (rule 2).
- `weight` — ink within ±15% of the set's median (rule 5).
- `gravity` — centre of mass within 0.5 of the centre (rule 6).
- `gap` — for each pair of elements, the distance between their stroked
  outlines: 0 (shared edge, endpoints on the other's outline within 0.1),
  or at least one stroke; paths are sampled (rule 8).

Each failure is one line: `rule  icon  measured → expected`. Exit 1 on any
failure, `ok` and exit 0 otherwise. Exit 2 when the rasteriser is missing and
cannot be installed: the text layer's lines are printed and the last line
says `not measured`. `--print` prints the measures of every icon as a table,
for calibration and for the reference values in `rules.md`.

### `sheet.mjs <folder>`

Composes an SVG and rasterises it with the same engine. Two outputs:

- `pretty-icons-sheet.png`, for the author: the set in rows with its label,
  at the proportions of a sidebar row, at 1× and 2×, light and dark; then one
  tile per icon with its ink box drawn over the keyline it matched.
- `pretty-icons-blind.png`, for the reader: icons only, at 2×, in a shuffled
  numbered order. The key (number → name) goes to stdout.

The sheet's text uses the system font resvg finds, or resvg's default. The
sheet is for looking, never delivered.

### `emit.mjs <folder> --as <format> --to <path>`

Converts and writes; never draws, never moves a coordinate. Runs only after
`check.mjs` exits 0 (it runs the check itself first).

- `svg` — copies the files; writes `index.ts` with one import per icon when
  the app is TypeScript.
- `react` — one file, one component per icon, in the pattern of the icons
  the app already has (props, `aria-hidden`, naming); through the app's
  wrapper when it has one.
- `sprite` — one `<svg>` with a `<symbol id>` per icon.

### The dependency

`@resvg/resvg-js`, installed once by `check.mjs` into
`~/Library/Caches/pretty-icons` on macOS, `%LOCALAPPDATA%\pretty-icons` on
Windows, `~/.cache/pretty-icons` elsewhere (`PRETTY_ICONS_CACHE` moves it),
never into the skill or the working directory. The first run says what it
installed. Without Node, the SKILL.md tells the agent to answer the text
checks from the file by hand and to say `not measured` in the hand-over.

## The blind read

After `check.mjs` and `sheet.mjs` pass, the author opens a second agent with
no access to the conversation, gives it `pretty-icons-blind.png` and the
names in alphabetical order. The prompt is fixed, in `read.md`:

> This image shows N numbered icons from one sidebar. Below are N names in
> alphabetical order. Read no file but the image. For each number, say the
> name it stands for and, in five words or fewer, the object you see. If two
> numbers compete for one name, say so.

An icon passes when the reader gives its name, or names the object the
concept declared (`security → "shield with a check"` counts). It fails on a
wrong name, two icons competing for one name, or "don't know". A failed icon
goes back to step 3; the whole set is checked again (the median moved) and a
**new** reader gets the new sheet, because one who saw the old sheet is no
longer blind. Without a second agent, the hand-over says: **not read blind**.

Pairing rather than an open question: with the list in hand the reader does
what the person does in the real sidebar, reading an icon while knowing
which categories exist.

## The repo

```
skills/
  README.md                 what is here, one line per skill, the install command
  LICENSE
  package.json              devDependencies for the tests only; no skill depends on it
  skills/
    pretty-icons/
      SKILL.md              the five steps, "what goes wrong"
      rules.md              the ten rules, the presets, the body geometry per keyline, reference ink values
      read.md               the reader's prompt and the pass/fail criterion
      check.mjs  sheet.mjs  emit.mjs
      examples/
        hairline/           the ten corrected Hairline icons, the set the skill cites as its bar
  test/
    pretty-icons/
      fixtures/
        hairline-before/    the ten current icons, which check rejects
        lucide-duotone/     ten Lucide icons at 24, converted, which check accepts
      check.test.mjs  sheet.test.mjs  emit.test.mjs
  docs/superpowers/specs/   this file
```

Install: `npx skills add lucasmarkes/skills`; the CLI asks which skill, from
the `skills/<name>/SKILL.md` layout skills.sh reads. `hairline-create` stays
in the hairline repo, beside its kernel.

## Out of scope

The site; the line in lucasmarkes.com's `lib/skills.ts`; grids other than
16, 20, 24; styles other than the duotone; animation; icons that are
illustrations or logos.
