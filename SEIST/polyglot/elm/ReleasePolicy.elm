module ReleasePolicy exposing (ReleasePolicy, defaultPolicy, readyForUpload)


type alias ReleasePolicy =
    { serverTargetConfirmed : Bool
    , reducedMotionSupported : Bool
    , minimumEvidenceItems : Int
    }


defaultPolicy : ReleasePolicy
defaultPolicy =
    { serverTargetConfirmed = False
    , reducedMotionSupported = True
    , minimumEvidenceItems = 3
    }


readyForUpload : ReleasePolicy -> Bool -> Bool -> Bool
readyForUpload policy accessibilityReviewed rollbackPlanned =
    policy.serverTargetConfirmed && accessibilityReviewed && rollbackPlanned
