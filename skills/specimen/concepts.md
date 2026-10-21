# Specimen concepts

What reads as a Specimen icon, what to make for a product area, and what went wrong while the examples were built. Read it before offering concepts.

## Objects that read well

The examples are the reference: each is one object a person names in under a second, with one motion.

- **Rocket** (`examples/rocket.specimen.js`) — a diagonal silhouette, the flame as the accent. Diagonals fill the square tile better than a vertical object.
- **Bolt** (`examples/bolt.specimen.js`) — a flat shape made thick with `geo.bevelExtrude`: the bevels catch the key light, so a 2D glyph becomes an object.
- **Bell** (`examples/bell.specimen.js`) — a lathe: anything round in section (bells, cups, vases, buttons, knobs, lenses) is one `geo.lathe` profile.
- **Lock** (`examples/lock.specimen.js`) — a body plus a chrome part that moves. A moving chrome part reads better than the whole object moving.
- **Chip** (`examples/chip.specimen.js`) — a flat object seen face on, with its detail on the face: the dynamic texture carries the motion.
- **Cube** (`examples/cube.specimen.js`) — many small parts of one colour told apart by finish alone. The proof that an icon needs no hue: gloss, matte, brushed, perforated and speckle stickers on the same black.
- **Key** (`examples/key.specimen.js`) — a stack of parts with a finish each (plate, skirt, top) and a lit legend; the press is the motion.
- **Gears** (`examples/gears.specimen.js`) — two parts that move together; the motion is mechanical, a tooth at a time, with a rest between ticks.

What makes an object read:
- **Chunky, soft and rounded.** Thick bevels, round corners, nothing thinner than ~0.02 units. Thin parts vanish at 64 px.
- **Black (or white) mass, chrome accents, one lit part.** The body is `mat.body`; one or two parts in `mat.chrome`; the accent only where light comes from (`mat.glow`, `mat.light`, the texture).
- **Two finishes or more.** A gloss top on a matte skirt, a brushed frame around a speckled body: the studio strips change character across the object, and that is what makes it look polished instead of plastic.
- **Faced slightly to the key light.** A small turn (`rotation.y` around ±0.3) shows the bevels; a flat front-on object looks like a sticker.
- **Depth in front of the tile.** Put the object at `z ≈ 0.45–0.5` so it floats over the tile with a little shadow.

## Metaphors by product area

| Area | Object | What moves |
|---|---|---|
| Auth, security, permissions | lock, key, shield | the shackle lifts, the key turns, a glint crosses the shield |
| Notifications, alerts | bell, envelope with a badge | the bell rings, the badge pops |
| Speed, performance, edge | bolt, stopwatch | a charge runs through, the hand sweeps |
| Launch, deploy, onboarding | rocket, paper plane | a roll, a flame flicker |
| Compute, infrastructure, AI | chip, server blade, cube | pulses across the die, LEDs blink |
| Storage, databases | stacked cylinder discs, a drawer | a disc lifts, the drawer slides |
| Email, messaging | envelope, speech bubble | a light passes over the flap, dots pulse |
| Integrations, APIs | plug and socket, linked rings | the plug seats, a pulse crosses the link |
| Shortcuts, input, commands | a keycap | the key presses and its legend lights |
| Puzzles, problem solving, modularity | a colourless puzzle cube | a layer snaps a quarter turn |
| Analytics, metrics | bar blocks, a dial | a bar rises, the needle swings |
| Search | magnifier | the lens glints as it tilts |
| Payments, billing | card, coin | the card turns, the coin spins a half turn and back |
| Scheduling, cron | clock, calendar block | the hand sweeps, a day lights |
| Settings, config, pipelines | meshed gears, slider knobs | the gears tick a tooth at a time, a knob slides |
| Global, CDN, regions | a globe of rings | the rings turn |
| Files, docs | a folded page, a folder | the corner lifts |

## Palettes

The colour is the person's to choose. Offer two or three with the concept, each a Tailwind 500 for the accent (the glow is a step lighter unless they say otherwise):

