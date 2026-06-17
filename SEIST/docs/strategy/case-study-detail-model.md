# Case Study Detail Model

This model lets SEIS grow editorial case studies before choosing a production framework. The goal is to understand the content structure first, then decide whether static HTML, Astro, Next.js, or another app layer is worth the added complexity.

## Required Shape

Each case study needs:

- Stable `id`.
- Human title and lifecycle status.
- Summary.
- Narrative blocks for context, challenge, response, and next step.
- Experience mode.
- Accessibility notes.
- Quality proof.
- Search metadata.
- Content quality rubric.

## Current Case Study

`seis-foundation` remains the first draft case study. It documents the clean SEIS foundation: curated legacy assets, calm cinematic interface language, reduced-motion support, mobile-first layout, and rollback-safe repository governance.

## Deferred Until Stable

- Dynamic routing.
- Framework-specific loaders.
- CMS integration.
- Heavy visual transitions between case studies.

## Acceptance Criteria

- Content is portable JSON.
- The model can be consumed by a future static or framework route.
- Accessibility notes sit beside narrative content.
- Quality proof names lightweight checks.
- Search metadata is explicit enough for future SEO or internal discovery.
- Content quality is reviewed for clarity, evidence, accessibility, and rollback.
- No new dependency is required.
