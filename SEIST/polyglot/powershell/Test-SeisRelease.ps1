$ManifestPath = "dist/server-upload-manifest.json"

if (-not (Test-Path $ManifestPath)) {
  throw "missing dist/server-upload-manifest.json"
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

if (-not $Manifest.liveUploadBlocked) {
  throw "live upload must remain blocked until the server target is confirmed"
}

if ($Manifest.sha256.Length -ne 64) {
  throw "sha256 must be 64 characters"
}

Write-Output "SEIS PowerShell release contract passed"
