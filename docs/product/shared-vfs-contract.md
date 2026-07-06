# Shared VFS Contract

## Purpose

Define the current browser-local virtual file system contract for the SEIS demo.
This contract keeps Desktop Files, Desktop Terminal, SEIS Code, and Mythic
Gacha exports aligned without claiming production storage, cloud sync, or host
operating-system access.

## Scope

Current covered surfaces:

- SEIS Desktop Files and Terminal
- SEIS Code workspace and terminal
- Mythic Gacha card export
- SEIS Design Agency Kit handoff export
- Product browser smoke validation

Current implementation files:

- `apps/web/desktop.js`
- `apps/web/seis-code.js`
- `apps/web/mythic-gacha.js`
- `apps/web/website/product-page.js`
- `scripts/check-desktop-os-browser-smoke.mjs`
- `scripts/check-product-experience-browser-smoke.mjs`
- `scripts/check-seis-design-agency-kit-browser-smoke.mjs`

## Path Mapping

| Surface | Local root | Shared mapping |
| --- | --- | --- |
| SEIS Desktop | `/home/seis` | Mirrors current demo files to SEIS Code under `/workspace` |
| SEIS Code | `/workspace` | Imports current demo files into Desktop under `/home/seis` |
| Mythic Gacha | `/workspace/MythicArchive` | Exports card JSON into SEIS Code and Desktop-visible `MythicArchive` |
| SEIS Design Agency Kit | `/workspace/Design` | Exports the generated agency pack into the SEIS Code browser-local workspace |
| Desktop Terminal | `/home/seis` current directory | Reads and writes Desktop VFS paths and reflects shared imports |
| SEIS Code Terminal | `/workspace` current directory | Reads and writes SEIS Code workspace paths and reflects shared exports |

## Current Operations

| Operation | Current behavior | Evidence |
| --- | --- | --- |
| Desktop create file | Creates `/home/seis/...` and mirrors to `/workspace/...` | `npm run check:desktop-os-browser-smoke` |
| Desktop create folder | Creates `/home/seis/...` folder and mirrors to `/workspace/...` | `npm run check:desktop-os-browser-smoke` |
| Desktop move/rename | Moves current demo paths and removes stale workspace source | `npm run check:desktop-os-browser-smoke` |
| Desktop delete | Removes current demo paths and removes stale workspace target | `npm run check:desktop-os-browser-smoke` |
| SEIS Code reload persistence | Keeps terminal-created workspace files across route reload | `npm run check:product-experience-browser-smoke` |
| Mythic export | Writes card JSON under `/workspace/MythicArchive` | `npm run check:product-experience-browser-smoke` |
| Design Agency Kit export | Writes Markdown under `/workspace/Design/seis-design-agency-pack.md` and SEIS Code can create `/workspace/Design/seis-design-agency-pack-review.md` | `npm run check:seis-design-agency-kit-browser-smoke`, `npm run check:seis-code` |
| Desktop import | Imports `/workspace/MythicArchive/SHJ-*` into `/home/seis/MythicArchive` | `npm run check:product-experience-browser-smoke` |
| Terminal visibility | `ls`, `find`, and `cat` expose current shared files in browser-safe shells | `npm run check:desktop-os-browser-smoke`, `npm run check:product-experience-browser-smoke` |

## Rules / Policy

- The VFS is browser-local and no-key.
- The VFS must not claim host OS access.
- The VFS must not store provider API keys, SSH private keys, or production
  credentials.
- The VFS bridge must preserve current demo path boundaries:
  `/home/seis` for Desktop and `/workspace` for SEIS Code.
- Path traversal, stale path retention, and writes into directories must remain
  blocked by validation.
- Local Demo AI tools may read or mutate only browser-local VFS paths and must
  preserve provider honesty.

## Current vs Planned Boundary

| Capability | Current | Planned / not claimed |
| --- | --- | --- |
| Browser persistence | IndexedDB/localStorage-backed demo state | Production database, cloud sync, or multi-user storage |
| Cross-app visibility | Current demo files and Mythic exports move between Desktop and SEIS Code | Complete OS-wide mount system or arbitrary app filesystem API |
| Terminal integration | Browser-safe virtual command operations | Host shell, SSH, privileged command execution, or native process access |
| File permissions | Path validation and safe local operation | RBAC, multi-user ACLs, encrypted vaults, or enterprise policy engine |
| Restart evidence | Route reload persistence is covered for SEIS Code | Full browser restart, profile migration, backup/restore, and conflict resolution |

## Evidence Requirements

Changes to this contract must keep these commands passing:

```bash
npm run check:desktop-os
npm run check:desktop-os-browser-smoke
npm run check:seis-code
npm run check:mythic-gacha
npm run check:product-experience-browser-smoke
```

Production storage, cloud sync, SSH access, remote workspaces, encrypted vaults,
or multi-user permissions require separate architecture documents and explicit
human approval before implementation.

## Related Documents

- [seis-demo-status.md](seis-demo-status.md)
- [seis-desktop-os.md](seis-desktop-os.md)
- [seis-code-foundation.md](seis-code-foundation.md)
- [mythic-gacha.md](mythic-gacha.md)
- [../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md)

## Next Safe Action

Run the Design Agency Kit cross-route browser smoke with `CHROME_PATH`
available, keep Desktop, SEIS Code, Terminal, Mythic export, and Design handoff
coverage passing, then add browser-restart persistence and conflict-resolution
tests before any production storage or cloud-sync claim.
