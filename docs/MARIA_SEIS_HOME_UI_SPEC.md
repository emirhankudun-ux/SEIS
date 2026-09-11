# MARIA × SEIS — Home Workspace UI Specification

Status: canonical visual direction for implementation
Date: 2026-09-11
Scope: desktop-first Personal Intelligence OS home workspace, with responsive adaptation for mobile/tablet

## Intent

The home surface should feel like a premium personal intelligence operating system rather than a conventional chatbot dashboard. The visual language combines cinematic editorial imagery, restrained glass surfaces, deep black/graphite materials, warm Mediterranean light, high-information density, and calm spatial hierarchy.

The six concept boards approved during design review on 2026-09-11 define the visual family. Implementation should synthesize their strongest ideas rather than reproduce any single board pixel-for-pixel.

## Canonical layout

### 1. Left navigation rail

Persistent desktop rail with clear groups and strong information architecture.

Primary:
- Home
- Chat
- Vision
- Image
- Video
- Voice
- Search / Research
- Browser Agent
- Computer Control
- Code
- Game Dev
- Design Studio
- 3D & Motion
- Automation

Workspace / intelligence:
- Spaces or Projects
- Files
- Knowledge
- Memory
- Agents
- MCP & Plugins

System:
- Settings

Requirements:
- Active item uses a subtle filled glass state, not a loud color block.
- Icons remain semantic and consistent.
- Labels may collapse at narrow desktop widths.
- Rail must support keyboard navigation and accessible names.

### 2. Global command bar

A top-level command/search field is the primary universal entry point.

Capabilities:
- text prompt
- voice input
- command palette
- project-aware actions
- quick tool invocation
- keyboard shortcut display, e.g. `⌘K`

The bar should read as a system command surface, not a chat-only composer.

### 3. Hero intelligence canvas

The center is the emotional and functional focal point.

Content:
- canonical Maria portrait / cinematic environment
- contextual greeting to Emirhan
- short editorial statement or quote
- live Maria intelligence orb
- listening / thinking / speaking state visualization
- current workspace context

The Maria orb is the primary identity object of the operating system. It should support animated states such as:
- idle
- listening
- thinking
- speaking
- executing
- warning
- offline/local-only

Do not let the portrait overpower controls. Text and interaction surfaces must remain readable over imagery.

### 4. Primary capability launcher

Use a compact, high-priority tool row or card grid for:
- Chat
- Vision
- Image
- Video
- Voice
- Code
- Game Dev
- Design
- 3D & Motion
- Research
- Automation
- Agents
- More

On desktop, a two-row capability grid or single horizontal launcher may be used depending on available width. On mobile, use a horizontally scrollable or compact two-column treatment.

### 5. Main projects

Persistent cards for core workspaces:
- Deadly Evil
- SEIS Core
- Eleni-Neferi
- Art Universe / Portfolio

Each project card should expose only useful metadata:
- project title
- category
- progress/status
- current task or next action
- tags for core technologies or disciplines

Avoid fake progress values. If the backend has no reliable completion metric, show status text instead of a fabricated percentage.

### 6. Right intelligence rail

Desktop-only or adaptive secondary column containing compact live information.

Preferred modules:
- Global Intelligence / world clock
- System Status
- Recent Activity
- Weather / date / time when enabled
- contextual quote or daily focus

System Status should use real telemetry when available:
- CPU
- memory
- storage
- GPU where supported
- model/runtime state
- local/cloud connectivity

Do not hardcode hardware statistics into production UI.

### 7. Recent activity

Display recent meaningful actions across SEIS:
- Unreal project work
- image generation
- research
- code assistant changes
- file organization
- agent runs

Each item should include:
- action type
- concise result
- project/source
- relative time

Activity must be generated from real application events where possible.

### 8. Music / ambient media

Music is optional and should behave like a secondary ambient widget, never a required core dependency.

If enabled, expose:
- artwork
- track / artist
- play/pause
- progress
- next/previous

Integrations should respect provider terms and user permissions.

## Visual language

### Materials

