import PlaygroundSupport
import SwiftUI

struct SEISPlatformCard: Identifiable {
    let id: String
    let title: String
    let detail: String
    let accent: Color
}

struct SEISPlatformPlaygroundView: View {
    private let cards = [
        SEISPlatformCard(
            id: "apple-native",
            title: "Apple Native",
            detail: "Swift, SwiftUI, Objective-C, AppleScript, and local SEIS helper routing.",
            accent: .blue
        ),
        SEISPlatformCard(
            id: "windows-polyglot",
            title: "Windows Polyglot",
            detail: ".NET, PowerShell, native C++, JVM, scripting, and data surfaces.",
            accent: .green
        ),
        SEISPlatformCard(
            id: "seis-agent",
            title: "SEIS Agent",
            detail: "One agent layer routes local helpers and remote LLMs through guarded capability gates.",
            accent: .purple
        ),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("SEIS Platform Kernel")
                .font(.system(size: 34, weight: .bold, design: .rounded))

            Text("Native Apple and Windows readiness without making JavaScript the core language.")
                .font(.headline)
                .foregroundStyle(.secondary)

            HStack(spacing: 14) {
                ForEach(cards) { card in
                    VStack(alignment: .leading, spacing: 12) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(card.accent)
                            .frame(width: 44, height: 8)

                        Text(card.title)
                            .font(.title3.weight(.semibold))

                        Text(card.detail)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, minHeight: 170, alignment: .topLeading)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
                }
            }

            Text("Quality gates: SwiftPM tests, Objective-C syntax, SwiftUI playground presence, Windows source surface checks, and optional runtime checks when tools exist.")
                .font(.callout)
                .foregroundStyle(.secondary)
        }
        .padding(28)
        .frame(width: 860, height: 520, alignment: .topLeading)
    }
}

PlaygroundPage.current.setLiveView(SEISPlatformPlaygroundView())
