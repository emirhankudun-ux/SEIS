#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CapabilityGate<'a> {
    pub domain_id: &'a str,
    pub lane: &'a str,
    pub plugin_count: usize,
    pub quality_gate_count: usize,
    pub has_agent_role: bool,
    pub has_flow: bool,
}

impl<'a> CapabilityGate<'a> {
    pub fn is_ready(&self, min_plugins: usize, min_gates: usize) -> bool {
        !self.domain_id.is_empty()
            && !self.lane.is_empty()
            && self.plugin_count >= min_plugins
            && self.quality_gate_count >= min_gates
            && self.has_agent_role
            && self.has_flow
    }
}

pub fn coverage_percent(items: &[CapabilityGate<'_>], min_plugins: usize, min_gates: usize) -> f64 {
    if items.is_empty() {
        return 0.0;
    }
    let ready = items
        .iter()
        .filter(|item| item.is_ready(min_plugins, min_gates))
        .count();
    ready as f64 / items.len() as f64 * 100.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn evaluates_capability_gate() {
        let gate = CapabilityGate {
            domain_id: "ai-agent-engineering",
            lane: "ai-intelligence",
            plugin_count: 5,
            quality_gate_count: 7,
            has_agent_role: true,
            has_flow: true,
        };
        assert!(gate.is_ready(3, 5));
    }
}
