#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
ZIP_PATH="${ZIP_PATH:-${REPO_ROOT}.zip}"
WORKDIR="${WORKDIR:-/tmp/seis-zip-audit}"
OUTPUT_JSON="${OUTPUT_JSON:-${WORKDIR}/github-zip-inventory.json}"
COMPUTE_HASH="${COMPUTE_HASH:-0}"

mkdir -p "$WORKDIR"

python3 - "$ZIP_PATH" "$OUTPUT_JSON" "$COMPUTE_HASH" <<'PY'
from __future__ import annotations

import collections
import hashlib
import json
import os
import sys
import zipfile

zip_path, output_json, compute_hash = sys.argv[1], sys.argv[2], sys.argv[3] == "1"

heavy_threshold = 20_000_000
generated_markers = (
    "/__MACOSX/",
    "__MACOSX/",
    "/.git/",
    ".git/",
    "/node_modules/",
    "/.venv/",
    "/.venvs/",
    "/site-packages/",
    "/oracleJdk",
    "/dist/",
    "/build/",
    "/.cache/",
)

sha256 = None
if compute_hash:
    digest = hashlib.sha256()
    with open(zip_path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b=""):
            digest.update(chunk)
    sha256 = digest.hexdigest()

with zipfile.ZipFile(zip_path) as archive:
    infos = archive.infolist()
    top_level = collections.Counter()
    extensions = collections.Counter()
    inner_archives = []
    heavy_files = []
    generated_or_cache_entries = 0
    git_entries = 0
    macosx_entries = 0

    for info in infos:
        name = info.filename
        clean = name.strip("/")
        parts = clean.split("/") if clean else []
        if parts and parts[0]:
            top_level[parts[0]] += 1

        lower = name.lower()
        _, ext = os.path.splitext(lower)
        if ext:
            extensions[ext] += 1

        if "/.git/" in name or name.startswith(".git/") or ".git/" in name:
            git_entries += 1
        if name.startswith("__MACOSX/") or "/__MACOSX/" in name:
            macosx_entries += 1
        if any(marker in name for marker in generated_markers):
            generated_or_cache_entries += 1
        if lower.endswith((".zip", ".tar", ".tar.gz", ".tgz", ".gz", ".rar", ".7z")):
            inner_archives.append({"path": name, "bytes": info.file_size})
        if info.file_size >= heavy_threshold:
            heavy_files.append({"path": name, "bytes": info.file_size})

    manifest = {
        "zip_path": zip_path,
        "zip_size_bytes": os.path.getsize(zip_path),
        "sha256": sha256,
        "entry_count": len(infos),
        "total_uncompressed_bytes": sum(info.file_size for info in infos),
        "total_compressed_bytes": sum(info.compress_size for info in infos),
        "git_entries": git_entries,
        "macosx_entries": macosx_entries,
        "generated_or_cache_entries": generated_or_cache_entries,
        "top_level": top_level.most_common(80),
        "extensions": extensions.most_common(40),
        "inner_archives": inner_archives[:80],
        "heavy_files": sorted(heavy_files, key=lambda item: item["bytes"], reverse=True)[:80],
        "recommendation": (
            "Do not commit this zip directly to SEIS. Store the checksum and inventory in SEIS, "
            "then import curated source folders or use Git LFS/object storage for the binary archive."
        ),
    }

with open(output_json, "w", encoding="utf-8") as fh:
    json.dump(manifest, fh, indent=2, ensure_ascii=False)
    fh.write("\n")

print("SEIS Zip Audit")
print(f"zip_path: {manifest['zip_path']}")
print(f"zip_size_bytes: {manifest['zip_size_bytes']}")
if sha256:
    print(f"sha256: {sha256}")
print(f"entry_count: {manifest['entry_count']}")
print(f"total_uncompressed_bytes: {manifest['total_uncompressed_bytes']}")
print(f"git_entries: {manifest['git_entries']}")
print(f"macosx_entries: {manifest['macosx_entries']}")
print(f"generated_or_cache_entries: {manifest['generated_or_cache_entries']}")
print(f"inner_archives: {len(inner_archives)}")
print(f"heavy_files: {len(heavy_files)}")
print(f"output_json: {output_json}")
print()
print(manifest["recommendation"])
PY
