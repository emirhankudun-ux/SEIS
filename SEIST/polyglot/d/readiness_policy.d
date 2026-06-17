module readiness_policy;

struct ReadinessPolicy {
  bool reducedMotionRequired = true;
  bool dependencyBudgetLocked = true;
  bool liveUploadRequiresTarget = true;
}

enum defaultPolicy = ReadinessPolicy();
