# SEIS Public Plugin Selection Guide

Generated: 2026-07-22

## Purpose

Use this guide to choose a public SEIS Repo capability without browsing hundreds of source packages. It is a local, read-only decision guide, not an installer or a claim of provider, deployment, network, or write access.

## Start here

1. Start with `seis-ai-agent@seis-repo`, the canonical public SEIS entry point.
2. Pick one of the 6 starter paths below, or the closest of 19 journeys.
3. Select at most one optional bundle for the current task; every bundle contains no more than 15 retained source capabilities.
4. Treat a continuation bundle as a later, separately scoped task rather than a bulk installation.

## Optional terminal plan

The normal terminal plan remains only `seis-ai-agent@seis-repo`. To review the first optional bundle for one known journey without installing anything, use:

```bash
npm run install:seis-ai-agent -- --journey security
```

Only after reviewing that exact plan and receiving explicit human approval may an operator add `--apply`:

```bash
npm run install:seis-ai-agent -- --apply --journey security
```

The installer accepts only one known journey, derives only its validated first optional bundle, and rejects arbitrary bundle IDs, bulk selection, and continuation bundles.

## Fast starter paths

| Need | Start with | Optional bundle | Size |
| --- | --- | --- | ---: |
| AI, models, data, knowledge, context, and route planning. | AI and Data | `seis-application-bundle-01@seis-repo` | 14 |
| Product design, accessibility, governance, and delivery operations. | Product Design and Operations | `seis-application-bundle-02@seis-repo` | 9 |
| Security posture, supply-chain checks, permissions, and public safety. | Security | `seis-application-bundle-03@seis-repo` | 11 |
| Implementation, tests, release readiness, repository health, and developer workflow. | Developer Engineering | `seis-application-bundle-04@seis-repo` | 14 |
| Creative production, media, and bounded design-related topic work. | Creative Production | `seis-topic-bundle-08@seis-repo` | 9 |
| Software-engineering topics when a focused technical learning or planning lane is needed. | Software Engineering | `seis-topic-bundle-25@seis-repo` | 15 |

## All journeys

| Journey | Family | First optional bundle | Later bundles | Source capabilities |
| --- | --- | --- | --- | ---: |
| AI and Data | application | `seis-application-bundle-01@seis-repo` | None | 14 |
| Product Design and Operations | application | `seis-application-bundle-02@seis-repo` | None | 9 |
| Security | application | `seis-application-bundle-03@seis-repo` | None | 11 |
| Developer Engineering | application | `seis-application-bundle-04@seis-repo` | `seis-application-bundle-05@seis-repo`, `seis-application-bundle-06@seis-repo` | 41 |
| Artificial Intelligence | topic | `seis-topic-bundle-01@seis-repo` | `seis-topic-bundle-02@seis-repo`, `seis-topic-bundle-03@seis-repo` | 35 |
| Automation | topic | `seis-topic-bundle-04@seis-repo` | `seis-topic-bundle-05@seis-repo` | 17 |
| Cloud Computing | topic | `seis-topic-bundle-06@seis-repo` | `seis-topic-bundle-07@seis-repo` | 25 |
| Creative Production | topic | `seis-topic-bundle-08@seis-repo` | `seis-topic-bundle-09@seis-repo` | 17 |
| Cybersecurity | topic | `seis-topic-bundle-10@seis-repo` | `seis-topic-bundle-11@seis-repo` | 21 |
| Data | topic | `seis-topic-bundle-12@seis-repo` | `seis-topic-bundle-13@seis-repo` | 20 |
| Design | topic | `seis-topic-bundle-14@seis-repo` | `seis-topic-bundle-15@seis-repo` | 21 |
| Desktop | topic | `seis-topic-bundle-16@seis-repo` | None | 11 |
| ELENI-NEFERI | topic | `seis-topic-bundle-17@seis-repo` | None | 15 |
| Graphics | topic | `seis-topic-bundle-18@seis-repo` | None | 13 |
| Knowledge | topic | `seis-topic-bundle-19@seis-repo` | `seis-topic-bundle-20@seis-repo` | 25 |
| PANTECHNOEPISTEMONOESIS | topic | `seis-topic-bundle-21@seis-repo` | None | 6 |
| Project Management | topic | `seis-topic-bundle-22@seis-repo` | `seis-topic-bundle-23@seis-repo` | 17 |
| SEIS | topic | `seis-topic-bundle-24@seis-repo` | None | 13 |
| Software Engineering | topic | `seis-topic-bundle-25@seis-repo` | `seis-topic-bundle-26@seis-repo`, `seis-topic-bundle-27@seis-repo` | 44 |

## Safety boundary

- Do not bulk-install bundles or auto-install their members.
- Retained source packages stay in the public repository; this guide does not delete or merge them.
- Writes, deployment, credentials, external publishing, and destructive actions require explicit human approval.

## Validation

```bash
npm run check:seis-public-plugin-bundles
npm run check:seis-ai-agent
npm run check:seis-repo-marketplace
```
