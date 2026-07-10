#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NativeRoadmapItem {
    pub lane: &'static str,
    pub score: u8,
    pub evidence: &'static [&'static str],
    pub next_step: &'static str,
}

pub const ROADMAP: &[NativeRoadmapItem] = &[
    NativeRoadmapItem {
        lane: "Apple First",
        score: 100,
        evidence: &["Swift", "SwiftUI", "AppKit"],
        next_step: "Build Apple native surfaces first.",
    },
    NativeRoadmapItem {
        lane: "Data AI",
        score: 88,
        evidence: &["Python", "evaluation", "memory"],
        next_step: "Keep intelligence workflows measurable.",
    },
    NativeRoadmapItem {
        lane: "Systems",
        score: 84,
        evidence: &["Rust", "typed contracts"],
        next_step: "Move shared logic into safe modules.",
    },
    NativeRoadmapItem {
        lane: "Android",
        score: 76,
        evidence: &["Kotlin", "Java"],
        next_step: "Mirror product intent on Android.",
    },
    NativeRoadmapItem {
        lane: "Windows",
        score: 72,
        evidence: &["CSharp", "DotNet"],
        next_step: "Define Windows product contracts.",
    },
    NativeRoadmapItem {
        lane: "Infrastructure",
        score: 70,
        evidence: &["Go", "SQL", "Shell"],
        next_step: "Keep operations auditable and reversible.",
    },
];

pub fn top_lane() -> Option<&'static NativeRoadmapItem> {
    ROADMAP.iter().max_by_key(|item| item.score)
}

pub fn summary_lines() -> Vec<String> {
    ROADMAP
        .iter()
        .map(|item| format!("{}: {} - {}", item.lane, item.score, item.next_step))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn apple_first_stays_top_priority() {
        assert_eq!(top_lane().map(|item| item.lane), Some("Apple First"));
    }
}
