module CalmReleasePolicy where

data ReleasePolicy = ReleasePolicy
  { reducedMotionRequired :: Bool
  , dependencyBudgetLocked :: Bool
  , liveUploadRequiresTarget :: Bool
  } deriving (Eq, Show)

policy :: ReleasePolicy
policy = ReleasePolicy
  { reducedMotionRequired = True
  , dependencyBudgetLocked = True
  , liveUploadRequiresTarget = True
  }
