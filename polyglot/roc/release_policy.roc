# SEIS Release Policy — Roc Language
# Motion policy and deploy gate using Roc's type system

app [main] { pf: platform "https://github.com/roc-lang/basic-cli/releases/download/0.10.0/vNe6s9hWzoTZtFmNkvEICPErI9ptvi5_HfIAEFQExWk.tar.br" }

import pf.Stdout
import pf.Task

# ─── Motion Mode Type ─────────────────────────────────────────────────────
MotionMode : [Full, Reduced, ManualLow]

# ─── Release Status Type ──────────────────────────────────────────────────
ReleaseStatus : [Ready, Pending, Blocked, Draft]

# ─── Deploy Check Type ────────────────────────────────────────────────────
DeployCheck : { name : Str, passed : Bool }

# ─── Motion Duration Ms ───────────────────────────────────────────────────
motionDurationMs : Str, MotionMode -> U64
motionDurationMs = \token, mode ->
    base =
        when token is
            "instant"   -> 0u64
            "fast"      -> 150u64
            "standard"  -> 300u64
            "slow"      -> 500u64
            "cinematic" -> 800u64
            _           -> 300u64

    when mode is
        Full      -> base
        Reduced   -> 0u64
        ManualLow -> 0u64

# ─── Gate Status Resolver ─────────────────────────────────────────────────
gateStatus : List DeployCheck -> ReleaseStatus
gateStatus = \checks ->
    failCount =
        List.countIf checks \check -> !(check.passed)

    if failCount == 0 then
        Ready
    else
        Blocked

# ─── Status To String ─────────────────────────────────────────────────────
statusStr : ReleaseStatus -> Str
statusStr = \status ->
    when status is
        Ready   -> "READY"
        Pending -> "PENDING"
        Blocked -> "BLOCKED"
        Draft   -> "DRAFT"

# ─── Motion Mode To String ────────────────────────────────────────────────
modeStr : MotionMode -> Str
modeStr = \mode ->
    when mode is
        Full      -> "full"
        Reduced   -> "reduced"
        ManualLow -> "manual-low"

# ─── Print Gate Report ────────────────────────────────────────────────────
printGateReport : Str, ReleaseStatus, MotionMode, List DeployCheck -> Task.Task {} _
printGateReport = \version, status, mode, checks ->
    _ <- Stdout.line! "SEIS Release Gate — $(version)"
    _ <- Stdout.line! (Str.repeat "-" 40)
    _ <- Stdout.line! "Status:      $(statusStr status)"
    _ <- Stdout.line! "Motion mode: $(modeStr mode)"
    _ <- Stdout.line! (Str.repeat "-" 40)
    _ <-
        List.walk checks (Task.ok {}) \accTask, check ->
            _ <- accTask
            marker = if check.passed then "PASS" else "FAIL"
            Stdout.line! "  [$(marker)]  $(check.name)"
    _ <- Stdout.line! (Str.repeat "-" 40)
    Task.ok {}

# ─── Main ─────────────────────────────────────────────────────────────────
main =
    motionMode = Full

    checks = [
        { name: "typecheck",          passed: Bool.true  },
        { name: "lint",               passed: Bool.true  },
        { name: "content validation", passed: Bool.true  },
        { name: "accessibility",      passed: Bool.false },
    ]

    status = gateStatus checks

    _ <- printGateReport! "v2.4.0" status motionMode checks

    _ <- Stdout.line! "Fast duration:     $(Num.toStr (motionDurationMs "fast" motionMode))ms"
    _ <- Stdout.line! "Standard duration: $(Num.toStr (motionDurationMs "standard" motionMode))ms"

    Task.ok {}
