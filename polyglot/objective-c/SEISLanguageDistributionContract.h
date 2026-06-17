#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, SEISLanguagePanelKind) {
    SEISLanguagePanelKindJavaScript = 1,
    SEISLanguagePanelKindTypeScript = 2,
    SEISLanguagePanelKindObjectiveC = 3,
    SEISLanguagePanelKindOther = 4
};

@interface SEISLanguagePanelEntry : NSObject

@property (nonatomic, readonly) SEISLanguagePanelKind kind;
@property (nonatomic, readonly, copy) NSString *label;
@property (nonatomic, readonly) unsigned long long bytes;
@property (nonatomic, readonly, copy) NSArray<NSString *> *sourceLanguages;

+ (instancetype)entryWithKind:(SEISLanguagePanelKind)kind
                        label:(NSString *)label
                        bytes:(unsigned long long)bytes
              sourceLanguages:(NSArray<NSString *> *)sourceLanguages;

- (instancetype)init NS_UNAVAILABLE;

@end

NSArray<NSString *> *SEISLanguagePanelFocusLanguages(void);
NSArray<SEISLanguagePanelEntry *> *SEISBuildLanguagePanelSplit(NSDictionary<NSString *, NSNumber *> *languageBytes);
BOOL SEISLanguagePanelOtherExcludesFocusLanguages(NSArray<SEISLanguagePanelEntry *> *entries);

NS_ASSUME_NONNULL_END
