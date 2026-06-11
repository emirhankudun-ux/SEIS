#pragma once

#include <set>
#include <string>
#include <vector>

namespace seis::windows {

struct ToolchainProfile {
  std::vector<std::string> ai_collaborators;
  std::vector<std::string> ide_surfaces;
  std::vector<std::string> languages;
  std::vector<std::string> quality_gates;
  bool website_final_surface;
  bool requirement_led_installs;
};

ToolchainProfile active_toolchain_profile();
std::set<std::string> apple_only_languages();
bool excludes_apple_only_languages(const ToolchainProfile& profile);
bool ready_for_main_centered_development(const ToolchainProfile& profile);

}  // namespace seis::windows
