public with sharing class SeisReleasePolicy {
    public static final Boolean SERVER_TARGET_CONFIRMED = false;
    public static final Boolean REDUCED_MOTION_SUPPORTED = true;
    public static final Integer MINIMUM_EVIDENCE_ITEMS = 3;

    public static Boolean readyForUpload(Boolean accessibilityReviewed, Boolean rollbackPlanned) {
        return SERVER_TARGET_CONFIRMED && accessibilityReviewed && rollbackPlanned;
    }
}
