Set-StrictMode -Version Latest

function Test-SEISPlatformReadiness {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("macOS", "Windows")]
        [string] $Platform,

        [Parameter(Mandatory = $true)]
        [string[]] $Languages,

        [Parameter(Mandatory = $true)]
        [string[]] $QualityGates,

        [switch] $OfflineHelperAvailable,
        [switch] $RemoteBridgeAvailable
    )

    $requiredActions = [System.Collections.Generic.List[string]]::new()

    if ($Languages.Count -lt 2) {
        $requiredActions.Add("add at least two native or cross-platform languages")
    }

    if ($QualityGates.Count -lt 5) {
        $requiredActions.Add("add at least five platform quality gates")
    }

    if (-not $OfflineHelperAvailable.IsPresent) {
        $requiredActions.Add("define offline local helper behavior")
    }

    if (-not $RemoteBridgeAvailable.IsPresent) {
        $requiredActions.Add("define remote LLM bridge behavior")
    }

    [pscustomobject]@{
        Platform = $Platform
        Ready = $requiredActions.Count -eq 0
        LanguageCount = $Languages.Count
        QualityGateCount = $QualityGates.Count
        RequiredActions = $requiredActions.ToArray()
    }
}

Export-ModuleMember -Function Test-SEISPlatformReadiness
