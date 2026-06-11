namespace Seis.Platform;

public enum SeisPlatformTarget
{
    MacOS,
    Windows
}

public sealed record SeisPlatformCapability(
    SeisPlatformTarget Target,
    IReadOnlyList<string> Languages,
    IReadOnlyList<string> LocalHelpers,
    IReadOnlyList<string> RemoteHelpers,
    IReadOnlyList<string> QualityGates,
    IReadOnlyList<string> Frameworks,
    bool SupportsOfflineHelper,
    bool SupportsRemoteLlmBridge)
{
    public bool IsReadyForSeisAgent =>
        Languages.Count >= 2 &&
        QualityGates.Count >= 5 &&
        SupportsOfflineHelper &&
        SupportsRemoteLlmBridge;
}

public static class SeisPlatformPolicy
{
    public static readonly SeisPlatformCapability Windows = new(
        SeisPlatformTarget.Windows,
        [
            "C#",
            "F#",
            "Visual Basic",
            "PowerShell",
            "Batch",
            "C++",
            "Rust",
            "Go",
            "Python",
            "Java",
            "Kotlin",
            "SQL",
            "R",
            "Lua",
            "Ruby",
            "PHP"
        ],
        ["PowerShell", "dotnet", "winget", "python", "go", "rustc", "javac", "clang++"],
        ["SEIS Agent", "OpenAI", "Claude", "Gemini"],
        [
            "powershell_policy",
            "dotnet_readiness",
            "windows_multilang_source_surface",
            "native_cpp_syntax_when_available",
            "jvm_syntax_when_available",
            "windows_path_safety",
            "permission_scope",
            "offline_fallback",
            "event_log_awareness"
        ],
        [".NET", "WinUI", "WPF", "Windows Terminal", "WSL-aware CLI"],
        SupportsOfflineHelper: true,
        SupportsRemoteLlmBridge: true);

    public static IReadOnlyList<string> RequiredActions(SeisPlatformCapability capability)
    {
        var actions = new List<string>();
        if (capability.Languages.Count < 2)
        {
            actions.Add("add at least two native or cross-platform languages");
        }
        if (capability.QualityGates.Count < 5)
        {
            actions.Add("add at least five platform quality gates");
        }
        if (!capability.SupportsOfflineHelper)
        {
            actions.Add("define offline local helper behavior");
        }
        if (!capability.SupportsRemoteLlmBridge)
        {
            actions.Add("define remote LLM bridge behavior");
        }
        return actions;
    }
}
