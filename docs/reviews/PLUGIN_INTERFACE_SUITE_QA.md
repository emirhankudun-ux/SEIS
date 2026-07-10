# Plugin Interface Suite QA

Date: 2026-06-23

## Purpose

Record the current browser QA evidence for the static plugin interface suite
covering `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and
`@seis-data`.

## Scope

This QA pass validates the static read-only interface, five-year horizon,
interactive year-by-year lane program, H1/H2 development cadence controls,
maturity signals, and lane-specific readiness gates.
It does not validate live plugin
execution, deployment, SSH, provider calls, repository writes, or production
release readiness.

## Environment

| Item | Value |
| --- | --- |
| Server | Local static server from repository root |
| URL | `http://127.0.0.1:4188/apps/web/seis-cockpit.html#plugin-interfaces` |
| Browser | System Google Chrome through Playwright |
| Desktop viewport | `1440 x 1100` |
| Mobile viewport | `390 x 920` |

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Plugin roadmap source loads | Passed | `content/development/seis-plugin-interface-roadmap.json` returned HTTP 200. |
| Capability map source loads | Passed | `content/development/plugin-skill-capability-map.json` returned HTTP 200. |
| Cinematic command deck loads | Passed | `content/lab/cinematic-engine.json` returned HTTP 200. |
| Quality console source loads | Passed | `content/lab/quality-console.json` returned HTTP 200. |
| Lane count | Passed | Status text reported 5 plugin lanes. |
| `@seis` tab | Passed | Selected state became `true`; 4 evidence links rendered. |
| `@seis-cloud` tab | Passed | Selected state became `true`; 3 evidence links rendered. |
| `@seis-code` tab | Passed | Selected state became `true`; 3 evidence links rendered. |
| `@seis-design` tab | Passed | Selected state became `true`; 3 evidence links rendered. |
| `@seis-data` tab | Passed | Selected state became `true`; 3 evidence links rendered. |
| Five-year horizon | Passed | 2026, 2027, 2028, 2029, and 2030 rendered. |
| Year controls | Passed | 2026, 2027, 2028, 2029, and 2030 controls selected the yearly program detail. |
| H1/H2 cadence controls | Passed | H1 and H2 controls selected the development cadence for the active year and lane. |
| Maturity signals | Passed | Five-year product-memory headline plus lane-year commitments, cadence loops, 5 readiness gates, and 0 live actions rendered. |
| Readiness gates | Passed | Each requested lane shows allowed local actions and blocked privileged actions without live-action controls. |
| Coverage metrics | Passed | 25 lane-year commitments, 2 cadence periods, 5 lane routines, 5 readiness gates, evidence links, and 0 live actions rendered. |
| Lane program rows | Passed | Program rows selected the matching `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data` lane. |
| Desktop overflow | Passed | No horizontal document overflow detected. |
| Mobile overflow | Passed | No horizontal document overflow detected. |
| JavaScript page errors | Passed | No page errors were reported. |
| Application data HTTP errors | Passed | No tracked application data request returned HTTP 4xx or 5xx. |
| Visual inspection | Passed | Desktop and mobile screenshots were inspected locally; the plugin suite is readable and responsive. |

## HTTP Notes

Previously missing optional fallback-backed records now have local static
sources:

- `content/development/plugin-skill-capability-map.json`
- `content/lab/cinematic-engine.json`
- `content/lab/quality-console.json`
- `data/plugin-command-center-2026-06-05.json`
- `data/seis-mcp-server-2026-06-07.json`

The browser favicon fallback has been cleaned up with `apps/web/favicon.ico`
and explicit favicon links on the static product pages. This resolves the
previous local `/favicon.ico` 404 note, but does not by itself prove release
readiness.

## PR Handoff Notes

This QA note is ready to travel as a narrow stacked review on top of the open
SEIS Desktop OS product branch. The intended stack relationship is:

| Item | Value |
| --- | --- |
| Parent PR | `#47` |
| Parent base | `seis/product-experience-suite` |
| Parent head | `codex/product-experience-desktop-os` |
| Handoff branch | `codex/plugin-interface-handoff-20260623` |
| Handoff scope | QA evidence and review context for the five requested plugin interfaces. |

The handoff PR should remain documentation-only unless the plugin interface
contract, static data sources, or validation script changes during review.
It must not add live GitHub writes, SSH actions, provider calls, deployment
actions, credentials, or browser-stored secrets.

## Validation Commands

```bash
npm run check:plugin-interface-roadmap
npm run check:data-schema-registry
node --check apps/web/app.js
jq empty content/development/seis-plugin-interface-roadmap.json content/development/plugin-skill-capability-map.json content/lab/cinematic-engine.json content/lab/quality-console.json
```

## Next Safe Action

Keep this QA note current when the plugin interface layout, data source,
five-year horizon, or development-program controls change. Refresh browser
evidence for maturity signals, readiness gates, and H1/H2 cadence controls
before claiming release readiness.
