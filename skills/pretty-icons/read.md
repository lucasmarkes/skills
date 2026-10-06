# The blind read

`check.mjs` proves the set is even. It cannot tell a shield from a leaf. That is the reader's job: a second agent that has seen none of your work.

## When

After `check.mjs` says `ok` and `sheet.mjs` has written `pretty-icons-blind.png`. Every time the set changes.

## How

Open a fresh agent with no access to this conversation. Give it the blind image and this prompt, with N and the names filled in, the names in alphabetical order:

> This image shows N numbered icons from one sidebar. Below are N names in alphabetical order: <names>. Read no file but the image. For each number, say the name it stands for and, in five words or fewer, the object you see. If two numbers compete for one name, say so. If you read a letter or a digit anywhere, name the icon. If a number gets its name only because the other names are taken, say so.

Compare its answers with the key `sheet.mjs` printed.

## Pass and fail

An icon passes when the reader gives its name, or names the object you declared in the concept (`security → "shield with a check"` counts). It fails when the reader gives a wrong name, says two numbers compete for one name, or says it does not know. An icon the reader names for a letter or a digit fails too, whatever name it gave: a letter in it makes it a badge (rule 09). So does an icon whose object fails (below).

A failed icon goes back to the drawing. Then the whole set runs `check.mjs` again (the median moved), `sheet.mjs` again, and a **new** reader gets the new sheet. A reader who saw the old sheet is not blind.

## What a reader gets first

Read the object the reader names, not only the name it picks. With the list in hand, a reader pairs by elimination: the last icon gets the last name. The object it names is what a person sees before they know the list. The reader paired all ten of `examples/hairline`, and still saw three of them as something else. Under the rule below, all three fail:

- `interfaces`, a window with a top bar, read as a credit card first. The reader said it could be filed under devices.
- `machines`, a disc with a hub, was paired only by elimination. It read as a disc, a target or a record.
- `marks`, a triangle over a circle, read as generic shapes.

Agents drawing without the skill made the drawings rule 09 lists. A reader with the list may still pair them.

An icon fails, whatever name the reader gave, when the reader says it got its name by elimination, or names an object that is neither the one you declared nor one that means the name: a credit card for interfaces, generic shapes for marks, a loading spinner for settings. Look for it in the five words the reader gives for the object. Redraw it. When you cannot, name it in the hand-over with what the reader saw.

## Without a second agent

Say so in the hand-over, in these words: **not read blind**. Do not read the sheet yourself and call it read.
