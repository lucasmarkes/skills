# pretty-icons filled finish: two runs without the skill

Two fresh agents got the same prompt and the reference image (a kitchen set in the filled-outline style: navy contour, flat colour, an offset shadow, a white highlight), with no access to `skills/pretty-icons`. Their files are kept as `test/pretty-icons/fixtures/filled-baseline-{a,b}`. The failures that recur are what `rules-filled.md` and the `filled` checks have to turn into passes.

## Prompt

> Draw six SVG icons in the style of the reference image at `<image>` (look at it first). The style: a dark outline, flat colour fills, the look of hand-made illustrated icons. The names: avocado, mushroom, bread, mug, whisk, apple. Write one file per icon, `<name>.svg`, into `<scratch>/baseline-craft-a/`. Make them match the reference's craft as closely as you can, and make them sit even as a set.
>
> Work only in that folder and read only the image; do not read any other files on this machine, do not search for or load any skills. When done, reply with: the folder path, then the rules you gave yourself to match the style (one line each).

## What both got right

Both saw the construction: a dark contour, a flat fill, a copy of the silhouette in a darker tone offset down and right under it, a short light stroke on the top-left of a round body. Run A wrote it down as "the misregistered-print look in the reference". The look is not the hard part; the set is.

## Run A (64 grid, stroke 2 / 2.5 / 3)

- **No one palette.** Six icons use 6 fills, 5 shadow tones and 4 highlight colours (`#fbf3e6`, `#fbe3b0`, `#fbe0d8`, `#f2d2a8`), each chosen per icon.
- **Three stroke widths** in one set, 3 for the contour and 2 or 2.5 for details, by feel.
- **The shadow through `<defs>` and `<use>`**: twelve `<use>` elements and six `<defs>`, plus one `<ellipse>`. A sheet or a sprite that only knows flat elements cannot read them.
- **Every silhouette is the same blob.** Bread, mug, mushroom and whisk are all drawn as an apple-shaped body with a notch at the top; a reader sees four apples. The agent's own rule, "simple chunky silhouettes", produced one silhouette.
- **Details in the contour colour**: bread scoring, mushroom spots and whisk loops in navy, where the reference draws them in a tone of the fill (white ticks on the carrot, darker holes on the cheese, green veins on the cabbage).
- **No keyline**: the subject fills "roughly 6 to 58", so a tall whisk and a squat bread differ in size by eye.

## Run B (64 grid, stroke 2 / 2.4 / 2.6 / 2.8)

- **Closer to the reference**: the mushroom is a mushroom, the mug a mug, the whisk a whisk.
- **No one palette**: twelve fills, each a hex of its own; the apple's shadow `#8e2a30` is nearly black-red where the reference's shadow is the fill one step darker; the apple's highlight is pink (`#f4a08f`), the mug's cream, the avocado's grey.
- **Four stroke widths**, 2.4 to 2.8, one per element by feel.
- **The shadow offset is `translate(2.2 2.2)`**, off any grid, and the mushroom's stem has no shadow while its cap does.
- **A `<g>` and an `<ellipse>`** in two of the files.
- **No keyline**: the mushroom is a head taller than the mug beside it.

## What the skill has to fix

1. One palette for the set: each colour a fill and its shade, the contour one ink, the highlight one paper. The agent picks from it; it does not mix.
2. One stroke, set once on the root; no element sets a width.
3. The shadow is the body's own geometry, translated by the preset's offset, with the body's shade and no stroke, as a flat element: no `defs`, no `use`.
4. Details (seeds, stripes, holes, veins) in the fill's shade or in paper, never in ink. Ink is for the silhouette and the separate parts (a stem, a handle, a lid).
5. A keyline the object lands on, measured without its shadow, so a whisk and a bread sit the same size.
6. Rect, circle, line and path, flat, and a sheet that composes them in colour.

## With the skill (GREEN)

A fresh agent got the skill (`SKILL.md`, `rules.md`, `rules-filled.md`, `examples/pantry`) and the same six names, for a recipes app's category grid at 48 px, with nobody to approve the concepts. Its files are kept as `test/pretty-icons/fixtures/filled-green`.

- **It chose the finish from the context**: filled on 48, because the card shows an illustrated icon in flat colour, and said so.
- **One palette, one stroke, the shadow as a pasted copy**: every failure the two baseline runs had is gone from the first file. Nothing in the set is a hex the palette does not hold; no element sets a width; every shadow is the body's `d` with `translate(3 3)`.
- **`check.mjs` printed `ok` on the fifth run.** Run 1: `elements` (a heredoc slip left stray `</svg>` lines), `keyline`, `gap`, `weight`. Run 2: `gap`, `gravity`, `keyline`, `weight`. Runs 3 and 4: `gap` only. The gap rule did most of the work: spots on a cap, wires in a balloon, a highlight by a handle.
- **The first blind read named five of six.** The reader named mushroom, apple, bread, mug and avocado from the picture, and gave the whisk its name by elimination: "grey wire bulb, brown handle; reads a bit like garlic or a bulb". Under `read.md` that fails. The agent had drawn the balloon as a solid grey body with the wires as shade details inside it.
- **The redraw made the wires ink parts and the handle the only body**; `check.mjs` printed `ok` on the second run (`gap`, the highlight against the handle, then dropped). A new reader named all six from the picture: "brown handle over wire loops".

What the run added to the skill: `rules-filled.md` 09 now says an object that is wires, a frame or a cage is ink parts with the one solid piece as its body, not a filled silhouette with the wires drawn on it.
