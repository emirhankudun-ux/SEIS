release_governance {
  requires_domain_before_live_deploy = true
  package_path = "dist/seis-static.zip"
  release_ledger = "releases/latest.json"
}

motion_policy {
  supports_reduced_motion = true
  mobile_particle_limit = 24
  desktop_particle_limit = 64
}
