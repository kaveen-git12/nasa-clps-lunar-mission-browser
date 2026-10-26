# Lunar AI Mission Control System

This folder (`/ai`) sits alongside `/frontend` and `/backend` as the dedicated AI module workspace for the NASA CLPS Lunar Mission Browser (Honoured1).

## Contents
- **`AI_BUILD_SPEC.md`**: Specification reconciling the visual mockup with the technical architecture.
- **`docs/`**:
  - `ai-recon.md`: Reconnaissance of existing project structure and data.
  - `ai-setup.md`: Guide to setting up local Ollama, pulling Qwen3 4B, and starting services.
  - `ai-scene-commands.md`: Specification and integration guide for the 3D scene command bus.
  - `ai-eval.md`: Benchmark criteria, test suites, and evaluation report.
- **`eval_prompts.json`**: 25+ benchmark evaluation prompts testing retrieval, calculation adapters, scene control, safety, and refusals.
