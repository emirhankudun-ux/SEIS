from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
GATES_FILE = ROOT / "data" / "enterprise" / "seis-enterprise-readiness-gates.json"
REQUIRED_DOCS = [
    ROOT / "docs" / "enterprise" / "seis-enterprise-competitive-readiness.md",
    ROOT / "docs" / "enterprise" / "seis-enterprise-moat-scorecard.md",
    ROOT / "docs" / "enterprise" / "seis-enterprise-execution-roadmap.md",
]
REQUIRED_PHRASES = [
    "Evidence before hype",
    "Apple-first",
    "validation",
    "security",
    "review",
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


if GATES_FILE.exists():
    try:
        gates = json.loads(GATES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        gates = {}
        failures.append(f"Invalid JSON in {GATES_FILE.relative_to(ROOT)}: {error}")
else:
    gates = {}
    failures.append(f"Missing file: {GATES_FILE.relative_to(ROOT)}")

ensure(gates.get("status") == "draft-review", "Enterprise readiness gates must stay draft-review until evidence is complete.")
ensure(len(gates.get("gates", [])) >= 7, "Enterprise readiness gates must define at least seven gates.")

for gate in gates.get("gates", []):
    ensure("id" in gate, "Every gate must have an id.")
    ensure("title" in gate, f"Gate {gate.get('id', '<unknown>')} must have a title.")
    ensure("target" in gate, f"Gate {gate.get('id', '<unknown>')} must have a target.")
    ensure(gate.get("evidence"), f"Gate {gate.get('id', '<unknown>')} must list evidence paths.")

combined_docs = "\n".join(read_text(path) for path in REQUIRED_DOCS)
for phrase in REQUIRED_PHRASES:
    ensure(phrase.lower() in combined_docs.lower(), f"Enterprise docs must include phrase: {phrase}")

for path in REQUIRED_DOCS:
    text = read_text(path)
    ensure("##" in text, f"{path.relative_to(ROOT)} must contain structured headings.")
    ensure("SEIS" in text, f"{path.relative_to(ROOT)} must identify SEIS.")

if failures:
    print("SEIS enterprise readiness check failed:")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("SEIS enterprise readiness check passed.")
