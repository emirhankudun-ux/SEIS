from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
DATA_FILE = ROOT / "data" / "development" / "seis-developer-role-roadmap.json"
DOC_FILE = ROOT / "docs" / "development" / "seis-developer-role-roadmap.md"

REQUIRED_ROLES = [
    "frontend-developer",
    "backend-developer",
    "full-stack-developer",
    "devops-engineer",
    "database-administrator",
    "ai-developer",
    "data-engineer",
]

REQUIRED_DOC_MARKERS = [
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "DevOps Engineer",
    "DBA / Database Administrator",
    "AI Developer",
    "Data Engineer",
    "local, mock, planned, disabled, and live",
    "python3 scripts/check-seis-developer-role-roadmap.py",
]

failures: list[str] = []


def ensure(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


def read_text(path: Path) -> str:
    if not path.exists():
        failures.append(f"Missing file: {path.relative_to(ROOT)}")
        return ""
    return path.read_text(encoding="utf-8")


try:
    roadmap = json.loads(read_text(DATA_FILE)) if DATA_FILE.exists() else {}
except json.JSONDecodeError as error:
    roadmap = {}
    failures.append(f"Invalid JSON in {DATA_FILE.relative_to(ROOT)}: {error}")

roles = roadmap.get("roles", [])
role_ids = {role.get("id") for role in roles}

for required_role in REQUIRED_ROLES:
    ensure(required_role in role_ids, f"Missing roadmap role: {required_role}")

ensure(len(roles) == len(REQUIRED_ROLES), f"Expected {len(REQUIRED_ROLES)} roles, found {len(roles)}")

for role in roles:
    role_id = role.get("id", "<unknown>")
    ensure(role.get("title"), f"Role {role_id} must include title")
    ensure(role.get("image_prompt_stack"), f"Role {role_id} must include image prompt stack")
    ensure(role.get("seis_expansion"), f"Role {role_id} must include SEIS expansion")
    ensure(role.get("primary_outputs"), f"Role {role_id} must include primary outputs")
    ensure(role.get("validation"), f"Role {role_id} must include validation items")
    ensure(role.get("next_project"), f"Role {role_id} must include next project")

sequence = roadmap.get("learning_sequence", [])
ensure(len(sequence) >= 8, "Learning sequence must include at least eight steps")
ensure("Git" in sequence[0], "Learning sequence should start with Git/repository basics")

principles = "\n".join(roadmap.get("principles", []))
ensure("single web stack" in principles, "Principles must warn against reducing SEIS to one web stack")
ensure("Apple-first" in principles, "Principles must preserve Apple-first direction")

text = read_text(DOC_FILE)
for marker in REQUIRED_DOC_MARKERS:
    ensure(marker in text, f"Roadmap doc missing marker: {marker}")

if failures:
    print("SEIS developer role roadmap check failed:")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("SEIS developer role roadmap check passed.")
