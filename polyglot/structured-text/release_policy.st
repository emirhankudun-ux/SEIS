// SEIS Release Policy — Structured Text (IEC 61131-3 PLC)

PROGRAM SeisReleasePolicy

TYPE
  MOTION_MODE : (CINEMATIC, BALANCED, REDUCED);
  RELEASE_STATUS : (STATUS_READY, STATUS_BLOCKED, STATUS_PENDING);
END_TYPE

VAR
  motionMode     : MOTION_MODE    := BALANCED;
  prefersReduced : BOOL           := FALSE;
  releaseStatus  : RELEASE_STATUS := STATUS_PENDING;

  resolvedMode     : MOTION_MODE;
  motionDurationMs : INT;
  canDeploy        : BOOL;
END_VAR

// Resolve motion mode respecting accessibility preference
IF prefersReduced THEN
  resolvedMode := REDUCED;
ELSE
  resolvedMode := motionMode;
END_IF;

// Derive motion duration in milliseconds
CASE resolvedMode OF
  CINEMATIC : motionDurationMs := 600;
  BALANCED  : motionDurationMs := 300;
  REDUCED   : motionDurationMs := 0;
  ELSE        motionDurationMs := 0;
END_CASE;

// Gate deployment on release status
canDeploy := (releaseStatus = STATUS_READY);

END_PROGRAM
