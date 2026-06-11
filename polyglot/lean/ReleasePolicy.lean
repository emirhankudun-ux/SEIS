-- SEIS Release Policy — Lean 4
-- Motion policy and deploy gate using inductive types and pattern matching

-- ─── Motion Mode ──────────────────────────────────────────────────────────
inductive MotionMode where
  | Full
  | Reduced
  | ManualLow
  deriving Repr, BEq

-- ─── Release Status ───────────────────────────────────────────────────────
inductive ReleaseStatus where
  | Ready
  | Pending
  | Blocked
  | Draft
  deriving Repr, BEq

-- ─── Deploy Check ─────────────────────────────────────────────────────────
structure DeployCheck where
  name   : String
  passed : Bool
  deriving Repr

-- ─── Motion Duration Ms ───────────────────────────────────────────────────
def motionDurationMs (token : String) (mode : MotionMode) : Nat :=
  let base : Nat :=
    match token with
    | "instant"   => 0
    | "fast"      => 150
    | "standard"  => 300
    | "slow"      => 500
    | "cinematic" => 800
    | _           => 300
  match mode with
  | MotionMode.Full      => base
  | MotionMode.Reduced   => 0
  | MotionMode.ManualLow => 0

-- ─── Mode To String ───────────────────────────────────────────────────────
def modeToString (mode : MotionMode) : String :=
  match mode with
  | MotionMode.Full      => "full"
  | MotionMode.Reduced   => "reduced"
  | MotionMode.ManualLow => "manual-low"

-- ─── Status To String ─────────────────────────────────────────────────────
def statusToString (status : ReleaseStatus) : String :=
  match status with
  | ReleaseStatus.Ready   => "READY"
  | ReleaseStatus.Pending => "PENDING"
  | ReleaseStatus.Blocked => "BLOCKED"
  | ReleaseStatus.Draft   => "DRAFT"

-- ─── Gate Status ──────────────────────────────────────────────────────────
def gateStatus (checks : List DeployCheck) : ReleaseStatus :=
  let failCount := checks.filter (fun c => !c.passed) |>.length
  if failCount == 0 then ReleaseStatus.Ready else ReleaseStatus.Blocked

-- ─── Can Deploy ───────────────────────────────────────────────────────────
def canDeploy (checks : List DeployCheck) : Bool :=
  match gateStatus checks with
  | ReleaseStatus.Ready => true
  | _                   => false

-- ─── Release Gate Config ──────────────────────────────────────────────────
structure ReleaseGate where
  version : String
  status  : ReleaseStatus
  mode    : MotionMode
  checks  : List DeployCheck
  deriving Repr

def buildGate (version : String) (mode : MotionMode)
    (checks : List DeployCheck) : ReleaseGate :=
  { version := version
    status  := gateStatus checks
    mode    := mode
    checks  := checks }

-- ─── Evaluation Examples ──────────────────────────────────────────────────
#eval motionDurationMs "standard" MotionMode.Full      -- 300
#eval motionDurationMs "standard" MotionMode.Reduced   -- 0
#eval motionDurationMs "cinematic" MotionMode.Full     -- 800

#eval
  let checks : List DeployCheck := [
    { name := "typecheck",          passed := true  },
    { name := "lint",               passed := true  },
    { name := "content validation", passed := true  },
    { name := "accessibility",      passed := false }
  ]
  let gate := buildGate "v2.4.0" MotionMode.Full checks
  s!"Version: {gate.version}, Status: {statusToString gate.status}, Mode: {modeToString gate.mode}"
