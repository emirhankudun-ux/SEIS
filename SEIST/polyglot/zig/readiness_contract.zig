pub const ReadinessContract = struct {
    reduced_motion_required: bool,
    dependency_budget_locked: bool,
    live_upload_requires_target: bool,
};

pub const readiness_contract = ReadinessContract{
    .reduced_motion_required = true,
    .dependency_budget_locked = true,
    .live_upload_requires_target = true,
};
