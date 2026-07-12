---
name: seis-second-brain-review
description: Run bounded SEIS Second Brain review workflows across installed AI profiles, 13-agent assignments, five SEIS plugin lanes, browser-local review ledgers, and approval-gated Obsidian intake. Use when a task needs a safe review assignment, review queue, agent handoff, knowledge provenance check, or local Second Brain status without external execution.
---

# SEIS Second Brain Review

Use this skill to turn a SEIS task into a browser-local, human-confirmed
review record. Keep it as review context until an explicit approval grants a
specific external action.

## Workflow

1. Read the active Second Brain contract, product guide, and relevant local
   artifact paths before proposing a change.
2. Classify the work as a queue, human-selected assignment, agent ledger,
   plugin-lane handoff, local search result, or approval-gated Obsidian step.
3. Use the five plugin lanes as bounded review context:
   - `@seis`: governance, architecture, roadmap, and source-of-truth memory.
   - `@seis-cloud`: cloud readiness, SSH boundaries, rollback, and deployment gates.
   - `@seis-code`: scoped implementation, validation, and QA evidence.
   - `@seis-design`: UI/UX, accessibility, product feel, and visual QA.
   - `@seis-data`: schemas, provenance, deterministic records, and memory/RAG planning.
4. Map the task to one or more of the 13 plan-only agents and their Local
   Context Profiles. Do not treat a selected role as a running agent.
5. Record only browser-local Markdown/JSON evidence under
   `/home/seis/SecondBrain/09-review/` when an explicit human selection is
   needed. Preserve source provenance and false execution flags.
6. Keep Obsidian work metadata-only until explicit selection, preflight review,
   redaction policy, and human approval exist. Never scan host folders or copy
   private note bodies, paths, attachments, or `.obsidian` configuration.
7. Validate the changed surface and report real, local-demo, planned, blocked,
   and unverified states separately.

## Canonical Local Artifacts

- Queue: `/home/seis/SecondBrain/09-review/agent-review-queue.md` and `.json`
- Current assignment: `/home/seis/SecondBrain/09-review/agent-review-assignment.md` and `.json`
- Assignment ledger: `/home/seis/SecondBrain/09-review/agent-review-ledger.md` and `.json`
- Plugin review bundle: `/home/seis/SecondBrain/07-learning/plugin-review-bundle-latest.md`
- Read-only MCP context: `seis://brain/second-brain-system.json`

Treat these as local review references. Do not claim they were read, approved,
or executed unless the current task actually proves it.

## Execution Boundary

- Do not call providers, validate credentials, execute SSH, deploy, mutate
  GitHub, publish, or run autonomous writes from a review record.
- Require a named target, explicit human approval, and rollback owner before
  any approved external action.
- Never expose secrets or private vault content in a review artifact.

## Validation

Use the narrowest relevant checks:

```bash
npm run check:seis-second-brain
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain-browser-smoke
git diff --check
```

If Chrome is unavailable, report browser smoke as unavailable rather than
claiming runtime evidence passed.
