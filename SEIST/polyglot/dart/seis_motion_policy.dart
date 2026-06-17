class SeisMotionPolicy {
  const SeisMotionPolicy({
    required this.supportsReducedMotion,
    required this.mobileParticleLimit,
    required this.desktopParticleLimit,
    required this.continuousSceneLimit,
  });

  final bool supportsReducedMotion;
  final int mobileParticleLimit;
  final int desktopParticleLimit;
  final int continuousSceneLimit;

  static const foundation = SeisMotionPolicy(
    supportsReducedMotion: true,
    mobileParticleLimit: 24,
    desktopParticleLimit: 64,
    continuousSceneLimit: 1,
  );
}

