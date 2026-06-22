PACKAGE_PATH := dist/seis-static.zip
RELEASE_LEDGER := releases/latest.json
REQUIRES_DOMAIN_BEFORE_LIVE_DEPLOY := true
SUPPORTS_REDUCED_MOTION := true

.PHONY: describe-release-policy
describe-release-policy:
	@printf "package=%s ledger=%s deploy_guard=%s reduced_motion=%s\n" "$(PACKAGE_PATH)" "$(RELEASE_LEDGER)" "$(REQUIRES_DOMAIN_BEFORE_LIVE_DEPLOY)" "$(SUPPORTS_REDUCED_MOTION)"
