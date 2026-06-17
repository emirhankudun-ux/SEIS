module ReleasePolicy where

type ReleasePolicy =
  { serverTargetConfirmed :: Boolean
  , reducedMotionSupported :: Boolean
  , minimumEvidenceItems :: Int
  }

defaultPolicy :: ReleasePolicy
defaultPolicy =
  { serverTargetConfirmed: false
  , reducedMotionSupported: true
  , minimumEvidenceItems: 3
  }

readyForUpload :: ReleasePolicy -> Boolean -> Boolean -> Boolean
readyForUpload policy accessibilityReviewed rollbackPlanned =
  policy.serverTargetConfirmed && accessibilityReviewed && rollbackPlanned
