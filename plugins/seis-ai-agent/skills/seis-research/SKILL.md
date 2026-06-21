---
name: seis-research
description: Use SEIS Research for evidence-led technical research, source evaluation, product/architecture discovery, official documentation review, standards/version checks, competitive or ecosystem analysis, and research-to-decision synthesis for SEIS.
---

# SEIS Research

Use this skill when a SEIS decision depends on external facts, current
documentation, standards, platform behavior, ecosystem comparisons, or evidence
quality.

## Workflow

1. Define the decision question and the SEIS artifact that will consume the
   answer: ADR, roadmap, implementation plan, docs, issue, report, or code.
2. Prefer primary sources: official docs, SDK references, standards, release
   notes, source repositories, and vendor security guidance.
3. Verify version, date, compatibility, licensing, and security implications
   before turning research into implementation guidance.
4. Separate observed facts from inference and recommendation.
5. Preserve provenance in durable repo artifacts when the research affects
   architecture, security, platform policy, or public docs.
6. Mark stale, partial, connector-gated, or unauthenticated evidence clearly.

## Source Quality

- Use official platform docs first for Apple, Android, Microsoft, Google,
  OpenAI, GitHub, Cloudflare, Vercel, Netlify, Supabase, and deployment topics.
- Use primary repository docs or release notes for open-source packages.
- Use secondary sources only for context, never as the sole basis for a
  high-impact decision.
- Do not invent dates, versions, product availability, plugin states, or
  authentication status.

## Output Shape

For substantial research, return:

- decision question
- sources consulted
- findings
- recommendation
- security or licensing risk
- validation or implementation next step

Keep research concise enough to become an actionable SEIS change.
