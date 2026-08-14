# Module 5: Docs Assistant — Naive RAG

## Recommended video structure

| # | Video title | Format | Estimated duration | Central idea |
|---|-------------|--------|--------------------|--------------|
| 1 | Module 5 Introduction — Docs Assistant, Naive RAG | Talking head | 2 min | Why a raw model can't answer questions about your own systems, and what you'll build to fix that |
| 2 | Why Your Model Doesn't Know Your Runbooks — The Case for RAG | Slides + voiceover | 5 min | The ungrounded-answer problem, and the four parts of every GenAI application |
| 3 | The Librarian Who Shelves By Meaning — Vector Databases Explained | Slides + voiceover | 5 min | Embeddings and similarity search, through the librarian analogy |
| 4 | The Naive-RAG Pipeline — Ingest, Query, and Where ChromaDB Fits | Slides + voiceover | 6 min | The eight-step pipeline, the container boundary, and why ChromaDB for this course |
| 5 | Five Ways Naive RAG Breaks — And Why Module 6 Fixes Them | Slides + voiceover | 5 min | The failure modes that motivate agentic RAG |
| 6 | Module 5 Summary — Into the Lab | Slides + voiceover | 2 min | Recap and lab bridge |

---

## Video 1: Module 5 Introduction — Docs Assistant, Naive RAG

**Format:** Talking head
**Estimated duration:** 2 minutes
**Learning objective:** By the end, learners understand why a raw LLM fails on questions about their own systems, and what they're about to build to fix that.

### Narration script

Hello and welcome back.

Let's say you ask a model, "How do I restart the payments service?" It answers you, confidently, with a command. And that command sounds right. But it isn't the one your team actually uses, because the model has never seen your runbooks. It only knows what it was trained on, and your Acme runbooks were never part of that training data.

You've already felt this. In Module 2 and Module 3, you served a model and sent it prompts, and it answered fluently, every time, whether or not it actually knew the answer. That's the gap we close in this module.

The fix is called Retrieval-Augmented Generation, or RAG, and the idea is simple: before you ask the model anything, you hand it a cheat sheet pulled from your own documents. The model then answers from that cheat sheet, not from memory. No fine-tuning, no retraining, just the right wiring.

In this module, you're going to build a real application on top of that idea, a Docs Assistant that reads Acme's runbooks and answers grounded in them. You'll add two new pieces to your `compose.yaml`, a vector database and the application itself, and by the end, you'll watch it retrieve the exact runbook line for "restart the payments service" and generate an answer that quotes it word for word.

Let's get started.

### Suggested visuals / slide beats

1. Title slide: "Docs Assistant — Naive RAG"
2. A raw model confidently answering a systems question wrong (contrast slide)
3. Takeaway: RAG grounds the model in your own documents, no retraining needed

---

## Video 2: Why Your Model Doesn't Know Your Runbooks — The Case for RAG

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain why a raw LLM is unreliable for internal, factual questions, and name the four parts every GenAI application needs.

### Narration script

In the last video, you saw a model answer a systems question with a command that sounded right, but wasn't. Let's now look at why that happens, and what it takes to fix it.

A large language model is powerful, but it answers from its training data, and that training data has a cutoff date, and it was never shown your internal systems in the first place. So when you ask it something specific to your organization, like which Kubernetes namespace your payments service lives in, it doesn't say "I don't know." It generates the most statistically likely answer, which is a very different thing from a correct one. And that's the trap: it sounds confident either way, so you can't tell a real answer from a made-up one just by listening to it.

Retrieval-Augmented Generation fixes this by changing what the model sees before it answers. Instead of asking the model to recall an internal fact from memory, you go and fetch the relevant text yourself, from your own documents, and you paste that text into the prompt as context. The model then generates its answer FROM that context, not from its training. Notice what happened there: you didn't retrain anything. You didn't fine-tune a single weight. You just changed what the model gets to read before it speaks. That is what makes RAG so cheap to add and so easy to keep up to date, because updating the answer is just updating a document, not retraining a model.

Now, this module is the first step in what we're calling the Docs Assistant use case, and by the end of it, you'll have a containerized application that retrieves the right Acme runbook chunk and generates a grounded answer, with the exact `kubectl` command in it.

