import Foundation

public struct SeisAppleRunHandoffContract: Codable, Equatable, Sendable {
    public let productName: String
    public let bundleIdentifier: String
    public let bundleDisplayName: String
    public let minimumSystemVersion: String
    public let packageRelativePath: String
    public let runScriptRelativePath: String
    public let codexRunCommand: String
    public let xcodeOpenRelativePath: String
    public let xcodeSchemeName: String
    public let xcodeDefaultSchemeName: String
    public let xcodeSchemeSelectionGuidance: String
    public let xcodeBuildCommand: String
    public let supportedModes: [String]

    public init(
        productName: String,
        bundleIdentifier: String,
        bundleDisplayName: String,
        minimumSystemVersion: String,
        packageRelativePath: String,
        runScriptRelativePath: String,
        codexRunCommand: String,
        xcodeOpenRelativePath: String,
        xcodeSchemeName: String,
        xcodeDefaultSchemeName: String,
        xcodeSchemeSelectionGuidance: String,
        xcodeBuildCommand: String,
        supportedModes: [String]
    ) {
        self.productName = productName
        self.bundleIdentifier = bundleIdentifier
        self.bundleDisplayName = bundleDisplayName
        self.minimumSystemVersion = minimumSystemVersion
        self.packageRelativePath = packageRelativePath
        self.runScriptRelativePath = runScriptRelativePath
        self.codexRunCommand = codexRunCommand
        self.xcodeOpenRelativePath = xcodeOpenRelativePath
        self.xcodeSchemeName = xcodeSchemeName
        self.xcodeDefaultSchemeName = xcodeDefaultSchemeName
        self.xcodeSchemeSelectionGuidance = xcodeSchemeSelectionGuidance
        self.xcodeBuildCommand = xcodeBuildCommand
        self.supportedModes = supportedModes
    }

    public static let appleNativeShell = SeisAppleRunHandoffContract(
        productName: "SeisAppleNativeShell",
        bundleIdentifier: "com.seis.apple-native-shell",
        bundleDisplayName: "SEIS Apple Native",
        minimumSystemVersion: "13.0",
        packageRelativePath: "packages/seis_platform_swift",
        runScriptRelativePath: "script/build_and_run.sh",
        codexRunCommand: "./script/build_and_run.sh",
        xcodeOpenRelativePath: "packages/seis_platform_swift/Package.swift",
        xcodeSchemeName: "SeisAppleNativeShell",
        xcodeDefaultSchemeName: "SeisPlatformKit-Package",
        xcodeSchemeSelectionGuidance: "If Xcode opens with SeisPlatformKit-Package selected, switch the active scheme to SeisAppleNativeShell before using Run for the native demo shell.",
        xcodeBuildCommand: "xcodebuild -scheme SeisAppleNativeShell -destination 'platform=macOS' -derivedDataPath .xcode-derived-data build",
        supportedModes: ["run", "--debug", "--logs", "--telemetry", "--brain-ssh", "--ai-scale", "--app-library", "--website-demo-lane", "--ubuntu-demo-lane", "--verify", "--verify-brain-ssh", "--verify-ai-scale", "--verify-app-library", "--verify-website-demo-lane", "--verify-ubuntu-demo-lane"]
    )

    public var requiredInfoPlistKeys: [String] {
        [
            "CFBundleExecutable",
            "CFBundleIdentifier",
            "CFBundleName",
            "CFBundlePackageType",
            "LSMinimumSystemVersion",
            "NSPrincipalClass"
        ]
    }

