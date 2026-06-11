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

struct AiProviderRoute {
  std::string remote_orchestrator;
  std::vector<std::string> online_helpers;
  std::string offline_fallback;
  bool network_online;
  bool credential_boundary;
};

ToolchainProfile active_toolchain_profile();
AiProviderRoute online_ai_provider_route();
AiProviderRoute offline_ai_provider_route();
std::set<std::string> apple_only_languages();
bool excludes_apple_only_languages(const ToolchainProfile& profile);
bool ready_for_main_centered_development(const ToolchainProfile& profile);
bool ai_route_ready(const AiProviderRoute& route);

}  // namespace seis::windows