But before we can build that, we need to understand the shape of a GenAI application in general, because a Docs Assistant is really just four pieces wired together. One, an LLM endpoint, which does the actual text generation — you already have this, it's `qwen2.5:1.5b` running on native Ollama. Two, an embedding model, which converts text into vectors, and here that's `nomic-embed-text`, also on Ollama. Three, a vector database, which stores those vectors and searches through them by meaning, and for this course that's ChromaDB, running in a container. And four, the application itself, which runs the whole pipeline and serves the UI — a Streamlit app, also in a container.

You already built the first two pieces back in Module 2 and Module 3. This module adds the other two, the vector database and the application layer, so your `compose.yaml` grows by exactly two services.

In the next video, we'll look closely at that vector database piece, because it works in a way that's genuinely different from any database you've used before.

### Suggested visuals / slide beats

1. Divider: "The problem — ungrounded answers"
2. Diagram: raw model, confident wrong answer, no source document behind it
3. Four-part anatomy table: LLM endpoint, embedding model, vector database, application — with the M5 concrete choice under each
4. Takeaway: two new services this module — vector DB and app

---

## Video 3: The Librarian Who Shelves By Meaning — Vector Databases Explained

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can explain what an embedding is and why similarity search finds answers that keyword search misses.

### Narration script

So what exactly is a vector database, and why do we need a new kind of database just for this?

Let's say you're looking something up in a normal database, one that's organized like a filing cabinet, labeled by title. You ask for "Payments Runbook," and if that's the exact name on the file, you get it straight away. But ask it something like "what do I do if payments falls over?" and it gives you nothing back, because there's no file with that exact name. The filing cabinet only understands exact matches.

A vector database works completely differently. Think of it as a librarian who shelves books by meaning, not by title. She's read every document in the library, and for every passage, she works out a set of coordinates that capture what that passage is actually about — and that set of coordinates is what we call an embedding. She files everything on the shelf according to those coordinates, so passages about similar things end up near each other, no matter what words they use.

Now when you ask her, "How do I restart the payments service?", she converts your question into that same coordinate system, and she walks straight to the nearest shelf. And here's the important part: it doesn't matter that the runbook never uses the word "restart," or that it's actually filed under something like "SRE ops, payments tier, graceful bounce." Closeness in meaning beats an exact match of words, every time.

Technically, these coordinates are dense numerical vectors — in our case, 768 numbers per passage, produced by the embedding model, `nomic-embed-text`. That model has been trained so that two passages about the same topic land close together in this space, and passages about different things end up far apart. And a similarity search is really just this: given your question's vector, find its nearest neighbors among all the stored vectors.

That's the one idea you need before we look at the full pipeline: a vector database doesn't search by words, it searches by meaning. In the next video, we'll walk through the naive-RAG pipeline end to end, and see exactly where this librarian sits inside it.

### Suggested visuals / slide beats

1. Divider: "The librarian analogy"
2. Two-panel comparison: filing cabinet (exact title match, fails) vs. librarian (meaning-based, succeeds)
3. Diagram: text passages plotted as points in embedding space, similar topics clustered together
4. Takeaway: similarity search finds nearest neighbors in meaning-space, not keyword matches

---

## Video 4: The Naive-RAG Pipeline — Ingest, Query, and Where ChromaDB Fits

**Format:** Slides + voiceover
**Estimated duration:** 6 minutes
**Learning objective:** By the end, learners can walk through both phases of the naive-RAG pipeline, place the container boundary correctly, and explain why ChromaDB was chosen for this course.

### Narration script

Now that you understand what a vector database does, let's put the whole pipeline together, because it actually runs in two separate phases that happen to share one step.

The first phase is ingest, and you'd run this once, or any time your documents change. There are four steps here. First, you load the source document — say, a Markdown runbook. Second, you chunk it, which just means splitting it into overlapping pieces, 500 characters each, with a 50-character overlap, so a sentence that would otherwise get cut in half has a chance of surviving in at least one chunk. Third, you embed each chunk, turning it into that 768-dimensional vector we talked about. And fourth, you store both the vector and the original text into ChromaDB.