    public var expectedScriptTokens: [String] {
        [
            "APP_NAME=\"\(productName)\"",
            "BUNDLE_ID=\"\(bundleIdentifier)\"",
            "MIN_SYSTEM_VERSION=\"\(minimumSystemVersion)\"",
            "PACKAGE_DIR=\"$ROOT_DIR/\(packageRelativePath)\"",
            "REPOSITORY_SNAPSHOT=\"$APP_RESOURCES/seis-repository-surface-snapshot.json\"",
            "REPOSITORY_ROOT_ARGS=(--repository-root \"$ROOT_DIR\" --repository-snapshot \"$REPOSITORY_SNAPSHOT\")",
            "generate_repository_snapshot",
            "SEIS App Library",
            "stay contained as Linux Replica app surfaces",
            "Website / AI Platform",
            "Ubuntu Web Desktop",
            "apps/web/seis-linux-replica.html?demo=live&source=website",
            "apps/web/seis-linux-replica.html?demo=live&source=ubuntu",
            "swift build --package-path \"$PACKAGE_DIR\" --product \"$APP_NAME\"",
            "<string>\(bundleDisplayName)</string>",
            "/usr/bin/open -n \"$APP_BUNDLE\"",
            "--open-panel brain-ssh",
            "--open-panel ai-scale",
            "--open-panel app-library",
            "--brain-ssh|brain-ssh",
            "--ai-scale|ai-scale",
            "--app-library|app-library",
            "--website-demo-lane|website-demo-lane",
            "--ubuntu-demo-lane|ubuntu-demo-lane",
            "APP_ARGS=(--open-panel app-library)",
            "APP_ARGS=(--open-public-demo-lane website)",
            "APP_ARGS=(--open-public-demo-lane ubuntu)",
            "--verify-brain-ssh|verify-brain-ssh",
            "--verify-ai-scale|verify-ai-scale",
            "--verify-app-library|verify-app-library",
            "--verify-website-demo-lane|verify-website-demo-lane",
            "--verify-ubuntu-demo-lane|verify-ubuntu-demo-lane",
            "--verify|verify"
        ] + requiredInfoPlistKeys.map { "<key>\($0)</key>" }
    }

    public var expectedEnvironmentTokens: [String] {
        [
            "[[actions]]",
            "name = \"Run\"",
            "icon = \"run\"",
            "command = \"\(codexRunCommand)\"",
            "name = \"Run Brain & SSH\"",
            "command = \"\(codexRunCommand) --brain-ssh\"",
            "name = \"Run AI Scale\"",
            "command = \"\(codexRunCommand) --ai-scale\"",
            "name = \"Run App Library\"",
            "command = \"\(codexRunCommand) --app-library\""
        ]
    }

    public var expectedReadmeTokens: [String] {
        [
            "open \(xcodeOpenRelativePath)",
            "cd \(packageRelativePath)",
            xcodeBuildCommand,
            xcodeSchemeName,
            xcodeDefaultSchemeName,
            xcodeSchemeSelectionGuidance,
            "Run Brain & SSH",
            "Run AI Scale",
            "./script/build_and_run.sh --brain-ssh",
            "./script/build_and_run.sh --verify-brain-ssh",
            "./script/build_and_run.sh --ai-scale",
            "./script/build_and_run.sh --verify-ai-scale",
            "./script/build_and_run.sh --app-library",
            "./script/build_and_run.sh --verify-app-library",
            "./script/build_and_run.sh --website-demo-lane",
            "./script/build_and_run.sh --ubuntu-demo-lane",
            "./script/build_and_run.sh --verify-website-demo-lane",
            "./script/build_and_run.sh --verify-ubuntu-demo-lane",
            "npm run check:seis-apple-native-snapshot",
            "--repository-snapshot",
            "seis-repository-surface-snapshot.json",
            "Website / AI Platform",
            "Ubuntu Web Desktop",
            "?demo=live&source=website",
            "?demo=live&source=ubuntu"
        ]
    }

    public var expectedNativeAppTokens: [String] {
        [
            "Open Website Demo Lane",
            "Open Ubuntu Demo Lane",
            "Show App Library",
            "--open-public-demo-lane",
            "--open-panel",
            "app-library",
            "openPublicDemoLane(source: \"website\")",
            "openPublicDemoLane(source: \"ubuntu\")",
            "SeisPublicDemoLaneRoute.fileURL",
            "apps/web/seis-linux-replica.html?demo=live&source=\\(source)"
        ]
    }
}
