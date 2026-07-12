# SEIS Five-Year Evolution Ledger

The Evolution Ledger is an additive browser-local surface for the SEIS five-year roadmap. It turns the 20-quarter horizon into an inspectable state machine that can be advanced, exported, and merged after moving to another computer.

## Location

Open `apps/web/seis-five-year-ledger.html` through the existing SEIS web server. The page also links back to `seis-linux-replica.html?demo=live`.

## Behavior

- The initial state contains 20 quarters across five roadmap phases.
- The active quarter advances sequentially; future quarters cannot be marked complete out of order.
- Completed milestones are retained in browser `localStorage` under `seis.evolution-ledger.v1`.
- Export creates a portable JSON snapshot.
- Import merges by quarter ID and never removes local milestones or regresses a completed quarter.
- The page is usable without API keys, SSH, provider access, cloud access, or host filesystem access.

## State labels

- `Complete`: recorded locally as finished.
- `Now`: the next quarter in the local progression.
- `Planned`: a future quarter in the roadmap.
- `Local Demo`: the ledger is a product interaction, not proof of live AI, cloud, deployment, or remote execution.

## Next integration

The first version is a standalone additive route so the supplied Desktop and reference-bank code remains untouched. A later PR can add a Command Center launcher and shared snapshot contract after the surface has received review.
