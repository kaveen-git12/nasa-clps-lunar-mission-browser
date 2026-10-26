# AI Setup and Operational Guide

## 1. System Requirements & Hardware Target
- **OS:** Windows 10/11, Linux, or macOS.
- **GPU Target:** NVIDIA RTX 5050 (8 GB VRAM) or equivalent.
- **Context Window:** 4096 tokens (`AI_NUM_CTX=4096`) to preserve VRAM while running alongside Three.js 3D globe scenes.
- **Local Model:** `qwen3:4b` (4-bit quantized, ~2.5 GB download).

## 2. Ollama Installation & Verification
1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Confirm Ollama is bound strictly to `127.0.0.1` (localhost only). On Windows, Ollama defaults to `http://127.0.0.1:11434`.
   Verify in terminal:
   ```bash
   curl http://127.0.0.1:11434/api/tags
   ```
3. Pull the required model:
   ```bash
   ollama pull qwen3:4b
   ```
4. Verify the model is present:
   ```bash
   ollama list
   ```

## 3. Backend Setup
1. Open terminal in `backend/`:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate   # On Windows
   # or source .venv/bin/activate on Linux/macOS
   pip install -r requirements.txt
   ```
2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Run backend tests:
   ```bash
   pytest tests/ai/test_all_ai.py -v
   ```

## 4. Frontend Setup
1. Open terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173/ai` to access the Lunar AI Mission Control Dashboard.
