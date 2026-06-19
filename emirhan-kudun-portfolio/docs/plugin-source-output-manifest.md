# Plugin Source Output Manifest

The portfolio uses the submitted plugin list as a visible source architecture.
The plugins are not bulk-invoked or bulk-installed by default because many of
them require authentication, private data, payments, external accounts, or
write-capable actions.

## Output Surfaces

- `/#sources`: primary environment source console.
- `/portfolio#sources`: compact portfolio source console.
- `/sources`: dedicated routeable source command map with signal groups,
  source-family readiness and the complete source console.
- `/ops`: aggressive operations command center for sources, runtime readiness,
  GitHub persistence and deployment gates.
- `/api/ops-command-center`: machine-readable operations payload combining
  source routing, runtime, MCP, GitHub and deployment status.
- `/api/source-signal-map`: derived signal map for each plugin family,
  including invoked, callable, blocked, auth-gated and manifest-only counts.
- `/api/source-execution-queue`: prioritized now, next, blocked and backlog
  queue generated from source-family signals and aggressive sprint lanes.
- `/api/source-action-packets`: agent-ready action contracts derived from the
  execution queue, with evidence paths, validation commands and stop
  conditions.
- `/api/source-action-board`: priority and mode board for action packets,
  including leading next moves and risk notes.
- `/api/source-quality-gates`: validation gate map for aggressive source work,
  including commands, pass signals and failure responses.
- `/api/source-runbook`: ordered runbook for clean-branch preflight,
  implementation, validation and GitHub publish.
- `/api/source-execution-receipts`: evidence receipt set for board, packets,
  quality gates, runbook, UI and package outputs.
- `/api/source-execution-digest`: compact execution summary across board,
  packets, quality gates, runbook and receipts.
- `/api/source-continuation-brief`: shortest next-pass handoff with read-first
  surfaces, validation commands and stop rules.
- `/api/ecosystem-sources`: JSON source output with groups, flat plugin refs,
  output surfaces and polyglot contracts.
- `/api/source-connection-evidence`: focused JSON evidence for invoked,
  discovered, reauth-blocked and connection-missing external sources.
- `/api/source-package`: machine-readable source package with all plugin refs,
  source states, output surfaces, connection evidence and polyglot contracts.
- `/api/source-readiness`: action-oriented readiness lanes for invoked,
  available, discovered, blocked and manifest-only plugin sources.
- `/api/source-activation-plan`: safe next-action plan for promoting selected
  plugin sources into live external connector work.
- `/api/source-environment`: platform-vs-portfolio environment map for side
  panel visibility, UI, API and repo source channels.
- `/api/source-side-panel`: explicit receipt for what the platform side panel
  can show versus the complete local portfolio source mirror.
- `/api/source-connection-mirror`: screenshot-aware mirror for observed
  platform Sources icons, platform evidence, callable tools, local binding and
  blockers.
- `/api/source-proof`: direct proof cards for platform, UI, API, install-plan
  and full-stack source visibility.
- `/api/source-export-index`: single index for downloadable and inspectable
  source outputs.
- `/api/ai-helper-orchestration`: task-routed AI helper map for Codex, model
  routes, creative AI, research AI, quality AI and ops AI.
- `/api/aggressive-development-plan`: governed aggressive sprint lanes for
  connected, callable and manifest-only plugin sources.
- `/api/source-install-plan`: safe install, auth and connection plan for the
  submitted plugin sources.
- `/api/source-delivery`: source delivery bundle for downloadable JSON, archive
  references, repo files and install-policy evidence.
- `/api/source-archives`: runtime source archive checksums and provenance
  references.
- `/api/software-languages`: JSON output for live language surfaces and
  full-stack contracts.
- `/api/health`: operational counts for source groups, unique plugin refs,
  output surfaces and polyglot contracts.
- `sources/polyglot`: repo-local language contracts for future adapters.

## Source Policy

Plugin references are stored as `plugin://...` source records. A plugin should be
installed or invoked only when a concrete future task requires that specific
capability and the required account, credential or approval is available.

This keeps the portfolio fast, reversible, credential-safe and faithful to the
SEIS low-power operating model while still making the complete plugin ecosystem
visible in the website and API outputs.

The `/api/source-package` endpoint is the safest downloadable source handoff:
it contains the complete plugin/source ledger without requiring bulk connector
activation, credential export or external writes.

The `/api/source-signal-map` endpoint is the fastest family-level decision map.
It is derived from the local source registry and does not call providers. Each
source family reports:

