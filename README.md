# Skills

Skills for coding agents, each one a command away.

An agent can build the whole page and still get the visual parts wrong: an emoji where an icon should be, a gradient pretending to be depth, an illustration that never moves. Each skill here teaches one of those crafts, with the rules a person would otherwise have to explain every time.

Each one ships its output into your project and nothing else. No runtime to install, no account, no API key.

## Install

```bash
npx skills@latest add lucasmarkes/skills
```

Add `--skill <name>` to install just one.

## Why use it?

Agents don't have an eye for it yet

They know the code, not the craft. They pick the wrong light, the wrong material, the wrong motion, and nothing tells them the result looks cheap. The small misses add up, and the page reads as generated.

Every skill here writes down the decisions that make the result hold up, then checks the output against rules that can be measured, so you see the finished piece instead of the first draft.

## Reference

- **[specimen](./skills/specimen/SKILL.md)**: A glossy 3D icon on a soft tile, lit like a piece in a display case and looping, in a dark and a light theme. Ships as video (webm, mp4, poster) or live as a `<specimen-icon>` element that falls back to the poster.
- **[hairline-create](https://github.com/lucasmarkes/hairline/blob/main/skills/hairline-create/SKILL.md)**: Draws a new isometric line figure that answers the pointer, on the engine of [@lucasmarkes/hairline](https://github.com/lucasmarkes/hairline), and hands it over as one self-contained HTML file.
- **[hairline-adopt](https://github.com/lucasmarkes/hairline/blob/main/skills/hairline-adopt/SKILL.md)**: Takes an SVG you already have (an icon, a logo, an illustration) and rebuilds it as a Hairline figure with a gesture of its own.

The Hairline skills live with the library: `npx skills@latest add lucasmarkes/hairline`.
