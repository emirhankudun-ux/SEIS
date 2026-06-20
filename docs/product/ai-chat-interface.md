# AI Chat Interface

Status: Product foundation

The AI chat interface is one entry point into SEIS AI Core. It must not become
the whole product.

## Requirements

- display selected model route and privacy mode
- display data mode and data classification
- show prompt or behavior pack version where appropriate
- show whether repository context, retrieval, or memory is active
- show whether output is based on repository evidence
- show whether output is based on assumptions
- show whether tools were used
- show whether validation was performed
- show approval-needed state before privileged actions
- provide evidence links for claims
- support degraded and blocked states
- keep provider keys out of browser clients

## Expected Modes

- repository assistant
- documentation assistant
- architecture reviewer
- security reviewer
- PR reviewer
- roadmap planner
- design-system assistant
- research assistant
- automation assistant

## Execution Modes

- `local-only`
- `local-preferred`
- `external-provider-allowed`
- `external-provider-redacted`
- `metadata-only`
- `offline`
- `disabled`
- `research-only`

Local-only mode must not silently call external providers. Offline mode must
not fake AI output. Disabled mode must explain that AI is unavailable.

## Supported Tasks

- general SEIS questions
- repository analysis
- documentation explanation
- roadmap planning
- goal tracking
- security review
- architecture review
- PR review
- release review
- prompt generation
- next action recommendations

## Required Answer Metadata

Each answer should identify:

- data mode
- privacy mode
- selected route, if available
- repository evidence used
- assumptions made
- tools used
- approval required
- validation performed

## Failure States

- no provider configured
- local model unavailable
- sensitive data blocked
- approval required
- evaluation failed
- tool unavailable
- unknown state

## Forbidden Behavior

The chat must not fabricate repository state, validation, security status,
implementation status, live integration state, provider status, or model
training evidence. It must not expose secrets or execute dangerous actions
directly.
