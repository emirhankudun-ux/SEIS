# SEIS Public Plugin Supervised Autopilot

- Goal: SEIS-GOAL-0025
- Parent goal: SEIS-GOAL-0024
- Current marketplace: 10 general cards (30 hidden internal packages, 380 retained source capabilities)
- Reviewed local phases: 27
- Canonical install: `seis-ai-agent@seis-repo`
- Execution: supervised foreground plan-and-build only; no background execution.
- Role execution: foreground-sequential-reviewed-allowlist; each reviewed local phase is assigned exactly once.
- Current cadence: five 30-step rounds are defined; actual completion is recorded only in content/development/seis-general-plugin-autopilot-execution.json. The 100-step series is blocked-by-incomplete-five-30-step-rounds.
- First 200-step template: gated-template-not-active; activation authority is not-yet-granted.
- Escalation ladder: 200, 300, 400, 500, 600-step five-wave tiers; workflow steps never expand the 10-card marketplace.
- Isolation: reviewed-allowlist-no-os-sandbox; ambient network/filesystem isolation and descendant termination are not OS-enforced.

## Commands

```bash
npm run seis:public-plugin-autopilot -- --plan
npm run seis:public-plugin-autopilot -- --apply-safe
```

`--plan` reads local evidence and reports the next safe phases. `--apply-safe` runs only the reviewed local generator and validation allowlist during the current command invocation. The named roles below are deterministic, sequential automation lanes inside that one process; they are not persistent or parallel sub-agent processes. Neither mode intentionally commits, pushes, merges, installs, releases, deploys, accesses a provider, reads a secret, or opens the network. This is source-reviewed command containment, not a kernel sandbox; child code retains ambient process permissions, and descendant termination is not guaranteed after a hostile child. The reviewed phases are foreground local scripts and are not designed to spawn persistent descendants.

## Five 30-Step Rounds

### Round 1 — Truth and topology

1. Inspect: Confirm the ten public marketplace names are unique and user-readable.
2. Inspect: Confirm SEIS-Agent remains the canonical default entry point.
3. Inspect: Confirm the thirty internal packages cover app and topic sources exactly once.
4. Inspect: Confirm every internal package contains no more than fifteen capabilities.
5. Inspect: Remove active references to numbered duplicate topic and application cards.
6. Inspect: Record version, risk, rollback, and public-release approval boundaries.
7. Plan: Confirm the ten public marketplace names are unique and user-readable.
8. Plan: Confirm SEIS-Agent remains the canonical default entry point.
9. Plan: Confirm the thirty internal packages cover app and topic sources exactly once.
10. Plan: Confirm every internal package contains no more than fifteen capabilities.
11. Plan: Remove active references to numbered duplicate topic and application cards.
12. Plan: Record version, risk, rollback, and public-release approval boundaries.
13. Build: Confirm the ten public marketplace names are unique and user-readable.
14. Build: Confirm SEIS-Agent remains the canonical default entry point.
15. Build: Confirm the thirty internal packages cover app and topic sources exactly once.
16. Build: Confirm every internal package contains no more than fifteen capabilities.
17. Build: Remove active references to numbered duplicate topic and application cards.
18. Build: Record version, risk, rollback, and public-release approval boundaries.
19. Validate: Confirm the ten public marketplace names are unique and user-readable.
20. Validate: Confirm SEIS-Agent remains the canonical default entry point.
21. Validate: Confirm the thirty internal packages cover app and topic sources exactly once.
22. Validate: Confirm every internal package contains no more than fifteen capabilities.
23. Validate: Remove active references to numbered duplicate topic and application cards.
24. Validate: Record version, risk, rollback, and public-release approval boundaries.
25. Record command evidence for: Confirm the ten public marketplace names are unique and user-readable.
26. Record command evidence for: Confirm SEIS-Agent remains the canonical default entry point.
27. Record command evidence for: Confirm the thirty internal packages cover app and topic sources exactly once.
28. Record command evidence for: Confirm every internal package contains no more than fifteen capabilities.
29. Record command evidence for: Remove active references to numbered duplicate topic and application cards.
30. Record command evidence for: Record version, risk, rollback, and public-release approval boundaries.

### Round 2 — User selection

