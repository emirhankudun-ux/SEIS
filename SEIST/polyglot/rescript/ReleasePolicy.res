type releasePolicy = {
  serverTargetConfirmed: bool,
  reducedMotionSupported: bool,
  minimumEvidenceItems: int,
}

let defaultPolicy = {
  serverTargetConfirmed: false,
  reducedMotionSupported: true,
  minimumEvidenceItems: 3,
}

let readyForUpload = (policy, accessibilityReviewed, rollbackPlanned) =>
  policy.serverTargetConfirmed && accessibilityReviewed && rollbackPlanned
