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

__all__ = [
    "CAPABILITY_DOMAINS",
    "REQUIRED_DOMAIN_IDS",
    "DomainRouter",
    "PLATFORM_SURFACES",
    "PLUGIN_GROUPS",
    "build_capability_contract",
    "build_platform_contract",
    "build_plugin_inventory_contract",
    "render_mermaid_flow",
    "validate_capability_contract",
]
