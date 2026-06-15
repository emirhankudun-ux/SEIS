-- SEIS Release Policy — Idris 2

module ReleasePolicy

data MotionMode = Cinematic | Balanced | Reduced

data ReleaseStatus = Ready | Blocked | Pending

resolveMotion : MotionMode -> Bool -> MotionMode
resolveMotion _         True  = Reduced
resolveMotion requested False = requested

canDeploy : ReleaseStatus -> Bool
canDeploy Ready = True
canDeploy _     = False

motionDurationMs : MotionMode -> Nat
motionDurationMs Cinematic = 600
motionDurationMs Balanced  = 300
motionDurationMs Reduced   = 0

main : IO ()
main = do
  let mode = resolveMotion Cinematic True
  let dur  = motionDurationMs mode
  putStrLn ("Duration: " ++ show dur ++ "ms")
