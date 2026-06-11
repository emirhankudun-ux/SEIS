"""Plugin inventory coverage for the SEIS universal capability kernel."""

from __future__ import annotations

from collections import Counter
from typing import Any


PLUGIN_GROUPS: dict[str, tuple[str, ...]] = {
    "design": (
        "Canva",
        "Remotion",
        "BioRender",
        "HyperFrames by HeyGen",
        "HeyGen",
        "Shutterstock",
        "Picsart",
        "Fal",
    ),
    "developer-tools": (
        "Hugging Face",
        "Netlify",
        "Game Studio",
        "Superpowers",
        "CircleCI",
        "Cloudflare",
        "Sentry",
        "Build iOS Apps",
        "Build macOS Apps",
        "Build Web Apps",
        "Build Web Data Visualization",
        "Test Android Apps",
        "Expo",
        "CodeRabbit",
        "Neon Postgres",
        "Plugin Eval",
        "Cloudinary",
        "Hostinger",
        "MarcoPolo",
        "Quicknode",
        "SendGrid",
        "Statsig",
        "Vantage",
        "YepCode",
        "Render",
        "Temporal",
        "Supabase",
        "Twilio Developer Kit",
        "Datadog (Preview)",
        "Convex",
        "Replit",
        "Lovable",
        "Wix",
        "Base44",
        "Shopify",
        "MagicPath",
    ),
    "productivity-ops-business": (
        "Documents",
        "Atlassian Rovo",
        "Jam",
        "Stripe",
        "Box",
        "Deepnote",
        "Amplitude",
        "Attio",
        "Brand24",
        "Brex",
        "Carta CRM",
        "Channel99",
        "Circleback",
        "ClickUp",
        "Common Room",
        "Conductor",
        "Coupler.io",
        "Coveo",
        "Demandbase",
        "Docket",
        "Domotz (Preview)",
        "Dovetail",
        "Egnyte",
        "Fireflies",
        "Fyxer",
        "Granola",
        "Happenstance",
        "Help Scout",
        "HighLevel",
        "HubSpot",
        "KeyBid Puls",
        "Mem",
        "Monday.com",
        "MotherDuck",
        "Network Solutions",
        "Omni Analytics",
        "Otter.ai",
        "Pipedrive",
        "Pylon",
        "Ranked AI",
        "Razorpay",
        "Read AI",
        "Responsive",
        "Semrush",
        "SignNow",
        "SkyWatch",
        "Streak",
        "Teamwork.com",
        "United Rentals",
        "Waldo",
        "Windsor.ai",
        "Asana",
        "Zoom",
        "Similarweb",
        "Datasite",
        "ZoomInfo",
        "Docusign",
        "Mixpanel",
        "Mixpanel Headless",
        "Close",
        "Apollo",
        "Meticulate",
        "ThoughtSpot",
        "Clay",
        "Calendly",
        "Rox",
        "HG Insights",
        "Airtable",
        "Outreach",
        "QuickBooks",
        "Intercom",
        "PostHog",
        "Metabase",
        "Actively",
        "Zoho",
        "Alation",
        "Superhuman Mail",
    ),
    "research-finance-legal-science": (
        "LaTeX",
        "Life Science Research",
        "Zotero",
        "Alpaca",
        "Binance",
        "CB Insights",
        "Cube",
        "Daloopa",
        "D&B Finance Analytics",
        "Dow Jones Factiva",
        "GovTribe",
        "Moody's",
        "Morningstar",
        "MT Newswires",
        "Particl Market Research",
        "PitchBook",
        "PolicyNote",
        "Quartr",
        "Readwise",
        "Scite",
        "Taxdown",
        "Third Bridge",
        "Tinman AI",
        "LSEG",
        "S&P Global",
        "FactSet",
        "Aiera",
        "Midpage",
        "Chronograph",
        "Fiscal AI",
        "Hebbia",
        "Life Sciences NGS Analysis",
    ),
    "security": ("Codex Security",),
}


