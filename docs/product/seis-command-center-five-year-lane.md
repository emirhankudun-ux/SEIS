# SEIS Command Center Five-Year Evolution Lane

The Command Center now exposes the existing five-year, 20-quarter Sub-Agent
plan as a connected local evidence surface. This is an additive view over the
existing `sub-agent-control` state; it does not replace the supplied reference
bank, the Linux-like desktop, or any existing app surface.

## What the lane does

- Shows quarter progress and the active year phase in Command Center.
- Reuses the existing `Record Next Cycle`, `Advance Quarter`, and `Run 20-Quarter Preview` actions.
- Refreshes Command Center when the Sub-Agent simulation changes.
- Preserves the existing browser-local VFS artifact boundary.
- Keeps the 5-year timeline clearly labeled as a plan/evidence simulation, not elapsed calendar time.

## Safety boundary

The lane does not run background workers, call model providers, execute SSH,
deploy, mutate GitHub, access host files, or store credentials. The only
persisted state is the existing browser-local desktop state and VFS artifacts.

## Product meaning

This gives the long-horizon roadmap a durable operator loop: inspect the current
phase, record one bounded local cycle, review the generated evidence, and then
continue from the same browser workspace. Live provider, cloud, SSH, and
protected-branch actions remain approval-gated and outside the demo runtime.
