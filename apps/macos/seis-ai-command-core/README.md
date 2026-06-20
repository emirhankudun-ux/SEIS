# SEIS AI Command Core

`SeisAICommandCore` is a SwiftUI desktop demo application for the SEIS AI
operating layer.

It is intentionally local and deterministic:

- no provider API key is requested
- no live model call is made
- no SSH, deployment, credential, or destructive action is executed
- approval and redaction controls are visible in the app
- run state and audit history are stored locally with `UserDefaults`

## Features

- Ask SEIS composer
- Model-router score panel
- Agent runtime queue
- Prompt version manager
- Knowledge and evidence panel
- Evaluation score strip
- Human approval gate
- Audit timeline with copy action
- Settings window
- Toolbar and command menu shortcuts

## Build

From the repository root:

```bash
swift build --package-path packages/seis_platform_swift --product SeisAICommandCore
```

## Verify App Bundle

```bash
./script/build_and_run.sh --ai-demo --verify
```

## Open

```bash
./script/build_and_run.sh --ai-demo
```