1. Inspect: Generate the ten-card marketplace projection from the canonical family plan.
2. Inspect: Generate each general-plugin profile with exactly three internal packages.
3. Inspect: Validate the default SEIS-Agent plan without installing anything.
4. Inspect: Validate deterministic local finder results stay at three or fewer candidates.
5. Inspect: Validate a scoped general-plugin plan never targets an internal package directly.
6. Inspect: Document the one-general-plugin-per-task rule in README, skill, and platform docs.
7. Plan: Generate the ten-card marketplace projection from the canonical family plan.
8. Plan: Generate each general-plugin profile with exactly three internal packages.
9. Plan: Validate the default SEIS-Agent plan without installing anything.
10. Plan: Validate deterministic local finder results stay at three or fewer candidates.
11. Plan: Validate a scoped general-plugin plan never targets an internal package directly.
12. Plan: Document the one-general-plugin-per-task rule in README, skill, and platform docs.
13. Build: Generate the ten-card marketplace projection from the canonical family plan.
14. Build: Generate each general-plugin profile with exactly three internal packages.
15. Build: Validate the default SEIS-Agent plan without installing anything.
16. Build: Validate deterministic local finder results stay at three or fewer candidates.
17. Build: Validate a scoped general-plugin plan never targets an internal package directly.
18. Build: Document the one-general-plugin-per-task rule in README, skill, and platform docs.
19. Validate: Generate the ten-card marketplace projection from the canonical family plan.
20. Validate: Generate each general-plugin profile with exactly three internal packages.
21. Validate: Validate the default SEIS-Agent plan without installing anything.
22. Validate: Validate deterministic local finder results stay at three or fewer candidates.
23. Validate: Validate a scoped general-plugin plan never targets an internal package directly.
24. Validate: Document the one-general-plugin-per-task rule in README, skill, and platform docs.
25. Record command evidence for: Generate the ten-card marketplace projection from the canonical family plan.
26. Record command evidence for: Generate each general-plugin profile with exactly three internal packages.
27. Record command evidence for: Validate the default SEIS-Agent plan without installing anything.
28. Record command evidence for: Validate deterministic local finder results stay at three or fewer candidates.
29. Record command evidence for: Validate a scoped general-plugin plan never targets an internal package directly.
30. Record command evidence for: Document the one-general-plugin-per-task rule in README, skill, and platform docs.

### Round 3 — Supervised automation

1. Inspect: Assign architect-planner responsibility for scope and ownership review.
2. Inspect: Assign package-builder responsibility for deterministic artifact generation.
3. Inspect: Assign safety-reviewer responsibility for permissions and public/private boundaries.
4. Inspect: Assign QA-validator responsibility for freshness, package, and install checks.
5. Inspect: Assign evidence-reporter responsibility for generated reports and skipped checks.
6. Inspect: Assign delivery-coordinator responsibility for reviewable commit and approval-gated GitHub delivery.
7. Plan: Assign architect-planner responsibility for scope and ownership review.
8. Plan: Assign package-builder responsibility for deterministic artifact generation.
9. Plan: Assign safety-reviewer responsibility for permissions and public/private boundaries.
10. Plan: Assign QA-validator responsibility for freshness, package, and install checks.
11. Plan: Assign evidence-reporter responsibility for generated reports and skipped checks.
12. Plan: Assign delivery-coordinator responsibility for reviewable commit and approval-gated GitHub delivery.
13. Build: Assign architect-planner responsibility for scope and ownership review.
14. Build: Assign package-builder responsibility for deterministic artifact generation.
15. Build: Assign safety-reviewer responsibility for permissions and public/private boundaries.
16. Build: Assign QA-validator responsibility for freshness, package, and install checks.
17. Build: Assign evidence-reporter responsibility for generated reports and skipped checks.
18. Build: Assign delivery-coordinator responsibility for reviewable commit and approval-gated GitHub delivery.
19. Validate: Assign architect-planner responsibility for scope and ownership review.
20. Validate: Assign package-builder responsibility for deterministic artifact generation.
21. Validate: Assign safety-reviewer responsibility for permissions and public/private boundaries.
22. Validate: Assign QA-validator responsibility for freshness, package, and install checks.
23. Validate: Assign evidence-reporter responsibility for generated reports and skipped checks.
24. Validate: Assign delivery-coordinator responsibility for reviewable commit and approval-gated GitHub delivery.
25. Record command evidence for: Assign architect-planner responsibility for scope and ownership review.
26. Record command evidence for: Assign package-builder responsibility for deterministic artifact generation.
27. Record command evidence for: Assign safety-reviewer responsibility for permissions and public/private boundaries.
28. Record command evidence for: Assign QA-validator responsibility for freshness, package, and install checks.
29. Record command evidence for: Assign evidence-reporter responsibility for generated reports and skipped checks.
30. Record command evidence for: Assign delivery-coordinator responsibility for reviewable commit and approval-gated GitHub delivery.

### Round 4 — Runtime and release

