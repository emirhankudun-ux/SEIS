# AI App Surfaces

Status: Product foundation

Each LLM-powered surface in SEIS AI App must define purpose, input, context,
tools, approval, output, evidence, audit, and current status.

## Surface Contract

| Field | Requirement |
| --- | --- |
| Purpose | What user problem the AI surface solves. |
| User input | What the user can provide. |
| Allowed context | What the LLM may read. |
| Forbidden context | What must never be used. |
| Allowed tools | Tool classes available by default. |
| Forbidden tools | Tool classes blocked without approval. |
| Required approval | Conditions that require human approval. |
| Output format | Expected answer or artifact shape. |
| Evidence requirement | What must support the output. |
| Audit requirement | What redacted metadata is recorded. |
| Current status | Planned, fixture-backed, alpha, blocked, or implemented. |

## Initial Surfaces

| Surface | Purpose | Default tools | Approval trigger | Current status |
| --- | --- | --- | --- | --- |
| AI chat | General SEIS reasoning and next-action support. | Read-only app and docs context. | Write, push, deploy, SSH, secrets. | Foundation contract. |
| Command palette assistant | Fast command intent routing. | Read-only lookup and planning. | Any privileged action. | Planned. |
| Repository assistant | Explain repo state, files, branches, PRs, and validation. | File and Git read-only tools. | Staging, committing, pushing, PR writes. | Foundation contract. |
| Documentation assistant | Explain and improve docs. | Docs search and read-only evidence. | Replacing source-of-truth docs. | Planned. |
| Roadmap assistant | Explain roadmap and next PR sequence. | Roadmap and review docs. | Changing official roadmap status. | Planned. |
| Goal tracking assistant | Compare goals with evidence. | Goal, roadmap, repo, and validation evidence. | Marking completion or validation. | Foundation contract. |
| Security reviewer | Review security risks and provider data policy. | Read-only code/docs/security evidence. | Secrets, auth, SSH, firewall, policy changes. | Foundation contract. |
| Architecture reviewer | Review boundaries and ADR fit. | Architecture docs and source evidence. | Major architecture decision. | Planned. |
| PR reviewer | Review diffs and PR evidence. | GitHub/read-only diff and checks. | Commenting, closing, merging, pushing. | Planned. |
| Release readiness reviewer | Verify release blockers and evidence. | Read-only checks and release records. | Tagging, deployment, artifact deletion. | Foundation contract. |
| Public readiness reviewer | Verify open-source and public claims. | Governance docs, checks, public metadata. | Visibility or release changes. | Planned. |
| Prompt generator | Draft prompt templates and metadata. | Approved prompt policy and synthetic fixtures. | Publishing prompt versions. | Planned. |
| Model-router inspector | Explain route decisions and blocked reasons. | Router metadata and policy. | Provider setup or credential use. | Planned. |
| Evaluation assistant | Explain eval status and missing coverage. | Eval fixtures and reports. | Running external/private evals. | Planned. |
| Agent task planner | Draft supervised agent tasks. | Agent role contracts and app state. | Starting privileged actions. | Planned. |
| Automation assistant | Suggest automation paths and dry-runs. | Script metadata and check docs. | Live automation, deployment, SSH. | Planned. |
| Knowledge search assistant | Search approved docs and knowledge records. | Approved knowledge/retrieval sources. | Private or restricted retrieval. | Planned. |

## Per-Surface Definitions

### AI Chat

- Purpose: general SEIS reasoning, explanation, and next-action support.
- User input: questions, selected repository context, goal context, or review
  request.
- Allowed context: approved app state, official docs, review reports, and
  selected repository evidence.
- Forbidden context: secrets, private keys, provider credentials, restricted
  archives, and unapproved private data.
- Allowed tools: read-only docs, file, Git, route, prompt, and evidence lookup.
- Forbidden tools: write, push, merge, deploy, SSH, secret, destructive, and
  provider-setup tools without approval.
- Required approval: any privileged action or sensitive provider routing.
- Output format: answer with evidence, assumptions, tool use, validation, and
  next safe action.
- Evidence requirement: cite source files, checks, PRs, reports, or state that
  evidence is missing.
- Audit requirement: route id, privacy mode, context sources, tool classes, and
  approval state.
