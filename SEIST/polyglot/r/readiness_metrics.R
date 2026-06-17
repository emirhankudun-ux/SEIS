seis_readiness_metrics <- list(
  reduced_motion_required = TRUE,
  dependency_budget_locked = TRUE,
  live_upload_requires_target = TRUE
)

seis_ready <- function(metrics = seis_readiness_metrics) {
  isTRUE(metrics$reduced_motion_required) &&
    isTRUE(metrics$dependency_budget_locked) &&
    isTRUE(metrics$live_upload_requires_target)
}
