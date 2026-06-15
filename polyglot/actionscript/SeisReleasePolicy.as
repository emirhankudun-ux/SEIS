package seis {

  public class SeisReleasePolicy {

    public static const MOTION_CINEMATIC:String = "cinematic";
    public static const MOTION_BALANCED:String  = "balanced";
    public static const MOTION_REDUCED:String   = "reduced";

    public static const STATUS_READY:String   = "ready";
    public static const STATUS_BLOCKED:String = "blocked";
    public static const STATUS_PENDING:String = "pending";

    public static function resolveMotionMode(requested:String, prefersReduced:Boolean):String {
      return prefersReduced ? MOTION_REDUCED : requested;
    }

    public static function canDeploy(status:String):Boolean {
      return status === STATUS_READY;
    }

    public static function motionDurationMs(mode:String):int {
      switch (mode) {
        case MOTION_CINEMATIC: return 600;
        case MOTION_BALANCED:  return 300;
        case MOTION_REDUCED:   return 0;
        default:               return 0;
      }
    }
  }
}
