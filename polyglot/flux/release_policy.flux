// SEIS Release Policy — InfluxDB Flux
// Queries release gate telemetry and motion mode field data
// Compatible with InfluxDB 2.x and 3.x

// ─── Import Packages ──────────────────────────────────────────────────────
import "strings"
import "date"
import "math"

// ─── Configuration Options ────────────────────────────────────────────────
option bucket       = "seis_telemetry"
option organisation = "seis"
option startRange   = -24h

// ─── Motion Mode Query ────────────────────────────────────────────────────
// Retrieves the current motion mode from the seis_config measurement
motionModeData = from(bucket: bucket)
  |> range(start: startRange)
  |> filter(fn: (r) => r._measurement == "seis_config")
  |> filter(fn: (r) => r._field == "motion_mode")
  |> last()
  |> map(fn: (r) => ({
    r with
    motionMode: r._value,
    isReduced: r._value == "reduced" or r._value == "manual-low"
  }))

// ─── Release Gate Events Query ────────────────────────────────────────────
// Retrieves all release gate evaluations in the time window
releaseGateEvents = from(bucket: bucket)
  |> range(start: startRange)
  |> filter(fn: (r) => r._measurement == "seis_release_gate")
  |> filter(fn: (r) =>
    r._field == "status"    or
    r._field == "version"   or
    r._field == "can_deploy"
  )
  |> pivot(
    rowKey:      ["_time"],
    columnKey:   ["_field"],
    valueColumn: "_value"
  )
  |> sort(columns: ["_time"], desc: true)

// ─── Blocked Deployments in Window ────────────────────────────────────────
blockedDeployments = from(bucket: bucket)
  |> range(start: startRange)
  |> filter(fn: (r) => r._measurement == "seis_release_gate")
  |> filter(fn: (r) => r._field == "status")
  |> filter(fn: (r) => r._value == "blocked")
  |> count()
  |> rename(columns: {_value: "blocked_count"})

// ─── Reduced-Motion Usage ─────────────────────────────────────────────────
// How often users have reduced-motion active
reducedMotionSessions = from(bucket: bucket)
  |> range(start: startRange)
  |> filter(fn: (r) => r._measurement == "seis_session")
  |> filter(fn: (r) => r._field == "motion_mode")
  |> group(columns: ["_value"])
  |> count()
  |> rename(columns: {_value: "session_count"})

// ─── Motion Duration Adherence ────────────────────────────────────────────
// Verifies that rendered durations match policy expectations
durationAdherence = from(bucket: bucket)
  |> range(start: startRange)
  |> filter(fn: (r) => r._measurement == "seis_motion_duration")
  |> filter(fn: (r) => r.token == "standard")
  |> map(fn: (r) => ({
    r with
    expected: if r.motion_mode == "full" then 300 else 0,
    compliant: (
      if r.motion_mode == "full"
      then r._value == 300
      else r._value == 0
    )
  }))
  |> filter(fn: (r) => not r.compliant)
  |> count()
  |> rename(columns: {_value: "violations"})

// ─── Latest Gate Status ───────────────────────────────────────────────────
latestGateStatus = releaseGateEvents
  |> first()
  |> keep(columns: ["_time", "version", "status", "can_deploy"])

latestGateStatus
