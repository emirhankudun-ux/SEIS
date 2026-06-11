"""Priority atlas for platform-first SEIS development.

The atlas encodes the user's current operating decision: core AI, agent,
MCP, skills, plugins, LLM, Apple-native, and Windows-polyglot work comes
before the website. The website is a final release surface, not the starting
surface.
"""

from __future__ import annotations

from typing import Any

from .platform_language_policy import (
    APPLE_ALLOWED_SOURCE_ROOTS,
    APPLE_ONLY_LANGUAGE_SURFACES,
    WINDOWS_EXCLUDED_LANGUAGE_SURFACES,
    apple_language_set,
    windows_language_set,
)


KEY_DOMAIN_IDS = (
    "ai-agent-engineering",
    "mcp-skills-plugins",
    "llm-orchestration",
    "artificial-intelligence",
    "algorithms-and-flowcharts",
    "computer-science-foundations",
    "mathematics-foundations",
    "formal-methods",
)


def build_platform_priority_atlas(required_domain_ids: list[str] | tuple[str, ...] | None = None) -> dict[str, Any]:
    domain_ids = list(required_domain_ids or ())
    apple_languages = sorted(APPLE_ONLY_LANGUAGE_SURFACES)
    windows_languages = sorted(windows_language_set())

    phases = [
        {
            "order": 1,
            "id": "seis-agent-foundation",
            "label": "SEIS Agent Foundation",
            "platformFocus": ["local", "remote", "offline"],
            "languagePolicy": "agent_core_language_agnostic_with_requirement_led_runtime_install",
            "languages": ["Python", "Go", "Rust", "CUE", "Rego", "SQL"],
            "domains": [
                "ai-agent-engineering",
                "mcp-skills-plugins",
                "llm-orchestration",
                "artificial-intelligence",
                "algorithms-and-flowcharts",
                "computer-science-foundations",
                "mathematics-foundations",
                "formal-methods",
            ],
            "primaryArtifacts": [
                "packages/seis_kernel/",
                "content/development/seis-universal-capability-kernel.json",
                "content/development/ai-release-manifest.json",
            ],
            "qualityGates": [
                "check:universal-capability-kernel",
                "check:ai-release-manifest",
                "check:llm-orchestration-policy",
                "check:seis-nonjs-kernel",
            ],
            "doneSignal": "SEIS routes AI, agent, MCP, plugin, skill, and LLM work through checked local contracts.",
            "websiteAllowed": False,
        },
        {
            "order": 2,
            "id": "apple-native-platform",
            "label": "Apple Native Platform",
            "platformFocus": ["macos", "ios"],
            "languagePolicy": "apple_languages_only",
            "languages": apple_languages,
            "domains": [
                "mobile-development",
                "ux-ui-engineering",
                "product-design-and-creative-systems",
                "software-architecture-and-patterns",
                "test-engineering",
                "sustainable-software",
            ],
            "primaryArtifacts": list(APPLE_ALLOWED_SOURCE_ROOTS),
            "qualityGates": [
                "swift test",
                "check:seis-platform-kernel",
                "check:seis-platform-language-policy",
                "check:seis-platform-development-tracks",
            ],
            "doneSignal": "Apple work stays Swift, SwiftUI, Objective-C, Playground, and AppleScript only.",
            "websiteAllowed": False,
        },
        {
            "order": 3,
            "id": "windows-non-apple-polyglot",
            "label": "Windows Non-Apple Polyglot",
            "platformFocus": ["windows"],
            "languagePolicy": "windows_polyglot_except_apple_only",
            "languages": windows_languages,
            "domains": [
                "full-stack-engineering",
                "database-management",
                "version-control-systems",
                "cloud-computing",
                "cybersecurity",
                "devops-and-system-management",
                "sre-and-observability",
                "test-engineering",
            ],
            "primaryArtifacts": [
                "packages/seis_windows_csharp/",
                "polyglot/powershell/",
                "polyglot/windows/",
            ],
            "qualityGates": [
                "check:seis-platform-kernel",
                "check:seis-platform-development-tracks",
                "check:seis-nonjs-kernel",
            ],
            "doneSignal": "Windows keeps broad non-Apple language coverage and excludes Apple-only surfaces.",
            "websiteAllowed": False,
        },
        {
            "order": 4,
            "id": "engineering-data-security-core",
            "label": "Engineering Data Security Core",
            "platformFocus": ["backend", "data", "cloud", "security", "ops"],
            "languagePolicy": "non_js_core_first",
            "languages": ["Python", "Go", "Rust", "SQL", "CUE", "Rego", "C#", "PowerShell"],
            "domains": [
                "data-engineering-and-analytics",
                "data-science",
                "big-data-engineering",
                "database-management",
                "cloud-computing",
                "cybersecurity",
                "devops-and-system-management",
                "sre-and-observability",
                "software-metrics-and-measurement",
            ],
            "primaryArtifacts": [
                "packages/seis_kernel_go/",
                "polyglot/sql/",
                "polyglot/rego/",
                "polyglot/cue/",
                "reports/",
            ],
            "qualityGates": [
                "go test ./...",
                "check:cloud-environment",
                "check:seis-nonjs-kernel",
                "check:workspace",
            ],
            "doneSignal": "Data, security, cloud, DevOps, metrics, and SRE gates are encoded before release UI work.",
            "websiteAllowed": False,
        },
        {
            "order": 5,
            "id": "design-mobile-game-robotics-lab",
            "label": "Design Mobile Game Robotics Lab",
            "platformFocus": ["design", "mobile", "game", "robotics", "ai_research"],
            "languagePolicy": "platform_specific_with_non_js_prototypes_first",
            "languages": ["SwiftUI", "Kotlin", "Dart", "Python", "Rust", "Go", "C++"],
            "domains": [
                "web-development",
                "mobile-development",
                "game-development",
                "nlp-and-computer-vision",
                "quantum-programming",
                "low-code-no-code-platforms",
                "ux-ui-engineering",
                "product-design-and-creative-systems",
                "autonomous-vehicles-and-robotics",
            ],
            "primaryArtifacts": [
                "content/development/fullstack-language-matrix.json",
                "reports/fullstack-language-matrix.json",
                "polyglot/windows/",
                "polyglot/swiftui-playground/",
            ],
            "qualityGates": [
                "check:fullstack-language-matrix",
                "check:mobile-ergonomics",
                "check:motion-evidence",
                "check:language-distribution",
            ],
            "doneSignal": "Design, mobile, game, robotics, NLP/CV, and quantum work is planned before the website release surface.",
            "websiteAllowed": False,
        },
        {
            "order": 6,
            "id": "governance-metrics-refactoring",
            "label": "Governance Metrics Refactoring",
            "platformFocus": ["governance", "quality", "architecture", "delivery"],
            "languagePolicy": "checked_policy_artifacts_only",
            "languages": ["Python", "CUE", "Rego", "SQL", "Markdown"],
            "domains": [
                "ai-ethics-and-data-governance",
                "compiler-and-language-engineering",
                "requirements-engineering",
                "agile-project-management",
                "software-development-lifecycle",
                "software-metrics-and-measurement",
                "reverse-engineering",
                "software-refactoring",
                "software-architecture-and-patterns",
                "sustainable-software",
            ],
            "primaryArtifacts": [
                "content/development/seis-execution-runway.json",
                "content/development/seis-execution-packages.json",
                "reports/seis-execution-runway.json",
            ],
            "qualityGates": [
                "check:seis-execution-runway",
                "check:seis-execution-packages",
                "check:seis-active-mission-board",
                "check:workspace",
            ],
            "doneSignal": "Governance, metrics, refactoring, reverse engineering, and SDLC checks are stable.",
            "websiteAllowed": False,
        },
        {
            "order": 7,
            "id": "website-final-release-surface",
            "label": "Website Final Release Surface",
            "platformFocus": ["web_release", "publish", "documentation"],
            "languagePolicy": "web_compatibility_only_after_platform_gates",
            "languages": ["HTML", "CSS", "compatibility JavaScript only"],
            "domains": ["web-development", "software-development-lifecycle", "sre-and-observability"],
            "primaryArtifacts": ["release/web/", "content/site/", "reports/automation-refresh-seis-surface-summary.json"],
            "qualityGates": [
                "check:release-sync",
                "check:mobile-ergonomics",
                "check:motion-evidence",
                "check:cloud-environment",
                "check:workspace",
            ],
            "dependsOn": [
                "seis-agent-foundation",
                "apple-native-platform",
                "windows-non-apple-polyglot",
                "engineering-data-security-core",
                "design-mobile-game-robotics-lab",
                "governance-metrics-refactoring",
            ],
            "doneSignal": "Website changes happen only after platform gates pass and release sync is deterministic.",
            "websiteAllowed": True,
        },
    ]

    covered_domains = sorted({domain for phase in phases for domain in phase["domains"]})
    if domain_ids:
        covered_domains = sorted(set(covered_domains) | set(domain_ids))

    quality_gates = sorted({gate for phase in phases for gate in phase["qualityGates"]})
    return {
        "version": 1,
        "id": "seis-platform-priority-atlas",
        "mode": "platform_core_first_website_last",
        "summary": {
            "phaseCount": len(phases),
            "websiteFinalPhase": phases[-1]["websiteAllowed"] is True,
            "appleLanguageCount": len(apple_languages),
            "windowsLanguageCoverageCount": len(windows_languages),
            "domainCoverageCount": len(covered_domains),
            "requiredDomainCount": len(domain_ids),
            "qualityGateCount": len(quality_gates),
            "keyDomainCount": len(KEY_DOMAIN_IDS),
        },
        "rules": {
            "websiteIsFinalSurface": True,
            "runtimeInstallPolicy": "requirement_led_only",
            "installAllLanguages": False,
            "seisPrimaryAgent": True,
            "appleLanguageSurfaces": apple_languages,
            "windowsExcludedLanguageSurfaces": sorted(WINDOWS_EXCLUDED_LANGUAGE_SURFACES),
            "windowsLanguageSurfaces": windows_languages,
        },
        "domainCoverage": covered_domains,
        "keyDomains": list(KEY_DOMAIN_IDS),
        "phases": phases,
    }


