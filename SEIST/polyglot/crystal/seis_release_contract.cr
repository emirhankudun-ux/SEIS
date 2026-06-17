module SeisReleaseContract
  PACKAGE_PATH = "dist/seis-static.zip"
  SUPPORTED_LOCALES = ["tr", "en", "fr", "it", "de", "es", "ar"]
  REDUCED_MOTION_REQUIRED = true
  LIVE_UPLOAD_REQUIRES_TARGET = true

  def self.supports_locale?(locale : String) : Bool
    SUPPORTED_LOCALES.includes?(locale)
  end
end
