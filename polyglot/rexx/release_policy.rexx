/* SEIS Release Policy — REXX                                         */
/* Motion mode resolution and deploy gate validation                   */
/* Classic REXX syntax — compatible with Regina, Open Object Rexx      */

/* ─── Motion Duration Constants ─────────────────────────────────── */
MOTION.INSTANT   = 0
MOTION.FAST      = 150
MOTION.STANDARD  = 300
MOTION.SLOW      = 500
MOTION.CINEMATIC = 800

/* ─── Resolve Motion Mode ────────────────────────────────────────── */
motion_mode = RESOLVE_MOTION_MODE()
SAY 'SEIS Release Policy — Motion Mode:' motion_mode

/* Apply reduced durations when in reduced mode */
IF motion_mode = 'reduced' THEN DO
  MOTION.FAST      = 0
  MOTION.STANDARD  = 0
  MOTION.SLOW      = 0
  MOTION.CINEMATIC = 0
  SAY 'Reduced-motion mode active — all durations set to 0ms'
END

SAY 'Standard duration:' MOTION.STANDARD || 'ms'
SAY 'Fast duration:    ' MOTION.FAST || 'ms'
SAY ''

/* ─── Deploy Gate ────────────────────────────────────────────────── */
version = 'v2.4.0'
status  = CAN_DEPLOY(version)
SAY 'Release status for' version':' status
EXIT

/* ════════════════════════════════════════════════════════════════== */
/* RESOLVE_MOTION_MODE — returns 'full' or 'reduced'                 */
RESOLVE_MOTION_MODE: PROCEDURE
  env_mode = VALUE('SEIS_MOTION_MODE',,'ENVIRONMENT')
  IF env_mode \= '' THEN
    RETURN TRANSLATE(env_mode)   /* uppercase */

  /* Default to full motion */
  RETURN 'full'

/* ════════════════════════════════════════════════════════════════== */
/* MOTION_DURATION_MS — returns duration for token in current mode   */
MOTION_DURATION_MS: PROCEDURE EXPOSE MOTION.
  PARSE ARG token .
  token = TRANSLATE(token)   /* uppercase */
  SELECT
    WHEN token = 'INSTANT'   THEN RETURN MOTION.INSTANT
    WHEN token = 'FAST'      THEN RETURN MOTION.FAST
    WHEN token = 'STANDARD'  THEN RETURN MOTION.STANDARD
    WHEN token = 'SLOW'      THEN RETURN MOTION.SLOW
    WHEN token = 'CINEMATIC' THEN RETURN MOTION.CINEMATIC
    OTHERWISE                     RETURN MOTION.STANDARD
  END

/* ════════════════════════════════════════════════════════════════== */
/* CAN_DEPLOY — validates readiness; returns status string           */
CAN_DEPLOY: PROCEDURE
  PARSE ARG version .
  fail_count = 0
  SAY ''
  SAY 'SEIS Release Gate —' version
  SAY COPIES('─', 40)

  /* Simulate check results (in real use: invoke npm check commands) */
  checks.0 = 3
  checks.1 = 'typecheck OK'
  checks.2 = 'lint       OK'
  checks.3 = 'content    FAIL'

  DO i = 1 TO checks.0
    PARSE VAR checks.i check_name check_result
    IF check_result = 'FAIL' THEN DO
      SAY '  [FAIL]' check_name
      fail_count = fail_count + 1
    END
    ELSE
      SAY '  [PASS]' check_name
  END

  SAY COPIES('─', 40)

  IF fail_count = 0 THEN DO
    SAY 'Status: READY — all checks passed.'
    RETURN 'ready'
  END
  ELSE DO
    SAY 'Status: BLOCKED —' fail_count 'check(s) failed.'
    RETURN 'blocked'
  END
