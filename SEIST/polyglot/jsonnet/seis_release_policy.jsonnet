{
  policy: {
    targetConfirmed: false,
    accessibilityReviewed: false,
    rollbackPlanned: false,
    supportsReducedMotion: true,
    promotionRule: 'contracts before services',
  },
  readyForUpload::
    self.policy.targetConfirmed &&
    self.policy.accessibilityReviewed &&
    self.policy.rollbackPlanned &&
    self.policy.supportsReducedMotion,
}
