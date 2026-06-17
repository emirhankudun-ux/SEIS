module SeisReadinessMetrics

const readiness_metrics = (
    reduced_motion_required = true,
    dependency_budget_locked = true,
    live_upload_requires_target = true,
)

is_ready(metrics = readiness_metrics) =
    metrics.reduced_motion_required &&
    metrics.dependency_budget_locked &&
    metrics.live_upload_requires_target

end
