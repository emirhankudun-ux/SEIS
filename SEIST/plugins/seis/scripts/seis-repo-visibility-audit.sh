#!/usr/bin/env bash
set -euo pipefail

OWNER="${OWNER:-emirhankudun-ux}"
WORKDIR="${WORKDIR:-/tmp/seis-repo-visibility-audit}"
OUTPUT_JSON="${OUTPUT_JSON:-${WORKDIR}/repository-visibility.json}"

REPOS=(
  "SEIS"
  "UIX-Apps"
  "emirhan-kudun-portfolio"
  "github-unified-source"
  "seis-trusted-marketplace-plugin"
  "gemini-cli"
  "DeepSeek-Coder"
  "claude-code"
  "docs"
  "awesome-deepseek-agent"
)

mkdir -p "$WORKDIR"

python3 - "$OWNER" "$OUTPUT_JSON" "${REPOS[@]}" <<'PY'
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

owner = sys.argv[1]
output_json = sys.argv[2]
repos = sys.argv[3:]
token = os.environ.get("GITHUB_TOKEN")

headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "seis-repo-visibility-audit",
}
if token:
    headers["Authorization"] = f"Bearer {token}"

results = []
for repo in repos:
    url = f"https://api.github.com/repos/{owner}/{repo}"
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
            results.append(
                {
                    "repository": f"{owner}/{repo}",
                    "status": "visible",
                    "http_status": response.status,
                    "visibility": payload.get("visibility"),
                    "default_branch": payload.get("default_branch"),
                    "archived": payload.get("archived"),
                    "size": payload.get("size"),
                }
            )
    except urllib.error.HTTPError as error:
        results.append(
            {
                "repository": f"{owner}/{repo}",
                "status": "not_found_or_not_authorized",
                "http_status": error.code,
                "visibility": None,
                "default_branch": None,
                "archived": None,
                "size": None,
            }
        )
    except Exception as error:  # noqa: BLE001 - report audit failures without hiding them
        results.append(
            {
                "repository": f"{owner}/{repo}",
                "status": "error",
                "error": str(error),
            }
        )

summary = {
    "owner": owner,
    "uses_github_token": bool(token),
    "visible_count": sum(item["status"] == "visible" for item in results),
    "not_found_or_not_authorized_count": sum(
        item["status"] == "not_found_or_not_authorized" for item in results
    ),
    "repositories": results,
}

with open(output_json, "w", encoding="utf-8") as fh:
    json.dump(summary, fh, indent=2)
    fh.write("\n")

print("SEIS Repository Visibility Audit")
print(f"owner: {owner}")
print(f"uses_github_token: {summary['uses_github_token']}")
print(f"visible_count: {summary['visible_count']}")
print(f"not_found_or_not_authorized_count: {summary['not_found_or_not_authorized_count']}")
print(f"output_json: {output_json}")
print()
for item in results:
    detail = item.get("default_branch") or "-"
    print(f"{item['status']}: {item['repository']} default={detail}")
PY
