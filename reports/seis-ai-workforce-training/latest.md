# SEIS AI Workforce Training Run

Generated: 2026-06-30T20:24:01.544Z

## Boundary

- Mode: local-deterministic-seed-training
- Live provider calls: false
- Credential read: false
- Cloud fine-tuning: false
- Dataset download: false
- Runtime authority granted: false

## Installed AI Workforce

- Installed routes: codex, seis-agent, qwen, ollama, opencode, hermes, goose, open-design
- Disabled or missing-key routes: claude, gemini
- Contribution mode: candidate-only-until-codex-validation

## Local Seed Models

| Model | Training cases | Eval passed | Artifact |
| --- | ---: | ---: | --- |
| permission-policy | 13 | 9/9 | packages/seis-ai/models/permission-policy-seed-v0.json |
| memory-ranker | 5 | 3/3 | packages/seis-ai/models/memory-ranker-seed-v0.json |
| eval-critic | 9 | 6/6 | packages/seis-ai/models/eval-critic-seed-v0.json |
| agent-router | 13 | 11/11 | packages/seis-ai/models/agent-router-seed-v0.json |

## Benchmark

- Artifact: seis-model-benchmark-suite-v0
- Passed: 20/20
- Failed: 0

## Promotion Policy

- Policy: seis-model-promotion-policy-v0
- Lab-ready models: 4/4
- Benchmark-ready models: 4/4
- Runtime authority count: 0
- Production-blocked models: 4/4

## Human Approval Needed

- live provider prompt calls
- cloud fine-tuning
- external dataset download
- paid benchmark run
- SSH or deployment
- model publication or runtime authority
