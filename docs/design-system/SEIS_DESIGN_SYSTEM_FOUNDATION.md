# SEIS Design System Foundation

Date: 2026-06-19

SEIS needs a design system that supports Command Center, Platform OS, docs,
readiness dashboards, and future native/web apps. The system should feel calm,
premium, structured, intelligent, and trustworthy.

## Design Principles

- Calm density over decorative dashboards.
- Clear hierarchy over visual noise.
- Evidence-first status over dramatic metrics.
- Fast scanning for repeated operational use.
- Accessible interaction by default.
- Low-motion and reduced-motion support.
- Keyboard-first navigation where practical.
- Localization-ready labels, statuses, and empty states.

## Foundations

| Area | Requirement |
| --- | --- |
| Tokens | Color, type, spacing, radius, elevation, motion, focus, status, and chart tokens. |
| Typography | Compact operational scale, readable docs scale, clear status numerals. |
| Layout | Sidebar/nav, command palette, module pages, split panes, evidence drawers. |
| Components | Tables, status badges, cards, queues, tabs, filters, search, dialogs, banners. |
| States | Loading, empty, error, blocked, unknown, stale, degraded, approval needed, success. |
| Accessibility | WCAG 2.2 AA intent, visible focus, semantic landmarks, non-color indicators. |
| Motion | Subtle transitions only; `prefers-reduced-motion` respected. |
| Localization | Avoid fixed-width copy assumptions; make labels translatable. |

## Status Language

Use consistent platform status terms:

- Healthy.
- Warning.
- Blocked.
- Unknown.
- Stale.
- Not configured.
- Approval needed.
- Validation failed.
- Ready for review.

Avoid vague statuses such as "all good" or "complete" unless backed by evidence.

## Command Center UI Surfaces

| Surface | Design requirement |
| --- | --- |
| Dashboard | Dense but calm overview of blockers, health, queue, and latest evidence. |
| Repository Center | Tables and diffs for files, branches, PRs, validation, and risk. |
| Documentation Hub | Searchable document map with official/archive separation. |
| Approval Center | Clear risk labels, disabled actions, required evidence, and owner. |
| Evidence Locker | Timestamped records with source, command, result, and status. |
| Release Center | Checklist, dry-run status, blockers, rollback, and follow-up. |
| Settings Center | Environment, integrations, feature flags, and emergency stop. |

## Component Rules

- Do not nest cards inside cards.
- Do not use fake charts or fake status.
- Do not hide unknown states.
- Keep action buttons tied to real implemented actions or disabled with a clear
  reason.
- Use icons for compact tool actions and text for critical commands.
- Design tables for sorting, filtering, and evidence drill-down.

## First Implementation Milestone

Create a static Command Center design-system demo using fixture data:

- Module navigation.
- Status badge set.
- Queue table.
- Evidence record drawer.
- Approval request row.
- Empty/error/stale states.
- Keyboard focus path.

The demo must run without an LLM and without external services.
