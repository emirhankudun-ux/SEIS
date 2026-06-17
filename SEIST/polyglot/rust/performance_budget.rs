pub struct PerformanceBudget {
    pub mobile_particles: u16,
    pub desktop_particles: u16,
    pub curated_asset_budget_bytes: u64,
    pub supports_reduced_motion: bool,
}

pub fn seis_budget() -> PerformanceBudget {
    PerformanceBudget {
        mobile_particles: 24,
        desktop_particles: 64,
        curated_asset_budget_bytes: 7_000_000,
        supports_reduced_motion: true,
    }
}

