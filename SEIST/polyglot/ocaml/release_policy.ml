type release_policy = {
  reduced_motion_required : bool;
  dependency_budget_locked : bool;
  live_upload_requires_target : bool;
}

let default_policy = {
  reduced_motion_required = true;
  dependency_budget_locked = true;
  live_upload_requires_target = true;
}
