# SVG Pattern Library

The visual vocabulary of the deck. Being disciplined about reusing a small set of patterns matters
more than being clever: once a learner has seen "two panels, dashed border on the bad one" twice,
they instantly know how to read the third. Pick the pattern by concept TYPE, then adapt.

Every snippet assumes the template's conventions: `viewBox="0 0 1100 380"` (height 300–430 as
needed), shapes inside `<g filter="url(#rough)">` groups, ALL `<text>` outside filtered groups,
text classes `.lbl` (21px) / `.lbl-sm` (17px) / `.lbl-g` (17px gray) / `.lbl-b` (23px bold) /
`.num` (24px bold).

## Choosing a pattern

| Concept type | Pattern |
|---|---|
| List of N things (objectives, checklist) | Numbered rows |
| Old vs new, wrong vs right, A vs B | Two panels (dashed = negative) |
| Process / data flow | Pipeline (box → arrow → box) |
| Architecture with a center | Hub and spokes |
| File / bundle / format internals | Anatomy (big rect, labelled inner rects) |
| Progression / growth over time | Staircase |
| System with a boundary (host vs container, trust zone) | Boundary box (dashed zone) |
| Swappable backends behind one interface | Socket (engines → interface → consumer) |
| Decision with branches | Fork (question box → two labelled paths) |
| Loop / cycle (feedback, agentic loop) | Cycle (boxes arranged in a ring, arrows closing the loop) |
| Single big metaphor (title/closing slides) | Icon anchor (one drawn object + caption) |

## Numbered rows (lists, objectives)

Circles down the left with `.num` digits, `.lbl` text rows to the right. 5 rows fit a 400-high
viewBox; for 4 rows use y = 90/170/250/330.

```html
<svg viewBox="0 0 1100 400" role="img" aria-label="Five learning objectives">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.4">
    <circle cx="120" cy="70" r="24"/><circle cx="120" cy="140" r="24"/>
    <circle cx="120" cy="210" r="24"/><circle cx="120" cy="280" r="24"/>
    <circle cx="120" cy="350" r="24"/>
  </g>
  <g class="num" text-anchor="middle">
    <text x="120" y="78">1</text><text x="120" y="148">2</text><text x="120" y="218">3</text>
    <text x="120" y="288">4</text><text x="120" y="358">5</text>
  </g>
  <g class="lbl" text-anchor="start">
    <text x="170" y="78">First objective, one line, max ~65 chars</text>
    <text x="170" y="148">Second objective</text>
    <text x="170" y="218">Third objective</text>
    <text x="170" y="288">Fourth objective</text>
    <text x="170" y="358">Fifth objective</text>
  </g>
</svg>
```

## Two panels — comparison (dashed = the negative/old side)

The dashed border + gray ink says "we're leaving this behind" without a single word.

```html
<svg viewBox="0 0 1100 400" role="img" aria-label="Old way vs new way">
  <g filter="url(#rough)" fill="none" stroke="#757575" stroke-width="2.4" stroke-dasharray="9 7" stroke-linecap="round">
    <rect x="60" y="60" width="400" height="300" rx="12"/>
  </g>
  <text x="260" y="95" text-anchor="middle" class="lbl-g" style="font-size:19px">The old way</text>
  <g fill="var(--gray)" font-size="18px" text-anchor="start">
    <text x="95" y="150">point one</text>
    <text x="95" y="200">point two</text>
    <text x="95" y="250">point three</text>
  </g>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round">
    <path d="M485,210 L615,210" marker-end="url(#ah)"/>
  </g>
  <text x="550" y="196" text-anchor="middle" class="lbl-g">becomes</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.8" stroke-linecap="round">
    <rect x="640" y="60" width="400" height="300" rx="12"/>
  </g>
  <text x="840" y="95" text-anchor="middle" class="lbl" style="font-size:19px;font-weight:700">The new way</text>
  <g fill="var(--ink)" font-size="18px" text-anchor="start">
    <text x="675" y="150">point one</text>
    <text x="675" y="200">point two</text>
    <text x="675" y="250">point three</text>
  </g>
</svg>
```

## Pipeline (flows, lifecycles)

3–4 stages fit comfortably; 5+ gets cramped — split the slide instead. Two-line labels: two
`<text>` elements 28px apart, both centered on the box.

```html
<svg viewBox="0 0 1100 320" role="img" aria-label="Four-stage pipeline">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.6" stroke-linecap="round">
    <rect x="40" y="120" width="210" height="90" rx="10"/>
    <rect x="300" y="120" width="210" height="90" rx="10"/>
    <rect x="560" y="120" width="210" height="90" rx="10"/>
    <rect x="820" y="120" width="240" height="90" rx="10"/>
    <path d="M255,165 L295,165" marker-end="url(#ah)"/>
    <path d="M515,165 L555,165" marker-end="url(#ah)"/>
    <path d="M775,165 L815,165" marker-end="url(#ah)"/>
  </g>
  <text x="145" y="173" text-anchor="middle" class="lbl">Stage 1</text>
  <text x="405" y="173" text-anchor="middle" class="lbl">Stage 2</text>
  <text x="665" y="173" text-anchor="middle" class="lbl">Stage 3</text>
  <text x="940" y="173" text-anchor="middle" class="lbl">Stage 4</text>
  <text x="550" y="255" text-anchor="middle" class="lbl-g">optional axis caption under the flow</text>
</svg>
```

