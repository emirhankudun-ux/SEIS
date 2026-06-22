#import <Foundation/Foundation.h>

typedef struct {
  BOOL reducedMotionRequired;
  BOOL dependencyBudgetLocked;
  BOOL liveUploadRequiresTarget;
} SEISReleasePolicy;

static const SEISReleasePolicy SEISDefaultReleasePolicy = {
  YES,
  YES,
  YES
};
