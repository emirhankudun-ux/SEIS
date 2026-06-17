package seisrelease

policy: {
  targetConfirmed: bool | *false
  accessibilityReviewed: bool | *false
  rollbackPlanned: bool | *false
  supportsReducedMotion: true
  promotionRule: "contracts before services"
}
