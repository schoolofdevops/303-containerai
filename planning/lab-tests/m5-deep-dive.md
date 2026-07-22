# Lab-test evidence — M5 Deep Dive: RAG Parameters Under the Hood

**Machine:** Apple Silicon (arm64), 16 GB RAM
**Runtime:** Docker via `PATH="$HOME/.rd/bin:$PATH"` (Rancher Desktop, docker 29.5.2/dockerd-moby)
**Date:** 2026-07-22
**Stack:** ChromaDB `0.5.20` (container) + Streamlit `genai-app` (container) + native Ollama
**Models:** `qwen2.5:1.5b` (generation) + `nomic-embed-text` (embeddings, 768-dim) — both native,
already pulled on this machine.

**Baseline params confirmed by reading `labs/m5/app/main.py`** (not guessed): `chunk_size=500`,
`chunk_overlap=50` (`process_uploaded_file`), `search_kwargs={"k": 3}` retriever, `num_ctx=4096`
(`init_llm`) — matches everything the page cites.

---

## Step 1 — Probe + bring-up

```
$ curl -s http://localhost:11434/api/tags
```
`nomic-embed-text:latest` and `qwen2.5:1.5b` both present (alongside other unrelated models on
this machine). Native Ollama already serving — no pull needed.

```
$ cd labs/m5 && PATH="$HOME/.rd/bin:$PATH" bash up.sh
```
Built `m5-genai-app` from cache, created `m5_default` network, started `chromadb` + `genai-app`.
Output: `m5 ready: chromadb + genai-app healthy.` (matches the page's opening
`:::info[Where this picks up]` block exactly — no drift).

No containers were running before this session (`docker ps -a` empty for `chromadb`/`genai-app`)
— a clean start.

---

## §6 seeding note — `documents` collection

The base m5 lab populates the `documents` collection only via a **human UI upload** through
Streamlit (confirmed: `labs/m5/checks.json`'s own scripted check uses a *separate*
`checks-roundtrip` collection, not `documents`, specifically because there is no headless upload
path). Since §6 of the deep-dive queries `documents` directly, I seeded it by replicating the
app's exact ingest code path inside the container (`UnstructuredMarkdownLoader` +
`RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)`, same as
`process_uploaded_file`) — functionally identical to what a learner's UI upload produces. Result:
**2 chunks**, matching §1's claim exactly.

---

## §6 — Direct ChromaDB queries (real output folded into the page)

`curl -s http://localhost:8000/api/v1/collections | python3 -m json.tool` →

```json
[{"id": "9212c584-...", "name": "documents",
  "configuration_json": {"hnsw_configuration": {"space": "l2", ...}},
  "dimension": 768, ...}]
```

`"space": "l2"` confirmed straight from ChromaDB's own API — no override was ever set, matching
§3's claim.

**Note on host-side `curl | python3 -m json.tool`:** the rtk shell hook on this machine mangles
piped `curl` output on the host (returned a schema stub, not real data, when piped through the
normal shell). Verified this is a local tooling artifact, not real ChromaDB behavior, by re-running
with `command curl` (bypasses the hook) and separately via `docker exec genai-app python3 -c
"urllib.request..."` from inside the container — both gave the real JSON shown above. The page's
folded output is the real API response; if a learner sees a schema stub instead of JSON on this
kind of curl command, it is a local shell/alias issue, not a ChromaDB problem.

`docker exec genai-app python3 -c "... similarity_search_with_score(...)"` →

```
0.6956 Acme Platform Runbooks  Payments service  To restart the Acme payments service,
1.0968 Checkout 503 errors  If the checkout page returns HTTP 503, the web tier is satu
```

Only 2 lines returned despite `k=3` — the collection has exactly 2 chunks, so Chroma returns
everything it has.

---

## B-4 — Embedding norm (MUST-VERIFY, resolved: claim FIRMED)

Ran the norm-print one-liner inside `genai-app`, through `langchain-ollama`'s `OllamaEmbeddings`
(the app's exact code path, not the raw Ollama HTTP API):

```
vector 0: dim=768 L2norm=1.000000
vector 1: dim=768 L2norm=1.000001
vector 2: dim=768 L2norm=1.000000
```

Three arbitrary sentences, three near-exact unit norms (the `1.000001` on vector 1 is float
rounding noise). **Verdict: the page's §3 claim that `nomic-embed-text` embeddings are close to
unit-norm through this app's code path is CONFIRMED, not assumed.** Page prose firmed accordingly
(added the measured values in §6, kept §3's original hedge language since it was already
appropriately worded — "close to unit-norm by construction" — and now has live evidence backing
it in §6).

---

## B-5 — Ollama truncation claim (MUST-VERIFY, resolved: claim REWRITTEN to match observed behavior)

**Original page claim:** "Ollama silently truncates from the front of the context (the oldest
tokens) once the window fills... your *earliest retrieved chunks* are what gets cut, not the
question."

