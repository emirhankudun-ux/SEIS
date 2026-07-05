pub const NativeLane = struct {
    name: []const u8,
    score: u8,
};

pub const lanes = [_]NativeLane{
    .{ .name = "Apple First", .score = 100 },
    .{ .name = "Data AI", .score = 88 },
    .{ .name = "Systems", .score = 84 },
    .{ .name = "Android", .score = 76 },
    .{ .name = "Windows", .score = 72 },
    .{ .name = "Infrastructure", .score = 70 },
};

pub fn topLane() NativeLane {
    return lanes[0];
}
