package releasepolicy

policy: {
  serverTargetConfirmed: false
  reducedMotionSupported: true
  minimumEvidenceItems: 3
  readyForUpload: serverTargetConfirmed && reducedMotionSupported && minimumEvidenceItems >= 3
}
