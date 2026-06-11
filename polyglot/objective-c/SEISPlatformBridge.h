#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, SEISPlatformTarget) {
    SEISPlatformTargetMacOS = 1,
    SEISPlatformTargetWindows = 2
};

@interface SEISPlatformReadiness : NSObject

@property (nonatomic, readonly) SEISPlatformTarget target;
@property (nonatomic, readonly, copy) NSArray<NSString *> *languages;
@property (nonatomic, readonly, copy) NSArray<NSString *> *qualityGates;
@property (nonatomic, readonly) BOOL offlineHelperAvailable;
@property (nonatomic, readonly) BOOL remoteBridgeAvailable;

- (instancetype)initWithTarget:(SEISPlatformTarget)target
                     languages:(NSArray<NSString *> *)languages
                   qualityGates:(NSArray<NSString *> *)qualityGates
          offlineHelperAvailable:(BOOL)offlineHelperAvailable
            remoteBridgeAvailable:(BOOL)remoteBridgeAvailable NS_DESIGNATED_INITIALIZER;

- (instancetype)init NS_UNAVAILABLE;
- (BOOL)isReadyForSEISAgent;

@end

NSArray<NSString *> *SEISAppleNativeLanguages(void);
NSArray<NSString *> *SEISWindowsNativeLanguages(void);

NS_ASSUME_NONNULL_END
