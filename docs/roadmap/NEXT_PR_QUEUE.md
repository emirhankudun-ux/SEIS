# Recommended Next PR Queue

## Current PR

feat(ai): add AGI GitHub readiness gates

Acceptance criteria:

- Keep Local Demo review available without provider keys.
- Keep 20B on 16GB+ RAM as planned quantized evaluation only.
- Keep 70B, 512B, foundation-model, and real-AGI claims blocked.
- Require independent evidence before any AGI or 512B claim changes.
- Run npm run check:seis-ai-github-readiness-chain.

## Next Safe PRs

1. Attach a clean-clone transcript to the fresh-clone evidence ledger. This may
   move only the fresh-clone status after a reviewer verifies the logs.
2. Add an independently reviewed 20B hardware evaluation protocol. It must not
   install a model or claim a runtime before approved measurements exist.
3. Add independent safety and reproducibility review artifacts before changing
   any 512B or AGI claim boundary.
4. Add a human-approved release decision only after all required evidence is
   attached and relevant repository checks are green.

No queue item authorizes model downloads, training, inference, provider calls,
SSH execution, deployment, automatic GitHub mutation, or a 512B claim.
