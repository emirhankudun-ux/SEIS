# SEIS Public Plugin Supervised Autopilot

- Goal: SEIS-GOAL-0025
- Parent goal: SEIS-GOAL-0024
- Current marketplace: 10 general cards (30 hidden internal packages, 380 retained source capabilities)
- Reviewed local phases: 48
- Canonical install: `seis-ai-agent@seis-repo`
- Execution: supervised foreground plan-and-build only; no background execution.
- Role execution: foreground-sequential-reviewed-allowlist; each reviewed local phase is assigned exactly once.
- Round 11: 200 steps, in-progress-plan-and-local-build; historical Wave 5 closeout is not claimed.
- Escalation ladder: 200, 300, 400, 500, 600-step five-wave tiers; workflow steps never expand the 10-card marketplace.
- Isolation: reviewed-allowlist-no-os-sandbox; ambient network/filesystem isolation and descendant termination are not OS-enforced.

## Commands

```bash
npm run seis:public-plugin-autopilot -- --plan
npm run seis:public-plugin-autopilot -- --apply-safe
```

`--plan` reads local evidence and reports the next safe phases. `--apply-safe` runs only the reviewed local generator and validation allowlist during the current command invocation. The named roles below are deterministic, sequential automation lanes inside that one process; they are not persistent or parallel sub-agent processes. Neither mode intentionally commits, pushes, merges, installs, releases, deploys, accesses a provider, reads a secret, or opens the network. This is source-reviewed command containment, not a kernel sandbox; child code retains ambient process permissions, and descendant termination is not guaranteed after a hostile child. The reviewed phases are foreground local scripts and are not designed to spawn persistent descendants.

## 30-Step Immediate Cycle

### Round 1: Inspect and plan

1. Inspect the active goal, branch, worktree, and source-of-truth boundaries.
2. Snapshot the canonical install, public-card count, bundle count, and retained-source count.
3. Confirm public-only, no-personal, no-network, no-secret, and no-external-write boundaries.
4. Inspect maximum bundle size, exact-once coverage, and protected product-category boundaries.
5. Record risks, rollback, and any concurrent-generator change before overlapping writes.
6. Emit the plan-only foreground report and choose the smallest safe next phase.

### Round 2: Build deterministically

7. Regenerate the public plugin family from reviewed source data.
8. Regenerate the bounded public bundle packages from the family projection.
9. Regenerate the consolidation record and retained-source evidence.
10. Regenerate this supervised automation program and documentation.
11. Run freshness checks for every generated artifact.
12. Inspect the local diff for unexpected changes without committing or pushing.

### Round 3: Validate locally

13. Run deterministic bundle coverage and local MCP boundary tests.
14. Run consolidation projection and exact-once source-coverage tests.
15. Run the supervised-autopilot plan/report tests.
16. Validate that no allowlisted phase calls network, credentials, or external delivery tools.
17. Validate that the canonical SEIS-Agent install remains the only default install.
18. Stop and report any failing phase before planning additional work.

### Round 4: Review boundaries

19. Review category and product-identity boundaries for bundle clarity.
20. Review source-retention and rollback evidence before any scope expansion.
21. Review command output bounds, link safety, and symbolic-link rejection behavior.
22. Review documentation freshness and user-facing installation language.
23. Review feature-branch delivery readiness without executing GitHub delivery.
24. Create explicit follow-up work only when it has a goal, risk, validation, and rollback boundary.

### Round 5: Handoff deliberately

25. Summarize foreground build and validation evidence.
26. Record failed, skipped, blocked, and approval-gated actions honestly.
27. Check worktree state and keep unrelated changes untouched.
28. Prepare a focused local commit recommendation without creating a commit automatically.
29. Prepare a separate GitHub feature-branch delivery decision without pushing automatically.
30. Continue the currently authorized Round 11 200-step cycle only under current user direction; preserve Wave 5 as incomplete and never activate later tiers automatically.

## Five-Wave Cadence