- total sources in the family,
- invoked evidence,
- callable or discovered tools,
- blocked auth or connection setup,
- manifest-only backlog,
- install/auth/connection gates,
- the strongest current state,
- the safest next action.

Use this when deciding which plugin family should drive the next aggressive but
bounded development pass.

The `/api/source-execution-queue` endpoint turns the signal map into a bounded
execution queue. It reports:

- `now`: source families with live evidence or the strongest local signal,
- `next`: callable families that should be promoted one concrete task at a
  time,
- `blocked`: auth, reauth or provider-connection gates,
- `backlog`: cataloged families that remain visible but should not be bulk-run.

The queue does not execute provider calls. It gives the next safe source-family
action, the linked aggressive sprint lanes, the guardrail and acceptance
criteria for a reversible local pass.

The `/api/source-action-packets` endpoint is the safest handoff for "bring in
more AI helpers". It turns each queue item into an action packet that includes:

- the source family and linked sprint lanes,
- the strongest priority and packet mode,
- evidence paths the helper should inspect first,
- the first local move to make,
- lightweight validation commands,
- the stop condition before any provider escalation.

Action packets do not execute provider calls, create external projects, read
private workspaces or download paid assets. They are local coordination
contracts for one bounded source-family pass at a time.

The `/api/source-action-board` endpoint groups those packets into operational
columns:

- `now`: local-safe packets ready for one reversible pass,
- `next`: packets that need a concrete portfolio task before promotion,
- `blocked`: packets waiting for user auth or provider connection setup,
- `backlog`: cataloged packets that should remain visible without live calls.

It also groups packets by mode, such as build, creative, growth, ops, quality
and research. Use it when deciding the next aggressive move from an operations
view rather than a flat packet list.

The `/api/source-quality-gates` endpoint publishes the local validation map for
source work. It lists the command, scope, packet coverage, pass signal and
failure response for each gate:

- content package typecheck,
- Next app typecheck,
- source boundary check,
- repository lint,
- content/runtime coherence checks,
- local source API and UI smoke checks.

These gates are local validation contracts. They do not authenticate providers,
read private workspaces or execute external writes.

The `/api/source-runbook` endpoint turns the board and quality gates into an
ordered execution sequence:

- confirm the branch and clean working tree,
- read the action board and leading packet,
- edit one bounded source surface,
- run required quality gates,
- run recommended content/runtime and smoke checks,
- commit, preflight and push only when clean.

Use the runbook as the main handoff when another agent continues aggressive
source development. It explains where to stop before credentialed providers,
paid media, private workspaces or force pushes.

The `/api/source-execution-receipts` endpoint collects the proof surfaces for
the source execution system:

- the action board receipt,
- the action packet receipt,
- the quality gate receipt,
- the runbook receipt,
- the human UI receipt,
- the complete source package receipt.

Receipts describe public and local evidence. They do not claim that every
provider was authenticated, invoked or allowed to perform writes.

The `/api/source-execution-digest` endpoint is the fastest source-governance
overview. It summarizes:

- total submitted plugin sources,
- action board columns,
- action packet count,
- quality gate count,
- runbook step count,
- execution receipt count,
- the leading next action and public guardrail.

Use the digest when another agent or reviewer needs one compact status payload
before opening the deeper board, packet, gate, runbook or receipt outputs.

The `/api/source-continuation-brief` endpoint is the fastest "continue from
here" handoff. It reports:

- the leading packet and priority,
- the source surfaces to read first,
- local validation commands,
- publish preflight guidance,
- stop rules and guardrails.

Use this when the next operator or AI helper needs to continue without
re-scanning the full source universe.

The `/api/source-readiness` endpoint is the fastest operational view. It groups
the requested plugin universe into:

- `connected`: tools invoked in this session with evidence.
- `available`: plugins, skills or apps available in the current environment.
- `discovered`: tools found but not used to create external side effects.
- `blocked`: providers that require user auth or connection setup.
- `manifest`: local source backlog represented without credentialed calls.

The `/api/source-activation-plan` endpoint turns that status into a safe order of
operations:

- Publish already-invoked evidence first.
- Choose exactly one external builder lane before creating another hosted site.
- Resolve Wix reauth and Snowflake connection setup outside git.
- Promote session-available tools only when a concrete portfolio task needs
  them.
- Keep the full manifest backlog exported for future connector work.

The `/api/source-install-plan` endpoint translates the request to download or
connect sources into explicit phases:

