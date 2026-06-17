use strict;
use warnings;

my %seis_readiness_guard = (
  reduced_motion_required => 1,
  dependency_budget_locked => 1,
  live_upload_requires_target => 1,
);

sub seis_ready {
  return $seis_readiness_guard{reduced_motion_required}
    && $seis_readiness_guard{dependency_budget_locked}
    && $seis_readiness_guard{live_upload_requires_target};
}

1;
