"""FastAPI application entrypoint for the SEIS AI ecosystem API."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI

from .routes import create_router, default_store_path
from .services import EcosystemService
from .storage import LocalStore


def create_app() -> FastAPI:
    repo_root = Path(__file__).resolve().parents[2]
    database_path = Path(os.getenv("SEIS_AI_API_DB", str(default_store_path(repo_root))))
    service = EcosystemService(repo_root)
    store = LocalStore(database_path)

    app = FastAPI(
        title="SEIS AI Ecosystem API",
        version="0.1.0",
        description="Local contract-backed API for SEIS AI agents, plugins, SSH boundaries, websites, goals, memory, and model connectors.",
    )
    app.include_router(create_router(service, store))
    return app


app = create_app()
