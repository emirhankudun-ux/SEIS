import Foundation

public struct SeisAppleRunHandoffContract: Codable, Equatable, Sendable {
    public let productName: String
    public let bundleIdentifier: String
    public let bundleDisplayName: String
    public let minimumSystemVersion: String
    public let packageRelativePath: String
    public let runScriptRelativePath: String
    public let codexRunCommand: String
    public let supportedModes: [String]

    public init(
        productName: String,
        bundleIdentifier: String,
        bundleDisplayName: String,
        minimumSystemVersion: String,
        packageRelativePath: String,
        runScriptRelativePath: String,
        codexRunCommand: String,
        supportedModes: [String]
    ) {
        self.productName = productName
        self.bundleIdentifier = bundleIdentifier
        self.bundleDisplayName = bundleDisplayName
        self.minimumSystemVersion = minimumSystemVersion
        self.packageRelativePath = packageRelativePath
        self.runScriptRelativePath = runScriptRelativePath
        self.codexRunCommand = codexRunCommand
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
        supportedModes: ["run", "--debug", "--logs", "--telemetry", "--verify"]
    )

    public static let aiCommandCoreDesktop = SeisAppleRunHandoffContract(
        productName: "SeisAICommandCore",
        bundleIdentifier: "com.seis.ai-command-core",
        bundleDisplayName: "SEIS AI Command Core",
        minimumSystemVersion: "13.0",
        packageRelativePath: "packages/seis_platform_swift",
        runScriptRelativePath: "script/build_and_run.sh",
        codexRunCommand: "./script/build_and_run.sh --ai-demo",
        supportedModes: ["--ai-demo", "--ai-demo --verify"]
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
            "DISPLAY_NAME=\"\(bundleDisplayName)\"",
            "MIN_SYSTEM_VERSION=\"\(minimumSystemVersion)\"",
            "PACKAGE_DIR=\"$ROOT_DIR/\(packageRelativePath)\"",
            "swift build --package-path \"$PACKAGE_DIR\" --product \"$APP_NAME\"",
            "/usr/bin/open -n \"$APP_BUNDLE\"",
            "--verify|verify"
        ] + requiredInfoPlistKeys.map { "<key>\($0)</key>" }
    }

    public var expectedEnvironmentTokens: [String] {
        [
            "[[actions]]",
            "name = \"Run\"",
            "icon = \"run\"",
            "command = \"\(codexRunCommand)\""
        ]
    }
}
