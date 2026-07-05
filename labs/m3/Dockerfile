# M3 · vLLM on CPU — patched image for containerized (zero-NUMA) hosts.
#
# The openeuler base ships a prebuilt CPU vLLM. Inside a container the kernel
# usually reports 0 NUMA nodes, and vLLM's cpu_worker.py divides the CPU count
# by numa_size — a division by zero that crashes the worker on startup. The one
# sed line below guards that division so the image runs anywhere.
FROM openeuler/vllm-cpu:0.9.1-oe2403lts

# Patch cpu_worker.py to handle zero NUMA nodes (containers report numa_size == 0).
RUN sed -i 's/cpu_count_per_numa = cpu_count \/\/ numa_size/cpu_count_per_numa = cpu_count \/\/ numa_size if numa_size > 0 else cpu_count/g' \
    /workspace/vllm/vllm/worker/cpu_worker.py

# CPU + threading defaults. compose.yaml can override any of these.
ENV VLLM_TARGET_DEVICE=cpu \
    VLLM_CPU_KVCACHE_SPACE=1 \
    OMP_NUM_THREADS=2 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1
