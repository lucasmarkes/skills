# AI set at bulk: hand-tuned v3 against the skill's v4 (2026-10-13)

Fifteen AI icons (sparkles, chat, wand, ai, chip, bot, image, doc, mic, cloud, search, idea, planet, head, agent), 24 grid.

| Folder | What it is | `check.mjs` |
|---|---|---|
| `v3/` | the hand-tuned bulk set the user calls the best line so far; stacks are `<mask>`s | fails at `--finish=bulk` (grid, bend, stroke, weight, count, stack, keyline, …) |
| `v4/` | the same metaphors redrawn by following the skill's bulk loop; stacks are `knockout.mjs` cuts | 13 of 15 pass; sparkles and wand fail weight only (ink 41 and 54 against ~103 needed) |
| `v4-duotone/`, `v4-filled/` | `translate.mjs v4 --to duotone\|filled` | `ok` with `--from=v4/` |
| `comparison.png` | rows: v3, v4, v4 duotone, v4 filled | |

## What the comparison shows

- v3 still reads as the better set. v4 is more even in weight, but it gets there by inflating the accent.
- Weight and share push the sparkle to the size of the subject: cloud, head, idea, bot and chat now read as "big black sparkle".
- Some shapes lost character under the rules: the bot lost its antenna, the chat bubble went soft, the mic became a heavy pill and the wand tip is shorter.
- Gains: masks became knockout cuts; the sparkles are on-grid cubics instead of Q joins at 12°; image, agent and planet balance better.
- A one-glyph icon (sparkles, wand) cannot reach the set's median ink without a backing tile or disc, which changes the metaphor.

## Open question

Loosen the rules rather than the drawing:

- exempt one-glyph icons from the weight median;
- cap the accent's size instead of asking it to carry ink.

Then redraw v4 and compare again.
