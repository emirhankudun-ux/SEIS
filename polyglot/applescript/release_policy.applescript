-- SEIS Release Policy — AppleScript

property MOTION_CINEMATIC : "cinematic"
property MOTION_BALANCED : "balanced"
property MOTION_REDUCED : "reduced"

on resolveMotionMode(requestedMode, prefersReduced)
    if prefersReduced then
        return MOTION_REDUCED
    else
        return requestedMode
    end if
end resolveMotionMode

on motionDurationMs(motionMode)
    if motionMode is MOTION_CINEMATIC then
        return 600
    else if motionMode is MOTION_BALANCED then
        return 300
    else
        return 0
    end if
end motionDurationMs

on canDeploy(releaseStatus)
    return releaseStatus is "ready"
end canDeploy

-- Main
set resolved to resolveMotionMode(MOTION_CINEMATIC, true)
set dur to motionDurationMs(resolved)
log "Resolved motion mode: " & resolved & " (" & dur & "ms)"
log "Can deploy: " & canDeploy("ready")
