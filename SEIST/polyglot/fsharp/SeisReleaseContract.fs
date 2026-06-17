namespace Seis.Polyglot

module SeisReleaseContract =
  let packagePath = "dist/seis-static.zip"
  let supportedLocales = [ "tr"; "en"; "fr"; "it"; "de"; "es"; "ar" ]
  let reducedMotionRequired = true
  let liveUploadRequiresTarget = true

  let supportsLocale locale =
    supportedLocales |> List.contains locale