1. Inspect: Validate the MCP server exposes local read-only general-plugin guidance.
2. Inspect: Keep legacy public-bundle MCP names as compatibility aliases only.
3. Inspect: Regenerate the unified suite with the ten/30 topology.
4. Inspect: Verify the structural distribution version increased for this major update.
5. Inspect: Require a future version increase for card-count or package-topology changes.
6. Inspect: Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.
7. Plan: Validate the MCP server exposes local read-only general-plugin guidance.
8. Plan: Keep legacy public-bundle MCP names as compatibility aliases only.
9. Plan: Regenerate the unified suite with the ten/30 topology.
10. Plan: Verify the structural distribution version increased for this major update.
11. Plan: Require a future version increase for card-count or package-topology changes.
12. Plan: Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.
13. Build: Validate the MCP server exposes local read-only general-plugin guidance.
14. Build: Keep legacy public-bundle MCP names as compatibility aliases only.
15. Build: Regenerate the unified suite with the ten/30 topology.
16. Build: Verify the structural distribution version increased for this major update.
17. Build: Require a future version increase for card-count or package-topology changes.
18. Build: Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.
19. Validate: Validate the MCP server exposes local read-only general-plugin guidance.
20. Validate: Keep legacy public-bundle MCP names as compatibility aliases only.
21. Validate: Regenerate the unified suite with the ten/30 topology.
22. Validate: Verify the structural distribution version increased for this major update.
23. Validate: Require a future version increase for card-count or package-topology changes.
24. Validate: Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.
25. Record command evidence for: Validate the MCP server exposes local read-only general-plugin guidance.
26. Record command evidence for: Keep legacy public-bundle MCP names as compatibility aliases only.
27. Record command evidence for: Regenerate the unified suite with the ten/30 topology.
28. Record command evidence for: Verify the structural distribution version increased for this major update.
29. Record command evidence for: Require a future version increase for card-count or package-topology changes.
30. Record command evidence for: Keep marketplace publication, tags, deploys, credentials, and external writes human-approved.

### Round 5 — Evidence and continuation

1. Inspect: Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.
2. Inspect: Run user-readiness checks without reading local Codex configuration by default.
3. Inspect: Run the optional read-only local configuration review only when requested.
4. Inspect: Require manual Codex refresh to verify the rendered ten-card UI.
5. Inspect: Prepare a focused branch commit that excludes unrelated user-staged evidence.
6. Inspect: Push only a focused commit; keep public release separate and approval-gated.
7. Plan: Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.
8. Plan: Run user-readiness checks without reading local Codex configuration by default.
9. Plan: Run the optional read-only local configuration review only when requested.
10. Plan: Require manual Codex refresh to verify the rendered ten-card UI.
11. Plan: Prepare a focused branch commit that excludes unrelated user-staged evidence.
12. Plan: Push only a focused commit; keep public release separate and approval-gated.
13. Build: Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.
14. Build: Run user-readiness checks without reading local Codex configuration by default.
15. Build: Run the optional read-only local configuration review only when requested.
16. Build: Require manual Codex refresh to verify the rendered ten-card UI.
17. Build: Prepare a focused branch commit that excludes unrelated user-staged evidence.
18. Build: Push only a focused commit; keep public release separate and approval-gated.
19. Validate: Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.
20. Validate: Run user-readiness checks without reading local Codex configuration by default.
21. Validate: Run the optional read-only local configuration review only when requested.
22. Validate: Require manual Codex refresh to verify the rendered ten-card UI.
23. Validate: Prepare a focused branch commit that excludes unrelated user-staged evidence.
24. Validate: Push only a focused commit; keep public release separate and approval-gated.
25. Record command evidence for: Run focused distribution, version-policy, unified-suite, agent, and MCP smoke checks.
26. Record command evidence for: Run user-readiness checks without reading local Codex configuration by default.
27. Record command evidence for: Run the optional read-only local configuration review only when requested.
28. Record command evidence for: Require manual Codex refresh to verify the rendered ten-card UI.
29. Record command evidence for: Prepare a focused branch commit that excludes unrelated user-staged evidence.
30. Record command evidence for: Push only a focused commit; keep public release separate and approval-gated.

## Five-Wave Cadence

The canonical cadence defines five 30-step rounds (150 checkpoints), followed by 5 waves of 100 steps. Completion is not inferred from this plan: only the Goal 0029 execution ledger can advance the cadence. The first 200-step series remains gated-until-five-100-step-waves-complete.

The legacy continuity artifact is retained at Wave 5, 80/100 complete, with step 81 in progress. It is historical evidence, not current schedule authority.

## Escalating Five-Wave Series

After all five current 100-step waves close with evidence, each later tier retains five waves and adds 100 steps per wave. These are workflow planning steps, never extra marketplace cards or installations. Every 200-step-or-later tier is currently gated and non-background.

