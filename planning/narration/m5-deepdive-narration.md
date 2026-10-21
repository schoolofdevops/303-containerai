# Module 5 Deep Dive — RAG Parameters Under the Hood — Narration Package

Source: `site/docs/m5-naive-rag/deep-dive.md`. Deck: `site/static/decks/05-deepdive.html`.

## Coverage map

| Source section | Video |
|---|---|
| Opening scenario (lab worked, never asked why) | Video 1 (intro) |
| §1 Chunk size and overlap | Video 2 |
| §2 top-k | Video 3 |
| §3 Similarity metric and embedding model | Video 4 |
| §4 Context-window budget + truncation proof | Video 5 |
| §5 Failure modes: retrieval miss vs generation miss | Video 6 |
| §6 Querying ChromaDB directly + §7 chunking experiment | Video 7 |
| Where you will use this / lab bridge | Video 8 (summary) |

Retell check: written directly from the technical facts (numbers, commands, distances) with the lesson closed for sentence construction — prose reshaped as spoken teaching, not read aloud from the page.

---

## Video 1 — RAG Worked. Now Let's Open the Hood.

**Format:** Talking head
**Duration:** ~2 min (≈260 words)
**Learning objective:** Set up why the deep dive matters — the lab produced a working answer without explaining any of the choices behind it.

### Script

Hello and welcome back. In the last lesson, you wired up ChromaDB and a small Streamlit app, fed it Acme's runbooks, asked a question, and watched it come back with the right answer. It worked. But if I asked you right now, why five hundred characters per chunk, why three chunks retrieved, why this particular embedding model — would you have an answer? Most learners wouldn't, because the lab never asked you to. Those numbers were just sitting there in `app/main.py`, already chosen.

This deep dive is where we go back and open every one of those knobs. What does chunk size actually control? What is `top-k` really doing to your context window? What distance is ChromaDB even using when it says "found three relevant chunks" — is that a similarity score, or something else entirely? And when the app gives you a wrong answer, how do you tell whether retrieval failed, or the model failed?

We'll also run a real experiment — the same corpus, three different chunking strategies, and we'll watch the actual retrieved chunks and actual answers change in front of us. Not theory. Captured output, from this exact lab stack.

By the end, you'll be able to look at any RAG pipeline's config and reason about what each number is trading off — not just copy defaults that happened to work once. Let's get into it.

---

## Video 2 — Chunk Size: How Big a Slice Should You Cut?

**Format:** Slides + voiceover
**Duration:** ~5 min (≈680 words)
**Learning objective:** Understand what chunk size and overlap actually trade off, using the index-card analogy, and see why this particular corpus produced exactly two chunks.

### Script

Let's start with the first knob the lab never explained: `chunk_size=500`, `chunk_overlap=50`. Five hundred characters per chunk, and the last fifty characters of one chunk get repeated at the start of the next. Why those numbers?

Here's a way to think about it that would make sense even if you'd never touched a vector database. Imagine you're turning a long runbook into index cards for a study deck — one fact per card, so you can shuffle them and pull out whichever one you need. Now, if you cut your cards too small, a card can end mid-sentence. The fact "restart the payments service" lands on one card, and the actual command to do it lands on the next card. So anyone who picks up just that one card gets half an idea.

And if you cut your cards too large, each card ends up trying to hold four unrelated procedures at once. So when you ask the librarian for "the payments card," she hands you a card whose meaning is really an average of four different topics — and that card is a mediocre match for basically anything specific you ask.

Overlap is the fix for the boundary problem. It's like photocopying the last couple of lines from each card onto the front of the next one, so a fact that happens to fall right on a cut never gets orphaned with no context around it.

Now, technically, the splitter here — it's called `RecursiveCharacterTextSplitter` — tries to cut on paragraph breaks first, then line breaks, then spaces, and only as an absolute last resort does it cut in the middle of a word. So it's already trying to avoid the worst version of this problem.

