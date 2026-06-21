"""FastAPI routes for the SEIS AI ecosystem API."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from .services import EcosystemService
from .storage import LocalStore


def create_router(service: EcosystemService, store: LocalStore) -> APIRouter:
    router = APIRouter(prefix="/api/v1", tags=["seis-ai-ecosystem"])

    @router.get("/health")
    def health() -> dict[str, Any]:
        return service.health()

    @router.get("/ecosystem")
    def ecosystem() -> dict[str, Any]:
        return service.overview()

    @router.get("/agents")
    def agents() -> dict[str, Any]:
        return service.agents()

    @router.get("/plugins")
    def plugins() -> dict[str, Any]:
        return service.plugins()

    @router.get("/websites")
    def websites() -> dict[str, Any]:
        return service.websites()

    @router.get("/goals")
    def goals() -> dict[str, Any]:
        return {"contract": service.goals(), "localGoals": store.list_goals()}

    @router.post("/goals/local")
    def upsert_goal(payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return {"goal": store.upsert_goal(payload)}
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.get("/memory")
    def memory() -> dict[str, Any]:
        return {"contract": service.memory(), "localEvents": store.list_memory_events()}

    @router.post("/memory/events")
    def record_memory_event(payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return {"event": store.record_memory_event(payload)}
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.get("/ssh")
    def ssh() -> dict[str, Any]:
        return service.ssh()

    @router.get("/model-connectors")
    def model_connectors() -> dict[str, Any]:
        return service.model_connectors()

    @router.get("/self-evolution")
    def self_evolution() -> dict[str, Any]:
        return service.self_evolution()

    @router.get("/knowledge-graphs")
    def knowledge_graphs() -> dict[str, Any]:
        return service.knowledge_graphs()

    @router.get("/ready")
    def ready() -> dict[str, Any]:
        return service.readiness()

    return router


def default_store_path(repo_root: Path) -> Path:
    return repo_root / ".local" / "seis-ai-ecosystem-api.sqlite3"
