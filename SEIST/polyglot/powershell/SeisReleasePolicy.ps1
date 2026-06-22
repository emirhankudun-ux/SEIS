$RequiredArtifacts = @(
  "dist/seis-static.zip",
  "dist/server-upload-manifest.json",
  "releases/latest.json"
)

$MotionPolicy = @{
  SupportsReducedMotion = $true
  MobileParticleLimit = 24
  DesktopParticleLimit = 64
}

function Test-SeisDeploySafe {
  param(
    [string] $Domain,
    [bool] $HasReleaseLedger
  )

  return -not [string]::IsNullOrWhiteSpace($Domain) -and $HasReleaseLedger
}
