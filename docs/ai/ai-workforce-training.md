# SEIS AI Workforce Training

## Purpose

Define how the installed AI workforce can improve SEIS AI without turning the
project into an unsafe provider-key collector or an unsupported foundation-model
claim.

In this repository, installed AI workforce training means supervised feedback,
synthetic training-case proposals, deterministic local seed-model rebuilds, and
promotion-gate evidence. It is not cloud fine-tuning, external dataset scraping,
or production model training.

Machine-readable source:
`content/development/seis-ai-workforce-training-plan.json`.

Language Model Intake Registry:
`content/development/seis-language-model-intake-registry.json`.

Validation:

```bash
npm run check:seis-ai-workforce-training
npm run check:seis-language-model-intake
npm run report:seis-local-ai-runtime-matrix
npm run check:seis-local-ai-runtime-matrix
npm run report:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-public-ai-readiness
npm run check:seis-ai-github-readiness-chain
npm run report:seis-ai-github-pr-package
npm run check:seis-ai-github-pr-package
npm run automation:seis-ai-workforce-training
```

## Current Status

| Area | Status | Evidence | Boundary | Next Safe Action |
| --- | --- | --- | --- | --- |
| Installed route inventory | Observed | `npm run ai -- list` on 2026-06-23 | Route readiness only; no provider prompt or credential verification. | Re-run before any secondary assistant handoff. |
| Workforce assignments | Documented | `content/development/ai-workforce-assignments.json` | Codex remains the only writer by default. | Keep secondary assistants in reviewer/draft mode. |
| Training control plane | Active local contract | `content/development/seis-ai-workforce-training-plan.json` | No live provider calls, SSH, deployment, dataset download, or cloud fine-tuning. | Run the local validator and seed training runner. |
| Language model intake | Active metadata-only contract | `content/development/seis-language-model-intake-registry.json` | This is not bulk installation and grants no download, fine-tune, training, runtime, or AGI authority. | Review one specific model family at a time with license, hardware, model-card, dataset-card, benchmark, and approval gates. |
| Seed models | Local deterministic lab | `packages/seis-ai/data/*`, `packages/seis-ai/models/*` | Runtime authority remains false. | Rebuild artifacts and promotion policy after accepted case updates. |
| Live providers | Disabled or missing key unless verified | `content/development/seis-ai-core-provider-registry.json` | Missing Key is not Error, and no browser secrets are allowed. | Add server-only adapters only after typed validation exists. |

## Training Loop

1. Codex sanitizes the objective, affected paths, excluded context, risk class,
   and validation target.
2. Installed assistants such as Qwen, Ollama, OpenCode, Hermes, Goose, and
   OpenDesign may provide bounded review, contradiction, runbook, or design
   candidate material from sanitized context.
3. Codex checks the Language Model Intake Registry before any local model
   experiment. The registry is metadata-only; it is not bulk installation,
   not checkpoint download, and not training authorization.
4. Codex treats every assistant output as untrusted until it is checked against
   repo evidence.
5. Accepted material becomes SEIS-owned synthetic cases only when it excludes
   secrets and user-private data.
6. Local deterministic builders rebuild the permission policy, memory ranker,
   eval critic, and agent router seed artifacts.
7. Benchmark and promotion gates decide whether the artifacts remain lab-ready,
   need benchmark expansion, or stay blocked.
8. Human approval is required before live provider calls, cloud fine-tuning,
   paid benchmarks, dataset downloads, SSH, deployment, push, merge, or model
   publication.

## Language Model Intake Registry

The registry answers the request to evaluate broad model families without
blindly installing everything. It tracks Llama, Qwen, Gemma, Mistral, DeepSeek,
OpenAI open-weight candidates, embeddings/rerankers, and code-specialist
families as metadata-only candidates.

This is retrieval first and model-install second:

- build a clean SEIS knowledge graph and retrieval layer before fine-tuning;
- review license, checkpoint provenance, checksum, disk, RAM/GPU, and safety
  boundaries before any model install;
- keep 16GB machines on metadata, deterministic seed models, and explicitly
  approved small/quantized experiments only;
- keep 70B, 150B, 300B+, 405B, 512B, and larger models blocked until hardware,
  budget, evaluation, observability, rollback, and approval evidence exists.

## Local AI Runtime Matrix

16GB and larger machines use a separate local runtime matrix:

```bash
npm run report:seis-local-ai-runtime-matrix
npm run check:seis-local-ai-runtime-matrix
```

Generated outputs:

