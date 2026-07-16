# Security, Privacy, and Rollback

Use least privilege and read-only inspection first. Never print, copy, commit,
log, screenshot, prompt, or publish credentials, private keys, real tokens,
private hosts, personal memory, private repository contents, or user data. Do
not weaken full-history scanning, permission gates, branch protection, or public
private boundaries to make a check green.

External write access, production deployment, protected-branch changes,
destructive migrations, history rewrites, secret rotation, credential changes,
large dependency upgrades, infrastructure deletion, and security-policy
weakening require explicit human authority. When a potentially real credential
is detected, keep the value redacted and require private provenance review;
rotate or create a narrowly bounded synthetic-fixture exception only after proof
and approval.

Every Goal update must preserve a rollback strategy. Prefer a focused revert,
feature flag, version rollback, generated-artifact regeneration, or documented
migration reversal. Validate rollback where risk warrants it and never delete
unrelated user work while recovering the scoped change.
