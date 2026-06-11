⍝ SEIS Release Policy — APL
⍝ Motion policy and deploy gate using APL array primitives and dfns

⍝ ─── Motion Duration Table ──────────────────────────────────────────────
⍝ Tokens: instant fast standard slow cinematic
⍝ Values: 0       150  300      500  800
MOTION_TOKENS    ← 'instant' 'fast' 'standard' 'slow' 'cinematic'
MOTION_DURATIONS ← 0 150 300 500 800

⍝ ─── Motion Duration Ms (dfn) ────────────────────────────────────────────
⍝ ⍺ = token (string), ⍵ = mode (string)
⍝ Returns duration in ms; collapses to 0 for reduced/manual-low modes
MotionDurationMs ← {
    token ← ⍺
    mode  ← ⍵

    ⍝ Find index of token in token table
    idx ← MOTION_TOKENS⍳⊂token

    ⍝ Base duration: default to standard (index 3) if not found
    base ← (idx ≤ ≢MOTION_TOKENS) ⊃ MOTION_DURATIONS[idx] MOTION_DURATIONS[3]

    ⍝ Collapse to 0 if reduced or manual-low
    (mode ∊ 'reduced' 'manual-low') × 0 + (1 - mode ∊ 'reduced' 'manual-low') × base
}

⍝ ─── Gate Status (dfn) ───────────────────────────────────────────────────
⍝ ⍵ = boolean vector of check results (1=pass, 0=fail)
⍝ Returns 'ready' or 'blocked'
GateStatus ← {
    0 = +/ ~⍵ : 'ready'
    'blocked'
}

⍝ ─── Can Deploy (dfn) ────────────────────────────────────────────────────
CanDeploy ← {'ready' ≡ GateStatus ⍵}

⍝ ─── Mode String ─────────────────────────────────────────────────────────
ModeString ← {
    ⍵ ∊ ⊂'reduced'   : 'reduced'
    ⍵ ∊ ⊂'manual-low': 'manual-low'
    'full'
}

⍝ ─── Print Gate Report ────────────────────────────────────────────────────
PrintGateReport ← {
    version ← ⍺
    mode    ← ⊃⍵
    results ← 1↓⍵   ⍝ boolean vector of check results
    names   ← ⍺⍺    ⍝ check name array (operand)

    status ← GateStatus results

    ⎕ ← 'SEIS Release Gate — ', version
    ⎕ ← 40⍴'-'
    ⎕ ← 'Status:      ', ⎕UCS (⎕UCS status) - 32×(⎕UCS status) ∊ 97+⍳26
    ⎕ ← 'Motion mode: ', ModeString mode
    ⎕ ← 'Fast (ms):   ', ⍕'fast' MotionDurationMs mode
    ⎕ ← 'Standard(ms):', ⍕'standard' MotionDurationMs mode
    ⎕ ← 40⍴'-'

    ⍝ Print each check result
    {
        marker ← ⍵ ⊃ 'FAIL' 'PASS'
        name   ← names[⍺]
        ⎕ ← '  [', marker, ']  ', name
    } ¨⍨ ⍳≢results

    ⎕ ← 40⍴'-'
    ⎕ ← (CanDeploy results) ⊃ 'Deploy: BLOCKED' 'Deploy: AUTHORISED'
}

⍝ ─── Sample Execution ────────────────────────────────────────────────────
CHECK_NAMES   ← 'typecheck' 'lint' 'content validation' 'accessibility'
CHECK_RESULTS ← 1 1 1 0   ⍝ 1=pass, 0=fail
MODE          ← 'full'

⍝ Demonstrate duration resolution
'standard' MotionDurationMs 'full'     ⍝ → 300
'standard' MotionDurationMs 'reduced'  ⍝ → 0
'cinematic' MotionDurationMs 'full'    ⍝ → 800

⍝ Gate evaluation
GateStatus CHECK_RESULTS               ⍝ → 'blocked'
CanDeploy  CHECK_RESULTS               ⍝ → 0
