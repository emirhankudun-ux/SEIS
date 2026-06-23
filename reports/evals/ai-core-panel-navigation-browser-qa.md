# AI Core Panel Navigation Browser QA Evidence

Status: Browser-run AI Core panel navigation and Goals scorecard QA evidence

Surface: `apps/seis-core` AI Core view and Goals surface

Canonical validator phrase: Browser-run AI Core panel navigation QA evidence

Command:

```bash
npm run qa:seis-core:ai-core-panels
```

Browser-run artifact evidence gate:

```bash
npm run qa:seis-core:ai-core-evidence
```

Artifact root:

```text
reports/tmp/seis-core-ai-core-panel-navigation/
```

## Purpose

This evidence record documents browser-run AI Core panel navigation QA for the
Command Center. The QA starts from Dashboard, opens the Goals surface through
sidebar navigation, verifies Goal Evidence Scorecards from
`goalOperatingScorecards` and `goalEvidenceGates`, then opens AI Core through
sidebar navigation, the command palette, and global search. It verifies
fixture-backed Model Routes, Prompt Versions, Agent Tasks, Approvals,
Evaluation/Evidence, and Local Retrieval sections across desktop and mobile
viewports.

## Covered Scenarios

| Scenario | Viewport | Evidence |
| --- | ---: | --- |
| Desktop AI Core panel navigation | `1440x900` | DOM dump, JSON interaction report, manifest entry |
| Mobile AI Core panel navigation | `390x844` | DOM dump, JSON interaction report, manifest entry |

The browser reports verify the same interaction path on both viewports:

1. Start from Dashboard.
2. Open Goals through sidebar navigation and verify Goal Evidence Scorecards.
3. Open AI Core through sidebar navigation.
4. Return to Dashboard and open AI Core through the command palette.
5. Return to Dashboard and open AI Core through global search.
6. Verify the fixture-backed AI Core panel groups and Local Retrieval status.

## Evidence Requirements

Each browser run must verify:

- Command Center shell content renders.
- Goals sidebar navigation activates the Goals surface and nav item.
- Goal Evidence Scorecards render from `goalOperatingScorecards` and
  `goalEvidenceGates`.
- Goals scorecard counts and gate-chip counts match the fixture-derived
  expected values.
- Goals surface text preserves `current fixture slice only`, `required gate coverage`, and `not a complete program claim` language.
- AI Core sidebar navigation activates the AI Core view and nav item.
- Command palette navigation activates the AI Core view and nav item.
- Global search navigation activates the AI Core view and preserves search
  focus.
- Contract Summary, Safety Boundary, Model Routes, Prompt Versions, Agent
  Tasks, Approvals, Local Retrieval, and Evaluation/Evidence content render.
- Route, prompt, agent, approval, evaluation, evidence, and Local Retrieval
  sections contain fixture-backed cards or metadata.
- Local Retrieval default status remains `3 result cards, 2 no-content
  transcripts`.
- Safety boundary text confirms no live model execution, provider call, secret
  exposure, GitHub write, SSH, deployment, benchmark, or model-ownership claim.
- Goals scorecards are not full program completion, not live orchestration, not live provider health, not SSH execution, not deployment evidence, not model training evidence, not benchmark evidence, not checkpoint evidence, and not model-card evidence.
- No provider key marker, private key marker, live retrieval, embedding,
  persistent memory write, raw-content return, SSH, deployment, payment, or
  infrastructure mutation is introduced.

## Non-Claims

This is browser-run UI navigation QA evidence, not backend integration,
provider routing, live retrieval, model execution, pixel-baseline regression,
cross-browser certification, production deployment, benchmark evidence, or
model-training evidence. The generated artifacts under `reports/tmp/` are local
and intentionally ignored by Git.

## Validator Drift Hardening

Run the browser-run AI Core QA evidence drift check with:

```bash
npm run check:ai-core-browser-qa-evidence
```

This metadata-only check verifies that this committed evidence report, the
browser QA runner, fixture evaluation report, schema, Command Center validator,
README, evaluation strategy, five-year roadmap, and five-year review keep the
same browser-run AI Core QA evidence contract. When the check is run with
`--require-artifacts`, it also reads
`reports/tmp/seis-core-ai-core-panel-navigation/manifest.json` and the
desktop/mobile JSON reports created by `npm run qa:seis-core:ai-core-panels`,
then verifies scenario IDs, viewports, step order, AI Core panel counts, Goals
scorecard artifact counts, safety flags, artifact paths, and non-claims. It
does not call providers, run live retrieval, create embeddings, write memory,
return raw content, execute GitHub writes, SSH, deployment, payment, or
infrastructure mutation.

## Browser Requirement

The command uses a locally available Chrome/Chromium-compatible binary. If no
browser is found automatically, set:

```bash
SEIS_BROWSER_BIN=/path/to/chrome npm run qa:seis-core:ai-core-panels
```

For the CI/local split, browser availability rules, and failure handling, see
`docs/evals/ai-core-browser-evidence-gates.md`.

## Related Documents

- `docs/evals/ai-core-browser-evidence-gates.md`
- `apps/seis-core/README.md`
- `docs/evals/evaluation-strategy.md`
- `docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
