// swift-tools-version: 5.9
import PackageDescription

// Standalone macOS demo: hosts the SEIS portfolio (apps/web) inside a native
// WKWebView window. Intentionally isolated from packages/seis_platform_swift so
// it has zero blast radius on the main Apple shell or its CI.
let package = Package(
    name: "SeisPortfolioDemo",
    platforms: [
        .macOS(.v12)
    ],
    targets: [
        .executableTarget(
            name: "SeisPortfolioDemo",
            path: "Sources/SeisPortfolioDemo"
        )
    ]
)
