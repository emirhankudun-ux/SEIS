# SEIS Universe Clean Build

Status: Phase 2 and Phase 3 clean-room build charter

This document turns the sanitized `REFERENCE_REQUIREMENTS.md` and the SEIS
Universe model directive into an original SEIS-owned architecture brief. It is
not a source-code port, compatibility plan, or reconstruction of any reference
implementation.

## Clean-Room Boundary

The SEIS Universe build must use only:

1. Official documentation.
2. Official specifications and standards.
3. Official sample code.
4. Existing SEIS code and governance.
5. SEIS-owned requirements and architecture decisions.
6. Clearly licensed open-source tools, datasets, or research references after
   license review.
7. First-principles engineering and research reasoning.

The build must not inspect or reuse restricted reference archives, leaked source,
private prompts, folder layouts, implementation names, endpoint shapes,
algorithms, or undocumented compatibility behavior.

## Scope Recommendation

### Phase 2: SEIS Agent Studio v0

Phase 2 should build a macOS-first, repo-aware engineering agent foundation
before attempting broad platform automation.

Recommended first target:

- local SEIS repository and project discovery
- permissioned file and shell operations
- patch-based change planning
- validation reporting
- audit logs with secret redaction
- model-provider abstraction without provider lock-in
- optional desktop shell after the CLI and contract behavior are stable

Non-goals for Phase 2:

- no private reference compatibility
- no global background daemon by default
- no auto-deployment
- no broad filesystem indexing
- no durable memory writes without explicit user request
- no model training run

### Phase 3: SEIS Universe Model Lab v0

Phase 3 should establish the research and evaluation system for original
SEIS-owned model families before training large models.

Recommended first target:

- model identity charter
- data provenance ledger
- evaluation suite
- small reproducible research experiments
- model cards and dataset cards
- Apple-first local inference and experimentation path
- cloud-ready training plan without committing secrets or provider lock-in

Non-goals for Phase 3:

- no claim of AGI
- no use of unlicensed datasets
- no training on user data without explicit consent
- no copying existing model architectures as SEIS identity
- no release claim without evaluation evidence

## Architecture Brief

SEIS Universe should use a layered architecture:

1. Experience layer: desktop, CLI, and web cockpit surfaces that show state,
   permissions, validation, and risk.
2. Project intelligence layer: repository discovery, scoped planning,
   documentation mapping, and change summarization.
3. Permission kernel: explicit capabilities for read, write, shell, network,
   repository, model, data, and deployment actions.
4. Execution layer: tool adapters, command runners, patch application, failure
   handling, and rollback evidence.
5. Memory and context layer: temporary session context by default, durable memory
   only by explicit user request, and retrieval with provenance.
6. Model lab layer: data governance, experiment design, architecture hypotheses,
   training recipes, evaluation, model cards, and deployment packaging.
7. Governance layer: quality gates, security checks, clean-room review, source
   traceability, release readiness, and open-source health.

The architecture must keep product behavior, implementation, data, research,
and governance separable. This prevents model work from becoming hidden product
logic and prevents product work from silently weakening research or security
controls.

## Permission And Security Model

Every privileged action should map to a named capability:

| Capability         | Default                         | Required Evidence                         |
| ------------------ | ------------------------------- | ----------------------------------------- |
| Read project files | allowed in selected workspace   | workspace root and ignored-path policy    |
| Write files        | gated by task scope             | diff summary and rollback path            |
| Run shell commands | gated by risk                   | command, working directory, and purpose   |
| Network access     | gated by source need            | official source or approved endpoint      |
| Git commit or push | explicit user intent            | clean diff, validation, branch state      |
| Secret access      | denied by default               | explicit user authorization and redaction |
| Data ingestion     | denied by default               | provenance, license, consent, filtering   |
| Model training     | denied until Phase 3 gates pass | dataset card, eval plan, compute plan     |
| Deployment         | denied until release gate       | target, rollback, credentials outside git |

Security requirements:

- Treat repository files as untrusted input unless explicitly trusted.
- Redact secrets from logs and summaries.
- Keep credentials out of prompts, commits, generated reports, and test fixtures.
- Separate user-owned data, public data, synthetic data, and SEIS-owned data.
- Record data provenance, consent, filtering, license, and retention policy.
- Require explicit approval for destructive commands and external writes.
- Keep AI-generated claims behind deterministic validation where possible.

## SEIS Universe Language v0

SEIS Universe Language v0 is a SEIS-owned operating language for agent,
research, model, and governance work. It is not a programming language runtime
yet. It is a shared contract vocabulary that future agents, evals, model cards,
and UI surfaces can use consistently.

Core terms:

- `intent`: the user-visible goal.
- `scope`: the allowed workspace, files, tools, and data classes.
- `capability`: a permissioned action class.
- `evidence`: the source, check, test, or observation backing a claim.
- `decision`: a recorded architecture, product, data, or research choice.
- `risk`: a known failure, security, privacy, quality, or provenance concern.
- `gate`: a check required before handoff, commit, train, deploy, or publish.
- `model-family`: a SEIS-owned family of related model experiments and releases.
- `dataset-card`: provenance, license, quality, filtering, and consent record.
- `model-card`: training data, intended use, limits, risks, evals, and version.