The second phase is query, and this one runs every single time a user asks a question. It has four steps too, and notice that step five here is really the same operation as step three above, just applied to the question instead of a document chunk. Five, you embed the query, using the exact same embedding model. Six, you retrieve — you ask ChromaDB for the top three most similar chunks. Seven, you augment the prompt, meaning you paste those retrieved chunks in as context. And eight, you generate — you call the LLM with that augmented prompt, and it answers grounded in what it was just handed.

Now here's something worth pointing out about where all of this actually runs. The chunking, the vector storage, the retrieval, and the prompt-building — all of that happens inside Docker containers. But the embedding model and the LLM itself both run natively on the host, on Ollama, so they get Metal acceleration on Apple Silicon. And the containers reach that native Ollama server through `host.docker.internal`. This is the same pattern you set up back in Module 2 — model servers stay native, everything else runs containerized and talks to the host across that bridge.

So why ChromaDB, specifically, for this course? A few reasons. It's zero-config — one Docker service, no cluster to stand up, no configuration files to write. It's Python-native, so `langchain-chroma` wires in with under ten lines of code. It's persistent, meaning a Docker volume keeps your vectors across restarts. And it's memory-efficient — the whole stack runs comfortably within 2 gigabytes, with roughly 768 megabytes for ChromaDB and about a gigabyte for the app. One detail worth remembering: we pin ChromaDB to version 0.5.20 specifically, because `langchain-chroma` ships a client built against the 0.5 HTTP API, and if you ran 0.6 instead, the version handshake between client and server would just fail. Pinning removes that ambiguity entirely.

Now, ChromaDB won't be the right choice forever. Once you outgrow a laptop-sized setup, you'd reach for something like Qdrant if you need multi-tenant search across millions of vectors, or pgvector if you're already running PostgreSQL and don't want a new service at all. The good news is that the API you're learning here — things like `add_documents` and `similarity_search` — stays almost identical across all of these. You'd swap out the `Chroma` constructor, and the rest of your code barely changes.

One more thing before the lab: the app you're about to build ships with something called Learning Mode, and it's turned on by default. As you type a question, it shows you each pipeline step happening live — how long the query embedding took, how many chunks were searched and how many came back, the actual retrieved text from ChromaDB, and the generation time. This makes every invisible part of RAG visible to you, so when a grounded answer shows up, you can trace it back to the exact sentence, in the exact document, that produced it.

### Suggested visuals / slide beats

1. Divider: "The naive-RAG pipeline"
2. Pipeline diagram with numbered steps 1-8, container boundary drawn around chunk/store/retrieve/augment, native-Ollama box around embed/generate
3. "Why ChromaDB" checklist: zero-config, Python-native, persistent, memory-efficient
4. Learning Mode screenshot/mock: four live steps shown as the user types
5. Takeaway: ingest and query share the embedding step; native model servers, containerized pipeline

---

## Video 5: Five Ways Naive RAG Breaks — And Why Module 6 Fixes Them

**Format:** Slides + voiceover
**Estimated duration:** 5 minutes
**Learning objective:** By the end, learners can name the five common failure modes of naive RAG and explain, at a high level, what agentic RAG does about each.

### Narration script

Naive RAG works well when your question uses roughly the same words as your documents. But once that stops being true, it breaks down in a few predictable ways, and it's worth knowing all five before you build the lab, so you know what you're NOT protected against yet.

Let's walk through them one by one.

The first is query mismatch. If your question's wording is different enough from the document's wording, the two embeddings can land far apart in that meaning-space we talked about, even though a human would immediately see the connection. Someone asking "what happens if payments falls over?" might completely miss a runbook titled around the word "restart."

The second is a wrong chunk boundary. Remember, we split documents into fixed 500-character pieces. If a multi-step procedure gets cut across that boundary, neither of the two resulting chunks has the full picture on its own, and retrieval hands the model an incomplete answer.

The third is single-pass retrieval. Naive RAG retrieves exactly once, and then it hands off to generation. There's no retry, and there's no self-correction. If that one retrieval attempt misses the right chunk, the pipeline has no way to notice and try again.

The fourth is no query rewriting. Whatever the user types goes straight to the vector store, exactly as typed, jargon and typos and all. And any of that can quietly degrade the similarity score, even when a slightly rephrased version of the same question would have matched perfectly.

And the fifth is a stale index. If your runbooks change but you never re-run the ingest phase, the vector store keeps answering from the old version, and it does so just as confidently as if it were current.

