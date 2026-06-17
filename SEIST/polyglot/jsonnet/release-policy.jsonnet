{
  policy: {
    serverTargetConfirmed: false,
    reducedMotionSupported: true,
    minimumEvidenceItems: 3,
  },
  readyForUpload(accessibilityReviewed, rollbackPlanned)::
    self.policy.serverTargetConfirmed && accessibilityReviewed && rollbackPlanned,
}
