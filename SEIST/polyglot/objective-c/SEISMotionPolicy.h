#import <Foundation/Foundation.h>

typedef struct {
  BOOL supportsReducedMotion;
  NSInteger mobileParticleLimit;
  NSInteger desktopParticleLimit;
  NSInteger continuousSceneLimit;
} SEISMotionPolicy;

static inline SEISMotionPolicy SEISFoundationMotionPolicy(void) {
  return (SEISMotionPolicy){
    .supportsReducedMotion = YES,
    .mobileParticleLimit = 24,
    .desktopParticleLimit = 64,
    .continuousSceneLimit = 1
  };
}
