module SeisReleaseContract

const PACKAGE_PATH = "dist/seis-static.zip"
const SUPPORTED_LOCALES = ["tr", "en", "fr", "it", "de", "es", "ar"]
const LIVE_UPLOAD_REQUIRES_TARGET = true

supports_locale(locale::AbstractString) = locale in SUPPORTED_LOCALES

end
