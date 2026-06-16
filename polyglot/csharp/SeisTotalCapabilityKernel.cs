using System;
using System.Collections.Generic;
using System.Linq;

namespace Seis.Capability;

public enum SeisPlatform
{
    Windows,
    Android,
    Apple,
    Web,
    Data,
    Policy
}

public sealed record SeisCapability(
    string Name,
    SeisPlatform Platform,
    IReadOnlyCollection<string> LanguageFamilies,
    bool RequiresRuntimeInstall = false,
    bool MarketReady = false);

public static class SeisTotalCapabilityKernel
{
    private static readonly ISet<string> WindowsFirstLanguages = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "C#", "F#", "PowerShell", "Batch", "C++", "Rust", "Go", "T-SQL", "MSBuild", "SQL"
    };

    private static readonly ISet<string> BlockedForThisPass = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "JavaScript", "Python"
    };

    public static bool Accepts(SeisCapability capability)
    {
        if (capability.RequiresRuntimeInstall) return false;
        if (capability.LanguageFamilies.Any(BlockedForThisPass.Contains)) return false;
        if (capability.Platform != SeisPlatform.Windows) return true;
        return capability.LanguageFamilies.All(WindowsFirstLanguages.Contains);
    }

    public static string NextGate(SeisCapability capability)
    {
        if (!Accepts(capability))
        {
            return "Use Windows/non-Apple contracts or document product need, owner, validation, storage budget, and rollback.";
        }

        return capability.MarketReady
            ? "Ready for reviewed main-branch Windows release planning."
            : "Complete security, support, accessibility, observability, installation, and rollback readiness.";
    }
}
