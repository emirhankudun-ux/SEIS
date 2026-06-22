namespace SEIS.ReleasePolicy {
    function ReadyForUpload(accessibilityReviewed : Bool, rollbackPlanned : Bool) : Bool {
        let serverTargetConfirmed = false;
        return serverTargetConfirmed and accessibilityReviewed and rollbackPlanned;
    }

    function ReducedMotionSupported() : Bool {
        return true;
    }
}
