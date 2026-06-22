param targetConfirmed bool = false
param accessibilityReviewed bool = false
param rollbackPlanned bool = false
param supportsReducedMotion bool = true

output readyForUpload bool = targetConfirmed && accessibilityReviewed && rollbackPlanned && supportsReducedMotion
