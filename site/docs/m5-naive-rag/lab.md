---
sidebar_position: 2
title: 'Lab: Docs Assistant — Naive RAG'
---

# Lab: Docs Assistant — Naive RAG

You will hand-author a `compose.yaml` service by service, start a ChromaDB vector store and a Streamlit RAG app, ingest Acme's runbooks, and ask a real question — watching the naive-RAG pipeline retrieve the right chunk and generate a grounded answer.

**What you build:** ChromaDB 0.5.20 (container) + genai-app (container) + native Ollama — the growing Day-2 `compose.yaml`.

---

## Prerequisites

Ollama must be running and both models must be pulled on the host before the containers start.

```bash
ollama pull qwen2.5:1.5b
ollama pull nomic-embed-text
```

**Expected output:**

```
pulling manifest
pulling ...
verifying sha256 digest
writing manifest
success
```

Confirm Ollama is listening:

```bash
curl -s localhost:11434/api/tags | grep -o '"name":"[^"]*"'
```

**Expected output (models present):**

```
"name":"qwen2.5:1.5b"
"name":"nomic-embed-text:latest"
```

---

## Step 1: Navigate to the lab directory

```bash
cd labs/m5
```

All paths in this lab are relative to `labs/m5/`.

---

## Step 2: Author the compose.yaml

This is your **Day-2 growing compose file**. You are adding a vector database and an application layer to the native-Ollama pattern established in Module 2. Write each block deliberately — understanding every line before you move on.

Create `compose.yaml` and add the opening comment and the first service:

```yaml
# M5 · Docs Assistant (naive RAG) — the growing compose.yaml, Day 2 edition.
#
# Apple-Silicon pattern: the MODEL SERVER runs NATIVELY (Ollama, Metal) on the host;
# only the vector DB and the app are containerized and reach Ollama via
# host.docker.internal. On Linux/NVIDIA you could add an `ollama` service instead.
#
# Prereqs on the host:  ollama pull qwen2.5:1.5b  &&  ollama pull nomic-embed-text
services:
  # Vector database — pinned to 0.5.x to match the langchain-chroma client version.
  chromadb:
    image: chromadb/chroma:0.5.20
    container_name: chromadb
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    deploy:
      resources:
        limits:
          memory: 768M
    restart: unless-stopped
```

**Why these settings matter:**

- `chromadb/chroma:0.5.20` — pinned because `langchain-chroma` ships a client that expects the `0.5.x` HTTP API. Running `0.6.x` causes a version handshake failure.
- `chroma_data` volume — vectors survive `docker compose down` and are still there when you bring the stack back up.
- `IS_PERSISTENT=TRUE` — tells ChromaDB to write to disk, not memory-only mode.
- `ANONYMIZED_TELEMETRY=FALSE` — suppresses outbound telemetry in a course environment.

Now append the application service below the chromadb block:

```yaml
  # The Docs Assistant — Streamlit RAG app. Embeds + generates via NATIVE Ollama.
  genai-app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: genai-app
    ports:
      - "8501:8501"
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
      - LLM_MODEL=qwen2.5:1.5b
      - EMBEDDING_MODEL=nomic-embed-text
    depends_on:
      - chromadb
    deploy:
      resources:
        limits:
          memory: 1G
    restart: unless-stopped
```

**Why these settings matter:**

