#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "SEIS secret scan unavailable: install the reviewed Gitleaks version outside this script." >&2
  echo "Setup reference: https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1" >&2
  exit 127
fi

echo "SEIS secret scan: redacted repository and history scan starting."

set +e
gitleaks detect \
  --source . \
  --config .gitleaks.toml \
  --redact \
  --exit-code 2
status=$?
set -e

case "$status" in
  0)
    echo "SEIS secret scan passed: no reportable finding was returned."
    ;;
  2)
    echo "SEIS secret scan blocked: potential secret material was reported with redaction enabled." >&2
    echo "Do not copy values into logs or issues. Follow docs/security/CREDENTIAL_INCIDENT_RESPONSE.md." >&2
    echo "Credential revocation, rotation, and any history change require explicit owner approval." >&2
    ;;
  *)
    echo "SEIS secret scan failed: Gitleaks exited with scanner status ${status}." >&2
    ;;
esac

exit "$status"
