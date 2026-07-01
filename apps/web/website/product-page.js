(function () {
  "use strict";

  const pages = {
    overview: {
      title: "SEIS Website",
      eyebrow: "Product website hub",
      subtitle: "A premium local website map for SEIS AI, OS, Code, Design, Search, Cloud, Store, and Agents.",
      pageStatus: "Local website pages. No provider key, SSH command, deployment, or external API call required.",
      cta: ["Open SEIS OS", "../seis-linux-replica.html?demo=live"],
      secondary: ["Open Search", "../desktop.html#search"],
      stats: [["9", "website pages"], ["0", "core API keys"], ["Local", "demo boundary"], ["190", "WOW references"]],
      capabilities: [
        ["Unified story", "Explains the full ecosystem without requiring the user to read governance docs first."],
        ["Product routes", "Each core product lane has its own static page and direct OS route."],
        ["Truthful states", "Mock, planned, disabled, and local demo boundaries are stated as product copy."],
        ["Runnable handoff", "All pages are included in the static package and can run from the local server."]
      ],
      proof: ["desktop.html", "seis-code.html", "wow-gallery.html", "mythic-gacha.html"],
      related: ["seis-ai", "seis-os", "seis-code", "seis-design", "seis-search", "seis-cloud", "seis-store", "seis-agents"]
    },
    "seis-ai": {
      title: "SEIS AI",
      eyebrow: "AI Core application layer",
      subtitle: "Provider-neutral AI command center with Local Demo mode, model-router concepts, agent status, plugin awareness, and no-key operation.",
      pageStatus: "Current page is local demo evidence. Live provider routing remains disabled until backend credentials and gateway validation exist.",
      cta: ["Open AI Center", "../desktop.html#ai-assistant"],
      secondary: ["Open AI Core 3D", "../ai-core-demo/index.html"],
      stats: [["Local Demo", "provider identity"], ["6", "profile lanes"], ["5", "version targets"], ["0", "browser keys"]],
      capabilities: [
        ["Model router concept", "Routes are described by capability, privacy, provider status, cost, and fallback."],
        ["Agent activity", "Architect, Code, Design, Security, Cloud, Documentation, and QA roles are visible as bounded lanes."],
        ["Plugin awareness", "Installed AI profile matrix keeps unavailable providers marked Missing Key or Disabled."],
        ["Truthful fallback", "The Claude-style command remains Local Demo unless Anthropic is configured server-side."]
      ],
      proof: ["SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX", "Local Demo", "Missing Key", "Disabled"],
      related: ["seis-os", "seis-search", "seis-code", "seis-agents"]
    },
    "seis-os": {
      title: "SEIS OS",
      eyebrow: "Desktop operating surface",
      subtitle: "Linux-like flexibility, macOS-level polish, and Windows-like productivity expressed as an original SEIS browser OS.",
      pageStatus: "Browser-contained OS demo. It is not a host OS replacement and does not execute privileged system commands.",
      cta: ["Open Live SEIS OS", "../seis-linux-replica.html?demo=live"],
      secondary: ["Open Classic Desktop", "../desktop.html#seis-system-os"],
      stats: [["286", "apps"], ["219", "reference modules"], ["3", "smoked entry modes"], ["0", "provider keys"]],
      capabilities: [
        ["Window manager", "Draggable, resizable, snapped, minimized, restored, and persisted app windows."],
        ["System shell", "Top bar, dock, launcher, command palette, recents, notifications, quick settings, and wallpapers."],
        ["Virtual files", "Files, Terminal, SEIS Code, and exports share one browser-local VFS."],
        ["Responsive mode", "Desktop windows collapse to a usable mobile shell with no horizontal overflow."]
      ],
      proof: ["check:seis-linux-replica-browser-smoke", "summary.json", "seis-linux-replica.html?demo=live", "desktop.html"],
      related: ["seis-code", "seis-search", "seis-store", "seis-cloud"]
    },
    "seis-code": {
      title: "SEIS Code",
      eyebrow: "Browser IDE",
      subtitle: "A SEIS-branded VS Code-style workspace with editor, terminal, route awareness, extensions, source control mock mode, and VFS persistence.",
      pageStatus: "Current route is browser-safe. Native binary execution and real repository mutation are not claimed.",
      cta: ["Open SEIS Code", "../seis-code.html"],
      secondary: ["Open Code in OS", "../desktop.html#seis-code"],
      stats: [["25", "language modes"], ["8", "top menus"], ["5", "activity views"], ["IndexedDB", "persistence"]],
      capabilities: [
        ["Explorer", "Open, edit, save, and mirror files from the SEIS Desktop workspace."],
        ["Terminal", "Browser-safe commands operate on the virtual file system."],
        ["Extensions", "Local extension catalog supports install, enable, disable, and persistence."],
        ["AI assistant", "Local Demo code assistant keeps provider identity visible and no-key by default."]
      ],
      proof: ["check:seis-code", "seis-code.html", "seis-code.js", "Desktop bridge smoke"],
      related: ["seis-os", "seis-ai", "seis-design", "seis-search"]
    },
    "seis-design": {
      title: "SEIS Design",
      eyebrow: "Creative studio",
      subtitle: "A premium design lane for product pages, video heroes, Mythic Gacha, design tokens, visual references, and handoff artifacts.",
      pageStatus: "Runtime image generation is not required. Imported references remain labeled as reference material.",
      cta: ["Open Design Studio", "../desktop.html#seis-design"],
      secondary: ["Open WOW Gallery", "../wow-gallery.html"],
      stats: [["4", "video heroes"], ["60", "mythic cards"], ["190", "WOW pages"], ["Local", "assets"]],
      capabilities: [
        ["Design system", "Tokens, component cards, typography, colors, and prototype previews are surfaced as product controls."],
        ["Cinematic pages", "Nature, Still Life, Materials, and Metal Parts routes carry the video hero story."],
        ["Mythic game", "Gacha and bestiary provide an artful playable product surface with no live generation key."],
        ["Handoff", "Design state saves into the shared virtual file system for SEIS Code and Terminal."]
      ],
      proof: ["check:video-hero-showcase", "check:mythic-gacha", "wow-gallery.html", "SEIS_WOW imports"],
      related: ["seis-code", "seis-store", "seis-ai", "seis-os"],
      agencyKit: {
        status: "No-key draft workflow",
        storageKey: "seis.design.agencyPack.v1",
        handoffStorageKey: "seis.design.agencyPack.handoff.v1",
        codeWorkspacePath: "/workspace/Design/seis-design-agency-pack.md",
        summary: "Build a local draft pack for creative brief, client discovery intake, brand and offer naming, brand strategy workshop, proposal scope estimate, agency quote comparison, agency cost control, agency cost defense, design sprint timeline, competitive positioning matrix, brand voice messaging matrix, typography hierarchy matrix, color system accessibility matrix, brand rationale deck, visual reference moodboard, creative asset shot list, logo concept evaluation, brand usage guideline, landing page blueprint, creative director QA, design review decision, approval state transition, revision plan, client feedback triage, case study layout, visual QA evidence, production file manifest, asset size specs, print production readiness, client approval, client-ready export index, brand audit, brand token map, launch asset matrix, social content calendar, social variants, presentation system, asset provenance, and client handoff.",
        fields: [
          ["audience", "Audience", "Founder-led team preparing a premium public demo"],
          ["offer", "Offer", "No-key design production kit for website, social, presentation, and handoff work"],
          ["clientDiscoveryIntakeFocus", "Client discovery intake focus", "Decision maker, success metric, existing assets, missing inputs, channel needs, legal blockers, private asset boundary, and next evidence request"],
          ["brandOfferNamingFocus", "Brand and offer naming focus", "Name options, offer phrase, audience fit, pronunciation, memorability, domain/social availability notes, trademark blocker, rejected names, and decision owner"],
          ["brandStrategyWorkshopFocus", "Brand strategy workshop focus", "Business goal, audience promise, stakeholder priorities, must-say/must-not-say rules, proof gaps, decision owner, and unresolved questions"],
          ["format", "Deliverable format", "Landing page direction, campaign starter, provenance sheet, and handoff checklist"],
          ["landingPageBlueprintFocus", "Landing page blueprint focus", "Hero promise, section order, proof blocks, objection handling, CTA ladder, responsive priority, accessibility notes, analytics questions, and owner"],
          ["scope", "Scope level", "Brand sprint plus launch kit, no paid media execution"],
          ["budgetBand", "Budget band", "Avoid unchecked agency retainer; keep scope review-ready before spend"],
          ["quoteBaseline", "Quote baseline", "External agency quote, retainer, or estimate to compare against scope and evidence"],
          ["agencyCostControlFocus", "Agency cost control focus", "Line item, SEIS in-house route, external-buy trigger, quality risk, evidence requirement, decision owner, and approval gate"],
          ["agencyCostDefenseFocus", "Agency cost defense focus", "Quoted line item, replaceable deliverables, in-house coverage index, must-buy trigger, risk owner, validation proof, and next spend decision"],
          ["designSprintTimelineFocus", "Design sprint timeline focus", "Discovery day, strategy freeze, production block, review checkpoint, revision window, QA pass, handoff day, owner, and blocker rule"],
          ["internalProductionPath", "Internal production path", "Use SEIS draft pack, validation commands, human review, and SEIS Code handoff before buying external work"],
          ["competitivePositioningFocus", "Competitive positioning focus", "Competitor set, category cues, visual territory, differentiation claim, whitespace opportunity, evidence gaps, risks, and decision owner"],
          ["messagingVoiceFocus", "Brand voice focus", "Tagline options, message hierarchy, tone rules, proof points, CTA language, channel adaptations, claim risk, and copy review owner"],
          ["typographyHierarchyFocus", "Typography hierarchy focus", "Display face, text face, scale, hierarchy roles, contrast, readability, language support, font license blocker, and implementation owner"],
          ["colorSystemFocus", "Color system focus", "Primary, accent, surface, text, status colors, contrast pairs, dark mode behavior, token mapping, accessibility risk, and review owner"],
          ["rationaleFocus", "Rationale focus", "Explain the audience, offer, hierarchy, proof, tone, accessibility, and rollout logic behind the design"],
          ["moodboardDirectionFocus", "Moodboard direction focus", "Reference themes, color mood, type attitude, imagery cues, motion tone, provenance notes, rejected directions, and review owner"],
          ["creativeAssetShotListFocus", "Creative asset shot list focus", "Scene, composition, crop, lighting, prop, format, motion need, source/provenance status, release risk, and production owner"],
          ["logoConceptFocus", "Logo concept focus", "Concept options, mark style, wordmark fit, small-size readability, monochrome use, misuse risk, trademark review blocker, and decision owner"],
          ["usageGuidelineFocus", "Usage guideline focus", "Logo spacing, color use, type hierarchy, imagery rules, do/don't examples, accessibility, misuse boundaries, and escalation owner"],
          ["designReviewDecisionFocus", "Design review decision focus", "Approve, revise, or hold decision, severity, visual debt, blocking fixes, polish queue, evidence links, publication blocker, owner, and next action"],
          ["approvalStateTransitionFocus", "Approval state transition focus", "Draft, review-ready, revise, hold, approved-for-handoff, evidence link, reviewer, blocker, validation command, rollback note, and next action"],
          ["revisionRound", "Revision round", "One decision round plus one polish round before publication"],
          ["feedbackTriageFocus", "Feedback triage focus", "Sort client comments into decision fixes, polish, out-of-scope requests, risks, owner, and next review action"],
          ["caseStudyFocus", "Case study focus", "Context, challenge, response, proof, accessibility notes, quality path, and publication boundary"],
          ["deliveryStandard", "Delivery standard", "Source paths, export specs, provenance, accessibility notes, and rollback"],
          ["printProductionFocus", "Print production focus", "Trim size, bleed, safe zone, color mode, resolution, export format, paper/vendor notes, proof status, and review owner"],
          ["visualEvidenceTarget", "Visual evidence target", "Desktop screenshot, mobile screenshot, SEIS Code review screenshot, reduced-motion note, and overflow check"],
          ["exportIndexTarget", "Export index target", "Client-ready index of included files, review state, source paths, blockers, and excluded work"],
          ["channels", "Primary channels", "Website hero, wide preview, square post, vertical story, deck cover, and thumbnail"],
          ["contentCalendarFocus", "Content calendar focus", "Launch themes, channel cadence, publish dates, asset format, caption hook, CTA, asset owner, review state, and scheduling boundary"],
          ["approvalCheckpoint", "Approval checkpoint", "Approve, revise, or hold after reviewing proof, exclusions, risk, and export readiness"],
          ["deadline", "Deadline", "Next review-ready PR slice"],
          ["approvalOwner", "Approval owner", "Human reviewer before publication"]
        ],
        outputs: [
          ["creative-brief", "Audience, offer, tone, formats, constraints, deadline, and approval owner."],
          ["client-discovery-intake-matrix", "Decision maker, success metric, existing assets, missing inputs, channel needs, legal blockers, private asset boundary, next evidence request, and no-client-contract boundary."],
          ["brand-offer-naming-matrix", "Name options, offer phrase, audience fit, pronunciation, memorability, domain/social availability notes, trademark blocker, rejected names, decision owner, and no-brand-name-clearance boundary."],
          ["brand-strategy-workshop-matrix", "Workshop agenda, business goal, audience promise, stakeholder priorities, must-say/must-not-say rules, proof gaps, decision owner, unresolved questions, and no-business-strategy-guarantee boundary."],
          ["proposal-scope-estimator", "Scope, effort band, cut list, review owner, and no-price-guarantee boundary for replacing vague agency quotes with a clear work package."],
          ["agency-quote-comparator", "Compare external agency quote scope against SEIS deliverables, missing evidence, risks, exclusions, and no-guaranteed-savings boundary."],
          ["agency-cost-control-matrix", "Line item, SEIS in-house route, external-buy trigger, quality risk, evidence requirement, decision owner, approval gate, and no-procurement-advice boundary."],
          ["agency-cost-defense-calculator", "Computed coverage index, replace/defer/buy decision path, in-house proof count, must-buy trigger, risk owner, next spend decision, and no-financial-advice boundary."],
          ["design-sprint-timeline-matrix", "Discovery day, strategy freeze, production block, review checkpoint, revision window, QA pass, handoff day, owner, blocker rule, and no-delivery-date-guarantee boundary."],
          ["competitive-positioning-matrix", "Competitor set, category cues, visual territory, differentiation claim, whitespace opportunity, evidence gaps, risk notes, decision owner, and no-market-research boundary."],
          ["brand-voice-messaging-matrix", "Tagline options, message hierarchy, tone rules, proof points, CTA language, channel adaptations, claim risk, copy review owner, and no-legal-copy-approval boundary."],
          ["typography-hierarchy-matrix", "Type pairing, hierarchy roles, scale, contrast, readability checks, language support, fallback notes, font license blocker, implementation owner, and no-font-license boundary."],
          ["color-system-accessibility-matrix", "Primary, accent, surface, text, status color roles, contrast pairs, dark-mode behavior, token mapping, accessibility risk, review owner, and no-accessibility-certification boundary."],
          ["brand-rationale-deck", "Design decision narrative covering audience, offer, hierarchy, proof, token choices, usage logic, objections, and next review action."],
          ["visual-reference-moodboard", "Reference themes, color mood, type attitude, imagery cues, motion tone, provenance notes, rejected directions, review owner, and no-asset-license boundary."],
          ["creative-asset-shot-list-matrix", "Scene, composition, crop, lighting, prop, format, motion need, source/provenance status, release risk, production owner, and no-model-release-approval boundary."],
          ["logo-concept-evaluation", "Logo direction matrix for concept options, mark style, wordmark fit, small-size readability, monochrome use, misuse risk, trademark review blocker, decision owner, and no-final-logo-approval boundary."],
          ["brand-usage-guideline", "Usage rules for logo spacing, color use, type hierarchy, imagery treatment, do/don't examples, accessibility, misuse boundaries, and escalation owner."],
          ["creative-director-review", "Creative quality scorecard with decision, required fixes, polish queue, accessibility check, and publication gate."],
          ["design-review-decision-matrix", "Approve, revise, or hold decision, severity, visual debt, blocking fixes, polish queue, evidence links, publication blocker, owner, next action, and no-creative-director-approval boundary."],
          ["approval-state-transition-ledger", "Draft, review-ready, revise, hold, approved-for-handoff state changes with evidence link, reviewer, blocker, validation command, rollback note, next action, and no-automatic-signoff boundary."],
          ["revision-round-plan", "Decision round, polish round, owner, acceptance criteria, and no-endless-revision boundary."],
          ["client-feedback-triage-board", "Client comment triage for decision fixes, polish, out-of-scope requests, risk notes, owner, and next review action without claiming stakeholder consensus."],
          ["case-study-layout", "Case study structure for context, challenge, response, proof, accessibility notes, quality path, CTA, and no-verified-results boundary."],
          ["visual-qa-evidence-ledger", "Screenshot targets, viewport checks, accessibility notes, reviewer decision, blocker list, and no-fabricated-evidence boundary."],
          ["production-file-manifest", "Source paths, export formats, naming convention, provenance, validation commands, rollback, and delivery status."],
          ["asset-size-spec-sheet", "Starter export ratios, channel roles, safe-zone notes, naming suffixes, and verify-before-publication boundary."],
          ["print-production-readiness-matrix", "Trim, bleed, safe zone, color mode, resolution, export format, paper/vendor notes, proof status, review owner, and no-print-proof-approval boundary."],
          ["client-approval-packet", "Decision summary, included assets, exclusions, known risks, approval owner, and next-round boundary."],
          ["client-ready-export-index", "Client-ready index of included outputs, source paths, review state, blockers, exclusions, and no-archive-delivery boundary."],
          ["brand-token-map", "Color, type, spacing, radius, motion, contrast, and usage notes tied to SEIS tokens."],
          ["brand-audit-scorecard", "Positioning, clarity, contrast, consistency, asset quality, and public-readiness scorecard."],
          ["landing-page-direction", "Hero, proof, offer, workflow, CTA, responsive notes, and no-key route boundary."],
          ["landing-page-blueprint-matrix", "Section order, hero promise, proof blocks, objection handling, CTA ladder, responsive priority, accessibility notes, analytics questions, owner, and no-conversion-guarantee boundary."],
          ["launch-asset-matrix", "Website, social, presentation, thumbnail, banner, and handoff asset list with owner/status gates."],
          ["social-campaign-brief", "Post, story, banner, caption, CTA, visual direction, and variant review notes."],
          ["social-content-calendar-matrix", "Launch themes, channel cadence, publish dates, asset format, caption hook, CTA, asset owner, review state, and no-social-media-scheduling boundary."],
          ["social-variant-set", "LinkedIn, Instagram, X, story, banner, and announcement variants with draft copy direction."],
          ["asset-provenance-sheet", "Source, license, transformation, approval, publication boundary, and fallback asset notes."],
          ["presentation-cover-system", "Cover, section divider, proof slide, roadmap slide, and handoff note direction."],
          ["presentation-system-map", "Cover, agenda, proof, comparison, roadmap, close, and speaker-note structure."],
          ["handoff-checklist", "Files changed, source paths, validation commands, accessibility notes, risks, rollback, and next actions."]
        ],
        workboards: [
          ["brand-audit-scorecard", "Brand Audit Scorecard", [
            "Positioning clarity: audience, offer, proof, and promise are stated before visuals.",
            "Visual consistency: colors, type, spacing, radius, and motion reuse SEIS tokens before one-off styling.",
            "Accessibility: contrast, focus states, reduced motion, and mobile line breaks are review gates.",
            "Public readiness: no private assets, no client secrets, and provenance before publication."
          ]],
          ["client-discovery-intake-matrix", "Client Discovery Intake Matrix", [
            "Stakeholder map: identify decision maker, reviewer, contributor, legal blocker, and approval owner before production starts.",
            "Evidence request: list existing assets, missing inputs, audience proof, channel needs, technical constraints, and private asset boundary.",
            "Readiness state: mark ready, needs evidence, blocked, deferred, or external-specialist review with one next action.",
            "Boundary: not a client contract, not legal onboarding, and not private asset storage."
          ]],
          ["brand-offer-naming-matrix", "Brand & Offer Naming Matrix", [
            "Name set: compare literal, coined, descriptive, editorial, and system-style name options with rejected-name notes.",
            "Offer fit: map each option to audience promise, offer phrase, pronunciation, memorability, channel fit, and visual identity fit.",
            "Availability review: record domain/social availability notes, trademark blocker, SEO confusion risk, decision owner, and next evidence request.",
            "Boundary: not a brand name clearance, not trademark clearance, and not domain registration."
          ]],
          ["brand-strategy-workshop-matrix", "Brand Strategy Workshop Matrix", [
            "Workshop agenda: capture business goal, audience promise, category pressure, stakeholder priorities, and required decisions before visual work starts.",
            "Decision map: separate must-say, must-not-say, proof needed, open questions, risk notes, and decision owner.",
            "Alignment path: mark agreed, unresolved, needs evidence, deferred, or blocked with one next review action.",
            "Boundary: not a business strategy guarantee, not stakeholder consensus guarantee, and not market research."
          ]],
          ["landing-page-blueprint-matrix", "Landing Page Blueprint Matrix", [
            "Page spine: define hero promise, audience pain, offer, proof blocks, objection handling, and CTA ladder before production.",
            "Section map: order hero, problem, solution, proof, workflow, trust, pricing/ask, FAQ, final CTA, and handoff notes.",
            "Responsive QA: assign desktop/mobile priority, accessibility notes, analytics questions, source paths, and page owner.",
            "Boundary: not a conversion guarantee, not search ranking guarantee, and not legal copy approval."
          ]],
          ["proposal-scope-estimator", "Proposal Scope Estimator", [
            "Scope package: define what SEIS will produce in this PR slice before any client-facing promise.",
            "Effort boundary: separate must-ship assets, optional polish, and explicitly excluded agency services.",
            "Spend guard: compare the work package against an agency quote without claiming fixed pricing or legal advice.",
            "Approval path: record review owner, validation commands, publication gate, and rollback note."
          ]],
          ["agency-quote-comparator", "Agency Quote Comparator", [
            "Quote baseline: record what the outside proposal includes, excludes, requires, and leaves unverified.",
            "SEIS coverage: map each quoted line item to an existing draft output, validation command, or missing evidence.",
            "Decision lens: keep, replace, defer, or buy external help based on risk, quality gap, and review owner.",
            "Boundary: not a guaranteed cost saving, not a binding quote, and not legal, tax, or procurement advice."
          ]],
          ["agency-cost-control-matrix", "Agency Cost Control Matrix", [
            "Line items: split agency cost into strategy, identity, web, content, social, production, QA, handoff, and specialist work.",
            "SEIS route: map each line item to in-house output, evidence requirement, validation command, owner, and quality risk.",
            "Decision gate: mark build in SEIS, buy external help, defer, needs specialist review, or blocked before spend.",
            "Boundary: not procurement advice, not a guaranteed cost saving, and not a binding quote."
          ]],
          ["agency-cost-defense-calculator", "Agency Cost Defense Calculator", [
            "Coverage index: calculate the current output, workboard, and review-gate coverage before deciding whether to buy external help.",
            "Decision path: mark replace in SEIS, defer, buy specialist help, or block until evidence based on proof count and risk.",
            "Spend trigger: require a named risk owner, validation proof, and next spend decision before any external purchase.",
            "Boundary: not financial advice, not a guaranteed cost saving, and not procurement approval."
          ]],
          ["design-sprint-timeline-matrix", "Design Sprint Timeline Matrix", [
            "Sprint spine: map discovery, strategy freeze, identity production, web/content production, QA, revision, approval, and handoff days.",
            "Milestone gates: assign owner, required evidence, validation command, blocker rule, and next decision for each phase.",
            "Scope control: separate must-ship, polish, deferred, blocked, and external-specialist items before timeline pressure grows.",
            "Boundary: not a delivery date guarantee, not project management service, and not client approval."
          ]],
          ["competitive-positioning-matrix", "Competitive Positioning Matrix", [
            "Competitor set: list direct, aspirational, and adjacent references with source notes and uncertainty labels.",
            "Visual territory: map category cues, color/type conventions, layout patterns, proof style, and whitespace opportunity.",
            "Differentiation: record what SEIS should own, avoid, borrow as a pattern, or reject before visual production.",
            "Boundary: not market research, not competitor legal advice, and not proof of market demand."
          ]],
          ["brand-voice-messaging-matrix", "Brand Voice & Messaging Matrix", [
            "Voice rules: define brand tone, banned phrases, plain-language standard, and channel-specific personality before visuals scale.",
            "Message hierarchy: compare tagline options, primary promise, proof points, objections, CTA language, and audience fit.",
            "Claim risk: mark unverifiable claims, regulated language, legal-copy blockers, review owner, and next copy decision.",
            "Boundary: not legal copy approval, not compliance review, and not an advertising performance guarantee."
          ]],
          ["typography-hierarchy-matrix", "Typography Pairing & Hierarchy Matrix", [
            "Pairing: compare display, text, UI, mono, and fallback type roles against brand tone, content density, and platform needs.",
            "Hierarchy: define H1, H2, body, caption, button, data, and code scale decisions with contrast and line-length notes.",
            "Readability: record small-size behavior, multilingual support, accessibility risk, implementation owner, and fallback stack.",
            "Boundary: not a font license, not typeface ownership, and not permission to use paid fonts without review."
          ]],
          ["color-system-accessibility-matrix", "Color System Accessibility Matrix", [
            "Color roles: define primary, accent, surface, border, text, muted, success, warning, danger, and info usage before visual polish.",
            "Contrast pairs: record foreground/background pairs, dark-mode behavior, status-color labeling, and no-color-only meaning risks.",
            "Token mapping: connect palette choices to SEIS tokens, component states, chart/status usage, and implementation owner.",
            "Boundary: not accessibility certification, not brand color ownership, and not a substitute for human accessibility review."
          ]],
          ["brand-rationale-deck", "Brand Rationale Deck", [
            "Narrative: explain the audience problem, offer promise, visual hierarchy, proof points, and rollout context.",
            "Design logic: connect color, type, spacing, motion, imagery, and layout choices to SEIS tokens and accessibility.",
            "Objection handling: list likely stakeholder concerns, tradeoffs, rejected options, and the next review action.",
            "Boundary: not a persuasion guarantee, not market research, and not a substitute for human stakeholder approval."
          ]],
          ["visual-reference-moodboard", "Visual Reference Moodboard", [
            "Reference themes: record the mood, category cues, color temperature, typography attitude, composition pattern, and motion tone before production.",
            "Source discipline: list provenance notes, unknown licenses, rejected directions, and what still needs human review before publication.",
            "Translation: convert reference observations into SEIS token, layout, imagery, and accessibility decisions instead of copying assets.",
            "Boundary: not licensed asset approval, not a stock library, and not permission to publish unverified reference material."
          ]],
          ["creative-asset-shot-list-matrix", "Creative Asset Shot List Matrix", [
            "Shot plan: define scene, composition, crop, lighting, prop, product/UI state, aspect ratio, and motion need before asset production.",
            "Production notes: assign source path, provenance status, release risk, accessibility text need, fallback asset, and production owner.",
            "Review path: mark draft, ready to shoot, needs license review, needs model release review, blocked, or approved for internal draft.",
            "Boundary: not model release approval, not licensed asset approval, and not permission to publish unverified people, product, or location imagery."
          ]],
          ["logo-concept-evaluation", "Logo Concept Evaluation Matrix", [
            "Concept options: compare wordmark, monogram, symbol, lockup, and no-logo directions against audience, offer, and channel needs.",
            "Usability checks: score small-size readability, monochrome behavior, contrast, spacing, icon fit, and misuse risk before export.",
            "Decision evidence: record chosen direction, rejected directions, required refinements, trademark-review blocker, and decision owner.",
            "Boundary: not final logo approval, not trademark clearance, and not an automated logo generator."
          ]],
          ["brand-usage-guideline", "Brand Usage Guideline", [
            "Logo and mark rules: define clear space, minimum size, lockup, contrast, and placement boundaries before export.",
            "System usage: map color, type hierarchy, spacing, radius, imagery, and motion decisions back to SEIS tokens.",
            "Do and don't examples: record approved use, misuse, accessibility risk, and escalation owner for ambiguous cases.",
            "Boundary: not a trademark license, not legal brand clearance, and not permission to publish unreviewed assets."
          ]],
          ["creative-director-review", "Creative Director QA", [
            "Decision: approve, revise, or hold; never publish without a named human reviewer.",
            "Quality: score clarity, hierarchy, contrast, consistency, motion restraint, and asset provenance.",
            "Fix queue: separate blocking fixes from polish so the PR can stay scoped.",
            "Publication gate: verify validation commands, responsive behavior, and accessibility notes."
          ]],
          ["design-review-decision-matrix", "Design Review Decision Matrix", [
            "Decision state: mark approve, revise, or hold with severity, owner, evidence link, and next action.",
            "Visual debt: separate blocking fixes, polish queue, deferred items, and acceptable tradeoffs before revision starts.",
            "Publication gate: connect proof, accessibility notes, validation command, and unresolved blocker to the release decision.",
            "Boundary: not creative director approval, not publication approval, and not client approval."
          ]],
          ["approval-state-transition-ledger", "Approval State Transition Ledger", [
            "State flow: record draft, review-ready, revise, hold, approved-for-handoff, blocked, or excluded with previous state and next state.",
            "Evidence link: connect every transition to screenshot path, review note, validation command, blocker, reviewer, and timestamp/source note.",
            "Rollback note: name the command, file path, or PR commit that proves the prior safe state can be restored.",
            "Boundary: not automatic signoff, not publication approval, and not client approval."
          ]],
          ["revision-round-plan", "Revision Round Plan", [
            "Round 1: decision fixes only, tied to audience, offer, CTA, contrast, and hierarchy.",
            "Round 2: polish fixes only, tied to spacing, copy trim, image crop, and export details.",
            "Acceptance: owner signs off on resolved comments before client delivery.",
            "Boundary: no endless revision loop, no live client approval claim, and no paid-service execution."
          ]],
          ["client-feedback-triage-board", "Client Feedback Triage Board", [
            "Comment intake: capture each client note with source, affected deliverable, requested change, and decision owner.",
            "Triage lanes: separate decision fix, polish, out-of-scope request, accessibility risk, and blocked evidence.",
            "Response path: assign accept, revise, defer, reject, or ask for clarification with one next review action.",
            "Boundary: not a stakeholder consensus guarantee, not client approval, and not unlimited revision scope."
          ]],
          ["case-study-layout", "Case Study Layout Board", [
            "Narrative spine: define context, challenge, response, proof, outcome placeholder, and next CTA before visual polish.",
            "Evidence discipline: connect every proof point to source path, screenshot, validation command, or mark it as missing.",
            "Design path: map hero, problem, solution, process, proof, accessibility, and handoff sections to review owners.",
            "Boundary: not a verified customer case study, not fabricated performance proof, and not publication approval."
          ]],
          ["visual-qa-evidence-ledger", "Visual QA Evidence Ledger", [
            "Screenshot targets: desktop, mobile, SEIS Code handoff review, and any reduced-motion fallback state.",
            "Viewport checks: record horizontal overflow, cramped controls, clipped text, and focus-state concerns.",
            "Decision evidence: link each approve/revise/hold decision to a reviewer, screenshot path, and validation command.",
            "Boundary: do not fabricate screenshot evidence; mark missing Chrome or reviewer evidence as blocked."
          ]],
          ["production-file-manifest", "Production File Manifest", [
            "Source paths: record every route, doc, asset, and generated pack path before handoff.",
            "Export specs: define web, social, presentation, thumbnail, banner, and fallback sizes.",
            "Naming: use stable lowercase slugs, version labels, and review-state suffixes.",
            "Rollback: record what to revert and which validation command proves recovery."
          ]],
          ["asset-size-spec-sheet", "Asset Size Spec Sheet", [
            "Starter ratios: wide 16:9, preview 1.91:1, square 1:1, vertical 9:16, and deck 16:9 before external platform verification.",
            "Safe zones: keep logos, faces, UI text, and calls to action away from crop edges.",
            "Export labels: pair each asset with channel role, size class, review state, and source path.",
            "Boundary: verify current platform/vendor specs before paid publication or client delivery."
          ]],
          ["print-production-readiness-matrix", "Print Production Readiness Matrix", [
            "Print specs: record trim size, bleed, safe zone, folds, die cuts, paper assumptions, and vendor questions before export.",
            "File readiness: track color mode, resolution, linked assets, embedded fonts, export format, and source-file owner.",
            "Proof path: mark digital proof, vendor proof, color-risk note, human reviewer, and blocked questions before paid production.",
            "Boundary: not print proof approval, not a production print vendor, and not a color guarantee."
          ]],
          ["client-approval-packet", "Client Approval Packet", [
            "Decision summary: approve, revise, or hold with one named reviewer and one next action.",
            "Included assets: list exact files, draft states, source paths, and export readiness.",
            "Exclusions: list paid media, trademark/legal review, print production, and any unverified platform specs.",
            "Signoff gate: no client delivery claim until human approval and validation commands are recorded."
          ]],
          ["client-ready-export-index", "Client-Ready Export Index", [
            "Included: list the generated pack, SEIS Code handoff path, review note path, screenshots, source docs, and asset specs.",
            "State: mark each item as draft, review-ready, blocked, excluded, or approved by a named human reviewer.",
            "Delivery map: connect every included item to source path, validation command, rollback note, and owner.",
            "Boundary: not a downloadable archive, not host filesystem delivery, and not client approval by itself."
          ]],
          ["launch-asset-matrix", "Launch Asset Matrix", [
            "Website: hero direction, proof section, CTA, responsive notes, and validation commands.",
            "Social: square post, story frame, banner, caption, CTA, and variant owner.",
            "Presentation: cover, divider, proof slide, roadmap slide, and handoff note.",
            "Delivery: source paths, review owner, publication boundary, rollback note, and next action."
          ]],
          ["social-content-calendar-matrix", "Social Content Calendar Matrix", [
            "Calendar spine: map launch themes, channel cadence, publish dates, asset format, and campaign phase before production starts.",
            "Content brief: pair each post with caption hook, proof point, CTA, visual direction, accessibility note, and source asset owner.",
            "Review state: mark draft, review-ready, blocked, approved, or excluded with one human reviewer and one next action.",
            "Boundary: not social media scheduling, not automatic posting, and not an audience growth guarantee."
          ]],
          ["social-variant-set", "Social Variant Set", [
            "Announcement variant: value proposition, calm premium visual direction, and proof point.",
            "Process variant: brief, token map, provenance, review, and SEIS Code handoff flow.",
            "Trust variant: no-key demo, no secret handling, human approval, and accessibility gate.",
            "Conversion variant: CTA, route target, review owner, and draft/published boundary."
          ]],
          ["presentation-system-map", "Presentation System Map", [
            "Cover slide: product name, offer, audience, and restrained cinematic visual direction.",
            "Proof slide: routes, checks, local artifacts, and human-review status.",
            "Roadmap slide: next PR slice, blocker, risk, and owner.",
            "Close slide: handoff path, validation commands, and publication boundary."
          ]]
        ],
        gates: [
          "Human review before publication",
          "Asset provenance before publication",
          "No private assets in the public repo",
          "Scope estimate is not a binding quote",
          "No API keys or live provider calls"
        ]
      }
    },
    "seis-search": {
      title: "SEIS Search",
      eyebrow: "Search engine and gateway",
      subtitle: "A local SEIS search engine that finds AI, Web, Code, Design, Cloud, Apps, Plugins, Files, routes, and references.",
      pageStatus: "Search results are local demo data unless a live search provider is explicitly configured and validated.",
      cta: ["Open SEIS Search", "../desktop.html#search"],
      secondary: ["Open Website Hub", "./index.html"],
      stats: [["Apps", "local catalog"], ["Files", "VFS"], ["Routes", "website map"], ["Mock", "web results"]],
      capabilities: [
        ["Tabs by lane", "AI, Web, Code, Design, Cloud, Apps, Plugins, and Files are represented in the gateway."],
        ["Route opening", "Search launches SEIS Code, Design, Cloud, Website pages, WOW Gallery, and AI Core routes."],
        ["Snapshot export", "Search state can be saved into Documents as a local artifact."],
        ["Truth boundary", "Mock results are explicitly local and do not imply external web crawling."]
      ],
      proof: ["DEMO_ROUTES", "Search gateway map", "command palette", "launcher route board"],
      related: ["seis-ai", "seis-code", "seis-design", "seis-cloud"]
    },
    "seis-cloud": {
      title: "SEIS Cloud",
      eyebrow: "Cloud and SSH safety center",
      subtitle: "A controlled cloud readiness page for sync, deployments, repositories, SSH status, logs, backups, agents, health, and usage metrics.",
      pageStatus: "SSH, deployment, provider keys, and cloud mutation are disabled unless explicitly approved and validated.",
      cta: ["Open Cloud Center", "../desktop.html#seis-cloud"],
      secondary: ["Open Terminal", "../desktop.html#terminal"],
      stats: [["Disabled", "SSH execution"], ["Missing Key", "providers"], ["Planned", "deployment"], ["Local", "preflight"]],
      capabilities: [
        ["SSH boundary", "Private keys never enter the browser, docs, prompts, localStorage, or IndexedDB."],
        ["Deployment status", "Release and deployment remain planned until PR, validation, rollback, and approval gates are met."],
        ["Health cards", "Local preflight distinguishes connected, mock, disabled, planned, and unknown states."],
        ["Audit posture", "Cloud handoff writes safe local artifacts without external mutation."]
      ],
      proof: ["seis-cloud local preflight", "SECURITY.md", "approval required", "no SSH execution"],
      related: ["seis-os", "seis-ai", "seis-agents", "seis-store"]
    },
    "seis-store": {
      title: "SEIS Store",
      eyebrow: "Apps, plugins, agents, themes",
      subtitle: "A local App Store-style catalog for SEIS apps, website routes, local extensions, AI agents, themes, and developer tools.",
      pageStatus: "Install, enable, disable, and update states are browser-local. No purchases or dependency installation occur.",
      cta: ["Open SEIS Store", "../desktop.html#seis-store"],
      secondary: ["Open Launchpad", "../desktop.html#launchpad"],
      stats: [["Installed", "core apps"], ["Available", "website routes"], ["Local", "extensions"], ["No", "payments"]],
      capabilities: [
        ["App catalog", "SEIS System OS, Code, Design, Cloud, Music, WOW Gallery, Mythic Gacha, and Video Heroes are surfaced."],
        ["Plugin lane", "Extensions remain local catalog state until signed package and permission policy exists."],
        ["Persistence", "Install state is saved in browser-local app data and can be exported as JSON."],
        ["Governance", "No unrestricted MCP tool or external installation is hidden behind a store button."]
      ],
      proof: ["SEIS_STORE_ITEMS", "Extensions Manager", "App Center", "Store catalog export"],
      related: ["seis-os", "seis-design", "seis-code", "seis-agents"]
    },
    "seis-agents": {
      title: "SEIS Agents",
      eyebrow: "Human-governed agent system",
      subtitle: "A status-first agent runtime concept for Architect, Code, Design, Search, Security, DevOps, Documentation, QA, Cloud, and Automation lanes.",
      pageStatus: "Agents are status/plan/local dry-run surfaces. They do not autonomously write, deploy, push, or approve privileged actions.",
      cta: ["Open Sub-Agent Control", "../desktop.html#sub-agent-control"],
      secondary: ["Open AI Center", "../desktop.html#ai-assistant"],
      stats: [["20", "quarters"], ["6", "lanes"], ["32", "MCP tools in evidence"], ["Dry-run", "only"]],
      capabilities: [
        ["Role contracts", "Each lane has purpose, allowed actions, denied actions, approvals, and validation expectations."],
        ["Five-year map", "The local demo compresses roadmap visibility without claiming elapsed execution."],
        ["Approval gates", "Destructive, SSH, deployment, credentials, and GitHub write actions require human approval."],
        ["Evidence export", "Process ledger and dry-run artifacts save into the VFS for review."]
      ],
      proof: ["Sub-Agent Control", "five-year evidence", "agent runtime fixtures", "approval boundaries"],
      related: ["seis-ai", "seis-cloud", "seis-search", "seis-os"]
    }
  };

  const navOrder = ["overview", "seis-ai", "seis-os", "seis-code", "seis-design", "seis-search", "seis-cloud", "seis-store", "seis-agents"];
  const root = document.querySelector("[data-product-page]");
  if (!root) return;

  const pageId = root.dataset.page || "overview";
  const page = pages[pageId] || pages.overview;
  document.title = `${page.title} - SEIS Website`;
  const description = document.querySelector("meta[name='description']");
  if (description) description.setAttribute("content", page.subtitle);

  root.innerHTML = renderPage(pageId, page);
  bindActions(pageId, page);

  function renderPage(id, pageData) {
    return `<div class="site-shell">
      <header class="site-header">
        <a class="brand" href="./index.html" aria-label="SEIS Website home">
          <span class="brand-mark" aria-hidden="true">S</span>
          <span>SEIS</span>
        </a>
        <nav class="site-nav" aria-label="SEIS website pages">
          ${navOrder.map((navId) => `<a href="./${navId === "overview" ? "index" : navId}.html"${navId === id ? ' aria-current="page"' : ""}>${escapeHtml(pages[navId].title.replace("SEIS ", ""))}</a>`).join("")}
        </nav>
        <div class="header-actions">
          <a href="../seis-linux-replica.html?demo=live">OS</a>
          <a class="primary-action" href="../desktop.html#search">Search</a>
        </div>
      </header>
      <main>
        <section class="hero">
          <div>
            <p class="eyebrow">${escapeHtml(pageData.eyebrow)}</p>
            <h1>${escapeHtml(pageData.title)}</h1>
            <p class="lede">${escapeHtml(pageData.subtitle)}</p>
            <div class="hero-actions">
              <a class="primary-action" href="${escapeAttr(pageData.cta[1])}">${escapeHtml(pageData.cta[0])}</a>
              <a href="${escapeAttr(pageData.secondary[1])}">${escapeHtml(pageData.secondary[0])}</a>
              <button type="button" data-copy-brief>Copy page brief</button>
            </div>
          </div>
          <aside class="system-card" aria-label="${escapeAttr(pageData.title)} status preview">
            <div class="system-card-body">
              <p class="eyebrow">Status</p>
              <p>${escapeHtml(pageData.pageStatus)}</p>
              <div class="status-list">
                ${pageData.stats.map(([value, label]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}
              </div>
            </div>
          </aside>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Capabilities</p>
            <h2>What this page makes visible.</h2>
            <p>Every page is part of the same local SEIS demo and links back into the operating shell.</p>
          </div>
          <div class="capability-grid">
            ${pageData.capabilities.map(([title, body], index) => `<article class="capability-card">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(body)}</p>
            </article>`).join("")}
          </div>
        </section>
        ${pageData.agencyKit ? renderAgencyKitSection(pageData.agencyKit) : ""}
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Five-year path</p>
            <h2>Roadmap stays visible without overclaiming.</h2>
          </div>
          <div class="roadmap-grid">
            ${[
              ["Year 1", "Working demo: Desktop OS, Local AI, Search, Code, Design, Cloud mock, Store, Music, Website, docs."],
              ["Year 2", "Alpha: plugin system, provider router, local model support, repository intelligence, auth, safe sync."],
              ["Year 3", "Beta: team collaboration, advanced IDE, advanced design studio, marketplace, deployment system."],
              ["Year 4", "Platform: enterprise security, observability, multi-user workspaces, automation, remote workspace management."],
              ["Year 5", "Full ecosystem: creative OS, agent platform, local/cloud AI, SEIS Universe research, public readiness."]
            ].map(([title, body]) => `<article class="roadmap-card"><span>${escapeHtml(title)}</span><p>${escapeHtml(body)}</p></article>`).join("")}
          </div>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Open related pages</p>
            <h2>Move through the ecosystem.</h2>
          </div>
          <div class="route-grid">
            ${pageData.related.map((relatedId) => `<article class="route-card">
              <div>
                <h3>${escapeHtml(pages[relatedId].title)}</h3>
                <p>${escapeHtml(pages[relatedId].subtitle)}</p>
              </div>
              <a href="./${escapeAttr(relatedId)}.html">Open</a>
            </article>`).join("")}
          </div>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Evidence</p>
            <h2>Current proof is local and explicit.</h2>
          </div>
          <div class="proof-grid">
            ${pageData.proof.map((item) => `<article class="proof-card"><span>Evidence</span><p>${escapeHtml(item)}</p></article>`).join("")}
          </div>
          <div class="copy-card">
            <div>
              <h3>Shareable brief</h3>
              <p>${escapeHtml(pageData.subtitle)}</p>
              <p class="page-status" data-page-status></p>
            </div>
            <button type="button" data-copy-brief>Copy</button>
          </div>
        </section>
      </main>
      <footer class="site-footer">
        <span>SEIS Website local demo</span>
        <span>Mock and planned states remain labeled. Core product runs without cloud keys.</span>
      </footer>
    </div>`;
  }

  function bindActions(id, pageData) {
    const status = document.querySelector("[data-page-status]");
    const agencyOutput = document.querySelector("[data-agency-pack-output]");
    const agencyStorageKey = pageData.agencyKit?.storageKey || `seis.website.${id}.agencyPack`;
    const agencyHandoffKey = pageData.agencyKit?.handoffStorageKey || `${agencyStorageKey}.handoff`;
    document.querySelectorAll("[data-copy-brief]").forEach((button) => {
      button.addEventListener("click", async () => {
        const text = `${pageData.title}: ${pageData.subtitle}`;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            setStatus(status, "Brief copied.");
          } else {
            localStorage.setItem(`seis.website.${id}.brief`, text);
            setStatus(status, "Brief saved locally.");
          }
        } catch {
          localStorage.setItem(`seis.website.${id}.brief`, text);
          setStatus(status, "Brief saved locally.");
        }
      });
    });
    document.querySelectorAll("[data-build-agency-pack]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!pageData.agencyKit || !agencyOutput) return;
        const pack = formatAgencyPack(pageData.title, pageData.agencyKit, collectAgencyBriefFields(pageData.agencyKit));
        agencyOutput.textContent = pack;
        localStorage.setItem(agencyStorageKey, pack);
        setStatus(status, "Agency pack generated locally.");
      });
    });
    document.querySelectorAll("[data-copy-agency-pack]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!pageData.agencyKit) return;
        const text = currentAgencyPack(pageData.title, pageData.agencyKit, agencyOutput, agencyStorageKey);
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            setStatus(status, "Agency pack copied.");
          } else {
            localStorage.setItem(agencyStorageKey, text);
            setStatus(status, "Agency pack saved locally.");
          }
        } catch {
          localStorage.setItem(agencyStorageKey, text);
          setStatus(status, "Agency pack saved locally.");
        }
      });
    });
    document.querySelectorAll("[data-export-agency-pack]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!pageData.agencyKit || !agencyOutput) return;
        const pack = currentAgencyPack(pageData.title, pageData.agencyKit, agencyOutput, agencyStorageKey);
        const manifest = createAgencyHandoffManifest(pageData.title, pageData.agencyKit, pack);
        agencyOutput.textContent = pack;
        localStorage.setItem(agencyStorageKey, pack);
        localStorage.setItem(agencyHandoffKey, JSON.stringify(manifest, null, 2));
        try {
          await saveAgencyPackToCodeWorkspace(manifest.path, pack);
          localStorage.setItem(agencyHandoffKey, JSON.stringify({ ...manifest, workspaceWrite: "indexeddb" }, null, 2));
          setStatus(status, "SEIS Code handoff saved locally.");
        } catch (_error) {
          localStorage.setItem(agencyHandoffKey, JSON.stringify({ ...manifest, workspaceWrite: "unavailable" }, null, 2));
          setStatus(status, "Handoff manifest saved locally; SEIS Code workspace unavailable.");
        }
      });
    });
  }

  function renderAgencyKitSection(agencyKit) {
    const defense = calculateAgencyDefense(agencyKit);
    return `<section class="section agency-kit-section" data-agency-kit-workflow>
      <div class="section-heading">
        <p class="eyebrow">Agency Kit</p>
        <h2>No-key design production workflow.</h2>
        <p>${escapeHtml(agencyKit.summary)}</p>
      </div>
      <div class="agency-kit-shell">
        <div class="agency-workflow-column">
          <div class="agency-output-list" aria-label="Agency kit outputs">
            ${agencyKit.outputs.map(([id, body]) => `<article data-agency-output="${escapeAttr(id)}">
              <span>${escapeHtml(id)}</span>
              <p>${escapeHtml(body)}</p>
            </article>`).join("")}
          </div>
          <div class="agency-workboard-list" aria-label="Agency kit workboards">
            ${agencyKit.workboards.map(([id, heading, items]) => `<article data-agency-workboard="${escapeAttr(id)}">
              <span>${escapeHtml(id)}</span>
              <h3>${escapeHtml(heading)}</h3>
              <ul>
                ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>`).join("")}
          </div>
        </div>
        <aside class="agency-builder" aria-label="Local agency pack builder">
          <span>${escapeHtml(agencyKit.status)}</span>
          <h3>Draft client handoff pack</h3>
          <p>Generate a browser-local Markdown pack. It is draft evidence for review, not automatic publication or client approval.</p>
          <div class="agency-cost-defense" data-agency-cost-defense aria-label="Agency cost defense calculator">
            <span>Agency cost defense</span>
            <dl>
              <div data-agency-defense-metric="coverage"><dt>Coverage</dt><dd>${defense.coverageIndex}/100</dd></div>
              <div data-agency-defense-metric="outputs"><dt>Outputs</dt><dd>${defense.outputCount}</dd></div>
              <div data-agency-defense-metric="workboards"><dt>Workboards</dt><dd>${defense.workboardCount}</dd></div>
              <div data-agency-defense-metric="boundaries"><dt>Boundary checks</dt><dd>${defense.boundaryCount}</dd></div>
            </dl>
            <p>${escapeHtml(defense.decisionHint)}</p>
          </div>
          <div class="agency-field-grid" aria-label="Editable client brief fields">
            ${agencyKit.fields.map(([id, label, value]) => `<label>
              <span>${escapeHtml(label)}</span>
              <input type="text" data-agency-field="${escapeAttr(id)}" value="${escapeAttr(value)}" autocomplete="off">
            </label>`).join("")}
          </div>
          <div class="agency-gates">
            ${agencyKit.gates.map((gate) => `<p>${escapeHtml(gate)}</p>`).join("")}
          </div>
          <div class="agency-actions">
            <button type="button" data-build-agency-pack>Build agency pack</button>
            <button type="button" data-export-agency-pack>Export to SEIS Code</button>
            <button type="button" data-copy-agency-pack>Copy pack</button>
          </div>
          <pre data-agency-pack-output aria-live="polite">Press Build agency pack to create a local Markdown brief.</pre>
        </aside>
      </div>
    </section>`;
  }

  function collectAgencyBriefFields(agencyKit) {
    return agencyKit.fields.map(([id, label, fallback]) => {
      const input = document.querySelector(`[data-agency-field="${id}"]`);
      const value = input?.value?.trim() || fallback;
      return [id, label, value];
    });
  }

  function calculateAgencyDefense(agencyKit) {
    const outputCount = agencyKit.outputs.length;
    const workboardCount = agencyKit.workboards.length;
    const gateCount = agencyKit.gates.length;
    const outputBoundaryCount = agencyKit.outputs.filter(([_id, body]) => /boundary|not-|no-/i.test(body)).length;
    const workboardBoundaryCount = agencyKit.workboards
      .flatMap(([_id, _heading, items]) => items)
      .filter((item) => /Boundary:|not |no-/i.test(item)).length;
    const boundaryCount = outputBoundaryCount + workboardBoundaryCount;
    const proofWeight = outputCount * 2 + workboardCount * 2 + gateCount * 5 + Math.min(boundaryCount, 40);
    const coverageIndex = Math.min(100, Math.round((proofWeight / 210) * 100));
    const decisionHint = coverageIndex >= 90
      ? "Replace or defer external agency spend unless a specialist blocker is named."
      : "Keep external spend blocked until missing evidence, owner, and validation proof are recorded.";
    return { outputCount, workboardCount, gateCount, boundaryCount, coverageIndex, decisionHint };
  }

  function formatAgencyPack(title, agencyKit, fields = agencyKit.fields) {
    const defense = calculateAgencyDefense(agencyKit);
    const lines = [
      `# ${title} Agency Pack`,
      "",
      `Mode: ${agencyKit.status}`,
      "Boundary: no API keys, no live provider calls, no private assets, no automatic publication.",
      "",
      "## Client Template",
      ...fields.map(([_id, label, value]) => `- ${label}: ${value}`),
      "",
      "## Outputs",
      ...agencyKit.outputs.map(([id, body]) => `- ${id}: ${body}`),
      "",
      "## Client Discovery Intake Matrix",
      "- Stakeholders: identify decision maker, reviewer, contributor, legal blocker, and approval owner before production starts.",
      "- Evidence request: capture existing assets, missing inputs, audience proof, channel needs, technical constraints, and private asset boundary.",
      "- Readiness state: mark ready, needs evidence, blocked, deferred, or external-specialist review with one next action.",
      `- Client discovery focus: ${fields.find(([id]) => id === "clientDiscoveryIntakeFocus")?.[2] || "Decision maker, success metric, existing assets, missing inputs, channel needs, legal blockers, private asset boundary, and next evidence request"}`,
      "- Boundary: not a client contract, not legal onboarding, and not private asset storage.",
      "",
      "## Brand & Offer Naming Matrix",
      "- Name set: compare literal, coined, descriptive, editorial, and system-style name options with rejected-name notes.",
      "- Offer fit: map each option to audience promise, offer phrase, pronunciation, memorability, channel fit, and visual identity fit.",
      "- Availability review: record domain/social availability notes, trademark blocker, SEO confusion risk, decision owner, and next evidence request.",
      `- Naming focus: ${fields.find(([id]) => id === "brandOfferNamingFocus")?.[2] || "Name options, offer phrase, audience fit, pronunciation, memorability, domain/social availability notes, trademark blocker, rejected names, and decision owner"}`,
      "- Boundary: not a brand name clearance, not trademark clearance, and not domain registration.",
      "",
      "## Brand Strategy Workshop Matrix",
      "- Workshop agenda: capture business goal, audience promise, category pressure, stakeholder priorities, required decisions, and open questions before visual work starts.",
      "- Decision map: separate must-say, must-not-say, proof needed, unresolved questions, risk notes, and decision owner.",
      "- Alignment path: mark agreed, unresolved, needs evidence, deferred, or blocked with one next review action.",
      "- Boundary: not a business strategy guarantee, not stakeholder consensus guarantee, and not market research.",
      "",
      "## Landing Page Blueprint Matrix",
      "- Page spine: define hero promise, audience pain, offer, proof blocks, objection handling, and CTA ladder before production.",
      "- Section map: order hero, problem, solution, proof, workflow, trust, pricing or ask, FAQ, final CTA, and handoff notes.",
      "- Responsive QA: assign desktop/mobile priority, accessibility notes, analytics questions, source paths, and page owner.",
      "- Boundary: not a conversion guarantee, not search ranking guarantee, and not legal copy approval.",
      "",
      "## Proposal Scope Estimate",
      "- Purpose: replace vague agency quote conversations with a reviewable SEIS work package.",
      "- Scope: ship the selected deliverables, record the cut list, and keep optional polish separate.",
      "- Budget boundary: not a binding quote, invoice, legal recommendation, or paid-media plan.",
      "- Approval: human reviewer signs off before publication or client delivery.",
      "",
      "## Agency Quote Comparator",
      "- Quote baseline: record the external agency quote, retainer, or estimate as context only.",
      "- SEIS coverage: compare quoted deliverables against generated outputs, workboards, validation commands, and missing evidence.",
      "- Decision: keep, replace, defer, or buy external help based on quality risk and human review.",
      "- Boundary: not a guaranteed cost saving, not a binding quote, and not procurement, tax, or legal advice.",
      "",
      "## Agency Cost Control Matrix",
      "- Line items: split agency cost into strategy, identity, web, content, social, production, QA, handoff, and specialist work.",
      "- SEIS route: map each line item to an in-house output, evidence requirement, validation command, owner, and quality risk.",
      "- Decision gate: mark build in SEIS, buy external help, defer, needs specialist review, or blocked before spend.",
      "- Boundary: not procurement advice, not a guaranteed cost saving, and not a binding quote.",
      "",
      "## Agency Cost Defense Calculator",
      `- Coverage index: ${defense.coverageIndex}/100 from ${defense.outputCount} outputs, ${defense.workboardCount} workboards, ${defense.gateCount} review gates, and ${defense.boundaryCount} boundary checks.`,
      `- Decision hint: ${defense.decisionHint}`,
      "- Decision path: replace in SEIS, defer, buy specialist help, or block until evidence.",
      `- Cost defense focus: ${fields.find(([id]) => id === "agencyCostDefenseFocus")?.[2] || "Quoted line item, replaceable deliverables, in-house coverage index, must-buy trigger, risk owner, validation proof, and next spend decision"}`,
      "- Boundary: not financial advice, not a guaranteed cost saving, and not procurement approval.",
      "",
      "## Design Sprint Timeline Matrix",
      "- Sprint spine: map discovery, strategy freeze, identity production, web/content production, QA, revision, approval, and handoff days.",
      "- Milestone gates: assign owner, required evidence, validation command, blocker rule, and next decision for each phase.",
      "- Scope control: separate must-ship, polish, deferred, blocked, and external-specialist items before timeline pressure grows.",
      "- Boundary: not a delivery date guarantee, not project management service, and not client approval.",
      "",
      "## Competitive Positioning Matrix",
      "- Competitor set: list direct, aspirational, and adjacent references with source notes and uncertainty labels.",
      "- Visual territory: compare category cues, color/type conventions, layout patterns, proof style, and whitespace opportunity.",
      "- Differentiation: record what SEIS should own, avoid, borrow as a pattern, or reject before visual production.",
      "- Boundary: not market research, not competitor legal advice, and not proof of market demand.",
      "",
      "## Brand Voice & Messaging Matrix",
      "- Voice rules: define brand tone, banned phrases, plain-language standard, and channel-specific personality before visuals scale.",
      "- Message hierarchy: compare tagline options, primary promise, proof points, objections, CTA language, and audience fit.",
      "- Claim risk: mark unverifiable claims, regulated language, legal-copy blockers, review owner, and next copy decision.",
      "- Boundary: not legal copy approval, not compliance review, and not an advertising performance guarantee.",
      "",
      "## Typography Pairing & Hierarchy Matrix",
      "- Pairing: compare display, text, UI, mono, and fallback type roles against brand tone, content density, and platform needs.",
      "- Hierarchy: define H1, H2, body, caption, button, data, and code scale decisions with contrast and line-length notes.",
      "- Readability: record small-size behavior, multilingual support, accessibility risk, implementation owner, and fallback stack.",
      "- Boundary: not a font license, not typeface ownership, and not permission to use paid fonts without review.",
      "",
      "## Color System Accessibility Matrix",
      "- Roles: define primary, accent, surface, border, text, muted, success, warning, danger, and info usage before visual polish.",
      "- Contrast: record foreground/background pairs, dark-mode behavior, status-color labeling, and no-color-only meaning risks.",
      "- Tokens: connect palette choices to SEIS tokens, component states, chart/status usage, and implementation owner.",
      "- Boundary: not accessibility certification, not brand color ownership, and not a substitute for human accessibility review.",
      "",
      "## Brand Rationale Deck",
      "- Narrative: explain the audience problem, offer promise, visual hierarchy, proof points, and rollout context.",
      "- Design logic: connect color, type, spacing, motion, imagery, layout, and accessibility choices to SEIS tokens.",
      "- Objections: record stakeholder concerns, tradeoffs, rejected options, and the next review action.",
      "- Boundary: not a persuasion guarantee, not market research, and not automatic stakeholder approval.",
      "",
      "## Visual Reference Moodboard",
      "- Direction: record reference themes, color mood, type attitude, imagery cues, motion tone, and composition patterns before production.",
      "- Provenance: separate reviewed sources, unknown licenses, rejected directions, and human-review blockers before client delivery.",
      "- Translation: turn references into SEIS token, layout, imagery, and accessibility decisions instead of copying assets.",
      "- Boundary: not licensed asset approval, not a stock library, and not permission to publish unverified reference material.",
      "",
      "## Creative Asset Shot List Matrix",
      "- Shot plan: define scene, composition, crop, lighting, prop, product/UI state, aspect ratio, and motion need before asset production.",
      "- Production notes: assign source path, provenance status, release risk, accessibility text need, fallback asset, and production owner.",
      "- Review path: mark draft, ready to shoot, needs license review, needs model release review, blocked, or approved for internal draft.",
      "- Boundary: not model release approval, not licensed asset approval, and not permission to publish unverified people, product, or location imagery.",
      "",
      "## Logo Concept Evaluation Matrix",
      "- Options: compare wordmark, monogram, symbol, lockup, and no-logo directions against the audience, offer, and channel needs.",
      "- Usability: score small-size readability, monochrome behavior, contrast, spacing, icon fit, and misuse risk before export.",
      "- Decision: record chosen direction, rejected directions, required refinements, trademark-review blocker, and decision owner.",
      "- Boundary: not final logo approval, not trademark clearance, and not an automated logo generator.",
      "",
      "## Brand Usage Guideline",
      "- Logo and mark rules: record clear space, minimum size, lockup, contrast, and placement boundaries before export.",
      "- System usage: tie color, type hierarchy, spacing, radius, imagery, motion, and layout rules back to SEIS tokens.",
      "- Do and don't examples: separate approved use, misuse, accessibility risk, and escalation owner for ambiguous cases.",
      "- Boundary: not a trademark license, not legal brand clearance, and not permission to publish unreviewed assets.",
      "",
      "## Creative Director QA",
      "- Decision: approve, revise, or hold after checking clarity, hierarchy, contrast, consistency, motion restraint, and provenance.",
      "- Blocking fixes: record only issues that prevent publication or client delivery.",
      "- Polish queue: record optional improvements separately so scope stays controlled.",
      "- Gate: no publication without validation commands, accessibility notes, and named approval owner.",
      "",
      "## Design Review Decision Matrix",
      "- Decision state: mark approve, revise, or hold with severity, owner, evidence link, and next action.",
      "- Visual debt: separate blocking fixes, polish queue, deferred items, and acceptable tradeoffs before revision starts.",
      "- Publication gate: connect proof, accessibility notes, validation command, and unresolved blocker to the release decision.",
      `- Review decision focus: ${fields.find(([id]) => id === "designReviewDecisionFocus")?.[2] || "Approve, revise, or hold decision, severity, visual debt, blocking fixes, polish queue, evidence links, publication blocker, owner, and next action"}`,
      "- Boundary: not creative director approval, not publication approval, and not client approval.",
      "",
      "## Approval State Transition Ledger",
      "- State flow: record draft, review-ready, revise, hold, approved-for-handoff, blocked, or excluded with previous state and next state.",
      "- Evidence link: connect every transition to screenshot path, review note, validation command, blocker, reviewer, and timestamp/source note.",
      "- Rollback note: name the command, file path, or PR commit that proves the prior safe state can be restored.",
      `- Approval transition focus: ${fields.find(([id]) => id === "approvalStateTransitionFocus")?.[2] || "Draft, review-ready, revise, hold, approved-for-handoff, evidence link, reviewer, blocker, validation command, rollback note, and next action"}`,
      "- Boundary: not automatic signoff, not publication approval, and not client approval.",
      "",
      "## Revision Plan",
      "- Round 1: decision fixes for audience, offer, CTA, contrast, hierarchy, and missing proof.",
      "- Round 2: polish fixes for spacing, copy trim, image crop, export labels, and handoff clarity.",
      "- Boundary: not an endless revision loop and not client approval.",
      "",
      "## Client Feedback Triage Board",
      "- Intake: record each comment source, affected deliverable, requested change, decision owner, and evidence link.",
      "- Triage lanes: classify decision fix, polish, out-of-scope request, accessibility risk, blocked evidence, or clarification needed.",
      "- Response: assign accept, revise, defer, reject, or ask for clarification with one next review action.",
      "- Boundary: not a stakeholder consensus guarantee, not client approval, and not unlimited revision scope.",
      "",
      "## Case Study Layout Board",
      "- Narrative spine: record context, challenge, response, proof, outcome placeholder, and next CTA before visual polish.",
      "- Evidence discipline: connect each proof point to a source path, screenshot, validation command, or missing-evidence blocker.",
      "- Design path: map hero, problem, solution, process, proof, accessibility, CTA, and handoff sections to owners.",
      "- Boundary: not a verified customer case study, not fabricated performance proof, and not publication approval.",
      "",
      "## Visual QA Evidence Ledger",
      "- Screenshot targets: desktop, mobile, SEIS Code handoff review, reduced-motion state, and any approval-state transition.",
      "- Viewport checks: horizontal overflow, clipped text, cramped controls, focus visibility, and responsive hierarchy.",
      "- Decision evidence: tie approve, revise, or hold to reviewer, screenshot path, validation command, and blocker list.",
      "- Boundary: do not fabricate screenshot evidence; missing browser or reviewer evidence stays blocked.",
      "",
      "## Production File Manifest",
      "- Source paths: record routes, docs, asset records, generated pack path, and SEIS Code review note path.",
      "- Export specs: record web, social, presentation, thumbnail, banner, and fallback format expectations.",
      "- Naming: use stable lowercase slugs, version labels, and review-state suffixes.",
      "- Rollback: record files and validation commands needed to return to the prior safe state.",
      "",
      "## Asset Size Spec Sheet",
      "- Starter ratios: wide 16:9, preview 1.91:1, square 1:1, vertical 9:16, and deck 16:9.",
      "- Channel roles: map each requested channel to a source file, export label, safe-zone note, and review owner.",
      "- Boundary: verify current platform or vendor specs before paid publication, print production, or client delivery.",
      "",
      "## Print Production Readiness Matrix",
      "- Print specs: record trim size, bleed, safe zone, folds, die cuts, paper assumptions, and vendor questions before export.",
      "- File readiness: track color mode, resolution, linked assets, embedded fonts, export format, and source-file owner.",
      "- Proof path: mark digital proof, vendor proof, color-risk note, human reviewer, and blocked questions before paid production.",
      "- Boundary: not print proof approval, not a production print vendor, and not a color guarantee.",
      "",
      "## Client Approval Packet",
      "- Decision: approve, revise, or hold with a named reviewer.",
      "- Included assets: list exact files, source paths, export states, and validation commands.",
      "- Exclusions: record paid media, trademark/legal review, print vendor work, and unverified external specs.",
      "- Gate: not client approval until the human reviewer signs off outside this browser-local draft.",
      "",
      "## Client-Ready Export Index",
      "- Included: generated pack, SEIS Code handoff path, review note path, screenshots, source docs, and asset specs.",
      "- State: mark each item as draft, review-ready, blocked, excluded, or approved by a named human reviewer.",
      "- Delivery map: connect each item to source path, validation command, rollback note, and owner.",
      "- Boundary: not a downloadable archive, not host filesystem delivery, and not client approval by itself.",
      "",
      "## Social Content Calendar Matrix",
      "- Calendar spine: map launch themes, channel cadence, publish dates, asset format, and campaign phase before production starts.",
      "- Content brief: pair each post with caption hook, proof point, CTA, visual direction, accessibility note, and source asset owner.",
      "- Review state: mark draft, review-ready, blocked, approved, or excluded with one human reviewer and one next action.",
      "- Boundary: not social media scheduling, not automatic posting, and not an audience growth guarantee.",
      "",
      "## Agency Workboards",
      ...agencyKit.workboards.flatMap(([id, heading, items]) => [
        `### ${heading}`,
        `Output: ${id}`,
        ...items.map((item) => `- ${item}`),
        ""
      ]),
      "## Review Gates",
      ...agencyKit.gates.map((gate) => `- ${gate}`),
      "",
      "## Validation",
      "- npm run check:seis-design-agency-kit",
      "- npm run check:design-component-inventory",
      "- npm run check:seis-public-readiness",
      "",
      "## Handoff",
      `- Suggested SEIS Code path: ${agencyKit.codeWorkspacePath}`,
      `- Handoff storage key: ${agencyKit.handoffStorageKey}`,
      "- Source: browser-local SEIS Design Agency Kit",
      "- Review: human approval required before publication",
      "- Boundary: browser-local IndexedDB/localStorage only; not host filesystem, Git commit, deployment, or client approval."
    ];
    return lines.join("\n");
  }

  function currentAgencyPack(title, agencyKit, output, storageKey) {
    const outputText = output?.textContent?.trim() || "";
    if (outputText && !outputText.startsWith("Press Build agency pack")) return outputText;
    return localStorage.getItem(storageKey) ||
      formatAgencyPack(title, agencyKit, collectAgencyBriefFields(agencyKit));
  }

  function createAgencyHandoffManifest(title, agencyKit, content) {
    return {
      schemaVersion: 1,
      title: `${title} Agency Pack`,
      source: "browser-local SEIS Design Agency Kit",
      mode: "browser-local-seis-code-handoff",
      path: agencyKit.codeWorkspacePath,
      storageKey: agencyKit.storageKey,
      handoffStorageKey: agencyKit.handoffStorageKey,
      content,
      exportedAt: new Date().toISOString(),
      agencyDefense: calculateAgencyDefense(agencyKit),
      requiresHumanReviewBeforePublication: true,
      notClaims: ["not host filesystem write", "not Git commit", "not deployment", "not client approval"]
    };
  }

  function openCodeWorkspaceDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("seis-code-workspace-v1", 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", { keyPath: "path" });
        if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
        if (!database.objectStoreNames.contains("history")) database.createObjectStore("history", { keyPath: "id", autoIncrement: true });
        if (!database.objectStoreNames.contains("extensions")) database.createObjectStore("extensions", { keyPath: "id" });
        if (!database.objectStoreNames.contains("commits")) database.createObjectStore("commits", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function createCodeWorkspaceEntry(path, content = "", type = "file") {
    const now = new Date().toISOString();
    return {
      path,
      name: path.replace(/\/+$/, "").split("/").pop() || "/",
      parent: dirname(path),
      type,
      content: type === "file" ? content : "",
      language: type === "file" ? languageForCodeWorkspacePath(path) : "",
      createdAt: now,
      updatedAt: now,
      baseContent: type === "file" ? content : ""
    };
  }

  function dirname(path) {
    const clean = path.replace(/\/+$/, "");
    const index = clean.lastIndexOf("/");
    return index <= 0 ? "/" : clean.slice(0, index);
  }

  function languageForCodeWorkspacePath(path) {
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".js")) return "javascript";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".html")) return "html";
    return "plaintext";
  }

  function putCodeWorkspaceEntry(database, entry) {
    return new Promise((resolve, reject) => {
      const tx = database.transaction("files", "readwrite");
      tx.objectStore("files").put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function saveAgencyPackToCodeWorkspace(filePath, content) {
    if (!filePath.startsWith("/workspace/") || filePath.includes("..")) {
      throw new Error("Agency handoff path must stay inside /workspace.");
    }
    const database = await openCodeWorkspaceDatabase();
    try {
      await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry("/workspace", "", "folder"));
      await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry(dirname(filePath), "", "folder"));
      await putCodeWorkspaceEntry(database, createCodeWorkspaceEntry(filePath, content, "file"));
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("seis-code-workspace");
        channel.postMessage({ type: "workspace-file-created", path: filePath, source: "seis-design-agency-kit" });
        channel.close();
      }
    } finally {
      database.close();
    }
  }

  function setStatus(node, message) {
    if (!node) return;
    node.textContent = message;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
