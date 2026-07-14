# ECO-GOAL-0007 Prompt Inventory

Observation date: 2026-07-14
Parent branch commit: `78e190586d9a27dcdc4e26290f69951ab85b3935`

## Purpose

Record the immutable pre-implementation evidence used to scope
`ECO-GOAL-0007`. This dated audit does not claim continuous monitoring and does
not replace current repository inspection.

## Findings at the parent commit

The parent version of `docs/ai/prompt-engine.md` described the Prompt Engine as
documented but not implemented. It recorded no versioned prompt registry, no
prompt-pack schema or fixtures, no prompt budget counter, and no prompt
regression suite. Repository inventory also found no existing deterministic
five-million-character Goal Tracking corpus compiler.

The repository did contain a compatibility Master Prompt governance system,
schema-v2 ecosystem Goal YAML, legacy SEIS Goal Tracking JSON, an operational
tracker, Omega records, roadmap queues, and generated Command Center views.
Those systems have distinct authorities and lifecycle contracts; the new pack
must route between them rather than clone or merge their state.

## Reproduction

```bash
git show 78e19058:docs/ai/prompt-engine.md
git ls-tree -r --name-only 78e19058 -- prompts scripts schemas
```

The first command supplies immutable parent-commit evidence. The second supports
the bounded path inventory without reading private repositories or live provider
configuration.

## Decision

Create a separate schema-v2 Goal and a compact, reviewed prompt source pack.
Generate the five-million-code-point corpus only under ignored `build/`; commit
the source contract, compiler, tests, manifest schema, and golden hashes. Root
`AGENTS.md` remains authoritative, and no live model, credential, deployment, or
single-request context claim is introduced.
