BEGIN {
  server_target_confirmed = 0
  reduced_motion_supported = 1
  minimum_evidence_items = 3
}

function ready_for_upload(accessibility_reviewed, rollback_planned) {
  return server_target_confirmed && accessibility_reviewed && rollback_planned
}
