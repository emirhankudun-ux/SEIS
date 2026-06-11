#import "SEISPlatformBridge.h"

int main(void) {
    @autoreleasepool {
        NSArray<NSString *> *appleLanguages = SEISAppleNativeLanguages();
        NSArray<NSString *> *windowsLanguages = SEISWindowsNativeLanguages();
        SEISPlatformReadiness *appleReadiness =
            [[SEISPlatformReadiness alloc] initWithTarget:SEISPlatformTargetMacOS
                                                languages:appleLanguages
                                             qualityGates:@[@"swift_test", @"swiftui_surface", @"objective_c_syntax", @"applescript_syntax", @"permission_scope"]
                                   offlineHelperAvailable:YES
                                     remoteBridgeAvailable:YES];
        if (![appleReadiness isReadyForSEISAgent]) {
            return 1;
        }
        if (!SEISLanguagesContainAppleOnlySurface(appleLanguages)) {
            return 2;
        }
        if (SEISLanguagesContainAppleOnlySurface(windowsLanguages)) {
            return 3;
        }
        if (SEISLanguagesContainFrozenPythonSurface(windowsLanguages)) {
            return 4;
        }
    }
    return 0;
}
