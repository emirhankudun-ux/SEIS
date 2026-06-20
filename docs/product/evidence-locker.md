# Evidence Locker

Status: Product foundation

Evidence Locker stores links to the evidence behind SEIS claims and decisions.

## Evidence Types

- check output
- generated report
- source file
- PR or issue
- audit event
- review document
- validation command
- model/eval run record
- approval decision

## Fields

- evidence id
- title
- source path or URL
- date
- owner or lane
- data class
- related object
- status
- limitations

## Rules

- Do not store secrets in evidence records.
- Redact sensitive output.
- Prefer links and summaries over copying large logs.
- Unknown evidence means the related claim is unknown, not ready.
