// SEIS Release Policy — Koka Language
// Motion policy and deploy gate using Koka's effect system

module release_policy

// ─── Motion Mode Type ─────────────────────────────────────────────────────
type motion-mode
  Full
  Reduced
  ManualLow

// ─── Release Status Type ──────────────────────────────────────────────────
type release-status
  Ready
  Pending
  Blocked
  Draft

// ─── Deploy Check Type ────────────────────────────────────────────────────
struct deploy-check
  name   : string
  passed : bool

// ─── Motion Duration Ms ───────────────────────────────────────────────────
fun motion-duration-ms( token : string, mode : motion-mode ) : int
  val base = match token
    "instant"   -> 0
    "fast"      -> 150
    "standard"  -> 300
    "slow"      -> 500
    "cinematic" -> 800
    _           -> 300

  match mode
    Full      -> base
    Reduced   -> 0
    ManualLow -> 0

// ─── Mode To String ───────────────────────────────────────────────────────
fun mode-to-string( mode : motion-mode ) : string
  match mode
    Full      -> "full"
    Reduced   -> "reduced"
    ManualLow -> "manual-low"

// ─── Status To String ─────────────────────────────────────────────────────
fun status-to-string( status : release-status ) : string
  match status
    Ready   -> "READY"
    Pending -> "PENDING"
    Blocked -> "BLOCKED"
    Draft   -> "DRAFT"

// ─── Gate Status Resolver ─────────────────────────────────────────────────
fun gate-status( checks : list<deploy-check> ) : release-status
  val fail-count = checks.filter( fn(c) { !c.passed } ).length
  if fail-count == 0 then Ready else Blocked

// ─── Print Gate Report ────────────────────────────────────────────────────
fun print-gate-report(
  version : string,
  mode    : motion-mode,
  checks  : list<deploy-check>
) : console ()
  val status = gate-status( checks )
  println( "SEIS Release Gate — " ++ version )
  println( "-".repeat(40) )
  println( "Status:      " ++ status-to-string(status) )
  println( "Motion mode: " ++ mode-to-string(mode) )
  println( "Fast:        " ++ show(motion-duration-ms("fast", mode)) ++ "ms" )
  println( "Standard:    " ++ show(motion-duration-ms("standard", mode)) ++ "ms" )
  println( "-".repeat(40) )
  checks.foreach fn(check)
    val marker = if check.passed then "PASS" else "FAIL"
    println( "  [" ++ marker ++ "]  " ++ check.name )
  println( "-".repeat(40) )

// ─── Main ─────────────────────────────────────────────────────────────────
fun main() : console ()
  val mode = Full
  val checks = [
    Deploy-check( "typecheck",          True  ),
    Deploy-check( "lint",               True  ),
    Deploy-check( "content validation", True  ),
    Deploy-check( "accessibility",      False )
  ]
  print-gate-report( "v2.4.0", mode, checks )
