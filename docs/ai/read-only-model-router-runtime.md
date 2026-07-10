# Read-Only Model Router Runtime

SEIS AI Core now has an executable, provider-neutral route evaluator behind the
existing read-only model-router contract. It reads the repository provider
registry and the five plan-only SEIS lanes, then returns a deterministic,
redacted decision without calling a model or executing an agent.

Run it from the repository root:

```bash
node packages/seis-ai/bin/seis-router.mjs --check
node packages/seis-ai/bin/seis-router.mjs --task-type repository-validation --capability validation --local-only
```

The same evaluator is available to the local SEIS agent as the
`seis_ai_core_read_only_route` tool. It accepts task/capability metadata and
privacy preferences only; it does not accept prompt bodies or provider
credentials.

The contract is also exposed through the read-only MCP resource
`seis://ai/read-only-router-runtime.json`, so MCP clients can inspect the exact
runtime boundary without invoking a provider or an agent.

The evaluator distinguishes `Missing Key`, `Disabled`, `Rate Limited`, `Error`,
and `Unknown`; it never silently selects an unavailable provider. Local-only
requests cannot select a cloud provider, private Obsidian or personal note
content is not accepted as route input, and frontier/512B labels remain
planning-only records.

The output is review evidence, not runtime authority. Every decision includes
an explicit provider and model, the selected SEIS lane, blocked reasons,
`executionPerformed: false`, a deterministic integrity hash, and a model-claim
boundary that cannot claim training, model ownership, 512B inference, or AGI.

The implementation deliberately follows the repository's server-only secret
boundary. Live provider adapters are a separate, approval-gated change and
must not be inferred from this local evaluator.
