const SERVER_TARGET_CONFIRMED: felt252 = 0;
const REDUCED_MOTION_SUPPORTED: felt252 = 1;
const MINIMUM_EVIDENCE_ITEMS: felt252 = 3;

fn ready_for_upload(accessibility_reviewed: felt252, rollback_planned: felt252) -> felt252 {
    if SERVER_TARGET_CONFIRMED == 1 && accessibility_reviewed == 1 && rollback_planned == 1 {
        return 1;
    }
    0
}
