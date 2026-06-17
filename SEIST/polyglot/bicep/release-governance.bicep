param serverTargetConfirmed bool = false
param reducedMotionSupported bool = true
param minimumEvidenceItems int = 3

output readyForUpload bool = serverTargetConfirmed && reducedMotionSupported && minimumEvidenceItems >= 3
