from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
MATRIX_FILE = ROOT / "data" / "development" / "seis-developer-role-skill-matrix.json"
ROADMAP_FILE = ROOT / "data" / "development" / "seis-developer-role-roadmap.json"
ISSUE_PACK_FILE = ROOT / "data" / "development" / "seis-developer-role-issue-pack.json"
DOC_FILE = ROOT / "docs" / "development" / "seis-developer-role-skill-matrix.md"

REQUIRED_ROLES = {
    "frontend-developer",
    "backend-developer",
    "full-stack-developer",
    "devops-engineer",
    "database-administrator",
    "ai-developer",
    "data-engineer",
}

REQUIRED_LEVELS = {
    "level-1-foundation",
    "level-2-contributor",
    "level-3-integrator",
    "level-4-review-ready",
}

failures: list[str] = []


def ensure(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


def read_json(path: Path) -> dict:
    if not path.exists():
        failures.append(f"Missing file: {path.relative_to(ROOT)}")
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        failures.append(f"Invalid JSON in {path.relative_to(ROOT)}: {error}")
        return {}


def read_text(path: Path) -> str:
    if not path.exists():
        failures.append(f"Missing file: {path.relative_to(ROOT)}")
        return ""
    return path.read_text(encoding="utf-8")


matrix = read_json(MATRIX_FILE)
roadmap = read_json(ROADMAP_FILE)
issue_pack = read_json(ISSUE_PACK_FILE)
doc_text = read_text(DOC_FILE)

roadmap_roles = {role.get("id") for role in roadmap.get("roles", [])}
issue_roles = {package.get("role") for package in issue_pack.get("issue_packages", [])}
ensure(REQUIRED_ROLES.issubset(roadmap_roles), "Roadmap must contain all required roles.")
ensure(REQUIRED_ROLES.issubset(issue_roles), "Issue pack must contain all required roles.")

level_ids = {level.get("id") for level in matrix.get("levels", [])}
ensure(level_ids == REQUIRED_LEVELS, "Skill matrix must define the four required levels.")

role_entries = matrix.get("role_matrix", [])
role_ids = {entry.get("role") for entry in role_entries}
ensure(role_ids == REQUIRED_ROLES, "Skill matrix must include exactly the seven required roles.")

for entry in role_entries:
    role = entry.get("role", "<unknown>")
    ensure(entry.get("core_skills"), f"Role {role} must include core skills.")
    ensure(len(entry.get("core_skills", [])) >= 4, f"Role {role} must include at least four core skills.")
    ensure(entry.get("adjacent_lanes"), f"Role {role} must include adjacent lanes.")
    outputs = entry.get("level_outputs", {})
    ensure(set(outputs) == REQUIRED_LEVELS, f"Role {role} must include output for every level.")
    for adjacent in entry.get("adjacent_lanes", []):
        ensure(adjacent in REQUIRED_ROLES, f"Role {role} has unknown adjacent lane: {adjacent}")

for marker in ["Level 1", "Level 2", "Level 3", "Level 4", "Adjacent-lane rule", "python3 scripts/check-seis-developer-role-skill-matrix.py"]:
    ensure(marker in doc_text, f"Skill matrix doc missing marker: {marker}")

if failures:
    print("SEIS developer role skill matrix check failed:")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("SEIS developer role skill matrix check passed.")