The retained cadence records one 30-step bootstrap and 5 evidence-led waves of 100 steps. Round 11 is now the first active 200-step plan-and-local-build cycle under current user direction. The historical Wave 5 evidence remains at 80 completed with step 81 in progress; this activation does not claim those remaining steps completed.

## Escalating Five-Wave Series

After the historical 100-step waves, each later tier retains five waves and adds 100 steps per wave. These are workflow planning steps, never extra marketplace cards or installations. Only the active Round 11 cycle has current authorization; every later tier remains strategic, gated, and non-background.

| Tier | Years | Waves | Steps per wave | Total planned steps | State |
| --- | --- | ---: | ---: | ---: | --- |
| five-wave-200 | 1–2 | 5 | 200 | 1000 | active-round-11-plan-and-local-build |
| five-wave-300 | 3–4 | 5 | 300 | 1500 | strategic-gated-not-background |
| five-wave-400 | 5–6 | 5 | 400 | 2000 | strategic-gated-not-background |
| five-wave-500 | 7–8 | 5 | 500 | 2500 | strategic-gated-not-background |
| five-wave-600 | 9–10 | 5 | 600 | 3000 | strategic-gated-not-background |

## Round 11 — First 200-Step Cycle

### 1. Authority and repository truth (steps 1–20)

Reconcile active goals, ownership, branch state, aliases, and public/private boundaries.

1. Inspect the authoritative goal and non-goals for authority and repository truth. — in-progress
2. Verify canonical repository ownership and affected paths for authority and repository truth. — planned
3. Snapshot the current branch and worktree without rewriting unrelated changes for authority and repository truth. — planned
4. Confirm public/private, network, secret, and external-write boundaries for authority and repository truth. — planned
5. Inventory current inputs and generated outputs for authority and repository truth. — planned
6. Identify the smallest reversible implementation slice for authority and repository truth. — planned
7. Check dependencies, blockers, and concurrent-writer risk for authority and repository truth. — planned
8. Define measurable acceptance evidence for authority and repository truth. — planned
9. Implement the bounded local change for authority and repository truth. — planned
10. Regenerate only declared deterministic artifacts for authority and repository truth. — planned
11. Run syntax and freshness checks for authority and repository truth. — planned
12. Run focused unit and integration tests for authority and repository truth. — planned
13. Run adversarial boundary tests for authority and repository truth. — planned
14. Inspect the diff for scope drift and machine-specific data for authority and repository truth. — planned
15. Review security, architecture, documentation, and usability impact for authority and repository truth. — planned
16. Record failed, skipped, and environment-blocked checks for authority and repository truth. — planned
17. Update goal, risk, rollback, and evidence records for authority and repository truth. — planned
18. Prepare a focused commit and feature-branch delivery decision for authority and repository truth. — planned
19. Recheck repository state and retained-source invariants for authority and repository truth. — planned
20. Hand off the verified result and next bounded action for authority and repository truth. — planned

### 2. Curated marketplace architecture (steps 21–40)

Keep ten concise general marketplace plugins backed by thirty hidden bounded internal packages.

21. Inspect the authoritative goal and non-goals for curated marketplace architecture. — planned
22. Verify canonical repository ownership and affected paths for curated marketplace architecture. — planned
23. Snapshot the current branch and worktree without rewriting unrelated changes for curated marketplace architecture. — planned
24. Confirm public/private, network, secret, and external-write boundaries for curated marketplace architecture. — planned
25. Inventory current inputs and generated outputs for curated marketplace architecture. — planned
26. Identify the smallest reversible implementation slice for curated marketplace architecture. — planned
27. Check dependencies, blockers, and concurrent-writer risk for curated marketplace architecture. — planned
28. Define measurable acceptance evidence for curated marketplace architecture. — planned
29. Implement the bounded local change for curated marketplace architecture. — planned
30. Regenerate only declared deterministic artifacts for curated marketplace architecture. — planned
31. Run syntax and freshness checks for curated marketplace architecture. — planned
32. Run focused unit and integration tests for curated marketplace architecture. — planned
33. Run adversarial boundary tests for curated marketplace architecture. — planned
34. Inspect the diff for scope drift and machine-specific data for curated marketplace architecture. — planned
35. Review security, architecture, documentation, and usability impact for curated marketplace architecture. — planned
36. Record failed, skipped, and environment-blocked checks for curated marketplace architecture. — planned
37. Update goal, risk, rollback, and evidence records for curated marketplace architecture. — planned
38. Prepare a focused commit and feature-branch delivery decision for curated marketplace architecture. — planned
39. Recheck repository state and retained-source invariants for curated marketplace architecture. — planned
40. Hand off the verified result and next bounded action for curated marketplace architecture. — planned