## Hub and spokes (gateways, shared services)

```html
<svg viewBox="0 0 1100 400" role="img" aria-label="Hub with four spokes">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="3">
    <rect x="450" y="160" width="200" height="90" rx="12"/>
  </g>
  <text x="550" y="213" text-anchor="middle" class="lbl-b">Hub</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.2">
    <rect x="80" y="60" width="180" height="70" rx="8"/>
    <rect x="80" y="270" width="180" height="70" rx="8"/>
    <rect x="840" y="60" width="180" height="70" rx="8"/>
    <rect x="840" y="270" width="180" height="70" rx="8"/>
  </g>
  <g class="lbl-sm" text-anchor="middle">
    <text x="170" y="102">Spoke A</text><text x="170" y="312">Spoke B</text>
    <text x="930" y="102">Spoke C</text><text x="930" y="312">Spoke D</text>
  </g>
  <g filter="url(#rough)" fill="none" stroke="#757575" stroke-width="2" stroke-linecap="round">
    <path d="M265,105 L445,175" marker-end="url(#ahg)"/>
    <path d="M265,300 L445,235" marker-end="url(#ahg)"/>
    <path d="M835,105 L655,175" marker-end="url(#ahg)"/>
    <path d="M835,300 L655,235" marker-end="url(#ahg)"/>
  </g>
</svg>
```

## Anatomy (file formats, bundles, manifests)

One big outlined rect = the artifact; inner rects = its parts. Ideal for "what's inside X".

```html
<svg viewBox="0 0 1100 400" role="img" aria-label="Anatomy of the artifact">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.6">
    <rect x="360" y="40" width="380" height="330" rx="12"/>
  </g>
  <text x="550" y="72" text-anchor="middle" class="lbl-g">artifact-name</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2">
    <rect x="390" y="90" width="320" height="42" rx="6"/>
    <rect x="390" y="140" width="320" height="42" rx="6"/>
    <rect x="390" y="190" width="320" height="42" rx="6"/>
    <rect x="390" y="240" width="320" height="42" rx="6"/>
  </g>
  <g class="lbl-sm" text-anchor="start">
    <text x="405" y="117">part one</text>
    <text x="405" y="167">part two</text>
    <text x="405" y="217">part three</text>
    <text x="405" y="267">part four</text>
  </g>
  <g filter="url(#rough)" fill="none" stroke="#757575" stroke-width="2" stroke-linecap="round">
    <path d="M300,111 L385,111" marker-end="url(#ahg)"/>
  </g>
  <text x="150" y="116" text-anchor="middle" class="lbl-g">annotation</text>
</svg>
```

## Staircase (progressions, build ladders)

Rects of increasing height on a shared baseline; the final (tallest) one gets `.lbl-b`.

```html
<svg viewBox="0 0 1100 380" role="img" aria-label="Rising staircase of stages">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.6" stroke-linecap="round">
    <rect x="70" y="300" width="110" height="40" rx="6"/>
    <rect x="200" y="265" width="110" height="75" rx="6"/>
    <rect x="330" y="230" width="110" height="110" rx="6"/>
    <rect x="460" y="195" width="110" height="145" rx="6"/>
    <rect x="590" y="160" width="110" height="180" rx="6"/>
    <rect x="850" y="80" width="150" height="260" rx="6"/>
    <path d="M40,345 L1010,345"/>
  </g>
  <text x="125" y="325" text-anchor="middle" class="lbl-sm">step 1</text>
  <text x="255" y="308" text-anchor="middle" class="lbl-sm">step 2</text>
  <text x="925" y="210" text-anchor="middle" class="lbl-b">Goal</text>
</svg>
```

## Boundary box (host vs container, trust zones)

Dashed outer rect = the boundary; label it in the top-left corner. Solid rects inside = what
lives there. Great for "what runs where" — the defining diagram of many infra topics.

```html
<svg viewBox="0 0 1100 400" role="img" aria-label="Host boundary containing services">
  <g filter="url(#rough)" fill="none" stroke="#757575" stroke-width="2.2" stroke-dasharray="4 6">
    <rect x="40" y="50" width="1020" height="320" rx="16"/>
  </g>
  <text x="70" y="80" class="lbl-g" text-anchor="start">The boundary (label it)</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="3">
    <rect x="90" y="150" width="330" height="150" rx="12"/>
  </g>
  <text x="255" y="215" text-anchor="middle" class="lbl-b">Thing inside</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.6" stroke-dasharray="10 6">
    <rect x="620" y="120" width="400" height="210" rx="12"/>
  </g>
  <text x="820" y="150" text-anchor="middle" class="lbl-g">Nested zone</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round">
    <path d="M615,225 L425,225" marker-end="url(#ah)"/>
  </g>
  <text x="520" y="210" text-anchor="middle" class="lbl-g">connection label</text>
</svg>
```

## Socket (one interface, swappable backends)