Here's what's interesting about this specific lab. Acme's whole corpus is only about eight hundred characters. At five hundred characters a chunk, the splitter packs roughly two of Acme's four runbook sections into each chunk — and that's exactly why your ingest reported two chunks for the whole document, not four, not ten. Overlap barely matters at this scale. It starts earning its keep on longer documents, where a single procedure genuinely spans a chunk boundary.

So what happens if you go too small — say a hundred characters? Your embeddings get more precise about what each individual chunk means. But each retrieved chunk now carries less surrounding context. The model gets the command, but maybe not the caveat sitting two sentences later — something like "the payments service depends on the Postgres primary." And you've also multiplied your chunk count, which costs you storage and search time for no real quality gain, once your chunks are already smaller than one coherent idea.

And too large — say two thousand characters, on this same small corpus? Now a single chunk would swallow two or three of Acme's runbook sections into one embedding. The embedding model has to compress "restart payments," "database backup," and "checkout errors" into one seven-hundred-and-sixty-eight number average. That's noise dilution. A question about payments now has to compete with unrelated content baked right into the same vector — and worse, retrieving that oversized chunk eats into your context-window budget, which we'll get to in a few minutes, on paragraphs the question never even asked about.

So there's no single right chunk size. It depends on how self-contained a fact already is in your corpus. A FAQ where every question and answer is already a natural unit wants small chunks, close to that unit's own size. A long runbook where one procedure spans several paragraphs wants bigger chunks, or overlap generous enough to keep a straddling step intact.

---

## Video 3 — top-k: How Many Cards Do You Hand the Model?

**Format:** Slides + voiceover
**Duration:** ~4 min (≈540 words)
**Learning objective:** Understand top-k as a context-budget decision, not a safety dial, and see why k=3 is doing nothing at all on this tiny corpus.

### Script

Next knob: `search_kwargs={"k": 3}`. Every single query, the lab retrieves the three most similar chunks — regardless of how many chunks even exist, and regardless of how relevant that third one actually is.

Now here's a habit worth breaking early: more retrieval is not automatically safer. Every chunk you retrieve is text the model has to read before it can answer, and it's competing for two things that are both limited — your context-window budget, and the model's attention. So if `k` is too small, you can miss the answer completely, if the right chunk happens to land fourth in the similarity ranking and never gets pulled in at all. But if `k` is too large, you're handing the model near-duplicate or off-topic chunks right alongside the real answer.

Now, on Acme's tiny corpus, something interesting happens. There are only two chunks total. So asking for `k=3` means you're already retrieving everything that's indexed — `k` isn't filtering anything here, because there's nothing left to filter out. But imagine a bigger corpus. There, a `k` that's too generous makes the model do the filtering work that retrieval was supposed to do for it in the first place. And a plausible-sounding but wrong chunk, sitting there in the context window, is exactly what produces a confidently wrong answer — we'll talk about that failure mode in a few minutes.

So how do you actually pick `k`? It's shaped by your corpus. A narrow FAQ, where one chunk usually answers the whole question, wants `k` around one or two. A runbook where the answer commonly spans two related sections — the command, and then the prerequisite two sentences later — wants something like three to five. Go much above that, and you're usually diluting more than you're helping. And that's actually the point where naive top-k retrieval starts running out of road, and you'd want a re-ranking step instead — something this module's naive RAG doesn't have, but we'll come back to that.

---

## Video 4 — What "Similar" Actually Means: L2 Distance vs Cosine

**Format:** Slides + voiceover
**Duration:** ~5 min (≈660 words)
**Learning objective:** Understand that ChromaDB defaults to L2 distance, why that happens to match cosine similarity for this specific embedding model, and why the embedding model — not the LLM — is what really decides retrieval quality.

### Script

Here's a question that sounds obvious but usually isn't: when the app says "found three relevant chunks," relevant by what measure exactly?

