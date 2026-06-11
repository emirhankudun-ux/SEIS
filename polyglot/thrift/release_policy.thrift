/**
 * SEIS Release Policy — Apache Thrift IDL
 * Motion policy and release gate service definition
 */

namespace py   seis.release
namespace js   seis.release
namespace java com.seis.release
namespace go   seis.release

// ─── Constants ────────────────────────────────────────────────────────────
const string SEIS_VERSION = "2.4.0"

const map<string, i32> MOTION_DURATIONS_FULL = {
  "instant"   : 0,
  "fast"      : 150,
  "standard"  : 300,
  "slow"      : 500,
  "cinematic" : 800
}

// ─── Motion Mode Enum ─────────────────────────────────────────────────────
enum MotionMode {
  FULL       = 0,
  REDUCED    = 1,
  MANUAL_LOW = 2
}

// ─── Release Status Enum ──────────────────────────────────────────────────
enum ReleaseStatus {
  READY   = 0,
  PENDING = 1,
  BLOCKED = 2,
  DRAFT   = 3
}

// ─── Motion Token Enum ────────────────────────────────────────────────────
enum MotionToken {
  INSTANT   = 0,
  FAST      = 1,
  STANDARD  = 2,
  SLOW      = 3,
  CINEMATIC = 4
}

// ─── Motion Policy Struct ─────────────────────────────────────────────────
struct MotionPolicy {
  1: required MotionMode mode = MotionMode.FULL,
  2: optional i32 duration_instant   = 0,
  3: optional i32 duration_fast      = 150,
  4: optional i32 duration_standard  = 300,
  5: optional i32 duration_slow      = 500,
  6: optional i32 duration_cinematic = 800
}

// ─── Deploy Check Struct ──────────────────────────────────────────────────
struct DeployCheck {
  1: required string name,
  2: required bool   passed,
  3: optional string detail
}

// ─── Release Gate Struct ──────────────────────────────────────────────────
struct ReleaseGate {
  1:  required string         version,
  2:  required ReleaseStatus  status,
  3:  optional string         branch,
  4:  optional string         commit_sha,
  5:  optional string         deployer,
  6:  optional string         environment,
  7:  optional string         iso_timestamp,
  8:  optional list<DeployCheck> checks,
  9:  optional MotionPolicy   policy,
  10: optional bool           can_deploy = false,
  11: optional string         blocked_reason
}

// ─── Exception ────────────────────────────────────────────────────────────
exception ReleaseGateException {
  1: string message,
  2: ReleaseStatus status,
  3: list<string> failing_checks
}

// ─── Release Gate Service ─────────────────────────────────────────────────
service ReleaseGateService {
  /**
   * Evaluate the release gate for a given version.
   * Returns a ReleaseGate with the current status.
   */
  ReleaseGate evaluateGate(
    1: string version,
    2: MotionMode motion_mode
  ) throws (1: ReleaseGateException e),

  /**
   * Returns the motion duration in ms for a token and mode.
   */
  i32 motionDurationMs(
    1: MotionToken token,
    2: MotionMode  mode
  ),

  /**
   * Returns true if the gate is currently open for deployment.
   */
  bool canDeploy(1: string version)
}
