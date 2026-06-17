# SEIS Release Policy — Mojo (Modular)
# Motion policy and deploy gate using Mojo's Python-superset type system

# ─── Type Aliases ─────────────────────────────────────────────────────────
alias MotionDurationMs = Int
alias CheckName = String

# ─── Motion Mode Struct ───────────────────────────────────────────────────
struct MotionMode:
    var value: String

    fn __init__(inout self, value: String):
        self.value = value

    fn is_reduced(self) -> Bool:
        return self.value == "reduced" or self.value == "manual-low"

    fn to_string(self) -> String:
        return self.value

# ─── Motion Durations Struct ──────────────────────────────────────────────
struct MotionDurations:
    var instant:   Int
    var fast:      Int
    var standard:  Int
    var slow:      Int
    var cinematic: Int

    fn __init__(inout self, mode: MotionMode):
        if mode.is_reduced():
            self.instant   = 0
            self.fast      = 0
            self.standard  = 0
            self.slow      = 0
            self.cinematic = 0
        else:
            self.instant   = 0
            self.fast      = 150
            self.standard  = 300
            self.slow      = 500
            self.cinematic = 800

    fn for_token(self, token: String) -> Int:
        if token == "instant":   return self.instant
        if token == "fast":      return self.fast
        if token == "standard":  return self.standard
        if token == "slow":      return self.slow
        if token == "cinematic": return self.cinematic
        return self.standard  # default

# ─── Deploy Check Struct ──────────────────────────────────────────────────
struct DeployCheck:
    var name:   String
    var passed: Bool

    fn __init__(inout self, name: String, passed: Bool):
        self.name   = name
        self.passed = passed

    fn marker(self) -> String:
        return "PASS" if self.passed else "FAIL"

# ─── Release Status Enum ──────────────────────────────────────────────────
struct ReleaseStatus:
    var value: String

    fn __init__(inout self, value: String):
        self.value = value

    fn to_string(self) -> String:
        if self.value == "ready":   return "READY"
        if self.value == "pending": return "PENDING"
        if self.value == "blocked": return "BLOCKED"
        if self.value == "draft":   return "DRAFT"
        return "UNKNOWN"

# ─── Release Gate Struct ──────────────────────────────────────────────────
struct ReleaseGate:
    var version:   String
    var mode:      MotionMode
    var durations: MotionDurations

    fn __init__(inout self, version: String, mode: MotionMode):
        self.version   = version
        self.mode      = mode
        self.durations = MotionDurations(mode)

    fn gate_status(self, checks: List[DeployCheck]) -> ReleaseStatus:
        var fail_count: Int = 0
        for check in checks:
            if not check[].passed:
                fail_count += 1
        return ReleaseStatus("ready") if fail_count == 0 else ReleaseStatus("blocked")

    fn can_deploy(self, checks: List[DeployCheck]) -> Bool:
        return self.gate_status(checks).value == "ready"

# ─── Main ─────────────────────────────────────────────────────────────────
fn main():
    var mode = MotionMode("full")
    var gate = ReleaseGate("v2.4.0", mode)

    var checks = List[DeployCheck]()
    checks.append(DeployCheck("typecheck",          True))
    checks.append(DeployCheck("lint",               True))
    checks.append(DeployCheck("content validation", True))
    checks.append(DeployCheck("accessibility",      False))

    var status = gate.gate_status(checks)

    print("SEIS Release Gate — " + gate.version)
    print("-" * 40)
    print("Status:       " + status.to_string())
    print("Motion mode:  " + gate.mode.to_string())
    print("Fast (ms):    " + String(gate.durations.fast))
    print("Standard (ms):" + String(gate.durations.standard))
    print("-" * 40)

    for check in checks:
        print("  [" + check[].marker() + "]  " + check[].name)

    print("-" * 40)
    if gate.can_deploy(checks):
        print("Deploy: AUTHORISED")
    else:
        print("Deploy: BLOCKED")
