# Goal Lifecycle Contract

Use the allowed sequence `backlog -> proposed -> planned -> in-progress -> review
-> completed -> archived`, with documented blocked, cancelled, and recovery
transitions. Never jump directly from backlog to completed. The file directory,
current status, final status-history entry, issue state, branch state, pull
request state, evidence, and quality gates must agree.

Before planned status, confirm project identity, canonical owner, scope,
non-goals, dependencies, public-private boundary, measurable acceptance criteria,
validation, risk, rollback, and GitHub expectations. Before in-progress status,
confirm a safe non-default branch and the smallest coherent task. Before review,
complete the scoped implementation and reproducible local validation. Before
completed, require all acceptance criteria, Definition of Done, required gates,
passed evidence, documentation, rollback, and required GitHub links.

A blocked Goal must name its blocking condition, exact reference, reason, and
unblock requirement. Do not label ordinary difficulty, incomplete work, or a
useful clarification as blocked while safe in-scope progress remains possible.
