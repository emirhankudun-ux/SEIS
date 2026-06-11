import gleam/io

pub type ReleaseStatus {
  Ready
  Blocked
  Pending
}

pub type MotionMode {
  Cinematic
  Balanced
  Reduced
}

pub fn resolve_motion(requested: MotionMode, prefers_reduced: Bool) -> MotionMode {
  case prefers_reduced {
    True -> Reduced
    False -> requested
  }
}

pub fn can_deploy(status: ReleaseStatus) -> Bool {
  case status {
    Ready -> True
    _ -> False
  }
}

pub fn main() {
  let mode = resolve_motion(Cinematic, True)
  io.debug(mode)
}
