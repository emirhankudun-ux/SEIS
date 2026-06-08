// SEIS Release Policy — Metal (Apple GPU Shading Language)

#include <metal_stdlib>
using namespace metal;

enum class MotionMode : uint {
    Cinematic = 0,
    Balanced  = 1,
    Reduced   = 2,
};

enum class ReleaseStatus : uint {
    Ready   = 0,
    Blocked = 1,
    Pending = 2,
};

struct SeisUniforms {
    MotionMode    requestedMode;
    uint          prefersReduced;
    ReleaseStatus status;
    float         time;
};

kernel void evaluateReleaseGate(
    constant SeisUniforms& u        [[ buffer(0) ]],
    device   uint*         outMode  [[ buffer(1) ]],
    device   uint*         outDur   [[ buffer(2) ]],
    device   uint*         outDeploy[[ buffer(3) ]],
    uint gid [[ thread_position_in_grid ]]
) {
    MotionMode resolved = u.prefersReduced ? MotionMode::Reduced : u.requestedMode;

    uint durationMs = 0;
    if      (resolved == MotionMode::Cinematic) durationMs = 600;
    else if (resolved == MotionMode::Balanced)  durationMs = 300;

    outMode[gid]   = (uint)resolved;
    outDur[gid]    = durationMs;
    outDeploy[gid] = (u.status == ReleaseStatus::Ready) ? 1u : 0u;
}

// Fragment shader: release status badge color
fragment float4 releaseStatusColor(
    constant SeisUniforms& u [[ buffer(0) ]]
) {
    float4 color;
    switch (u.status) {
        case ReleaseStatus::Ready:   color = float4(0.13f, 0.77f, 0.37f, 1.f); break;
        case ReleaseStatus::Blocked: color = float4(0.94f, 0.27f, 0.27f, 1.f); break;
        case ReleaseStatus::Pending: color = float4(0.96f, 0.62f, 0.04f, 1.f); break;
    }
    return color;
}
