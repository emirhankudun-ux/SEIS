// SEIS Release Policy — Pony Language
// Motion policy and deploy gate using actors and capabilities

use "collections"
use "time"

// ─── Motion Mode Enum ─────────────────────────────────────────────────────
primitive Full
primitive Reduced
primitive ManualLow

type MotionMode is (Full | Reduced | ManualLow)

// ─── Release Status Enum ──────────────────────────────────────────────────
primitive Ready
primitive Pending
primitive Blocked
primitive Draft

type ReleaseStatus is (Ready | Pending | Blocked | Draft)

// ─── Deploy Check ─────────────────────────────────────────────────────────
class val DeployCheck
  let name: String val
  let passed: Bool

  new val create(name': String val, passed': Bool) =>
    name   = name'
    passed = passed'

// ─── Motion Policy ────────────────────────────────────────────────────────
class val MotionPolicy
  let mode: MotionMode

  new val create(mode': MotionMode) =>
    mode = mode'

  fun duration_ms(token: String): U64 =>
    let base: U64 =
      match token
      | "instant"   => 0
      | "fast"      => 150
      | "standard"  => 300
      | "slow"      => 500
      | "cinematic" => 800
      else            300
      end

    match mode
    | Full      => base
    | Reduced   => 0
    | ManualLow => 0
    end

  fun mode_str(): String =>
    match mode
    | Full      => "full"
    | Reduced   => "reduced"
    | ManualLow => "manual-low"
    end

// ─── Release Gate ─────────────────────────────────────────────────────────
class val ReleaseGate
  let version: String val
  let checks: Array[DeployCheck] val
  let policy: MotionPolicy val

  new val create(
    version': String val,
    checks': Array[DeployCheck] val,
    policy': MotionPolicy val)
  =>
    version = version'
    checks  = checks'
    policy  = policy'

  fun status(): ReleaseStatus =>
    var fail_count: USize = 0
    for check in checks.values() do
      if not check.passed then
        fail_count = fail_count + 1
      end
    end
    if fail_count == 0 then Ready else Blocked end

  fun status_str(): String =>
    match status()
    | Ready   => "READY"
    | Pending => "PENDING"
    | Blocked => "BLOCKED"
    | Draft   => "DRAFT"
    end

  fun can_deploy(): Bool =>
    match status()
    | Ready => true
    else      false
    end

// ─── Main Actor ───────────────────────────────────────────────────────────
actor Main
  new create(env: Env) =>
    let policy = MotionPolicy(Full)

    let checks: Array[DeployCheck] val = recover val
      [ DeployCheck("typecheck",          true  )
        DeployCheck("lint",               true  )
        DeployCheck("content validation", true  )
        DeployCheck("accessibility",      false ) ]
    end

    let gate = ReleaseGate("v2.4.0", checks, policy)

    env.out.print("SEIS Release Gate — " + gate.version)
    env.out.print(String.from_array("-".array(), 40))
    env.out.print("Status:      " + gate.status_str())
    env.out.print("Motion mode: " + gate.policy.mode_str())
    env.out.print("Fast:        " + gate.policy.duration_ms("fast").string() + "ms")
    env.out.print("Standard:    " + gate.policy.duration_ms("standard").string() + "ms")
    env.out.print(String.from_array("-".array(), 40))

    for check in gate.checks.values() do
      let marker: String = if check.passed then "PASS" else "FAIL" end
      env.out.print("  [" + marker + "]  " + check.name)
    end

    env.out.print(String.from_array("-".array(), 40))

    if gate.can_deploy() then
      env.out.print("Deploy authorised.")
    else
      env.out.print("Deploy blocked — resolve failing checks.")
    end
