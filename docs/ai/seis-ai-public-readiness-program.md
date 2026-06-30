# SEIS AI Public Readiness Program

`content/development/seis-ai-public-readiness-program.json` is the public GitHub
readiness boundary for SEIS AI.

MCP resource:

`seis://ai/public-readiness-program.json`

Status: `local-demo-public-review-ready-not-agi`.

This program says what GitHub users can safely trust today:

- Local Demo review is allowed without provider keys.
- Validator review is allowed without provider keys.
- Real AGI use is blocked.
- 512B route eligibility is blocked.
- Runtime authority is blocked.
- Training, checkpoint download, provider calls, SSH, deployment, push, merge,
  and release are not authorized by this program.

## One-Command Validator

```bash
npm run check:seis-ai-public-readiness
```

This command verifies the model intake registry, language-model curriculum, AI
workforce training contract, AI fresh-clone readiness contract, model-scaling
gates, 512B apex program, AGI evaluation protocol, AGI public readiness
evidence, GitHub user readiness gates, independent evidence ledger, and
retrieval source provenance and evaluation fixture gates.

It does not install models, download checkpoints, train models, call providers,
provision cloud/GPU capacity, execute SSH, push, merge, deploy, release, grant
AGI status, or make the 512B route eligible.

## Reviewer Report

Generate the human-readable reviewer packet with:

```bash
npm run report:seis-ai-public-readiness
npm run check:seis-ai-public-readiness-report
```

Artifacts:

- `reports/seis-ai-public-readiness/latest.json`
- `reports/seis-ai-public-readiness/latest.md`

## Research Baseline

Verified: 2026-06-30.

- Llama 3.1 405B paper: `https://arxiv.org/abs/2407.21783`
- Megatron-Turing NLG 530B: `https://arxiv.org/abs/2201.11990`
- DeepSeek-V3 671B reference: `https://github.com/deepseek-ai/DeepSeek-V3`
- NIST AI Risk Management Framework:
  `https://www.nist.gov/itl/ai-risk-management-framework`
- NIST AI 600-1 Generative AI Profile:
  `https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf`
- METR long-task horizon baseline: `https://arxiv.org/abs/2503.14499`

These sources support planning and risk gates only. They do not prove SEIS has
trained, downloaded, benchmarked, or served a 512B model.

## Public GitHub Decision

| Decision | Status |
| --- | --- |
| Local Demo public review | True |
| GitHub ready for everyone | False |
| Public ready as AGI | False |
| 512B route eligible today | False |
| Runtime authority | False |
| Training status | Not started |
| Inference status | Not available |
| Benchmark status | Not run |

## Required Before Everyone-Ready

- Fresh clone local demo path verified.
- `npm run check:seis-ai-fresh-clone-readiness` passes on the target commit.
- `npm run check:seis-retrieval-source-provenance` passes on the target commit.
- `npm run check:seis-retrieval-evaluation-fixtures` passes on the target commit.
- `npm run check:seis-ai-public-readiness` passes on the target commit.
- Required CI checks green on the target commit.
- Public README claim boundary reviewed.
- Secret scan completed.
- Human release approval recorded.
- Release notes and rollback plan accepted.
- AGI and 512B claim boundaries preserved.

## Required Before Any AGI Claim

- Real 512B training or inference evidence independently verified.
- Multi-domain capability evaluation accepted.
- Long-horizon planning evaluation accepted.
- Agentic autonomy time-horizon evaluation accepted.
- Abstract generalization evaluation accepted.
- Frontier safety threshold review accepted.
- Generative AI risk profile accepted.
- Privacy, data-rights, and clean-room review accepted.
- Red-team report accepted.
- Model card and system card published.
- Training logs and checkpoint governance reviewed.
- External review completed.
- Explicit human approval recorded.

## Forbidden Claims

- SEIS has achieved real AGI.
- SEIS includes trained 512B weights.
- GitHub users can run routeable 512B inference today.
- Installed AI systems prove SEIS AGI.
- Sub-agent council review grants runtime authority.
- Passing validators proves AGI.
- Provider API access is SEIS-owned AGI.

## Related Gates

- `content/development/seis-512b-apex-model-program.json`
- `content/development/seis-agi-evaluation-protocol.json`
- `content/development/seis-agi-public-readiness-evidence.json`
- `content/development/seis-agi-github-user-readiness-gates.json`
- `content/development/seis-agi-independent-evidence-ledger.json`
- `content/development/seis-model-scaling-subagent-council.json`
- `content/development/seis-ai-fresh-clone-readiness.json`
- `content/development/seis-retrieval-source-provenance-manifest.json`
- `content/development/seis-retrieval-evaluation-fixtures.json`
- `reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.md`
- `reports/seis-model-scaling/seis-retrieval-evaluation-fixtures.md`

## Validate

```bash
npm run public:readiness
npm run check:seis-ai-public-readiness-program
npm run check:seis-ai-fresh-clone-readiness
npm run check:seis-retrieval-source-provenance
npm run check:seis-retrieval-evaluation-fixtures
npm run check:seis-ai-public-readiness
npm run check:seis-ai-public-readiness-report
```