Look at how the lab sets up its vector store — the `Chroma` constructor never passes any `collection_metadata`, no override for what's called `hnsw:space`, anywhere in the code. That means the collection runs on ChromaDB's default index: squared L2, or Euclidean, distance. Not cosine similarity. So every time you see "found N relevant chunks," what's actually happening is ChromaDB returning the chunks with the smallest L2 distance to your question. It's a distance, not a similarity score — which is why, if you ever query the raw numbers yourself, smaller means more relevant, the opposite of what you'd expect from a percentage.

Now, does this actually matter here? For this particular embedding model, `nomic-embed-text`, the answer is — mostly no, and here's why. Its embeddings come out close to unit length by construction. And when two vectors are both unit length, L2 distance and cosine similarity produce the exact same ranking — they're mathematically tied together. So for this specific model, the metric choice is close to academic.

But that stops being true the moment you swap in an embedding model that doesn't normalize its output. Then L2 distance starts rewarding vector magnitude as well as direction — something cosine similarity ignores completely. So if you ever change embedding models, the first thing to check is whether the new model's vectors are normalized, before you assume the ranking behaves the same way it did before.

And here's the part worth sitting with: the language model — `qwen3.5:2b` in this lab — never even sees your documents until after retrieval has already handed it a slice of text. Every decision about which chunk counts as "similar" is made entirely by the embedding model's numeric picture of meaning. If that embedding model can't tell "restart" from "backup" in its own vector space, no amount of downstream language-model quality is going to fix a bad retrieval.

This is also why you can't just swap embedding models without re-embedding your whole corpus. Two different models place the same sentence at different coordinates that aren't comparable to each other. So storing embeddings from one model and querying with another doesn't just work worse — it produces meaningless distances, because they're not even points in the same space.

Why `nomic-embed-text` specifically, for this course? It's small enough to run natively on Ollama, right alongside `qwen3.5:2b`, inside a six gigabyte budget, with no GPU required — and it gives reasonable general-purpose retrieval quality for that cost. A larger, domain-tuned embedding model — something built specifically for code, or for legal text — would out-retrieve it on that domain. But that comes at a proportionally bigger memory and latency cost.

---

## Video 5 — The Context Window: What Actually Has to Fit

**Format:** Slides + voiceover
**Duration:** ~6 min (≈820 words)
**Learning objective:** Work the token arithmetic for the app's actual prompt, and see live proof of what Ollama does when a prompt exceeds num_ctx.

### Script

Now let's talk about the ceiling every single prompt in this app has to fit inside. The lab sets `num_ctx=4096` on the Ollama model — and that's the real limit, independent of how much larger `qwen3.5:2b`'s native training context actually is.

Every prompt the app builds has four parts stacked together — some fixed instructions, the retrieved context, the user's question, and then space left over for the answer. Every one of those four eats into that four thousand and ninety-six token budget.

Let's do the actual arithmetic, using this lab's own numbers. As a rough rule of thumb, five hundred characters of English prose comes out to roughly a hundred to a hundred and thirty tokens — call it four characters per token. With `chunk_size=500` and `k=3`, the three retrieved chunks together cost somewhere around three hundred to three hundred and ninety tokens. Add the fixed scaffolding text and the user's question, and your whole prompt lands around three hundred and fifty to four hundred and fifty tokens total. Out of four thousand and ninety-six. So at this lab's scale, you're using under fifteen percent of the ceiling — there's no pressure here at all.

But watch what happens the moment you scale up either side of that equation. Raise `k` to ten, on a corpus with fifteen-hundred-character chunks, and ten times fifteen hundred is already around three thousand seven hundred and fifty tokens of context alone. That crowds out the answer entirely inside a four thousand and ninety-six window — and here's the important part — Ollama does not warn you and stop. It silently truncates the prompt once it goes over `num_ctx`.

Now, I didn't want to just tell you that and move on — we actually verified this live, not assumed it. We sent a deliberately oversized prompt to `qwen3:4b`, served by llama.cpp, with `num_ctx` still set to four thousand and ninety-six. It had a unique marker sentence at the front, a large filler block in the middle, and the real question at the very end, about thirty thousand tokens in all. And the server log told us exactly what happened: it truncated the input down to two thousand and fifty tokens, roughly half the window, leaving headroom for the answer. One caveat. That is what happened with the models tested here. The same prompt sent to `qwen3.5:2b`, which is served by Ollama's MLX runner, was not truncated at all. So check your own model, do not assume.

