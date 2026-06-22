on seisPlatformSummary()
    set macLanguages to {"Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"}
    set windowsLanguages to {"C#", "F#", "Visual Basic", "PowerShell", "Batch", "CMD", "C", "C++", "Rust", "Go", "Python", "Java", "Kotlin", "SQL", "R", "Lua", "Ruby", "PHP"}
    set windowsExcludedLanguages to {"Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"}
    return {macosLanguages:macLanguages, windowsLanguages:windowsLanguages, windowsExcludedLanguages:windowsExcludedLanguages, agentName:"SEIS Agent", activationPolicy:"task relevant, authenticated, scoped, user approved"}
end seisPlatformSummary

on shouldUseLocalHelper(platformName)
    if platformName is "macOS" then
        return true
    end if
    if platformName is "Windows" then
        return true
    end if
    return false
end shouldUseLocalHelper
