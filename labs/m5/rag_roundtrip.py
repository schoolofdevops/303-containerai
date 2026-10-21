#!/usr/bin/env python3
"""M5 checks helper — scripted RAG round-trip against the running compose stack.

Bypasses the Streamlit UI (which has no headless API) and drives the same
ingest -> embed -> store -> retrieve -> generate pipeline directly over the
ChromaDB HTTP API + native Ollama, exactly as validated in planning/lab-tests/m5.md.
Exits 0 and prints the grounded answer on stdout for checks.json to assert against.
"""
import json
import os
import re
import sys
import urllib.request

OLLAMA = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
CHROMA = f"http://localhost:{os.getenv('CHROMA_PORT', '8000')}"
LLM = os.getenv("LLM_MODEL", "qwen3.5:2b")
EMB = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
COLLECTION = "checks-roundtrip"
DOCS_PATH = os.path.join(os.path.dirname(__file__), "docs", "acme-runbooks.md")


def _post(url, payload, timeout=120):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def embed(text):
    return _post(f"{OLLAMA}/api/embeddings", {"model": EMB, "prompt": text})["embedding"]


def generate(prompt):
    return _post(f"{OLLAMA}/api/generate",
                 {"model": LLM, "prompt": prompt, "stream": False, "think": False,
                  "options": {"temperature": 0}})["response"].strip()


def ingest():
    col = _post(f"{CHROMA}/api/v2/tenants/default_tenant/databases/default_database/collections", {"name": COLLECTION, "get_or_create": True})
    cid = col["id"]
    text = open(DOCS_PATH).read()
    chunks = [c.strip() for c in re.split(r"\n(?=## )", text) if len(c.strip()) > 20]
    ids = [f"chunk-{i}" for i in range(len(chunks))]
    _post(f"{CHROMA}/api/v2/tenants/default_tenant/databases/default_database/collections/{cid}/add",
          {"ids": ids, "embeddings": [embed(c) for c in chunks], "documents": chunks})
    return cid


def retrieve(cid, query, k=1):
    res = _post(f"{CHROMA}/api/v2/tenants/default_tenant/databases/default_database/collections/{cid}/query",
                {"query_embeddings": [embed(query)], "n_results": k,
                 "include": ["documents"]})
    return res["documents"][0][0] if res["documents"][0] else ""


def main():
    cid = ingest()
    query = "How do I restart the payments service?"
    context = retrieve(cid, query)
    answer = generate(
        f"Based on the following context, answer the question.\n\n"
        f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
    )
    print(f"[retrieved] {context}")
    print(f"[answer] {answer}")


if __name__ == "__main__":
    main()
