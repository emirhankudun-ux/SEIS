# SEIS Architecture

Canonical operational boundaries are maintained in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The detail below remains a
compatibility reference and may not supersede root `AGENTS.md` Enterprise v4.0
or the canonical architecture entry point.

SEIS is an AI-native creative engineering operating system and operating layer.
Its architecture is organized around calm coordination: repository governance,
command center experience, AI-agent workflows, documentation, automation, cloud
operations, security, and long-term product intelligence.

The architecture should stay modular, inspectable, and reversible. SEIS should
gain capability through clear layers and contracts, not through disconnected
files or hidden automation.

## Architecture Principles

- Keep the repository understandable before making it larger.
- Treat documentation, checks, scripts, and UI surfaces as one operating system.
- Prefer small contracts that can be validated over broad claims.
- Keep local, GitHub, and cloud workflows compatible.
- Never allow automation or AI-agent behavior to bypass security review.
- Preserve user work and make changes that can be reviewed independently.

## Layers

| Layer | Purpose | Current Surface |
| --- | --- | --- |
| Command Center Layer | Product and operational interface for SEIS modules | `apps/`, `docs/`, roadmap modules |
| Repository Governance Layer | Rules for structure, contribution, quality, releases, and GitHub use | `AGENTS.md`, `README.md`, `ROADMAP.md`, governance docs |
| Agent Orchestration Layer | AI-agent roles, routing, skills, MCP, prompts, and evidence capture | `plugins/`, `mcp/`, `packages/seis-ai`, agent docs |
| Automation Layer | Checks, reports, generated records, and repeatable maintenance workflows | `scripts/`, `reports/`, GitHub Actions |
| Cloud and Environment Layer | Local, Codespaces, SSH/VPN, deployment, and private runtime strategy | `deploy/`, cloud docs, server scripts |
| Knowledge Layer | Decisions, memory boundaries, prompts, architecture notes, and research records | `docs/`, `content/`, `roadmap/`, `goals/` |
| Security Layer | Secret hygiene, access control, clean-room rules, dependency risk, and release safety | `SECURITY.md`, security docs, validation scripts |

## Data Flow

SEIS work should move through a traceable flow:

1. User goal or repository signal enters the operating layer.
2. Agent or maintainer inspects the relevant repository surface.
3. A narrow change package is selected with a clear owner and risk profile.
4. Implementation updates code, docs, checks, or generated evidence.
5. Validation records what was checked and what remains unverified.
6. Changelog, roadmap, or governance docs capture meaningful state changes.
7. GitHub remains the collaboration and review boundary.

This flow keeps SEIS from turning into a loose collection of dashboards,
scripts, and documents. Every change should strengthen the same operating
model.

## God Mode Operating Discipline

God Mode in SEIS means high-leverage, cross-layer development. It does not mean
unbounded edits or bypassed review.

A God Mode slice should normally improve at least two layers and leave evidence
for the rest. Example layer pairs:

- governance plus validation
- command center behavior plus documentation
- agent routing plus security policy
- cloud readiness plus rollback notes
- roadmap planning plus repository health evidence

God Mode changes must remain small enough to review. If the worktree already has
large unrelated changes, create a narrow package and document the repo-state
risk instead of mixing everything into one commit.

## Operating Boundaries

- Local development is for direct control.
- GitHub is for collaboration, review, issues, pull requests, releases, and
  branch governance.
- Cloud and Codespaces are for stable remote work, controlled deployment, and
  always-available operations.
- MCP and plugin systems are integration surfaces, not places to hide
  irreversible behavior.
- Security and clean-room rules apply to every layer.

## Evolution Rule

SEIS should grow by validated capability levels:

- foundation before scale
- contracts before automation
- checks before release claims
- documentation before handoff
- human review before public readiness

Architecture is considered healthy when a future agent can inspect the
repository, understand the active operating model, make a narrow improvement,
validate it, and leave a clear handoff without needing private context.
