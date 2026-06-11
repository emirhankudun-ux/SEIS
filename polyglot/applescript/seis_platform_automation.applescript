on seisPlatformSummary()
    set macLanguages to {"Swift", "Objective-C", "AppleScript"}
    set windowsLanguages to {"C#", "PowerShell"}
    return {macosLanguages:macLanguages, windowsLanguages:windowsLanguages, agentName:"SEIS Agent", activationPolicy:"task relevant, authenticated, scoped, user approved"}
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
