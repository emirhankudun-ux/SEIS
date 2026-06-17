# SEIS Release Policy — Nickel Configuration Language
# Motion policy and release gate configuration with contracts

# ─── Type Contracts ─────────────────────────────────────────────────────────
let MotionMode
  | doc "Valid motion modes for the SEIS surface."
  = std.contract.from_predicate (fun v =>
    v == "full" || v == "reduced" || v == "manual-low"
  ) in

let ReleaseStatus
  | doc "Valid release gate statuses."
  = std.contract.from_predicate (fun v =>
    v == "ready" || v == "pending" || v == "blocked" || v == "draft"
  ) in

let DurationMs
  | doc "Motion duration in milliseconds (0–10000)."
  = std.contract.from_predicate (fun v =>
    std.is_number v && v >= 0 && v <= 10000
  ) in

let DeployCheckContract = {
  name   | String,
  passed | Bool,
  detail | String | optional,
} in

# ─── Motion Durations Function ───────────────────────────────────────────────
let motion_duration_ms
  : String -> String -> Number
  | doc "Returns duration in ms for token; collapses to 0 in reduced modes."
  = fun token mode =>
    let base =
      if token == "instant"   then 0
      else if token == "fast"      then 150
      else if token == "standard"  then 300
      else if token == "slow"      then 500
      else if token == "cinematic" then 800
      else 300
    in
    if mode == "reduced" || mode == "manual-low" then 0 else base
  in

# ─── Gate Status ─────────────────────────────────────────────────────────────
let gate_status
  : Array { name | String, passed | Bool } -> String
  | doc "Returns 'ready' if all checks pass, 'blocked' otherwise."
  = fun checks =>
    let fail_count = std.array.length (std.array.filter (fun c => !c.passed) checks) in
    if fail_count == 0 then "ready" else "blocked"
  in

# ─── Motion Policy Record ────────────────────────────────────────────────────
let make_motion_policy = fun mode => {
  mode              | MotionMode   = mode,
  duration_instant  | DurationMs   = motion_duration_ms "instant"   mode,
  duration_fast     | DurationMs   = motion_duration_ms "fast"      mode,
  duration_standard | DurationMs   = motion_duration_ms "standard"  mode,
  duration_slow     | DurationMs   = motion_duration_ms "slow"      mode,
  duration_cinematic| DurationMs   = motion_duration_ms "cinematic" mode,
} in

# ─── Sample Checks ────────────────────────────────────────────────────────────
let sample_checks = [
  { name = "typecheck",          passed = true  },
  { name = "lint",               passed = true  },
  { name = "content validation", passed = true  },
  { name = "accessibility",      passed = false },
] in

# ─── Release Gate Configuration ──────────────────────────────────────────────
{
  version     | String        = "v2.4.0",
  environment | String        = "production",
  motion      = make_motion_policy "full",
  checks      = sample_checks,
  status      | ReleaseStatus = gate_status sample_checks,
  can_deploy  | Bool          = gate_status sample_checks == "ready",

  # Summary report
  summary = {
    version      = version,
    status       = status,
    status_label = std.string.uppercase status,
    can_deploy   = can_deploy,
    motion_mode  = motion.mode,
    fast_ms      = motion.duration_fast,
    standard_ms  = motion.duration_standard,
    fail_count   = std.array.length (std.array.filter (fun c => !c.passed) checks),
    pass_count   = std.array.length (std.array.filter (fun c => c.passed) checks),
  },
}