Here's the detail that matters most, and it surprised us the first time we saw it. The truncation keeps a tiny fixed prefix — basically nothing — and then discards everything except the most recent tokens. So it keeps the tail of your prompt, not the head. We confirmed this directly: the model answered using the marker we'd placed at the back, and it had completely lost the marker we'd placed at the front.

Now think about what that means for this app's actual prompt shape. The retrieved chunks come first, and the question comes last, right before "Answer:". So if this prompt ever goes over budget, it's your earliest retrieved chunks that get dropped first — while the question itself, sitting right at the end, is the very last thing to go. So the practical habit here is: before you scale up `top-k` or your chunk size, size that multiplication against your actual `num_ctx` first. And if you ever suspect this is happening in production, the tell to watch for is a specific warning line in Ollama's own server log about truncating the input prompt.

---

## Video 6 — Retrieval Miss or Generation Miss? Two Different Bugs

**Format:** Slides + voiceover
**Duration:** ~4 min (≈530 words)
**Learning objective:** Distinguish retrieval misses from generation misses, and understand why naive RAG — with no re-ranking step — makes retrieval misses more likely than they need to be.

### Script

When this app gives you a wrong answer, there are two completely different things that could have gone wrong — and confusing the two just wastes your debugging time.

The first is a retrieval miss. The wrong chunk, or no useful chunk at all, got retrieved — and the model actually answered correctly, given what it was handed. It just wasn't handed the right thing. That's a problem with your embedding, your chunking, or your `top-k` — everything we've just walked through — not a problem with the model itself.

The second is a generation miss. Here, the right chunk was retrieved — you can confirm this yourself, either by reading "View Source Chunks" in the lab's own interface, or by querying ChromaDB directly, which we'll do in the next video — but the model still got it wrong. Maybe it ignored part of the context, or it answered something that isn't actually in the text at all. That's a prompting problem, or a model-capability problem, not a retrieval problem.

Now, here's why naive RAG makes retrieval misses more likely than they need to be: there's no re-ranking step anywhere in this pipeline. It retrieves once, by raw vector distance, and hands back whatever comes out, straight to the model. It never stops to ask, "is chunk number two — which scored slightly worse on embedding distance, but is obviously more relevant to what's actually being asked — the better answer here?"

A production RAG system commonly adds exactly that step — a smaller, more precise model that re-scores the top handful of candidates from the vector search before deciding what to actually hand the language model. That step exists specifically to catch the case where two chunks are semantically close in embedding space — say, both of them are "ops procedures" — but only one of them actually answers the question being asked.

This module's naive RAG has no such step. And that gap — the gap between "retrieved something plausible" and "retrieved the actually relevant thing" — is exactly the class of problem the next module's agentic retrieval starts to address.

---

## Video 7 — Proving It: Querying ChromaDB Directly and Comparing Three Chunking Strategies

**Format:** Slides + voiceover
**Duration:** ~6 min (≈830 words)
**Learning objective:** See the raw distance scores ChromaDB is actually ranking on, and walk through the live three-way chunking experiment and what it reveals.

### Script

Everything we've talked about so far, you can go verify yourself, directly against the running stack — not through the Streamlit interface, which summarizes and truncates what it shows you, but through ChromaDB's own API, which gives you the unfiltered picture.

Query the collection directly, and it tells you flatly: `"space": "l2"`. That's ChromaDB itself confirming the default metric we talked about earlier — nobody overrode it, so the collection came up running on L2 distance. And it also confirms the embedding dimension — seven hundred and sixty-eight, matching `nomic-embed-text`.

