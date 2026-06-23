# Benchmark Integrity

Status: Foundation policy

Benchmark integrity prevents inflated or fabricated model and AI-system claims.

## Rules

- Do not claim benchmark performance unless the benchmark was actually run.
- Keep benchmark prompts, datasets, versions, and scoring methods recorded.
- Separate training, tuning, validation, and benchmark data.
- Check for contamination before claiming generalization.
- Report limitations and failed cases.
- Do not compare against providers or open models without matching conditions.

## Record Format

Each benchmark result should include:

- benchmark id and version
- target model or AI Core version
- dataset source and license
- task type
- metric
- run command or harness
- date
- hardware or provider profile
- result summary
- limitations
- reviewer

## Current State

No benchmark result is claimed by this foundation document.
