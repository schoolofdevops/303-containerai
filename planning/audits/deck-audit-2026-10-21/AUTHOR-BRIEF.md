# Deck-author fix brief (quick pass, 2026-10-21) — applies to every group

Branch: `deck-pass-2026-10` (already checked out; never switch, rebase or push). Repo: /Users/gshah/work/courses/303-containerai. Never read `labs/m3/.env`. No subagents. Do not run labs or the site build.

Read first: your group's audit report (path in the dispatch), then `/Users/gshah/work/apps/learning/coursesmith/templates/deck/whiteboard-style-guide.md` (skim: slide anatomy, classes `h2.t`, `p.s`, `.pageno`, SVG `role="img"` + `aria-label`, `#rough` filter, fragments, divider sections).

## What to fix (all of these)
1. **stale-fact** rows: edit the deck text (titles, `p.s`, SVG `<text>`, aria-labels) to match the current lesson/lab/deep-dive page. Change words inside existing elements; keep markup and geometry. If a number label grows wider than its box, shorten the label, never squeeze.
2. **drift** rows: edit the narration file so each `## Video N` beat describes the slide that exists, in deck order, and states the current facts. Spoken register: short plain sentences a non-native speaker says on the first take, no em-dashes, full technical terms kept. Do not add `[Slide N]` markers (this course's narration has none).
3. **banned** rows: replace the word with plain contextual English in deck and narration (keep any surrounding metaphor, rename only the word). Also grep your decks + narration for: shape/shapes/shaped, rung(s), spine, through-line, orthogonal, landscape, calculus, "hold that thought", "circle back", "dive in", "game-changer", "here's the thing", "unlock", "level up", "superpowers" — zero hits when done.
4. **subtitle** rows: rewrite `p.s` to ≤60 chars (anchoring label, not a sentence; literal glyphs, no HTML entities).
5. **orphan** rows: add a slide ONLY when the lesson section is a real concept the deck does not teach anywhere (not Troubleshooting, Teardown, Summary, "Where you will use this", prerequisites, or a section already covered under another title). Cap: 3 new slides per deck in this quick pass. A new slide copies the deck's own content-slide markup: `<section>` with `h2.t` literal technical title (≤42 chars), optional `p.s` ≤60 chars, one `<svg role="img" aria-label="...">` drawn in the deck's own ink/gray + pastel vocabulary (reuse the deck's existing `<defs>`/classes; `#rough` filter only on non-flat groups), `.pageno` renumbered for every following slide. No bullet lists. Insert it in the lesson's teaching order. Add a matching row to the sequence spec (`planning/decks/*-sequence.md`, same table format) and a narration beat (2–5 spoken sentences) at the right place in the matching `## Video N`. Orphans you decide NOT to add get one line in your report with the reason.
6. Mark every accepted-as-is row with the reason in your report.

## Gates before commit (run all, paste results in the report)
- `rg -c 'src="http|href="http' <deck>` → 0 for each deck.
- Section count sanity: `python3 -c "import re,sys;h=open(sys.argv[1]).read();print(len(re.findall(r'<section\b',h)), len(re.findall(r'</section>',h)), h.count('class=\"pageno\"'))" <deck>` → opening = closing; pagenos = non-divider sections.
- Banned-word grep (list above) across your decks + narration + sequence specs → empty.
- `p.s` length: every subtitle ≤80 chars raw (aim ≤60).
- Flat-filter detector (from the deck-author skill §0a) reports 0 for your decks after edits.
- `bash scripts/assert-model-refs.sh` → exit 0.

## Commit
One commit per group, explicit paths only (your decks, your sequence specs, your narration files; never `git add -A`). Message `fix(decks): <group> — stale facts, narration drift, banned words[, +N slides]`, author initcron <bean@initcron.org> (repo config), trailer line `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. If `git commit` fails with index.lock, wait 10 s and retry.

## Report
Append a `## Fixes applied` section to your group's audit report: per row → fixed / accepted (reason); new slides (deck, slide no., title); gate outputs. Reply with ONLY: status, commit SHA, rows fixed/accepted, slides added, report path. Under 12 lines.
