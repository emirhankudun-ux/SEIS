(* SEIS Release Policy — Wolfram Language *)
(* Motion policy and release gate using Associations and pattern matching *)

(* ─── Motion Duration Association ──────────────────────────────────────── *)
motionDurations = <|
  "instant"   -> 0,
  "fast"      -> 150,
  "standard"  -> 300,
  "slow"      -> 500,
  "cinematic" -> 800
|>;

(* ─── Motion Duration Resolver ───────────────────────────────────────────── *)
MotionDurationMs[token_String, reduced_:False] :=
  If[reduced,
    0,
    Lookup[motionDurations, token, motionDurations["standard"]]
  ];

(* ─── Motion Mode Resolver ───────────────────────────────────────────────── *)
ResolveMotionMode[] :=
  Module[{envMode},
    envMode = Environment["SEIS_MOTION_MODE"];
    Which[
      envMode =!= $Failed, envMode,
      True,                "full"
    ]
  ];

(* ─── Release Gate Check Type ───────────────────────────────────────────── *)
releaseCheck[name_String, passed_] := <|"name" -> name, "passed" -> passed|>;

(* ─── Gate Status Resolver ──────────────────────────────────────────────── *)
GateStatus[checks:{___Association}] :=
  If[AllTrue[checks, #["passed"] &], "ready", "blocked"];

(* ─── Release Gate Configuration ───────────────────────────────────────── *)
ReleaseGateConfig[version_String, motionMode_String:"full"] :=
  Module[{reduced, status, sampleChecks},
    reduced = (motionMode === "reduced");
    sampleChecks = {
      releaseCheck["typecheck",          True],
      releaseCheck["lint",               True],
      releaseCheck["content validation", True],
      releaseCheck["accessibility",      False]
    };
    status = GateStatus[sampleChecks];
    <|
      "version"       -> version,
      "status"        -> status,
      "motionMode"    -> motionMode,
      "durationFast"  -> MotionDurationMs["fast",     reduced],
      "durationStd"   -> MotionDurationMs["standard", reduced],
      "durationSlow"  -> MotionDurationMs["slow",     reduced],
      "checks"        -> sampleChecks,
      "timestamp"     -> DateString["ISODateTime"]
    |>
  ];

(* ─── Print Gate Report ─────────────────────────────────────────────────── *)
PrintGateReport[gate_Association] :=
  Module[{checks, passSymbol},
    checks = gate["checks"];
    Print["SEIS Release Gate — ", gate["version"]];
    Print[StringRepeat["-", 40]];
    Print["Status:      ", ToUpperCase[gate["status"]]];
    Print["Motion mode: ", gate["motionMode"]];
    Print["Fast:        ", gate["durationFast"], "ms"];
    Print["Standard:    ", gate["durationStd"],  "ms"];
    Print[StringRepeat["-", 40]];
    Scan[
      Function[c,
        passSymbol = If[c["passed"], "PASS", "FAIL"];
        Print["  [", passSymbol, "]  ", c["name"]]
      ],
      checks
    ];
    Print[StringRepeat["-", 40]];
  ];

(* ─── Execute ───────────────────────────────────────────────────────────── *)
gate = ReleaseGateConfig["v2.4.0", ResolveMotionMode[]];
PrintGateReport[gate];
