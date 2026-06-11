#include "seis_windows_toolchain_profile.hpp"

#include <algorithm>

namespace seis::windows {

ToolchainProfile active_toolchain_profile() {
  return ToolchainProfile{
      {"OpenAI Codex", "Claude"},
      {"Antigravity IDE", "Cursor", "Android Studio"},
      {"C#", "F#", "Visual Basic", "PowerShell", "Batch", "CMD", "C",
       "C++", "Rust", "Go", "Java", "Kotlin", "SQL", "R", "Lua", "Ruby",
       "PHP", "Dart", "Scala", "Groovy", "Haskell", "OCaml", "Nim",
       "Zig", "Fortran", "COBOL", "Perl", "Awk", "Tcl", "Shell",
       "YAML", "JSON Schema", "OpenAPI", "Terraform", "Bicep",
       "Dockerfile", "Make", "CMake"},
      {"no_apple_only_windows_surface", "main_centered_branch_policy",
       "requirement_led_runtime_install", "offline_behavior_defined",
       "remote_agent_review_supported", "website_final_release_surface"},
      true,
      true};
}

AiProviderRoute online_ai_provider_route() {
  return AiProviderRoute{
      "seis-agent",
      {"openai", "claude", "gemini"},
      "ollama-standby",
      true,
      true};
}

AiProviderRoute offline_ai_provider_route() {
  return AiProviderRoute{
      "seis-agent",
      {"ollama"},
      "ollama",
      false,
      true};
}

std::set<std::string> apple_only_languages() {
  return {"Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"};
}

bool excludes_apple_only_languages(const ToolchainProfile& profile) {
  const auto forbidden = apple_only_languages();
  return std::none_of(profile.languages.begin(), profile.languages.end(),
                      [&](const std::string& language) {
                        return forbidden.contains(language);
                      });
}

bool ready_for_main_centered_development(const ToolchainProfile& profile) {
  return profile.ai_collaborators.size() >= 2 &&
         profile.ide_surfaces.size() >= 3 &&
         profile.languages.size() >= 30 &&
         profile.quality_gates.size() >= 5 &&
         profile.website_final_surface &&
         profile.requirement_led_installs &&
         excludes_apple_only_languages(profile);
}

bool ai_route_ready(const AiProviderRoute& route) {
  if (route.remote_orchestrator != "seis-agent" || !route.credential_boundary) {
    return false;
  }
  if (route.network_online) {
    return std::find(route.online_helpers.begin(), route.online_helpers.end(),
                     "openai") != route.online_helpers.end() &&
           std::find(route.online_helpers.begin(), route.online_helpers.end(),
                     "claude") != route.online_helpers.end() &&
           std::find(route.online_helpers.begin(), route.online_helpers.end(),
                     "gemini") != route.online_helpers.end() &&
           route.offline_fallback == "ollama-standby";
  }
  return route.online_helpers.size() == 1 && route.online_helpers[0] == "ollama" &&
         route.offline_fallback == "ollama";
}

}  // namespace seis::windows
