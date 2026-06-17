# Mobile Path Decision

## Recommendation

Start PWA-first.

## Why

The current SEIS shell already supports responsive layout, offline readiness, low-motion mode, static server packaging, and handoff preservation. Starting PWA-first keeps the development process lightweight while the product direction, server target, and user-facing route mature.

## Options

| Path | Fit Now | Cost | Risk |
| --- | --- | --- | --- |
| PWA-first | High | Low | Low |
| Expo / React Native | Medium | Medium | Medium |
| Native Swift + Kotlin | Low now, high later | High | High |

## Decision Gate

Stay PWA-first until a native-only capability becomes a product requirement.

Examples:

- push notification behavior that web cannot support well enough
- native camera/media workflow
- app-store distribution as a business requirement
- advanced offline storage beyond the current static shell
