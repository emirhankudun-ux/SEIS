class_name SeisReleasePolicy

const SERVER_TARGET_CONFIRMED := false
const REDUCED_MOTION_SUPPORTED := true
const MINIMUM_EVIDENCE_ITEMS := 3

static func ready_for_upload(accessibility_reviewed: bool, rollback_planned: bool) -> bool:
    return SERVER_TARGET_CONFIRMED and accessibility_reviewed and rollback_planned
