type releasePolicy = {
  reducedMotionRequired: bool,
  dependencyBudgetLocked: bool,
  liveUploadRequiresTarget: bool,
};

let defaultPolicy = {
  reducedMotionRequired: true,
  dependencyBudgetLocked: true,
  liveUploadRequiresTarget: true,
};
