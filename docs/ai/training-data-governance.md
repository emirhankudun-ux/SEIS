# Training Data Governance

Status: Future policy

Training data governance protects provenance, licensing, privacy, safety, and
evaluation integrity for future SEIS model work.

## Governance Controls

- provenance manifest
- license review
- consent review
- sensitive-data filter
- secret detection
- deduplication
- contamination checks
- train/validation/test split
- dataset versioning
- removal and redress path

## Separation Rules

- Training data, validation data, and benchmark data must be separated.
- Retrieval corpora are not automatically training data.
- Prompt examples are not automatically training data.
- Private or restricted materials must not be converted into embeddings or
  training records without approval.

## Audit

Every training data version needs an audit record describing sources, filters,
known limitations, and approval state.
