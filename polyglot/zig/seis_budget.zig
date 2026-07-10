pub const SeisBudget = struct {
    mobile_particles: u16,
    desktop_particles: u16,
    curated_asset_budget_bytes: u64,
    supports_reduced_motion: bool,
};

pub fn foundationBudget() SeisBudget {
    return SeisBudget{
        .mobile_particles = 24,
        .desktop_particles = 64,
        .curated_asset_budget_bytes = 10_485_760,
        .supports_reduced_motion = true,
    };
}
