-module(calm_release_policy).
-export([policy/0]).

policy() ->
  #{
    reduced_motion_required => true,
    dependency_budget_locked => true,
    live_upload_requires_target => true
  }.
