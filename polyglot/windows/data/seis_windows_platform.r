seis_windows_platform <- list(
  id = "windows-r-analytics",
  languages = c("R", "SQL", "Python", "PowerShell"),
  quality_gates = c(
    "r_syntax_when_available",
    "windows_path_safety",
    "permission_scope",
    "offline_fallback",
    "event_log_awareness"
  ),
  offline_helper = TRUE,
  remote_bridge = TRUE
)

seis_windows_ready <- function(capability) {
  length(capability$languages) >= 4 &&
    length(capability$quality_gates) >= 5 &&
    capability$offline_helper &&
    capability$remote_bridge
}
