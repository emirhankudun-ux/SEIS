package capability

#LanguageRule: {
    platform: "apple" | "android" | "windows" | "web" | "data" | "policy"
    languageFamilies: [...string]
    requiresRuntimeInstall: bool | *false
    marketReady: bool | *false
    blockedForThisPass: [..."JavaScript" | "Python"] | *["JavaScript", "Python"]
}

#MarketReadiness: {
    readme: true
    license: true
    codeOfConduct: true
    contributing: true
    security: true
    contributors: true
    mainFirstBranchGovernance: true
    noSecrets: true
    validationCommands: [...string]
}

seisTotalCapabilityKernel: {
    canonicalBranch: "main"
    runtimeInstallPolicy: "install only for real product need, owner, validation path, storage budget, and rollback"
    appleOnlyLanguages: ["Swift", "SwiftUI", "Objective-C", "Objective-C++", "AppleScript", "Metal Shading Language"]
    androidWindowsNonAppleLanguages: ["Kotlin", "Java", "C#", "F#", "PowerShell", "Batch", "C++", "Rust", "Go", "SQL", "YAML", "TOML", "Rego", "CUE"]
}
