# Next bounded milestones

## Current checkpoint — alpha.7

Truthful simulation/live separation, fail-closed permission policy, cancellation, bounded execution, isolated observers, conflict-aware facts, strict plugin metadata, provider supervision, host-adapter lifecycle, attributed live-receipt verification, an OpenAI-compatible local-model adapter contract, and a modernized MCP client contract.

## Completed alpha.7 scope

- provider lifecycle contract and health state transitions;
- safe preference persistence;
- permission-enforced Plugin Host v2;
- bounded plugin timeouts and crash isolation;
- execution journal with redaction;
- provider supervisor with bounded probe timeout, capability anti-escalation, health TTL, cancellation and per-provider probe deduplication;
- host adapter API v2 (`connect`, `health`, `execute`, `disconnect`);
- capability-gated execution through `createHostAdapterManager`;
- dependency-injected `LiveRuntimeAdapter`;
- attributed live receipt verification and journal evidence;
- OpenAI-compatible local-model adapter contract with `/v1/models` discovery, `/v1/chat/completions`, timeout/cancellation and canonical `local` provider binding;
- MCP `2026-07-28` discovery with per-request protocol/client metadata;
- safe fallback to legacy MCP initialization when `server/discover` is unsupported;
- required legacy `notifications/initialized` lifecycle signal;
- negotiated protocol validation, malformed tool-list rejection and malformed tool-result rejection;
- discovered-tool-only execution, host-side authentication forwarding and cancellation;
- end-to-end adapter → host manager → live runtime → orchestrator → verifier coverage for local inference;
- fresh regression suite: **96 Node tests**;
- offline Chromium acceptance: **17 checks**.

## Next highest-value milestone

Connect one **real trusted local-model host** and one **real MCP server** through the existing contracts, then verify reproducible end-to-end execution with attributable evidence. The host must expose real identity, bounded health checks, cancellation and explicit outcome evidence. Transport success must not be presented as semantic correctness or proof of an external side effect.

## Core platform gates before broad product expansion

1. Real MCP transport against one trusted server, including permission prompts for consequential tools.
2. Real local-model transport against one trusted local host.
3. Server-side OpenAI adapter with no browser-side secrets.
4. Native Apple host and scoped macOS permissions with reversible actions.
5. Real voice with explicit capture indicators, interruption and permission-safe microphone state.
6. Vision/screen context with structured APIs preferred over brittle coordinate automation.
7. Unreal/Blender adapters validated against installed versions and a real project.
8. Durable memory with provenance, deletion, export and conflict handling.
9. Stoppable scheduling, crash recovery, resumable work and deployment hardening.
10. Accessibility, performance, security and public-installation acceptance gates.

Do not start the full creative/advertising agency implementation until the relevant core platform gates above are stable enough to support real tools, evidence, permissions, memory and recovery.

# Future major layer — MARIA Creative & Advertising Agency

After the core platform is stable and verified, build a governed agency layer that can cover the work of a high-end graphic design, branding, digital and advertising agency while preserving human authority and critical review.

## Strategy & intelligence

- client/project discovery;
- research and competitive analysis;
- audience/persona modeling;
- market and cultural insight;
- positioning;
- brand strategy;
- campaign strategy;
- channel strategy;
- creative briefs;
- measurement plans;
- evidence/source tracking.

## Brand & graphic design

- naming support;
- visual identity systems;
- logo systems;
- typography;
- color systems;
- grids and layout systems;
- iconography;
- art direction;
- brand guidelines;
- editorial design;
- print/digital collateral;
- packaging concepts;
- presentation and pitch-deck design;
- production-ready export checks.

## Advertising & campaign creation

- campaign platforms and big ideas;
- copywriting and headline systems;
- key visuals;
- social campaigns;
- paid-ad creative variants;
- outdoor/OOH concepts;
- digital display;
- launch systems;
- email/CRM creative;
- localization/transcreation;
- creative versioning by channel, market and format.

## Digital product & web

- UI/UX strategy;
- information architecture;
- design systems;
- websites and landing pages;
- campaign microsites;
- prototypes;
- accessibility review;
- implementation handoff;
- conversion-oriented design without dark patterns.

## Motion, video, 3D & production

- motion identity;
- storyboards;
- animatics;
- video concepts;
- editing plans;
- title design;
- social video variants;
- 3D concepts and product visualization;
- render/asset pipelines;
- production specifications;
- final-format and delivery validation.

## Media & performance layer

- media-plan support;
- channel and format mapping;
- creative testing plans;
- experiment variants;
- performance summaries;
- creative fatigue detection;
- learning loops from campaign evidence;
- recommendation generation with clear distinction between measured results and inference.

## Agency specialist organization

Potential specialist roles include:

- Executive Creative Director;
- Creative Director;
- Art Director;
- Brand Strategist;
- Brand Designer;
- Graphic Designer;
- Editorial Designer;
- UI/UX Designer;
- Web Designer;
- Motion Designer;
- 3D Artist;
- Copywriter;
- Content Strategist;
- Social Creative;
- Campaign Strategist;
- Research & Insight Analyst;
- Media Planner;
- Performance Analyst;
- Production Manager;
- Accessibility Reviewer;
- Localization Reviewer;
- Brand Guardian;
- Creative QA;
- Technical QA;
- Delivery/Preflight Agent.

Use the smallest competent team for each project. Do not create agent swarms merely to simulate an agency org chart.

## Agency quality gates

Agency work is not complete when one attractive visual exists. Before `VERIFIED` or final delivery, check as applicable:

1. brief alignment;
2. strategic rationale;
3. originality and differentiation;
4. hierarchy, typography, grid, spacing and composition;
5. brand consistency;
6. copy quality;
7. accessibility;
8. localization quality;
9. technical production specifications;
10. channel/format compliance;
11. asset/licensing provenance where relevant;
12. measurable campaign hypothesis;
13. export/preflight integrity;
14. critical creative review by a separate reviewer where practical;
15. final human approval for consequential publishing or external delivery.

## Agency operating principle

The goal is not to imitate a traditional agency's inefficiencies. MARIA × SEIS should combine strategy, craft, production, engineering and measurement in one coherent system while maintaining stronger consistency, evidence, versioning, QA and iteration discipline.

Premium does not mean excessive. Prefer a smaller number of excellent, coherent deliverables over large volumes of generic AI output.

Prefer one verified end-to-end capability over many ready-looking but unconnected catalogs. Testing remains part of implementation, not only a final percentage of a time budget.