- `OLLAMA_BASE_URL=http://host.docker.internal:11434` — this is the Apple-Silicon pattern. The container cannot reach `localhost:11434` (that is the container's own loopback); `host.docker.internal` resolves to the host machine, where Ollama is running natively with Metal acceleration.
- `CHROMA_HOST=chromadb` — Docker's internal DNS resolves the service name. The app talks to ChromaDB over the Docker network, not via localhost.
- `build: context: ./app` — the app is built from source rather than pulled from a registry. The `Dockerfile` in `./app/` produces a trimmed image: no `sentence-transformers`, no PyTorch, just the LangChain + ChromaDB + Streamlit stack.

Finally, add the volumes stanza at the end of the file:

```yaml
volumes:
  chroma_data:
```

---

## Step 3: Start the stack

```bash
docker compose up -d --build
```

The `--build` flag rebuilds the `genai-app` image from `./app/`. On the first run this takes 60–90 seconds while pip installs the dependencies.

**Expected output:**

```
[+] Building ...
 => [genai-app] ...
[+] Running 2/2
 ✔ Container chromadb   Started
 ✔ Container genai-app  Started
```

---

## Step 4: Verify both services

### ChromaDB heartbeat

```bash
curl -s localhost:8000/api/v2/heartbeat
```

**Expected output:**

```
{"nanosecond heartbeat":1783255100...}
```

Check the HTTP status code:

```bash
curl -s -o /dev/null -w '%{http_code}' localhost:8000/api/v2/heartbeat
```

**Expected output:**

```
200
```

### Streamlit health

```bash
curl -s -o /dev/null -w '%{http_code}' localhost:8501/_stcore/health
```

**Expected output:**

```
200
```

### App log confirmation

```bash
docker logs genai-app | grep -A2 Streamlit
```

**Expected output** (Streamlit prints the message and the URL on separate lines — `-A2` grabs both):

```
  You can now view your Streamlit app in your browser.

  URL: http://0.0.0.0:8501
```

---

## Step 5: Ingest Acme's runbooks

Open the Docs Assistant in your browser:

```
http://localhost:8501
```

You will see the Streamlit UI with a sidebar containing a **Document Upload** section. The Vector Database metrics show **0 chunks** and **0 documents** — the index is empty.

Ingest the runbook file:

1. In the sidebar under **Document Upload**, click **Browse files**
2. Navigate to `labs/m5/docs/acme-runbooks.md` and select it
3. Click **Process Documents**

The app will show progress: loading the file, splitting into chunks (chunk_size=500, overlap=50), then generating embeddings via `nomic-embed-text`.

:::note[First embed takes longer]

The first embedding call warms up `nomic-embed-text` on Ollama. Expect 10–30 seconds on the first run. Subsequent embeddings are fast.

:::

After processing, the sidebar metrics update:

```
Chunks: 2    Documents: 1
```

The four runbook sections (Payments, Database backups, Checkout errors, On-call escalation) are short, so the 500-character splitter packed them into **two** chunks. (Larger documents produce more — the count depends on the text, `chunk_size`, and `chunk_overlap`.)

---

## Step 6: Ask a question and see the grounded answer

In the chat input at the bottom of the page, type:

```
How do I restart the payments service?
```

With **Show RAG Details** enabled in the sidebar (it's on by default), a **🔍 RAG Pipeline Running** panel — the course's "Learning Mode" — expands and shows the pipeline in real time:

```
Step 1: Converting query to embedding...
   ✅ Generated 768-dim vector (0.Xs)

Step 2: Searching for similar chunks...
   ✅ Found 2 relevant chunks (0.Xs)

Step 3: Retrieved Context:
   📄 Chunk 1 (Page ?): To restart the Acme payments service, run:
      `kubectl rollout restart deploy/payments -n prod`...

Step 4: Generating response with LLM...
   ✅ Response generated (X.Xs)
```

The model's answer will be grounded in the retrieved context:

```
To restart the payments service, you need to execute the following command:

kubectl rollout restart deploy/payments -n prod
```

This is the validated naive-RAG round-trip: the question's embedding matched the payments runbook chunk by semantic similarity, that chunk was passed to `qwen2.5:1.5b` as context, and the model answered with the correct kubectl command — not a hallucinated one.

You can also expand **View Source Chunks** below the answer to see the exact text that was retrieved from ChromaDB.

---

## Step 7: Tear down

```bash
docker compose down
```

**Expected output:**

```
[+] Running 3/3
 ✔ Container genai-app  Removed
 ✔ Container chromadb   Removed
 ✔ Network m5_default   Removed
```

The `chroma_data` volume is preserved — your ingested chunks survive the teardown. To also remove the volume:

```bash
docker compose down -v
```

---

## Troubleshooting

:::warning[Chroma client/server version skew]

**Symptom:** `genai-app` logs show an error like `ValueError: Could not connect to a Chroma server` or `version mismatch`.

**Cause:** `langchain-chroma` pins to the `0.5.x` HTTP API. If you run `chromadb/chroma:latest` (which may be `0.6.x`), the client rejects the server.

**Fix:** Keep `chromadb/chroma:0.5.20` in your `compose.yaml`. Never use `latest` for a version-sensitive component.

:::

:::warning[App cannot reach Ollama]

**Symptom:** `genai-app` logs show `httpx.ConnectError: [Errno 111] Connection refused` when trying to embed or generate, even though `ollama serve` is running.

**Cause:** Ollama defaults to binding on `127.0.0.1` (the host's loopback). Containers cannot reach `127.0.0.1` on the host via `host.docker.internal` — they need Ollama to listen on `0.0.0.0`.

**Fix:** Restart Ollama with `OLLAMA_HOST` set:

```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

Or add `OLLAMA_HOST=0.0.0.0` to your Ollama systemd/launchd service and restart it. Confirm with:

```bash
curl -s http://localhost:11434/api/tags
```

:::

:::warning[First embed is very slow or times out]

**Symptom:** The progress bar stalls at "Generating embeddings" for more than 60 seconds.

**Cause:** `nomic-embed-text` needs to be loaded into memory by Ollama on the first call. On Apple Silicon with 16 GB RAM, the first load takes 10–30 seconds.

**Fix:** Wait. If it times out, check `ollama ps` to confirm the model is loading, then retry the Document Upload. Subsequent runs are fast because the model stays warm in memory.

:::

---

## What's next

You now have a working naive-RAG Docs Assistant. But you have also seen its limits — the pipeline retrieves once, without rewriting the query or verifying whether the retrieved chunks are actually sufficient. Ask "What do I do if the checkout page is slow?" and the answer depends entirely on how well that phrasing matches the embeddings in the index.

Module 6 introduces **agentic RAG**: replacing the single-pass retriever with an agent that can rewrite queries, run multiple retrieval passes, and decide when it has enough evidence to answer — fixing the failure modes from the lesson.

---

## Go deeper

Your Docs Assistant answers questions — but *why* chunk at 500 characters? Why
top-3? The [Deep Dive (Part 2)](./deep-dive.md) opens the hood: what every
retrieval parameter controls, how to see the stored chunks and distances
directly, and a chunking experiment that shows the trade-offs on real data.
