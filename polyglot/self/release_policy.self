"SEIS Release Policy — Self Language"
"Motion policy and deploy gate using Self's prototype-based object model"

"─── Motion Mode Prototypes ──────────────────────────────────────────────"
motionModes = (|
  full      = 'full'.
  reduced   = 'reduced'.
  manualLow = 'manual-low'.
|).

"─── Motion Durations Object ─────────────────────────────────────────────"
motionDurations = (|
  parent* = lobby.

  instant   = 0.
  fast      = 150.
  standard  = 300.
  slow      = 500.
  cinematic = 800.

  forToken: token InMode: mode = (|
    base |
    base: (token = 'instant')   ifTrue: [^ 0]
              ifFalse: [
    (token = 'fast')      ifTrue: [^ fast]
              ifFalse: [
    (token = 'standard')  ifTrue: [^ standard]
              ifFalse: [
    (token = 'slow')      ifTrue: [^ slow]
              ifFalse: [
    (token = 'cinematic') ifTrue: [^ cinematic]
              ifFalse: [^ standard]]]]].
    (mode = 'reduced') | (mode = 'manual-low')
      ifTrue:  [^ 0]
      ifFalse: [^ base]
  ).
|).

"─── Deploy Check Prototype ──────────────────────────────────────────────"
deployCheckProto = (|
  parent* = lobby.

  name   <- ''.
  passed <- false.

  marker = (
    passed ifTrue: ['PASS'] ifFalse: ['FAIL']
  ).

  printOn: stream = (
    stream << '  [' << marker << ']  ' << name << '\n'.
  ).
|).

makeCheck: n Passed: p = (|
  c |
  c: deployCheckProto clone.
  c name: n.
  c passed: p.
  ^ c
).

"─── Release Gate Prototype ──────────────────────────────────────────────"
releaseGateProto = (|
  parent*  = lobby.

  version    <- 'unknown'.
  motionMode <- 'full'.
  checks     <- ().

  gateStatus = (|
    failCount |
    failCount: 0.
    checks do: [|:c| c passed ifFalse: [failCount: failCount + 1]].
    failCount = 0
      ifTrue:  ['ready']
      ifFalse: ['blocked']
  ).

  canDeploy = (gateStatus = 'ready').

  printReport = (
    | status |
    status: gateStatus.
    'SEIS Release Gate -- ' print. version printNl.
    '-----------------------------------' printNl.
    'Status:      ' print. status printNl.
    'Motion mode: ' print. motionMode printNl.
    'Fast (ms):   ' print.
      (motionDurations forToken: 'fast' InMode: motionMode) printNl.
    'Standard (ms): ' print.
      (motionDurations forToken: 'standard' InMode: motionMode) printNl.
    '-----------------------------------' printNl.
    checks do: [|:c| c printOn: stdout].
    '-----------------------------------' printNl.
    canDeploy
      ifTrue:  ['Deploy: AUTHORISED' printNl]
      ifFalse: ['Deploy: BLOCKED' printNl].
  ).
|).

"─── Main Execution ──────────────────────────────────────────────────────"
gate: releaseGateProto clone.
gate version: 'v2.4.0'.
gate motionMode: 'full'.
gate checks: (
  (makeCheck: 'typecheck'          Passed: true),
  (makeCheck: 'lint'               Passed: true),
  (makeCheck: 'content validation' Passed: true),
  (makeCheck: 'accessibility'      Passed: false)
).

gate printReport.
