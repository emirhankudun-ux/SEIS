// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "SeisPlatformKit",
    platforms: [
        .macOS(.v13),
        .iOS(.v16)
    ],
    products: [
        .library(name: "SeisPlatformKit", targets: ["SeisPlatformKit"]),
        .executable(name: "SeisAppleNativeShell", targets: ["SeisAppleNativeShell"])
    ],
    targets: [
        .target(name: "SeisPlatformKit"),
        .executableTarget(
            name: "SeisAppleNativeShell",
            dependencies: ["SeisPlatformKit"],
            resources: [
                .copy("Resources/seisdemo-urlscheme-template.plist"),
                .copy("Resources/seis-demo-contract.json"),
            ]
        ),
        .testTarget(name: "SeisPlatformKitTests", dependencies: ["SeisPlatformKit"])
    ]
)
