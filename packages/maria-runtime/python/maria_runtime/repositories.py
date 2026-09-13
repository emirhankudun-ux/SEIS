from __future__ import annotations

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Optional


class SourcePolicy(str, Enum):
    OWNED = "owned"
    EXTERNAL_REFERENCE = "external-reference"
    VENDORED = "vendored"
    SUBMODULE = "submodule"
    ADAPTER = "adapter"


@dataclass(frozen=True)
class RepositoryRecord:
    full_name: str
    owner: str
    name: str
    visibility: str
    project: str
    role: str
    source_policy: SourcePolicy
    default_branch: str = "main"
    health: str = "unknown"
    license_id: Optional[str] = None
    license_reviewed: bool = False
    archived: bool = False
    url: Optional[str] = None

    def __post_init__(self):
        if "/" not in self.full_name:
            raise ValueError("full_name must be owner/name")
        owner, name = self.full_name.split("/", 1)
        if owner != self.owner or name != self.name:
            raise ValueError("full_name must match owner and name")
        if self.visibility not in {"public", "private", "internal", "unknown"}:
            raise ValueError("unsupported repository visibility")
        if self.source_policy is SourcePolicy.VENDORED and (
            not self.license_reviewed or not self.license_id
        ):
            raise ValueError("vendored repositories require an explicit reviewed license decision")


class RepositoryFederation:
    def __init__(self):
        self._records: dict[str, RepositoryRecord] = {}

    def register(self, record: RepositoryRecord) -> RepositoryRecord:
        existing = self._records.get(record.full_name)
        if existing and existing != record:
            raise ValueError(f"repository already registered with different metadata: {record.full_name}")
        self._records[record.full_name] = record
        return record

    def get(self, full_name: str) -> RepositoryRecord:
        try:
            return self._records[full_name]
        except KeyError as exc:
            raise KeyError(f"unknown repository: {full_name}") from exc

    def list_all(self) -> list[RepositoryRecord]:
        return sorted(self._records.values(), key=lambda item: (item.owner.lower(), item.name.lower()))

    def owned(self) -> list[RepositoryRecord]:
        return [record for record in self.list_all() if record.source_policy is SourcePolicy.OWNED]

    def external_references(self) -> list[RepositoryRecord]:
        return [
            record
            for record in self.list_all()
            if record.source_policy is SourcePolicy.EXTERNAL_REFERENCE
        ]

    def for_project(self, project: str) -> list[RepositoryRecord]:
        return [record for record in self.list_all() if record.project == project]

    def compact_brief(self, full_name: str) -> dict:
        record = self.get(full_name)
        return {
            "repository": record.full_name,
            "project": record.project,
            "role": record.role,
            "visibility": record.visibility,
            "default_branch": record.default_branch,
            "health": record.health,
            "source_policy": record.source_policy.value,
            "license": {
                "id": record.license_id,
                "reviewed": record.license_reviewed,
            },
            "archived": record.archived,
            "url": record.url,
        }

    def manifest(self) -> list[dict]:
        rows = []
        for record in self.list_all():
            item = asdict(record)
            item["source_policy"] = record.source_policy.value
            rows.append(item)
        return rows


def default_repository_federation() -> RepositoryFederation:
    federation = RepositoryFederation()

    owned = [
        ("emirhankudun-ux/SEIS", "SEIS", "core-platform"),
        ("emirhankudun-ux/Eleni-Neferi-", "Eleni-Neferi", "creative-system"),
        ("emirhankudun-ux/Pantechnoepistemonoesis", "Pantechnoepistemonoesis", "research-system"),
        ("emirhankudun-ux/PANTECHNOSYNI", "PANTECHNOSYNI", "synthesis-system"),
    ]
    for full_name, project, role in owned:
        owner, name = full_name.split("/", 1)
        federation.register(RepositoryRecord(
            full_name=full_name,
            owner=owner,
            name=name,
            visibility="public",
            project=project,
            role=role,
            source_policy=SourcePolicy.OWNED,
            url=f"https://github.com/{full_name}",
        ))

    references = [
        ("alpunlu12-commits/jarvis", "assistant-reference"),
        ("alpunlu12-commits/dinamik-ada", "ambient-ui-reference"),
    ]
    for full_name, role in references:
        owner, name = full_name.split("/", 1)
        federation.register(RepositoryRecord(
            full_name=full_name,
            owner=owner,
            name=name,
            visibility="public",
            project="External Inspiration",
            role=role,
            source_policy=SourcePolicy.EXTERNAL_REFERENCE,
            url=f"https://github.com/{full_name}",
        ))

    return federation