- Current status: foundation contract.

### Command Palette Assistant

- Purpose: route compact user commands into safe SEIS workflows.
- User input: command text, current page, selected workspace, and privacy mode.
- Allowed context: app state, command registry, official docs, and approved
  metadata.
- Forbidden context: secrets, private keys, provider credentials, raw private
  logs, and restricted data.
- Allowed tools: read-only lookup and task planning.
- Forbidden tools: write, external write, deploy, SSH, secret, and destructive
  tools without approval.
- Required approval: any command that would mutate repository, provider,
  deployment, SSH, or secret state.
- Output format: route summary, command interpretation, evidence, and next safe
  action.
- Evidence requirement: command source and relevant docs or state record.
- Audit requirement: command id, route id, privacy mode, and approval state.
- Current status: planned.

### Repository Assistant

- Purpose: explain repository state, files, branches, PRs, and validation.
- User input: path, branch, PR, error, cleanup goal, or review question.
- Allowed context: official docs, source files, Git state, PR metadata, and
  validation output.
- Forbidden context: secrets, private keys, `.env` values, and restricted
  unreviewed archives.
- Allowed tools: read-only file, Git, validation, and path-only security scans.
- Forbidden tools: staging, committing, pushing, merging, deleting branches,
  history rewrite, deployment, SSH, and destructive cleanup without approval.
- Required approval: any repository write or external write action.
- Output format: repository condition, source-linked findings, risks,
  validation, branch or PR plan, excluded material, and next safe action.
- Evidence requirement: paths, diffs, checks, PRs, or explicit unknown state.
- Audit requirement: branch, commit, paths inspected, tools used, and approval
  state.
- Current status: local-alpha prototype via
  `packages/repository-assistant/fixtures/local-readonly-repository-assistant.json`
  and `npm run check:repository-assistant-prototype`.

### Documentation Assistant

- Purpose: explain, improve, and align SEIS documentation.
- User input: document path, question, update request, or review scope.
- Allowed context: official docs, review docs, source evidence, and roadmap
  records.
- Forbidden context: secrets, copied private prompts, restricted references, and
  private data.
- Allowed tools: read-only docs search plus local documentation edits when
  explicitly scoped.
- Forbidden tools: replacing source-of-truth docs, deleting docs, or publishing
  without review.
- Required approval: replacing official governance/security/architecture docs.
- Output format: doc finding, proposed edit, changed paths, and validation.
- Evidence requirement: links to source docs or observed repo state.
- Audit requirement: document ids, change reason, and validation command.
- Current status: planned.

### Roadmap Assistant

- Purpose: explain roadmap status, next PR sequence, blockers, and priorities.
- User input: roadmap area, timeframe, goal, blocker, or priority question.
- Allowed context: roadmap docs, goal records, review reports, and validation
  state.
- Forbidden context: private strategy data unless approved, secrets, and
  unreviewed archive plans.
- Allowed tools: read-only roadmap and review inspection.
- Forbidden tools: changing official roadmap status or opening PRs without
  approval.
- Required approval: modifying roadmap source of truth or making public claims.
- Output format: roadmap summary, blockers, evidence, and next safe PR.
- Evidence requirement: roadmap source paths and validation status.
- Audit requirement: roadmap item ids, evidence links, and assumptions.
- Current status: planned.

### Goal Tracking Assistant

- Purpose: compare goals against repository evidence and detect blockers.
- User input: goal id, progress question, validation request, or review period.
- Allowed context: goal records, roadmap docs, checks, PRs, branch state, and
  review reports.
- Forbidden context: secrets, restricted archives, and unapproved private data.
- Allowed tools: read-only goal, repo, validation, and PR inspection.
- Forbidden tools: marking goals complete, changing validation state, pushing,
  deploying, SSH, or destructive actions without approval and evidence.
- Required approval: goal state changes and privileged tool actions.
- Output format: progress, evidence, blockers, unsupported claims, and next
  action.
- Evidence requirement: direct source, check, PR, or audit event for completion.
- Audit requirement: goal id, evidence links, route id, and approval state.
- Current status: foundation contract.

### Security Reviewer

- Purpose: inspect security risks, provider data policy, and permission
  boundaries.
