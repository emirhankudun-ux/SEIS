# MARIA × SEIS — Personal Intelligence OS

A polished, dependency-free interactive desktop UI prototype based on the **MARIA × SEIS Master System Prompt v2.0 Unified Architecture**.

## What is implemented

- Maria ambient core / state visualization
- Natural-language command dock
- Voice state prototype (`READY`, `LISTENING`, `UNDERSTANDING`, `ROUTING`, `VERIFYING`)
- Vision toggle / screen-context state
- Project context switching (`Deadly Evil`, `SEIS Core`, `Portfolio`)
- SEIS live orchestration activity card
- Specialist-agent status panel
- MCP / Voice / Vision / Memory health indicators
- Settings sheet with local-first, wake-word, ambient-context controls
- Responsive desktop/mobile layout
- Safe simulated execution pipeline so the UI never pretends to control external apps

## Run locally

No dependencies are required.

```bash
cd maria-seis-v2
python3 -m http.server 4173
```

Then open:

`http://localhost:4173`

## Architecture boundaries

This prototype intentionally separates UI from future execution adapters.

Future production connectors can be added for:

- Voice/STT/TTS
- Screen/vision context
- OpenAI / local model router
- MCP gateway
- Unreal Engine control
- Blender control
- GitHub / Figma / Adobe
- Project memory and retrieval
- Permission + verification services

The current prototype simulates those workflows in the UI and labels them truthfully.