- `content/development/seis-local-ai-runtime-matrix.json`
- `reports/seis-model-scaling/seis-local-ai-runtime-matrix.json`
- `reports/seis-model-scaling/seis-local-ai-runtime-matrix.md`
- `docs/ai/seis-local-ai-runtime-matrix.md`

The matrix currently approves only Local Demo, deterministic seed-model
artifacts, and metadata-first planning. Model downloads, Ollama pulls, local
inference, embedding runtime, SFT, LoRA, full fine-tune, foundation
pretraining, HF Jobs, cloud GPU, SSH, GitHub push/merge, route promotion, 20B
runtime claims, 512B readiness claims, fully knowledgeable model claims, and
AGI claims remain false.

Future real model install or training requires exact model id, revision,
license, checksum, hardware profile, dataset card, model card, benchmark or
dry-run evidence, secret scan, rollback plan, and human approval. The operating
model is not "download every model"; it is "queue every model family through a
safe evidence gate".

## AGI GitHub Fresh-Clone Readiness Plan

The fresh-clone readiness plan turns the GitHub everyone-ready gap into a
no-key Local Demo checklist. It is the safe path for broad public review before
any claim that SEIS is easy for every GitHub user to run.

```bash
npm run report:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-public-ai-readiness
npm run check:seis-ai-github-readiness-chain
npm run report:seis-ai-github-pr-package
npm run check:seis-ai-github-pr-package
```

Generated outputs:

- `content/development/seis-agi-github-fresh-clone-readiness-plan.json`
- `reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json`
- `reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.md`
- `docs/ai/seis-agi-github-fresh-clone-readiness-plan.md`

This plan does not prove AGI, install models, run inference, train, fine-tune,
call providers, provision cloud/GPU resources, execute SSH, push, merge, deploy,
or approve release. It only defines the evidence required before the Local Demo
path can be described as fresh-clone verified.

## AI GitHub PR Package

The AI GitHub PR package narrows the current AI readiness work into a reviewable
PR slice. It exists because the active worktree may contain unrelated Desktop,
product-demo, platform, SSH, or public-demo changes that must not be mixed into
an AI-only review.

```bash
npm run report:seis-ai-github-pr-package
npm run check:seis-ai-github-pr-package
```

Generated outputs:

- `content/development/seis-ai-github-pr-package.json`
- `docs/ai/seis-ai-github-pr-package.md`
- `reports/seis-model-scaling/seis-ai-github-pr-package.md`

The package keeps push and merge status false until selected AI files are staged
in a clean branch, the AI GitHub readiness chain passes, and human review
approves the PR.

## Model Targets

| Model | What it learns | Training command | Runtime authority |
| --- | --- | --- | --- |
| Permission policy | Whether an action is allow, gate, approval_required, or deny. | `npm run automation:seis-permission-policy-model` | False |
| Memory ranker | Which governance or evidence record best matches a query. | `npm run automation:seis-memory-ranker-model` | False |
| Eval critic | Whether a review package should pass, revise, or block. | `npm run automation:seis-eval-critic-model` | False |
| Agent router | Which SEIS lane and validation gate should handle an intent. | `npm run automation:seis-agent-router-model` | False |

The combined runner is:

```bash
npm run automation:seis-ai-workforce-training
```

It rebuilds local seed artifacts and writes a redacted report under
`reports/seis-ai-workforce-training/`. It does not call Qwen, Ollama, Claude,
Gemini, OpenAI, or any cloud provider.

## Safety Rules

- No secrets, `.env` values, private keys, cookies, or tokens may enter prompts,
  datasets, reports, logs, screenshots, localStorage, IndexedDB, or commits.
- Core SEIS must remain usable with zero cloud-provider keys.
- Missing provider keys disable only those providers; they do not block the
  local demo or seed training lab.
- Secondary AI output is candidate evidence, not source of truth.
- Dataset cases must remain SEIS-owned synthetic examples with no user-private
  data.
- Runtime authority remains false until independent benchmarks, observability,
  rollback, human approval, and security review pass.

## Mock vs Real

| Surface | Status |
| --- | --- |
| Route inventory | Real local command output from `npm run ai -- list`. |
| Seed-model rebuild | Real deterministic local artifact generation. |
| Secondary assistant review | Planned/supervised; disabled until a sanitized handoff is explicitly run. |
| Live provider training | Not performed. |
| Foundation-model ownership | Not claimed. |

## Related Documents

- [SEIS AI Core](seis-ai-core.md)
- [Model Router](model-router.md)
- [Agent Runtime](agent-runtime.md)
- [Prompt Engine](prompt-engine.md)
- [AI Workforce Assignments](../development/agents/ai-workforce-assignments.md)
- [Security Policy](../../SECURITY.md)
