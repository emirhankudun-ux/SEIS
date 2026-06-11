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
    return @[@"Swift", @"SwiftUI", @"Objective-C", @"Playground", @"AppleScript"];
}

NSArray<NSString *> *SEISWindowsNativeLanguages(void) {
    return @[@"C#", @"F#", @"Visual Basic", @"PowerShell", @"Batch", @"CMD", @"C", @"C++", @"Rust", @"Go", @"Java", @"Kotlin", @"SQL", @"R", @"Lua", @"Ruby", @"PHP"];
}

BOOL SEISLanguagesContainAppleOnlySurface(NSArray<NSString *> *languages) {
    NSSet<NSString *> *appleOnly = [NSSet setWithArray:SEISAppleNativeLanguages()];
    for (NSString *language in languages) {
        if ([appleOnly containsObject:language]) {
            return YES;
        }
    }
    return NO;
}

BOOL SEISLanguagesContainFrozenPythonSurface(NSArray<NSString *> *languages) {
    return [languages containsObject:@"Python"];
}
