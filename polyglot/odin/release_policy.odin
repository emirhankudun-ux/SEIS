package seis_release_policy

Motion_Mode :: enum {
    Cinematic,
    Balanced,
    Reduced,
}

Release_Status :: enum {
    Ready,
    Blocked,
    Pending,
}

MOTION_DURATION_MS := [Motion_Mode]int{
    .Cinematic = 600,
    .Balanced  = 300,
    .Reduced   = 0,
}

resolve_motion :: proc(requested: Motion_Mode, prefers_reduced: bool) -> Motion_Mode {
    if prefers_reduced do return .Reduced
    return requested
}

can_deploy :: proc(status: Release_Status) -> bool {
    return status == .Ready
}