Now, Module 6 introduces what's called agentic RAG, and the core difference is this: instead of a fixed, one-shot pipeline, you get an agent that can decide what to do next. It can rewrite a query before searching. It can run more than one retrieval pass. It can judge whether the evidence it found is actually good enough to answer with. And it can call outside tools when it needs to. Look back at those five failure modes — agentic RAG addresses every single one of them. And once you've seen naive RAG fail in a real, hands-on way, in the lab that follows, it becomes a lot easier to see exactly why that added complexity is worth it.

### Suggested visuals / slide beats

1. Divider: "Where naive RAG breaks"
2. Five-row failure-mode table: query mismatch, wrong chunk boundary, single-pass retrieval, no query rewriting, stale index — each with its concrete example
3. Bridge diagram: naive RAG (one-shot) vs. agentic RAG (decide, retry, rewrite) — teaser for Module 6
4. Takeaway: agentic RAG in M6 addresses all five failure modes

---

## Video 6: Module 5 Summary — Into the Lab

**Format:** Slides + voiceover
**Estimated duration:** 2 minutes
**Learning objective:** Learners can recap the module's core ideas and know exactly what they're about to build and observe in the lab.

### Narration script

Let's bring this together.

You now know why a raw model can't be trusted with questions about your own systems, and why RAG fixes that by handing the model a cheat sheet at query time instead of retraining it. You've seen the four parts every GenAI application needs — an LLM endpoint, an embedding model, a vector database, and the application layer — and you know that a vector database is really a librarian who shelves by meaning, not by title. You've walked through the full naive-RAG pipeline, ingest and query, and you know exactly where the container boundary sits and why ChromaDB was the right call for a laptop-sized course. And you know the five ways naive RAG breaks, which is exactly what sets up Module 6.

In the lab that follows, you'll hand-author the `compose.yaml`, service by service, start the stack, ingest Acme's runbooks, and ask it, "How do I restart the payments service?" You'll watch Learning Mode reveal which exact runbook chunk got retrieved, and you'll watch the model generate a grounded, correct answer from it, live.

Let's go build it.

### Suggested visuals / slide beats

1. Recap slide: four callbacks (RAG's fix, four-part anatomy, librarian analogy, pipeline)
2. Lab bridge slide: "Next — ingest Acme's runbooks, ask a real question"

---

## Coverage map

| Source idea | Video | Treatment |
|---|---|---|
| Raw LLM unreliable on internal facts (opening scenario) | 1, 2 | Explained |
| RAG definition — grounding via context, no retraining | 1, 2 | Explained |
| Use Case A: Docs Assistant arc | 1 | Explained |
| Four parts of a GenAI application | 2 | Explained |
| Filing cabinet vs. librarian analogy | 3 | Explained |
| Embeddings (768-dim, nomic-embed-text) | 3 | Explained |
| Similarity search = nearest neighbors | 3 | Explained |
| Ingest phase (load, chunk, embed, store) | 4 | Explained |
| Query phase (embed, retrieve, augment, generate) | 4 | Explained |
| Container boundary / native Ollama + host.docker.internal | 4 | Explained |
| Why ChromaDB (zero-config, Python-native, persistent, memory-efficient) | 4 | Explained |
| ChromaDB 0.5.20 pin rationale | 4 | Explained |
| Scale-up alternatives (Qdrant, pgvector, managed cloud) | 4 | Deferred (mentioned briefly, not detailed — matches lesson's own brevity here) |
| Learning Mode (4 live steps) | 4 | Explained |
| Five naive-RAG failure modes | 5 | Explained |
| Agentic RAG teaser / Module 6 bridge | 5, 6 | Explained |
| Summary table | 6 | Explained |
| Lab bridge (compose.yaml, ingest, ask the payments question) | 1, 6 | Explained |

## Verification flags

- ChromaDB version pin (0.5.20) and the langchain-chroma HTTP API handshake claim are software-version-dependent — re-verify if the lab's compose.yaml pins a different version at recording time.
- Memory figures (768 MB ChromaDB, ~1 GB app, 2 GB total) depend on the actual container resource limits set in the lab's compose.yaml — re-verify against the current file before recording exact numbers.
