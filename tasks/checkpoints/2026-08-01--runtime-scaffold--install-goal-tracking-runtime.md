# Checkpoint: RUNTIME-SCAFFOLD-2026-08-01 — Install goal-tracking runtime scaffold

## Objective

**Goal ID / Title:** `RUNTIME-SCAFFOLD-2026-08-01` — Install the Universal
Goal-Tracking Runtime governance scaffold and establish the first canonical
goal-tracking checkpoint for the `seis` repository.

This is a session-scoped goal (no formal `ECO-GOAL-####` ledger entry exists
for it in `goals/active/`). It was selected via the runtime's own Section 3
fallback rule: canonical audit tooling (`npm run seis:check` and
`./scripts/polyglot-check.sh`) reported nothing actionable to fix, so the
bounded work package for this run became installing the scaffold itself.

## Completed work

- Read `CLAUDE.md` (repo root) and `docs/governance/seis-supreme-v12-constitution.md`
  in full to confirm this document would not duplicate or conflict with
  existing governance (constitution defers to root `AGENTS.md`; this runtime
  in turn defers to both).
- Confirmed `tasks/` did not previously exist in the repository.
- Confirmed no open PR exists for branch `claude/goal-tracking-runtime-uyu622`
  (`mcp__github__list_pull_requests`, head filter, `state=all` → `[]`).
- Ran `npm run seis:check` — all 5 quality gates passed cleanly (see Tests
  section below).
- Ran `./scripts/polyglot-check.sh` — all runnable lanes passed; unavailable
  language runtimes correctly reported as `SKIP`, not `FAIL`.
- Determined, per the runtime's own rules, that nothing was genuinely broken
  or actionable in either audit surface, and that inventing a fix would
  violate the "never fabricate a goal" rule.
- Authored `docs/governance/goal-tracking-runtime.md` (v2.0.0), the full
  15-section Universal Goal-Tracking Runtime Prompt, as a complementary
  operational layer alongside the existing constitution and the existing
  `goals/` ledger system (referenced explicitly, not duplicated).
- Authored `tasks/checkpoints/README.md`, defining the checkpoint contract
  (required fields, naming convention, rules).
- Authored this checkpoint file as the first canonical checkpoint under that
  contract.

## Files changed

- `docs/governance/goal-tracking-runtime.md` — new file. Full runtime
  governance document (15 sections: core mission; non-negotiable rules;
  goal resolution; active-run initialization; status taxonomy; evidence
  classes; 10-step operating loop; approval boundaries; long-project
  continuity; context protection; checkpoint contract; work-package
  discipline; reporting rules; run summary template; final covenant).
- `tasks/checkpoints/README.md` — new file. Checkpoint contract: required
  fields, naming convention (`<date>--<goal-id>--<description>.md`), and
  rules for writing checkpoints.
- `tasks/checkpoints/2026-08-01--runtime-scaffold--install-goal-tracking-runtime.md`
  — new file (this checkpoint).

No existing files were modified. No files outside `docs/governance/` and
`tasks/` were touched.

## Tests executed + results

```
$ npm run seis:check
SEIS web audit — /home/user/SEIS/apps/web

[PASS] i18n      5 locales × 217 keys, 0 referenced
[PASS] seo       15/15 checks
[PASS] contract  10 selectors vs 22 ids / 56 classes
[PASS] drawings  0 referenced, 20 on disk (4.4 MB)
[PASS] style     58 css classes, 20 custom props
[PASS] perf      72 KB total (html:23 css:20 js:29)
        info: 1 images without loading="lazy"
[PASS] a11y      imgs:ok inputs:ok buttons:ok
[PASS] security  blank-links:ok js-hrefs:ok http:ok

All checks passed.
```

