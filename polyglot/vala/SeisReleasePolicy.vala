public enum MotionMode {
    CINEMATIC,
    BALANCED,
    REDUCED
}

public enum ReleaseStatus {
    READY,
    BLOCKED,
    PENDING
}

public class SeisReleasePolicy : Object {
    public static MotionMode resolve_motion (MotionMode requested, bool prefers_reduced) {
        return prefers_reduced ? MotionMode.REDUCED : requested;
    }

    public static bool can_deploy (ReleaseStatus status) {
        return status == ReleaseStatus.READY;
    }

    public static int motion_duration_ms (MotionMode mode) {
        switch (mode) {
            case CINEMATIC: return 600;
            case BALANCED:  return 300;
            case REDUCED:   return 0;
            default:        return 0;
        }
    }
}
