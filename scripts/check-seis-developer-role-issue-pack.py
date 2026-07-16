from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
ISSUE_PACK_FILE = ROOT / "data" / "development" / "seis-developer-role-issue-pack.json"
ROADMAP_FILE = ROOT / "data" / "development" / "seis-developer-role-roadmap.json"
DOC_FILE = ROOT / "docs" / "development" / "seis-developer-role-issue-pack.md"

REQUIRED_PACKAGE_IDS = {
    "frontend-surface-task",
    "backend-contract-task",
    "full-stack-slice-task",
    "devops-readiness-task",
    "database-safety-task",
    "ai-route-decision-task",
    "data-pipeline-contract-task",
}

REQUIRED_ROLES = {
    "frontend-developer",
    "backend-developer",
    "full-stack-developer",
    "devops-engineer",
    "database-administrator",
    "ai-developer",
    "data-engineer",
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


issue_pack = read_json(ISSUE_PACK_FILE)
roadmap = read_json(ROADMAP_FILE)
doc_text = read_text(DOC_FILE)

roadmap_roles = {role.get("id") for role in roadmap.get("roles", [])}
ensure(REQUIRED_ROLES.issubset(roadmap_roles), "Roadmap must contain all required roles before issue pack validation.")

packages = issue_pack.get("issue_packages", [])
package_ids = {package.get("id") for package in packages}
ensure(package_ids == REQUIRED_PACKAGE_IDS, "Issue package IDs must match the required seven starter packages.")

covered_roles: set[str] = set()
for package in packages:
    package_id = package.get("id", "<unknown>")
    role = package.get("role")
    covered_roles.add(role)
    ensure(role in REQUIRED_ROLES, f"Package {package_id} has unknown role: {role}")
    ensure(package.get("title"), f"Package {package_id} must include title")
    ensure(package.get("labels"), f"Package {package_id} must include labels")
    ensure(package.get("goal"), f"Package {package_id} must include goal")
    ensure(package.get("deliverables"), f"Package {package_id} must include deliverables")
    ensure(package.get("acceptance_criteria"), f"Package {package_id} must include acceptance criteria")
    ensure(package.get("validation"), f"Package {package_id} must include validation")
    ensure(package.get("rollback"), f"Package {package_id} must include rollback")

ensure(covered_roles == REQUIRED_ROLES, "Every required role must have exactly one starter issue package.")

for package_id in REQUIRED_PACKAGE_IDS:
    ensure(package_id in doc_text, f"Issue pack doc missing package id: {package_id}")

ensure("python3 scripts/check-seis-developer-role-issue-pack.py" in doc_text, "Issue pack doc must document validator command.")
ensure("role lane" in doc_text.lower(), "Issue pack doc must explain role lane requirement.")
ensure("rollback note" in doc_text.lower(), "Issue pack doc must explain rollback note requirement.")

if failures:
    print("SEIS developer role issue pack check failed:")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("SEIS developer role issue pack check passed.")
