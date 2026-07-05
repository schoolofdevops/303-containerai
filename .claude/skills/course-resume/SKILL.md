---
name: course-resume
description: Use at the start of any session (especially after a context clear) working on the Containers-for-GenAI course, or when the user says "resume", "where were we", "pick up the course build", or "restore context". Reconstructs full working state from the durable planning docs so no context is lost.
---

# Course Resume — restore context for the Containers-for-GenAI course build

This course is built in phases with all durable state on disk. After a `/clear` (or a fresh session),
run this to rebuild full working context before doing anything else.

## Steps (do these in order, then brief the user)

1. **Read the anchors** (they are the source of truth — trust them over memory):
   - `CLAUDE.md` — repo map, authoring conventions, environment facts & gotchas.
   - `planning/STATE.md` — current phase, the NEXT action, locked decisions, parking lot.
   - `planning/ROADMAP.md` — per-module (M1–M8 + Capstone) status checklist.

2. **Check completed work so you don't redo it:**
   - `cat .superpowers/sdd/progress.md` (if present) — SDD ledger of completed tasks + commit ranges.
   - `git log --oneline -15` — what's actually committed.
   - `ls planning/lab-tests/` and skim the latest — which labs are validated on this machine, with evidence.

3. **Read the active plan** named in `STATE.md` (e.g. `planning/plans/2026-07-05-m1-vertical-slice.md`)
   and find the first task NOT marked complete in the ledger — that's the resume point.

4. **Re-verify the environment** if any lab work is next (installs may need a restart):
   - `PATH="$HOME/.rd/bin:$PATH" docker version --format '{{.Server.Version}}'` (Rancher Desktop up?)
   - `curl -s http://localhost:11434/api/tags` (Ollama serving? model present?)

5. **Brief the user**: one short paragraph — active phase, what's done, the exact next action, and any
   open decision that needs their input. Then continue the work (subagent-driven-development for plan
   execution) unless the user redirects.

## Rules

- Never re-dispatch or re-do a task the ledger/`git log` shows complete.
- Prefer the on-disk docs over anything you "remember" — after a clear, your memory of this project is gone;
  the docs are not.
- If `STATE.md` and `ROADMAP.md` disagree, `STATE.md` is newer; reconcile and fix both.
- After making meaningful progress, update `STATE.md` and `ROADMAP.md` so the next resume is accurate.
