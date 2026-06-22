CONSTANTS gc_requires_confirmed_target TYPE abap_bool VALUE abap_true.
CONSTANTS gc_supports_reduced_motion TYPE abap_bool VALUE abap_true.
CONSTANTS gc_minimum_evidence_items TYPE i VALUE 3.

DATA gv_ready_for_upload TYPE abap_bool.

IF gc_requires_confirmed_target = abap_true
   AND gc_supports_reduced_motion = abap_true.
  gv_ready_for_upload = abap_false.
ENDIF.
