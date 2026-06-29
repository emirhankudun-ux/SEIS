# Integrations

SEIS CLOSED CODE uses integrations as operating surfaces, not as replacements for repository truth.

## Current Integrations

- Google Drive: operating plan and platform backlog
- Google Docs: covered through the Google Drive MCP connector
- Google Sheets: covered through the Google Drive MCP connector
- Google Slides: covered through the Google Drive MCP connector
- Google Calendar: weekly build review
- Gmail: connected Codex MCP surface for mailbox search, summaries, drafts, and explicit mail actions
- GitHub: repository, refs, plugin source mirror
- Codex plugin: local SEIS workflow helpers
- Local AI Workbench: Codex, Antigravity, Antigravity IDE, Cursor, Xcode,
  Ollama, JetBrains IDEs, Air, Gateway, Open Design, and Figma as local
  task-specific surfaces

Google Meet is currently indirect through Calendar event creation. Google Chat,
Tasks, Keep, Forms, and Google Cloud/Firebase do not have verified standalone
MCP surfaces in the current Codex session.

See [`google-workspace.json`](./google-workspace.json) for current Google
Workspace artifacts, MCP namespaces, skills, and write gates.
See [`../docs/development/local-ai-workbench.md`](../docs/development/local-ai-workbench.md)
for local app routing, safety rules, and validation commands.
