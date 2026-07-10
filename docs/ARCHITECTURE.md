# SEIS Architecture

SEIS is an Apple-first, Swift-first, AI-native creative engineering operating
system. The architecture is a modular monolith of explicit contracts first;
distributed services and live integrations are later options, not defaults.

## Boundaries

| Layer             | Responsibility                                                                   | Canonical surfaces                                     |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Public showcase   | No-key demo, onboarding, documentation, and module visibility                    | `apps/seis-demo-web`, `apps/web`, `docs/`              |
| Native foundation | Shared domain models, tokens, platform policy, and future native shells          | `packages/seis_platform_swift`                         |
| AI Core           | Provider/model metadata, routing, prompts, memory/context policy, and evaluation | `packages/seis-ai`, `content/development/`, `docs/ai/` |
| SEIS Brain        | Public-safe project memory, ADRs, context packs, provenance, and roadmap         | `docs/brain`, `docs/decisions`, `content/`             |
| Governance        | Goals, agent roles, MCP/tool permissions, validation, release, and rollback      | `AGENTS.md`, `docs/SEIS_GOAL_TRACKING.md`, `scripts/`  |
| Remote safety     | SSH/cloud metadata, dry-run planning, strict identity, and approval gates        | `docs/deployment`, `server/`, `data/`                  |

## Dependency Direction

1. Public surfaces consume stable, public-safe contracts.
2. Swift packages own reusable native/domain models where Apple value exists.
3. AI Core consumes provider metadata and policy; it does not expose keys or
   grant arbitrary tool authority.
4. Governance and validation observe the system without silently mutating it.
5. Remote and write-capable operations require explicit approval, dry-run
   evidence, target identity, and rollback notes.

## Product Surfaces

- macOS is the primary long-term Command Center.
- iPadOS is the Brain, planning, and design-review surface.
- iOS is the status and quick-note companion.
- Web is the public demo and GitHub showcase.
- visionOS remains research-only until the shared Apple foundation is healthy.

## Quality Boundaries

Architecture changes must preserve no-key demo behavior, public/private
separation, accessibility, performance, and honest status labels. New
dependencies, providers, MCPs, package runners, or remote actions require a
separate reviewable scope with validation and rollback evidence.

Detailed architecture notes remain in `docs/architecture/` and the current
implementation queue in `docs/roadmap/NEXT_PR_QUEUE.md`.
