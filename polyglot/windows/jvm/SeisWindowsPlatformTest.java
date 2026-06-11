package seis.windows;

public final class SeisWindowsPlatformTest {
    private SeisWindowsPlatformTest() {}

    public static void main(String[] args) {
        assertTrue(
            SeisWindowsPlatform.isReadyForSeisAgent(5, true, true),
            "Windows JVM profile should be ready for SEIS Agent"
        );
        for (String forbidden : SeisWindowsPlatform.forbiddenLanguages()) {
            assertTrue(
                !SeisWindowsPlatform.languages().contains(forbidden),
                "Windows JVM profile must exclude " + forbidden
            );
        }
    }

    private static void assertTrue(boolean value, String message) {
        if (!value) {
            throw new IllegalStateException(message);
        }
    }
}
