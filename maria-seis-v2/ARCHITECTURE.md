# MARIA × SEIS — Implementation Architecture

## Experience Layer
- `index.html`: semantic application shell
- `src/styles.css`: design system, layout, responsive behavior
- `src/app.js`: local interaction state and safe execution simulation

## Recommended production modules

```text
Maria UI
  ↓
Context + Intent
  ↓
SEIS Orchestrator
  ├── Model Router
  ├── Agent Router
  ├── MCP Gateway
  ├── Memory Service
  ├── Voice Service
  ├── Vision Service
  ├── Permission Engine
  └── Verification Engine
        ↓
Adapters
  ├── Unreal
  ├── Blender
  ├── GitHub
  ├── Figma / Adobe
  ├── macOS / CLI
  └── Local / Cloud models
```

## Safety boundary
The UI must never represent simulated work as externally executed work. Production actions should return signed/structured execution evidence to the Verification Engine before Maria reports success.
