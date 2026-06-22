"""Version metadata for SSH-AI.

Only version-facing metadata belongs here. Runtime host, SSH alias, daemon port,
and bridge port are intentionally configured elsewhere.
"""

SSH_AI_VERSION = "0.4"
SSH_AI_DISPLAY_VERSION = f"v{SSH_AI_VERSION}"
SSH_AI_USER_AGENT = f"SSH-AI/{SSH_AI_VERSION}"
SSH_AI_RELEASE_TRACK = "5-year-lts"
SSH_AI_RELEASE_CHANNEL = "long-term-support"
SSH_AI_RELEASE_DATE = "2026-06-19"
SSH_AI_SUPPORT_HORIZON_YEARS = 5
SSH_AI_SUPPORT_UNTIL = "2031-06-19"
SSH_AI_RELEASE_NAME = f"SSH-AI {SSH_AI_DISPLAY_VERSION} 5-Year LTS"
