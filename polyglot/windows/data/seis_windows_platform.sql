CREATE TABLE seis_windows_platform_capability (
    id TEXT PRIMARY KEY,
    language TEXT NOT NULL,
    quality_gate TEXT NOT NULL,
    offline_helper BOOLEAN NOT NULL,
    remote_bridge BOOLEAN NOT NULL
);

INSERT INTO seis_windows_platform_capability
    (id, language, quality_gate, offline_helper, remote_bridge)
VALUES
    ('windows-data-sql', 'SQL', 'database_contract', TRUE, TRUE),
    ('windows-data-sql', 'PowerShell', 'windows_path_safety', TRUE, TRUE),
    ('windows-data-sql', 'Python', 'offline_fallback', TRUE, TRUE);
