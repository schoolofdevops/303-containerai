import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Setup',
      items: ['setup/prerequisites', 'setup/gpu-reality'],
    },
    {
      type: 'category',
      label: 'M1 · Container-Native GenAI',
      items: [
        'm1-container-native/lesson',
        'm1-container-native/lab',
        'm1-container-native/quiz',
      ],
    },
    {
      type: 'category',
      label: 'M2 · Serving Local Models',
      items: [
        'm2-serving/lesson',
        'm2-serving/lab',
        'm2-serving/quiz',
      ],
    },
    {
      type: 'category',
      label: 'M3 · Production Serving with vLLM',
      items: [
        'm3-vllm/lesson',
        'm3-vllm/lab',
        'm3-vllm/quiz',
        'm3-vllm/deep-dive',
      ],
    },
    {
      type: 'category',
      label: 'M3B · Fine-Tuning (optional)',
      items: [
        'm3b-finetuning/lesson',
        'm3b-finetuning/lab',
        'm3b-finetuning/quiz',
        'm3b-finetuning/deep-dive',
      ],
    },
    {
      type: 'category',
      label: 'M4 · Packaging Models as OCI Artifacts',
      items: [
        'm4-packaging/lesson',
        'm4-packaging/lab',
        'm4-packaging/quiz',
      ],
    },
    {
      type: 'category',
      label: 'M5 · Docs Assistant — Naive RAG',
      items: [
        'm5-naive-rag/lesson',
        'm5-naive-rag/lab',
        'm5-naive-rag/quiz',
        'm5-naive-rag/deep-dive',
      ],
    },
    {
      type: 'category',
      label: 'M6 · Declarative Agent — Agentic RAG',
      items: [
        'm6-declarative-agent/lesson',
        'm6-declarative-agent/lab',
        'm6-declarative-agent/quiz',
      ],
    },
    {
      type: 'category',
      label: 'M7 · Multi-Agent Incident Crew',
      items: [
        'm7-multi-agent/lesson',
        'm7-multi-agent/lab',
        'm7-multi-agent/quiz',
        'm7-multi-agent/deep-dive',
      ],
    },
    {
      type: 'category',
      label: 'M8 · Securing & Governing AI Workloads',
      items: [
        'm8-security/lesson',
        'm8-security/lab',
        'm8-security/quiz',
      ],
    },
    {
      type: 'category',
      label: 'Capstone · Ship the Acme AI Platform',
      items: [
        'capstone/index',
        'capstone/quiz',
      ],
    },
  ],
};

export default sidebars;
