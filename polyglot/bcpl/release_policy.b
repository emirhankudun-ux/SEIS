// SEIS Release Policy — BCPL
// Motion policy resolution and deploy gate validation
// Classic BCPL syntax (B language variant)

get "libhdr"

// ─── Global Constants ────────────────────────────────────────────────────
global
$(
  MOTION.FULL:     100
  MOTION.REDUCED:  101
  MOTION.MANUAL:   102

  STATUS.READY:    200
  STATUS.BLOCKED:  201
  STATUS.PENDING:  202
)

// ─── Motion Duration Function ────────────────────────────────────────────
let motion.duration.ms(token, mode) = valof
$(
  let base = 300  // default to standard

  if token = "instant"   do base := 0
  if token = "fast"      do base := 150
  if token = "standard"  do base := 300
  if token = "slow"      do base := 500
  if token = "cinematic" do base := 800

  resultis (mode = MOTION.REDUCED | mode = MOTION.MANUAL) -> 0, base
$)

// ─── Mode To String ───────────────────────────────────────────────────────
let mode.string(mode) = valof
$(
  if mode = MOTION.FULL     do resultis "full"
  if mode = MOTION.REDUCED  do resultis "reduced"
  if mode = MOTION.MANUAL   do resultis "manual-low"
  resultis "unknown"
$)

// ─── Can Deploy ───────────────────────────────────────────────────────────
// checks: vector of check result pairs (name, passed)
// n:      number of checks
let can.deploy(checks, n) = valof
$(
  let fails = 0

  for i = 0 to n - 1 do
    if checks!(i*2 + 1) = 0 do fails := fails + 1

  resultis fails = 0
$)

// ─── Print Gate Report ────────────────────────────────────────────────────
let print.gate.report(version, mode, checks, n) be
$(
  writef("SEIS Release Gate -- %s*N", version)
  writef("-----------------------------------*N")
  writef("Motion mode: %s*N", mode.string(mode))
  writef("Fast:        %d ms*N", motion.duration.ms("fast",     mode))
  writef("Standard:    %d ms*N", motion.duration.ms("standard", mode))
  writef("-----------------------------------*N")

  for i = 0 to n - 1 do
  $(
    let name   = checks!(i*2)
    let passed = checks!(i*2 + 1)
    let marker = passed -> "PASS", "FAIL"
    writef("  [%s]  %s*N", marker, name)
  $)

  writef("-----------------------------------*N")
  let ok = can.deploy(checks, n)
  writef("Can deploy: %s*N", ok -> "YES", "NO")
$)

// ─── Start Function ───────────────────────────────────────────────────────
let start() be
$(
  // Check data: alternating (name, passed) pairs
  // passed: 1 = true, 0 = false
  let checks = table
    "typecheck",          1,
    "lint",               1,
    "content validation", 1,
    "accessibility",      0

  let n    = 4
  let mode = MOTION.FULL

  print.gate.report("v2.4.0", mode, checks, n)
$)
