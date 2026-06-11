NB. SEIS Release Policy — J Language
NB. Motion policy and deploy gate using J's tacit and explicit definitions

NB. ─── Motion Duration Table ───────────────────────────────────────────────
NB. Parallel arrays: tokens and durations
MOTION_TOKENS    =: 'instant';'fast';'standard';'slow';'cinematic'
MOTION_DURATIONS =: 0 150 300 500 800

NB. ─── Motion Duration Ms ───────────────────────────────────────────────────
NB. Explicit verb: x = token (string), y = mode (string)
NB. Returns duration in ms; collapses to 0 for reduced/manual-low
motion_duration_ms =: 4 : 0
  token =. x
  mode  =. y
  NB. Find index of token in table
  idx =. MOTION_TOKENS i. < token
  NB. Base duration; default to standard (index 2) if not found
  base =. (idx < # MOTION_TOKENS) { (idx { MOTION_DURATIONS) , 300
  NB. Collapse to 0 if mode is reduced or manual-low
  isReduced =. mode e. 'reduced';'manual-low'
  isReduced { base , 0
)

NB. ─── Gate Status ─────────────────────────────────────────────────────────
NB. Tacit: y = boolean vector of check results
NB. Returns 'ready' if all pass, 'blocked' otherwise
gate_status =: 3 : 0
  failCount =. +/ -. y
  failCount { 'ready';'blocked'
)

NB. ─── Can Deploy ────────────────────────────────────────────────────────────
can_deploy =: 'ready' -: gate_status

NB. ─── Mode String ──────────────────────────────────────────────────────────
mode_string =: 3 : 0
  y e. <'reduced'   { 'reduced'
  y e. <'manual-low'{ 'manual-low'
  'full'
)

NB. ─── Print Line ────────────────────────────────────────────────────────────
printline =: (1!:2) & 2

NB. ─── Print Gate Report ──────────────────────────────────────────────────
NB. x = boxed list (version ; mode ; check_names)
NB. y = boolean vector of check results
print_gate_report =: 4 : 0
  version     =. > 0 { x
  mode        =. > 1 { x
  check_names =. > 2 { x
  results     =. y
  status      =. gate_status results

  printline 'SEIS Release Gate -- ' , version
  printline 40 # '-'
  printline 'Status:      ' , (toupper status)
  printline 'Motion mode: ' , mode
  printline 'Fast (ms):   ' , ": 'fast' motion_duration_ms mode
  printline 'Standard(ms): ' , ": 'standard' motion_duration_ms mode
  printline 40 # '-'

  NB. Print each check
  check_names =. <"1 check_names
  for_i. i. # results do.
    name   =. > i { check_names
    passed =. i { results
    marker =. passed { 'FAIL';'PASS'
    printline '  [' , marker , ']  ' , name
  end.

  printline 40 # '-'
  printline (can_deploy results) { 'Deploy: BLOCKED';'Deploy: AUTHORISED'
)

NB. ─── Main Execution ─────────────────────────────────────────────────────
CHECK_NAMES   =: 'typecheck';'lint';'content validation';'accessibility'
CHECK_RESULTS =: 1 1 1 0
MODE          =: 'full'

NB. Demonstrate duration resolution
'standard' motion_duration_ms 'full'    NB. -> 300
'standard' motion_duration_ms 'reduced' NB. -> 0

NB. Gate evaluation
gate_status CHECK_RESULTS               NB. -> blocked
can_deploy  CHECK_RESULTS               NB. -> 0

NB. Full report
('v2.4.0' ; MODE ; CHECK_NAMES) print_gate_report CHECK_RESULTS
