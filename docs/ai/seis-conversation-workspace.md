# SEIS Conversation Workspace

The Conversation Workspace keeps a selected SEIS product surface and its browser-local conversation in one agency-delivered review frame.

## Client outcome

The client can open any registered source from Conversation Hub, inspect its existing product route in a sandboxed preview, and continue the source-specific local thread without losing context.

## Real behavior

- The source selector covers all 12 Conversation Hub sources.
- Each source route opens in a sandboxed same-origin preview.
- Source-specific sessions persist through SEISConversationBus.
- Starting a new thread selects the most recent thread for that source.
- Messages receive deterministic Local Demo responses.
- Mobile users can switch between product preview and conversation panels.

## Security boundary

- Source IDs are resolved through the fixed registry; arbitrary iframe URLs are not accepted.
- The workspace does not add provider, cloud, host filesystem, deployment, or SSH permissions.
- Terminal/SSH and planned sources remain visibly disabled or planned.
- No credentials are stored in the browser.
- Existing product and supplied reference-bank files remain untouched.

## Client acceptance criteria

1. Opening a source from Conversation Hub lands in the matching workspace preview.
2. Switching sources updates the preview, status, route, and local conversation.
3. New threads remain selected and persist locally.
4. Every clickable control responds.
5. Mobile preview/chat switching is usable.
6. Live capabilities remain approval-gated and honestly labeled.
