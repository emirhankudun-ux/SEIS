{ serverTargetConfirmed = False
, reducedMotionSupported = True
, minimumEvidenceItems = 3
, readyForUpload =
    \(accessibilityReviewed : Bool) ->
    \(rollbackPlanned : Bool) ->
      False && accessibilityReviewed && rollbackPlanned
}
