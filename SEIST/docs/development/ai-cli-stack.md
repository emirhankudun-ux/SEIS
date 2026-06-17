# AI CLI Stack

This workspace supports a multi-agent terminal stack through a single router.

## Router

```bash
npm run ai -- list
npm run ai -- auto "quick repo patch"
npm run ai -- auto "quick repo patch" :: --help
npm run ai -- codex
npm run ai -- claude
npm run ai -- gemini
npm run ai -- ollama
npm run ai -- kimi
npm run ai -- aider
npm run ai -- interpreter
```

`auto` mode uses `scripts/ai-routing-policy.cjs`.

Current routing intent:

- `codex`: default generalist for repository quality, governance, release, accessibility, SEO, and architecture work.
- `aider`: small existing-file patches, refactors, and diff-oriented edits.
- `gemini`: browser-led research, source lookup, and documentation comparison.
- `ollama`: explicitly local, offline, or privacy-first drafting.
- `interpreter`: dataset, CSV, JSON transform, and log/trace analysis.
- `claude`: narrative, UX copy, naming, and strategy memo shaping.
- `kimi`: translation, localization, and multilingual surface work.

## Health Check

```bash
npm run check:ai-stack
```

## Environment

Copy `.env.example` to `.env` and fill API keys as needed:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `OLLAMA_HOST` (defaults to `http://127.0.0.1:11434`)

## Ollama Runtime

Start the local daemon if needed:

```bash
open -a Ollama --args hidden
```
