using System.Collections.Generic;
using System.Linq;

namespace Seis.NativeKernel;

public record NativeRoadmapItem(string Lane, int Score);

public static class SeisNativeKernel
{
    public const string Version = "2026.07.1";

    public static IReadOnlyList<NativeRoadmapItem> Roadmap { get; } = new List<NativeRoadmapItem>
    {
        new("Apple First", 100),
        new("Data AI", 88),
        new("Systems", 84),
        new("Android", 76),
        new("Windows", 72),
        new("Infrastructure", 70)
    };

    public static IReadOnlyList<NativeRoadmapItem> OrderedRoadmap() =>
        Roadmap.OrderByDescending(item => item.Score).ToList();

    public static NativeRoadmapItem TopLane() => OrderedRoadmap().First();
}