| Tier | Years | Waves | Steps per wave | Total planned steps | State |
| --- | --- | ---: | ---: | ---: | --- |
| five-wave-200 | 1–2 | 5 | 200 | 1000 | gated-until-five-100-step-waves-complete |
| five-wave-300 | 3–4 | 5 | 300 | 1500 | strategic-gated-not-background |
| five-wave-400 | 5–6 | 5 | 400 | 2000 | strategic-gated-not-background |
| five-wave-500 | 7–8 | 5 | 500 | 2500 | strategic-gated-not-background |
| five-wave-600 | 9–10 | 5 | 600 | 3000 | strategic-gated-not-background |

## Gated 200-Step Compatibility Template

### 1. Authority and repository truth (steps 1–20)

Reconcile active goals, ownership, branch state, aliases, and public/private boundaries.

1. Inspect the authoritative goal and non-goals for authority and repository truth. — planned-gated
2. Verify canonical repository ownership and affected paths for authority and repository truth. — planned-gated
3. Snapshot the current branch and worktree without rewriting unrelated changes for authority and repository truth. — planned-gated
4. Confirm public/private, network, secret, and external-write boundaries for authority and repository truth. — planned-gated
5. Inventory current inputs and generated outputs for authority and repository truth. — planned-gated
6. Identify the smallest reversible implementation slice for authority and repository truth. — planned-gated
7. Check dependencies, blockers, and concurrent-writer risk for authority and repository truth. — planned-gated
8. Define measurable acceptance evidence for authority and repository truth. — planned-gated
9. Implement the bounded local change for authority and repository truth. — planned-gated
10. Regenerate only declared deterministic artifacts for authority and repository truth. — planned-gated
11. Run syntax and freshness checks for authority and repository truth. — planned-gated
12. Run focused unit and integration tests for authority and repository truth. — planned-gated
13. Run adversarial boundary tests for authority and repository truth. — planned-gated
14. Inspect the diff for scope drift and machine-specific data for authority and repository truth. — planned-gated
15. Review security, architecture, documentation, and usability impact for authority and repository truth. — planned-gated
16. Record failed, skipped, and environment-blocked checks for authority and repository truth. — planned-gated
17. Update goal, risk, rollback, and evidence records for authority and repository truth. — planned-gated
18. Prepare a focused commit and feature-branch delivery decision for authority and repository truth. — planned-gated
19. Recheck repository state and retained-source invariants for authority and repository truth. — planned-gated
20. Hand off the verified result and next bounded action for authority and repository truth. — planned-gated

### 2. Curated marketplace architecture (steps 21–40)

Keep ten concise general marketplace plugins backed by thirty hidden bounded internal packages.

21. Inspect the authoritative goal and non-goals for curated marketplace architecture. — planned-gated
22. Verify canonical repository ownership and affected paths for curated marketplace architecture. — planned-gated
23. Snapshot the current branch and worktree without rewriting unrelated changes for curated marketplace architecture. — planned-gated
24. Confirm public/private, network, secret, and external-write boundaries for curated marketplace architecture. — planned-gated
25. Inventory current inputs and generated outputs for curated marketplace architecture. — planned-gated
26. Identify the smallest reversible implementation slice for curated marketplace architecture. — planned-gated
27. Check dependencies, blockers, and concurrent-writer risk for curated marketplace architecture. — planned-gated
28. Define measurable acceptance evidence for curated marketplace architecture. — planned-gated
29. Implement the bounded local change for curated marketplace architecture. — planned-gated
30. Regenerate only declared deterministic artifacts for curated marketplace architecture. — planned-gated
31. Run syntax and freshness checks for curated marketplace architecture. — planned-gated
32. Run focused unit and integration tests for curated marketplace architecture. — planned-gated
33. Run adversarial boundary tests for curated marketplace architecture. — planned-gated
34. Inspect the diff for scope drift and machine-specific data for curated marketplace architecture. — planned-gated
35. Review security, architecture, documentation, and usability impact for curated marketplace architecture. — planned-gated
36. Record failed, skipped, and environment-blocked checks for curated marketplace architecture. — planned-gated
37. Update goal, risk, rollback, and evidence records for curated marketplace architecture. — planned-gated
38. Prepare a focused commit and feature-branch delivery decision for curated marketplace architecture. — planned-gated
39. Recheck repository state and retained-source invariants for curated marketplace architecture. — planned-gated
40. Hand off the verified result and next bounded action for curated marketplace architecture. — planned-gated

### 3. Exact capability preservation (steps 41–60)

Prove all retained application and topic capabilities remain mapped exactly once.

