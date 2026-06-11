import unittest

from packages.seis_kernel import (
    DomainRouter,
    build_capability_contract,
    validate_capability_contract,
)


class SeisCapabilityKernelTest(unittest.TestCase):
    def test_contract_is_valid_and_broad(self) -> None:
        contract = build_capability_contract()
        self.assertEqual(validate_capability_contract(contract), [])
        self.assertGreaterEqual(contract["summary"]["domainCount"], 38)
        self.assertGreaterEqual(contract["summary"]["pluginInventoryCount"], 120)
        self.assertGreaterEqual(contract["summary"]["coveredPluginCount"], 60)

    def test_router_prioritizes_ai_agent_mcp_llm_scope(self) -> None:
        router = DomainRouter()
        result = router.route("SEIS AI agent MCP skills plugin LLM orchestration")
        ids = [item["id"] for item in result]
        self.assertIn("mcp-skills-plugins", ids)
        self.assertIn("ai-agent-engineering", ids)
        self.assertIn("llm-orchestration", ids)

    def test_router_covers_design_data_security_and_robotics(self) -> None:
        router = DomainRouter()
        result = router.route("design data science cybersecurity robotics formal methods")
        ids = {item["id"] for item in result}
        self.assertTrue(
            {
                "data-science",
                "cybersecurity",
                "formal-methods",
                "autonomous-vehicles-and-robotics",
            }.intersection(ids)
        )


if __name__ == "__main__":
    unittest.main()