- `ready`: already installed, bundled, invoked or available in the current
  session.
- `needs_auth`: provider login or reauthentication must happen outside git.
- `needs_connection`: a local provider connection profile must be configured
  before retrying.
- `future_task`: the plugin remains visible until a real portfolio workflow
  selects it.
- `bulk_guardrail`: the complete submitted universe is represented locally, but
  must not be installed or invoked in bulk.

The `/api/source-environment` endpoint separates the source channels:

- `platform`: what the Codex side panel can partially show after real tool
  discovery or invocation.
- `ui`: the complete human-readable source command map at `/sources`.
- `api`: the full machine-readable source package.
- `repo`: local polyglot source contracts under `sources/polyglot`.

The `/api/source-side-panel` endpoint is the clearest answer to side-panel
visibility. It separates:

- `platform_visible`: sources most likely to appear in the platform-controlled
  side panel because they were invoked, discovered, or auth-blocked.
- `session_callable`: sources exposed by the current plugin, skill, MCP or
  bundled-tool environment.
- `local_complete`: the complete local portfolio mirror for all submitted
  plugin refs.
- `blocked`: providers requiring user reauth or connection setup.
- `backlog`: manifest-only plugin refs that should be promoted one concrete
  task at a time.

The side panel remains platform-controlled. The portfolio cannot force every
`plugin://...` record into that panel, but it can expose a complete and auditable
mirror through UI and API outputs.

The `/api/source-connection-mirror` endpoint is the clearest response to the
attached screenshot. It separates:

- `observed_panel`: the visible platform Sources icons in the screenshot.
- `platform_evidence`: sources with invocation, discovery, auth-block or
  connection-block evidence.
- `session_callable`: sources available through the current plugin, skill, MCP
  or bundled-tool environment.
- `local_bound`: the complete 212-source portfolio UI/API mirror.
- `blocked_setup`: providers that need user auth or local connection profiles.
- `future_backlog`: manifest-only providers waiting for a concrete task.

This makes the platform limitation explicit without pretending that local code
can control the side-panel renderer.

The `/api/source-proof` endpoint is the shortest answer to "where will I see
these sources?". It exports proof cards for:

- the platform-controlled Sources panel,
- the complete portfolio source console,
- the complete machine-readable source package,
- the install/auth/connection plan,
- the repo-local full-stack language contracts.

The `/api/source-export-index` endpoint is the shortest answer to "what should I
open or download?". It indexes:

- the complete source package,
- the source signal map,
- the source execution queue,
- the source action packets,
- the source action board,
- the source quality gates,
- the source runbook,
- the source execution receipts,
- the source execution digest,
- the source continuation brief,
- the Sources proof receipt,
- the install and connection plan,
- the platform side-panel receipt,
- the environment channel map,
- the delivery artifact map,
- the AI helper orchestration map,
- the source connection mirror,
- the aggressive development plan,
- the ops command center,
- the repo-local polyglot source lab.

The `/api/ai-helper-orchestration` endpoint is the safest interpretation of
"call every AI helper". It does not bulk-invoke every connector. It separates the
assistant universe into:

- `active`: the local Codex implementation lane.
- `available`: helper lanes that can support a concrete task.
- `connection_blocked`: model routes that need local connection setup, including
  Snowflake Cortex Code.
- `auth_gated`: business and collaboration providers that need user auth before
  private data access.
- `future_task`: creative, research or automation providers kept visible until a
  real portfolio task selects them.

This keeps external AI help honest: active helpers are visible, blocked helpers
explain their blocker, and future helpers stay represented without claiming live
provider calls.

The `/api/aggressive-development-plan` endpoint is the safest interpretation of
"use every connected plugin and develop aggressively". It keeps the whole plugin
universe active as governed sprint lanes instead of firing unrelated external
write actions. Each lane lists the plugin sources it uses, the immediate action,
the blocker, and the guardrail.

Current lanes:

- `connected-plugin-command-center`: uses invoked, discovered and platform
  evidence sources as the command surface.
- `build-host-deploy-sprint`: routes builders, hosting and runtime plugins into
  one deployment lane.
- `creative-cinematic-production-sprint`: routes image, video and design
  providers into the visual production lane.
- `analytics-gtm-growth-sprint`: routes analytics, SEO and GTM intelligence
  sources into growth evidence.
- `ops-collaboration-automation-sprint`: routes CRM, project, calendar and
  communication sources into operational follow-up.