### 3. Exact capability preservation (steps 41–60)

Prove all retained application and topic capabilities remain mapped exactly once.

41. Inspect the authoritative goal and non-goals for exact capability preservation. — planned
42. Verify canonical repository ownership and affected paths for exact capability preservation. — planned
43. Snapshot the current branch and worktree without rewriting unrelated changes for exact capability preservation. — planned
44. Confirm public/private, network, secret, and external-write boundaries for exact capability preservation. — planned
45. Inventory current inputs and generated outputs for exact capability preservation. — planned
46. Identify the smallest reversible implementation slice for exact capability preservation. — planned
47. Check dependencies, blockers, and concurrent-writer risk for exact capability preservation. — planned
48. Define measurable acceptance evidence for exact capability preservation. — planned
49. Implement the bounded local change for exact capability preservation. — planned
50. Regenerate only declared deterministic artifacts for exact capability preservation. — planned
51. Run syntax and freshness checks for exact capability preservation. — planned
52. Run focused unit and integration tests for exact capability preservation. — planned
53. Run adversarial boundary tests for exact capability preservation. — planned
54. Inspect the diff for scope drift and machine-specific data for exact capability preservation. — planned
55. Review security, architecture, documentation, and usability impact for exact capability preservation. — planned
56. Record failed, skipped, and environment-blocked checks for exact capability preservation. — planned
57. Update goal, risk, rollback, and evidence records for exact capability preservation. — planned
58. Prepare a focused commit and feature-branch delivery decision for exact capability preservation. — planned
59. Recheck repository state and retained-source invariants for exact capability preservation. — planned
60. Hand off the verified result and next bounded action for exact capability preservation. — planned

### 4. Bundle runtime safety (steps 61–80)

Harden input, output, filesystem, profile, and permission boundaries with adversarial tests.

61. Inspect the authoritative goal and non-goals for bundle runtime safety. — planned
62. Verify canonical repository ownership and affected paths for bundle runtime safety. — planned
63. Snapshot the current branch and worktree without rewriting unrelated changes for bundle runtime safety. — planned
64. Confirm public/private, network, secret, and external-write boundaries for bundle runtime safety. — planned
65. Inventory current inputs and generated outputs for bundle runtime safety. — planned
66. Identify the smallest reversible implementation slice for bundle runtime safety. — planned
67. Check dependencies, blockers, and concurrent-writer risk for bundle runtime safety. — planned
68. Define measurable acceptance evidence for bundle runtime safety. — planned
69. Implement the bounded local change for bundle runtime safety. — planned
70. Regenerate only declared deterministic artifacts for bundle runtime safety. — planned
71. Run syntax and freshness checks for bundle runtime safety. — planned
72. Run focused unit and integration tests for bundle runtime safety. — planned
73. Run adversarial boundary tests for bundle runtime safety. — planned
74. Inspect the diff for scope drift and machine-specific data for bundle runtime safety. — planned
75. Review security, architecture, documentation, and usability impact for bundle runtime safety. — planned
76. Record failed, skipped, and environment-blocked checks for bundle runtime safety. — planned
77. Update goal, risk, rollback, and evidence records for bundle runtime safety. — planned
78. Prepare a focused commit and feature-branch delivery decision for bundle runtime safety. — planned
79. Recheck repository state and retained-source invariants for bundle runtime safety. — planned
80. Hand off the verified result and next bounded action for bundle runtime safety. — planned

