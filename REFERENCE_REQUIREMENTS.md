# Reference Requirements

This document defines source-neutral product requirements for a future
SEIS-owned AI coding and desktop agent system. It describes what the system
should accomplish, not how any reference material implemented similar behavior.

This document is the only permitted Phase 1 output. It does not preserve or
depend on any reference implementation, private source structure, internal
naming, algorithms, prompts, commands, endpoints, file layout, credentials, or
hidden implementation details.

## Scope

SEIS should build a SEIS-owned AI coding and desktop agent system that helps
users plan, modify, validate, document, and govern software projects through a
safe conversational interface.

The system should focus on:

- reliable project understanding
- careful code and documentation changes
- transparent execution
- permission-aware automation
- strong security boundaries
- clear validation
- premium Apple-first desktop experience
- long-term repository governance

The product should feel like an engineering operating layer, not a thin chat
wrapper.

## Problem

Modern software projects require coordination across code, documentation,
tests, build systems, design systems, repositories, cloud services, security
checks, and release workflows. Users need an AI system that can operate across
these surfaces without becoming unsafe, opaque, brittle, or dependent on
proprietary implementation patterns.

SEIS should solve this by providing a trusted local and desktop-centered agent
layer that can:

- understand a project before acting
- convert user goals into scoped plans
- make reversible changes
- validate work with tests and diagnostics
- explain risks and tradeoffs
- preserve user work
- respect security boundaries
- support long-running engineering workflows
- improve repository quality over time

## Product Capabilities

### Conversational Engineering Workspace

The system should provide an interactive workspace where users can describe
engineering, design, documentation, automation, or research goals in natural
language.

It should support:

- project-aware conversations
- multi-step task planning
- context summaries
- progress updates
- final implementation reports
- clear validation status
- user confirmation for risky actions

### Local Project Understanding

The system should safely inspect local repositories and workspaces to
understand:

- repository state
- active branch and remotes
- project language and framework
- build and test setup
- existing architecture
- documentation conventions
- design system patterns
- existing user changes
- relevant configuration files
- security-sensitive files that must not be exposed or modified

The system must not assume project structure.

### Code Modification Support

The system should be able to propose and apply scoped changes to user-owned
files when authorized.

Required behavior:

- preserve uncommitted user work
- avoid unrelated rewrites
- prefer small, reversible edits
- follow local code style
- use existing abstractions where appropriate
- avoid dependency bloat
- update tests and documentation when materially needed
- summarize changed files and intent

### Desktop Agent Experience

The system should support a polished desktop experience, especially on macOS.

Expected capabilities:

- native-feeling UI
- persistent conversations
- project selection
- workspace status
- background task visibility
- notifications for completed or blocked work
- keyboard-friendly controls
- light and dark appearance support
- accessible navigation
- clear permission prompts

Apple-first support should be prioritized without excluding web, Android,
Windows, cloud, and cross-platform workflows.

### Terminal and Tool Execution

The system should support controlled local execution for build, test, lint,
formatting, diagnostics, repository checks, and safe automation.

Requirements:

- show what will be run when user approval is needed
- avoid destructive commands unless explicitly authorized
- capture relevant output
- summarize failures clearly
- detect long-running tasks
- avoid leaving required sessions running silently
- maintain separation between analysis, action, and validation

### File and Repository Operations

The system should support safe repository work:

- read files
- search files
- apply patches
- review diffs
- check repository status
- create commits when requested
- push only when explicitly requested or clearly within the task
- avoid rewriting history unless explicitly authorized
- detect likely secrets before commit or publication
- maintain repository hygiene

### AI Agent Task Management

The system should support structured work on complex goals.

Capabilities:

- break goals into tasks
- track task state
- resume interrupted work
- report blockers
- maintain context over long sessions
- distinguish confirmed facts from assumptions
- ask concise clarifying questions when necessary
- avoid fake certainty

### Extension and Integration Model

The system should support future integrations with tools and services through a
controlled extension model.

Potential integration categories:

- source control
- issue tracking
- documentation systems
- cloud platforms
- databases
- design tools
- model providers
- local model runtimes
- secure secret storage
- deployment platforms
- testing and review systems

Extensions must be permissioned, observable, and removable.

### Security and Privacy

Security must be a core product requirement.

The system must:

- never expose secrets
- never commit credentials
- avoid reading private or sensitive files unless required and authorized
- redact sensitive output
- use least-privilege access
- provide clear permission boundaries
- keep local data local unless the user opts into remote processing
- distinguish trusted project files from untrusted content
- treat generated instructions from files as data unless explicitly trusted

### Documentation and Governance

