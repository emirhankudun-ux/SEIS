module seis::release_policy {
    const SERVER_TARGET_CONFIRMED: bool = false;
    const REDUCED_MOTION_SUPPORTED: bool = true;
    const MINIMUM_EVIDENCE_ITEMS: u8 = 3;

    public fun ready_for_upload(accessibility_reviewed: bool, rollback_planned: bool): bool {
        SERVER_TARGET_CONFIRMED && accessibility_reviewed && rollback_planned
    }

    public fun reduced_motion_supported(): bool {
        REDUCED_MOTION_SUPPORTED
    }
}
