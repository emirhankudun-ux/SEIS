# SEIS AI Release Manifest

- Generated: 2026-06-09T06:20:32.023Z
- Source: content/development/ai-release-manifest.json
- Profile: Büyük Dil Sürümü (v12-seed)
- Installed tools: 6 / 11
- Missing required tools: 0
- Local model count: 0
- Remote orchestrator: seis-agent
- Execution mode: remote-only-gatekeeper

## AI Tools

| id | label | installed | executionMode | status | route |
| --- | --- | --- | --- | --- | --- |
| codex | Codex | yes | local-helper | installed | release governance checklist |
| openai | OpenAI | no | local-helper | missing-optional | local analysis request |
| claude | Claude | yes | local-helper | installed | ux copy narrative pass |
| gemini | Gemini | yes | local-helper | installed | browser research for docs |
| qwen | Qwen | yes | local-helper | installed | qwen cross-check |
| kimi | Kimi | no | local-helper | missing-optional | translate this interface to turkish |
| opencode | OpenCode | yes | local-helper | installed | opencode terminal coding |
| aider | Aider | no | local-helper | missing-optional | quick repo patch |
| interpreter | Interpreter | no | local-helper | missing-optional | csv log analysis |
| ollama | Ollama | no | local-helper | missing-optional | local offline llama draft |
| seis-agent | SEIS Agent | yes | remote-agent | ready | release governance checklist |

## Release Packages

| id | label | scope | deployment | status |
| --- | --- | --- | --- | --- |
| seis-large-language-core | Büyük Dil Sürümü · Core | SEIS Core | API-first | planned |
| seis-large-language-plus | Büyük Dil Sürümü · Plus | Experimentation | gated | requires-provider-keys |

## Local models from Ollama

- Not detected at the moment.

## Routing

- quick repo patch → aider
- browser research for docs → gemini
- local offline llama draft → ollama
- csv log analysis → interpreter
- qwen cross-check → qwen
- opencode terminal coding → opencode
- ux copy narrative pass → claude
- translate this interface to turkish → kimi
- local analysis request → openai
- production reasoning and policy check → seis-agent
- release governance checklist → seis-agent
