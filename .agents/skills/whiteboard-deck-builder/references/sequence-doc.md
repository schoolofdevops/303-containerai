# Companion Sequence Doc + Deck Index

## The sequence doc (`<deck-name>-sequence.md`, next to the deck)

Written AFTER the slides are drawn — its "Visual pattern" column must describe the slides you
actually built, not the ones you planned. Structure:

```markdown
# <Module Name> Deck — Slide Sequence

<One paragraph: what the deck is, who it's for, where it sits relative to the
reading and the lab. Include the "how to use" line: open in any browser, arrow
keys to advance, F fullscreen, E then browser Print exports a PDF; fully
editable — text and diagrams are plain HTML/SVG.>

## Slide-by-slide sequence

| # | Slide | Concept covered | Source | Visual pattern |
|---|-------|-----------------|--------|----------------|
| 1 | **Title** | ... | lesson §... | Icon anchor |
| ... every slide ... |

## Recommended presentation order

<A short paragraph explaining WHY this order: which slides set up vocabulary
for which later slides, where the deck pivots from "why" to "how" to
"reference", and which 1–2 slides cannot be skipped when time is short.>

## Optional image briefs

<2–3 briefs (80–150 words each) for concepts better shown as photographs or
painterly illustration than sketches. Each specifies composition, subject,
lighting/mood, style, 16:9 or 4:3, and negatives ("no text overlays, no brand
names, no faces"). State where each drops into the deck. Write briefs only —
never generate the images.>

## Coverage check vs source content

<Bulleted map: every concept from the source → the slide number(s) covering
it. This is the proof nothing got dropped. Non-negotiable.>
```

## The deck index (`index.html` in the decks folder)

When the folder holds decks for multiple modules, maintain a landing page: course title,
author/credit line, usage hint (arrows · F · E+Print→PDF), and one bordered card per deck
(kicker like "MODULE 2 · DAY 1", deck name, slide count). Same handwriting font, same B&W
palette, 2-column responsive grid, full-width cards for Intro and Capstone. Add a card whenever
a new deck ships — don't let the index go stale.
