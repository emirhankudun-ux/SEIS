package seis.android;

public final class SeisAndroidDevelopmentProfileTest {
    private SeisAndroidDevelopmentProfileTest() {}

    public static void main(String[] args) {
        assertTrue(
            SeisAndroidDevelopmentProfile.readyForSeisAgent(),
            "Android profile should be ready for SEIS Agent"
        );
        assertTrue(
            SeisAndroidDevelopmentProfile.excludesAppleOnlyLanguages(),
            "Android profile must exclude Apple-only languages"
        );
        assertTrue(
            SeisAndroidDevelopmentProfile.preferredLanguages().contains("Java"),
            "Android profile must keep Java as a first-class implementation surface"
        );
        assertTrue(
            SeisAndroidDevelopmentProfile.preferredLanguages().contains("Kotlin"),
            "Android profile must keep Kotlin as a first-class implementation surface"
        );
    }

    private static void assertTrue(boolean value, String message) {
        if (!value) {
            throw new IllegalStateException(message);
        }
    }
}
