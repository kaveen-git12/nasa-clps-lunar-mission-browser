import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .ai.router import router as ai_router


def create_app() -> FastAPI:
    app = FastAPI(title="NASA CLPS Lunar Mission Browser API (Honoured1)")

    origins = [
        o.strip()
        for o in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
    app.include_router(ai_router)
    return app


app = create_app()
