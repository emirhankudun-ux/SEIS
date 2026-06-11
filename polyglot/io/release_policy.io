# SEIS Release Policy — Io Language
# Motion policy and deploy gate using Io's prototype-based message passing

# ─── Motion Durations Prototype ──────────────────────────────────────────
MotionDurations := Object clone do(
  instant   := 0
  fast      := 150
  standard  := 300
  slow      := 500
  cinematic := 800

  forToken := method(token,
    if(token == "instant",   return instant)
    if(token == "fast",      return fast)
    if(token == "standard",  return standard)
    if(token == "slow",      return slow)
    if(token == "cinematic", return cinematic)
    standard   # default
  )
)

# ─── Motion Policy Prototype ─────────────────────────────────────────────
MotionPolicy := Object clone do(
  mode      := "full"
  durations := nil

  withMode := method(m,
    p := self clone
    p mode := m
    if((m == "reduced") or(m == "manual-low"),
      p durations := MotionDurations clone do(
        instant   := 0
        fast      := 0
        standard  := 0
        slow      := 0
        cinematic := 0
      ),
      p durations := MotionDurations clone
    )
    p
  )

  durationMsFor := method(token,
    durations forToken(token)
  )
)

# ─── Deploy Check Prototype ──────────────────────────────────────────────
DeployCheck := Object clone do(
  name   := ""
  passed := false

  withName := method(n, p := false,
    c := self clone
    c name := n
    c passed := p
    c
  )

  marker := method(
    if(passed, "PASS", "FAIL")
  )
)

# ─── Release Gate Prototype ──────────────────────────────────────────────
ReleaseGate := Object clone do(
  version := "unknown"
  policy  := nil
  checks  := List clone

  withVersion := method(v, pol,
    g := self clone
    g version := v
    g policy  := pol
    g checks  := List clone
    g
  )

  addCheck := method(name, passed,
    checks append(DeployCheck withName(name, passed))
  )

  gateStatus := method(
    failCount := checks select(c, c passed not) size
    if(failCount == 0, "ready", "blocked")
  )

  canDeploy := method(
    gateStatus == "ready"
  )

  printReport := method(
    status := gateStatus
    statusLabel := status asUppercase

    writeln("SEIS Release Gate — " .. version)
    writeln("-" repeated(40))
    writeln("Status:       " .. statusLabel)
    writeln("Motion mode:  " .. policy mode)
    writeln("Fast (ms):    " .. policy durationMsFor("fast"))
    writeln("Standard (ms):" .. policy durationMsFor("standard"))
    writeln("-" repeated(40))

    checks foreach(check,
      writeln("  [" .. check marker .. "]  " .. check name)
    )

    writeln("-" repeated(40))
    if(canDeploy,
      writeln("Deploy: AUTHORISED"),
      writeln("Deploy: BLOCKED")
    )
  )
)

# ─── Main Execution ───────────────────────────────────────────────────────
policy := MotionPolicy withMode("full")
gate   := ReleaseGate withVersion("v2.4.0", policy)

gate addCheck("typecheck",          true)
gate addCheck("lint",               true)
gate addCheck("content validation", true)
gate addCheck("accessibility",      false)

gate printReport
