# MARIA × SEIS Roadmap

## Foundation — implemented in v4 alpha
- modular orchestration pipeline
- permission engine
- provider router
- event bus
- source-of-truth resolver
- plugin SDK manifest validation
- capability and provider registries
- safe mock runtime
- verification evidence model
- responsive Maria desktop UI

## Production adapters — next
1. Voice adapter: wake word, STT, TTS, interruption.
2. Model adapters: OpenAI plus local LM Studio/Ollama-compatible endpoints.
3. MCP gateway: discovery, health, permissions, schema validation.
4. macOS adapter: Accessibility / Shortcuts / CLI with explicit grants.
5. Unreal adapter and Blender adapter.
6. Durable project memory + provenance-backed retrieval.
7. Automation scheduler + event-driven task engine.
8. Signed plugin packages and trust store.

## Release gate
A feature may move from `adapter-ready` to `ready` only when execution and verification have reproducible evidence.