### 5. Manifest and registry reconciliation (steps 81–100)

Align the project manifest, marketplace, family, bundle catalog, and audit evidence.

81. Inspect the authoritative goal and non-goals for manifest and registry reconciliation. — planned
82. Verify canonical repository ownership and affected paths for manifest and registry reconciliation. — planned
83. Snapshot the current branch and worktree without rewriting unrelated changes for manifest and registry reconciliation. — planned
84. Confirm public/private, network, secret, and external-write boundaries for manifest and registry reconciliation. — planned
85. Inventory current inputs and generated outputs for manifest and registry reconciliation. — planned
86. Identify the smallest reversible implementation slice for manifest and registry reconciliation. — planned
87. Check dependencies, blockers, and concurrent-writer risk for manifest and registry reconciliation. — planned
88. Define measurable acceptance evidence for manifest and registry reconciliation. — planned
89. Implement the bounded local change for manifest and registry reconciliation. — planned
90. Regenerate only declared deterministic artifacts for manifest and registry reconciliation. — planned
91. Run syntax and freshness checks for manifest and registry reconciliation. — planned
92. Run focused unit and integration tests for manifest and registry reconciliation. — planned
93. Run adversarial boundary tests for manifest and registry reconciliation. — planned
94. Inspect the diff for scope drift and machine-specific data for manifest and registry reconciliation. — planned
95. Review security, architecture, documentation, and usability impact for manifest and registry reconciliation. — planned
96. Record failed, skipped, and environment-blocked checks for manifest and registry reconciliation. — planned
97. Update goal, risk, rollback, and evidence records for manifest and registry reconciliation. — planned
98. Prepare a focused commit and feature-branch delivery decision for manifest and registry reconciliation. — planned
99. Recheck repository state and retained-source invariants for manifest and registry reconciliation. — planned
100. Hand off the verified result and next bounded action for manifest and registry reconciliation. — planned

### 6. Supervised autopilot integrity (steps 101–120)

Keep plan-and-build execution anchored, allowlisted, bounded, foreground-only, and honestly scoped.

101. Inspect the authoritative goal and non-goals for supervised autopilot integrity. — planned
102. Verify canonical repository ownership and affected paths for supervised autopilot integrity. — planned
103. Snapshot the current branch and worktree without rewriting unrelated changes for supervised autopilot integrity. — planned
104. Confirm public/private, network, secret, and external-write boundaries for supervised autopilot integrity. — planned
105. Inventory current inputs and generated outputs for supervised autopilot integrity. — planned
106. Identify the smallest reversible implementation slice for supervised autopilot integrity. — planned
107. Check dependencies, blockers, and concurrent-writer risk for supervised autopilot integrity. — planned
108. Define measurable acceptance evidence for supervised autopilot integrity. — planned
109. Implement the bounded local change for supervised autopilot integrity. — planned
110. Regenerate only declared deterministic artifacts for supervised autopilot integrity. — planned
111. Run syntax and freshness checks for supervised autopilot integrity. — planned
112. Run focused unit and integration tests for supervised autopilot integrity. — planned
113. Run adversarial boundary tests for supervised autopilot integrity. — planned
114. Inspect the diff for scope drift and machine-specific data for supervised autopilot integrity. — planned
115. Review security, architecture, documentation, and usability impact for supervised autopilot integrity. — planned
116. Record failed, skipped, and environment-blocked checks for supervised autopilot integrity. — planned
117. Update goal, risk, rollback, and evidence records for supervised autopilot integrity. — planned
118. Prepare a focused commit and feature-branch delivery decision for supervised autopilot integrity. — planned
119. Recheck repository state and retained-source invariants for supervised autopilot integrity. — planned
120. Hand off the verified result and next bounded action for supervised autopilot integrity. — planned

### 7. Continuity and historical evidence (steps 121–140)

Preserve prior-wave facts while activating the current 200-step plan without fake completion.

