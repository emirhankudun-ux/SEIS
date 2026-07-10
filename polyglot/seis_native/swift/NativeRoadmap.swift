import Foundation

public struct NativeRoadmapItem: Sendable, Equatable {
    public let name: String
    public let score: Int
}

public enum NativeRoadmap {
    public static let version = "2026.07.1"
    public static let items: [NativeRoadmapItem] = [
        NativeRoadmapItem(name: "Apple First", score: 100),
        NativeRoadmapItem(name: "Data AI", score: 88),
        NativeRoadmapItem(name: "Systems", score: 84)
    ]
}
