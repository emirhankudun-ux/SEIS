#include "seis_windows_platform.hpp"

namespace seis::windows {

Capability platform_capability() {
  return Capability{
      "windows-native-cpp",
      {"C++", "C", "PowerShell", "Python"},
      {"native_cpp_syntax_when_available",
       "windows_path_safety",
       "permission_scope",
       "offline_fallback",
       "event_log_awareness"},
      true,
      true};
}

bool is_ready_for_seis_agent(const Capability& capability) {
  return capability.languages.size() >= 4 &&
         capability.quality_gates.size() >= 5 &&
         capability.offline_helper &&
         capability.remote_bridge;
}

}  // namespace seis::windows
