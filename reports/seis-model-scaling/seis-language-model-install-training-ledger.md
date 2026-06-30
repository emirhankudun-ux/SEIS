# SEIS Language Model Install and Training Ledger

Generated: 2026-06-30T21:37:55.320Z

Status: blocked-for-live-install-safe-for-planning

## Summary

| Field | Value |
| --- | --- |
| Candidate families | 8 |
| Blocked installs | 8 |
| All-model install approved | false |
| Language model downloads approved | false |
| Foundation pretraining approved | false |
| Repo-local seed training approved | true |

## Family Decisions

| Family | Install decision | Training decision | Allowed local action today |
| --- | --- | --- | --- |
| code-specialist | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus clean-room code-assistant evaluation planning |
| deepseek | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus license/hardware review planning |
| embedding-and-reranker | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus retrieval architecture planning |
| gemma | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus license/hardware review planning |
| llama | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus license/hardware review planning |
| mistral | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus license/hardware review planning |
| openai-open-weight | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus license/hardware review planning |
| qwen | blocked-until-per-model-approval | blocked-not-authorized | metadata-only plus license/hardware review planning |

## Safe Next Commands

- `npm run check:seis-language-model-intake`
- `npm run plan:seis-language-model-install -- --json`
- `npm run inspect:seis-model-local-hardware`
- `npm run automation:seis-ai-workforce-training`
- `npm run check:seis-ai-workforce-training`

## Human Approval Needed Before

- any model download
- any checkpoint handling
- any dataset download
- any adapter, LoRA, fine-tune, or foundation pretraining
- any provider call with repository data
- any route eligibility claim
- any public AGI or trained-model claim