41. Inspect the authoritative goal and non-goals for exact capability preservation. — planned-gated
42. Verify canonical repository ownership and affected paths for exact capability preservation. — planned-gated
43. Snapshot the current branch and worktree without rewriting unrelated changes for exact capability preservation. — planned-gated
44. Confirm public/private, network, secret, and external-write boundaries for exact capability preservation. — planned-gated
45. Inventory current inputs and generated outputs for exact capability preservation. — planned-gated
46. Identify the smallest reversible implementation slice for exact capability preservation. — planned-gated
47. Check dependencies, blockers, and concurrent-writer risk for exact capability preservation. — planned-gated
48. Define measurable acceptance evidence for exact capability preservation. — planned-gated
49. Implement the bounded local change for exact capability preservation. — planned-gated
50. Regenerate only declared deterministic artifacts for exact capability preservation. — planned-gated
51. Run syntax and freshness checks for exact capability preservation. — planned-gated
52. Run focused unit and integration tests for exact capability preservation. — planned-gated
53. Run adversarial boundary tests for exact capability preservation. — planned-gated
54. Inspect the diff for scope drift and machine-specific data for exact capability preservation. — planned-gated
55. Review security, architecture, documentation, and usability impact for exact capability preservation. — planned-gated
56. Record failed, skipped, and environment-blocked checks for exact capability preservation. — planned-gated
57. Update goal, risk, rollback, and evidence records for exact capability preservation. — planned-gated
58. Prepare a focused commit and feature-branch delivery decision for exact capability preservation. — planned-gated
59. Recheck repository state and retained-source invariants for exact capability preservation. — planned-gated
60. Hand off the verified result and next bounded action for exact capability preservation. — planned-gated

### 4. Bundle runtime safety (steps 61–80)

Harden input, output, filesystem, profile, and permission boundaries with adversarial tests.

61. Inspect the authoritative goal and non-goals for bundle runtime safety. — planned-gated
62. Verify canonical repository ownership and affected paths for bundle runtime safety. — planned-gated
63. Snapshot the current branch and worktree without rewriting unrelated changes for bundle runtime safety. — planned-gated
64. Confirm public/private, network, secret, and external-write boundaries for bundle runtime safety. — planned-gated
65. Inventory current inputs and generated outputs for bundle runtime safety. — planned-gated
66. Identify the smallest reversible implementation slice for bundle runtime safety. — planned-gated
67. Check dependencies, blockers, and concurrent-writer risk for bundle runtime safety. — planned-gated
68. Define measurable acceptance evidence for bundle runtime safety. — planned-gated
69. Implement the bounded local change for bundle runtime safety. — planned-gated
70. Regenerate only declared deterministic artifacts for bundle runtime safety. — planned-gated
71. Run syntax and freshness checks for bundle runtime safety. — planned-gated
72. Run focused unit and integration tests for bundle runtime safety. — planned-gated
73. Run adversarial boundary tests for bundle runtime safety. — planned-gated
74. Inspect the diff for scope drift and machine-specific data for bundle runtime safety. — planned-gated
75. Review security, architecture, documentation, and usability impact for bundle runtime safety. — planned-gated
76. Record failed, skipped, and environment-blocked checks for bundle runtime safety. — planned-gated
77. Update goal, risk, rollback, and evidence records for bundle runtime safety. — planned-gated
78. Prepare a focused commit and feature-branch delivery decision for bundle runtime safety. — planned-gated
79. Recheck repository state and retained-source invariants for bundle runtime safety. — planned-gated
80. Hand off the verified result and next bounded action for bundle runtime safety. — planned-gated

### 5. Manifest and registry reconciliation (steps 81–100)

Align the project manifest, marketplace, family, bundle catalog, and audit evidence.

