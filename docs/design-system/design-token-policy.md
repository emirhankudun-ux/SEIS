# Design Token Policy

Status: Foundation policy

Design tokens define shared visual decisions for SEIS App and Command Center
surfaces.

## Token Categories

- color
- typography
- spacing
- radius
- border
- elevation
- motion
- focus
- state

## Rules

- Tokens should support accessible contrast.
- Motion tokens must support reduced-motion behavior.
- State tokens must distinguish ready, blocked, degraded, unknown, failed, and
  approval-needed states without relying only on color.
- Tokens should be reusable across web and future Apple-native surfaces.
- Avoid one-off styling when a shared token exists.

## Current Evidence

Existing token work lives under `packages/design-tokens` and Command Center
styles under `apps/seis-core`.
