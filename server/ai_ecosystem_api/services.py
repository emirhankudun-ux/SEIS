"""Read-only ecosystem aggregation for the SEIS AI FastAPI layer."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .models import REQUIRED_SYSTEMS, SAFETY_BOUNDARIES, EcosystemModule


class EcosystemService:
    """Aggregates existing SEIS AI contracts without mutating providers, SSH, or plugins."""

    def __init__(self, repo_root: Path | None = None) -> None:
        self.repo_root = repo_root or Path(__file__).resolve().parents[2]

    def _path(self, relative_path: str) -> Path:
        return self.repo_root / relative_path

    def _read_json(self, relative_path: str) -> dict[str, Any]:
        path = self._path(relative_path)
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def health(self) -> dict[str, Any]:
        required_paths = [
            "data/seis-ai-unified-integration-fabric.json",
            "data/seis-ai-activation-matrix.json",
            "data/seis-ai-website-feature-fabric.json",
            "data/seis-installed-ai-collaboration.json",
            "data/seis-operational-goal-tracker.json",
            "packages/model-router/fixtures/model-router-route-contracts.json",
            "packages/data/fixtures/knowledge-source-classification.json",
            "data/ssh-hardening-operation-contract.json",
        ]
        missing = [path for path in required_paths if not self._path(path).exists()]
        return {
            "status": "ready" if not missing else "degraded",
            "mode": "local-contract-backed",
            "missing": missing,
            "sourceContracts": required_paths,
            "boundaries": [boundary.to_dict() for boundary in SAFETY_BOUNDARIES],
        }

    def overview(self) -> dict[str, Any]:
        unified = self._read_json("data/seis-ai-unified-integration-fabric.json")
        activation = self._read_json("data/seis-ai-activation-matrix.json")
        website = self._read_json("data/seis-ai-website-feature-fabric.json")
        goals = self._read_json("data/seis-operational-goal-tracker.json")
        installed_ai = self._read_json("data/seis-installed-ai-collaboration.json")

        modules = [
            EcosystemModule("ai-core", "SEIS AI Core", "local-fixture-backed", ["apps/seis-ai-demo/contracts/seis-ai-command-core-integration.json"]),
            EcosystemModule("agent-orchestrator", "Autonomous Agent Orchestrator", unified.get("status", "unknown"), ["data/seis-ai-unified-integration-fabric.json"]),
            EcosystemModule("plugin-registry", "Plugin Registry", "embedded-lane-registry", ["data/seis-specialist-plugins-2026-06-12.json"]),
            EcosystemModule("plugin-feeding", "Plugin Feeding System", "metadata-plan-review", ["data/seis-ai-activation-matrix.json"]),
            EcosystemModule("ssh-connector", "SSH Connector Layer", "approval-gated", ["data/ssh-hardening-operation-contract.json"]),
            EcosystemModule("website-fabric", "AI Website System", website.get("status", "unknown"), ["data/seis-ai-website-feature-fabric.json"]),
            EcosystemModule("goal-tracking", "Goal Tracking System", goals.get("status", "unknown"), ["data/seis-operational-goal-tracker.json"]),
            EcosystemModule("memory", "Memory System", "metadata-source-classification", ["packages/data/fixtures/knowledge-source-classification.json"]),
            EcosystemModule("model-connectors", "Local and Remote AI Model Connectors", installed_ai.get("status", "unknown"), ["packages/model-router/fixtures/model-router-route-contracts.json"]),
        ]

        return {
            "status": "local-contract-backed",
            "requiredSystems": REQUIRED_SYSTEMS,
            "modules": [module.to_dict() for module in modules],
            "counts": {
                "agents": len(unified.get("agentCatalog", [])),
                "pluginLanes": len(unified.get("pluginFeedLanes", [])),
                "websites": len(website.get("websiteFeatureSurfaces", [])),
                "goals": len(goals.get("activeTracks", [])),
                "installedAIHelpers": len(installed_ai.get("helpers", [])),
                "blockedLiveClaims": len(website.get("singlePromptRequest", {}).get("blockedClaims", [])),
            },
            "activationMode": activation.get("mode"),
        }

    def agents(self) -> dict[str, Any]:
        unified = self._read_json("data/seis-ai-unified-integration-fabric.json")
        activation_by_id = {
            item.get("agentId"): item
            for item in self._read_json("data/seis-ai-activation-matrix.json").get("subAgentActivations", [])
        }
        agents = []
        for agent in unified.get("agentCatalog", []):
            activation = activation_by_id.get(agent.get("id"), {})
            agents.append({
                "id": agent.get("id"),
                "displayName": agent.get("displayName"),
                "purpose": agent.get("purpose"),
                "allowedTools": agent.get("allowedTools", []),
                "deniedTools": agent.get("deniedTools", []),
                "pluginFeeds": activation.get("pluginFeeds", []),
                "websiteSurfaces": activation.get("aiWebsiteSurfaces", []),
                "approvalPolicy": agent.get("approvalPolicy"),
                "status": agent.get("enabledState"),
            })
        return {"agents": agents}

    def plugins(self) -> dict[str, Any]:
        unified = self._read_json("data/seis-ai-unified-integration-fabric.json")
        return {
            "mode": "single-seis-agent-embedded-lanes",
            "pluginLanes": unified.get("pluginFeedLanes", []),
            "boundaries": [
                "metadata and plan feed only",
                "no silent permission expansion",
                "no live SSH or deployment execution",
            ],
        }

    def websites(self) -> dict[str, Any]:
        website = self._read_json("data/seis-ai-website-feature-fabric.json")
        return {
            "mode": website.get("mode"),
            "surfaces": website.get("websiteFeatureSurfaces", []),
            "crossSurfaceRoutes": website.get("crossSurfaceRoutes", []),
            "blockedClaims": website.get("singlePromptRequest", {}).get("blockedClaims", []),
        }

    def goals(self) -> dict[str, Any]:
        tracker = self._read_json("data/seis-operational-goal-tracker.json")
        return {
            "status": tracker.get("status"),
            "requiredFields": tracker.get("requiredFields", []),
            "tracks": tracker.get("activeTracks", []),
        }

    def memory(self) -> dict[str, Any]:
        knowledge = self._read_json("packages/data/fixtures/knowledge-source-classification.json")
        return {
            "status": "metadata-source-classification",
            "categories": [
                "user-goals",
                "project-decisions",
                "architecture-decisions",
                "agent-results",
                "plugin-outputs",
                "website-generation-history",
                "code-change-history",
            ],
            "sources": knowledge.get("knowledgeSources", []),
            "nonClaims": knowledge.get("nonClaims", []),
        }

    def ssh(self) -> dict[str, Any]:
        contract = self._read_json("data/ssh-hardening-operation-contract.json")
        activation = self._read_json("data/seis-ai-activation-matrix.json").get("sshActivation", {})
        return {
            "status": contract.get("status"),
            "allowedModes": activation.get("allowedModes", []),
            "blockedWithoutApproval": activation.get("blockedWithoutApproval", []),
            "requiredHumanInputs": activation.get("requiredHumanInputs", []),
            "credentialHandling": contract.get("credentialHandling", {}),
            "modeIsolation": contract.get("modeIsolation", {}),
        }

    def model_connectors(self) -> dict[str, Any]:
        routes = self._read_json("packages/model-router/fixtures/model-router-route-contracts.json")
        installed_ai = self._read_json("data/seis-installed-ai-collaboration.json")
        return {
            "status": routes.get("status"),
            "routeModes": routes.get("routeModes", []),
            "routes": routes.get("routes", []),
            "installedHelpers": installed_ai.get("helpers", []),
            "boundaries": installed_ai.get("nonClaimBoundaries", []),
        }

    def self_evolution(self) -> dict[str, Any]:
        contract = self._read_json("data/seis-ai-self-evolution-contract.json")
        goals = self._read_json("data/seis-operational-goal-tracker.json")
        return {
            "id": contract.get("id"),
            "status": contract.get("status"),
            "mode": contract.get("mode"),
            "cycle": contract.get("improvementCycle", []),
            "engines": contract.get("engines", []),
            "modelOrchestration": contract.get("modelOrchestration", {}),
            "knowledgeGraphs": contract.get("knowledgeGraphs", []),
            "activeGoalSignals": [
                {
                    "id": track.get("id"),
                    "priority": track.get("priority"),
                    "status": track.get("status"),
                    "validationStatus": track.get("validationStatus"),
                    "nextStep": track.get("nextStep"),
                }
                for track in goals.get("activeTracks", [])
            ],
            "humanApprovalRequiredBefore": contract.get("humanApprovalRequiredBefore", []),
        }

    def knowledge_graphs(self) -> dict[str, Any]:
        contract = self._read_json("data/seis-ai-self-evolution-contract.json")
        knowledge = self._read_json("packages/data/fixtures/knowledge-source-classification.json")
        return {
            "graphs": contract.get("knowledgeGraphs", []),
            "sourceClasses": knowledge.get("sourceClasses", []),
            "retrievalStates": knowledge.get("retrievalStates", []),
            "privacyModes": knowledge.get("privacyModes", []),
            "sources": knowledge.get("knowledgeSources", []),
        }

    def readiness(self) -> dict[str, Any]:
        health = self.health()
        overview = self.overview()
        self_evolution = self.self_evolution()
        return {
            "readyToRunLocalContracts": health["status"] == "ready",
            "health": health,
            "overviewCounts": overview["counts"],
            "selfEvolutionMode": self_evolution["mode"],
            "selfEvolutionEngines": len(self_evolution["engines"]),
            "nextRequiredBeforeLive": [
                "install FastAPI requirements in an isolated environment",
                "provide approved provider credentials through environment variables only",
                "approve SSH target profile, host fingerprint, public key, rollback plan, and maintenance window before live mutation",
                "approve deployment target and rollback policy",
            ],
        }
