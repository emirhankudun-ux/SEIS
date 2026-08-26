# Research Memory

Source-backed notes for model, dataset, citation, and technical reference
decisions (build order step 7 of the OpenAI-curated workbench).

## Rules

- Every note records a decision or reference question, the sources consulted,
  and the conclusion. No source, no note.
- Notes are immutable once a decision ships; corrections append, never rewrite.
- Notes that change SEIS behavior must link the matching decision record in
  `docs/decisions/`.
- File name format: `notes/YYYY-MM-DD-topic.md`.

## Plugin Route

Hugging Face, Zotero, Life Science Research, Scite, Deepnote — per the
workbench research row. Use the research plugins to gather sources; the note
itself always lands here.

## Index

| Note | Decision link |
| --- | --- |
| [`notes/2026-06-12-backend-state-reference.md`](./notes/2026-06-12-backend-state-reference.md) | `docs/decisions/backend-state-decision-record.md` |
| [`notes/2026-06-13-auth-jwt-reference.md`](./notes/2026-06-13-auth-jwt-reference.md) | `docs/decisions/auth-jwt-decision-record.md` |
| [`notes/2026-08-26-error-tracking-reference.md`](./notes/2026-08-26-error-tracking-reference.md) | `docs/decisions/error-tracking-decision-record.md` |