```
$ ./scripts/polyglot-check.sh
[... 20 language lanes reported PASS, 12 reported SKIP (language runtime
not installed in this sandbox: sql/sqlite3, lua5.4, tclsh, Rscript, runghc,
ocaml, nim, elixir, groovy, kotlinc-jvm, guile, racket, sbcl, swipl, csi) ...]
── polyglot summary ──────────────────────
  20 x [PASS], 1 x [SKIP] (sql), 12 x [SKIP] (missing runtimes)
──────────────────────────────────────────
All polyglot checks passed.
```

Both commands were run in full in this session; no output above is carried
over from a prior run or assumed.

## Unresolved issues

None blocking. Non-blocking informational notes surfaced by the audits
(not failures, not addressed by this checkpoint since they are out of this
work package's bounded scope):

- `seis:check` perf: 1 image without `loading="lazy"` (info-level, not a
  gate failure).
- polyglot `i18n-stats`/`jq-translations`: a handful of locale values are
  identical to the `tr` source string or empty (info-level, may be
  intentional short strings — flagged as advisory by the tools themselves).
- polyglot `sed-css-vars`: 5 declared-but-unused CSS custom properties
  (`--bg-soft`, `--faint`, `--nvidia`, `--surface`, `--surface-strong`) —
  reported as dead-code advisory, not a failure.
- 12 polyglot lanes skipped because their language runtimes are not
  installed in this sandbox (not a repository problem — the tools
  themselves exist and self-test; only the interpreter is absent here).

None of the above are part of this work package; they are candidates for a
future, separately-scoped work package if a maintainer decides they're
worth acting on.

## Decisions

- **Placed the new document under `docs/governance/` rather than replacing
  or editing the existing constitution file**, because the task explicitly
  required a complementary layer, and `seis-supreme-v12-constitution.md`
  already states its own authority ordering (defers to root `AGENTS.md`).
  Editing it would have risked conflicting with that ordering.
- **Did not touch the existing `goals/` YAML ledger or
  `seis-goals-evidence-ledger.md`**, even though they are closely related,
  because the task scope was specifically the new runtime document plus
  the checkpoint scaffold — expanding into the existing goal ledger would
  have exceeded the bounded work package. The new runtime document
  explicitly references the existing ledger as the preferred canonical
  goal source when one exists.
- **Treated "both audits pass cleanly" as a genuine, evidenced outcome**
  rather than searching for a marginal issue to fix, per the task's own
  instruction: "If genuinely nothing is broken, say so explicitly... and
  treat installing the scaffold itself as the bounded work package."

## Risks

- Low. This checkpoint only adds two new documentation files and this
  checkpoint file itself; nothing executable changed, so there is no
  runtime/behavioral risk to the portfolio site or any tooling.
- The new `docs/governance/goal-tracking-runtime.md` could, over time,
  drift out of sync with the existing constitution or goal ledger if those
  are updated independently — mitigated by the document's own "amend
  deliberately, with a decision record" closing rule.

## Rollback notes

To fully revert this checkpoint's changes:

```bash
git rm docs/governance/goal-tracking-runtime.md
git rm -r tasks/
```

Or, if already committed, `git revert <commit-sha>` on the commit that
introduced these three files. No other files were modified, so rollback is
isolated and has no ripple effects elsewhere in the repository.

## Continuation instructions

A future session picking this up should:

1. Read `docs/governance/goal-tracking-runtime.md` in full before doing any
   further goal-tracking-runtime work.
2. Check `goals/active/*.yaml` for a real, assigned goal before defaulting
   to the scaffold-only fallback again — this checkpoint's fallback path
   should not become the default behavior for future runs.
3. Re-run `npm run seis:check` and `./scripts/polyglot-check.sh` fresh —
   do not assume this checkpoint's results still hold; repository state
   changes over time.
4. If continuing goal-tracking-runtime work specifically, this is the first
   checkpoint in its lineage — later checkpoints for this same thread
   should reference this file by path.

## Next safe action

Open (or verify) the draft PR for branch `claude/goal-tracking-runtime-uyu622`
targeting the repository's default branch, and, once reviewed, merge it
through normal PR review — no further unreviewed action is needed on this
work package.