81. Inspect the authoritative goal and non-goals for manifest and registry reconciliation. — planned-gated
82. Verify canonical repository ownership and affected paths for manifest and registry reconciliation. — planned-gated
83. Snapshot the current branch and worktree without rewriting unrelated changes for manifest and registry reconciliation. — planned-gated
84. Confirm public/private, network, secret, and external-write boundaries for manifest and registry reconciliation. — planned-gated
85. Inventory current inputs and generated outputs for manifest and registry reconciliation. — planned-gated
86. Identify the smallest reversible implementation slice for manifest and registry reconciliation. — planned-gated
87. Check dependencies, blockers, and concurrent-writer risk for manifest and registry reconciliation. — planned-gated
88. Define measurable acceptance evidence for manifest and registry reconciliation. — planned-gated
89. Implement the bounded local change for manifest and registry reconciliation. — planned-gated
90. Regenerate only declared deterministic artifacts for manifest and registry reconciliation. — planned-gated
91. Run syntax and freshness checks for manifest and registry reconciliation. — planned-gated
92. Run focused unit and integration tests for manifest and registry reconciliation. — planned-gated
93. Run adversarial boundary tests for manifest and registry reconciliation. — planned-gated
94. Inspect the diff for scope drift and machine-specific data for manifest and registry reconciliation. — planned-gated
95. Review security, architecture, documentation, and usability impact for manifest and registry reconciliation. — planned-gated
96. Record failed, skipped, and environment-blocked checks for manifest and registry reconciliation. — planned-gated
97. Update goal, risk, rollback, and evidence records for manifest and registry reconciliation. — planned-gated
98. Prepare a focused commit and feature-branch delivery decision for manifest and registry reconciliation. — planned-gated
99. Recheck repository state and retained-source invariants for manifest and registry reconciliation. — planned-gated
100. Hand off the verified result and next bounded action for manifest and registry reconciliation. — planned-gated

### 6. Supervised autopilot integrity (steps 101–120)

Keep plan-and-build execution anchored, allowlisted, bounded, foreground-only, and honestly scoped.

101. Inspect the authoritative goal and non-goals for supervised autopilot integrity. — planned-gated
102. Verify canonical repository ownership and affected paths for supervised autopilot integrity. — planned-gated
103. Snapshot the current branch and worktree without rewriting unrelated changes for supervised autopilot integrity. — planned-gated
104. Confirm public/private, network, secret, and external-write boundaries for supervised autopilot integrity. — planned-gated
105. Inventory current inputs and generated outputs for supervised autopilot integrity. — planned-gated
106. Identify the smallest reversible implementation slice for supervised autopilot integrity. — planned-gated
107. Check dependencies, blockers, and concurrent-writer risk for supervised autopilot integrity. — planned-gated
108. Define measurable acceptance evidence for supervised autopilot integrity. — planned-gated
109. Implement the bounded local change for supervised autopilot integrity. — planned-gated
110. Regenerate only declared deterministic artifacts for supervised autopilot integrity. — planned-gated
111. Run syntax and freshness checks for supervised autopilot integrity. — planned-gated
112. Run focused unit and integration tests for supervised autopilot integrity. — planned-gated
113. Run adversarial boundary tests for supervised autopilot integrity. — planned-gated
114. Inspect the diff for scope drift and machine-specific data for supervised autopilot integrity. — planned-gated
115. Review security, architecture, documentation, and usability impact for supervised autopilot integrity. — planned-gated
116. Record failed, skipped, and environment-blocked checks for supervised autopilot integrity. — planned-gated
117. Update goal, risk, rollback, and evidence records for supervised autopilot integrity. — planned-gated
118. Prepare a focused commit and feature-branch delivery decision for supervised autopilot integrity. — planned-gated
119. Recheck repository state and retained-source invariants for supervised autopilot integrity. — planned-gated
120. Hand off the verified result and next bounded action for supervised autopilot integrity. — planned-gated

### 7. Continuity and historical evidence (steps 121–140)

Preserve prior-wave facts while keeping the 200-step template gated until the current five-wave series closes.

121. Inspect the authoritative goal and non-goals for continuity and historical evidence. — planned-gated
122. Verify canonical repository ownership and affected paths for continuity and historical evidence. — planned-gated
123. Snapshot the current branch and worktree without rewriting unrelated changes for continuity and historical evidence. — planned-gated
124. Confirm public/private, network, secret, and external-write boundaries for continuity and historical evidence. — planned-gated
125. Inventory current inputs and generated outputs for continuity and historical evidence. — planned-gated
126. Identify the smallest reversible implementation slice for continuity and historical evidence. — planned-gated
127. Check dependencies, blockers, and concurrent-writer risk for continuity and historical evidence. — planned-gated
128. Define measurable acceptance evidence for continuity and historical evidence. — planned-gated
129. Implement the bounded local change for continuity and historical evidence. — planned-gated
130. Regenerate only declared deterministic artifacts for continuity and historical evidence. — planned-gated
131. Run syntax and freshness checks for continuity and historical evidence. — planned-gated
132. Run focused unit and integration tests for continuity and historical evidence. — planned-gated
133. Run adversarial boundary tests for continuity and historical evidence. — planned-gated
134. Inspect the diff for scope drift and machine-specific data for continuity and historical evidence. — planned-gated
135. Review security, architecture, documentation, and usability impact for continuity and historical evidence. — planned-gated
136. Record failed, skipped, and environment-blocked checks for continuity and historical evidence. — planned-gated
137. Update goal, risk, rollback, and evidence records for continuity and historical evidence. — planned-gated
138. Prepare a focused commit and feature-branch delivery decision for continuity and historical evidence. — planned-gated
139. Recheck repository state and retained-source invariants for continuity and historical evidence. — planned-gated
140. Hand off the verified result and next bounded action for continuity and historical evidence. — planned-gated

