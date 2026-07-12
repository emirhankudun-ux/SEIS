# SEIS Conversation Context Adapters

The context adapter layer gives Conversation Workspace verified, read-only metadata about the product surface shown in its sandboxed preview.

## Client outcome

The client can ask for a context summary and see evidence from the actual loaded SEIS surface without granting access to private content, inputs, credentials, files, or network payloads.

## Allowed metadata

- Registered source ID.
- Same-origin route.
- Document title.
- Count of interactive controls.
- Count of structural landmarks.
- Preview viewport dimensions.
- Capture timestamp.

## Forbidden data

- Visible or hidden text content from the product page.
- Input, textarea, editor, or form values.
- Preview localStorage or sessionStorage.
- Credentials, API keys, cookies, or tokens.
- File content or host filesystem paths.
- Network request or response payloads.

## Behavior

The adapter runs after a registered source iframe emits its load event. It rejects cross-origin previews and stores only the allowed metadata under the browser-local conversation context namespace. Context summaries remain deterministic Local Demo responses and never invoke an AI provider.

## Client acceptance criteria

1. A same-origin source reports connected-readonly after loading.
2. The Workspace displays title, control count, and landmark count.
3. A context-summary prompt includes only the allowed metadata.
4. Cross-origin or unavailable previews report unavailable without bypassing the sandbox.
5. No page text, input value, storage value, credential, file, or network payload enters the context record.
