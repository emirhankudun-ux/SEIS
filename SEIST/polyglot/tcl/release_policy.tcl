namespace eval seis::release_policy {
    variable server_target_confirmed 0
    variable reduced_motion_supported 1
    variable minimum_evidence_items 3

    proc ready_for_upload {accessibility_reviewed rollback_planned} {
        variable server_target_confirmed
        return [expr {$server_target_confirmed && $accessibility_reviewed && $rollback_planned}]
    }
}
