# pretty-icons identity: reference

Spec: `docs/superpowers/specs/2026-10-09-pretty-icons-identity-design.md` · Plan: `docs/superpowers/plans/2026-10-09-pretty-icons-identity.md`

## examples/garage

```
┌─────────┬──────────────────┬──────┬──────┬───────┬───────┬─────────────┬────────┬──────┬──────┬───────┬─────────────────────────┬──────┐
│ (index) │ icon             │ x0   │ y0   │ w     │ h     │ keyline     │ ink    │ dx   │ dy   │ line% │ joins                   │ infl │
├─────────┼──────────────────┼──────┼──────┼───────┼───────┼─────────────┼────────┼──────┼──────┼───────┼─────────────────────────┼──────┤
│ 0       │ 'battery'        │ 4    │ 8    │ 40    │ 32.25 │ 'landscape' │ 321.07 │ 0    │ 1.55 │ 27    │ '2 smooth · 0 corners'  │ 0    │
│ 1       │ 'car'            │ 4    │ 9    │ 40    │ 31.25 │ 'landscape' │ 335.51 │ 0    │ 1.82 │ 38    │ '8 smooth · 6 corners'  │ 0    │
│ 2       │ 'fuel'           │ 8.75 │ 4    │ 31.25 │ 40    │ 'portrait'  │ 350.42 │ -2.6 │ 0.11 │ 35    │ '8 smooth · 2 corners'  │ 0    │
│ 3       │ 'gearshift'      │ 8    │ 4    │ 32    │ 39.75 │ 'portrait'  │ 317.12 │ 0    │ 0.73 │ 39    │ '0 smooth · 2 corners'  │ 0    │
│ 4       │ 'oil'            │ 8    │ 4.25 │ 32    │ 39.75 │ 'portrait'  │ 307.59 │ 0    │ 2.39 │ 28    │ '15 smooth · 3 corners' │ 0    │
│ 5       │ 'speedometer'    │ 4    │ 8    │ 40    │ 32    │ 'landscape' │ 270.4  │ 0    │ 1.68 │ 24    │ '7 smooth · 2 corners'  │ 0    │
│ 6       │ 'steering-wheel' │ 4    │ 4    │ 40    │ 40    │ 'circle'    │ 401.3  │ 0    │ 0    │ 32    │ '0 smooth · 2 corners'  │ 0    │
│ 7       │ 'traffic-light'  │ 8    │ 4    │ 32    │ 40    │ 'portrait'  │ 347    │ 0    │ 0    │ 42    │ '2 smooth · 2 corners'  │ 0    │
│ 8       │ 'tyre'           │ 4    │ 4    │ 40    │ 40    │ 'circle'    │ 402.44 │ 0    │ 0    │ 31    │ '0 smooth · 4 corners'  │ 0    │
│ 9       │ 'wrench'         │ 6.5  │ 4.56 │ 36.94 │ 36.94 │ 'square'    │ 260.13 │ 0.5  │ -0.5 │ 44    │ '3 smooth · 9 corners'  │ 0    │
└─────────┴──────────────────┴──────┴──────┴───────┴───────┴─────────────┴────────┴──────┴──────┴───────┴─────────────────────────┴──────┘
ok
```

What changed, per icon: tyre (a ring from the kit, hole 10; was a bar at 3.5 with a core), steering-wheel (a disc with a paper face; a ring weighed 529), gearshift (the gate at 1.5; was 3.5), speedometer (the needle's hub a dot r 2; was r 3.25 in the line tone), traffic-light (paper lenses and a dot), battery, car, oil (their line-tone parts in the shade tone). `REFERENCE_INK[48]` 341.3 → 328.3.

### Reads

Pending: run by the controller after this commit.
