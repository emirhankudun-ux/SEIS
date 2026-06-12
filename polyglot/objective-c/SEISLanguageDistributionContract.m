#import "SEISLanguageDistributionContract.h"

@implementation SEISLanguagePanelEntry

+ (instancetype)entryWithKind:(SEISLanguagePanelKind)kind
                        label:(NSString *)label
                        bytes:(unsigned long long)bytes
              sourceLanguages:(NSArray<NSString *> *)sourceLanguages {
    return [[self alloc] initWithKind:kind label:label bytes:bytes sourceLanguages:sourceLanguages];
}

- (instancetype)initWithKind:(SEISLanguagePanelKind)kind
                       label:(NSString *)label
                       bytes:(unsigned long long)bytes
             sourceLanguages:(NSArray<NSString *> *)sourceLanguages {
    self = [super init];
    if (self) {
        _kind = kind;
        _label = [label copy];
        _bytes = bytes;
        _sourceLanguages = [sourceLanguages copy];
    }
    return self;
}

@end

NSArray<NSString *> *SEISLanguagePanelFocusLanguages(void) {
    return @[@"JavaScript", @"TypeScript", @"Objective-C"];
}

NSArray<SEISLanguagePanelEntry *> *SEISBuildLanguagePanelSplit(NSDictionary<NSString *, NSNumber *> *languageBytes) {
    NSArray<NSString *> *focusLanguages = SEISLanguagePanelFocusLanguages();
    NSSet<NSString *> *focusSet = [NSSet setWithArray:focusLanguages];
    NSMutableDictionary<NSString *, NSNumber *> *normalized = [NSMutableDictionary dictionary];

    for (NSString *language in languageBytes) {
        NSNumber *rawBytes = languageBytes[language];
        unsigned long long bytes = rawBytes.unsignedLongLongValue;
        if (language.length == 0 || bytes == 0) {
            continue;
        }
        unsigned long long nextBytes = normalized[language].unsignedLongLongValue + bytes;
        normalized[language] = @(nextBytes);
    }

    NSMutableArray<SEISLanguagePanelEntry *> *entries = [NSMutableArray arrayWithCapacity:4];
    [entries addObject:[SEISLanguagePanelEntry entryWithKind:SEISLanguagePanelKindJavaScript
                                                       label:@"JavaScript"
                                                       bytes:normalized[@"JavaScript"].unsignedLongLongValue
                                             sourceLanguages:@[@"JavaScript"]]];
    [entries addObject:[SEISLanguagePanelEntry entryWithKind:SEISLanguagePanelKindTypeScript
                                                       label:@"TypeScript"
                                                       bytes:normalized[@"TypeScript"].unsignedLongLongValue
                                             sourceLanguages:@[@"TypeScript"]]];
    [entries addObject:[SEISLanguagePanelEntry entryWithKind:SEISLanguagePanelKindObjectiveC
                                                       label:@"Objective-C"
                                                       bytes:normalized[@"Objective-C"].unsignedLongLongValue
                                             sourceLanguages:@[@"Objective-C"]]];

    unsigned long long otherBytes = 0;
    NSMutableArray<NSString *> *otherLanguages = [NSMutableArray array];
    NSArray<NSString *> *sortedLanguages = [normalized.allKeys sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
    for (NSString *language in sortedLanguages) {
        if ([focusSet containsObject:language]) {
            continue;
        }
        otherBytes += normalized[language].unsignedLongLongValue;
        [otherLanguages addObject:language];
    }

    [entries addObject:[SEISLanguagePanelEntry entryWithKind:SEISLanguagePanelKindOther
                                                       label:@"Other"
                                                       bytes:otherBytes
                                             sourceLanguages:otherLanguages]];
    return entries;
}

BOOL SEISLanguagePanelOtherExcludesFocusLanguages(NSArray<SEISLanguagePanelEntry *> *entries) {
    NSSet<NSString *> *focusSet = [NSSet setWithArray:SEISLanguagePanelFocusLanguages()];
    for (SEISLanguagePanelEntry *entry in entries) {
        if (entry.kind != SEISLanguagePanelKindOther) {
            continue;
        }
        for (NSString *language in entry.sourceLanguages) {
            if ([focusSet containsObject:language]) {
                return NO;
            }
        }
        return YES;
    }
    return NO;
}
