/* SEIS Release Policy — OpenCL (Open Computing Language) */

typedef enum { CINEMATIC = 0, BALANCED = 1, REDUCED = 2 } MotionMode;
typedef enum { READY = 0, BLOCKED = 1, PENDING = 2 }      ReleaseStatus;

int motionDurationMs(MotionMode mode) {
    switch (mode) {
        case CINEMATIC: return 600;
        case BALANCED:  return 300;
        case REDUCED:   return 0;
        default:        return 0;
    }
}

__kernel void evaluateReleaseBatch(
    __global const int* requestedModes,
    __global const int* prefersReducedFlags,
    __global const int* statuses,
    __global       int* resolvedDurations,
    __global       int* deployable
) {
    int gid = get_global_id(0);

    MotionMode requested = (MotionMode)requestedModes[gid];
    bool reduced         = prefersReducedFlags[gid] != 0;
    MotionMode resolved  = reduced ? REDUCED : requested;

    resolvedDurations[gid] = motionDurationMs(resolved);
    deployable[gid]        = (statuses[gid] == (int)READY) ? 1 : 0;
}
