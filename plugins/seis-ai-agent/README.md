# SEIS-Agent

SEIS-Agent 0.3.0 is the unified orchestration plugin and the canonical default
public entry point for the SEIS repository. It
combines `seis-governance`, `seis`, `seis-cloud`, `seis-code`, `seis-design`,
`seis-data`, `seis-security`, `seis-research`, `seis-automation`, and
`seis-product` into one long-running agent direction across memory, context,
cloud, code, design, data, security, research, product, MCP, skills, plugins,
and automation.

The package id remains `seis-ai-agent` for install stability. The operating
identity is `SEIS-Agent`.

The single suite record is `assets/unified-suite.json`. It records the ten
embedded components, shared release version, canonical install id, and the five
preserved `@personal` compatibility aliases. Website, app
packaging, live authentication, and deployment surfaces happen only after an
explicit release decision.

## Choose a public bundle without overload

Start with `seis-ai-agent@seis-repo`. The public `seis-repo` marketplace keeps
one canonical SEIS-Agent card and 33 optional, bounded selection bundles rather
than exposing 380 retained source capabilities as separate cards. For one
scoped task, select at most one optional bundle; each has no more than 15 source
capabilities, never bulk-installs members, and leaves its source packages in the
repository.

Use the local read-only MCP tool `seis_public_bundle_find` when the user has a
short need statement rather than a known journey ID. It returns at most three
deterministic candidates from generated public metadata, never installs a
package, and never contacts an external service. Then use
`seis_public_bundle_guide` to inspect the six starter paths or all 19 journeys,
and `seis_public_bundle_recommend` to return only the first optional bundle for
one chosen journey. These tools are decision aids, not installer, provider
connection, deployment, or write actions.

If the terminal is the only available surface, use the same bounded local
finder without opening MCP. It returns at most three candidates and performs
no installation:

```bash
npm run install:seis-ai-agent -- --find "SBOM supply chain"
```

Choose one returned journey only, then review its emitted `--journey` plan.

## Install

The default plan remains one canonical public plugin:

```bash
npm run install:seis-ai-agent
```

To turn one known selection journey into a reviewable two-target plan, pass the
journey ID from the public guide. This remains plan-only and does not install
anything:

```bash
npm run install:seis-ai-agent -- --journey security
```

Only after reviewing the plan and receiving explicit human approval, an operator
may add `--apply` for that same one journey:

```bash
npm run install:seis-ai-agent -- --apply --journey security
```

The installer rejects arbitrary bundle IDs, multiple journeys, bulk selection,
and the retired standalone-lane option. A journey can add only its validated
first optional bundle alongside `seis-ai-agent@seis-repo`; it never auto-installs
bundle members or later continuation bundles.

The repo preserves `seis`, `seis-cloud`, `seis-code`, `seis-design`,
`seis-data`, `seis-security`, `seis-research`, `seis-automation`, and
`seis-product` as source modules. Their skills, lane profiles, and validation
contracts are embedded in this public package; they do not have direct
standalone marketplace entries or install commands. Optional public bundle cards
are curated task selections, not replacements for those retained source modules.

## MCP Tools

- `seis_ai_agent_status`
- `seis_ai_agent_plan`
- `seis_agent_lanes`
- `seis_public_bundle_guide`
- `seis_public_bundle_find`
- `seis_public_bundle_recommend`
- `seis_hub_status`
- `seis_hub_plan`
- `seis_cloud_status`
- `seis_cloud_plan`
- `seis_governance_status`
- `seis_governance_plan`
- `seis_code_status`
- `seis_code_plan`
- `seis_design_status`
- `seis_design_plan`
- `seis_data_status`
- `seis_data_plan`
- `seis_security_status`
- `seis_security_plan`
- `seis_research_status`
- `seis_research_plan`
- `seis_automation_status`
- `seis_automation_plan`
- `seis_product_status`
- `seis_product_plan`
