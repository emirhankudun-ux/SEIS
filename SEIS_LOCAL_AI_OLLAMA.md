# SEIS Local AI / Ollama Profile

## Purpose

SEIS keeps local AI and model-helper workflows optional and bounded. This profile
defines how `Ollama` and local model experiments are represented in repository
documentation and Second Brain continuity without implying SEIS owns, trains, or
deploys foundation models.

## What this profile covers

- Markdown drafting and project-context summarization.
- Context-pack and onboarding text scaffolding.
- PR-safe knowledge retrieval from local repository data.
- Rehearsal drafts for long-running documentation and architecture notes.
- Optional review prep for local-only experiments.

## What it does not cover

- Production-grade coding assistants.
- Live provider routing or cloud inference.
- Data extraction from private vaults outside the repository.
- Claiming trained model ownership for SEIS core.
- Hard requirements for a local model install in the default run.

## Local setup notes

- The repo-level demo should remain usable without any local model installed.
- Local AI usage is optional and documented as `local-safe`/`planned`/`draft`.
- Prompts used for local experiments should avoid secrets, tokens, keys,
  credentials, private notes, private host names, and personal data.

## Runtime boundaries

- `SEIS_LOCAL_AI_OLLAMA.md` is documentation only unless a separate local
  command policy authorizes execution.
- No public artifact should claim production inference through local models.
- No model install or benchmark claim should be posted as implemented capability
  without explicit evidence.

## Continuation protocol for long generated outputs

If a long run is interrupted, stop at a clear boundary and append:

```text
CONTINUE_FROM: <section or file>
```

Resume with:

```text
DEVAM
```

Only continue from the last checkpoint and keep output state in `draft` mode until
reviewed.

## Review policy

- Local AI outputs should be treated as draft until reviewed by a human.
- Repository decisions require either validated checks, trusted scripts, or explicit
  manual review gates.
- No secrets are permitted in prompts or generated Markdown snapshots.

## Related references

- [LOCAL_AI_SETUP.md](docs/LOCAL_AI_SETUP.md)
- [SEIS_INSTALLED_AI_TOOLS.md](SEIS_INSTALLED_AI_TOOLS.md)
- [SEIS_SECOND_BRAIN.md](SEIS_SECOND_BRAIN.md)
