#include "seis_windows_toolchain_profile.hpp"

#include <iostream>

int main() {
  const auto profile = seis::windows::active_toolchain_profile();
  if (!seis::windows::ready_for_main_centered_development(profile)) {
    std::cerr << "Windows toolchain profile is not ready for main-centered SEIS development.\n";
    return 1;
  }
  if (!seis::windows::excludes_apple_only_languages(profile)) {
    std::cerr << "Windows toolchain profile must exclude Apple-only languages.\n";
    return 1;
  }
  if (profile.languages.size() < 30) {
    std::cerr << "Windows toolchain profile must keep broad non-Apple language coverage.\n";
    return 1;
  }
  if (!seis::windows::ai_route_ready(seis::windows::online_ai_provider_route())) {
    std::cerr << "Windows online AI route must keep SEIS Agent remote and helper AIs local.\n";
    return 1;
  }
  if (!seis::windows::ai_route_ready(seis::windows::offline_ai_provider_route())) {
    std::cerr << "Windows offline AI route must fall back to Ollama.\n";
    return 1;
  }
  return 0;
}
