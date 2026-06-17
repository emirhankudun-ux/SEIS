#ifndef SEIS_READINESS_CONTRACT_H
#define SEIS_READINESS_CONTRACT_H

typedef struct SeisReadinessContract {
  int reduced_motion_required;
  int dependency_budget_locked;
  int release_requires_manifest;
} SeisReadinessContract;

static const SeisReadinessContract SEIS_READINESS_CONTRACT = {
  1,
  1,
  1
};

#endif
