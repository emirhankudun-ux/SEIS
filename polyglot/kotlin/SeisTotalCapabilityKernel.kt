package seis.capability

enum class SeisPlatform { ANDROID, WINDOWS, APPLE, WEB, DATA, POLICY }

data class SeisCapability(
    val name: String,
    val platform: SeisPlatform,
    val languageFamilies: Set<String>,
    val requiresRuntimeInstall: Boolean = false,
    val marketReady: Boolean = false
)

object SeisTotalCapabilityKernel {
    private val androidFirstLanguages = setOf("Kotlin", "Java", "XML", "Gradle", "C++", "Rust", "Go", "SQL")
    private val blockedForThisPass = setOf("JavaScript", "Python")

    fun accepts(capability: SeisCapability): Boolean {
        if (capability.requiresRuntimeInstall) return false
        if (capability.languageFamilies.any { it in blockedForThisPass }) return false
        if (capability.platform != SeisPlatform.ANDROID) return true
        return capability.languageFamilies.all { it in androidFirstLanguages }
    }

    fun nextGate(capability: SeisCapability): String = when {
        !accepts(capability) -> "Use Android-native/non-Apple contracts or document runtime need, owner, checks, and rollback."
        !capability.marketReady -> "Finish emulator, accessibility, low-motion, privacy, security, support, and release readiness."
        else -> "Ready for reviewed main-branch Android release planning."
    }
}
