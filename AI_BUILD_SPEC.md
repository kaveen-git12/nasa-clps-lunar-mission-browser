# AI Assistant Build Spec: NASA CLPS Lunar Mission Browser (Honoured1)

> **Audience:** AI coding agent (Antigravity) building this feature in the repo `nasa-clps-lunar-mission-browser`.

---

## 0. Ground rules for the agent

1. **Work on a new branch** `feature/ai` created from the current working branch. **Commit after every phase** with a clear message. Never force-push, never rewrite history.
2. **Inspect the repo before changing anything.** Report what you find: backend framework, existing endpoints, data files, frontend routes. If no backend exists, create one under `backend/` using FastAPI.
3. **Do not break existing frontend functionality.** The frontend (`frontend/`, React + TypeScript + Vite + Tailwind + React Router) has existing dashboards, cursors, and layout. Add new files cleanly and mount the AI dashboard.
4. **Never invent data.** Do not make up mission facts, dates, coordinates, or calculation results. Use clearly marked placeholders.
5. **Never implement orbital mechanics, coordinate transforms or illumination yourself inside the AI module.** Those belong to a separate scientific engine. The AI module only *calls* it through tools. If the engine functions do not exist yet, the tools return a `not_available` result.
6. **The model never executes anything directly.** It proposes tool calls. The backend validates every argument, executes, and returns results.
7. **No external AI services.** No Gemini, OpenAI or other cloud API calls, no API keys. Inference is local only via Ollama.
8. Ask the owner rather than guessing if something contradicts what you find in the repo.

---

## 1. What we are building (Updated for Dashboard UI)

A **local AI assistant** inside the Lunar Mission Browser (Honoured1) that lets a user:

| ID | Feature | Example input | Behavior |
|---|---|---|---|
| F1 | Grounded mission Q&A | "Which missions target the south pole?" / "Tell me about Shackleton crater and why it's important for lunar missions." | Retrieve records via `search_missions` / `get_site`, summarize **only** retrieved data, cite sources |
| F2 | Natural language to calculation | "Is it lit on 3 Nov at 12:00 UTC?" | Model extracts site + time, backend runs calculation adapter, model explains the returned result |
| F3 | Scene commands | "Fly to Malapert Massif" | Model proposes a validated JSON command, frontend validates and dispatches it |

**UI Mockup Reconciliation Rules:**
1. **Two-Site Prose Comparisons Allowed (Tables Out of Scope):** The UI includes a *"Compare landing zones"* card and *"Compare Malapert Massif and de Gerlache"* prompt pill. The model may call `get_site` for two sites in a single step (within the 3-tool-calls-per-step budget) and summarize differences in plain text, but custom comparison table components remain out of scope.
2. **Document Upload Disabled:** Document upload (F8) remains out of scope. The paperclip attachment icon in the chat input bar must be rendered `disabled` with a tooltip (`"Document upload is not available in this build"`).
3. **Client-Side Recent Conversations:** The backend `/api/ai/chat` endpoint remains stateless. The **Recent Conversations** widget in the right sidebar is persisted strictly in browser `localStorage` (wrapped in `try/catch`, capped at 10 recent threads).

---

## 2. Fixed technology decisions

| Item | Decision |
|---|---|
| Model | **Qwen3 4B**, Ollama tag `qwen3:4b` (4-bit quantized, roughly 2.5 GB download) |
| Runtime | **Ollama**, bound to `127.0.0.1` only (default port 11434) |
| Backend | Python 3.11+, FastAPI, Pydantic v2, `httpx` (async), `pytest`, `pytest-asyncio` |
| Streaming | Server-Sent Events from `POST /api/ai/chat` |
| Frontend | Existing React + TypeScript + Tailwind stack. No new UI framework. |
| Retrieval | Structured lookups + simple keyword search over JSON/DB records. **No embeddings, no vector DB.** |
| Config | Environment variables with defaults |

---

## 3. Repository layout and configuration

### 3.1 Backend Layout
```
backend/
  app/
    main.py
    ai/
      __init__.py
      router.py
      orchestrator.py
      llm_client.py
      prompts.py
      schemas.py
      guards.py
      audit.py
      tools/
        __init__.py
        registry.py
        missions.py
        sites.py
        positions.py
        illumination.py
        scene.py
      data/
        sites.seed.json
        missions.seed.json
  tests/ai/
    test_all_ai.py
    eval_prompts.json
  requirements.txt
  .env.example
```

### 3.2 Frontend Layout
```
frontend/src/features/ai/
  AIPanel.tsx                  # supports variant="dashboard" (full-page /ai route) and variant="drawer" (collapsible overlay)
  AIChat.tsx                   # hero banner, quick actions, prompt pills, message list, status bar, stop button, input
  SourceChips.tsx              # clickable source chips, "Calculated by backend" badge, warnings list
  useAIChat.ts                 # SSE client hook, health polling, localStorage conversation history
  useSceneCommands.ts          # client-side validation + dispatch of scene commands
  types.ts                     # mirrors backend schemas
  sceneCommandBus.ts           # tiny event bus the 3D scene can subscribe to
```

### 3.3 Root AI Directory
```
ai/
  AI_BUILD_SPEC.md
  eval_prompts.json
  README.md
  docs/
    ai-recon.md
    ai-setup.md
    ai-scene-commands.md
    ai-eval.md
```

---

## 4. Backend Design & Orchestrator Loop

1. **System Prompt:** Injects current UTC time and UI context (`selected_site_id`, `selected_time_utc`).
2. **Step Budget:** Up to `AI_MAX_TOOL_STEPS` (default 4) tool-calling iterations, max 3 tool calls per step.
3. **Faithfulness Guard:** Validates numbers present in the answer against tool inputs/outputs and user text.
4. **Safety Sanitization:** Strips `<think>` reasoning tags and external hyperlinks.

---

## 5. Frontend Design (Lunar AI Mission Control Dashboard)

- **Center Column:**
  - Hero Header with glowing 4-point star orb, "Lunar AI", "Ask. Explore. Analyze."
  - 4 Quick-Action cards (Explain landing site, Check illumination, Compare landing zones, Summarize mission data).
  - Chat feed with polite live regions, suggested prompt pills, streaming status indicators with "Stop" button.
  - Input bar with disabled attachment icon and purple action button.
- **Right Sidebar:**
  - Local Model Status card with live connection state and device specifications.
  - Available Tools card with direct action triggers.
  - Recent Conversations card persisted in local storage.
