# SEIS Security Baseline

Date: 2026-06-19

This baseline records the safe security review completed during the foundation
pass. It does not replace a full dependency, license, SBOM, SAST, DAST, GitHub
code-scanning, or secret-history audit.

## Scope Reviewed

| Surface | Reviewed | Evidence |
| --- | --- | --- |
| Security policy | Yes | `SECURITY.md` exists and defines private reporting and security rules. |
| Contribution policy | Yes | `CONTRIBUTING.md` blocks secrets and unnecessary dependencies. |
| AI operating policy | Yes | `AGENTS.md` blocks secrets, uncontrolled assistants, and unreviewed imports. |
| Sensitive file paths | Partial | Path-only local scan found no tracked credential-style file paths. |
| Local generated artifacts | Partial | `.DS_Store`, tracked release zips, and untracked nested repo artifacts are present. |
| Dependency vulnerabilities | No | Not scanned in this pass. |
| Git history secrets | No | Not scanned in this pass. |
| GitHub code scanning | No | External GitHub access was not used. |
| Production systems | No | No deployment, SSH, or external service connection was made. |

## Current Security Findings

| ID | Severity | Finding | Action |
| --- | --- | --- | --- |
| `SEC-001` | High if staged | Untracked `apps/SEIS/` contains nested repository material and generated artifacts. | Do not stage wholesale; classify in a dedicated recovery PR. |
| `SEC-002` | Medium | `.DS_Store` files are visible in the workspace. | Ignore by default; remove only in an approved cleanup PR. |
| `SEC-003` | Medium | Release zip artifacts are tracked under `releases/`, and similar zips exist in the untracked snapshot. | Define artifact retention and release storage policy before cleanup. |
| `SEC-004` | Medium | Some validation/security-related scripts are deleted in the current worktree. | Restore or replace validators before readiness claims. |
| `SEC-005` | Medium | Live GitHub Actions, branch protection, Dependabot, CodeQL, and code-scanning state were not verified. | Inspect only after approval for GitHub API/CLI access. |

## Sensitive Material Handling Rules

- Do not print secret values.
- Do not commit `.env`, credentials, private keys, tokens, cookies, or service
  accounts.
- Keep `.env.example` placeholder-only.
- Do not send repository data to external services without approval.
- Do not run SSH, deployment, secret rotation, or repository setting changes
  without explicit approval and rollback notes.

## Required Future Checks

Run only when safe and approved:

| Check | Purpose | Approval Needed |
| --- | --- | --- |
| Git history secret scan | Detect previously committed secrets. | Yes if tooling sends data externally; local-only scan can be approved in PR scope. |
| Dependency audit | Detect package vulnerabilities. | No dependency install unless approved. |
| License review | Confirm public-ready dependency and asset licensing. | No external calls unless approved. |
| SBOM generation | Document dependencies and release contents. | Tooling approval may be needed. |
| GitHub code-scanning review | Inspect Actions, CodeQL, and alerts. | External GitHub API/CLI approval required. |
| Artifact retention review | Decide whether release zips belong in Git. | File deletion approval required. |

## Validation Evidence From This Pass

| Command | Result | Security Meaning |
| --- | --- | --- |
| Path-only tracked sensitive-file scan | Passed | No tracked credential-style file paths were found. |
| `git diff --check` | Passed | No whitespace defects in the current diff. |
| `npm run seis:check` | Passed | Static web security checks found no unsafe blank links, `javascript:` hrefs, or insecure `http://` resources; CSP and integrity notes remain informational. |
| Foundation and governance checks | Failed | Missing/deleted governance and validation files prevent public-readiness confidence. |

## Current Decision

Security posture is not blocked by an observed tracked credential path, but it
is not public-ready until the dirty worktree, nested repository snapshot,
deleted validators, artifact policy, and GitHub security status are resolved.
