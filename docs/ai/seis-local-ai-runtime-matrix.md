# SEIS Local AI Runtime Matrix

This matrix defines the safe local AI path for SEIS on 16GB+ machines and
larger future hardware classes. It is intentionally a planning artifact: it does
not install Ollama models, does not pull checkpoints, does not run inference,
does not train, does not submit HF Jobs, and does not claim SEIS has a 512B
model or real AGI.

## Status

- Matrix status: runtime-matrix-ready-no-install
- Runtime rows: 9
- Hardware lanes: 5
- Model install allowed: false
- Checkpoint download allowed: false
- Local inference allowed: false
- Training allowed: false
- HF Job submission allowed: false
- AGI claim allowed: false

## 16GB Rule

16GB+ currently means SEIS Local Demo, deterministic seed-model artifacts, and
approval-gated metadata planning. It does not verify 20B runtime compatibility.
Small local models, embeddings, SFT, LoRA, Ollama pulls, and HF Jobs all require
separate model-specific approval and evidence.

## Commands

```bash
npm run report:seis-local-ai-runtime-matrix
npm run check:seis-local-ai-runtime-matrix
```