- User input: path, PR, feature, provider, or approval request.
- Allowed context: security docs, source files, redacted scans, and policy
  checks.
- Forbidden context: secret values, private keys, provider credentials, personal
  data, and raw private logs.
- Allowed tools: read-only path scans, source inspection, dependency metadata,
  and policy checks.
- Forbidden tools: secret rotation, auth changes, firewall, SSH daemon,
  deployment, or production changes without approval.
- Required approval: any credential, auth, SSH, firewall, deployment, or policy
  mutation.
- Output format: severity-ordered findings, evidence, mitigation, approvals,
  and validation gaps.
- Evidence requirement: affected paths, scan summaries, and policy links.
- Audit requirement: finding class, affected path, redaction status, and
  approval state.
- Current status: foundation contract.

### Architecture Reviewer

- Purpose: review boundaries, ADR fit, component maps, and long-term system
  coherence.
- User input: architecture question, path, feature, ADR, or system boundary.
- Allowed context: architecture docs, source structure, ADRs, and review
  records.
- Forbidden context: restricted implementation references and private data.
- Allowed tools: read-only docs, source, and dependency inspection.
- Forbidden tools: broad rewrites, framework adoption, or major architecture
  changes without approval.
- Required approval: changing major architecture, build systems, or framework
  direction.
- Output format: findings, tradeoffs, recommended decision, and validation path.
- Evidence requirement: source docs, affected paths, and ADR references.
- Audit requirement: decision area, evidence links, and unresolved risks.
- Current status: planned.

### PR Reviewer

- Purpose: review pull requests for bugs, security, tests, docs, and
  architecture fit.
- User input: PR number, diff, branch, or review objective.
- Allowed context: PR diff, comments, checks, official docs, and changed files.
- Forbidden context: secrets and private comments not approved for model use.
- Allowed tools: read-only GitHub metadata, diff inspection, and local checks.
- Forbidden tools: commenting, closing, merging, pushing, or branch deletion
  without approval.
- Required approval: any GitHub write action.
- Output format: findings first, open questions, validation, and next action.
- Evidence requirement: file paths, line references, checks, and PR metadata.
- Audit requirement: PR number, check status, files inspected, and route state.
- Current status: planned.

### Release Readiness Reviewer

- Purpose: verify release blockers, validation, artifacts, rollback, and
  deployment readiness.
- User input: release target, branch, artifact, or readiness question.
- Allowed context: release docs, manifests, CI status, validation output, and
  deployment runbooks.
- Forbidden context: production secrets, private keys, and private deployment
  logs without approval.
- Allowed tools: read-only checks, dry-runs, manifest inspection, and GitHub
  status reads.
- Forbidden tools: tagging, publishing, deployment, artifact deletion, branch
  deletion, and production mutation without approval.
- Required approval: any release, deploy, tag, public visibility, or artifact
  deletion action.
- Output format: release decision, blockers, evidence, rollback notes, and next
  safe action.
- Evidence requirement: command output, CI status, manifests, and runbooks.
- Audit requirement: release target, evidence links, risk class, and approval
  state.
- Current status: foundation contract.

### Public Readiness Reviewer

- Purpose: verify whether public claims and open-source readiness are supported.
- User input: public-readiness question, claim, branch, or docs path.
- Allowed context: README, governance, security, contributing docs, templates,
  checks, and public metadata.
- Forbidden context: secrets, private roadmap details, and unsupported provider
  or model claims.
- Allowed tools: read-only docs, GitHub metadata, and governance checks.
- Forbidden tools: changing repository visibility, releases, or public metadata
  without approval.
- Required approval: making repo public, publishing releases, or changing public
  claims.
- Output format: readiness decision, unsupported claims, evidence, risks, and
  next action.
- Evidence requirement: official docs, checks, and GitHub metadata.
- Audit requirement: claim id, source links, validation, and approval state.
- Current status: planned.

### Prompt Generator

- Purpose: draft prompt templates, metadata, and regression cases.
- User input: prompt purpose, agent role, expected output, and safety boundary.
- Allowed context: prompt policy, synthetic fixtures, and official docs.
- Forbidden context: secrets, copied private prompts, and restricted references.
- Allowed tools: prompt drafting and metadata validation.
- Forbidden tools: publishing prompt versions or routing private data without
  approval.
