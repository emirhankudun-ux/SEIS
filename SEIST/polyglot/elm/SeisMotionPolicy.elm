module SeisMotionPolicy exposing (Policy, foundation)


type alias Policy =
    { supportsReducedMotion : Bool
    , mobileParticleLimit : Int
    , desktopParticleLimit : Int
    , continuousSceneLimit : Int
    }


foundation : Policy
foundation =
    { supportsReducedMotion = True
    , mobileParticleLimit = 24
    , desktopParticleLimit = 64
    , continuousSceneLimit = 1
    }
