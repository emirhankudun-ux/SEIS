export const SEIS_MOTION_ATTR = "data-motion-mode";
export const SEIS_MOTION_MODES = ["cinematic", "balanced", "reduced"] as const;

export type SeisMotionMode = typeof SEIS_MOTION_MODES[number];

export const SEIS_CAPABILITY_ACTIVATION_MODES = [
  "active",
  "guarded",
  "blocked-until-target",
  "candidate",
] as const;

export type CapabilityActivationMode = typeof SEIS_CAPABILITY_ACTIVATION_MODES[number];

export const SEIS_RISK_LEVELS = ["low", "medium", "high"] as const;

export type RiskLevel = typeof SEIS_RISK_LEVELS[number];

export function motionModeLabel(mode: SeisMotionMode): string {
  return {
    cinematic: "Cinematic",
    balanced: "Balanced",
    reduced: "Reduced",
  }[mode];
}

export function activationBadgeVariant(
  mode: CapabilityActivationMode
): "success" | "warning" | "danger" | "neutral" {
  return {
    active: "success",
    guarded: "warning",
    "blocked-until-target": "danger",
    candidate: "neutral",
  }[mode] as "success" | "warning" | "danger" | "neutral";
}