| Read | Accent | Fits |
|---|---|---|
| cool, technical | cyan `#22d3ee`, sky `#38bdf8`, violet `#8b5cf6` | infra, AI, security, dev tools |
| warm, an alert | amber `#f59e0b`, orange `#f97316`, rose `#f43f5e` | notifications, launches, billing |
| calm, growth | emerald `#10b981`, lime `#84cc16` | metrics, health, pipelines |
| none | zinc `#a1a1aa` with glow `#f4f4f5` | a monochrome grid; the object reads by its finishes |

A grid of icons on one page reads best with one palette or a deliberate set: suggest from the icons already there.

Prefer the literal object. An abstract shape that "means" a concept needs a caption, and a caption means the icon failed.

## What failed

- **The lock touched the top.** When the shackle lifted, its top came within a hair of the tile edge, and the icon looked cramped and cut. Fixed with `fit: { y: -0.083 }` so the lifted pose sits in the box. `validate.mjs` now checks every sampled frame, not just frame 0: the extreme pose is the one that touches.
- **The bolt went all yellow at the end.** A flash that filled the whole bolt at the end of each charge read as a colour change, not as light: the black body disappeared. Fixed with a short band that runs down, fades in and out, and pools in the tip. Light moves through the object; it never paints all of it.
- **Light leaked outside the tile.** The rocket's flame and the glow under the tile spilled past the tile edge, so the video showed a grey halo against the page. The runtime now composites everything outside the tile to the exact page colour, and `validate.mjs` fails a piece whose light shows outside the tile before compositing.
- **Recolouring for the light theme.** Mapping dark colours to light ones after rendering left glass and textured objects dark and made emissive detail vanish on white. That is why pieces ask for roles (`mat.body`, …) and never pick colours, and why the dynamic texture becomes pigment in the light theme.
- **Glow on white.** Added light does nothing on a surface that is already white. In the light theme glow shows as colour (pigment), and the accent pool is softer (`tint`).
- **The parts that name an object are small.** A keycap's legend sat under the top surface and vanished; raised to the face and lit, it named the key. Give the naming part chrome or light, and put it where the camera sees it.
- **Brushed too coarse read as wood.** Wide brushed lines on the white lock looked like wood grain, and on the black bolt they dulled the highlight. A brushed finish wants very fine lines; a body that should look lacquered takes `gloss` instead.
- **A thin strip flickered on the bolt.** The studio's hard strips reflected in the bolt's inner bevel as a line thinner than a pixel; as the bolt swayed it appeared, broke into dashes and vanished over a dozen frames. Making the gloss rougher did not help: the line is the strip, not the finish. The bolt takes `lights: { strips: 0 }`; check a turning piece frame by frame in the video, not only on the sheet.
- **A textured finish broke the loop.** A brushed map on a gear that turns one full tooth pitch moves with it, so frame 0 and the last frame differed. Symmetric parts that rotate keep plain chrome; a 5-hole gear on a 14-tooth wheel also broke the seam until the holes matched the turn (7).
- **A glowing core blew out the cube.** A light inside the puzzle cube, seen through the seams, flattened the finishes. The cube took a dark matte core instead: the finishes do the work.
- **The cube was too small.** Built at the size of the other examples, many small parts read as noise at 64 px. It took `fit.scale` 1.2: an object made of many parts needs more of the box.
- **A black tube sank into the dark tile.** Thin black parts read in the raster sheet and nearly vanished path traced. Keep black masses chunky (tube radius 0.12 or more), let chrome or a lit band trace them, and check the dark `--pt` cell before the render.
- **A tube's end looked cut.** `TubeGeometry` is open at both ends. Cap each end with a sphere of the same radius at the end point, or hide the join under a chrome collar.
- **Raster light strips.** The tile's accent lights showed as thin hard strips on glossy objects in raster. The raster stage keeps the object on environment light only; the path tracer gets the full rig.
