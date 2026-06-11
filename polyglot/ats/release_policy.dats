(*
** SEIS Release Policy — ATS2
** Motion policy and deploy gate using ATS2 linear types and proofs
*)

#include "share/atspre_staload.hats"

(* ─── Static (Compile-Time) Motion Mode ──────────────────────────────── *)
datasort motion_sort =
  | full_s
  | reduced_s
  | manual_low_s

(* ─── Dynamic Motion Mode ────────────────────────────────────────────── *)
datatype MotionMode =
  | Full
  | Reduced
  | ManualLow

(* ─── Release Status ─────────────────────────────────────────────────── *)
datatype ReleaseStatus =
  | Ready
  | Pending
  | Blocked
  | Draft

(* ─── Deploy Check ───────────────────────────────────────────────────── *)
typedef DeployCheck = @{
  name   = string
, passed = bool
}

(* ─── Motion Duration Ms ─────────────────────────────────────────────── *)
implement{}
motion_duration_ms
  (token, mode) = let
  val base: int =
    if token = "instant"   then 0
    else if token = "fast"      then 150
    else if token = "standard"  then 300
    else if token = "slow"      then 500
    else if token = "cinematic" then 800
    else 300
in
  case+ mode of
  | Full      () => base
  | Reduced   () => 0
  | ManualLow () => 0
end // end of [motion_duration_ms]

extern
fun motion_duration_ms (token: string, mode: MotionMode): int

(* ─── Mode To String ─────────────────────────────────────────────────── *)
fun mode_to_string (mode: MotionMode): string =
  case+ mode of
  | Full      () => "full"
  | Reduced   () => "reduced"
  | ManualLow () => "manual-low"

(* ─── Status To String ───────────────────────────────────────────────── *)
fun status_to_string (status: ReleaseStatus): string =
  case+ status of
  | Ready   () => "READY"
  | Pending () => "PENDING"
  | Blocked () => "BLOCKED"
  | Draft   () => "DRAFT"

(* ─── All Checks Pass ────────────────────────────────────────────────── *)
fun all_passed (checks: list0 DeployCheck): bool =
  list0_forall<DeployCheck> (checks, lam c => c.passed)

(* ─── Gate Status ────────────────────────────────────────────────────── *)
fun gate_status (checks: list0 DeployCheck): ReleaseStatus =
  if all_passed checks then Ready () else Blocked ()

(* ─── Can Deploy ─────────────────────────────────────────────────────── *)
fun can_deploy (checks: list0 DeployCheck): bool =
  case+ gate_status checks of
  | Ready () => true
  | _        => false

(* ─── Main ───────────────────────────────────────────────────────────── *)
implement main0 () =
  val mode = Full ()
  val checks = list0_cons<DeployCheck>(
    @{ name = "typecheck",          passed = true  },
    list0_cons<DeployCheck>(
      @{ name = "lint",             passed = true  },
      list0_cons<DeployCheck>(
        @{ name = "content",        passed = true  },
        list0_cons<DeployCheck>(
          @{ name = "accessibility",passed = false },
          list0_nil<DeployCheck>()
        )
      )
    )
  )
  val status = gate_status checks
  val () = println! ("SEIS Release Gate — v2.4.0")
  val () = println! ("Status: ", status_to_string status)
  val () = println! ("Mode:   ", mode_to_string mode)
  val () = println! ("Fast:   ", motion_duration_ms ("fast", mode), "ms")
  val () = println! ("Deploy: ", if can_deploy checks then "yes" else "no")
