module SeisReleaseContract where

packagePath :: String
packagePath = "dist/seis-static.zip"

supportedLocales :: Array String
supportedLocales = ["tr", "en", "fr", "it", "de", "es", "ar"]

reducedMotionRequired :: Boolean
reducedMotionRequired = true

liveUploadRequiresTarget :: Boolean
liveUploadRequiresTarget = true