def validate_platform_priority_atlas(atlas: dict[str, Any], required_domain_ids: list[str] | tuple[str, ...] | None = None) -> list[str]:
    failures: list[str] = []
    phases = atlas.get("phases", [])
    required_domains = set(required_domain_ids or [])

    if atlas.get("mode") != "platform_core_first_website_last":
        failures.append("priority atlas mode must keep platform core first and website last")
    if atlas.get("rules", {}).get("websiteIsFinalSurface") is not True:
        failures.append("priority atlas must mark website as the final surface")
    if atlas.get("rules", {}).get("runtimeInstallPolicy") != "requirement_led_only":
        failures.append("priority atlas must keep runtime installs requirement-led")
    if atlas.get("rules", {}).get("installAllLanguages") is not False:
        failures.append("priority atlas must not require installing all languages")

    if len(phases) < 7:
        failures.append("priority atlas must include at least seven ordered phases")
    orders = [phase.get("order") for phase in phases]
    if orders != list(range(1, len(phases) + 1)):
        failures.append("priority atlas phase order must be sequential")

    if phases:
        if phases[-1].get("websiteAllowed") is not True or "website" not in phases[-1].get("id", ""):
            failures.append("website must be allowed only in the final website phase")
        for phase in phases[:-1]:
            if phase.get("websiteAllowed") is not False:
                failures.append(f"{phase.get('id', '<unknown>')} must keep websiteAllowed false")

    phase_by_id = {phase.get("id"): phase for phase in phases}
    apple_phase = phase_by_id.get("apple-native-platform", {})
    if set(apple_phase.get("languages", [])) != apple_language_set():
        failures.append("Apple priority phase must be exactly Swift, SwiftUI, Objective-C, Playground, and AppleScript")

    windows_phase = phase_by_id.get("windows-non-apple-polyglot", {})
    windows_languages = set(windows_phase.get("languages", []))
    forbidden = windows_languages & set(WINDOWS_EXCLUDED_LANGUAGE_SURFACES)
    if forbidden:
        failures.append(f"Windows priority phase must not include Apple-only languages: {', '.join(sorted(forbidden))}")
    if len(windows_languages) < 40:
        failures.append("Windows priority phase must keep broad non-Apple polyglot coverage")

    covered_domains = set(atlas.get("domainCoverage", []))
    if required_domains and not required_domains.issubset(covered_domains):
        missing = required_domains - covered_domains
        failures.append(f"priority atlas missing required domains: {', '.join(sorted(missing))}")
    if len(covered_domains) < 38:
        failures.append("priority atlas must preserve broad SEIS domain coverage")

    for key_domain in KEY_DOMAIN_IDS:
        if key_domain not in covered_domains:
            failures.append(f"priority atlas missing key SEIS domain: {key_domain}")

    summary = atlas.get("summary", {})
    if summary.get("phaseCount") != len(phases):
        failures.append("priority atlas summary phase count must match phases")
    if summary.get("websiteFinalPhase") is not True:
        failures.append("priority atlas summary must mark websiteFinalPhase true")
    if summary.get("windowsLanguageCoverageCount", 0) < 40:
        failures.append("priority atlas summary must preserve broad Windows language coverage")

    return failures
