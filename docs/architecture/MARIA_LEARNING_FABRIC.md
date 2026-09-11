# MARIA Learning Fabric — evidence contracts v1

## Scope and status

This slice implements **learning-admission and plugin-evaluation metadata policies** in the existing Python runtime. It is not a trained model, a trainer, a dataset exporter, a marketplace importer, or a live integration bridge. No weights were trained and no third-party plugin was installed, invoked, copied, or published by this slice.

The product direction is a multi-model MARIA with an approved knowledge base, optional training of eligible target models, and reusable tool workflows for ChatGPT, Codex, and the native SEIS host. These are complementary mechanisms, not a claim that every model or plugin can be absorbed into one set of weights.

The existing `ModelSpec`, `CapabilityRegistry`, work runners, and permission-gated MCP execution paths remain unchanged. Use the new types through `maria_runtime.learning_fabric`.

## Four distinct mechanisms

| Mechanism | Effect | Does not imply |
| --- | --- | --- |
| Runtime model routing | Select an available provider/model for a task | That model can be fine-tuned |
| Knowledge retrieval | Supply approved current reference material at request time | Model weights have changed |
| Fine-tuning or distillation | A future explicit trainer updates an eligible target using reviewed examples | Teacher weights or all teacher capabilities were transferred |
| Plugin/skill execution | A supported host uses instructions plus authenticated tools | Training grants accounts, tools, licenses, or permissions |

A multi-teacher workflow must track each teacher's exact origin and output provenance. Combining outputs from several teachers is not permission to use them in training, nor evidence that the target improved. Do not use hidden chain-of-thought, private prompts, credentials, unreviewed account data, or automatic conversation dumps as a training corpus. Approved final outputs and explicit task examples are the intended future input.

## Implemented learning admission

`ModelIdentity.from_spec()` preserves provider and model identity and requires the caller to supply the reviewed model revision. It deliberately ignores inference availability as evidence of training support.

`LearningSource` records a source identifier, a SHA-256 content revision, an origin identifier, and a kind: project material, model output, skill documentation, or tool trace. It contains no actual content.

`LearningApproval` is bound to that complete source record, one purpose, one project, and one exact target model revision. Rights, privacy, and quality reviews are independent and default to false. Revoked and expired approvals are rejected. Knowledge-use approval cannot be reused for fine-tuning. Model-output fine-tuning requires the explicitly named distillation purpose and its corresponding review.

`TrainingSupport` separately records reviewed support for the target and purpose. A model that is available for chat is not automatically considered trainable. Missing, unverified, expired, mismatched, or purpose-incompatible support blocks training admission.

`LearningAdmissionPolicy.assess()` returns fixed diagnostic categories. An accepted result means **admitted for planning only**. Its `training_started` property is always false. It does not export content, allocate compute, select a paid provider, or start a job.

## Implemented plugin/skill evidence

`PluginSkillBinding` records plugin and skill identifiers, the host (`chatgpt`, `codex`, or `seis`), skill version/content digest, exact tool name, capability, and a separate tool version. Plugin versions are not assumed to equal backend tool versions.

`SkillEvaluation` binds a nonempty test result and report reference to the exact binding, target model revision, project, and expiry. It is supplied by a trusted evaluator; this module does not run an evaluation suite itself.

`PluginSkillPolicy.assess()` checks the existing host-scoped `CapabilityRegistry`. Missing, degraded, disabled, incompatible, or authentication-required tools do not yield verified readiness. Tool version, capability, and project constraints are preserved. Evaluation evidence is invalidated by a different model, project, host, skill revision, or skill version, and by expiry or failed cases.

A verified result means only that supplied evaluation evidence matches the current inputs. It does not mean weight-trained. Its `execution_authorized` property is always false. Actual work must still use the existing runner and fresh permission checks. A ChatGPT connection is not silently transferred into an independent SEIS runtime.

## Trust boundary and non-goals

These are typed, immutable, in-memory contracts, not an authorization service or a Python sandbox. Callers are trusted host code. Do not deserialize model/plugin output directly into approval, support, or evaluation records.

The host must verify the real content digest, immutable model revision, review authenticity, source terms, consent, and current tool registry. Reference strings are not cryptographic proof. This module does not interpret licenses, authenticate reviewers, scan for private data, maintain a revocation database, or measure evaluation quality. `repr` omission is diagnostic hygiene, not a guarantee that arbitrary serialization is safe.

Importing or constructing these records performs no network access, file access, subprocess work, provider call, installation, or training. There are no credentials, raw prompts, or account payloads in the fixtures.

The native SwiftUI presentation bridge remains a separate follow-up; Python supports the existing AI runtime rather than replacing the Apple-first application architecture.

## Next implementation sequence

1. Host-side discovery/import of reviewed model, skill, and tool metadata with explicit surface support; do not pre-approve the whole directory.
2. A private, content-digest-bound dataset builder: source review, secret/personal-data checks, deduplication, provenance, project isolation, and separate training/validation/held-out test partitions. No public training-data commit by default.
3. A small approved curriculum covering MARIA's communication style, SEIS workflows, design/UI/UX, code review, and tool selection/error recovery. Unreal and Blender execution requires actual compatible integrations, not generic browser-game skills.
4. One concrete eligible target and a bounded trainer adapter after model/data rights, hardware limits, and any spending are approved. Large-scale training is not assumed to fit a 24 GB Mac merely because inference does.
5. Real evaluation against an unchanged baseline, including correct tool selection, parameter validity, permission handling, version changes, recovery, and output quality. Promotion requires evidence; retain rollback artifacts and never auto-deploy an unverified checkpoint.

## Verification

The focused suite is `python3 test/maria-learning-fabric.test.py`. Its 22 tests first failed because the implementation module was absent, then passed after implementation in an isolated local extraction. The extracted existing `models.py` and `registry.py` were checked against their Git blob hashes before testing. This local result alone is not a full repository result.

`.github/workflows/maria-learning-fabric.yml` runs the focused suite and every existing `test/maria-*.test.py` script on the actual PR checkout. Hosted job status must be read before claiming hosted success. All model/teacher/plugin names and evidence in the new tests are fixtures, not real training or live service verification.

## Official references checked 2026-09-11

- OpenAI plugin architecture and the universal directory: https://developers.openai.com/plugins
- ChatGPT/Codex host support and plugin components: https://learn.chatgpt.com/docs/plugins
- Skills: https://learn.chatgpt.com/docs/build-skills
- Optimization and evaluation: https://developers.openai.com/api/docs/guides/model-optimization
- Fine-tuning availability: https://developers.openai.com/api/docs/guides/supervised-fine-tuning

Provider capabilities and service availability must be rechecked at execution time. No provider name in this document grants training rights or implies an active training API.
