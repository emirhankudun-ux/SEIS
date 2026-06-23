# Local Retrieval Browser Visual And Interaction QA Evidence

Status: Browser-run visual and interaction QA evidence

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
dumps rendered DOM, performs browser-run query/source-class/transcript-state
and reset interactions, and verifies required fixture-backed text, focus
behavior, status text, and empty-state behavior for desktop and mobile
scenarios.

## Covered Scenarios

| Scenario | Interaction Viewport | Capture Viewport | Evidence |
| --- | ---: | ---: | --- |
| Desktop default Local Retrieval | `1440x900` | `1440x8200` | Screenshot, DOM dump, manifest entry |
| Desktop empty-state filter | `1440x900` | `1440x8200` | Screenshot, DOM dump, manifest entry |
| Mobile credential boundary filter | `390x844` | `390x8200` | Screenshot, DOM dump, manifest entry |
| Desktop Local Retrieval interaction flow | `1440x900` | n/a | DOM dump, JSON interaction report, manifest entry |
| Mobile Local Retrieval interaction flow | `390x844` | n/a | DOM dump, JSON interaction report, manifest entry |

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
- Browser-run interactions type into the query field, change source-class and
  transcript-state filters, click reset, and verify restored default state.
- Focus remains on the active retrieval control during query, select, and reset
  interactions.
- The filter status live region updates for populated, narrowed, empty,
  credential-boundary, and reset states.
- Safety boundary chips such as `raw:false` and `provider:false` remain visible.
- No provider key marker, private key marker, live retrieval, embedding,
  persistent memory write, raw-content return, SSH, deployment, payment, or
  infrastructure mutation is introduced.

## Non-Claims

This is browser-run visual and interaction QA evidence, not a pixel-baseline
regression suite. It does not perform screenshot diffing, establish per-pixel
tolerances, certify cross-browser coverage, create live retrieval, call model
providers, create embeddings, write persistent memory, return raw content, or
prove provider readiness.

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
