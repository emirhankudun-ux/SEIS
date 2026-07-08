# SEIS Second Brain Agent Registry

Generated: 2026-07-08T11:40:21.973Z
Status: review-only-agent-registry
Mode: repo-local-no-live-execution
Decision: NO-GO-autonomous-execution-not-approved

No private Obsidian import, provider call, credential validation, SSH, GitHub mutation, or deployment is performed by this artifact.

## Summary

| Metric | Count |
| --- | ---: |
| Installed AI profiles | 24 |
| AI workforce assignments | 25 |
| Managed sub-agent lanes | 6 |
| Autonomous agent roster | 12 |
| Role schema roles | 5 |
| Permission levels | 5 |
| Local apps detected in inventory | 8 |
| MCP vendor surfaces | 17 |
| Installed skills in inventory | 38 |
| Launcher routes | 18 |
| Snapshot installed launcher routes | 12 |

## Second Brain Binding

- status: local-demo
- vaultRoot: browser-vfs/SecondBrain
- trainingPackPath: browser-vfs/SecondBrain/07-learning/seis-agent-training-pack.md
- publicContributorPackPath: browser-vfs/SecondBrain/08-public/seis-public-contributor-onboarding.md
- obsidianStarterVaultManifestPath: browser-vfs/SecondBrain/09-obsidian/seis-obsidian-starter-vault-manifest.json
- obsidianStarterVaultGuidePath: browser-vfs/SecondBrain/09-obsidian/seis-obsidian-starter-vault.md
- aiCouncilReviewPackPath: browser-vfs/SecondBrain/10-ai-council/seis-ai-council-review-pack.md
- obsidianGraphMapPath: browser-vfs/SecondBrain/11-graph/seis-obsidian-graph-map.md
- agentTrainingDrillsPath: browser-vfs/SecondBrain/12-training/seis-agent-training-drills.md
- obsidianBridgeStatus: planned
- privateVaultImportEnabled: false
- hostVaultReadEnabled: false
- bodyImportPolicy: metadata-only-by-default
- githubMutationEnabled: false

## Training Coverage

- status: local-demo-read-only
- source: repo-owned browser-local Second Brain records only
- trainingPackPath: browser-vfs/SecondBrain/07-learning/seis-agent-training-pack.md
- publicContributorPackPath: browser-vfs/SecondBrain/08-public/seis-public-contributor-onboarding.md
- obsidianStarterVaultManifestPath: browser-vfs/SecondBrain/09-obsidian/seis-obsidian-starter-vault-manifest.json
- obsidianStarterVaultGuidePath: browser-vfs/SecondBrain/09-obsidian/seis-obsidian-starter-vault.md
- aiCouncilReviewPackPath: browser-vfs/SecondBrain/10-ai-council/seis-ai-council-review-pack.md
- obsidianGraphMapPath: browser-vfs/SecondBrain/11-graph/seis-obsidian-graph-map.md
- agentTrainingDrillsPath: browser-vfs/SecondBrain/12-training/seis-agent-training-drills.md
- requiredSections: installed AI launcher route coverage, autonomous agent roster onboarding, Obsidian safe import boundary, provider-neutral read-only model router, human approval gates, public demo release gates, public contributor no-key onboarding, Obsidian starter vault no-private-import export, installed AI council review pack, Obsidian wikilink graph map, agent training drills
- installedAiCoverage: launcher routes=true, profiles=true, noLiveProviderCalls=true
- autonomousAgentCoverage: requiredRosterCount=12, noWriteExecution=true, approvalBeforeExternalMutation=true
- obsidianCoverage: bridgeStatus=planned, bodyImportPolicy=metadata-only-by-default, privateVaultReadAllowed=false, privateNoteBodyCopyAllowed=false, pluginInstallAllowed=false

## Launcher Evidence Coverage

- command: npm run ai -- list
- snapshotType: author-observed-local-snapshot
- observedDate: 2026-07-01
- mode: local route readiness only
- runtimeValidationPolicy: recompute=node scripts/ai-launcher.cjs list, countsInstalledRoutesFromCurrentRuntime=true, snapshotIsNotPublicReadinessClaim=true

