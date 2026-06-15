-- SEIS Release Policy — Apache Cassandra CQL
-- Keyspace and table definitions for release gate persistence

-- ─── Keyspace ─────────────────────────────────────────────────────────────
CREATE KEYSPACE IF NOT EXISTS seis_release
  WITH replication = {
    'class'              : 'NetworkTopologyStrategy',
    'datacenter1'        : 3
  }
  AND durable_writes = true;

USE seis_release;

-- ─── Motion Policy Table ──────────────────────────────────────────────────
-- Stores motion mode configuration per session/user
CREATE TABLE IF NOT EXISTS motion_policy (
  session_id          uuid        PRIMARY KEY,
  motion_mode         text,
  duration_instant    int,
  duration_fast       int,
  duration_standard   int,
  duration_slow       int,
  duration_cinematic  int,
  is_reduced          boolean,
  created_at          timestamp,
  updated_at          timestamp
);

-- ─── Release Gates Table ──────────────────────────────────────────────────
-- Partitioned by version; clustered by evaluation timestamp
CREATE TABLE IF NOT EXISTS release_gates (
  version        text,
  evaluated_at   timestamp,
  status         text,
  branch         text,
  commit_sha     text,
  deployer       text,
  environment    text        STATIC,
  can_deploy     boolean,
  blocked_reason text,
  motion_mode    text,
  PRIMARY KEY (version, evaluated_at)
) WITH CLUSTERING ORDER BY (evaluated_at DESC)
  AND comment = 'SEIS release gate evaluations, partitioned by version'
  AND default_time_to_live = 7776000;  -- 90 days TTL

-- ─── Deploy Checks Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deploy_checks (
  version      text,
  check_name   text,
  checked_at   timestamp,
  passed       boolean,
  detail       text,
  PRIMARY KEY ((version), check_name, checked_at)
) WITH CLUSTERING ORDER BY (check_name ASC, checked_at DESC);

-- ─── Motion Duration Violations Table ────────────────────────────────────
-- Records instances where rendered duration did not match policy
CREATE TABLE IF NOT EXISTS motion_violations (
  date         date,
  occurred_at  timestamp,
  session_id   uuid,
  token        text,
  motion_mode  text,
  expected_ms  int,
  actual_ms    int,
  PRIMARY KEY (date, occurred_at, session_id)
) WITH CLUSTERING ORDER BY (occurred_at DESC);

-- ─── Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS release_gates_status_idx
  ON release_gates (status);

CREATE INDEX IF NOT EXISTS release_gates_can_deploy_idx
  ON release_gates (can_deploy);

-- ─── Sample Queries ───────────────────────────────────────────────────────

-- Latest gate evaluation for a version
SELECT version, evaluated_at, status, can_deploy, blocked_reason
FROM release_gates
WHERE version = 'v2.4.0'
LIMIT 1;

-- All blocked deployments in the last 7 days
SELECT version, evaluated_at, blocked_reason
FROM release_gates
WHERE status = 'blocked'
ALLOW FILTERING;

-- Check results for a specific release
SELECT check_name, passed, detail, checked_at
FROM deploy_checks
WHERE version = 'v2.4.0'
ORDER BY check_name ASC, checked_at DESC;

-- Motion mode distribution
SELECT motion_mode, can_deploy, COUNT(*) AS evaluations
FROM release_gates
GROUP BY motion_mode, can_deploy
ALLOW FILTERING;
