import Foundation

struct SEISMotionPolicy {
    let supportsReducedMotion: Bool
    let mobileParticleLimit: Int
    let desktopParticleLimit: Int
    let continuousSceneLimit: Int

    static let foundation = SEISMotionPolicy(
        supportsReducedMotion: true,
        mobileParticleLimit: 24,
        desktopParticleLimit: 64,
        continuousSceneLimit: 1
    )
}

