(:
  SEIS Release Policy — XQuery 3.1
  Motion policy and release gate FLWOR expressions
  Compatible with BaseX, eXist-db, Saxon
:)

declare namespace seis = "https://seis.emirhankudun.com/schema/release";

(: ─── Motion Duration Variables ─────────────────────────────────────── :)
declare variable $MOTION_DURATIONS_FULL as map(xs:string, xs:integer) :=
  map {
    "instant"  : 0,
    "fast"     : 150,
    "standard" : 300,
    "slow"     : 500,
    "cinematic": 800
  };

declare variable $MOTION_MODE as xs:string :=
  (environment-variable("SEIS_MOTION_MODE"), "full")[1];

(: ─── Motion Duration Function ──────────────────────────────────────── :)
declare function seis:motion-duration-ms(
  $token as xs:string,
  $mode  as xs:string
) as xs:integer {
  if ($mode = ("reduced", "manual-low"))
  then 0
  else
    let $base := map:get($MOTION_DURATIONS_FULL, $token)
    return if (exists($base)) then $base else 300
};

(: ─── Mode To String ────────────────────────────────────────────────── :)
declare function seis:status-label($status as xs:string) as xs:string {
  upper-case($status)
};

(: ─── Gate Status Resolver ──────────────────────────────────────────── :)
declare function seis:gate-status(
  $checks as element(check)*
) as xs:string {
  let $fail-count := count($checks[passed = "false" or passed = false()])
  return if ($fail-count = 0) then "ready" else "blocked"
};

(: ─── Build Release Report ──────────────────────────────────────────── :)
declare function seis:release-report(
  $gate as element(releaseGate)
) as element(report) {
  let $status  := seis:gate-status($gate/checks/check)
  let $mode    := ($gate/motionMode/text(), $MOTION_MODE)[1]
  let $std-ms  := seis:motion-duration-ms("standard", $mode)
  let $fast-ms := seis:motion-duration-ms("fast",     $mode)
  return
    <report>
      <version>{$gate/version/text()}</version>
      <status>{$status}</status>
      <statusLabel>{seis:status-label($status)}</statusLabel>
      <motionMode>{$mode}</motionMode>
      <motionStandardMs>{$std-ms}</motionStandardMs>
      <motionFastMs>{$fast-ms}</motionFastMs>
      <canDeploy>{$status = "ready"}</canDeploy>
      <checks>
        {
          for $check in $gate/checks/check
          let $passed := $check/passed = "true" or $check/passed = true()
          return
            <check>
              <name>{$check/name/text()}</name>
              <passed>{$passed}</passed>
              <marker>{if ($passed) then "PASS" else "FAIL"}</marker>
            </check>
        }
      </checks>
    </report>
};

(: ─── Inline Sample Execution ────────────────────────────────────────── :)
let $sample-gate :=
  <releaseGate>
    <version>v2.4.0</version>
    <motionMode>{$MOTION_MODE}</motionMode>
    <checks>
      <check><name>typecheck</name><passed>true</passed></check>
      <check><name>lint</name><passed>true</passed></check>
      <check><name>content validation</name><passed>true</passed></check>
      <check><name>accessibility</name><passed>false</passed></check>
    </checks>
  </releaseGate>

let $report := seis:release-report($sample-gate)

return (
  "SEIS Release Gate — " || $report/version/text(),
  "Status:      " || $report/statusLabel/text(),
  "Motion mode: " || $report/motionMode/text(),
  "Standard:    " || $report/motionStandardMs/text() || "ms",
  "Can deploy:  " || $report/canDeploy/text(),
  for $c in $report/checks/check
  return "  [" || upper-case($c/marker/text()) || "]  " || $c/name/text()
)
