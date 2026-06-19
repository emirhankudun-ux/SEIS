# AI Chat Interface

Status: Product foundation

The AI chat interface is one entry point into SEIS AI Core. It must not become
the whole product.

## Requirements

- display selected model route and privacy mode
- show prompt or behavior pack version where appropriate
- show whether repository context, retrieval, or memory is active
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

## Failure States

- no provider configured
- local model unavailable
- sensitive data blocked
- approval required
- evaluation failed
- tool unavailable
- unknown state