Now ask it a real question — "how do I restart the payments service" — with `k=3`, and look closely at what comes back. Only two results print, even though three were requested, because remember, this collection only has two chunks total — ChromaDB hands back everything it has and simply stops. The scores you'll see — numbers like 0.6956 and 1.0968 — those are raw squared L2 distances. Lower is better here, which again is the opposite of a similarity percentage, and it's exactly the number the app is silently ranking on every time it decides which chunks to hand the model.

We also went and verified the claim from a couple of videos back — that `nomic-embed-text`'s vectors really do come out at unit length through this app's exact code path, not just in theory. Three arbitrary sentences, embedded through the same `OllamaEmbeddings` class the app uses, all came back with an L2 norm of essentially one point zero zero zero zero. Confirmed, not assumed.

Now, the real experiment. We re-ingested the exact same Acme corpus three separate times, under three different chunking strategies, each into its own collection so nothing touches the running lab app. The baseline is the lab's own values — five hundred characters, fifty overlap — producing two chunks. Variant A goes small and tight — a hundred and fifty characters, no overlap — producing eleven chunks. Variant B goes large and generous — twelve hundred characters, two hundred overlap — and on this small a corpus, that collapses the entire document into exactly one chunk.

Here's what's genuinely interesting. Variant A — the small, tight chunks — actually produced the lowest distance score of all three, on the payments question, because one of its eleven tiny chunks is purely about the restart command, with nothing else diluting that vector. It did the same thing for the backup-retention question, landing the single best score in the whole experiment. But look closer at what that top chunk actually contains — just the heading "Database backups," with no body text at all. That's the orphaned-fact problem we talked about back in the very first video, showing up for real. The answer only came out correct because `k=3` happened to also pull in a neighboring chunk that actually had the retention number.

Variant B, the single-chunk collapse, tells the opposite story — every question, no matter the topic, returns that same one chunk, and you can see it in the distance scores, the highest across the whole table, because the vector is working harder to match something that's really an average of four unrelated procedures.

All three variants still produced correct, grounded answers here — because this corpus is small enough that even variant B's one giant chunk contains the entire answer space. But on a bigger, real corpus, that same collapse-everything failure mode in variant B would start returning chunks that are topically wrong, not just imprecise. So judge the deterministic parts of an experiment like this strictly — chunk counts and distance numbers are exact, reproducible facts about your corpus. Judge the model's actual prose only loosely — exact wording moves around a little, run to run, even at zero temperature, on a small local model.

---

## Video 8 — What You Now Know, and Where It Applies

**Format:** Slides + voiceover
**Duration:** ~2.5 min (≈320 words)
**Learning objective:** Consolidate the five practical rules and bridge back into ongoing use of the lab stack.

### Script

Let's pull this together into rules you can actually carry forward.

Chunk size and overlap trade context completeness against embedding precision — use small, near-atomic chunks for something like a FAQ, and bigger chunks, or generous overlap, when a real procedure spans several paragraphs.

`top-k` is a context-budget decision, not a "more retrieval is always safer" dial — size it to how often your answer genuinely spans multiple chunks, not to whatever default happened to work on someone else's documents.

ChromaDB's default index metric is L2 distance, not cosine similarity — verify that, don't assume it, especially the moment you swap in a different embedding model and retrieval quality changes.

The embedding model, not the language model, decides what gets retrieved in the first place — and embeddings from two different models are never comparable, so budget for a full re-ingest whenever you upgrade one.

And when an answer comes out wrong, split the diagnosis immediately — check the actually retrieved chunks first, through the raw API, before you touch the prompt or blame the model. A retrieval miss needs a chunking or embedding fix. A generation miss needs a prompting fix. They're not the same bug.

None of this changes anything about the lab stack you already have running — the `documents` collection, the app, all of it stays exactly as you left it. What changes is how you'd read it now. Next time you see "found three relevant chunks" on screen, you know exactly what number is behind that sentence, and exactly which knob you'd reach for if it started giving you the wrong three. That's what carries forward into Module Six, where the agent itself starts deciding whether, and what, to retrieve.
