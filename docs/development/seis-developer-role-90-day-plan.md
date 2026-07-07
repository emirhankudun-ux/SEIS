# SEIS Developer Role 90-Day Plan

This plan turns the SEIS developer role roadmap into a practical 90-day execution path.

It is not a generic course list. It is a project-driven plan for building SEIS capability across frontend, backend, full-stack, DevOps, database, AI, and data engineering lanes.

## Month 1: foundation and literacy

Goal: understand the repo, the product identity, and the truth-state model.

### Week 1

Focus:

- Git basics
- README and architecture map
- local, mock, planned, disabled, and live state labels
- how PRs explain change, validation, and rollback

Output:

```text
one scoped roadmap issue
one short role selection note
one validation command run
```

### Week 2

Focus:

- frontend surface literacy
- backend contract basics
- database safety basics
- AI provider boundary basics

Output:

```text
one product surface review note
one API or data contract sketch
one provider-boundary note
```

## Month 2: role-specific outputs

Goal: produce small artifacts for each major role lane.

### Week 3-4

Frontend output:

```text
state-label and accessibility review for one SEIS surface
```

Backend output:

```text
API contract with inputs, outputs, errors, and rollback notes
```

Database output:

```text
schema, backup, restore, privacy, and migration checklist
```

AI output:

```text
prompt governance or route decision note with provider-safe boundaries
```

### Week 5-6

DevOps output:

```text
no-mutation deployment readiness plan
```

Data engineering output:

```text
ETL and lineage plan that can be validated locally before cloud use
```

Full-stack output:

```text
thin vertical slice plan joining UI, API, data, AI, validation, and rollback
```

## Month 3: integration and enterprise readiness

Goal: connect the role lanes into a coherent SEIS contribution model.

### Week 7-8

Build one reviewable feature slice plan:

- product surface
- API or data contract
- database safety note
- AI boundary note
- validation command
- rollback plan

### Week 9-10

Add enterprise readiness mapping:

- which claim is supported
- which evidence exists
- which gaps remain
- what cannot be claimed yet

### Week 11-12

Prepare reviewer handoff:

- PR summary
- validation commands
- changed files
- risks
- rollback notes
- next decision

## Role balance rule

Do not over-focus on one lane.

SEIS needs balanced growth across:

- product experience
- backend contracts
- data safety
- AI governance
- DevOps readiness
- database reliability
- enterprise evidence

## Validation

Run:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
python3 scripts/check-seis-developer-role-milestones.py
```
