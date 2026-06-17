#pragma once

namespace seis {

struct ReadinessContract {
  bool reducedMotionRequired;
  bool dependencyBudgetLocked;
  bool releaseRequiresManifest;
};

inline constexpr ReadinessContract readinessContract{
  true,
  true,
  true
};

} // namespace seis
