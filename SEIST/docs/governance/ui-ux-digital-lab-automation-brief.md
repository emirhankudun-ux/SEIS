# UI-UX Digital Lab Automation Brief

## Automation Goal

Create recurring AI assistance around the UI-UX Digital Lab master directive
without creating noisy, heavy, or unsafe automation.

The automation should keep the system moving through small, reversible,
high-value improvements.

## Source Directive

Primary source:

```text
docs/governance/ui-ux-digital-lab-master-directive.md
```

Supporting local policy:

```text
docs/governance/full-efficiency-low-pressure-mode.md
```

## Recommended First Automation

Status:

```text
created and active
```

Automation id:

```text
ui-ux-digital-lab-weekly-governance-review
```

Name:

```text
UI-UX Digital Lab Weekly Governance Review
```

Kind:

```text
cron
```

Cadence:

```text
weekly
```

Reasoning effort:

```text
medium
```

Prompt:

```text
Review the UI-UX Digital Lab workspace against the master directive. Produce a
short practical report covering design quality, motion governance,
accessibility, performance risk, repository cleanliness, documentation gaps,
automation opportunities, and the next small reversible implementation slice.
Do not push, deploy, install dependencies, or start heavy local processes.
Separate blockers from code quality.
```

## Optional Automations

### Motion and Accessibility Regression Review

Purpose:

- check motion intensity rules
- verify reduced-motion support
- identify hover-only or motion-only risks
- suggest one focused improvement

Suggested cadence:

```text
weekly or after motion-heavy changes
```

### GitHub Publish Readiness Review

Purpose:

- inspect branch state
- inspect working tree cleanliness
- run publish preflight when available
- report authentication or remote blockers

Suggested cadence:

```text
manual or before push
```

### Documentation Freshness Review

Purpose:

- detect stale governance docs
- align docs with current implementation
- propose small doc updates

Suggested cadence:

```text
biweekly
```

## Guardrails

Automation must not:

- push to GitHub without explicit approval
- deploy to a server without explicit approval
- expose secrets
- add dependencies automatically
- run Docker, browser automation, or heavy build loops by default
- rewrite the architecture without a scoped implementation request

Automation should:

- prefer static reads and focused checks
- produce short actionable reports
- preserve user changes
- recommend small reversible work
- keep accessibility and reduced-motion visible
- treat GitHub auth blockers separately from source quality

## Missing Inputs Before Creation

Resolved for the first automation:

- exact schedule: weekly Monday morning
- target workspace path: `/Users/emirhan/Documents/New project`
- output mode: practical report
- file editing: not allowed by default
- GitHub publishing: not allowed

Still decide before adding stronger automations:

- whether output should return to this thread or run as a workspace job
- whether GitHub preflight may run automatically
- whether a separate motion/accessibility automation should run after every
  motion-heavy change
