package seis.nativekernel;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class SeisNativeKernel {
    public static final String VERSION = "2026.07.1";

    public record NativeRoadmapItem(String lane, int score, List<String> evidence, String nextStep) {}

    public static final List<NativeRoadmapItem> ROADMAP = List.of(
        new NativeRoadmapItem("Apple First", 100, List.of("Swift", "SwiftUI", "AppKit"), "Build Apple native surfaces first."),
        new NativeRoadmapItem("Data AI", 88, List.of("Python", "evaluation", "memory"), "Keep intelligence workflows measurable."),
        new NativeRoadmapItem("Systems", 84, List.of("Rust", "typed contracts"), "Move shared logic into safe modules."),
        new NativeRoadmapItem("Android", 76, List.of("Kotlin", "Java"), "Mirror product intent on Android."),
        new NativeRoadmapItem("Windows", 72, List.of("CSharp", "DotNet"), "Define Windows product contracts."),
        new NativeRoadmapItem("Infrastructure", 70, List.of("Go", "SQL", "Shell"), "Keep operations auditable and reversible.")
    );

    private SeisNativeKernel() {}

    public static List<NativeRoadmapItem> orderedRoadmap() {
        ArrayList<NativeRoadmapItem> items = new ArrayList<>(ROADMAP);
        items.sort(Comparator.comparingInt(NativeRoadmapItem::score).reversed());
        return List.copyOf(items);
    }

    public static NativeRoadmapItem topLane() {
        return orderedRoadmap().get(0);
    }
}
