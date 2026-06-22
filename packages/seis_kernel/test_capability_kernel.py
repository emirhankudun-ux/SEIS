import unittest

from packages.seis_kernel import (
    DomainRouter,
    build_active_mission_board,
    build_capability_contract,
    build_execution_packages,
    build_execution_runway,
    build_long_horizon_plan,
    build_platform_development_tracks,
    build_platform_language_policy,
    validate_active_mission_board,
    validate_capability_contract,
    validate_execution_packages,
    validate_execution_runway,
    validate_long_horizon_plan,
    validate_platform_development_tracks,
    validate_platform_language_policy,
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

    def test_long_horizon_plan_is_aggressive_and_platform_aware(self) -> None:
        plan = build_long_horizon_plan()
        self.assertEqual(validate_long_horizon_plan(plan), [])
        self.assertGreaterEqual(plan["summary"]["missionCount"], 100)
        self.assertGreaterEqual(plan["summary"]["appleMissionCount"], 10)
        self.assertGreaterEqual(plan["summary"]["windowsMissionCount"], 10)
        self.assertIn("SwiftUI", plan["languageCoverage"])
        self.assertIn("Playground", plan["languageCoverage"])
        self.assertIn("AppleScript", plan["languageCoverage"])
        self.assertIn("PowerShell", plan["languageCoverage"])

    def test_active_mission_board_turns_plan_into_execution_lanes(self) -> None:
        board = build_active_mission_board()
        self.assertEqual(validate_active_mission_board(board), [])
        self.assertEqual(board["summary"]["laneCount"], 3)
        self.assertGreaterEqual(board["summary"]["cardCount"], 30)
        self.assertIn("macos", board["platformCoverage"])
        self.assertIn("ios", board["platformCoverage"])
        self.assertIn("windows", board["platformCoverage"])
        self.assertIn("Playground", board["languageCoverage"])
        self.assertIn("AppleScript", board["languageCoverage"])
        self.assertIn("PowerShell", board["languageCoverage"])

    def test_execution_packages_are_daily_validation_ready_packets(self) -> None:
        bundle = build_execution_packages()
        self.assertEqual(validate_execution_packages(bundle), [])
        self.assertEqual(bundle["summary"]["packageCount"], 30)
        self.assertGreaterEqual(bundle["summary"]["validationCommandCount"], 8)
        self.assertEqual(bundle["summary"]["remoteReadyCount"], 30)
        self.assertEqual(bundle["summary"]["offlineReadyCount"], 30)
        self.assertIn("npm run automation:refresh-seis-surface -- --summary", bundle["commandCoverage"])
        self.assertIn("xcrun swift --version", bundle["commandCoverage"])
        self.assertIn("pwsh --version", bundle["commandCoverage"])

    def test_execution_runway_extends_packages_into_long_duration_work(self) -> None:
        runway = build_execution_runway()
        self.assertEqual(validate_execution_runway(runway), [])
        self.assertEqual(runway["summary"]["phaseCount"], 4)
        self.assertGreaterEqual(runway["summary"]["slotCount"], 60)
        self.assertGreaterEqual(runway["summary"]["minimumFocusHours"], 720)
        self.assertEqual(runway["summary"]["packageCoverageCount"], 30)
        self.assertIn("npm run check:seis-execution-runway", runway["checkpoints"][0]["requiredChecks"])

    def test_platform_language_policy_keeps_apple_native_and_windows_polyglot(self) -> None:
        policy = build_platform_language_policy()
        self.assertEqual(validate_platform_language_policy(policy), [])
        self.assertEqual(
            set(policy["apple"]["allowedLanguageSurfaces"]),
            {"Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"},
        )
        self.assertNotIn("Swift", policy["windows"]["allowedLanguageSurfaces"])
        self.assertNotIn("SwiftUI", policy["windows"]["allowedLanguageSurfaces"])
        self.assertNotIn("AppleScript", policy["windows"]["allowedLanguageSurfaces"])
        self.assertIn("AppleScript", policy["windows"]["excludedLanguageSurfaces"])
        self.assertIn("PowerShell", policy["windows"]["allowedLanguageSurfaces"])
        self.assertGreaterEqual(policy["summary"]["windowsLanguageCount"], 30)

    def test_platform_development_tracks_are_macos_native_and_windows_polyglot(self) -> None:
        tracks = build_platform_development_tracks()
        self.assertEqual(validate_platform_development_tracks(tracks), [])
        by_id = {track["id"]: track for track in tracks["tracks"]}
        apple_track = by_id["apple-native-macos-track"]
        self.assertEqual(set(apple_track["languages"]), {"Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"})
        self.assertNotIn("AppleScript", apple_track["forbiddenLanguages"])
        self.assertIn("AppKit", apple_track["frameworks"])
        self.assertIn("UIKit", apple_track["frameworks"])
        self.assertIn("Core Data", apple_track["frameworks"])
        self.assertIn("CloudKit", apple_track["frameworks"])
        self.assertIn("packages/seis_platform_swift/", apple_track["sourceRoots"])

        windows_required = by_id["windows-required-polyglot-track"]
        self.assertIn("C#", windows_required["languages"])
        self.assertIn("PowerShell", windows_required["languages"])
        self.assertIn("CMD", windows_required["languages"])
        self.assertNotIn("Swift", windows_required["languages"])
        self.assertNotIn("AppleScript", windows_required["languages"])
        self.assertIn("AppleScript", windows_required["forbiddenLanguages"])
        self.assertIn("no_swift_windows_surface", windows_required["qualityGates"])

        windows_extended = by_id["windows-extended-polyglot-track"]
        self.assertNotIn("SwiftUI", windows_extended["languages"])
        self.assertGreaterEqual(tracks["summary"]["windowsLanguageCoverageCount"], 40)


if __name__ == "__main__":
    unittest.main()
