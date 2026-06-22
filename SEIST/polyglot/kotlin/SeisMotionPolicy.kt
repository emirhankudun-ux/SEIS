package seis.polyglot

data class SeisMotionPolicy(
    val supportsReducedMotion: Boolean,
    val mobileParticleLimit: Int,
    val desktopParticleLimit: Int,
    val continuousSceneLimit: Int
)

val foundationMotionPolicy = SeisMotionPolicy(
    supportsReducedMotion = true,
    mobileParticleLimit = 24,
    desktopParticleLimit = 64,
    continuousSceneLimit = 1
)

