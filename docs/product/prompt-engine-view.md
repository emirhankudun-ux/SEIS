# Prompt Engine View

Status: Product foundation

The prompt engine view makes SEIS prompt assets reviewable.

## Required Fields

- prompt id
- version
- status
- owner
- purpose
- allowed inputs
- forbidden inputs
- expected output
- regression status
- change reason

## Actions

Foundation UI may support inspection only. Creating, approving, or publishing
prompt versions should require explicit workflow design and review.

## Safety Rule

Prompt views must not expose secrets, private system prompts, or restricted
reference material.
