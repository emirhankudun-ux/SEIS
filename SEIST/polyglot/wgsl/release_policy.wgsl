const SEIS_SERVER_TARGET_CONFIRMED: bool = false;
const SEIS_REDUCED_MOTION_SUPPORTED: bool = true;
const SEIS_MINIMUM_EVIDENCE_ITEMS: i32 = 3;

fn seis_ready_for_upload(accessibility_reviewed: bool, rollback_planned: bool) -> bool {
  return SEIS_SERVER_TARGET_CONFIRMED && accessibility_reviewed && rollback_planned;
}