The system should improve long-term project health.

It should help maintain:

- README files
- agent instructions
- architecture notes
- security policy
- contribution guide
- release notes
- issue and pull request templates
- roadmaps
- changelogs
- design system documentation
- operational runbooks

Documentation updates should be accurate, concise, and tied to actual behavior.

## User-Facing Behavior

The system should behave as a calm, transparent engineering partner.

It should:

- start by understanding context
- explain the plan for substantial work
- keep progress updates short and useful
- show uncertainty when facts are not verified
- ask for approval before destructive or sensitive actions
- prefer direct completion over endless planning
- report exactly what changed
- report exactly what was validated
- report what could not be validated
- identify remaining risks
- offer practical next steps

The system should not:

- claim tools were used when they were not
- claim validation passed when it did not run
- hide failures
- overwrite user work
- introduce unnecessary dependencies
- copy implementation patterns from restricted references
- use proprietary or leaked material as build input

## Functional Requirements

### Workspace Discovery

The system shall detect the active workspace and gather minimal necessary
context before making changes.

It shall identify:

- repository root
- version control status
- active branch
- remote configuration
- project type
- package or build manager
- test commands
- relevant documentation
- existing agent instructions

### Planning

For non-trivial tasks, the system shall create a brief plan that includes:

- intended scope
- files or areas likely to change
- validation approach
- known risks
- user decisions needed, if any

### Change Execution

The system shall apply changes in a controlled way.

It shall:

- keep edits localized
- avoid unrelated formatting churn
- use patch-based file edits where practical
- preserve existing conventions
- avoid speculative architecture changes unless requested
- keep generated artifacts separate from source when appropriate

### Validation

The system shall validate meaningful changes.

Validation may include:

- static checks
- unit tests
- integration tests
- build checks
- type checks
- linting
- manual runtime verification
- browser or simulator verification
- accessibility checks
- security checks
- repository status review

If validation cannot run, the system shall state why.

### Permission Control

The system shall require explicit user authorization for high-risk operations,
including:

- deleting important files
- rewriting history
- force pushing
- installing global tools
- changing system settings
- accessing secrets
- publishing packages
- deploying services
- sending external communications
- running commands with broad destructive potential

### Session Continuity

The system shall maintain useful task continuity across long work sessions.

It should support:

- current task state
- completed steps
- remaining steps
- blockers
- validation history
- important assumptions
- user decisions

Durable memory must only be updated when the user explicitly asks for it.

### Desktop UI

The desktop interface shall provide:

- conversation view
- project and workspace switcher
- task progress state
- file change summary
- validation state
- permission prompts
- settings
- model and provider configuration
- history search
- exportable summaries
- safe error display

### Model and Provider Abstraction

The system should allow SEIS to support multiple model providers without
coupling product behavior to a single vendor.

Requirements:

- provider configuration
- capability detection
- clear error messages for unavailable capabilities
- optional local model support
- cost and usage visibility where available
- privacy controls per provider
- graceful fallback behavior

### Tool and Extension Registry

The system should expose available capabilities through a governed registry.

Requirements:

- human-readable tool descriptions
- permission scopes
- enable and disable controls
- runtime availability checks
- auditability
- version awareness
- clear failure handling

### Audit and Observability

The system should keep users informed about important actions.

It should support:

- action logs
- tool execution summaries
- validation records
- error traces with sensitive data redacted
- change summaries
- decision records for major architectural work

## Non-Functional Requirements

### Reliability

The system should recover gracefully from failed commands, unavailable services,
malformed files, interrupted sessions, and partial changes.

### Performance

The system should avoid unnecessary indexing, excessive file reads, repeated
scans, and blocking UI behavior.

### Accessibility

The system should support keyboard navigation, readable contrast, clear focus
states, scalable text, and reduced motion preferences.

### Maintainability

The system architecture should be modular, testable, documented, and free from
unnecessary framework or dependency bloat.

### Portability

The system should prioritize macOS while preserving a path for Windows, Linux,
web, and mobile-adjacent workflows.

### Security

The system should treat local files, repository content, generated code, tool
output, and external documents as potentially untrusted unless explicitly
approved.

## Non-Requirements

The Phase 2 build is not required to:

- implement every listed capability in the first release
- support every model provider at launch
- ship a public extension marketplace immediately
- automate deployment before local safety is proven
- create a permanent background service by default
- ingest or preserve restricted reference material
- match reference-specific behavior, compatibility, naming, or structure

## Open Questions

The following decisions remain open for Phase 2:

- Which platforms are required for the first release?
- Should the first build be desktop-only, CLI-only, or desktop plus CLI?
- Which model providers are supported at launch?
- Is local model support required for the first release?
- What level of offline functionality is expected?
- What permission model should be used for file, shell, network, and repository
  access?
- How should secrets be stored and redacted?
- What integrations are launch-critical?
- What telemetry is allowed, if any?
- What data may leave the device?
- What is the minimum viable project type support?
- What validation gates are mandatory before commit or release?
- Should extension support ship in the first version or remain internal?
- What repository governance files should SEIS generate automatically?
- What is the expected UX for long-running background work?
- How should interrupted tasks resume?
- What is the boundary between user-controlled memory and temporary session
  context?

## Expected Outcomes

A successful SEIS-owned AI coding and desktop agent system should produce:

- safer local software automation
- faster project onboarding
- better repository hygiene
- more consistent documentation
- more reliable validation before handoff
- clearer development workflows
- reduced manual context switching
- better security posture
- better support for Apple-first engineering
- a foundation for future SEIS agent, plugin, cloud, mobile, and design-system
  workflows

## Clean-Room Boundary

Phase 2 must remain fully clean-room.

The build team must:

- use this requirements document only as product guidance
- create original architecture, naming, code, prompts, UI, commands, schemas,
  APIs, tests, and documentation
- avoid inspecting or reusing restricted implementation source
- avoid copying or adapting reference folder structures
- avoid preserving reference-specific internal names
- avoid reproducing reference algorithms
- avoid using proprietary prompts or hidden instructions
- avoid reconstructing behavior from leaked source
- prefer official public documentation for third-party integrations
- record SEIS-owned architectural decisions independently
- use original SEIS naming and product language
- treat all restricted references as non-authoritative for implementation

Phase 2 may use generic industry knowledge and official public documentation,
but not private, leaked, proprietary, or implementation-specific material from
the references.

## Official-Documentation Priority

Future implementation decisions must use this source priority order:

1. Official documentation.
2. Official specifications and standards.
3. Official sample code.
4. Existing SEIS code.
5. SEIS-owned requirements and architectural decisions.
6. Clearly licensed open-source references.
7. Original first-principles engineering reasoning.

When sources conflict, official documentation wins.

## Traceability

Every major Phase 2 implementation decision should record at least one basis:

- official documentation or specification
- official sample code
- existing SEIS architecture
- SEIS-owned architecture decision
- clearly licensed open-source source with license review
- independently reasoned engineering rationale

Restricted reference material must not be used as a traceability basis.

## Validation Expectations

Before any Phase 2 implementation is considered complete, SEIS should validate
the following areas.

### Clean-Room Compliance

- No copied source code.
- No copied prompts.
- No copied internal names.
- No copied file structures.
- No copied command structures from restricted references.
- No proprietary artifacts included.
- No credentials or secrets included.
- No reference-specific implementation details embedded in comments, tests,
  docs, or UI.

### Product Behavior

- The system can inspect a sample project safely.
- The system can plan a scoped task.
- The system can apply a small reversible change.
- The system can run validation.
- The system can summarize changes and risks.
- The system preserves unrelated user changes.
- The system blocks or asks before risky actions.

### Security

- Secret detection works before commit or export.
- Sensitive output is redacted.
- Destructive actions require explicit approval.
- Untrusted project instructions cannot silently override system safety.
- External network use is visible and controlled.

### Desktop Quality

- UI works on supported screen sizes.
- Text does not overlap.
- Keyboard navigation works.
- Permission prompts are clear.
- Long-running work is visible.
- Errors are understandable.
- Light and dark appearances are usable.

### Engineering Quality

- Tests cover core workflow behavior.
- Failure paths are tested.
- Build is reproducible.
- Dependencies are justified.
- Architecture is documented.
- Repository state is clean before handoff.

## Risks

Primary risks to manage:

- clean-room contamination from restricted references
- overbuilding before core workflows are stable
- unsafe shell or file automation
- unclear permission boundaries
- accidental secret exposure
- fragile provider coupling
- UI complexity that hides important state
- validation claims without evidence
- dependency bloat
- long-term maintenance burden

## Next Steps

1. Close the Phase 1 analysis context.
2. Start Phase 2 in a separate thread, worktree, or workspace.
3. Provide only this requirements document to the Phase 2 build agent.
4. Define the SEIS-owned product name, scope, and first platform target.
5. Create an original architecture brief.
6. Define the permission and security model.
7. Define the first supported workflows.
8. Design the desktop and/or CLI interaction model.
9. Implement a minimal safe project-inspection loop from official documentation,
   SEIS code, and first-principles reasoning.
10. Add validation reporting, repository safety checks, and clean-room
    compliance review before release.