- Required approval: promoting prompt versions to reviewed or active state.
- Output format: prompt draft, metadata, safety rules, and regression cases.
- Evidence requirement: source policy and fixture references.
- Audit requirement: prompt id, version, change reason, and reviewer state.
- Current status: planned.

### Model-Router Inspector

- Purpose: explain route decisions, privacy modes, and blocked reasons.
- User input: task class, route id, data class, or provider question.
- Allowed context: router policy, provider readiness, and safe route metadata.
- Forbidden context: provider secrets, raw sensitive prompts, and private
  payloads.
- Allowed tools: route policy inspection and metadata-only review.
- Forbidden tools: provider setup, credential access, or live provider calls
  without approval.
- Required approval: new provider credentials, sensitive routing, or external
  private evaluation.
- Output format: route explanation, privacy mode, blocked reason, and next safe
  action.
- Evidence requirement: router policy, data class, and approval state.
- Audit requirement: route id, provider id, model profile, and privacy mode.
- Current status: planned.

### Evaluation Assistant

- Purpose: explain evaluation status and missing coverage.
- User input: prompt, route, agent, app state, or model evaluation question.
- Allowed context: evaluation docs, fixtures, reports, and check output.
- Forbidden context: private eval data or benchmark data without approval.
- Allowed tools: read-only evaluation inspection and synthetic fixture review.
- Forbidden tools: external/private eval runs, benchmark publication, or dataset
  upload without approval.
- Required approval: private, external, benchmark, or provider-backed evals.
- Output format: coverage summary, gaps, risks, and next eval fixture.
- Evidence requirement: eval id, fixture source, check output, and limitations.
- Audit requirement: eval target, fixture source, metric, and result status.
- Current status: planned.

### Agent Task Planner

- Purpose: draft supervised agent tasks with permission boundaries.
- User input: objective, affected paths, role, expected output, and acceptance
  checks.
- Allowed context: agent runtime docs, app state, official docs, and repo
  evidence.
- Forbidden context: secrets and unapproved private data.
- Allowed tools: task drafting and read-only evidence collection.
- Forbidden tools: starting privileged actions or expanding agent permissions
  without approval.
- Required approval: privileged tool use, writes, external actions, or runtime
  permission changes.
- Output format: task plan, allowed actions, forbidden actions, validation, and
  approval needs.
- Evidence requirement: source docs and affected paths.
- Audit requirement: agent role, task id, allowed tools, and approval state.
- Current status: planned.

### Automation Assistant

- Purpose: suggest automation paths, dry-runs, and validation commands.
- User input: automation goal, script path, workflow, or failure output.
- Allowed context: scripts, workflow docs, runbooks, and prior validation.
- Forbidden context: secrets, private host credentials, and production-only
  data.
- Allowed tools: read-only script inspection and dry-run planning.
- Forbidden tools: live deployment, SSH, destructive cleanup, and production
  automation without approval.
- Required approval: live automation, deployment, SSH, secret, or destructive
  action.
- Output format: automation plan, dry-run command, risks, rollback, and checks.
- Evidence requirement: script docs, command output, and runbook links.
- Audit requirement: workflow id, dry-run status, affected systems, approval
  state.
- Current status: planned.

### Knowledge Search Assistant

- Purpose: search approved docs, knowledge records, and evidence links.
- User input: query, scope, data mode, or source filter.
- Allowed context: approved docs, knowledge records, review reports, and public
  metadata.
- Forbidden context: secrets, restricted material, private embeddings, and
  unapproved personal data.
- Allowed tools: read-only search and retrieval over approved sources.
- Forbidden tools: private/restricted retrieval, memory writes, or provider
  routing without approval.
- Required approval: private source access, durable memory write, or external
  provider routing for sensitive data.
- Output format: answer, sources, source class, freshness, and unknowns.
- Evidence requirement: source paths, source class, and freshness warning.
- Audit requirement: query id, sources used, data class, and route state.
- Current status: planned.

## Forbidden Defaults

No AI surface may fabricate repository state, validation, security status,
implementation status, provider connection status, or model training results.
