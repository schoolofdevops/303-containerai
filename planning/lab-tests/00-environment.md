# Lab-test evidence — Phase 0: Environment

**Machine:** Apple Silicon (arm64), 16 GB RAM
**Date:** 2026-10-21
**Runtime:** Rancher Desktop — docker client `29.5.3-rd`, server `29.5.2` (dockerd/moby)
**Model server:** Ollama `0.40.7` (native, Metal; MLX runner for qwen3.5), serving on `:11434`
**Model:** `qwen3.5:2b` (2.7 GB), optional `qwen3:4b`, embeddings `nomic-embed-text`
**MCP gateway:** ToolHive `v0.55.2`

> Note: on this machine `docker` is not on the default PATH; automated checks prefix
> `PATH="$HOME/.rd/bin:$PATH"`. Learners running the course will have `docker` on PATH.

## Rancher Desktop

```
$ docker version --format 'client={{.Client.Version}} server={{.Server.Version}}'
client=29.5.3-rd server=29.5.2
```

Host networking — a container can resolve the host:

```
$ docker run --rm alpine sh -c "getent hosts host.docker.internal"
192.168.5.2       host.docker.internal  host.docker.internal
```

## Ollama (native)

Version:

```
$ ollama --version
ollama version is 0.40.7
```

Models pulled:

```
$ ollama list | grep -E 'qwen3.5|qwen3:4b|nomic'
nomic-embed-text:latest      0a109f422b47    274 MB    33 minutes ago
qwen3:4b                     359d7dd4bcda    2.5 GB    33 minutes ago
qwen3.5:2b                   dfaf2605162e    3.1 GB    42 minutes ago
```

Native API responds (`qwen3.5` thinks by default, so `think:false`):

```
$ curl -s http://localhost:11434/api/chat \
    -d '{"model":"qwen3.5:2b","stream":false,"think":false,"messages":[{"role":"user","content":"Say OK"}]}' | jq -r .message.content
OK
```

Loaded model — 100% GPU, MLX runner:

```
$ ollama ps
NAME          ID              SIZE      PROCESSOR    CONTEXT    RUNNER    UNTIL
qwen3.5:2b    dfaf2605162e    3.2 GB    100% GPU     4096       mlx       4 minutes from now
```

Model details:

```
$ ollama show qwen3.5:2b
  Model
    architecture        qwen3_5
    parameters          2.2B
    context length      262144
    embedding length    2048
    quantization        mxfp8
    requires            0.19.0
    renderer            qwen3.5
    parser              qwen3.5
    template source     renderer_parser

  Capabilities
    completion
    vision
    thinking
        levels     false, true
        default    true
    tools

  Parameters
    repeat_penalty      1
    temperature         1
    top_k               20
    top_p               0.95
    min_p               0
    presence_penalty    1.5
```

## ToolHive

```
$ thv version
ToolHive v0.55.2
Commit: 89b1bd28fee86b17c640c5811dbc1abac5edf30d
Built: 2026-10-19 23:30:57 UTC
Go version: go1.27.2
Platform: darwin/arm64
```

## CRITICAL: container → native Ollama via host.docker.internal

This is the wiring the entire M1 lab (and every later module) depends on.

List models from inside a throwaway container:

```
$ docker run --rm curlimages/curl:latest -s http://host.docker.internal:11434/api/tags | jq -r '.models[]|select(.name|test("qwen3.5|qwen3:4b|nomic"))|.name'
nomic-embed-text:latest
qwen3:4b
qwen3.5:2b
```

Generate from inside a container:

```
$ docker run --rm curlimages/curl:latest -s http://host.docker.internal:11434/api/chat \
    -d '{"model":"qwen3.5:2b","stream":false,"think":false,"messages":[{"role":"user","content":"Say hi in 5 words."}]}' | jq -r '"response: "+.message.content, "model: "+.model'
response: Hello there, I'm ready to help!
model: qwen3.5:2b
```

## Verdict

✅ Phase 0 complete. Rancher Desktop + native Ollama 0.40.7 + `qwen3.5:2b` verified. The
container→host model wiring works. Ready for the 2026 freshness pass.
