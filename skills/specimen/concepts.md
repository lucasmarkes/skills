# Specimen concepts

What reads as a Specimen icon, what to make for a product area, and what went wrong while the five examples were built. Read it before offering concepts.

## Objects that read well

The five examples are the reference: each is one object a person names in under a second, with one motion.

- **Rocket** (`examples/rocket.specimen.js`) — a diagonal silhouette, the flame as the accent. Diagonals fill the square tile better than a vertical object.
- **Bolt** (`examples/bolt.specimen.js`) — a flat shape made thick with `geo.bevelExtrude`: the bevels catch the key light, so a 2D glyph becomes an object.
- **Bell** (`examples/bell.specimen.js`) — a lathe: anything round in section (bells, cups, vases, buttons, knobs, lenses) is one `geo.lathe` profile.
- **Lock** (`examples/lock.specimen.js`) — a body plus a chrome part that moves. A moving chrome part reads better than the whole object moving.
- **Chip** (`examples/chip.specimen.js`) — a flat object seen face on, with its detail on the face: the dynamic texture carries the motion.

What makes an object read:
- **Chunky, soft and rounded.** Thick bevels, round corners, nothing thinner than ~0.02 units. Thin parts vanish at 64 px.
- **Black (or white) mass, chrome accents, one lit part.** The body is `mat.body`; one or two parts in `mat.chrome`; the accent only where light comes from (`mat.glow`, `mat.light`, the texture).
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
| Webhooks, integrations, APIs | plug and socket, a hook, linked rings | the plug seats, a pulse crosses the link |
| Analytics, metrics | bar blocks, a dial | a bar rises, the needle swings |
| Search | magnifier | the lens glints as it tilts |
| Payments, billing | card, coin | the card turns, the coin spins a half turn and back |
| Scheduling, cron | clock, calendar block | the hand sweeps, a day lights |
| Settings, config | gear, slider knobs | a slow turn, a knob slides |
| Global, CDN, regions | a globe of rings | the rings turn |
| Files, docs | a folded page, a folder | the corner lifts |

Prefer the literal object. An abstract shape that "means" a concept needs a caption, and a caption means the icon failed.

## What failed

- **The lock touched the top.** When the shackle lifted, its top came within a hair of the tile edge, and the icon looked cramped and cut. Fixed with `fit: { y: -0.083 }` so the lifted pose sits in the box. `validate.mjs` now checks every sampled frame, not just frame 0: the extreme pose is the one that touches.
- **The bolt went all yellow at the end.** A flash that filled the whole bolt at the end of each charge read as a colour change, not as light: the black body disappeared. Fixed with a short band that runs down, fades in and out, and pools in the tip. Light moves through the object; it never paints all of it.
- **Light leaked outside the tile.** The rocket's flame and the glow under the tile spilled past the tile edge, so the video showed a grey halo against the page. The runtime now composites everything outside the tile to the exact page colour, and `validate.mjs` fails a piece whose light shows outside the tile before compositing.
- **Recolouring for the light theme.** Mapping dark colours to light ones after rendering left glass and textured objects dark and made emissive detail vanish on white. That is why pieces ask for roles (`mat.body`, …) and never pick colours, and why the dynamic texture becomes pigment in the light theme.
- **Glow on white.** Added light does nothing on a surface that is already white. In the light theme glow shows as colour (pigment), and the accent pool is softer (`tint`).
- **Raster light strips.** The tile's accent lights showed as thin hard strips on glossy objects in raster. The raster stage keeps the object on environment light only; the path tracer gets the full rig.
