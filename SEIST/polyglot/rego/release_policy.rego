package seis.release_policy

default ready_for_upload := false

reduced_motion_supported := true
minimum_evidence_items := 3

ready_for_upload if {
  input.server_target_confirmed == true
  input.accessibility_reviewed == true
  input.rollback_planned == true
}
