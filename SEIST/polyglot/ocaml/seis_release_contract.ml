let package_path = "dist/seis-static.zip"
let supported_locales = ["tr"; "en"; "fr"; "it"; "de"; "es"; "ar"]
let reduced_motion_required = true
let live_upload_requires_target = true

let supports_locale locale =
  List.exists ((=) locale) supported_locales
