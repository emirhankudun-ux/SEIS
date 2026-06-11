# SEIS Release Policy — Bend (HVM2)
# Motion policy and deploy gate using Bend's parallel functional model

# ─── Type Declarations ────────────────────────────────────────────────────
type MotionMode:
  Full
  Reduced
  ManualLow

type ReleaseStatus:
  Ready
  Pending
  Blocked
  Draft

type DeployCheck:
  Check { name: u24, passed: u24 }

# ─── Motion Duration Ms ───────────────────────────────────────────────────
# Returns duration in ms; collapses to 0 in Reduced/ManualLow modes
def motion_duration_ms(token, mode):
  base = match token:
    case 0: 0     # instant
    case 1: 150   # fast
    case 2: 300   # standard
    case 3: 500   # slow
    case 4: 800   # cinematic
    case _: 300

  match mode:
    case MotionMode/Full:
      return base
    case MotionMode/Reduced:
      return 0
    case MotionMode/ManualLow:
      return 0

# ─── Gate Status ──────────────────────────────────────────────────────────
# Evaluates a list of checks and returns status
def gate_status(checks):
  match checks:
    case []:
      return ReleaseStatus/Ready
    case [head, *tail]:
      rest = gate_status(tail)
      match head:
        case DeployCheck/Check { name, passed }:
          match passed:
            case 1:
              return rest
            case 0:
              return ReleaseStatus/Blocked

# ─── Can Deploy ───────────────────────────────────────────────────────────
def can_deploy(checks):
  match gate_status(checks):
    case ReleaseStatus/Ready:
      return 1
    case _:
      return 0

# ─── Status String ────────────────────────────────────────────────────────
def status_string(status):
  match status:
    case ReleaseStatus/Ready:   return "READY"
    case ReleaseStatus/Pending: return "PENDING"
    case ReleaseStatus/Blocked: return "BLOCKED"
    case ReleaseStatus/Draft:   return "DRAFT"

# ─── Main ─────────────────────────────────────────────────────────────────
def main():
  mode = MotionMode/Full

  checks = [
    DeployCheck/Check { name: 0, passed: 1 },  # typecheck: pass
    DeployCheck/Check { name: 1, passed: 1 },  # lint: pass
    DeployCheck/Check { name: 2, passed: 1 },  # content: pass
    DeployCheck/Check { name: 3, passed: 0 },  # accessibility: fail
  ]

  status     = gate_status(checks)
  deploy_ok  = can_deploy(checks)
  fast_ms    = motion_duration_ms(1, mode)   # fast token
  std_ms     = motion_duration_ms(2, mode)   # standard token

  return (status, deploy_ok, fast_ms, std_ms)
