"SEIS Release Policy — Pharo Smalltalk"
"Motion policy and deploy gate using Pharo's class system"

"─── MotionPolicy Class ──────────────────────────────────────────────────"
Object subclass: #SeisMotionPolicy
  instanceVariableNames: 'mode durationInstant durationFast durationStandard durationSlow durationCinematic'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'SEIS-Release'.

SeisMotionPolicy class >> full [
  ^ self new initWithMode: 'full'
]

SeisMotionPolicy class >> reduced [
  ^ self new initWithMode: 'reduced'
]

SeisMotionPolicy class >> fromEnvironment [
  | envMode |
  envMode := Smalltalk os environment at: 'SEIS_MOTION_MODE' ifAbsent: ['full'].
  ^ self new initWithMode: envMode
]

SeisMotionPolicy >> initWithMode: aMode [
  mode := aMode.
  (aMode = 'reduced' or: [aMode = 'manual-low'])
    ifTrue: [
      durationInstant   := 0.
      durationFast      := 0.
      durationStandard  := 0.
      durationSlow      := 0.
      durationCinematic := 0 ]
    ifFalse: [
      durationInstant   := 0.
      durationFast      := 150.
      durationStandard  := 300.
      durationSlow      := 500.
      durationCinematic := 800 ].
]

SeisMotionPolicy >> durationMsFor: token [
  ^ (mode = 'reduced' or: [mode = 'manual-low'])
    ifTrue: [0]
    ifFalse: [
      token = 'instant'   ifTrue: [^ durationInstant].
      token = 'fast'      ifTrue: [^ durationFast].
      token = 'standard'  ifTrue: [^ durationStandard].
      token = 'slow'      ifTrue: [^ durationSlow].
      token = 'cinematic' ifTrue: [^ durationCinematic].
      durationStandard ]
]

SeisMotionPolicy >> mode [ ^ mode ]

"─── DeployCheck Class ───────────────────────────────────────────────────"
Object subclass: #SeisDeployCheck
  instanceVariableNames: 'name passed detail'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'SEIS-Release'.

SeisDeployCheck class >> name: aName passed: aBoolean [
  ^ self new
    name: aName;
    passed: aBoolean;
    yourself
]

SeisDeployCheck >> name: n [ name := n ]
SeisDeployCheck >> passed: p [ passed := p ]
SeisDeployCheck >> name   [ ^ name ]
SeisDeployCheck >> passed [ ^ passed ]
SeisDeployCheck >> marker [ ^ passed ifTrue: ['PASS'] ifFalse: ['FAIL'] ]

"─── ReleaseGate Class ───────────────────────────────────────────────────"
Object subclass: #SeisReleaseGate
  instanceVariableNames: 'version policy checks'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'SEIS-Release'.

SeisReleaseGate class >> version: v policy: p [
  ^ self new
    version: v;
    policy: p;
    checks: OrderedCollection new;
    yourself
]

SeisReleaseGate >> version: v [ version := v ]
SeisReleaseGate >> policy: p  [ policy := p ]
SeisReleaseGate >> checks: c  [ checks := c ]

SeisReleaseGate >> addCheckNamed: name passed: bool [
  checks add: (SeisDeployCheck name: name passed: bool)
]

SeisReleaseGate >> gateStatus [
  | failCount |
  failCount := checks count: [:c | c passed not].
  ^ failCount = 0 ifTrue: ['ready'] ifFalse: ['blocked']
]

SeisReleaseGate >> canDeploy [
  ^ self gateStatus = 'ready'
]

SeisReleaseGate >> printReport [
  | status |
  status := self gateStatus.
  Transcript
    show: 'SEIS Release Gate -- '; show: version; nl;
    show: '-----------------------------------'; nl;
    show: 'Status:      '; show: status; nl;
    show: 'Motion mode: '; show: policy mode; nl;
    show: 'Fast (ms):   '; show: (policy durationMsFor: 'fast') printString; nl;
    show: 'Standard (ms): '; show: (policy durationMsFor: 'standard') printString; nl;
    show: '-----------------------------------'; nl.
  checks do: [:c |
    Transcript
      show: '  ['; show: c marker; show: ']  '; show: c name; nl ].
  Transcript
    show: '-----------------------------------'; nl;
    show: (self canDeploy ifTrue: ['Deploy: AUTHORISED'] ifFalse: ['Deploy: BLOCKED']); nl.
]

"─── Main Execution ──────────────────────────────────────────────────────"
| gate |
gate := SeisReleaseGate
  version: 'v2.4.0'
  policy: SeisMotionPolicy full.

gate addCheckNamed: 'typecheck'          passed: true.
gate addCheckNamed: 'lint'               passed: true.
gate addCheckNamed: 'content validation' passed: true.
gate addCheckNamed: 'accessibility'      passed: false.

gate printReport.