### 8. Cross-project identity boundaries (steps 141–160)

Keep SEIS, Eleni-Neferi, and Pantechnoesis distinct while documenting explicit interoperability.

141. Inspect the authoritative goal and non-goals for cross-project identity boundaries. — planned-gated
142. Verify canonical repository ownership and affected paths for cross-project identity boundaries. — planned-gated
143. Snapshot the current branch and worktree without rewriting unrelated changes for cross-project identity boundaries. — planned-gated
144. Confirm public/private, network, secret, and external-write boundaries for cross-project identity boundaries. — planned-gated
145. Inventory current inputs and generated outputs for cross-project identity boundaries. — planned-gated
146. Identify the smallest reversible implementation slice for cross-project identity boundaries. — planned-gated
147. Check dependencies, blockers, and concurrent-writer risk for cross-project identity boundaries. — planned-gated
148. Define measurable acceptance evidence for cross-project identity boundaries. — planned-gated
149. Implement the bounded local change for cross-project identity boundaries. — planned-gated
150. Regenerate only declared deterministic artifacts for cross-project identity boundaries. — planned-gated
151. Run syntax and freshness checks for cross-project identity boundaries. — planned-gated
152. Run focused unit and integration tests for cross-project identity boundaries. — planned-gated
153. Run adversarial boundary tests for cross-project identity boundaries. — planned-gated
154. Inspect the diff for scope drift and machine-specific data for cross-project identity boundaries. — planned-gated
155. Review security, architecture, documentation, and usability impact for cross-project identity boundaries. — planned-gated
156. Record failed, skipped, and environment-blocked checks for cross-project identity boundaries. — planned-gated
157. Update goal, risk, rollback, and evidence records for cross-project identity boundaries. — planned-gated
158. Prepare a focused commit and feature-branch delivery decision for cross-project identity boundaries. — planned-gated
159. Recheck repository state and retained-source invariants for cross-project identity boundaries. — planned-gated
160. Hand off the verified result and next bounded action for cross-project identity boundaries. — planned-gated

### 9. Validation and delivery readiness (steps 161–180)

Run local quality gates, disclose unavailable checks, and prepare reversible feature-branch delivery.

161. Inspect the authoritative goal and non-goals for validation and delivery readiness. — planned-gated
162. Verify canonical repository ownership and affected paths for validation and delivery readiness. — planned-gated
163. Snapshot the current branch and worktree without rewriting unrelated changes for validation and delivery readiness. — planned-gated
164. Confirm public/private, network, secret, and external-write boundaries for validation and delivery readiness. — planned-gated
165. Inventory current inputs and generated outputs for validation and delivery readiness. — planned-gated
166. Identify the smallest reversible implementation slice for validation and delivery readiness. — planned-gated
167. Check dependencies, blockers, and concurrent-writer risk for validation and delivery readiness. — planned-gated
168. Define measurable acceptance evidence for validation and delivery readiness. — planned-gated
169. Implement the bounded local change for validation and delivery readiness. — planned-gated
170. Regenerate only declared deterministic artifacts for validation and delivery readiness. — planned-gated
171. Run syntax and freshness checks for validation and delivery readiness. — planned-gated
172. Run focused unit and integration tests for validation and delivery readiness. — planned-gated
173. Run adversarial boundary tests for validation and delivery readiness. — planned-gated
174. Inspect the diff for scope drift and machine-specific data for validation and delivery readiness. — planned-gated
175. Review security, architecture, documentation, and usability impact for validation and delivery readiness. — planned-gated
176. Record failed, skipped, and environment-blocked checks for validation and delivery readiness. — planned-gated
177. Update goal, risk, rollback, and evidence records for validation and delivery readiness. — planned-gated
178. Prepare a focused commit and feature-branch delivery decision for validation and delivery readiness. — planned-gated
179. Recheck repository state and retained-source invariants for validation and delivery readiness. — planned-gated
180. Hand off the verified result and next bounded action for validation and delivery readiness. — planned-gated

### 10. Human usability and handoff (steps 181–200)

Review discovery clarity, installation choices, documentation, risks, rollback, and the next decision.