**Test:** sent a deliberately over-budget prompt (~40K raw tokens: a unique `MARKER-FRONT` string
at the very start, a large filler block, then a unique `MARKER-BACK` string plus a question asking
"what is the front marker?") to `qwen2.5:1.5b` via `/api/generate` with `num_ctx=4096`.

**Two runs, same result** — first against the machine's existing `ollama serve` (native, no debug
logging reachable), second against a throwaway second `ollama serve` instance on port 11500 with
`OLLAMA_DEBUG=1` to capture the underlying `llama-server` log:

```
prompt_eval_count: 2050
eval_count: 22
response: "The very first marker string in this prompt is 'Marker-back-unique-string-9911'."
```

The model reports the **back** marker as if it were the front — proof the front of the prompt was
dropped and the tail (including the real question) survived. The debug log's exact line:

```
level=WARN source=llama_server.go:314 msg="truncating input prompt" limit=2050 prompt=33742 keep=4 new=2050
```

**Verdict:** truncation direction is front-to-back (matches the page's original claim in
direction), but the *mechanism* is more precise than "silently truncates from the front" implied:
`llama-server` keeps a tiny fixed prefix (`n_keep=4` tokens — negligible) and then keeps the most
recent `limit` tokens, discarding everything in between/before. For this app's prompt shape
(`Context:\n{context}\n\nQuestion:...\n\nAnswer:` — context first, question last), the net effect
matches the page's claim exactly: retrieved context chunks are what get dropped first, the
question (at the very end) is the last thing to go. **Page rewritten** to state this with the live
log line as evidence and to point at the observable signal (`"truncating input prompt"` WARN in
Ollama's server log) rather than asserting the mechanism from first principles.

---

## Step 2 — §7 full 3-variant experiment (end-to-end, all 4 questions)

Ran the page's §7 corpus-copy step, then the full `compare_chunking.py` (untrimmed — all 3
variants × all 4 questions, unlike the task-1 smoke test which trimmed to 1 variant × 1 question).

Corpus copy:
```
$ CORPUS="$(pwd)/docs/acme-runbooks.md"; mkdir -p ~/rag-deepdive-lab && cd ~/rag-deepdive-lab
$ docker exec genai-app mkdir -p /tmp/deepdive-docs
$ docker cp "$CORPUS" genai-app:/tmp/deepdive-docs/acme-runbooks.md
$ docker exec genai-app ls -la /tmp/deepdive-docs/
-rw-r--r-- 1  501 dialout  823 Jul 22 06:29 acme-runbooks.md
```

Full ingest+compare run (`docker exec -i genai-app python3 - < compare_chunking.py | tee
~/rag-deepdive-lab/variant-collections.txt`):

```
COLLECTION: deepdive-baseline
=== baseline (chunk_size=500, overlap=50) -> 2 chunks ===
  Q: How do I restart the payments service?     top distance: 0.6956
  Q: What happens if checkout is overloaded?     top distance: 0.7755
  Q: How long are database backups retained?     top distance: 0.7746
  Q: Who do I page for an unacknowledged incident? top distance: 0.9238
COLLECTION: deepdive-variant-a
=== variant-a (chunk_size=150, overlap=0) -> 11 chunks ===
  Q: How do I restart the payments service?     top distance: 0.5146
  Q: What happens if checkout is overloaded?     top distance: 0.7244
  Q: How long are database backups retained?     top distance: 0.3700
  Q: Who do I page for an unacknowledged incident? top distance: 0.7124
COLLECTION: deepdive-variant-b
=== variant-b (chunk_size=1200, overlap=200) -> 1 chunks ===
  Q: How do I restart the payments service?     top distance: 0.7515
  Q: What happens if checkout is overloaded?     top distance: 0.9773
  Q: How long are database backups retained?     top distance: 0.8759
  Q: Who do I page for an unacknowledged incident? top distance: 1.0830
```

All 4 questions × all 3 variants (12 model answers total) came back grounded and topically
correct — small-corpus effect (823 bytes total means even variant-b's single do-everything chunk
holds the whole answer space). Full per-question answer text folded into the page's §7 Expected
Output block and comparison table.

**Headline pattern:** chunk count scales inversely with chunk_size as expected (2 → 11 → 1 across
baseline → variant-a → variant-b). variant-a's small, atomic chunks produced the *lowest*
(best) distances across the board — 0.5146 and 0.3700 are the two best matches in the whole
experiment — because each chunk is purely about one topic. variant-b's single-chunk collapse
produced the *highest* (worst) distances (0.75–1.08) since every query is matching against one
chunk that averages four unrelated procedures — the exact noise-dilution failure mode §1
predicts for oversized chunks, though masked here by the corpus being small enough that the one
chunk still contains every answer.

