type ReadinessPolicy* = object
  reducedMotionRequired*: bool
  dependencyBudgetLocked*: bool
  liveUploadRequiresTarget*: bool

let defaultPolicy* = ReadinessPolicy(
  reducedMotionRequired: true,
  dependencyBudgetLocked: true,
  liveUploadRequiresTarget: true
)
