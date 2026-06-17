release_policy = {
    "requires_domain_before_live_deploy": True,
    "package_path": "dist/seis-static.zip",
    "release_ledger": "releases/latest.json",
    "supports_reduced_motion": True,
}

def deploy_safe(has_domain, has_release_ledger):
    return has_domain and has_release_ledger