181. Inspect the authoritative goal and non-goals for human usability and handoff. — planned-gated
182. Verify canonical repository ownership and affected paths for human usability and handoff. — planned-gated
183. Snapshot the current branch and worktree without rewriting unrelated changes for human usability and handoff. — planned-gated
184. Confirm public/private, network, secret, and external-write boundaries for human usability and handoff. — planned-gated
185. Inventory current inputs and generated outputs for human usability and handoff. — planned-gated
186. Identify the smallest reversible implementation slice for human usability and handoff. — planned-gated
187. Check dependencies, blockers, and concurrent-writer risk for human usability and handoff. — planned-gated
188. Define measurable acceptance evidence for human usability and handoff. — planned-gated
189. Implement the bounded local change for human usability and handoff. — planned-gated
190. Regenerate only declared deterministic artifacts for human usability and handoff. — planned-gated
191. Run syntax and freshness checks for human usability and handoff. — planned-gated
192. Run focused unit and integration tests for human usability and handoff. — planned-gated
193. Run adversarial boundary tests for human usability and handoff. — planned-gated
194. Inspect the diff for scope drift and machine-specific data for human usability and handoff. — planned-gated
195. Review security, architecture, documentation, and usability impact for human usability and handoff. — planned-gated
196. Record failed, skipped, and environment-blocked checks for human usability and handoff. — planned-gated
197. Update goal, risk, rollback, and evidence records for human usability and handoff. — planned-gated
198. Prepare a focused commit and feature-branch delivery decision for human usability and handoff. — planned-gated
199. Recheck repository state and retained-source invariants for human usability and handoff. — planned-gated
200. Hand off the verified result and next bounded action for human usability and handoff. — planned-gated


## Ten-Year Strategic Horizon

| Year | Tier | Steps per wave | Theme | Intended outcome | Execution boundary |
| --- | --- | ---: | --- | --- | --- |
| 1 | five-wave-200 | 200 | Public package clarity | Stabilize the curated marketplace, exact-once source maps, and bundle usability evidence. | strategic-gated-not-background |
| 2 | five-wave-200 | 200 | Bundle experience maturity | Improve selection language, migration compatibility, and reversible package evolution. | strategic-gated-not-background |
| 3 | five-wave-300 | 300 | Cross-platform contracts | Align public package contracts with macOS, iPadOS, iOS, web, and CLI evidence where justified. | strategic-gated-not-background |
| 4 | five-wave-300 | 300 | Quality and resilience | Increase local validation, compatibility, security, performance, and documentation coverage. | strategic-gated-not-background |
| 5 | five-wave-400 | 400 | Contributor readiness | Prepare public contribution, review, and package lifecycle guidance without weakening governance. | strategic-gated-not-background |
| 6 | five-wave-400 | 400 | Extension governance | Evaluate plugin and MCP extension pathways under least privilege and reviewed permissions. | strategic-gated-not-background |
| 7 | five-wave-500 | 500 | Ecosystem interoperability | Publish stable, explicit contracts between SEIS, Eleni-Neferi, and Pantechnoesis without identity collapse. | strategic-gated-not-background |
| 8 | five-wave-500 | 500 | Sustainable operations | Strengthen rollback, deprecation, observability, and long-horizon maintenance evidence. | strategic-gated-not-background |
| 9 | five-wave-600 | 600 | Public quality benchmark | Review public package discovery, accessibility, performance, and documentation against current user evidence. | strategic-gated-not-background |
| 10 | five-wave-600 | 600 | Ten-year renewal | Run a human-owned strategy review, retire stale assumptions, and define the next horizon only with current evidence. | strategic-gated-not-background |

## Automation Roles

Named roles are a reviewable execution ledger, not independently running agents. Phases always run sequentially in the reviewed allowlist order.

| Role | Reviewed local phases | Responsibility |
| --- | ---: | --- |
| architect-planner | 3 | Check goal, source-of-truth inputs, current marketplace boundary, risks, and the next bounded cycle. |
| bundle-builder | 3 | Regenerate deterministic marketplace, bundle-package, and consolidation artifacts only through the allowlist. |
| safety-reviewer | 6 | Verify no network, secret, external-write, source-deletion, or bulk-install claim enters the generated contract. |
| qa-validator | 13 | Run deterministic freshness and node test suites and expose failures directly. |
| evidence-reporter | 1 | Return a bounded foreground report with success, failure, blocked-delivery, and next-action state. |
| delivery-coordinator | 1 | Prepare but never execute a separate feature-branch GitHub delivery decision. |

## GitHub Delivery

After a focused commit and current authorization, use a separate feature-branch delivery action. Do not push from the autopilot. This runner never executes that action.

## Rollback

Revert the focused autopilot generator, runner, documentation, and package scripts. The curated marketplace and retained source packages are unaffected by plan mode.
