---
type: prompt
module: seis-prompts
status: draft
visibility: public
updated: 2026-06-29
---

# Ollama Continuation Protocol

For long outputs:

1. stop at clean boundary
2. write `CONTINUE_FROM: <section>`
3. continue after `DEVAM`
