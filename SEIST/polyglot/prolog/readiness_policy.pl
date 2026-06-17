reduced_motion_required(true).
dependency_budget_locked(true).
live_upload_requires_target(true).

seis_ready :-
  reduced_motion_required(true),
  dependency_budget_locked(true),
  live_upload_requires_target(true).
