module readiness_policy
  implicit none

  logical, parameter :: reduced_motion_required = .true.
  logical, parameter :: dependency_budget_locked = .true.
  logical, parameter :: live_upload_requires_target = .true.
end module readiness_policy
