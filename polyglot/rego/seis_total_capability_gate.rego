package seis.capability

default allow := false

blocked_language[language] {
  language := input.language_families[_]
  language == "JavaScript"
}

blocked_language[language] {
  language := input.language_families[_]
  language == "Python"
}

apple_language_allowed(language) {
  language == "Swift"
} else {
  language == "SwiftUI"
} else {
  language == "Objective-C"
} else {
  language == "Objective-C++"
} else {
  language == "AppleScript"
} else {
  language == "Metal Shading Language"
}

allow {
  not input.requires_runtime_install
  count(blocked_language) == 0
  input.platform != "apple"
}

allow {
  not input.requires_runtime_install
  count(blocked_language) == 0
  input.platform == "apple"
  every language in input.language_families { apple_language_allowed(language) }
}

reason := "ready for reviewed main-branch release" {
  allow
  input.market_ready
}

reason := "blocked until runtime, language, governance, and market-readiness gates pass" {
  not allow
}
