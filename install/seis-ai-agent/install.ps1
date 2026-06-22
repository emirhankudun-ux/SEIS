$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
Push-Location $RepoRoot
try { node scripts/install-seis-ai-agent.mjs @args } finally { Pop-Location }
