package_path := "dist/seis-static.zip"
release_ledger := "releases/latest.json"
requires_domain_before_live_deploy := "true"
supports_reduced_motion := "true"

describe:
  @echo "package={{package_path}} ledger={{release_ledger}} deploy_guard={{requires_domain_before_live_deploy}} reduced_motion={{supports_reduced_motion}}"