121. Inspect the authoritative goal and non-goals for continuity and historical evidence. — planned
122. Verify canonical repository ownership and affected paths for continuity and historical evidence. — planned
123. Snapshot the current branch and worktree without rewriting unrelated changes for continuity and historical evidence. — planned
124. Confirm public/private, network, secret, and external-write boundaries for continuity and historical evidence. — planned
125. Inventory current inputs and generated outputs for continuity and historical evidence. — planned
126. Identify the smallest reversible implementation slice for continuity and historical evidence. — planned
127. Check dependencies, blockers, and concurrent-writer risk for continuity and historical evidence. — planned
128. Define measurable acceptance evidence for continuity and historical evidence. — planned
129. Implement the bounded local change for continuity and historical evidence. — planned
130. Regenerate only declared deterministic artifacts for continuity and historical evidence. — planned
131. Run syntax and freshness checks for continuity and historical evidence. — planned
132. Run focused unit and integration tests for continuity and historical evidence. — planned
133. Run adversarial boundary tests for continuity and historical evidence. — planned
134. Inspect the diff for scope drift and machine-specific data for continuity and historical evidence. — planned
135. Review security, architecture, documentation, and usability impact for continuity and historical evidence. — planned
136. Record failed, skipped, and environment-blocked checks for continuity and historical evidence. — planned
137. Update goal, risk, rollback, and evidence records for continuity and historical evidence. — planned
138. Prepare a focused commit and feature-branch delivery decision for continuity and historical evidence. — planned
139. Recheck repository state and retained-source invariants for continuity and historical evidence. — planned
140. Hand off the verified result and next bounded action for continuity and historical evidence. — planned

### 8. Cross-project identity boundaries (steps 141–160)

Keep SEIS, Eleni-Neferi, and Pantechnoesis distinct while documenting explicit interoperability.

141. Inspect the authoritative goal and non-goals for cross-project identity boundaries. — planned
142. Verify canonical repository ownership and affected paths for cross-project identity boundaries. — planned
143. Snapshot the current branch and worktree without rewriting unrelated changes for cross-project identity boundaries. — planned
144. Confirm public/private, network, secret, and external-write boundaries for cross-project identity boundaries. — planned
145. Inventory current inputs and generated outputs for cross-project identity boundaries. — planned
146. Identify the smallest reversible implementation slice for cross-project identity boundaries. — planned
147. Check dependencies, blockers, and concurrent-writer risk for cross-project identity boundaries. — planned
148. Define measurable acceptance evidence for cross-project identity boundaries. — planned
149. Implement the bounded local change for cross-project identity boundaries. — planned
150. Regenerate only declared deterministic artifacts for cross-project identity boundaries. — planned
151. Run syntax and freshness checks for cross-project identity boundaries. — planned
152. Run focused unit and integration tests for cross-project identity boundaries. — planned
153. Run adversarial boundary tests for cross-project identity boundaries. — planned
154. Inspect the diff for scope drift and machine-specific data for cross-project identity boundaries. — planned
155. Review security, architecture, documentation, and usability impact for cross-project identity boundaries. — planned
156. Record failed, skipped, and environment-blocked checks for cross-project identity boundaries. — planned
157. Update goal, risk, rollback, and evidence records for cross-project identity boundaries. — planned
158. Prepare a focused commit and feature-branch delivery decision for cross-project identity boundaries. — planned
159. Recheck repository state and retained-source invariants for cross-project identity boundaries. — planned
160. Hand off the verified result and next bounded action for cross-project identity boundaries. — planned

### 9. Validation and delivery readiness (steps 161–180)

Run local quality gates, disclose unavailable checks, and prepare reversible feature-branch delivery.

