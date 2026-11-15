# AI Reconnaissance Report: NASA CLPS Lunar Mission Browser (Honoured1)

## 1. Backend Framework and Status
- **Current State:** No backend was previously committed in the repository.
- **Adopted Framework:** Python 3.11+ with FastAPI, Pydantic v2, `httpx` (async), `pydantic-settings`, and `pytest`/`pytest-asyncio`.
- **Target Backend Location:** `backend/`
  - Entrypoint: `backend/app/main.py`
  - AI Module: `backend/app/ai/`
  - Test Suite: `backend/tests/ai/`

## 2. Existing Endpoints & Data Locations
- **Backend Endpoints:** None prior to this build.
- **Frontend Mission Data:** `frontend/src/lib/mission-store.ts` contains `CATALOG` with 9 CLPS missions (`artemis-clps-1`, `viper`, `griffin-1`, `im-1`, `im-2`, `blue-ghost-1`, `blue-ghost-2`, `peregrine-1`, `im-3`).
- **AI Data Source of Truth:** Per build specification Section 6, placeholder seed data files are maintained in `backend/app/ai/data/sites.seed.json` (coordinates strictly `null`) and `backend/app/ai/data/missions.seed.json` (empty array until authoritative data is loaded).

## 3. Scientific Engine Status
- **Status:** Not implemented yet in the repository.
- **Adapter Strategy:** In accordance with Section 7, `get_positions` and `get_illumination` tools are created as adapters implementing `PositionService` and `IlluminationService` protocols. Since no scientific engine exists yet, they return `ToolResult(status="not_available", message="The position/illumination calculation engine is not implemented yet.")` and mark `# TODO(engine)` for future integration.

## 4. Frontend Architecture and Routes
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide React.
- **Navigation Shell:** `frontend/src/components/app-shell.tsx` with top bar and left sidebar navigation.
- **Routes in App.tsx:**
  - `/login`, `/` -> `Login`
  - `/dashboard`, `/home` -> `Home`
  - `/missions`, `/missions/:id`, `/missions/add`
  - `/planner`, `/visualization`, `/lunar-map`, `/resources`, `/settings`
- **AI Integration Target:**
  - Dedicated route `/ai` rendering `AIPanel` with `variant="dashboard"` inside the `AppShell`.
  - Sidebar item added under "AI Assistant" between Resources and Settings.
  - Floating collapsible drawer supported (`variant="drawer"`) for overlay access from 3D visualization.
