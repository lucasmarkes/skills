# The blind read

`check.mjs` proves the set is even. It cannot tell a shield from a leaf. That is the reader's job: a second agent that has seen none of your work.

## When

After `check.mjs` says `ok` and `sheet.mjs` has written `pretty-icons-blind.png`. Every time the set changes.

## How

Open a fresh agent with no access to this conversation. Give it the blind image and this prompt, with N and the names filled in, the names in alphabetical order:

> This image shows N numbered icons from one app. Below are N names in alphabetical order: <names>. Read no file but the image. For each number, say the name it stands for and, in five words or fewer, the object you see. If two numbers compete for one name, say so. If you read a letter or a digit anywhere, name the icon. If a number gets its name only because the other names are taken, say so.

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

## The craft read

The blind read proves each icon names its object. It cannot say one is drawn badly. After the blind read passes, open another fresh agent, one that has seen neither your work nor the first reader's answers. Give it `pretty-icons-sheet.png`, which has no reference row and labels each icon by its name, not a number: number them for the reader in the sheet's order, top to bottom, and give it the list. Then this prompt, with N filled in:

> These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.

An icon fails when the reader names a defect from that list for it. A modifier floats by design, since its halo is the gap rule 08 asks for: "floating" said of the badge, dot, slash or lock alone is not a defect, while said of a part of the body it is. A confused silhouette counts on any icon, modified or not. An icon among the three weakest with no defect named passes; say it in the hand-over with the reader's reason. A failed icon goes back to the drawing (`SKILL.md` step 3), then the whole set runs `check.mjs`, `sheet.mjs`, the blind read and the craft read again, each with a **new** reader.

## The set read

The craft read judges each icon. It cannot say one belongs to another set. After the craft read passes, open a third fresh agent, one that has seen neither your work nor the other readers' answers. Give it `pretty-icons-sheet.png`, numbered in the sheet's order as for the craft read, and this prompt, with N filled in:

> These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does.

The set passes when the reader says "one set" or names one icon; say that icon in the hand-over with the reader's words. An icon named with a hedge ("possibly", "borderline") still counts as named. Two or more named go back to the drawing (`SKILL.md` step 3), each with the reader's words: "thick lines" is the line weight (`rules-filled.md` 03), "too dark" or "solid" is contrast (11), "cartoon" or "another library" is usually a second contour or a part filled in the line tone (04). Then the whole set runs `check.mjs`, `sheet.mjs` and the three reads again, each with a **new** reader. "Floating" said of a modifier does not count, as in the craft read.

## Without a second agent

Say so in the hand-over, in these words: **not read blind**, **not read for craft** and **not read as a set**. Do not read the sheet yourself and call it read.
