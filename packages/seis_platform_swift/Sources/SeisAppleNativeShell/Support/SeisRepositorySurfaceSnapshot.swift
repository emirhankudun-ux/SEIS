import SwiftUI

struct SeisRepositorySurfaceSnapshot: Decodable {
    let version: Int
    let generatedAt: String?
    let sourceMode: String
    let repositorySignals: [Signal]
    let ecosystemSignals: [Signal]
    let fullStackDesignLanes: [Lane]

    struct Signal: Decodable {
        let title: String
        let value: String
        let detail: String
        let icon: String
        let tone: String

        var color: Color {
            SeisRepositorySurfaceSnapshot.color(named: tone)
        }
    }

    struct Lane: Decodable {
        let id: String
        let title: String
        let badge: String
        let intent: String
        let deepLink: String?
        let icon: String
        let tone: String

        var color: Color {
            SeisRepositorySurfaceSnapshot.color(named: tone)
        }
    }

    private static func color(named name: String) -> Color {
        switch name {
        case "blue":
            return .blue
        case "cyan":
            return .cyan
        case "green":
            return .green
        case "indigo":
            return .indigo
        case "orange":
            return .orange
        case "purple":
            return .purple
        case "teal":
            return .teal
        default:
            return .secondary
        }
    }
}
