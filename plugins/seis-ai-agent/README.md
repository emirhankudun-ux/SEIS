# SEIS-Agent

SEIS-Agent 0.3.0 is the unified orchestration plugin and the only public
installation surface for the SEIS repository. It
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

## Install

```bash
npm run install:seis-ai-agent
```

The repo preserves `seis`, `seis-cloud`, `seis-code`, `seis-design`,
`seis-data`, `seis-security`, `seis-research`, `seis-automation`, and
`seis-product` as source modules. Their skills, lane profiles, and validation
contracts are embedded in this public package; they do not have separate public
marketplace entries or install commands.

## MCP Tools

- `seis_ai_agent_status`
- `seis_ai_agent_plan`
- `seis_agent_lanes`
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