Host artifact: `~/rag-deepdive-lab/variant-collections.txt`, 3.3K, `grep -c '^COLLECTION:
deepdive-'` → `3`.

§7 teardown (drop 3 variant collections only):
```
$ docker exec -i genai-app python3 -c "..." <<< "deepdive-baseline deepdive-variant-a deepdive-variant-b"
deleted deepdive-baseline
deleted deepdive-variant-a
deleted deepdive-variant-b
```

Page teardown (`rm -rf ~/rag-deepdive-lab`) → directory confirmed gone.

---

## Step 4 — Checks: pre-teardown and post-teardown

**Mid-run** (variant collections + host artifact both present, before §7's own teardown):

```
$ node scripts/run-checks.mjs labs/m5/deep-dive.checks.json
✅ chromadb-up-if-running
✅ variant-collections-if-run   (matched "3")
✅ comparison-table-in-page
✅ chunk-size-values-in-page
✅ topk-value-in-page
✅ l2-metric-verdict-in-page
✅ context-budget-arithmetic-in-page
✅ retrieval-vs-generation-miss-in-page
8/8 checks · score 8/8
```

**Post-teardown** (after §7's collection drop AND the page's final `rm -rf
~/rag-deepdive-lab`):

```
$ node scripts/run-checks.mjs labs/m5/deep-dive.checks.json
✅ chromadb-up-if-running
✅ variant-collections-if-run   (SKIP-OK — host artifact removed by final teardown, as designed)
✅ comparison-table-in-page
✅ chunk-size-values-in-page
✅ topk-value-in-page
✅ l2-metric-verdict-in-page
✅ context-budget-arithmetic-in-page
✅ retrieval-vs-generation-miss-in-page
8/8 checks · score 8/8
```

Both runs 8/8. `deep-dive.checks.json` was not modified — its asserts already matched real
end-state exactly (no changes needed).

---

## Build gate

```
$ cd site && npm run build
[SUCCESS] Generated static files in "build".
```
Server + Client both compiled successfully. Green.

---

## Stack left running

`chromadb` + `genai-app` containers left up, `documents` collection intact (2 chunks, seeded via
the app's own ingest path) — matches "leave the m5 stack and the `documents` collection exactly as
the lab left them," per the page's own final Teardown note. Deep-dive touched only the
`deepdive-*` collections, all of which were dropped in §7's teardown.

---

## Review fix (2026-07-22) — §6 state-tolerant re-seed

**Finding:** §6's direct-Chroma query assumes `documents` is populated, but the base lab only
seeds it via a Streamlit UI upload, and the lab's own teardown offers `docker compose down -v`
(wipes the volume). A learner who tore down with `-v` and came back for the deep-dive would hit
an empty collection and get results contradicting the page's folded Expected output.

**Fix:** added a `:::note[If your documents collection is empty]` block right before §6's first
query (smaller, clearer placement than extending the top-of-page "Where this picks up" admonition)
— a guarded, idempotent snippet: check `documents` chunk count; if `>0`, print a no-op message; if
empty, copy the corpus in and re-ingest via the app's exact code path
(`UnstructuredMarkdownLoader` + `RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)`,
matching `process_uploaded_file`), then print the chunk count.

**Verified live, both states, on this machine** (`PATH="$HOME/.rd/bin:$PATH"`, native Ollama up):

- **Populated state:** `documents` already had 2 chunks (left over from the original validation
  run above). Ran the guarded script — printed `documents collection already populated: 2 chunks.
  No re-seed needed.` — confirmed no-op, no re-ingest triggered.
- **Empty state:** ran `docker compose down -v --remove-orphans` (the lab's own teardown option)
  to wipe the `m5_chroma_data` volume, then `bash up.sh` to bring the stack back with a fresh,
  empty collection (verified: `get_collection('documents')` raised `InvalidCollectionException`
  — no collection existed yet). Copied the corpus in per §7's existing `docker cp` pattern, ran
  the guarded script — printed `re-seeded documents collection: 2 chunks ingested.` Ran it again
  immediately after — correctly printed the no-op message on the second pass (idempotent,
  confirmed). Re-ran §6's actual similarity-search query against the freshly re-seeded
  collection — got back **the identical distances already folded into the page**
  (`0.6956` / `1.0968` for the payments question), confirming the re-seed path reproduces the
  page's existing evidence deterministically.
- Cleaned up `/tmp/deepdive-docs` inside the container after testing; left the stack up with
  `documents` populated (2 chunks) — same end state as before this fix, no drift introduced.

**Gates re-run after the edit:**

```
$ cd site && npm run build
[SUCCESS] Generated static files in "build".
```

```
$ node scripts/run-checks.mjs labs/m5/deep-dive.checks.json
8/8 checks · score 8/8
```

Both green, no regressions.
