# SEIS-Agent

SEIS-Agent is the unified orchestration plugin for the SEIS repository. It
combines `seis-governance`, `seis`, `seis-cloud`, `seis-code`, `seis-design`, and `seis-data` into
one long-running agent direction across memory, context, cloud, code, design,
data, MCP, skills, plugins, and automation.

The package id remains `seis-ai-agent` for install stability. The operating
identity is `SEIS-Agent`.

The agent is repo-contained. Website, app packaging, and release surfaces happen
only after an explicit release decision.

## Install

```bash
npm run install:seis-ai-agent
```

This installs only the unified `seis-ai-agent@seis-repo` surface by default.
Standalone `seis`, `seis-cloud`, `seis-code`, `seis-design`, and `seis-data`
directories remain repo-contained source mirrors; they are not published as
separate repo marketplace plugin cards.

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
