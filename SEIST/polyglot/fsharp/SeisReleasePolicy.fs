module SeisReleasePolicy

type ReleasePolicy =
  { ReducedMotionRequired: bool
    DependencyBudgetLocked: bool
    LiveUploadRequiresTarget: bool }

let defaultPolicy =
  { ReducedMotionRequired = true
    DependencyBudgetLocked = true
    LiveUploadRequiresTarget = true }
