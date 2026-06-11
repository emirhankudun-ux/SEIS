# SEIS Release Policy — Cap'n Proto Schema
# Motion policy and release gate binary protocol definition

@0xd3b5a1c7f8e29041;

# ─── Motion Mode Enum ─────────────────────────────────────────────────────
enum MotionMode {
  full      @0;
  reduced   @1;
  manualLow @2;
}

# ─── Release Status Enum ──────────────────────────────────────────────────
enum ReleaseStatus {
  ready   @0;
  pending @1;
  blocked @2;
  draft   @3;
}

# ─── Motion Token Enum ────────────────────────────────────────────────────
enum MotionToken {
  instant   @0;
  fast      @1;
  standard  @2;
  slow      @3;
  cinematic @4;
}

# ─── Motion Policy Struct ─────────────────────────────────────────────────
struct MotionPolicy {
  mode              @0 :MotionMode = full;
  durationInstant   @1 :UInt32 = 0;
  durationFast      @2 :UInt32 = 150;
  durationStandard  @3 :UInt32 = 300;
  durationSlow      @4 :UInt32 = 500;
  durationCinematic @5 :UInt32 = 800;
}

# ─── Deploy Check Struct ──────────────────────────────────────────────────
struct DeployCheck {
  name   @0 :Text;
  passed @1 :Bool = false;
  detail @2 :Text;
}

# ─── Release Gate Struct ──────────────────────────────────────────────────
struct ReleaseGate {
  version       @0  :Text;
  status        @1  :ReleaseStatus = pending;
  branch        @2  :Text;
  commitSha     @3  :Text;
  deployer      @4  :Text;
  environment   @5  :Text;
  isoTimestamp  @6  :Text;
  checks        @7  :List(DeployCheck);
  policy        @8  :MotionPolicy;
  canDeploy     @9  :Bool = false;
  blockedReason @10 :Text;
}

# ─── Release Event Struct ─────────────────────────────────────────────────
struct ReleaseEvent {
  gate        @0 :ReleaseGate;
  eventType   @1 :Text;       # "gate_evaluated" | "deployed" | "blocked"
  triggeredBy @2 :Text;
  timestampMs @3 :UInt64;     # Unix epoch milliseconds
}

# ─── Motion Duration Request ──────────────────────────────────────────────
struct MotionDurationRequest {
  token @0 :MotionToken;
  mode  @1 :MotionMode;
}

struct MotionDurationResponse {
  durationMs @0 :UInt32;
}

# ─── Release Gate Interface ───────────────────────────────────────────────
interface ReleaseGateService {
  evaluateGate @0 (version :Text, motionMode :MotionMode)
               -> (gate :ReleaseGate);

  motionDuration @1 (request :MotionDurationRequest)
                 -> (response :MotionDurationResponse);

  canDeploy @2 (version :Text) -> (result :Bool);
}
