# SEIS Conversation Hub

The Conversation Hub is the shared browser-local boundary for SEIS conversations. It indexes AI Core, Command Center, Desktop, Code, Design, Search, Cloud, Store, Music, Files, Terminal/SSH, and Agents in one context rail without confusing local demo state with a live integration.

## Open

Run the existing SEIS web server and open apps/web/seis-conversation-hub.html. The Hub links back to seis-linux-replica.html?demo=live and to the existing product surfaces.

## Contract

apps/web/seis-conversation-bus.js exposes window.SEISConversationBus in the browser. It provides a versioned source registry with explicit local-only, metadata-only, mock, planned, and disabled states; browser-local sessions and messages; deterministic Local Demo replies; merge-only snapshot import; and JSON export for moving conversation state to another computer.

Existing surfaces can publish safe metadata into this bus later without giving the bus host filesystem, SSH, provider, deployment, or credential permissions. A source must be proven connected before its state can change from a safe local or planned label.

## Integration rules

- Keep provider credentials backend-only; never place them in the bus or browser storage.
- Keep remote execution approval-gated; Terminal/SSH remains disabled in the first Hub slice.
- Treat imported snapshots as additive. They must not delete local sessions or regress existing messages.
- Label mock, local, planned, disabled, and real behavior in the UI.
- Use source IDs as stable contracts so individual apps can join without rewriting their existing code.

## What is real in this slice

- The source rail, session switching, local persistence, message composer, deterministic response states, export, import, and merge behavior are interactive.
- The source registry is the integration map for the existing SEIS product surfaces.
- Provider calls, live web search, host file access, cloud actions, deployment, and real SSH are not implemented or claimed.

## Next integration steps

1. Add a small adapter to the existing Desktop and Command Center event surfaces.
2. Connect Code, Design, Search, Files, and Agents metadata through explicit read-only adapters.
3. Add backend-only provider routing behind the same source contract.
4. Add review and approval events before any remote action is exposed.