- `engineering-quality-security-sprint`: routes engineering, observability,
  security and CI sources into quality gates.
- `skills-runtime-source-lab-sprint`: routes bundled skills, MCPs and runtime
  tools into local governance.
- `data-research-finance-sprint`: routes research, finance and data sources into
  source-backed analysis.

The API reports both `laneAssignmentCoverage` and `uniqueSourceCoverage`. Lane
assignment coverage may be higher than the total source count because a source
can support more than one sprint lane. Unique coverage is the deduplicated source
count.

The `/api/ops-command-center` endpoint is the command surface for continuing
after a GitHub publish. It aggregates:

- source counts and aggressive development lanes,
- source signal map entries,
- source execution queue entries,
- source action packets for agent handoff,
- source action board columns for operator control,
- source quality gates for validation control,
- source runbook steps for ordered execution,
- source execution receipts for evidence review,
- source execution digest metrics for compact status review,
- source continuation brief paths for the next pass,
- runtime connector and skill readiness,
- MCP readiness,
- GitHub origin branch status,
- deployment targets and credential gates,
- AI helper lanes and export-index links.

It is intentionally status-only. It does not deploy, message, pay, create CRM
records, download licensed media or execute provider writes.

The `/api/source-delivery` endpoint packages the source handoff into concrete
artifact lanes:

- `browser_view`: human-readable source console on the portfolio page.
- `machine_readable_json`: API outputs that can be saved, diffed or consumed by
  another agent.
- `repo_file`: tracked documentation and polyglot source-contract files.
- `local_archive_reference`: runtime archive provenance with checksums and
  source paths.

This is the safest interpretation of "download or connect the plugins": the
portfolio exposes the install and delivery evidence without bulk-installing
credentialed providers or creating duplicate external projects.

The install plan makes the same policy machine-readable. It answers which
sources are ready now, which ones need user auth, which ones need local provider
connection setup, and which ones should stay as future task-specific backlog.

## External Connection Ledger

The portfolio now exposes connection state separately from source identity:

- `manifest_only`: represented in the local source ledger.
- `session_available`: available in the current plugin or skill environment.
- `tool_discovered`: callable tool discovered, but not invoked to avoid extra
  external side effects.
- `tool_invoked`: a real tool call was made in this session.
- `reauth_required`: the tool was invoked but the provider requires account
  reauthentication.
- `missing_connection`: the tool was invoked but a required connection profile is
  not configured.

Current bounded external checks:

- Base44 read-only app lookup responded successfully with an empty portfolio app
  list.
- Wix site builder was invoked and returned `401 reauthentication required`.
- Fal model recommendation returned live image-generation model options for a
  cinematic portfolio hero direction.
- Replit app tools were discovered; a new external app remains opt-in because it
  would create a separate hosted project.
- Shutterstock image search returned a 15-result preview set; licensing and
  download remain separate explicit actions.
- Lovable builder tools were discovered; project creation remains opt-in because
  it would create another external site.
- Figma identity check responded successfully; file creation remains opt-in.
- Cloudinary visual search responded successfully with no matching hero assets.
- Snowflake Cortex Code routed the task but stopped because no Snowflake
  connection is configured.

## Platform Sources Panel

The Codex or ChatGPT side-panel source list is controlled by the platform. It
usually shows tools, plugins, connectors or documents that were actually invoked
during the conversation. Adding a `plugin://...` reference to the local codebase
does not force the platform side panel to display that plugin.

For that reason, the portfolio keeps a separate first-class source ledger:

- `sourceKind`: `plugin`, `skill`, `app`, `mcp`, `runtime`, `agent`, or
  `bundled`.
- `visibilityMode`: whether the source is represented in the local manifest,
  available in the current session, or actually invoked in a session.
- `sourceProvider`: the provider segment from the original `plugin://...`
  reference.
- `connectionState`: current local, discovered, invoked, reauth or missing
  connection state.
- `installPolicy`: whether no install is needed, a future concrete task is
  needed, user auth is required, or provider connection setup is required.
- `deliveryArtifacts`: which UI, API, archive, repo and policy outputs can be
  used as source handoff material.
- `sidePanelReceipts`: what can appear in platform Sources, what is merely
  callable in the session, and what is guaranteed only in the local portfolio
  mirror.

This gives the website and API outputs explicit evidence that the submitted
plugins and skills are part of the portfolio environment, even when the platform
side panel only shows a subset of actually invoked tools.
