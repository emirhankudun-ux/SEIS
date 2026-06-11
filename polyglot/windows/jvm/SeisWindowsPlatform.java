package seis.windows;

import java.util.List;

public final class SeisWindowsPlatform {
    private SeisWindowsPlatform() {}

    public static List<String> languages() {
        return List.of("Java", "Kotlin", "PowerShell", "SQL", "Python");
    }

    public static boolean isReadyForSeisAgent(int qualityGateCount, boolean offlineHelper, boolean remoteBridge) {
        return qualityGateCount >= 5 && offlineHelper && remoteBridge;
    }
}
