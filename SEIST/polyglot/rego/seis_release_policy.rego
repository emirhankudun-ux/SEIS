package seis.release

default ready_for_upload := false

ready_for_upload if {
  input.target_confirmed == true
  input.accessibility_reviewed == true
  input.rollback_planned == true
  input.supports_reduced_motion == true
}
