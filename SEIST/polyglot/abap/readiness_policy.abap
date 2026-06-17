CONSTANTS gc_server_target_confirmed TYPE abap_bool VALUE abap_false.
CONSTANTS gc_reduced_motion_supported TYPE abap_bool VALUE abap_true.
CONSTANTS gc_minimum_evidence_items TYPE i VALUE 3.

DATA gv_ready_for_upload TYPE abap_bool.

IF gc_server_target_confirmed = abap_true
   AND gc_reduced_motion_supported = abap_true.
  gv_ready_for_upload = abap_true.
ELSE.
  gv_ready_for_upload = abap_false.
ENDIF.
