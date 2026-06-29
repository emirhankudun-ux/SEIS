# SEIS AGI Evaluation Protocol

`content/development/seis-agi-evaluation-protocol.json` is the current
source-of-truth protocol for deciding what evidence would be required before
SEIS can make any future AGI claim.

Status: `protocol-draft-not-run`.

This protocol is not AGI proof. It does not train, download, benchmark, serve,
route, publish, or deploy a model. It keeps SEIS AI in Local Demo mode until
real evidence exists.

## Why This Exists

The SEIS target includes a long-term 512B apex AI direction. A parameter count
alone is not AGI evidence, so the repository needs an explicit evaluation
contract that blocks premature claims and gives all installed AI/sub-agent roles
the same evidence checklist.

Public frontier-model and risk-management references used by the protocol:

- Meta Llama 3.1 405B:
  `https://ai.meta.com/blog/meta-llama-3-1/`
- Megatron-Turing NLG 530B:
  `https://arxiv.org/abs/2201.11990`
- DeepSeek-V3 671B MoE:
  `https://github.com/deepseek-ai/DeepSeek-V3`
- Qwen3-235B-A22B-Instruct-2507:
  `https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507`
- NIST AI Risk Management Framework:
  `https://www.nist.gov/itl/ai-risk-management-framework`
- Anthropic Responsible Scaling Policy:
  `https://www.anthropic.com/responsible-scaling-policy`
- NIST Generative AI Profile, AI 600-1:
  `https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf`
- METR long-task horizon evaluation:
  `https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/`
- Google DeepMind Frontier Safety Framework:
  `https://deepmind.google/blog/introducing-the-frontier-safety-framework/`
- ARC-AGI abstract reasoning benchmark context:
  `https://arcprize.org/arc-agi`

## Source-Derived Readiness Gates

The protocol now turns public research references into explicit SEIS gates:

| Gate | Source basis | Current status |
| --- | --- | --- |
| Generative AI risk profile gate | NIST AI RMF and AI 600-1 | Not run |
| Long-task autonomy gate | METR time-horizon evaluation | Not run |
| Frontier safety threshold gate | Anthropic RSP and Google DeepMind Frontier Safety Framework | Not run |
| Abstract generalization gate | ARC-AGI | Not run |

## Evaluation Dimensions

The protocol requires evidence in these dimensions before any future AGI claim:

| Dimension | Current status |
| --- | --- |
| Multi-domain reasoning | Not run |
| Long-horizon planning | Not run |
| Agentic autonomy time horizon | Not run |
| Tool-use reliability | Not run |
| Out-of-distribution generalization | Not run |
| Abstract skill acquisition | Not run |
| Memory and learning boundary | Not run |
| Safety and misuse resistance | Not run |
| Frontier safety threshold governance | Not run |
| Security and data governance | Not run |
| Human alignment and review | Not run |

## Minimum Claim Evidence

Before any AGI claim, SEIS must have accepted lower-tier evidence for 20B, 70B,
150B, and 300B+, independently verified 512B training or inference evidence,
multi-domain evaluation, long-horizon planning evaluation, tool-use reliability,
agentic autonomy time-horizon evaluation, generalization analysis, abstract
skill-acquisition evaluation, frontier safety threshold review, generative AI
risk profile, safety review, privacy/data-rights review, red-team report, model
card, system card, training logs, checkpoint governance, external review, and
explicit human approval.

None of that evidence exists today.

## Public Readiness Evidence Matrix

The public-readiness matrix records each missing minimum evidence item and keeps
the GitHub-facing decision explicit:

`content/development/seis-agi-public-readiness-evidence.json`

Human-readable companion:

`docs/ai/seis-agi-public-readiness-evidence.md`

Current decision: `not-ready-for-agi-or-512b-public-claim`.

## MCP Resource

The protocol is exposed read-only through:

`seis://ai/agi-evaluation-protocol.json`

This allows installed SEIS AI and sub-agent lanes to inspect the same AGI
evidence protocol without gaining runtime, model download, provider, SSH, GPU,
cloud, GitHub mutation, or deployment authority.

## Validate

```bash
node scripts/check-seis-agi-evaluation-protocol.mjs
```
