// SEIS Release Policy — CUDA (NVIDIA GPU Parallel Computing)
// nvcc release_policy.cu -o release_policy

#include <cuda_runtime.h>
#include <stdio.h>

typedef enum { CINEMATIC = 0, BALANCED = 1, REDUCED = 2 } MotionMode;
typedef enum { READY = 0, BLOCKED = 1, PENDING = 2 } ReleaseStatus;

__device__ MotionMode resolveMotion(MotionMode requested, bool prefersReduced) {
    return prefersReduced ? REDUCED : requested;
}

__device__ bool canDeploy(ReleaseStatus status) {
    return status == READY;
}

__device__ int motionDurationMs(MotionMode mode) {
    switch (mode) {
        case CINEMATIC: return 600;
        case BALANCED:  return 300;
        case REDUCED:   return 0;
        default:        return 0;
    }
}

__global__ void evaluateReleaseBatch(
    MotionMode* requestedModes,
    bool*       prefersReducedFlags,
    ReleaseStatus* statuses,
    int*        durations,
    bool*       deployable,
    int         n
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    MotionMode resolved = resolveMotion(requestedModes[idx], prefersReducedFlags[idx]);
    durations[idx]  = motionDurationMs(resolved);
    deployable[idx] = canDeploy(statuses[idx]);
}

int main() {
    const int N = 4;
    MotionMode   h_modes[N]   = {CINEMATIC, BALANCED, CINEMATIC, REDUCED};
    bool         h_reduced[N] = {true, false, false, true};
    ReleaseStatus h_status[N] = {READY, BLOCKED, READY, PENDING};
    int  h_dur[N]; bool h_dep[N];

    MotionMode   *d_modes;   bool *d_reduced; ReleaseStatus *d_status;
    int *d_dur;              bool *d_dep;

    cudaMalloc(&d_modes,   N * sizeof(MotionMode));
    cudaMalloc(&d_reduced, N * sizeof(bool));
    cudaMalloc(&d_status,  N * sizeof(ReleaseStatus));
    cudaMalloc(&d_dur,     N * sizeof(int));
    cudaMalloc(&d_dep,     N * sizeof(bool));

    cudaMemcpy(d_modes,   h_modes,   N * sizeof(MotionMode),    cudaMemcpyHostToDevice);
    cudaMemcpy(d_reduced, h_reduced, N * sizeof(bool),           cudaMemcpyHostToDevice);
    cudaMemcpy(d_status,  h_status,  N * sizeof(ReleaseStatus),  cudaMemcpyHostToDevice);

    evaluateReleaseBatch<<<1, N>>>(d_modes, d_reduced, d_status, d_dur, d_dep, N);

    cudaMemcpy(h_dur, d_dur, N * sizeof(int),  cudaMemcpyDeviceToHost);
    cudaMemcpy(h_dep, d_dep, N * sizeof(bool), cudaMemcpyDeviceToHost);

    for (int i = 0; i < N; i++)
        printf("Thread %d: duration=%dms deployable=%s\n", i, h_dur[i], h_dep[i] ? "yes" : "no");

    cudaFree(d_modes); cudaFree(d_reduced); cudaFree(d_status);
    cudaFree(d_dur);   cudaFree(d_dep);
    return 0;
}