| Route | Status | Second Brain profile | Workforce assignment found | Profile found |
| --- | --- | --- | --- | --- |
| seis-agent | installed | seis-agent-policy-profile | true | true |
| codex | installed | codex-operator | true | true |
| antigravity | installed | antigravity | true | true |
| antigravity-ide | installed | antigravity-ide | true | true |
| cursor | installed | cursor-ide-profile | true | true |
| xcode | installed | xcode | true | true |
| openai | missing-command | openai-general-profile | true | true |
| claude | missing-ANTHROPIC_API_KEY | claude-review-profile | true | true |
| gemini | missing-GEMINI_API_KEY | gemini-validation-profile | true | true |
| qwen | installed | qwen-review-profile | true | true |
| kimi | installed | kimi | true | true |
| ollama | runtime-not-ready | ollama-local-profile | true | true |
| opencode | installed | opencode | true | true |
| aider | missing-command | aider | true | true |
| interpreter | missing-command | interpreter | true | true |
| hermes | installed | hermes | true | true |
| goose | installed | goose | true | true |
| open-design | installed | open-design | true | true |

## Provider Profiles

| Profile | Status | Second Brain use | Live route enabled |
| --- | --- | --- | --- |
| codex-operator | installed | review-context-only | false |
| seis-local-demo | local-demo | local-demo-context | false |
| seis-agent-policy-profile | installed | review-context-only | false |
| claude-review-profile | missing-ANTHROPIC_API_KEY | review-context-only | false |
| qwen-review-profile | installed | review-context-only | false |
| gemini-validation-profile | missing-GEMINI_API_KEY | review-context-only | false |
| ollama-local-profile | runtime-not-ready | review-context-only | false |
| openai-general-profile | missing-command | review-context-only | false |
| anthropic-claude-profile | route-defined-current-shell-missing-key | review-context-only | false |
| chatgpt-review-profile | route-defined-current-shell-missing-key | review-context-only | false |
| openrouter-provider-profile | planned | review-context-only | false |
| cursor-ide-profile | installed | review-context-only | false |
| xcode | installed | review-context-only | false |
| github-copilot-profile | planned | review-context-only | false |
| lm-studio-local-profile | planned | review-context-only | false |
| open-design | installed | review-context-only | false |
| antigravity | installed | review-context-only | false |
| antigravity-ide | installed | review-context-only | false |
| aider | missing-command | review-context-only | false |
| interpreter | missing-command | review-context-only | false |
| hermes | installed | review-context-only | false |
| goose | installed | review-context-only | false |
| kimi | installed | review-context-only | false |
| opencode | installed | review-context-only | false |

## AI Workforce Assignments

| ID | Name | Category | Status | Write authority |
| --- | --- | --- | --- | --- |
| codex | Codex | primary-writer | installed | primary-writer-human-supervised |
| seis-agent | SEIS Agent | policy-orchestration | installed | review-or-plan-only |
| claude | Claude | architecture-review | missing-ANTHROPIC_API_KEY | review-or-plan-only |
| qwen | Qwen | contradiction-review | installed | review-or-plan-only |
| gemini | Gemini | external-readiness-review | missing-GEMINI_API_KEY | review-or-plan-only |
| coderabbit | CodeRabbit | pull-request-review | pr-dependent | review-or-plan-only |
| ollama | Ollama / Local Model | local-private-draft | runtime-not-ready | review-or-plan-only |
| open-design | OpenDesign / Design Agent | visual-system-review | installed | review-or-plan-only |
| antigravity | Antigravity | creative-workflow-assistant | installed | review-or-plan-only |
| antigravity-ide | Antigravity IDE | ide-assistant | installed | review-or-plan-only |
| aider | Aider | bounded-terminal-coding-helper | missing-command | review-or-plan-only |
| interpreter | Open Interpreter | local-code-execution-review | missing-command | review-or-plan-only |
| hermes | Hermes | local-multi-agent-assistant | installed | review-or-plan-only |
| goose | Goose | local-build-orchestration-review | installed | review-or-plan-only |
| github-actions | GitHub Actions | automation-validation | remote-ci | review-or-plan-only |
| kimi | Kimi / Kimi Code | conditional-code-and-localization-review | installed | review-or-plan-only |
| opencode | OpenCode | bounded-terminal-coding-helper | installed | review-or-plan-only |
| openai | OpenAI / General Provider | cloud-provider-review | missing-command | review-or-plan-only |
| anthropic | Anthropic / Claude Provider | cloud-provider-review | route-defined-current-shell-missing-key | review-or-plan-only |
| chatgpt | ChatGPT | planning-triage | route-defined-current-shell-missing-key | review-or-plan-only |
| openrouter | OpenRouter | provider-gateway-review | planned | review-or-plan-only |
| cursor | Cursor | editor-assistant | installed | review-or-plan-only |
| xcode | Xcode | local-ide-assistant | installed | review-or-plan-only |
| github-copilot | GitHub Copilot | ide-assistant | planned | review-or-plan-only |
| lm-studio | LM Studio | local-model-experiment | planned | review-or-plan-only |

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
- public contributor onboarding pack generated from browser-local records
- Obsidian starter vault manifest generated from repo-owned browser-local seed notes

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
