from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist")
    package_path = root / "seis-static.zip"
    manifest_path = root / "server-upload-manifest.json"

    if not package_path.exists() or not manifest_path.exists():
        print("missing release package or manifest", file=sys.stderr)
        return 1

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    digest = hashlib.sha256(package_path.read_bytes()).hexdigest()

    if digest != manifest.get("sha256"):
        print("sha256 mismatch", file=sys.stderr)
        print(f"expected: {manifest.get('sha256')}", file=sys.stderr)
        print(f"actual:   {digest}", file=sys.stderr)
        return 1

    print(json.dumps({
        "ok": True,
        "package": str(package_path),
        "sha256": digest,
        "bytes": package_path.stat().st_size,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

