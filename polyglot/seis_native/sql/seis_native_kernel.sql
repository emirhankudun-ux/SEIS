CREATE TABLE IF NOT EXISTS seis_native_roadmap (
    lane TEXT PRIMARY KEY,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    primary_language TEXT NOT NULL,
    next_step TEXT NOT NULL
);

INSERT INTO seis_native_roadmap (lane, score, primary_language, next_step) VALUES
    ('Apple First', 100, 'Swift', 'Build Apple native surfaces first.'),
    ('Data AI', 88, 'Python', 'Keep intelligence workflows measurable.'),
    ('Systems', 84, 'Rust', 'Move shared logic into safe modules.'),
    ('Android', 76, 'Kotlin', 'Mirror product intent on Android.'),
    ('Windows', 72, 'CSharp', 'Define Windows product contracts.'),
    ('Infrastructure', 70, 'Go', 'Keep operations auditable and reversible.')
ON CONFLICT (lane) DO UPDATE SET
    score = excluded.score,
    primary_language = excluded.primary_language,
    next_step = excluded.next_step;

CREATE VIEW IF NOT EXISTS seis_native_roadmap_ordered AS
SELECT lane, score, primary_language, next_step
FROM seis_native_roadmap
ORDER BY score DESC, lane ASC;
