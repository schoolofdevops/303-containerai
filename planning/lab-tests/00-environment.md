# Lab-test evidence — Phase 0: Environment

**Machine:** Apple Silicon (arm64), 16 GB RAM
**Date:** 2026-07-05
**Runtime:** Rancher Desktop — docker client `29.5.3-rd`, server `29.5.2` (dockerd/moby)
**Model server:** Ollama `0.17.4` (native, Metal), serving on `:11434`
**Model:** `qwen2.5:1.5b` (986 MB)

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

Model pulled:

```
$ ollama list
NAME            ID              SIZE      MODIFIED
qwen2.5:1.5b    65ec06548149    986 MB    ...
```

Native API responds (Metal-accelerated):

```
$ curl -s http://localhost:11434/api/generate \
    -d '{"model":"qwen2.5:1.5b","prompt":"Say hello in 3 words.","stream":false}'
response: Hello there!
```

## CRITICAL: container → native Ollama via host.docker.internal

This is the wiring the entire M1 lab (and every later module) depends on.

List models from inside a throwaway container:

```
$ docker run --rm curlimages/curl:latest -s http://host.docker.internal:11434/api/tags
models: ['qwen2.5:1.5b']
```

Generate from inside a container:

```
$ docker run --rm curlimages/curl:latest -s http://host.docker.internal:11434/api/generate \
    -d '{"model":"qwen2.5:1.5b","prompt":"Say hi in 5 words.","stream":false}'
response: Hello there!
model: qwen2.5:1.5b
```

## Verdict

✅ Phase 0 complete. Rancher Desktop + native Ollama + `qwen2.5:1.5b` verified. The
container→host model wiring works. Ready for the M1 lab (Wave B) validation.
