# SEIS Agency Operating Model

Status: active-public-safe organizational overlay

This document turns the SEIS workforce into an agency-shaped operating model:
one front door for briefs, specialist pods, explicit ownership, review gates,
evidence, and a human-ready handoff.

It is an organizational contract. It does not create background workers,
authenticate providers, grant tool permissions, enable live MCP sessions, or
replace the canonical agent registry.

## Agency promise

SEIS Agency takes a bounded SEIS goal and returns a coherent package:

1. a clear brief and acceptance bar
2. a named accountable role
3. specialist review where the risk requires it
4. a real code, design, schema, test, research, or documentation output
5. reproducible validation evidence
6. risks, rollback, and the next decision

The agency is supervised. Codex remains the current single writer for a change
package; other roles are reviewers, planners, researchers, or gated specialists
unless a human explicitly changes that boundary.

## Team shape

| Pod | Mission | Lead | Supporting roles |
| --- | --- | --- | --- |
| Direction & Product | Briefs, goals, scope, architecture, and handoff | Architect Agent | Product Agent, Documentation Agent |
| Experience | Product feel, UI/UX, accessibility, motion, and visual evidence | Design Agent | UI/UX Agent |
| Engineering | Apple-native, web, full-stack, platform, and release work | Code Agent | DevOps Agent |
| Intelligence & Automation | Research, search, knowledge, cloud readiness, and safe automation | Research Agent | Search Agent, Cloud Agent, Automation Agent |
| Trust & Delivery | Security, privacy, QA, regression, and completion evidence | Security Agent | QA Agent |

The five pods organize thirteen agency role families. They do not create
runtime workers, infer live staffing, or grant permissions. The machine-readable overlay is
content/development/seis-agency-team.json.

## 300-person company model

The following is the proposed company-wide headcount model for SEIS Agency. It
is a planning model, not current payroll evidence, a hiring completion claim,
or a claim that 300 autonomous agents exist.

| Unit | Employees |
| --- | ---: |
| Executive & Strategy | 12 |
| Client, Product & Program Management | 28 |
| Creative Direction, Brand & Design | 42 |
| Product, UX & Research | 28 |
| Software Engineering | 100 |
| AI, Data & Knowledge Systems | 42 |
| Platform, Security, QA & DevOps | 30 |
| People, Finance, Legal, Marketing & Operations | 18 |
| **Total** | **300** |

At this scale, the thirteen agent roles are capability families and review
responsibilities inside the operating model. They do not represent the total
human headcount and do not grant autonomous runtime authority.

## Operating rules

- Every request enters through the agency brief template.
- Every brief names one accountable role and one canonical repository boundary.
- Every change package has one writer; reviewers cannot self-promote.
- Product scope, architecture, security, accessibility, quality, and release
  gates are explicit rather than implied.
- A planned, demo, local, blocked, or unavailable capability is never described
  as live or stable without evidence.
- Secrets, private vault material, credentials, and provider-auth state stay
  outside briefs, registries, prompts, logs, and handoffs.
- Human approval is required for external mutation, deployment, publication,
  credential changes, destructive operations, and protected-branch writes.
- A blocked item records the exact unblock condition and remains visible.

## Engagement flow

| Stage | Primary owner | Output | Completion gate |
| --- | --- | --- | --- |
| Intake | Product Agent | Complete brief or a concise clarification request | Goal, scope, and validation target exist |
| Frame | Architect Agent | Non-goals, dependencies, risks, and rollback | Ownership and public/private boundary are known |
| Assign | Architect Agent | Accountable role, reviewers, and file scope | One writer is named |
| Produce | Code, Design, or Research Agent | Reviewable artifact | Work stays within the approved scope |
| Review | QA and Security Agents | Findings and gate status | Required checks pass or are blocked explicitly |
| Evidence | QA and Documentation Agents | Commands, results, artifacts, limitations | Evidence matches the claim’s scope |
| Handoff | Product and Architect Agents | PR-ready package and next decision | Human approval queue is explicit |

## Service menu

The initial agency service menu is:

- brief framing and goal decomposition
- architecture and ADR decisions
- product design, UI/UX, and accessibility
- Apple-native and platform engineering
- web and full-stack engineering
- AI, agent, knowledge, and research planning
- cloud, SSH, and automation readiness
- security, privacy, and permission review
- quality, release, and handoff

Each service has an accountable role, required reviewers, output contract, and
validation condition in the machine registry. The service menu is a routing
aid, not a promise that every capability is currently implemented or live.

## Brief-to-delivery contract

Use docs/governance/SEIS_AGENCY_BRIEF_TEMPLATE.md for every non-trivial request.
The minimum brief contains:

- brief ID and Goal ID
- project and canonical owner repository
- objective and deliverables
- scope, non-goals, affected paths
- acceptance criteria and validation commands
- security, privacy, public/private boundary
- risks, rollback, and human approvals
- accountable role, reviewers, and next decision

The agency stops and asks for direction when the request changes repository
ownership, needs a destructive or external action, or has no honest validation
path.

## First 30-day runway

The first operating cycle is intentionally small:

1. use the brief for the next SEIS request
2. route one bounded brief through pod assignment
3. pilot one accessible Command Center experience package
4. pilot one AI or knowledge package with explicit truth boundaries
5. review the package and update the roster from evidence

These are planned backlog items, not claims that the pilots have already run.

## Evidence and validation

The canonical machine registry is validated with:

    npm run check:seis-agency-team

The check confirms source-role coverage, unique pod and service ownership,
ordered workflow stages, brief completeness, approval boundaries, valid Goal
links, public-safe content, and the existence of the human-readable contracts.

## Related contracts

- AGENTS.md
- content/development/seis-agency-team.json
- SEIS_AGENT_WORKFORCE.md
- SEIS_SUB_AGENTS.md
- docs/AGENT_REGISTRY.md
- docs/governance/SEIS_AGENCY_BRIEF_TEMPLATE.md
