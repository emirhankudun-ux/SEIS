{
  targetConfirmed ? false,
  accessibilityReviewed ? false,
  rollbackPlanned ? false,
  supportsReducedMotion ? true
}:

{
  readyForUpload = targetConfirmed && accessibilityReviewed && rollbackPlanned && supportsReducedMotion;
  promotionRule = "contracts before services";
}
