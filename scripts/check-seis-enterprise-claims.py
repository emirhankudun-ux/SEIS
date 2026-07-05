from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
CLAIMS_FILE = ROOT / "data" / "enterprise" / "seis-enterprise-claim-evidence-map.json"
DOCS = [
    ROOT / "docs" / "enterprise" / "seis-enterprise-reviewer-demo-script.md",
    ROOT / "docs" / "enterprise" / "seis-enterprise-security-privacy-checklist.md",
    ROOT / "docs" / "enterprise" / "seis-enterprise-operating-model.md",
]
BLOCKED_PHRASES = [
    "SEIS beats",
    "production-ready for customer teams",
    "enterprise certified",
    "live provider routing enabled",
    "autonomous write access approved",
]
REQUIRED_TERMS = [
    "evidence",
    "review",
    "security",
    "approval",
    "validation",
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


if CLAIMS_FILE.exists():
    try:
        claims_doc = json.loads(CLAIMS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        claims_doc = {}
        failures.append(f"Invalid JSON in {CLAIMS_FILE.relative_to(ROOT)}: {error}")
else:
    claims_doc = {}
    failures.append(f"Missing file: {CLAIMS_FILE.relative_to(ROOT)}")

claims = claims_doc.get("claims", [])
ensure(len(claims) >= 5, "Claim evidence map must define at least five claims.")

for claim in claims:
    claim_id = claim.get("id", "<unknown>")
    ensure(claim.get("claim"), f"Claim {claim_id} must include claim text.")
    ensure(claim.get("status") in {"allowed", "allowed-with-qualification", "blocked"}, f"Claim {claim_id} has invalid status.")
    ensure(claim.get("evidence"), f"Claim {claim_id} must include evidence paths.")
    ensure("gaps" in claim, f"Claim {claim_id} must list current gaps, even if empty.")

combined = "\n".join(read_text(path) for path in DOCS)
for term in REQUIRED_TERMS:
    ensure(term.lower() in combined.lower(), f"Enterprise docs must include term: {term}")

for blocked in BLOCKED_PHRASES:
    if blocked in combined:
        ensure("Blocked language" in combined or "Blocked" in combined, f"Blocked phrase appears without blocked-language context: {blocked}")

allowed_language = "SEIS is building toward enterprise-grade readiness through evidence-gated open-source review."
ensure(allowed_language in combined, "Security checklist must include allowed enterprise language.")

if failures:
    print("SEIS enterprise claim safety check failed:")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("SEIS enterprise claim safety check passed.")
