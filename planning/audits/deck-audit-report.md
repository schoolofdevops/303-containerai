# Deck + Narration Audit Report

**Date:** 2026-10-21
**Scope:** all 15 decks (10 concept + 5 deep-dive), their sequence specs and narration, audited against the v1.9.0 lessons
**Numeric gate:** PASS after fixes (adapted script; this course predates the `mN-*` file names and `planning/voiceover/` layout the stock script expects)
**Branch:** `deck-pass-2026-10` (PR to main)

## Numeric results (after fixes)

| Deck | Slides | Ext refs | Flat `#rough` | Subtitle >80 | Banned words | Narration ~min |
|---|---|---|---|---|---|---|
| 00-introduction | 15 | 0 | 0 | 0 | 0 | 22 |
| 01-container-native | 19 | 0 | 0 | 0 | 0 | 28 |
| 02-serving | 20 (+3) | 0 | 0 | 0 | 0 | 31 |
| 03-vllm | 22 (+2) | 0 | 0 | 0 | 0 | 32 |
| 03-deepdive | 21 (+1) | 0 | 0 | 0 | 0 | 37 |
| 03b-finetuning | 19 (+1) | 0 | 0 | 0 | 0 | 25 |
| 03b-deepdive | 23 (+3) | 0 | 0 | 0 | 0 | 41 |
| 04-packaging | 22 (+2) | 0 | 0 | 0 | 0 | 24 |
| 05-naive-rag | 20 | 0 | 0 | 0 | 0 | 26 |
| 05-deepdive | 23 (+1) | 0 | 0 | 0 | 0 | 31 |
| 06-declarative-agent | 25 (+3) | 0 | 0 | 0 | 0 | 33 |
| 07-multi-agent | 20 (+1) | 0 | 0 | 0 | 0 | 24 |
| 07-deepdive | 19 | 0 | 0 | 0 | 0 | 38 |
| 08-security | 25 (+3) | 0 | 0 | 0 | 0 | 29 |
| 09-capstone | 18 (+3) | 0 | 0 | 0 | 0 | 26 |

Before fixes: 61 flat `#rough` groups (invisible lines) across all 15 decks, 2 subtitles over 80 chars, banned words in 7 decks and 11 narrations, no external refs, no takeaways.

## Semantic audit (per-group reports in `deck-audit-2026-10-21/`)

| Group | Decks | Findings | Fixed | Accepted (reason) | Slides added |
|---|---|---|---|---|---|
| g1 | 00, 01, 02 | 48 | 46 | 1 lesson tip (not a concept); 1 footnote instead of slide | 3 (M2 §6 reasoning models) |
| g2 | 03, 03-dd, 03b, 03b-dd | ~90 | all but 3 | recap, page-only items, learning-rate detail kept in narration | 7 |
| g3 | 04, 05, 05-dd | 47 | all but 7 | summary recaps, page-only arithmetic | 3 (incl. MLX not-truncated result) |
| g4 | 06, 07, 07-dd | 36 | 34 | IDE-vs-stack table spoken over slide 15 (cap); 2 narration-only | 4 (incl. MCP 2026 stateless + ticket-counter analogy) |
| g5 | 08, 09 | 42 | 34 | key-vs-keyless slide (cap), summary table, ops tips | 6 |

Every stale fact found (retired model names, Q4/GGUF claim for the MLX build, Chroma 0.5.20/v1 routes, DMR "Docker Desktop only", old vLLM ratios 3.13x/1.10x, old Trivy/syft counts, "flips between runs" story, ~1 GB memory figures) is corrected in deck, sequence spec and narration. All 23 new slides rendered with the static renderer and checked at full size.

## Still open (outside this quick pass)
- **Chapter contract (deck-author §0, 2026-09-15):** these decks predate it (no bare-noun dividers per chapter, no "What will you learn?" slide 2, no recap fragments). A full re-architecture is a separate pass.
- **No divider slide for the new M2 §6 chapter and the M6 MCP-2026 slides** (dividers carry illustrations; needs the illustration pass).
- **Narration has no `[Slide N]` markers** and lives in `planning/narration/` (legacy format); converting to `planning/voiceover/mN-slide-voiceover.md` is a separate pass.
- **Quiz size rule (10–15 questions):** every module has 5–6 (course convention was 4–6). Not a deck issue.
- **Banned words in docs** (`rung`/`spine`/`shape` in several lesson/lab/deep-dive pages, e.g. `site/docs/capstone/index.md:337`): 42 hits across M1–M8 pages; not touched in this pass.
- Deep-dive deck 05 slide 14 (truncation) now names `qwen3:4b`; the "Known gaps" line in CHANGELOG 1.9.0 is resolved by this pass.
