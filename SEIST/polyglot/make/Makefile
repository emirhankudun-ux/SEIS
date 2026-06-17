SEIS_PACKAGE_PATH := dist/seis-static.zip
SEIS_MANIFEST_PATH := dist/server-upload-manifest.json

.PHONY: seis-release-guard
seis-release-guard:
	test -f $(SEIS_PACKAGE_PATH)
	test -f $(SEIS_MANIFEST_PATH)
	@echo "SEIS Make release guard passed"
