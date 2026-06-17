module readiness_policy

pub struct ReadinessPolicy {
pub:
  reduced_motion_required bool = true
  dependency_budget_locked bool = true
  live_upload_requires_target bool = true
}

pub const default_policy = ReadinessPolicy{}
