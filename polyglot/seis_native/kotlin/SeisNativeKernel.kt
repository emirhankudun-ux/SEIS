package seis.nativekernel

data class NativeRoadmapItem(
    val lane: String,
    val score: Int,
    val evidence: List<String>,
    val nextStep: String
)

object SeisNativeKernel {
    const val version: String = "2026.07.1"

    val roadmap: List<NativeRoadmapItem> = listOf(
        NativeRoadmapItem("Apple First", 100, listOf("Swift", "SwiftUI", "AppKit"), "Build Apple native surfaces first."),
        NativeRoadmapItem("Data AI", 88, listOf("Python", "evaluation", "memory"), "Keep intelligence workflows measurable."),
        NativeRoadmapItem("Systems", 84, listOf("Rust", "typed contracts"), "Move shared logic into safe modules."),
        NativeRoadmapItem("Android", 76, listOf("Kotlin", "Java"), "Mirror product intent on Android."),
        NativeRoadmapItem("Windows", 72, listOf("CSharp", "DotNet"), "Define Windows product contracts."),
        NativeRoadmapItem("Infrastructure", 70, listOf("Go", "SQL", "Shell"), "Keep operations auditable and reversible.")
    )

    fun orderedRoadmap(): List<NativeRoadmapItem> = roadmap.sortedByDescending { it.score }

    fun topLane(): NativeRoadmapItem = orderedRoadmap().first()
}