- near-black foundation
- charcoal and graphite surfaces
- restrained glass / translucent panels
- thin warm-gray borders
- subtle blur only where it improves hierarchy
- minimal shadow usage
- warm ivory typography
- restrained cyan for telemetry
- warm amber / champagne accents for Maria identity
- green only for healthy/live states
- red only for warnings/errors

Avoid:
- excessive neon
- generic sci-fi HUD styling
- heavy gradients everywhere
- large glowing borders on every card
- visually noisy dashboards

### Typography

Use a two-family hierarchy:

1. Interface sans for navigation, controls, metrics, status, and body text.
2. Editorial serif or carefully selected display face for hero greetings, quotes, and premium identity moments.

Do not use script fonts for functional text. A signature-style Maria mark may be used only as an identity accent.

### Spacing and grid

Desktop baseline:
- 12-column content grid
- 8 pt spacing system
- compact but breathable card padding
- fixed navigation rail
- adaptive right rail
- central hero area receives the largest visual weight

Every major module must snap to consistent vertical and horizontal rhythm.

## Interaction hierarchy

Priority order:
1. command / ask Maria
2. current project / resume work
3. primary tools
4. recent activity
5. system/context widgets
6. decorative/editorial content

The UI should make it possible to continue meaningful work within one or two actions from Home.

## Responsive behavior

### Large desktop

- left navigation rail visible
- center hero and project workspace
- right intelligence rail visible
- high information density

### Compact desktop / laptop

- left rail may collapse to icons
- right rail becomes stacked or drawer-based
- hero remains dominant
- tool launcher compresses before removing functionality

### Tablet

- single primary content column with optional side drawer
- system and global intelligence widgets move below main actions

### Mobile

- no desktop dock imitation
- full-screen app experience
- bottom navigation may expose Home, Spaces/Projects, Agents, Library, Settings
- command composer remains thumb-reachable
- Maria visual remains present but reduced in area
- cards become vertical and task-focused

## Accessibility requirements

- WCAG-conscious contrast for all functional text
- keyboard navigation on desktop
- visible focus states
- minimum touch target sizing on touch devices
- reduced-motion support
- semantic labels for icon-only controls
- state is never communicated by color alone
- background imagery must not reduce text readability

## Data integrity rules

The concept boards contain illustrative values such as times, weather, system percentages, recent activity, project progress, and hardware labels. Production implementation must replace these with real providers or explicitly identified preview/mock data.

Never present fabricated metrics as live telemetry.

## Component architecture recommendation

Suggested component boundaries:
- `AppShell`
- `NavigationRail`
- `GlobalCommandBar`
- `MariaHero`
- `MariaOrb`
- `CapabilityLauncher`
- `ProjectGrid`
- `ProjectCard`
- `IntelligenceRail`
- `GlobalIntelligenceCard`
- `SystemStatusCard`
- `RecentActivityCard`
- `WeatherTimeCard`
- `AmbientMediaCard`
- `QuickActions`

Components should consume semantic design tokens and real data interfaces rather than embed visual constants or sample values.

## Motion direction

Motion should feel calm, premium, and functional.

Recommended:
- soft orb breathing in idle state
- waveform response during listening/speaking
- subtle parallax in hero imagery only when performant
- short spring/opacity transitions on cards
- smooth command state changes

Avoid constant motion that competes with work.

## Implementation gate

A Home UI implementation is acceptable only when:
- layout hierarchy matches this specification
- Maria identity is visually dominant but not obstructive
- all primary capabilities remain reachable
- project continuation is obvious
- telemetry is real or explicitly mocked
- responsive states are implemented
- keyboard and accessibility paths are tested
- reduced motion is supported
- design tokens are reused instead of scattered magic values
- the result feels like one coherent Personal Intelligence OS rather than a collection of unrelated widgets

## Design decision

The preferred direction is a synthesis of the approved concept family: full-screen desktop workspace, fixed navigation rail, cinematic Maria hero, central Maria intelligence orb, compact capability launcher, project continuation cards, and a restrained right-side intelligence rail.

The macOS Dock should not be reproduced inside the product UI. Native OS chrome remains the responsibility of the platform; SEIS should occupy the application surface cleanly and feel full-screen when the window allows it.
