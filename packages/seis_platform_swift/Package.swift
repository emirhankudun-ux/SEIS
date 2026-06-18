// swift-tools-version: 6.0

import PackageDescription

var products: [Product] = [
    .library(name: "SeisPlatformKit", targets: ["SeisPlatformKit"])
]

var targets: [Target] = [
    .target(name: "SeisPlatformKit"),
    .testTarget(name: "SeisPlatformKitTests", dependencies: ["SeisPlatformKit"])
]

#if os(macOS)
products.append(.executable(name: "SeisAppleNativeShell", targets: ["SeisAppleNativeShell"]))
targets.insert(
    .executableTarget(
        name: "SeisAppleNativeShell",
        dependencies: ["SeisPlatformKit"],
        resources: [
            .copy("Resources/seisdemo-urlscheme-template.plist"),
            .copy("Resources/seis-demo-contract.json"),
        ]
    ),
    at: 1
)
#endif

let package = Package(
    name: "SeisPlatformKit",
    platforms: [
        .macOS(.v13),
        .iOS(.v16)
    ],
    products: products,
    targets: targets
)
