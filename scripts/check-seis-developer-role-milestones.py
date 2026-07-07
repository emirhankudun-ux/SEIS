from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
MILESTONES_FILE = ROOT / "data" / "development" / "seis-developer-role-milestones.json"
ROADMAP_FILE = ROOT / "data" / "development" / "seis-developer-role-roadmap.json"
PLAN_FILE = ROOT / "docs" / "development" / "seis-developer-role-90-day-plan.md"

REQUIRED_ROLES = {
    "frontend-developer",
    "backend-developer",
    "full-stack-developer",
    "devops-engineer",
    "database-administrator",
    "ai-developer",
    "data-engineer",
}

REQUIRED_MILESTONE_IDS = {
    "m1-repo-foundation",
    "m2-product-surface-literacy",
    "m3-contracts-and-data",
    "m4-automation-and-devops",
    "m5-full-stack-slice",
    "m6-enterprise-readiness-review",
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


milestone_doc = read_json(MILESTONES_FILE)
roadmap_doc = read_json(ROADMAP_FILE)
plan_text = read_text(PLAN_FILE)

roadmap_role_ids = {role.get("id") for role in roadmap_doc.get("roles", [])}
ensure(REQUIRED_ROLES.issubset(roadmap_role_ids), "Roadmap data must contain all required roles.")

milestones = milestone_doc.get("milestones", [])
milestone_ids = {milestone.get("id") for milestone in milestones}
ensure(REQUIRED_MILESTONE_IDS == milestone_ids, "Milestone IDs must match the required 90-day plan milestones.")

covered_roles: set[str] = set()
for milestone in milestones:
    milestone_id = milestone.get("id", "<unknown>")
    ensure(milestone.get("weeks"), f"Milestone {milestone_id} must include weeks.")
    ensure(milestone.get("title"), f"Milestone {milestone_id} must include title.")
    ensure(milestone.get("outputs"), f"Milestone {milestone_id} must include outputs.")
    ensure(milestone.get("validation"), f"Milestone {milestone_id} must include validation.")
    roles = set(milestone.get("roles", []))
    ensure(roles, f"Milestone {milestone_id} must include roles.")
    ensure(roles.issubset(REQUIRED_ROLES), f"Milestone {milestone_id} contains unknown roles: {sorted(roles - REQUIRED_ROLES)}")
    covered_roles.update(roles)

ensure(REQUIRED_ROLES.issubset(covered_roles), "Every required role must appear in at least one milestone.")

for marker in ["Month 1", "Month 2", "Month 3", "thin vertical slice", "enterprise readiness"]:
    ensure(marker in plan_text, f"90-day plan missing marker: {marker}")

ensure("python3 scripts/check-seis-developer-role-milestones.py" in plan_text, "90-day plan must document milestone validation command.")

if failures:
    print("SEIS developer role milestones check failed:")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("SEIS developer role milestones check passed.")
