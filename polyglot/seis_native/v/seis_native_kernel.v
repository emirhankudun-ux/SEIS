module seis_native_kernel

pub struct NativeRoadmapItem {
    lane string
    score int
    language string
}

pub fn roadmap() []NativeRoadmapItem {
    return [
        NativeRoadmapItem{'Apple First', 100, 'Swift'},
        NativeRoadmapItem{'Data AI', 88, 'Python'},
        NativeRoadmapItem{'Systems', 84, 'Rust'},
        NativeRoadmapItem{'Android', 76, 'Kotlin'},
        NativeRoadmapItem{'Windows', 72, 'CSharp'},
        NativeRoadmapItem{'Infrastructure', 70, 'Go'},
    ]
}

pub fn top_lane() NativeRoadmapItem {
    return roadmap()[0]
}
