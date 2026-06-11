"""SEIS universal capability kernel."""

from .capabilities import (
    CAPABILITY_DOMAINS,
    REQUIRED_DOMAIN_IDS,
    DomainRouter,
    build_capability_contract,
    render_mermaid_flow,
    validate_capability_contract,
)
from .plugin_inventory import PLUGIN_GROUPS, build_plugin_inventory_contract
from .platform_matrix import PLATFORM_SURFACES, build_platform_contract
from .platform_language_policy import build_platform_language_policy, validate_platform_language_policy
from .platform_development_tracks import build_platform_development_tracks, validate_platform_development_tracks
from .platform_priority_atlas import build_platform_priority_atlas, validate_platform_priority_atlas
from .active_board import build_active_mission_board, validate_active_mission_board
from .execution_packages import build_execution_packages, validate_execution_packages
from .execution_runway import build_execution_runway, validate_execution_runway
from .long_horizon import build_long_horizon_plan, validate_long_horizon_plan

__all__ = [
    "CAPABILITY_DOMAINS",
    "REQUIRED_DOMAIN_IDS",
    "DomainRouter",
    "PLATFORM_SURFACES",
    "PLUGIN_GROUPS",
    "build_capability_contract",
    "build_active_mission_board",
    "build_platform_contract",
    "build_platform_development_tracks",
    "build_platform_language_policy",
    "build_platform_priority_atlas",
    "build_plugin_inventory_contract",
    "build_execution_packages",
    "build_execution_runway",
    "build_long_horizon_plan",
    "render_mermaid_flow",
    "validate_capability_contract",
    "validate_platform_language_policy",
    "validate_platform_development_tracks",
    "validate_platform_priority_atlas",
    "validate_active_mission_board",
    "validate_long_horizon_plan",
    "validate_execution_packages",
    "validate_execution_runway",
]
