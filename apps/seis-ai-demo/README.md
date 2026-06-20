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
- Provider readiness cards with browser secret entry explicitly blocked
- Local run metrics for plan steps, active agents, provider paths, risk, evals, and prompt size
- Versioned prompt behavior notes
- Knowledge and evidence references
- Evaluation score strip
- Human approval gate
- Audit timeline, local JSON export, and markdown plan export
- Local persistence with `localStorage`

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

Release boundaries and publish blockers are documented in
[`docs/deployment/seis-ai-command-core-release-readiness.md`](../../docs/deployment/seis-ai-command-core-release-readiness.md).
