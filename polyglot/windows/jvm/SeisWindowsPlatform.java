package seis.windows;

import java.util.List;

public final class SeisWindowsPlatform {
    private SeisWindowsPlatform() {}

    public static List<String> languages() {
        return List.of("Java", "Kotlin", "PowerShell", "SQL", "C#", "F#", "Go", "Rust", "C++");
    }

    public static List<String> forbiddenLanguages() {
        return List.of("Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript", "Python", "JavaScript");
    }

    public static boolean isReadyForSeisAgent(int qualityGateCount, boolean offlineHelper, boolean remoteBridge) {
        return languages().size() >= 8 &&
            qualityGateCount >= 5 &&
            offlineHelper &&
            remoteBridge &&
            languages().stream().noneMatch(forbiddenLanguages()::contains);
    }
}
