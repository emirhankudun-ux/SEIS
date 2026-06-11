package seis.android;

import java.util.List;
import java.util.Set;

public final class SeisAndroidDevelopmentProfile {
    private static final Set<String> APPLE_ONLY_LANGUAGES =
        Set.of("Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript");

    private SeisAndroidDevelopmentProfile() {}

    public static List<String> activeTools() {
        return List.of("Android Studio", "OpenAI Codex", "Claude");
    }

    public static List<String> preferredLanguages() {
        return List.of("Java", "Kotlin", "C++", "SQL", "Gradle");
    }

    public static List<String> qualityGates() {
        return List.of(
            "android_studio_project_inspection",
            "emulator_smoke_when_available",
            "permission_scope_review",
            "offline_behavior_defined",
            "release_surface_after_platform_gates"
        );
    }

    public static boolean excludesAppleOnlyLanguages() {
        for (String language : preferredLanguages()) {
            if (APPLE_ONLY_LANGUAGES.contains(language)) {
                return false;
            }
        }
        return true;
    }

    public static boolean readyForSeisAgent() {
        return activeTools().contains("Android Studio") &&
            activeTools().contains("OpenAI Codex") &&
            activeTools().contains("Claude") &&
            preferredLanguages().contains("Java") &&
            preferredLanguages().contains("Kotlin") &&
            qualityGates().size() >= 5 &&
            excludesAppleOnlyLanguages();
    }
}
