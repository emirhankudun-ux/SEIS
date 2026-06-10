-- SEIS audit ledger — queryable history of quality-gate runs (SQLite).
--
-- The CLI prints PASS/FAIL and exits; this schema keeps the trail:
-- every run, every section verdict, every finding, with constraints
-- that make illegal states unrepresentable and views for the questions
-- actually asked ("what failed last?", "which gate regresses most?").
--
-- Apply + smoke-test:  sqlite3 :memory: < polyglot/sql/audit_ledger.sqlite.sql

PRAGMA foreign_keys = ON;

CREATE TABLE audit_run (
    run_id      INTEGER PRIMARY KEY,
    started_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    git_ref     TEXT    NOT NULL,
    ok          INTEGER NOT NULL CHECK (ok IN (0, 1))
);

CREATE TABLE section_result (
    run_id   INTEGER NOT NULL REFERENCES audit_run(run_id) ON DELETE CASCADE,
    section  TEXT    NOT NULL CHECK (section IN
        ('i18n','seo','contract','drawings','style','perf','a11y','security')),
    ok       INTEGER NOT NULL CHECK (ok IN (0, 1)),
    PRIMARY KEY (run_id, section)
);

CREATE TABLE finding (
    finding_id INTEGER PRIMARY KEY,
    run_id     INTEGER NOT NULL,
    section    TEXT    NOT NULL,
    message    TEXT    NOT NULL CHECK (length(message) > 0),
    FOREIGN KEY (run_id, section) REFERENCES section_result(run_id, section)
        ON DELETE CASCADE
);

-- A failing section must explain itself; a passing one must not nag.
CREATE TRIGGER finding_requires_failed_section
BEFORE INSERT ON finding
WHEN (SELECT ok FROM section_result
      WHERE run_id = NEW.run_id AND section = NEW.section) = 1
BEGIN
    SELECT RAISE(ABORT, 'finding attached to a passing section');
END;

CREATE VIEW latest_run AS
SELECT r.run_id, r.started_at, r.git_ref, r.ok,
       sum(CASE WHEN s.ok = 0 THEN 1 ELSE 0 END) AS failed_sections
FROM audit_run r
JOIN section_result s USING (run_id)
WHERE r.run_id = (SELECT max(run_id) FROM audit_run)
GROUP BY r.run_id;

CREATE VIEW gate_regressions AS
SELECT section,
       count(*)                                   AS runs,
       sum(CASE WHEN ok = 0 THEN 1 ELSE 0 END)    AS failures,
       round(100.0 * sum(CASE WHEN ok = 0 THEN 1 ELSE 0 END) / count(*), 1)
                                                  AS failure_pct
FROM section_result
GROUP BY section
ORDER BY failures DESC, section;

-- ----------------------------------------------------------------- --
-- Smoke test: exercise constraints and views; any failure aborts.    --
-- ----------------------------------------------------------------- --

INSERT INTO audit_run (git_ref, ok) VALUES ('smoke-a', 1);
INSERT INTO section_result (run_id, section, ok)
SELECT 1, s, 1 FROM (SELECT 'i18n' s UNION ALL SELECT 'seo' UNION ALL
                     SELECT 'contract' UNION ALL SELECT 'drawings' UNION ALL
                     SELECT 'style' UNION ALL SELECT 'perf' UNION ALL
                     SELECT 'a11y' UNION ALL SELECT 'security');

INSERT INTO audit_run (git_ref, ok) VALUES ('smoke-b', 0);
INSERT INTO section_result (run_id, section, ok) VALUES (2, 'perf', 0);
INSERT INTO finding (run_id, section, message)
VALUES (2, 'perf', 'script.js 180 KB > 150 KB budget');

-- View sanity: latest run is #2 with one failed section.
SELECT CASE
    WHEN (SELECT failed_sections FROM latest_run) = 1
     AND (SELECT git_ref FROM latest_run) = 'smoke-b'
    THEN '[PASS] sql-ledger  schema + views + constraints OK'
    ELSE RAISE_SENTINEL -- unknown identifier => hard error if logic broke
END AS verdict;
