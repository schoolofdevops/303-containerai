---
name: whiteboard-deck-builder
description: >
  Builds presentable, self-contained HTML slide decks (reveal.js) in a hand-drawn black-and-white
  whiteboard style — each slide a title, one inline SVG sketch diagram, and a takeaway line — from
  course/module/chapter content. Use this whenever the user asks for a slide deck, explainer slides,
  presentation, or "slides for module/course/chapter X", especially for teaching or training
  content, and whenever they want Excalidraw-style/whiteboard/sketch visuals delivered as an actual
  navigable deck (not a pile of images). Also use it to edit or extend decks previously built in
  this style, and to keep a decks index page current. Output: one .html deck per module + a
  companion -sequence.md doc.
---

# Whiteboard Deck Builder

Turn existing teaching content (a module, chapter, reading, or outline) into a **sequential
explainer slide deck**: a single self-contained HTML file per module, rendered by reveal.js, where
every slide is a black-and-white hand-drawn-style SVG diagram with a title and a one-line takeaway.
The learner starts at slide 1, walks to the end, and arrives ready for the hands-on work.

The deck is a *teaching walk-through*, not a summary: "what I'd draw on the whiteboard, one frame
at a time, teaching this to someone who's never seen it."

## Workflow

### 1. Gather the parameters (once per course)

From the conversation, repo config (CLAUDE.md etc.), or by asking: course name, author/trainer
name + organization, module label scheme (e.g., "MODULE 3 · DAY 1"), output folder (default:
`decks/` at the repo root). If a previous deck exists in the output folder, match its conventions
exactly — same font, same footer style, same pageno scheme.

### 2. Read the source content fully — before drawing anything

Read the module's lesson/reading in full (skim the lab for context; the deck teaches *concepts*,
not commands). Catalog every concept the learner must understand: named sections, key decisions,
trade-offs, and — critically — **the analogies the content uses**. A concept earns a slide if the
reading names it as a section, the lab depends on it, or a quiz tests it.

### 3. Plan the sequence before authoring

Typical arc, 10–15 slides (8 or 18 is fine when the content honestly needs it):

1. **Title** — kicker (module/day/course), big title, subtitle, one iconic visual anchor
2. **What you'll learn** — 3–5 numbered rows
3. **The motivating problem** — why this topic exists; what breaks without it
4. **Concept slides** — ONE concept each, ordered so vocabulary flows forward
5. Comparison / pipeline / anatomy / architecture slides where the content calls for them
6. **Closing big idea** — one memorable sentence + lead-in to the lab or next module

Check every cataloged concept has a home on some slide before you start writing HTML.

**Turn analogies into the visuals.** If the lesson says "an OCI image is a shipping container,"
draw the container. The diagram should *be* the analogy where one exists — learners relate first,
formalize second. Slide titles work best as claims ("Ollama is great — until the crowd arrives"),
not noun phrases ("vLLM overview").

### 4. Author the deck from the template

Copy `assets/template.html` and author `<section>` slides between the `slides` divs. The template's
`<head>`, style block, shared SVG defs (`#rough` wobble filter + `#ah`/`#ahg` arrowheads), and the
`Reveal.initialize` block are load-bearing — reproduce them verbatim and only author slides.

Every slide: `<h2 class="t">` title · optional `<p class="s">` subtitle · **one** inline SVG
diagram · `<p class="takeaway">` one-liner · `<div class="pageno">` (scheme like `M3·07`).

**Style rules (the look depends on all of them):**

- Black & white only: `#1e1e1e` ink, `#757575` secondary. No colors. No fills — outlines only
  (single `#f5f5f5` highlight rect allowed once per deck).
- Shapes/lines live in `<g filter="url(#rough)">` groups; **`<text>` never goes inside a filtered
  group** — the wobble that makes shapes charming makes text illegible.
- Text uses the template's classes (`.lbl` 21px, `.lbl-sm`/`.lbl-g` 17px, `.lbl-b` 23px, `.num`).
  Nothing below 15px.
- Arrows: `<path marker-end="url(#ah)">` (gray: `#ahg`), stroke-width 2.2–2.8, round caps.
  Rounded rects rx 8–14. viewBox `0 0 1100 H` with H 300–430.
- **Watch text width**: handwriting fonts are wide — estimated width ≈ chars × fontSize × 0.55
  must fit its box/viewBox, else split into two lines or widen the box.
- Pick diagram layouts from `references/svg-patterns.md` and reuse them consistently — a learner
  who has decoded a pattern once reads its next use instantly.

### Why the CSS is shaped this way (don't re-fight these bugs)

- reveal.js forces the visible slide to `display:block` with a high-specificity rule, which
  silently defeats flex layouts. The template pins sections with `position:absolute; inset:0` and
  re-asserts `display:flex` on `section.present`.
- The SVG uses `flex:1 1 0` — grow from a **zero** basis into leftover space — so text rows claim
  their space first and the takeaway can never be pushed off the bottom. `flex:1 1 auto` looks
  equivalent but clips the last line on busy slides.
- `center: false` in `Reveal.initialize` because the flex column does the centering.
- The **autofit script** at the end of the template is the last line of defense: on every slide
  change it measures the slide's real rendered height and shrinks the diagram until nothing
  overflows. CSS math alone proved insufficient when a title AND a takeaway both wrap to two
  lines. Keep the script; don't rely on it as a license for verbose text — prefer titles ≤ ~45
  chars and takeaways ≤ ~110 chars so they stay on one/two lines respectively.

The default font is **Patrick Hand** (Google Fonts). To restyle a course, swap the font link and
the `font-family` declarations — nothing else.

### 5. Verify before delivering

Run the bundled checker on the deck (or the whole folder):

```bash
python3 scripts/verify_deck.py decks/03-vllm.html
```

It enforces the invariants (balanced sections, well-formed SVGs, no text-in-filter, fit CSS
present, defs present) and warns on probable text overflows with the offending string — fix those
by shortening/splitting/widening rather than shrinking the font. Fix all ERRORs; treat warnings
as a to-do list.

### 6. Write the companion sequence doc + keep the index current

Follow `references/sequence-doc.md`: slide table, recommended order, 2–3 optional image briefs,
and the coverage check mapping every source concept to a slide. If the decks folder serves
multiple modules, maintain the `index.html` landing page described there.

### 7. Building many decks (a whole course)

Build one deck first end-to-end and confirm the user likes it — it becomes the reference. Then
build remaining modules in parallel with subagents if available (one module per agent), giving
each agent: the reference deck to copy conventions from verbatim, its module's source content,
the style rules above, and the instruction to run the verifier. Afterwards run the verifier
across the whole folder yourself; don't take the agents' word for it.

## Notes

- Decks load reveal.js + the font from CDNs, so they need internet to render. If offline use is
  requested, inline the CSS/JS and use a system font stack or embedded font.
- PDF export is built in: open the deck, press `E`, then print to PDF. Navigation: arrows, `F`
  fullscreen, `S` speaker view.
- To embed decks in a docs site (e.g., Docusaurus), copy them into the static assets dir and
  iframe them (responsive 16:9 wrapper + an "open fullscreen" link) — keeps them isolated from
  the site theme.
- If the user wants editable PowerPoint instead, this skill's output is not that — offer a
  separate pptx conversion rather than compromising the HTML deck.
