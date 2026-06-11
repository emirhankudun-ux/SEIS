// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "SeisPlatformKit",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .library(name: "SeisPlatformKit", targets: ["SeisPlatformKit"])
    ],
    targets: [
        .target(name: "SeisPlatformKit"),
        .testTarget(name: "SeisPlatformKitTests", dependencies: ["SeisPlatformKit"])
    ]
)
