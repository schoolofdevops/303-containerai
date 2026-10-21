# Lab-test evidence — Setup: Prerequisites page

**Machine:** Apple Silicon (arm64), 16 GB · Rancher Desktop · native Ollama 0.40.7
**Date:** 2026-10-21

## Ollama version floor

```
$ ollama --version
ollama version is 0.40.7
```

Page states "Ollama 0.40 or newer" (MLX engine on Apple Silicon; the thinking switch-off depends on it).

## Model pulls (real output, fresh pull into an empty scratch model directory on a second Ollama server)

`ollama pull qwen3.5:2b` ran at about 4.8 MB/s and finished with the final state below (the bar redraws in place):

```
pulling manifest
pulling model: 100% ▕█████████████████████████▏ 3.1 GB
writing manifest
success
```

`ollama pull nomic-embed-text`:

```
pulling manifest
pulling 970aa74c0a90: 100% ▕██████████████████▏ 274 MB
pulling 31df23ea7daa: 100% ▕██████████████████▏  420 B
verifying sha256 digest
writing manifest
success
```

```
$ ollama list | grep -E "qwen3.5:2b|nomic-embed-text"
qwen3.5:2b                   dfaf2605162e    3.1 GB
nomic-embed-text:latest      0a109f422b47    274 MB
```

The scratch server and its model directory were removed afterwards; the machine's own models were not touched.
