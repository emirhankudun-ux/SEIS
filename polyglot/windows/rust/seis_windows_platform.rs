pub struct Capability {
    pub id: &'static str,
    pub languages: &'static [&'static str],
    pub quality_gates: &'static [&'static str],
    pub offline_helper: bool,
    pub remote_bridge: bool,
}

pub fn capability_surface() -> Capability {
    Capability {
        id: "windows-rust-core",
        languages: &["Rust", "PowerShell", "C++", "Go", "SQL", "Java"],
        quality_gates: &[
            "rustc_check_when_available",
            "windows_path_safety",
            "permission_scope",
            "offline_fallback",
            "event_log_awareness",
        ],
        offline_helper: true,
        remote_bridge: true,
    }
}

pub fn is_ready_for_seis_agent(capability: &Capability) -> bool {
    capability.languages.len() >= 4
        && capability.quality_gates.len() >= 5
        && capability.offline_helper
        && capability.remote_bridge
}
