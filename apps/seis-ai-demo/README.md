# SEIS AI Command Core

SEIS AI Command Core is a local, deterministic demo application for the SEIS AI
operating layer. It demonstrates the product workflow without requiring provider
credentials or making live model calls.

## What It Demonstrates

- AI request composer and generated implementation plan
- Web-to-macOS handoff through the local `seisdemo://` URL scheme
- Provider-neutral model router scoring
- Supervised agent runtime queue
- Deterministic workflow map recovered from trusted Qwen reference ideas
- Unified Fabric module for controlled agents, specialist plugin feeds, SSH boundaries, and linked AI website surfaces
- Activation Matrix module for the `seis-ai-agent@seis-repo` install surface, embedded plugin lanes, blocked live mutation, and sub-agent activation evidence
- Website Feature Fabric module for single-prompt AI website feature coverage across local web surfaces, agent feeds, plugin feeds, SSH exposure, and provider-key policy
- Installed AI helper evidence for Codex, Claude, Gemini, Qwen, OpenCode, and Ollama with honest auth/output status
- Provider readiness cards with browser secret entry explicitly blocked
- Local run metrics for plan steps, active agents, provider paths, risk, evals, and prompt size
- Versioned prompt behavior notes
- Knowledge and evidence references
- Evaluation score strip
- Human approval gate
- Audit timeline, local JSON export, and markdown plan export
- Local persistence with `localStorage`

## AI Core Integration

The demo is now connected to the restored local AI Core contract spine:

- `packages/shared-types`
- `packages/model-router`
- `packages/prompt-engine`
- `packages/agent-runtime`
- `packages/tool-registry`
- `packages/repository-assistant`
- `packages/data`

The integration manifest lives at
[`contracts/seis-ai-command-core-integration.json`](./contracts/seis-ai-command-core-integration.json).
It links the web demo, `apps/seis-demo-web`, `apps/seis-core`, and the SwiftUI
Command Core surface without enabling live provider calls, browser API-key
storage, SSH, deployment, payment, database, or production behavior.

The broader agent/plugin/SSH fabric lives at
[`data/seis-ai-unified-integration-fabric.json`](../../data/seis-ai-unified-integration-fabric.json).
It connects controlled SEIS AI agents, embedded specialist plugin lanes,
approval-gated SSH execution boundaries, and AI website surfaces as local
fixture-backed metadata. Plugins feed SEIS AI through declared lane profiles,
MCP tool names, source mirrors, and reviewable plans only; they do not silently
install themselves, expand permissions, read secrets, run live SSH, or deploy.
The activation matrix lives at
[`data/seis-ai-activation-matrix.json`](../../data/seis-ai-activation-matrix.json).
It records the single SEIS-Agent install surface, sub-agent activation map,
plugin lane feeds, SSH safe modes, and AI website feature coverage.
Installed AI collaboration evidence lives at
[`data/seis-installed-ai-collaboration.json`](../../data/seis-installed-ai-collaboration.json).
It records detected local AI helper CLIs, successful availability checks,
blocked auth states, the aborted Ollama local review attempt, and non-claim
boundaries.
The website feature fabric lives at
[`data/seis-ai-website-feature-fabric.json`](../../data/seis-ai-website-feature-fabric.json).
It maps the single-prompt AI website request to local UI modules, controlled
agent feeds, plugin feeds, SSH exposure, provider-key policy, and validation
signals across `apps/seis-ai-demo`, `apps/seis-demo-web`, `apps/seis-core`, and
`apps/web`.
The self-evolution contract lives at
[`data/seis-ai-self-evolution-contract.json`](../../data/seis-ai-self-evolution-contract.json).
It keeps self-analysis, self-improvement, knowledge expansion, autonomous
learning, agent evolution, plugin evolution, model orchestration, and memory
optimization human-supervised and contract-backed.
The FastAPI ecosystem API contract lives at
[`data/seis-ai-ecosystem-api-contract.json`](../../data/seis-ai-ecosystem-api-contract.json).
It exposes local `/api/v1` endpoints for health, ecosystem overview, agents,
plugins, websites, goals, memory, SSH, model connectors, self-evolution, and
knowledge graphs when the API requirements are installed.
The app exposes the same contract through the `Fabric` module and markdown
export, and the fabric validator checks those UI surface ids and exported
helpers.

## Run Locally

From the repository root:

```bash
python3 -m http.server 4177
```

Then open:

```text
http://localhost:4177/apps/seis-ai-demo/
```

This app intentionally stays in local demo mode. It does not request, store, or use provider API keys.

## Trusted Reference Intake

The Qwen reference folder supplied by the maintainer was used only as an idea
source for multi-agent execution, workflow nodes, provider readiness, local run
metrics, and knowledge presentation. Raw Qwen files, env examples, live provider
calls, payment/auth/database fragments, bash setup scripts, and browser API-key
storage were excluded.

The intake review lives at
[`docs/reviews/seis-ai-demo-qwen-intake-review.md`](../../docs/reviews/seis-ai-demo-qwen-intake-review.md).

## Work With The macOS App

Open both local surfaces together:

```bash
npm run dev:seis-ai-command-core
```

Or start each surface manually.

Start the SwiftUI app:

```bash
./script/build_and_run.sh --ai-demo
```

Keep the web demo open at:

```text
http://localhost:4177/apps/seis-ai-demo/
```

Use `Open in macOS` from the web composer or command palette. The browser sends
the current prompt, mode, prompt version, run notes, approval setting, redaction
setting, and autonomy level to the desktop app through:

```text
seisdemo://ai-command-core/run
```

The desktop app receives the handoff as a local deterministic run and records a
`Web handoff received` audit event. The bridge does not call model providers,
send credentials, use SSH, deploy infrastructure, or execute privileged actions.

## Release Check

Run the full desktop and web demo gate before opening or updating the release
candidate pull request:

```bash
npm run check:seis-ai-command-core
```

Run the local-only AI Core/web contract gate when Swift is not needed:

```bash
npm run check:seis-ai-local-integration
```

Run only the agent/plugin/SSH fabric contract:

```bash
npm run check:seis-ai-unified-integration-fabric
```

Run only the activation matrix contract:

```bash
npm run check:seis-ai-activation-matrix
```

Run only the installed AI collaboration contract:

```bash
npm run check:seis-installed-ai-collaboration
```

Run only the AI website feature fabric contract:

```bash
npm run check:seis-ai-website-feature-fabric
```

Run only the self-evolution contract:

```bash
npm run check:seis-ai-self-evolution
```

Run only the local FastAPI ecosystem API contract:

```bash
npm run check:seis-ai-ecosystem-api
```

Release boundaries and publish blockers are documented in
[`docs/deployment/seis-ai-command-core-release-readiness.md`](../../docs/deployment/seis-ai-command-core-release-readiness.md).
