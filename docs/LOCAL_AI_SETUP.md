# SEIS Local AI Setup

SEIS treats local AI as an optional helper lane. Local models can support
private drafts, offline summaries, prompt exploration, and repository planning,
but they are not the canonical source of truth and they do not make live
provider or model-route claims.

## Current Status

The public repository documents local AI as metadata and workflow guidance:

- Codex / ChatGPT remains the primary writer for repo automation.
- Ollama is an optional local runtime candidate.
- Local model output is draft material until reviewed against repository
  evidence.

No local AI setup is required for the no-key demo path.

## Safe Uses

Use local AI for:

- documentation drafts
- context-pack summarization
- repo navigation notes
- prompt experiments
- architecture alternatives
- private/offline scratch analysis

Do not use local AI output as final evidence without checking the files,
commands, tests, or rendered behavior it references.

## Optional Ollama Path

If Ollama is already installed and you want to inspect local runtime status:

```bash
npm run ai -- ollama list
```

If `npm` is unavailable, use the underlying local tool directly outside the repo
and keep any downloaded model files outside Git.

Do not commit model weights, local model caches, private prompts, chat logs,
desktop app state, or private note contents.

## Single-Writer Rule

Keep exactly one tool in writer mode at a time. Codex is the default writer for
repo edits in this workflow. Local AI tools may propose, summarize, or review
sanitized context, but they should not overwrite active work.

Before switching tools:

```bash
git status --short
```

Then summarize active changes and preserve unrelated edits.

## Credential Boundary

Never paste provider keys, SSH private keys, GitHub credentials, private vault
notes, `.env` contents, personal sensitive data, or real host credentials into
local or cloud AI tools.

Local does not automatically mean safe. Review what the tool logs, stores,
syncs, or indexes before giving it sensitive context.

## Validation

```bash
npm run check:ai-workforce-assignments
npm run check:seis-brain-context-packs
npm run check:seis-public-readiness-docs
```

These checks validate public-safe assignment and context-pack boundaries. They
do not prove that Ollama models are downloaded or that any local assistant is a
product AI integration in the current environment.

## Related Docs

- [`docs/development/local-ai-workbench.md`](./development/local-ai-workbench.md)
- [`docs/development/agents/ai-workforce-assignments.md`](./development/agents/ai-workforce-assignments.md)
- [`docs/ai/seis-ai-core.md`](./ai/seis-ai-core.md)
