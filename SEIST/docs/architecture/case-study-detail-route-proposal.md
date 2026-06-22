# Case Study Detail Route Proposal

This proposal defines the first case study detail route without committing SEIS to a framework. The content model remains portable JSON, and the route can begin as static HTML before any Next.js, Astro, CMS, or backend decision.

## Route Shape

| Mode | Pattern |
| --- | --- |
| Static | `case-studies/{id}.html` |
| Future framework | `/case-studies/[id]` |
| Initial case study | `seis-foundation` |

## Layout Contract

| Region | Purpose |
| --- | --- |
| Hero | Title, summary, experience mode, and canonical theme. |
| Narrative | Context, challenge, response, and next step as readable editorial sections. |
| Proof | Quality proof commands, accessibility notes, and rollback constraints. |
| Related | Future links to artwork narratives or additional case studies. |

## Accessibility Contract

- Detail pages keep skip links and semantic landmarks.
- Motion is decorative and removable.
- Primary narrative remains real text.
- Future related cards are keyboard reachable.

## Blocked Until

- Case study content quality review passes.
- Static route acceptance criteria are documented.
- Framework decision remains deferred or explicitly approved.

## Rollback Path

Keep detail content in portable JSON and remove generated route files without changing the model.
