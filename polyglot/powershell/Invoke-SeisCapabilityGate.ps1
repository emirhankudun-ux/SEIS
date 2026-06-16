param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('Apple','Android','Windows','Web','Data','Policy')]
    [string]$Platform,

    [Parameter(Mandatory=$true)]
    [string[]]$LanguageFamilies,

    [switch]$RequiresRuntimeInstall,
    [switch]$MarketReady
)

$blocked = @('JavaScript', 'Python')
$windowsFirst = @('C#', 'F#', 'PowerShell', 'Batch', 'C++', 'Rust', 'Go', 'T-SQL', 'MSBuild', 'SQL')

if ($RequiresRuntimeInstall) {
    return 'BLOCKED: document product need, owner, validation path, storage budget, and rollback before installing a runtime.'
}

if ($LanguageFamilies | Where-Object { $blocked -contains $_ }) {
    return 'BLOCKED: this pass does not add JavaScript or Python application code.'
}

if ($Platform -eq 'Windows') {
    $unsupported = $LanguageFamilies | Where-Object { $windowsFirst -notcontains $_ }
    if ($unsupported) {
        return "BLOCKED: Windows surface must use Windows/non-Apple language families first: $($unsupported -join ', ')"
    }
}

if (-not $MarketReady) {
    return 'READY-FOR-CONTRACT: complete security, accessibility, support, release notes, and rollback before market release.'
}

'READY-FOR-REVIEWED-MAIN-BRANCH-RELEASE'
