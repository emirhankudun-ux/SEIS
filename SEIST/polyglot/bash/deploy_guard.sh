#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f "dist/seis-static.zip" ]]; then
  echo "missing dist/seis-static.zip" >&2
  exit 1
fi

if [[ ! -f "dist/server-upload-manifest.json" ]]; then
  echo "missing dist/server-upload-manifest.json" >&2
  exit 1
fi

echo "SEIS deploy guard passed. Package is ready for a confirmed server target."

