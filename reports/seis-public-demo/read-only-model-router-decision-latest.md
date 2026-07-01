# SEIS Read-Only Model Router Decision

Generated: 2026-07-01T18:52:51.510Z
Status: review-only-no-runtime-authority
Mode: provider-neutral-read-only
Decision: NO-GO-live-routing-not-approved

Provider calls performed: false
Credential validation performed: false
Browser secrets exposed: false
Private Obsidian content routed: false

## Scope

This artifact is a provider-neutral review-only decision record. It does not
call providers, validate credentials, store prompt bodies, expose browser
secrets, route private Obsidian content, execute SSH, deploy, mutate GitHub, or
approve live routing.

Missing Key is not Error. Local-only mode never falls back to cloud providers,
and private Obsidian content is not routable.

## Installed AI Fixtures

| Profile | Provider state | Provider calls performed |
| --- | --- | --- |
| codex-operator | Local Demo | false |
| seis-local-demo | Local Demo | false |
| seis-agent-policy-profile | Local Demo | false |
| claude-review-profile | Missing Key | false |
| qwen-review-profile | Missing Key | false |
| gemini-validation-profile | Missing Key | false |
| ollama-local-profile | Unknown | false |
| openai-general-profile | Missing Key | false |
| anthropic-claude-profile | Missing Key | false |
| chatgpt-review-profile | Missing Key | false |
| openrouter-provider-profile | Missing Key | false |
| cursor-ide-profile | Disabled | false |
| xcode | Disabled | false |
| github-copilot-profile | Disabled | false |
| lm-studio-local-profile | Unknown | false |
| open-design | Disabled | false |
| antigravity | Disabled | false |
| antigravity-ide | Disabled | false |
| aider | Disabled | false |
| interpreter | Disabled | false |
| hermes | Disabled | false |
| goose | Disabled | false |
| kimi | Disabled | false |
| opencode | Disabled | false |

## Read-Only Decisions

| Decision | Provider state | routeEligible | executionPerformed | fallbackUsed |
| --- | --- | --- | --- | --- |
| second-brain-local-context-review | Local Demo | false | false | false |
| private-obsidian-vault-content | Disabled | false | false | false |
| cloud-review-provider-missing-key | Missing Key | false | false | false |
| frontier-model-class-route | Disabled | false | false | false |

## Integrity Markers

- executionPerformed: false
- fallbackUsed: false
- promptBodyIncluded: false
- credentialMaterialIncluded: false
- privateObsidianContentRoutable: false
