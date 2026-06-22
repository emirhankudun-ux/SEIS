struct ReadinessPolicy
  getter reduced_motion_required : Bool
  getter dependency_budget_locked : Bool
  getter live_upload_requires_target : Bool

  def initialize
    @reduced_motion_required = true
    @dependency_budget_locked = true
    @live_upload_requires_target = true
  end
end
