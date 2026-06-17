// SEIS Release Policy — Wren

class MotionMode {
  static cinematic { "cinematic" }
  static balanced  { "balanced"  }
  static reduced   { "reduced"   }
}

class SeisReleasePolicy {
  static resolveMotion(requested, prefersReduced) {
    return prefersReduced ? MotionMode.reduced : requested
  }

  static canDeploy(status) {
    return status == "ready"
  }

  static motionDurationMs(mode) {
    if (mode == MotionMode.cinematic) return 600
    if (mode == MotionMode.balanced)  return 300
    return 0
  }
}

var mode = SeisReleasePolicy.resolveMotion(MotionMode.cinematic, true)
System.print("Resolved mode: %(mode)")
System.print("Duration: %(SeisReleasePolicy.motionDurationMs(mode))ms")
