' SEIS Release Policy — VBScript

Const MOTION_CINEMATIC = "cinematic"
Const MOTION_BALANCED  = "balanced"
Const MOTION_REDUCED   = "reduced"

Const STATUS_READY   = "ready"
Const STATUS_BLOCKED = "blocked"
Const STATUS_PENDING = "pending"

Function ResolveMotionMode(requested, prefersReduced)
    If prefersReduced Then
        ResolveMotionMode = MOTION_REDUCED
    Else
        ResolveMotionMode = requested
    End If
End Function

Function MotionDurationMs(mode)
    Select Case mode
        Case MOTION_CINEMATIC : MotionDurationMs = 600
        Case MOTION_BALANCED  : MotionDurationMs = 300
        Case MOTION_REDUCED   : MotionDurationMs = 0
        Case Else             : MotionDurationMs = 0
    End Select
End Function

Function CanDeploy(status)
    CanDeploy = (status = STATUS_READY)
End Function

' Main
Dim resolved, duration, deploy
resolved = ResolveMotionMode(MOTION_CINEMATIC, True)
duration = MotionDurationMs(resolved)
deploy   = CanDeploy(STATUS_READY)

WScript.Echo "Resolved mode: " & resolved
WScript.Echo "Duration ms:   " & duration
WScript.Echo "Can deploy:    " & CStr(deploy)