Backends stack on the left, gray arrows converge on a socket (rect with two circle "pins"), one
black arrow continues to the consumer: "swap what's behind, the consumer never notices."

```html
<svg viewBox="0 0 1100 360" role="img" aria-label="Swappable engines behind one socket">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.4">
    <rect x="70" y="70" width="200" height="60" rx="8"/>
    <rect x="70" y="150" width="200" height="60" rx="8"/>
    <rect x="70" y="230" width="200" height="60" rx="8"/>
  </g>
  <g class="lbl" text-anchor="middle">
    <text x="170" y="108">Backend A</text><text x="170" y="188">Backend B</text><text x="170" y="268">Backend C</text>
  </g>
  <g filter="url(#rough)" fill="none" stroke="#757575" stroke-width="2" stroke-linecap="round">
    <path d="M275,100 L470,175" marker-end="url(#ahg)"/>
    <path d="M275,180 L470,180" marker-end="url(#ahg)"/>
    <path d="M275,260 L470,185" marker-end="url(#ahg)"/>
  </g>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="3">
    <rect x="480" y="120" width="180" height="130" rx="14"/>
    <circle cx="540" cy="165" r="10"/><circle cx="600" cy="165" r="10"/>
    <line x1="570" y1="195" x2="570" y2="225"/>
  </g>
  <text x="570" y="105" text-anchor="middle" class="lbl-g">the stable interface</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.4" stroke-linecap="round">
    <path d="M665,185 L780,185" marker-end="url(#ah)"/>
    <rect x="800" y="140" width="230" height="90" rx="12"/>
  </g>
  <text x="915" y="180" text-anchor="middle" class="lbl-b">Consumer</text>
  <text x="915" y="210" text-anchor="middle" class="lbl-g">never changes</text>
</svg>
```

## Fork (decisions)

```html
<svg viewBox="0 0 1100 380" role="img" aria-label="A decision forking two ways">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.8">
    <rect x="400" y="50" width="300" height="80" rx="12"/>
  </g>
  <text x="550" y="98" text-anchor="middle" class="lbl">The question?</text>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round">
    <path d="M470,135 L260,215" marker-end="url(#ah)"/>
    <path d="M630,135 L840,215" marker-end="url(#ah)"/>
    <rect x="120" y="225" width="290" height="110" rx="10"/>
    <rect x="690" y="225" width="290" height="110" rx="10"/>
  </g>
  <text x="330" y="185" text-anchor="middle" class="lbl-g">yes</text>
  <text x="770" y="185" text-anchor="middle" class="lbl-g">no</text>
  <text x="265" y="275" text-anchor="middle" class="lbl">Path A</text>
  <text x="835" y="275" text-anchor="middle" class="lbl">Path B</text>
</svg>
```

## Cycle (loops)

Four boxes at compass points, arrows chaining clockwise. Use for agentic loops, feedback,
iterate-and-improve. Keep to 3–5 nodes.

```html
<svg viewBox="0 0 1100 400" role="img" aria-label="A four-step loop">
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.4">
    <rect x="450" y="40" width="200" height="70" rx="10"/>
    <rect x="820" y="165" width="200" height="70" rx="10"/>
    <rect x="450" y="290" width="200" height="70" rx="10"/>
    <rect x="80" y="165" width="200" height="70" rx="10"/>
  </g>
  <g class="lbl-sm" text-anchor="middle">
    <text x="550" y="82">Step 1</text><text x="920" y="207">Step 2</text>
    <text x="550" y="332">Step 3</text><text x="180" y="207">Step 4</text>
  </g>
  <g filter="url(#rough)" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round">
    <path d="M660,90 Q850,110 900,160" marker-end="url(#ah)"/>
    <path d="M900,240 Q850,300 660,325" marker-end="url(#ah)"/>
    <path d="M440,325 Q250,300 200,240" marker-end="url(#ah)"/>
    <path d="M200,160 Q250,110 440,90" marker-end="url(#ah)"/>
  </g>
</svg>
```

## Icon anchor (title + closing slides)

One drawn metaphor object, minimal detail, quiet gray caption. Examples that worked: a shipping
container with corrugation lines + wheels; a wall socket; a sealed crate; a staircase. Draw the
object from 3–8 primitives (rects/lines/circles) — resist adding detail; the wobble filter does
the charm.

## Text-width discipline (prevents overflow)

Handwritten fonts are wide. Estimate width ≈ chars × fontSize × 0.55 and check it fits:

- `text-anchor="middle"` at x: needs x − w/2 ≥ 0 and x + w/2 ≤ viewBox width
- `text-anchor="start"` at x: needs x + w ≤ viewBox width (and ≤ the containing box's right edge)

A 40-char string at 17px ≈ 374px wide. If it doesn't fit: split into two `<text>` lines
(~28px apart), shorten the wording, or widen the box. `scripts/verify_deck.py` flags likely
overflows — trust its warnings.

## The light-gray highlight (use once per deck, if at all)

The only permitted fill: `<rect ... fill="#f5f5f5"/>` UNDER a key label to emphasize one region
(e.g., the "used" portion of a budget bar). Draw it after the outline group but before the text.
