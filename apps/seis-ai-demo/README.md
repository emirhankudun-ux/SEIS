# SEIS AI Command Core

SEIS AI Command Core is a local, deterministic demo application for the SEIS AI
operating layer. It demonstrates the product workflow without requiring provider
credentials or making live model calls.

## What It Demonstrates

- AI request composer and generated implementation plan
- Provider-neutral model router scoring
- Supervised agent runtime queue
- Versioned prompt behavior notes
- Knowledge and evidence references
- Evaluation score strip
- Human approval gate
- Audit timeline and local JSON export
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

## Release Check

Run the full desktop and web demo gate before opening or updating the release
candidate pull request:

```bash
npm run check:seis-ai-command-core
```

Release boundaries and publish blockers are documented in
[`docs/deployment/seis-ai-command-core-release-readiness.md`](../../docs/deployment/seis-ai-command-core-release-readiness.md).
