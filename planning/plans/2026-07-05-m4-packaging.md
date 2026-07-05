# M4 · Packaging Models as OCI Artifacts (KitOps) — Plan

> Follows the proven pattern. Content subagent + controller review. Packaging flow already
> validated live — see `planning/lab-tests/m4.md` (real pack/push/pull/unpack evidence).

**Goal:** Ship models like container images. Package a model + prompt config into a **ModelKit** with
KitOps, push to an OCI registry (GHCR), and pull/unpack it on a clean machine to prove portability —
plus selective per-layer pull.

**Validated facts (use verbatim — from `lab-tests/m4.md`):** kit v1.15.0; install via the
`kitops-ml/kitops` release binary (brew tap is untrusted). Kitfile has `manifestVersion "1.0.0"` +
`package`/`model`/`code` sections. `kit pack . -t <ref>` → model/code/config layers. `kit push`
(GHCR needs a `write:packages` token + public package; validated the mechanics against a local
`registry:2` with `--plain-http`). `kit unpack -d <dir>` restores byte-identical files. Selective:
`kit unpack --filter=model`. Example artifact: SmolLM2-135M GGUF + `prompts.txt`.

## Files
- Create: `site/docs/m4-packaging/lesson.md`, `lab.md`, `quiz.mdx`
- Create: `labs/m4/Kitfile`, `labs/m4/prompts.txt`, `labs/m4/README.md`, `labs/m4/.gitignore`
  (gitignore the multi-GB/100MB model file — learners download it; do NOT commit weights)
- Modify: `site/sidebars.ts` (add M4 after M3)

## Task 1 — Lesson (analogies + ≥1 Mermaid)
Why models belong in OCI artifacts (versioned, layered, registry-native). Analogy: a ModelKit is a
**shipping manifest + the crates** — one signed, versioned bundle (weights + config + prompts + datasets)
that any registry/crane can handle, vs. a pile of loose files emailed around. Cover: ModelKit vs a plain
container image (models aren't code — layers for model/datasets/code/docs); KitOps/ModelKit (CNCF) + ORAS;
selective pull (grab weights without datasets); works on Docker Hub/GHCR/Quay/Harbor; contrast with
`docker model package` (Docker-specific) — why the CNCF path is portable. Mermaid: Kitfile → `kit pack` →
layers → registry → `kit unpack`/selective pull on serving/training nodes. ~900–1200 words.

## Task 2 — Lab + assets
Copy-runnable, each command + **Expected output** (use the real outputs from `lab-tests/m4.md`). Steps:
1. **Install kit** — the release-binary curl one-liner (+ brew-tap alt). `kit version`.
2. **Write the Kitfile** (`labs/m4/Kitfile`) + `prompts.txt`; get a small model (`SmolLM2-135M` GGUF via
   `curl` from Hugging Face — note the ~100 MB download; do not commit it).
3. **Pack** — `kit pack . -t ghcr.io/<you>/acme-docs-model:1.0.0`; `kit list`.
4. **Log in + push to GHCR** — `kit login ghcr.io -u <user> --password-stdin`; `kit push <ref>`.
   IMPORTANT callout: GHCR needs a token with **`write:packages`** (`gh auth refresh -s write:packages`
   or a classic PAT) and the package set to **public** in GHCR settings. Include the local-`registry:2`
   `--plain-http` path as an offline alternative (what we validated).
5. **Prove portability** — on a clean dir, `kit unpack <ref> -d ./pulled`; verify the gguf + Kitfile +
   prompts return intact.
6. **Selective pull** — `kit unpack <ref> --filter=model -d ./weights-only` (weights without datasets).
7. **Troubleshooting** — `denied: ... scopes` (missing write:packages), `--plain-http` for local/HTTP
   registries, brew tap "untrusted" → use the binary.
8. What's next: M5 uses this packaged model in the Docs Assistant (RAG).

## Task 3 — Quiz
5 Qs w/ explanations, ≥1 multiSelect: why OCI artifacts for models, ModelKit layers, selective pull,
GHCR write:packages, KitOps vs `docker model package`.

## Task 4 — Sidebar + build gate
Add M4 category. `npm --prefix site run build` green. Commit per task. Controller review → push →
verify deploy → M4 pages 200.
