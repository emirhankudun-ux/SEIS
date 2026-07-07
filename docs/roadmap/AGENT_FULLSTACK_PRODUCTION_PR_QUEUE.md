# Agent Full-Stack Production PR Queue

Date: 2026-07-07  
Status: intake queue

This queue turns the supplied AI-agent, roadmap, Java, Linux, programming-language, and full-stack production references into scoped SEIS PRs.

## Queue

| Order | Suggested PR | Scope | Validation | Approval needed |
| --- | --- | --- | --- | --- |
| 1 | `docs: add agent full-stack production roadmap intake` | Add reference contract and architecture notes for AI agent systems, skill tracks, production stack layers, and implementation slices. | `jq empty content/development/seis-agent-fullstack-production-roadmap.json`, documentation review, `git diff --check` | None for docs/JSON; approval required for live tools, provider calls, SSH, deployment, DB writes, dependencies, or public release. |
| 2 | `feat: add agent operating map to SEIS Desktop` | Show user query, LLM, RAG, memory, MCP, tools, A2A, multi-agent team, and final response/action as a local-demo system map. | Desktop smoke check, accessibility review, no network/provider calls | Approval required for real tool execution or provider routing. |
| 3 | `feat: add production readiness stack board` | Add a board that separates frontend, backend APIs, database, auth, hosting, cloud, CI/CD, security, rate limiting, cache/CDN, logs, monitoring, testing, scaling, and recovery. | Contract parse, board renders, every layer has state/evidence | Approval required for deployment, cloud, DB, auth, or CI changes that affect protected branches. |
| 4 | `feat: add SEIS skill roadmap center` | Add role-based learning/product tracks for frontend, software engineering, Java backend, AI/data, cyber security, app/game, and Linux system UX. | Skill records validate, UI labels distinguish learning/planned/working | None for local demo; approval required for installing tools or dependencies. |
| 4A | `feat: add SEIS language purpose center` | Add a local route and contract mapping languages to SEIS purposes: web, desktop, OS/system UX, mobile, game/3D, AI/data, backend/API, DevOps, and security. | `node scripts/check-seis-programming-language-purpose-matrix.mjs`, `jq empty content/development/seis-programming-language-purpose-matrix.json`, local route review, `git diff --check` | None for static route/docs/JSON/validator; approval required for new runtimes, SDKs, frameworks, provider calls, database writes, SSH, deployment, Docker, Kubernetes, Unity, Unreal, or mobile SDKs. |
| 5 | `docs: add Java backend lane plan` | Document Java fundamentals through Spring Boot, REST, SQL, JPA, microservices, Kafka, Docker, Kubernetes, cloud, and system design as an optional future backend path. | Docs review, no dependency changes | Approval required before adding Java runtime, Spring dependencies, databases, Kafka, Docker, or Kubernetes. |
| 6 | `docs: add Linux distro reference lab` | Create reference-only notes for Linux distribution UX and localization inspiration, including Pardus and global country-specific distro ideas. | Docs review, no copied logos/assets | Approval required for using third-party assets, package installation, or OS-level changes. |
| 7 | `feat: add agent task evidence ledger` | Add dry-run agent task ledger: research, planning, architecture, execution, review, security, DevOps, design. | JSON parse, no fake completion claims, review states visible | Approval required for autonomous writes, merge, release, or external actions. |

## Immediate next build target

The next practical implementation should be **PR 2: Agent Operating Map** plus **PR 4A: Language Purpose Center** because they directly connect the supplied AI-agent and programming-language diagrams with SEIS Desktop, AI Core, Search, Tools, MCP, multi-agent governance, and product engineering skill routing.

## Non-negotiable production boundary

A SEIS feature can be visually impressive and still not production-ready. Production readiness starts only when the related layer has:

- a written contract
- a validation command or review checklist
- security and rollback notes
- clear local-demo vs live distinction
- no hidden external dependency
