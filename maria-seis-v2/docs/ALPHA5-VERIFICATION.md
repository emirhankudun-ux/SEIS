# MARIA × SEIS 4.0.0-alpha.5 verification

- Node test suite: **87/87 passed**.
- Offline Chromium acceptance: **17/17 passed**.
- Local-model transport was verified with an injected deterministic HTTP test transport, not a real LM Studio/Ollama process.
- Real local endpoint connectivity remains unverified in this environment.
- Browser UI remains simulation-first; no automatic live provider activation was added.
- No browser-side API key or credential persistence was added.
- End-to-end contract covered: local adapter → HostAdapterManager → LiveRuntimeAdapter → orchestrator → verifyLiveReceipt.
