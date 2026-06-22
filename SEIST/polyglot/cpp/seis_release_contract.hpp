#pragma once

#include <array>
#include <string_view>

namespace seis {
struct ReleaseContract {
  static constexpr std::string_view package = "dist/seis-static.zip";
  static constexpr std::array<std::string_view, 7> locales = {"tr", "en", "fr", "it", "de", "es", "ar"};
  static constexpr int mobileMotionLevel = 2;
  static constexpr bool reducedMotionRequired = true;
  static constexpr bool liveUploadRequiresTarget = true;
};
}
