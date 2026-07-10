# SEIS Second Brain Agent Registry

Generated: 2026-07-10T18:10:46.981Z
Status: review-only-agent-registry
Mode: repo-local-no-live-execution
Decision: NO-GO-autonomous-execution-not-approved

No private Obsidian import, provider call, credential validation, SSH, GitHub mutation, or deployment is performed by this artifact.

## Summary

| Metric | Count |
| --- | ---: |
| Installed AI profiles | 6 |
| AI workforce assignments | 10 |
| Managed sub-agent lanes | 9 |
| Autonomous agent roster | 13 |
| Role schema roles | 5 |
| Permission levels | 5 |
| Local apps detected in inventory | 8 |
| MCP vendor surfaces | 17 |
| Installed skills in inventory | 38 |

## Second Brain Binding

- status: local-demo
- vaultRoot: /home/seis/SecondBrain
- trainingPackPath: /home/seis/SecondBrain/07-learning/seis-agent-training-pack.md
- obsidianBridgeStatus: planned
- privateVaultImportEnabled: false
- hostVaultReadEnabled: false
- bodyImportPolicy: metadata-only-by-default
- githubMutationEnabled: false

## Provider Profiles

| Profile | Status | Second Brain use | Live route enabled |
| --- | --- | --- | --- |
| codex-operator | installed | review-context-only | false |
| seis-local-demo | local-demo | local-demo-context | false |
| claude-review-profile | route-defined-current-shell-missing-key | review-context-only | false |
| qwen-review-profile | installed | review-context-only | false |
| gemini-validation-profile | route-defined-current-shell-missing-key | review-context-only | false |
| ollama-local-profile | installed | review-context-only | false |

## AI Workforce Assignments

| ID | Name | Category | Status | Write authority |
| --- | --- | --- | --- | --- |
| codex | Codex | primary-writer | installed | primary-writer-human-supervised |
| claude | Claude | architecture-review | route-defined-current-shell-missing-key | review-or-plan-only |
| qwen | Qwen | contradiction-review | installed | review-or-plan-only |
| gemini | Gemini | external-readiness-review | route-defined-current-shell-missing-key | review-or-plan-only |
| coderabbit | CodeRabbit | pull-request-review | pr-dependent | review-or-plan-only |
| ollama | Ollama / Local Model | local-private-draft | installed | review-or-plan-only |
| open-design | OpenDesign / Design Agent | visual-system-review | installed | review-or-plan-only |
| github-actions | GitHub Actions | automation-validation | remote-ci | review-or-plan-only |
| kimi | Kimi / Kimi Code | conditional-code-and-localization-review | route-defined-current-shell-missing-command | review-or-plan-only |
| opencode | OpenCode | bounded-terminal-coding-helper | installed | review-or-plan-only |

## Autonomous Agent Roster

| Agent | Status | Duty |
| --- | --- | --- |
| Architect Agent | status-plan-only | Architecture, module boundaries, and rollback-aware implementation plans. |
| Code Agent | status-plan-only | Scoped implementation notes, validators, and code review evidence. |
| Design Agent | status-plan-only | Visual system, product feel, design tokens, and interaction evidence. |
| UI/UX Agent | status-plan-only | Usability, mobile ergonomics, focus order, and accessibility notes. |
| Research Agent | status-plan-only | Source provenance, prior-art notes, and clean-room research summaries. |
| Search Agent | status-plan-only | Local vault, docs, route, file, and plugin indexing strategy. |
| Security Agent | blocking-review-gate | Secret hygiene, private vault boundaries, and approval requirements. |
| DevOps Agent | status-plan-only | CI, release, deployment, rollback, and no-live-action runbooks. |
| Documentation Agent | status-plan-only | README, status, index, backlog, and PR queue alignment. |
| QA Agent | status-plan-only | Validator, browser-smoke, regression, and acceptance evidence. |
| Cloud Agent | status-plan-only | Cloud, SSH, storage, sync, and provider readiness boundaries. |
| Automation Agent | status-plan-only | Safe recurring workflows, ledgers, and human-approved automation gates. |
| Product Agent | status-plan-only | Requirements, acceptance criteria, roadmap slices, launch readiness, and delivery evidence. |

## MCP And Plugin Surface

| Vendor | Surface count | Status | Live action gate |
| --- | ---: | --- | --- |
| Google | 6 | callable in current Codex session | Explicit user intent is required before mail, calendar, Drive, Docs, Sheets, or Slides mutations. |
| Apple | 5 | callable for enabled simulator workflows; local Xcode.app detected; xcodebuildmcp also registered in Claude and Kimi project MCP configs | Project build/run/test actions must follow XcodeBuildMCP session-default rules; device, macOS, debugging, and UI automation capabilities may require separate configuration. |
| Moonshot AI / Kimi | 4 | official CLI installed and path verified; no provider configured; official Kimi Datasource plugin requires OAuth login before installation | Do not run Kimi provider login, OAuth, API-key setup, or plugin installation without explicit user interaction and approval. |
| Anthropic / Claude | 3 | local app and CLI detected; SEIS and xcodebuildmcp project MCP entries are pending user approval in Claude Code; no standalone Codex Anthropic connector was found | Claude MCP approval, provider auth, or plugin installation must be completed by the user inside Claude Code or an approved secure setup flow. |
| Microsoft and Windows | 7 | local skills installed or available; connector installs require explicit user confirmation | Azure, Outlook, Teams, SharePoint, and Windows app mutations require exact target, credentials boundary, and approval. |
| OpenAI | 2 | callable and approval-gated for secret creation | Use the secure key setup flow only; never print or commit API keys. |
| GitHub | 4 | callable in current Codex session | PR, issue, reviewer, and repository mutations require explicit user intent. |
| Figma | 3 | callable in current Codex session | Follow Figma skill guidance before file writes. |
| Cloudflare | 3 | callable in current Codex session | Cloudflare account mutations require explicit target and approval. |
| Vercel | 4 | callable in current Codex session | Deployments and project mutations require explicit approval. |
| Slack | 3 | partially callable from current tool discovery | Sending messages or channel changes require explicit user intent. |
| Supabase | 5 | callable in current Codex session | Project pause, restore, branch delete, and database changes require explicit approval. |
| Shopify | 2 | partially callable from current tool discovery | Store mutations require explicit approval and schema validation first. |
| Notion | 2 | callable in current Codex session | Workspace edits require explicit target and user intent. |
| Asana | 2 | partially callable from current tool discovery | Task or project mutations require explicit approval. |
| Clay | 3 | callable in current Codex session | Credit-costing enrichments must only be requested when the user explicitly asks for those data points. |
| Vantage | 2 | partially callable from current tool discovery | Budget and alert mutations require explicit approval. |

## Evidence Required Before Autonomous Use

- human approval for autonomous write execution
- permission matrix enforced by executable tests
- approval fixture enforced before write-gated actions
- redaction fixture enforced before any provider or connector routing
- explicit user-selected Obsidian source path before private vault dry-run
- backend-only provider mediation before live model routing
- current browser-smoke evidence and manual accessibility review
- clean release-candidate worktree review before GitHub publication

## Safety Boundary

- privateObsidianVaultReadPerformed: false
- privateNoteBodyCopied: false
- providerCallsPerformed: false
- credentialValidationPerformed: false
- browserSecretsExposed: false
- promptBodiesStored: false
- autonomousWriteExecutionPerformed: false
- backgroundRunnerEnabled: false
- externalConnectorMutationPerformed: false
- sshExecuted: false
- deploymentPerformed: false
- githubMutationPerformed: false
- releaseApprovalGranted: false
