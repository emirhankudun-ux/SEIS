enum abstract ReleaseStatus(String) {
  var Ready   = "ready";
  var Blocked = "blocked";
  var Pending = "pending";
}

enum abstract MotionMode(String) {
  var Cinematic = "cinematic";
  var Balanced  = "balanced";
  var Reduced   = "reduced";
}

class SeisReleasePolicy {
  public static function resolveMotion(requested: MotionMode, prefersReduced: Bool): MotionMode {
    return prefersReduced ? Reduced : requested;
  }

  public static function canDeploy(status: ReleaseStatus): Bool {
    return status == Ready;
  }

  static function main(): Void {
    var mode = resolveMotion(Cinematic, true);
    trace(mode); // reduced
  }
}
