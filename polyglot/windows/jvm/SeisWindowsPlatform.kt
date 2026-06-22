package seis.windows

data class Capability(
    val id: String,
    val languages: List<String>,
    val qualityGates: List<String>,
    val offlineHelper: Boolean,
    val remoteBridge: Boolean,
) {
    val readyForSeisAgent: Boolean
        get() = languages.size >= 4 && qualityGates.size >= 5 && offlineHelper && remoteBridge
}

fun windowsKotlinCapability(): Capability =
    Capability(
        id = "windows-kotlin-jvm",
        languages = listOf("Kotlin", "Java", "PowerShell", "SQL"),
        qualityGates = listOf(
            "jvm_syntax_when_available",
            "windows_path_safety",
            "permission_scope",
            "offline_fallback",
            "event_log_awareness",
        ),
        offlineHelper = true,
        remoteBridge = true,
    )
