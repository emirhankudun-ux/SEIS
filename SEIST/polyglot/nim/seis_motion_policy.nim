type
  SeisMotionPolicy* = object
    supportsReducedMotion*: bool
    mobileParticleLimit*: int
    desktopParticleLimit*: int
    continuousSceneLimit*: int

const foundationMotionPolicy* = SeisMotionPolicy(
  supportsReducedMotion: true,
  mobileParticleLimit: 24,
  desktopParticleLimit: 64,
  continuousSceneLimit: 1
)
