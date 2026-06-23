# Local Retrieval Browser Visual QA Evidence

Status: Browser-run visual QA evidence

Surface: `apps/seis-core` Local Retrieval toolbar

Command:

```bash
npm run qa:seis-core:local-retrieval:visual
```

Artifact root:

```text
reports/tmp/seis-core-local-retrieval-visual/
```

## Purpose

This evidence record documents the repeatable local browser QA path for the
Command Center Local Retrieval toolbar. The command serves `apps/seis-core`,
seeds the browser-safe local state for the AI Core view, captures screenshots,
dumps rendered DOM, and verifies required fixture-backed text for desktop and
mobile scenarios.

## Covered Scenarios

| Scenario | Interaction Viewport | Capture Viewport | Evidence |
| --- | ---: | ---: | --- |
| Desktop default Local Retrieval | `1440x900` | `1440x8200` | Screenshot, DOM dump, manifest entry |
| Desktop empty-state filter | `1440x900` | `1440x8200` | Screenshot, DOM dump, manifest entry |
| Mobile credential boundary filter | `390x844` | `390x8200` | Screenshot, DOM dump, manifest entry |

The taller capture viewport is intentional. The Command Center AI Core surface
is long, and the visual evidence must include the Local Retrieval toolbar and
fixture cards without using a hash-scroll path that is unstable in Chrome CLI.
The browser width still exercises the desktop or mobile layout breakpoints.

## Evidence Requirements

Each browser run must verify:

- Nonblank Command Center shell content.
- The Local Retrieval toolbar is reachable in the AI Core view.
- Query, source-class, transcript-state, reset, and status controls render.
- Fixture-backed retrieval panels render with expected metadata.
- Empty-state behavior renders for narrowed filters.
- Safety boundary chips such as `raw:false` and `provider:false` remain visible.
- No provider key marker, private key marker, live retrieval, embedding,
  persistent memory write, raw-content return, SSH, deployment, payment, or
  infrastructure mutation is introduced.

## Non-Claims

This is browser-run visual QA evidence, not a pixel-baseline regression suite.
It does not perform screenshot diffing, establish per-pixel tolerances, certify
cross-browser coverage, create live retrieval, call model providers, create
embeddings, write persistent memory, return raw content, or prove provider
readiness.

## Browser Requirement

The command uses a locally available Chrome/Chromium-compatible binary. If no
browser is found automatically, set:

```bash
SEIS_BROWSER_BIN=/path/to/chrome npm run qa:seis-core:local-retrieval:visual
```

Do not commit generated screenshots or DOM dumps. They live under `reports/tmp/`
and are intentionally ignored by Git.

## Related Documents

- `apps/seis-core/README.md`
- `docs/evals/evaluation-strategy.md`
- `docs/reviews/SEIS_5_YEAR_DEVELOPMENT_PROGRAM_REVIEW.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