161. Inspect the authoritative goal and non-goals for validation and delivery readiness. — planned
162. Verify canonical repository ownership and affected paths for validation and delivery readiness. — planned
163. Snapshot the current branch and worktree without rewriting unrelated changes for validation and delivery readiness. — planned
164. Confirm public/private, network, secret, and external-write boundaries for validation and delivery readiness. — planned
165. Inventory current inputs and generated outputs for validation and delivery readiness. — planned
166. Identify the smallest reversible implementation slice for validation and delivery readiness. — planned
167. Check dependencies, blockers, and concurrent-writer risk for validation and delivery readiness. — planned
168. Define measurable acceptance evidence for validation and delivery readiness. — planned
169. Implement the bounded local change for validation and delivery readiness. — planned
170. Regenerate only declared deterministic artifacts for validation and delivery readiness. — planned
171. Run syntax and freshness checks for validation and delivery readiness. — planned
172. Run focused unit and integration tests for validation and delivery readiness. — planned
173. Run adversarial boundary tests for validation and delivery readiness. — planned
174. Inspect the diff for scope drift and machine-specific data for validation and delivery readiness. — planned
175. Review security, architecture, documentation, and usability impact for validation and delivery readiness. — planned
176. Record failed, skipped, and environment-blocked checks for validation and delivery readiness. — planned
177. Update goal, risk, rollback, and evidence records for validation and delivery readiness. — planned
178. Prepare a focused commit and feature-branch delivery decision for validation and delivery readiness. — planned
179. Recheck repository state and retained-source invariants for validation and delivery readiness. — planned
180. Hand off the verified result and next bounded action for validation and delivery readiness. — planned

### 10. Human usability and handoff (steps 181–200)

Review discovery clarity, installation choices, documentation, risks, rollback, and the next decision.

181. Inspect the authoritative goal and non-goals for human usability and handoff. — planned
182. Verify canonical repository ownership and affected paths for human usability and handoff. — planned
183. Snapshot the current branch and worktree without rewriting unrelated changes for human usability and handoff. — planned
184. Confirm public/private, network, secret, and external-write boundaries for human usability and handoff. — planned
185. Inventory current inputs and generated outputs for human usability and handoff. — planned
186. Identify the smallest reversible implementation slice for human usability and handoff. — planned
187. Check dependencies, blockers, and concurrent-writer risk for human usability and handoff. — planned
188. Define measurable acceptance evidence for human usability and handoff. — planned
189. Implement the bounded local change for human usability and handoff. — planned
190. Regenerate only declared deterministic artifacts for human usability and handoff. — planned
191. Run syntax and freshness checks for human usability and handoff. — planned
192. Run focused unit and integration tests for human usability and handoff. — planned
193. Run adversarial boundary tests for human usability and handoff. — planned
194. Inspect the diff for scope drift and machine-specific data for human usability and handoff. — planned
195. Review security, architecture, documentation, and usability impact for human usability and handoff. — planned
196. Record failed, skipped, and environment-blocked checks for human usability and handoff. — planned
197. Update goal, risk, rollback, and evidence records for human usability and handoff. — planned
198. Prepare a focused commit and feature-branch delivery decision for human usability and handoff. — planned
199. Recheck repository state and retained-source invariants for human usability and handoff. — planned
200. Hand off the verified result and next bounded action for human usability and handoff. — planned


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
| architect-planner | 1 | Check goal, source-of-truth inputs, current marketplace boundary, risks, and the next bounded cycle. |
| bundle-builder | 4 | Regenerate deterministic marketplace, bundle-package, and consolidation artifacts only through the allowlist. |
| safety-reviewer | 9 | Verify no network, secret, external-write, source-deletion, or bulk-install claim enters the generated contract. |
| qa-validator | 19 | Run deterministic freshness and node test suites and expose failures directly. |
| evidence-reporter | 14 | Return a bounded foreground report with success, failure, blocked-delivery, and next-action state. |
| delivery-coordinator | 1 | Prepare but never execute a separate feature-branch GitHub delivery decision. |

## GitHub Delivery

After a focused commit and current authorization, use a separate feature-branch delivery action. Do not push from the autopilot. This runner never executes that action.

## Rollback

Revert the focused autopilot generator, runner, documentation, and package scripts. The curated marketplace and retained source packages are unaffected by plan mode.
