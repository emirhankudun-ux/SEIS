* SEIS Release Policy — SPSS Syntax.

* Define motion mode values.
DEFINE !CINEMATIC() 'cinematic' !ENDDEFINE.
DEFINE !BALANCED()  'balanced'  !ENDDEFINE.
DEFINE !REDUCED()   'reduced'   !ENDDEFINE.

* Create motion duration dataset.
DATA LIST FREE / mode (A20) duration_ms (F6.0).
BEGIN DATA
cinematic 600
balanced  300
reduced     0
END DATA.
VARIABLE LABELS mode 'Motion Mode' duration_ms 'Duration (ms)'.

* Create release gate dataset.
DATA LIST FREE / status (A20) can_deploy (F1.0).
BEGIN DATA
ready   1
blocked 0
pending 0
END DATA.
VARIABLE LABELS status 'Release Status' can_deploy 'Can Deploy (0=No, 1=Yes)'.

* Frequencies analysis.
FREQUENCIES VARIABLES = mode.
CROSSTABS TABLES = status BY can_deploy.

* Compute resolved motion mode.
COMPUTE prefers_reduced = 1.
COMPUTE requested_mode = !CINEMATIC.
IF (prefers_reduced = 1) resolved_mode = !REDUCED.
IF (prefers_reduced = 0) resolved_mode = requested_mode.
EXECUTE.

FINISH.
