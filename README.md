# Skills

Skills for coding agents, each one a command away.

Most animated logos move the same way: a fade, a scale from 0.95, a stroke that draws itself. That motion is correct on any drawing and memorable on none. The motion worth shipping is already in the drawing: a part that stands apart, a hinge, a neck between two bodies, the verb an icon depicts.

These skills give the agent that judgement, and make it look at what it built before it shows you.

## Install

```bash
npx skills@latest add lucasmarkes/skills
```

Nothing to `npm install`. The scripts run on Node 22 and fetch what they need once, into your npm cache.

## Why use it?

Agents animate SVGs without looking at them.

Ask an agent to animate a logo and it spins the mark in from `opacity: 0`, breathes it in a loop that never pauses, and leans the whole drawing toward the pointer as one rigid shape. Three runs without the skill did exactly that, and none rendered a single frame. Two claimed a symmetry the drawing doesn't have and shipped a loop that jumps every period.

All of these come out the same on any drawing. None of them comes from this one.

`svg-animate` reads the drawing first. It proposes three animations only that drawing could have, renders every frame, and checks them: a sliver where two shapes meet, a flick on the last frame, a rest state that isn't the source. Only then does it show them to you in a gallery.

## Reference

- **[svg-animate](./skills/svg-animate/SKILL.md)** — Three animations a logo, icon or illustration already contains, shown in a gallery and delivered as SMIL or a React component with no dependency.