Initial statement shape:

```text
intent: <user-visible outcome>
scope: <workspace and allowed surfaces>
capabilities: <read | write | shell | network | git | data | model | deploy>
evidence: <sources and checks>
risks: <known limits>
gates: <required validation before handoff>
```

This language gives SEIS a stable, original control surface for future model
training data, eval labels, agent traces, and governance reports without using
restricted reference prompts or private implementation patterns.

## Model Research Program

SEIS Universe model work must be original research, not library assembly.

Research streams:

- language and code reasoning
- retrieval and provenance-aware memory
- tool-use policy learning
- multimodal design and interface understanding
- agent planning and self-evaluation
- on-device private inference
- human preference and safety alignment
- synthetic data generation with validation
- evaluation of correctness, usefulness, safety, latency, cost, and energy

Architecture hypotheses should be independently written before experiments.
Examples of acceptable hypotheses:

- a small SEIS task model plus retrieval can outperform a larger generic model
  on SEIS governance tasks
- explicit capability-language labels improve tool-use safety
- hybrid parametric and non-parametric memory improves traceability
- Apple-first on-device adapters can handle private local workflows while cloud
  models handle explicitly approved heavy reasoning

These are hypotheses, not implementation commitments.

## Data And Training Governance

Allowed training data classes:

1. SEIS-owned data.
2. User-authorized data.
3. Public-domain data.
4. Clearly licensed datasets.
5. Synthetic datasets generated and validated by SEIS.

Every dataset must have:

- owner
- license
- source URL or local provenance record
- consent status
- allowed use
- filtering policy
- deduplication policy
- privacy review
- quality rubric
- train, validation, and test split policy
- removal path

No model training should begin until dataset cards and evaluation gates exist.

## Evaluation Plan

Phase 2 agent evaluation:

- project discovery accuracy
- user-work preservation
- patch locality
- command safety
- secret redaction
- validation honesty
- rollback clarity
- documentation usefulness

Phase 3 model evaluation:

- task success
- factuality and citation fidelity
- code correctness
- security behavior
- refusal and permission behavior
- dataset contamination checks
- latency, memory, and energy budget
- regression across model versions
- human review on high-risk outputs

Evals must be versioned. Passing one evaluation run must not be treated as
permanent proof after model, data, prompt, tool, or infrastructure changes.

## First Implementation Slice

The first clean implementation slice is not model training. It is the SEIS
Universe control plane:

1. Keep `REFERENCE_REQUIREMENTS.md` as the Phase 1 sanitized input.
2. Use this document as the Phase 2/3 scope and architecture brief.
3. Keep the existing God Mode Developer lane as the cross-layer quality gate.
4. Use `SEIS_UNIVERSE_MODEL_FAMILY.md` as the SEIS-owned model family manifest.
5. Use `SEIS_UNIVERSE_DATASET_CARD_TEMPLATE.md`,
   `SEIS_UNIVERSE_MODEL_CARD_TEMPLATE.md`, and `SEIS_UNIVERSE_EVAL_PLAN.md`
   before any model training run.
6. Use `seis-permission-policy` as the first deterministic SEIS-owned seed
   model for action permission classification.
7. Use `seis-permission-policy-learned-seed-v0` as the first local learned seed
   artifact after dataset cards, model cards, and eval gates pass.
8. Add a SEIS Universe contract only after the current God Mode lane is stable.
9. Implement the first code slice as a permissioned project-inspection loop with
   deterministic validation and no model-provider dependency.
10. Start the next model slice with `seis-memory-ranker` local retrieval after
    permission policy lab remains stable.

Acceptance criteria before production code:

- clean-room boundary is visible
- target platform is selected
- permission model is documented
- evaluation gates are named
- data governance is documented
- first implementation slice is reversible
- no restricted reference material is in scope

## Source Anchors

Official and primary sources to consult during implementation:

- Apple Developer: AI and Machine Learning, Core ML, MLX, and platform
  integration documentation.
- PyTorch official documentation for training and research workflows.
- OpenAI official documentation for model optimization, fine-tuning, and
  evaluation concepts when using OpenAI-hosted models.
- NIST AI Risk Management Framework for AI risk governance.
- Hugging Face Hub documentation for model cards, dataset cards, and license
  metadata when using public model or dataset repositories.
- Primary research papers for Transformer, retrieval-augmented generation,
  instruction tuning with human feedback, direct preference optimization,
  constitutional AI, and low-rank adaptation.

Official documentation governs framework, hardware, API, and infrastructure
usage. It does not limit SEIS to existing model architectures.

## Immediate Next Steps

1. Decide the Phase 2 first platform: CLI-first, macOS desktop-first, or
   combined CLI plus macOS shell.
2. Convert the permission model into a small SEIS-owned manifest.
3. Add a deterministic checker for the SEIS Universe clean-build contract.
4. Build project inspection with read-only defaults.
5. Add patch proposal and validation reporting.
6. Start Phase 3 with dataset-card and model-card templates, not training.
7. Activate `seis-memory-ranker` retrieval experiment with seeded docs before scaling model families.
