CREATE TABLE IF NOT EXISTS seis_capability_kernel (
    capability_id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('apple', 'android', 'windows', 'web', 'data', 'policy')),
    allowed_language_family TEXT NOT NULL,
    requires_runtime_install BOOLEAN NOT NULL DEFAULT FALSE,
    market_ready BOOLEAN NOT NULL DEFAULT FALSE,
    governance_gate TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT '2026-06-11'
);

CREATE VIEW IF NOT EXISTS seis_market_readiness_blockers AS
SELECT
    capability_id,
    domain,
    platform,
    governance_gate
FROM seis_capability_kernel
WHERE requires_runtime_install = TRUE
   OR market_ready = FALSE
   OR allowed_language_family IN ('JavaScript', 'Python');
