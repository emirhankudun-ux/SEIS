# MARIA × SEIS v4 Alpha — Personal Intelligence Operating System

A public, modular, local-first foundation for a premium personal intelligence desktop experience.

MARIA is the human-facing layer. SEIS is the orchestration and verification core beneath it.

## Included now
- Premium responsive desktop/mobile UI
- Natural-language command surface
- Intent + risk classification
- Permission gate with explicit high-impact approval
- Agent routing contracts
- Provider router with local-first policy
- Capability / model / connector registry
- Event bus
- Source-of-truth resolver
- Plugin SDK manifest validation
- Verification evidence model
- Voice/Vision state surfaces
- Project + operating-mode switching
- Provider/connector status panel
- Safe mock runtime with **zero external side effects**
- Node-based smoke/core/platform tests
- MIT license + contribution/security docs

## Truthful capability status
This alpha does not pretend to control OpenAI, macOS, Unreal, Blender, or MCP servers until their real adapters are connected and verified. `adapter-ready` means the contract exists; `ready` should only be used after reproducible execution evidence exists.

## Run
```bash
cd maria-seis-v2
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Test
```bash
npm test
```

## Architecture
`Emirhan → Maria Experience → SEIS Core → Policy → Router → Provider/Plugin/Adapter → Observation → Verification → Maria`

See `ARCHITECTURE.md` and `docs/ROADMAP.md`.

## Public extension model
Third-party integrations should use the plugin manifest contract in `src/plugins/sdk.js`. Provider-specific behavior belongs in adapters, not in the UI or orchestration core.

## Next production work
1. Real-time voice adapter
2. OpenAI + local model adapters
3. MCP gateway implementation
4. macOS control bridge
5. Unreal/Blender adapters
6. Durable memory with provenance
7. Automation scheduler
8. Signed plugin trust layer
