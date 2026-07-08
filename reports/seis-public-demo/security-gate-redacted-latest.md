# SEIS Public Demo Security Gate Redacted Evidence

Generated: 2026-06-30T22:38:51.137Z
Status: blocked-full-history-security-review
Mode: redacted-local-and-ci-evidence
Decision: NO-GO-security-history-remediation-needed
PR: https://github.com/emirhankudun-ux/SEIS/pull/104

This artifact stores only redacted categories, paths, counts, and approval
requirements. Raw secret values stored: false.

## Current Tree

Current-tree scan: clean-redacted-no-git
Findings: 0
Security policy changed: false
Gitleaks allowlist committed: false

## Full History

Full-history scan: blocked-redacted-findings
Total redacted findings: 195

| Rule | Count |
| --- | ---: |
| generic-api-key | 6 |
| curl-auth-header | 3 |
| sourcegraph-access-token | 185 |
| private-key | 1 |

| Path | Count | Category |
| --- | ---: | --- |
| sources/github-unified-source/_generated/github-code-bundle.txt | 194 | historical-generated-bundle |
| apps/web/test/scripts.test.js | 1 | historical-static-test-fixture |

## Approval Required

- history rewrite or affected path removal from repository history
- affected-secret rotation decision by repository owner
- .gitleaks.toml security-policy change
- reviewed security baseline for historical generated bundle findings
- merge or release after Security Summary passes

## Forbidden Without Approval

- printing raw finding values
- downloading or committing full CI job logs
- blanket-allowlisting the generated bundle
- weakening the Secret & Vulnerability Scan workflow
- force-pushing rewritten history

Do not blanket-allowlist the generated bundle, weaken security scanning, print
raw values, or rewrite history without explicit owner approval.
