// SEIS Release Policy — Carbon (Google, experimental)

package SEIS.ReleasePolicy api;

import Core library "prelude";

choice MotionMode {
  Cinematic,
  Balanced,
  Reduced,
}

choice ReleaseStatus {
  Ready,
  Blocked,
  Pending,
}

fn ResolveMotion(requested: MotionMode, prefers_reduced: bool) -> MotionMode {
  if (prefers_reduced) {
    return .Reduced;
  }
  return requested;
}

fn CanDeploy(status: ReleaseStatus) -> bool {
  match (status) {
    case .Ready => { return true; }
    default => { return false; }
  }
}

fn MotionDurationMs(mode: MotionMode) -> i32 {
  match (mode) {
    case .Cinematic => { return 600; }
    case .Balanced  => { return 300; }
    case .Reduced   => { return 0; }
  }
}
