# SEIS Checkpoint Governance

## Current Status

SEIS has no accepted 20B, 70B, 150B, 300B+, or 512B training checkpoint.

The source launch contract is
`content/development/seis-frontier-training-launch-plan.json`. It records zero
completed training runs and zero accepted checkpoints. A template, seed-model
artifact, provider route, adapter plan, dry-run, or green validator must never
be presented as a frontier checkpoint.

## Required Checkpoint Record

Every future checkpoint must have an immutable record containing:

- checkpoint identifier and cryptographic digest
- model architecture and tokenizer identifiers
- exact parameter count and, for MoE, activated parameter count
- parent checkpoint and complete lineage
- run manifest identifier
- dataset manifest and license/provenance references
- framework, dependency lock, container identity, and hardware topology
- training step, token count, optimizer state, precision, and random seeds
- creation time, producer, storage class, and retention period
- integrity verification time and verifier
- evaluation, safety, privacy, and contamination report references
- model-card status and known limitations
- route eligibility, publication status, and approval record
- rollback, quarantine, incident, and deletion owner

The record must contain references, hashes, and redacted metadata only. It must
not contain API keys, provider tokens, SSH private keys, passwords, private
dataset rows, or unrestricted personal data.

## Lifecycle

1. `unverified`: checkpoint bytes exist but integrity and lineage are not
   accepted. It cannot be routed or published.
2. `quarantined`: integrity, provenance, safety, privacy, or contamination
   evidence failed or is missing. It cannot be promoted.
3. `verified-lab`: digest, lineage, run manifest, and bounded lab evaluation
   are accepted. Runtime authority remains false.
4. `evaluation-candidate`: independent evaluation is authorized and recorded.
5. `promotion-candidate`: model card, safety, privacy, rollback, and operational
   evidence are complete. Human promotion approval is still required.
6. `approved-private` or `approved-public`: an explicit approval record defines
   the exact scope, route, audience, license, and rollback owner.
7. `revoked`: routing and publication are disabled while evidence is preserved
   for audit.

No automated agent can move a checkpoint between lifecycle stages by itself.

## Storage And Recovery

Future training backends must define durable checkpoint persistence before a
run starts. Ephemeral job storage is not an accepted checkpoint location.
Checkpoint cadence, atomic writes, distributed-state format, restore test,
retention, cost ceiling, cancellation behavior, and partial-write quarantine
must be part of the run manifest.

At least one restore drill must succeed before a checkpoint becomes an
evaluation candidate. A restore drill is not a quality or safety evaluation.

## Publication Boundary

Checkpoint publication requires a separate approval after training. The
approval must name the exact digest, repository, visibility, license, model
card, dataset disclosures, safety evaluation, limitations, and rollback path.

SEIS must not:

- fabricate a checkpoint or model card
- publish a checkpoint whose lineage or rights are unclear
- rename third-party weights or adapters as a SEIS foundation model
- claim a training run without matching logs and run manifest
- claim benchmark or AGI performance without an executed, contamination-aware
  evaluation report
- expose private data or credentials in checkpoint metadata

## Validation

```bash
npm run check:seis-frontier-training-launch-plan
npm run check:seis-512b-apex-model-program
```

These commands validate governance references and non-claim boundaries only.
They do not validate checkpoint bytes because no accepted frontier checkpoint
exists.