DOMAIN_PLUGIN_HINTS: dict[str, tuple[str, ...]] = {
    "algorithms-and-flowcharts": ("Build Web Data Visualization", "Documents", "Superpowers"),
    "mathematics-foundations": ("LaTeX", "Data Analytics", "Deepnote", "Scite"),
    "computer-science-foundations": ("Superpowers", "Codex Security", "Documents"),
    "web-development": ("Build Web Apps", "Browser", "Vercel", "Netlify", "Cloudflare"),
    "mobile-development": ("Build iOS Apps", "Test Android Apps", "Expo"),
    "game-development": ("Game Studio", "Fal", "Shutterstock", "Cloudinary"),
    "full-stack-engineering": ("Build Web Apps", "Supabase", "Neon Postgres", "Convex", "Render"),
    "data-engineering-and-analytics": ("Data Analytics", "MotherDuck", "Metabase", "ThoughtSpot", "Deepnote"),
    "data-science": ("Hugging Face", "Deepnote", "Data Analytics", "Mixpanel Headless"),
    "artificial-intelligence": ("OpenAI Developers", "Hugging Face", "Plugin Eval", "Fal"),
    "ai-agent-engineering": ("SEIS", "Superpowers", "GitHub", "OpenAI Developers", "YepCode"),
    "llm-orchestration": ("OpenAI Developers", "Hugging Face", "Plugin Eval"),
    "mcp-skills-plugins": ("Plugin Eval", "GitHub", "Airtable", "Supabase", "SEIS"),
    "database-management": ("Supabase", "Neon Postgres", "MotherDuck", "Airtable", "Metabase"),
    "version-control-systems": ("GitHub", "CodeRabbit", "CircleCI", "Atlassian Rovo"),
    "cloud-computing": ("Cloudflare", "Vercel", "Netlify", "Render", "Hostinger", "Vantage"),
    "cybersecurity": ("Codex Security", "Sentry", "Datadog (Preview)"),
    "devops-and-system-management": ("CircleCI", "Cloudflare", "Vantage", "Temporal", "Datadog (Preview)"),
    "test-engineering": ("CodeRabbit", "Browser", "Test Android Apps", "Sentry"),
    "software-architecture-and-patterns": ("Documents", "Figma", "Build Web Data Visualization", "Superpowers"),
    "big-data-engineering": ("MotherDuck", "Deepnote", "Alation", "Cube"),
    "nlp-and-computer-vision": ("Hugging Face", "Fal", "Cloudinary", "Shutterstock", "Picsart"),
    "quantum-programming": ("LaTeX", "Scite", "Zotero"),
    "sustainable-software": ("Vantage", "Cloudflare", "Build Web Apps"),
    "low-code-no-code-platforms": ("Base44", "Lovable", "Replit", "Wix", "Hostinger"),
    "ux-ui-engineering": ("Canva", "Figma", "Product Design", "Build Web Apps", "MagicPath"),
    "product-design-and-creative-systems": ("Canva", "Creative Production", "Fal", "HeyGen", "Shutterstock", "Remotion"),
    "autonomous-vehicles-and-robotics": ("NVIDIA", "Build Web Data Visualization", "Documents"),
    "ai-ethics-and-data-governance": ("Codex Security", "Data Analytics", "Documents", "Alation"),
    "compiler-and-language-engineering": ("Superpowers", "OpenAI Developers", "Documents"),
    "requirements-engineering": ("Documents", "Atlassian Rovo", "Asana", "ClickUp", "Monday.com"),
    "agile-project-management": ("Asana", "ClickUp", "Atlassian Rovo", "Monday.com", "Teamwork.com"),
    "software-development-lifecycle": ("GitHub", "CodeRabbit", "CircleCI", "Superpowers"),
    "software-metrics-and-measurement": ("Data Analytics", "PostHog", "Mixpanel", "Amplitude", "Statsig"),
    "sre-and-observability": ("Datadog (Preview)", "Sentry", "Vantage", "Domotz (Preview)"),
    "reverse-engineering": ("Codex Security", "CodeRabbit", "Jam", "Documents"),
    "software-refactoring": ("CodeRabbit", "Superpowers", "GitHub", "Codex Security"),
    "formal-methods": ("LaTeX", "Codex Security", "Scite", "Documents"),
}


def all_plugins() -> list[str]:
    plugins: set[str] = set()
    for names in PLUGIN_GROUPS.values():
        plugins.update(names)
    return sorted(plugins)


def plugin_group_for(name: str) -> str:
    for group, names in PLUGIN_GROUPS.items():
        if name in names:
            return group
    return "external-or-session"


def build_plugin_inventory_contract(domain_ids: list[str]) -> dict[str, Any]:
    coverage: list[dict[str, Any]] = []
    group_counter: Counter[str] = Counter()
    seen_plugins: set[str] = set()

    for domain_id in domain_ids:
        plugins = sorted(set(DOMAIN_PLUGIN_HINTS.get(domain_id, ())))
        for plugin in plugins:
            seen_plugins.add(plugin)
            group_counter[plugin_group_for(plugin)] += 1
        coverage.append(
            {
                "domainId": domain_id,
                "plugins": plugins,
                "pluginCount": len(plugins),
                "groups": sorted({plugin_group_for(plugin) for plugin in plugins}),
            }
        )

    return {
        "source": "screenshots-and-enabled-plugin-inventory",
        "groupCount": len(PLUGIN_GROUPS),
        "pluginCount": len(all_plugins()),
        "coveredPluginCount": len(seen_plugins),
        "groups": [{"id": group, "pluginCount": len(names), "plugins": list(names)} for group, names in PLUGIN_GROUPS.items()],
        "coverageByDomain": coverage,
        "coverageByGroup": dict(sorted(group_counter.items())),
        "minimumDomainPluginCount": min((item["pluginCount"] for item in coverage), default=0),
    }
