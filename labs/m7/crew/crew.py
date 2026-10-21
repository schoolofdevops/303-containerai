#!/usr/bin/env python3
"""Acme Incident Crew — a DECLARATIVE multi-agent crew.

Four agent profiles (Triage -> Investigator -> Fixer -> Reviewer), each defined by a markdown profile,
all sharing ONE native model endpoint. No per-agent model, no framework — agents are cheap Python
turns; the model is shared. The Investigator reuses the M6 agentic-RAG idea over the Acme runbooks; the
Reviewer is the human-in-the-loop safety gate.
"""
import json, os, re, sys, urllib.request, pathlib

OLLAMA = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
CHROMA = f"http://{os.getenv('CHROMA_HOST','localhost')}:{os.getenv('CHROMA_PORT','8000')}"
LLM = os.getenv("LLM_MODEL", "qwen3.5:2b")
EMB = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
COLLECTION = "acme_runbooks"
HERE = pathlib.Path(__file__).parent


def _post(url, payload, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def llm(prompt, system, temperature=0.2):
    return _post(f"{OLLAMA}/api/generate",
                 {"model": LLM, "prompt": prompt, "system": system, "stream": False,
                  "options": {"temperature": temperature}})["response"].strip()


def embed(text):
    return _post(f"{OLLAMA}/api/embeddings", {"model": EMB, "prompt": text})["embedding"]


def profile(name):
    return (HERE / "profiles" / f"{name}.md").read_text()


def ingest():
    col = _post(f"{CHROMA}/api/v1/collections", {"name": COLLECTION, "get_or_create": True})
    cid = col["id"]
    docs, ids = [], []
    for md in sorted((HERE.parent / "docs").glob("*.md")):
        for i, chunk in enumerate(re.split(r"\n(?=## )", md.read_text())):
            if len(chunk.strip()) > 20:
                docs.append(chunk.strip()); ids.append(f"{md.stem}-{i}")
    if docs:
        _post(f"{CHROMA}/api/v1/collections/{cid}/add",
              {"ids": ids, "embeddings": [embed(d) for d in docs], "documents": docs})
    return cid


def retrieve(cid, query, k=1):
    res = _post(f"{CHROMA}/api/v1/collections/{cid}/query",
                {"query_embeddings": [embed(query)], "n_results": k, "include": ["documents"]})
    return res["documents"][0][0] if res["documents"][0] else ""


def run(incident):
    cid = ingest()
    print(f"\n{'='*70}\nINCIDENT: {incident}\n{'='*70}")

    # 1) Triage
    triage = llm(f"Incident: {incident}", profile("triage"), temperature=0)
    print(f"\n[TRIAGE]      {triage}")

    # 2) Investigator — agentic RAG, WITH a relevance gate. Retrieval always returns a nearest
    #    neighbour, so we ask the model to confirm the passage actually addresses THIS incident.
    candidate = retrieve(cid, incident)
    relevant = llm(f"Incident: {incident}\n\nCandidate runbook passage:\n{candidate}\n\n"
                   f"Does this passage directly address THIS incident? Answer ONLY YES or NO.",
                   profile("investigator"), temperature=0).upper().startswith("YES")
    runbook = candidate if relevant else ""
    investigation = (candidate if relevant else "NO RUNBOOK FOUND — the knowledge base has no runbook "
                     "for this incident. Escalate to a human.")
    print(f"\n[INVESTIGATOR] {investigation}")

    # 3) Fixer — propose the runbook-backed command (or decline if no runbook)
    if not runbook:
        fix = "I cannot propose a fix: no runbook covers this incident."
    else:
        fix = llm(f"Incident: {incident}\nRunbook passage:\n{runbook}\n\n"
                  f"Propose the exact remediation command.", profile("fixer"))
    print(f"\n[FIXER]       {fix}")

    # 4) Reviewer — safety gate / approval (auto-reject when there's no runbook-backed fix)
    if not runbook:
        verdict = "REJECTED: no runbook-backed fix exists; escalate to a human on-call engineer."
    else:
        verdict = llm(f"Incident: {incident}\nProposed fix:\n{fix}\n\nReview it.", profile("reviewer"),
                      temperature=0)
    print(f"\n[REVIEWER]    {verdict}")
    print(f"\n{'='*70}\nOUTCOME: {'APPROVED — ready for a human to apply' if verdict.upper().startswith('APPROVED') else 'REJECTED — escalate'}\n")


def main():
    incidents = sys.argv[1:] or ["The checkout page is returning HTTP 503 errors for all users."]
    print(f"[crew] Acme Incident Crew: Triage -> Investigator -> Fixer -> Reviewer "
          f"(4 profiles, one shared model: {LLM})")
    for inc in incidents:
        run(inc)


if __name__ == "__main__":
    main()
