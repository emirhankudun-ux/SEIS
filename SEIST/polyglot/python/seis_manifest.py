from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class SeisManifest:
    locales: list[str]
    curated_drawing_count: int
    package_path: str


def load_manifest(root: Path) -> SeisManifest:
    contract_path = root / "polyglot" / "contracts" / "seis-experience-contract.json"
    payload = json.loads(contract_path.read_text(encoding="utf-8"))
    return SeisManifest(
        locales=list(payload["i18n"]["locales"]),
        curated_drawing_count=int(payload["assets"]["curatedDrawingCount"]),
        package_path=str(payload["deployment"]["package"]),
    )


if __name__ == "__main__":
    manifest = load_manifest(Path(__file__).resolve().parents[2])
    print(json.dumps(manifest.__dict__, ensure_ascii=False, indent=2))

