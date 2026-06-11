#pragma once

#include <string>
#include <vector>

namespace seis::windows {

struct Capability {
  std::string id;
  std::vector<std::string> languages;
  std::vector<std::string> quality_gates;
  bool offline_helper;
  bool remote_bridge;
};

Capability platform_capability();
bool is_ready_for_seis_agent(const Capability& capability);

}  // namespace seis::windows
