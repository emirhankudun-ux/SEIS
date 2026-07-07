# SEIS Developer Role Issue Pack

This issue pack turns the developer role roadmap into practical GitHub issue packages.

The goal is to help a human contributor, Codex, Claude Code, or another supervised agent pick a small role-aligned task without drifting into vague mega-work.

## Issue package rule

Every issue should include:

- role lane
- goal
- deliverables
- acceptance criteria
- validation command
- rollback note
- risk level

## Seven starter issue packages

### 1. Frontend surface task

Role:

```text
frontend-developer
```

Goal:

```text
Review one SEIS product surface for state labels, accessibility, and responsive expectations.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
```

### 2. Backend contract task

Role:

```text
backend-developer
```

Goal:

```text
Draft one backend or API contract with input, output, error, security, and rollback boundaries.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
```

### 3. Full-stack slice task

Role:

```text
full-stack-developer
```

Goal:

```text
Plan one small SEIS vertical slice connecting UI, API or data, validation, and rollback.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
python3 scripts/check-seis-developer-role-milestones.py
```

### 4. DevOps readiness task

Role:

```text
devops-engineer
```

Goal:

```text
Create a no-mutation readiness plan for CI, cloud, SSH, deployment, or observability.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-milestones.py
```

### 5. Database safety task

Role:

```text
database-administrator
```

Goal:

```text
Draft schema, backup, restore, migration, performance, privacy, and least-privilege notes.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
```

### 6. AI route decision task

Role:

```text
ai-developer
```

Goal:

```text
Write a provider-neutral AI route decision with prompt, RAG, provider, fallback, and approval boundaries.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
```

### 7. Data pipeline contract task

Role:

```text
data-engineer
```

Goal:

```text
Draft a local-first data pipeline contract with source, transform, quality, lineage, privacy, and warehouse assumptions.
```

Validation:

```bash
python3 scripts/check-seis-developer-role-milestones.py
```

## Source of truth

The structured data lives in:

```text
data/development/seis-developer-role-issue-pack.json
```

Validate the issue pack with:

```bash
python3 scripts/check-seis-developer-role-issue-pack.py
```
