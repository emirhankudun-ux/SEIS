module SeisReleaseContract where

packagePath :: String
packagePath = "dist/seis-static.zip"

supportedLocales :: [String]
supportedLocales = ["tr", "en", "fr", "it", "de", "es", "ar"]

reducedMotionRequired :: Bool
reducedMotionRequired = True

liveUploadRequiresTarget :: Bool
liveUploadRequiresTarget = True
