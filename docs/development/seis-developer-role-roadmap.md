# SEIS Developer Role Roadmap

This roadmap turns the common software-role list from the shared image into a SEIS-specific development map.

The image lists seven broad paths:

1. Frontend Developer
2. Backend Developer
3. Full-Stack Developer
4. DevOps Engineer
5. DBA / Database Administrator
6. AI Developer
7. Data Engineer

SEIS should treat these as connected capability lanes, not isolated job titles.

## Why this matters for SEIS

SEIS is trying to become an AI-native creative engineering operating layer. That requires more than one stack.

A serious SEIS contributor needs to understand how product surfaces, backend contracts, data flows, AI workflows, databases, deployment, GitHub review, and enterprise readiness fit together.

## Role map

### Frontend Developer

Image stack:

```text
HTML + CSS + JavaScript + React + Git
```

SEIS expansion:

- UI engineering
- design systems
- accessibility
- responsive product surfaces
- local demo truth labels
- motion boundaries

SEIS project direction:

```text
Create one SEIS route or product surface with clear local, mock, planned, disabled, and live state labels.
```

### Backend Developer

Image stack:

```text
Java / Python + SQL / MongoDB + APIs
```

SEIS expansion:

- API contracts
- service boundaries
- auth planning
- provider-safe routing
- data validation
- backend-only secrets

SEIS project direction:

```text
Define a backend contract that separates public demo data from live provider or private data access.
```

### Full-Stack Developer

Image stack:

```text
Frontend + Backend + Git + Deploy
```

SEIS expansion:

- vertical product slices
- rollback planning
- PR review
- release gates
- demo go/no-go evidence

SEIS project direction:

```text
Ship a small SEIS feature from data contract to interface documentation with a rollback path.
```

### DevOps Engineer

Image stack:

```text
Docker + Kubernetes + CI/CD + Linux + Cloud
```

SEIS expansion:

- local-first deployment plans
- CI checks
- dry-run automation
- cloud readiness
- SSH approval gates
- observability

SEIS project direction:

```text
Create a no-mutation deployment readiness plan before any live cloud action.
```

### DBA / Database Administrator

Image stack:

```text
SQL + Backup + Performance + Security + Database Administration
```

SEIS expansion:

- schema governance
- migration safety
- backup strategy
- performance budget
- privacy review
- least privilege

SEIS project direction:

```text
Write a data-store readiness contract with schema, backup, restore, privacy, and migration gates.
```

### AI Developer

Image stack:

```text
Prompt Engineering + AI APIs + LLM Integration + RAG
```

SEIS expansion:

- model router policy
- prompt governance
- RAG boundaries
- provider status labels
- evaluation
- human approval

SEIS project direction:

```text
Create a provider-neutral AI route decision that explains local, mock, planned, disabled, and live states without exposing keys.
```

### Data Engineer

Image stack:

```text
SQL + ETL + Python + Data Warehouse + Cloud
```

SEIS expansion:

- data contracts
- ETL dry runs
- warehouse modeling
- lineage
- quality checks
- privacy-aware analytics

SEIS project direction:

```text
Build a data pipeline plan that can be validated locally before any cloud or warehouse integration.
```

## Recommended SEIS learning sequence

1. Git and repository review basics
2. Frontend product surface literacy
3. Backend API and data contracts
4. Database safety and SQL fundamentals
5. Python automation and validation scripts
6. AI prompt and provider boundary governance
7. DevOps dry-run and CI/CD readiness
8. Full-stack vertical slice delivery
9. Enterprise readiness and claim evidence mapping

## SEIS execution style

Do not turn this roadmap into a passive course list.

Turn every lane into small reviewable work:

- one scoped issue
- one branch
- one evidence file
- one validation command
- one rollback note
- one PR summary

## Validation

Run:

```bash
python3 scripts/check-seis-developer-role-roadmap.py
```

The check validates that the roadmap data file, this document, and the seven role lanes stay aligned.
