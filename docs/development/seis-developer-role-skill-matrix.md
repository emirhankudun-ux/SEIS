# SEIS Developer Role Skill Matrix

This matrix turns the developer role roadmap into measurable growth levels.

The goal is to help contributors and supervised agents understand what they can safely do at each stage without turning SEIS into chaotic mega-work.

## Levels

### Level 1: Foundation

The contributor understands the role vocabulary and can review existing SEIS docs or surfaces without changing production behavior.

### Level 2: Contributor

The contributor can create a small artifact, contract, checklist, or issue package with validation and rollback notes.

### Level 3: Integrator

The contributor can connect one role lane to at least one adjacent lane while preserving security, truth labels, and scope control.

### Level 4: Review-ready

The contributor can prepare a PR-ready package with evidence, validation, risks, rollback, and next decision.

## Role progression

### Frontend Developer

Core skills:

```text
UI state labels, accessibility, responsive review, design-system literacy, Git review
```

Review-ready output:

```text
Prepare a product-surface PR with validation and rollback.
```

### Backend Developer

Core skills:

```text
API contracts, Python or Java service thinking, SQL boundaries, error states, secret safety
```

Review-ready output:

```text
Prepare a backend-contract PR with validation and security notes.
```

### Full-Stack Developer

Core skills:

```text
vertical slices, Git workflow, release gates, validation commands, rollback planning
```

Review-ready output:

```text
Prepare a small full-stack slice PR package.
```

### DevOps Engineer

Core skills:

```text
CI/CD, dry-run planning, Linux basics, cloud readiness, SSH approval gates
```

Review-ready output:

```text
Prepare a DevOps readiness PR with no live mutation.
```

### DBA / Database Administrator

Core skills:

```text
SQL, backup planning, restore planning, performance notes, privacy and least privilege
```

Review-ready output:

```text
Prepare a data-store readiness PR with validation notes.
```

### AI Developer

Core skills:

```text
prompt governance, AI API boundaries, LLM route decisions, RAG safety, evaluation basics
```

Review-ready output:

```text
Prepare an AI route PR with claim-safety and validation notes.
```

### Data Engineer

Core skills:

```text
SQL, ETL, Python validation, warehouse modeling, lineage and quality
```

Review-ready output:

```text
Prepare a data-pipeline PR package with validation and rollback.
```

## Adjacent-lane rule

A contributor becomes more useful when they can connect their role to adjacent lanes.

Examples:

- Frontend connects to AI by showing clear local, mock, planned, disabled, and live states.
- Backend connects to database work through schema and privacy boundaries.
- DevOps connects to full-stack work through dry-run validation and rollback notes.
- AI connects to data engineering through RAG, lineage, and private-data exclusion.

## Validation

Run:

```bash
python3 scripts/check-seis-developer-role-skill-matrix.py
```
