#import "SEISPlatformBridge.h"

@implementation SEISPlatformReadiness

- (instancetype)initWithTarget:(SEISPlatformTarget)target
                     languages:(NSArray<NSString *> *)languages
                   qualityGates:(NSArray<NSString *> *)qualityGates
          offlineHelperAvailable:(BOOL)offlineHelperAvailable
            remoteBridgeAvailable:(BOOL)remoteBridgeAvailable {
    self = [super init];
    if (self) {
        _target = target;
        _languages = [languages copy];
        _qualityGates = [qualityGates copy];
        _offlineHelperAvailable = offlineHelperAvailable;
        _remoteBridgeAvailable = remoteBridgeAvailable;
    }
    return self;
}

- (BOOL)isReadyForSEISAgent {
    return self.languages.count >= 2 &&
           self.qualityGates.count >= 5 &&
           self.offlineHelperAvailable &&
           self.remoteBridgeAvailable;
}

@end

NSArray<NSString *> *SEISAppleNativeLanguages(void) {
    return @[@"Swift", @"Objective-C", @"AppleScript"];
}

NSArray<NSString *> *SEISWindowsNativeLanguages(void) {
    return @[@"C#", @"PowerShell"];
}
