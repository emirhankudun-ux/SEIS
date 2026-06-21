"""SQLite-backed local goal and memory storage for the SEIS AI ecosystem API."""

from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path
from typing import Any


SCHEMA = """
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT NOT NULL DEFAULT 'P2',
  progress INTEGER NOT NULL DEFAULT 0,
  agent_id TEXT,
  plugin_id TEXT,
  notes TEXT,
  result_report TEXT,
  updated_at REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS memory_events (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'local-api',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL
);
"""


class LocalStore:
    """Small SQLite store; writes only local operator-provided goal and memory records."""

    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self.initialize()

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        with self.connect() as connection:
            connection.executescript(SCHEMA)

    def upsert_goal(self, payload: dict[str, Any]) -> dict[str, Any]:
        goal_id = str(payload.get("id") or "").strip()
        title = str(payload.get("title") or payload.get("goal") or "").strip()
        if not goal_id or not title:
            raise ValueError("goal id and title are required")

        progress = int(payload.get("progress", 0))
        progress = max(0, min(100, progress))
        row = {
            "id": goal_id,
            "title": title,
            "status": str(payload.get("status") or "active"),
            "priority": str(payload.get("priority") or "P2"),
            "progress": progress,
            "agent_id": payload.get("agentId"),
            "plugin_id": payload.get("pluginId"),
            "notes": payload.get("notes"),
            "result_report": payload.get("resultReport"),
            "updated_at": time.time(),
        }
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO goals (id, title, status, priority, progress, agent_id, plugin_id, notes, result_report, updated_at)
                VALUES (:id, :title, :status, :priority, :progress, :agent_id, :plugin_id, :notes, :result_report, :updated_at)
                ON CONFLICT(id) DO UPDATE SET
                  title=excluded.title,
                  status=excluded.status,
                  priority=excluded.priority,
                  progress=excluded.progress,
                  agent_id=excluded.agent_id,
                  plugin_id=excluded.plugin_id,
                  notes=excluded.notes,
                  result_report=excluded.result_report,
                  updated_at=excluded.updated_at
                """,
                row,
            )
        return row

    def list_goals(self) -> list[dict[str, Any]]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM goals ORDER BY priority ASC, updated_at DESC").fetchall()
        return [dict(row) for row in rows]

    def record_memory_event(self, payload: dict[str, Any]) -> dict[str, Any]:
        event_id = str(payload.get("id") or "").strip()
        category = str(payload.get("category") or "").strip()
        summary = str(payload.get("summary") or "").strip()
        if not event_id or not category or not summary:
            raise ValueError("memory event id, category, and summary are required")

        row = {
            "id": event_id,
            "category": category,
            "summary": summary,
            "source": str(payload.get("source") or "local-api"),
            "metadata_json": json.dumps(payload.get("metadata") or {}, ensure_ascii=False, sort_keys=True),
            "created_at": time.time(),
        }
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO memory_events (id, category, summary, source, metadata_json, created_at)
                VALUES (:id, :category, :summary, :source, :metadata_json, :created_at)
                """,
                row,
            )
        return row

    def list_memory_events(self) -> list[dict[str, Any]]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM memory_events ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]
