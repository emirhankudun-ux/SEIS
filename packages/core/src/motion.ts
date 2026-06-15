export type MotionMode = "cinematic" | "balanced" | "reduced";

export function getDefaultMotionMode(
  prefersReducedMotion: boolean,
  viewportWidth: number
): MotionMode {
  if (prefersReducedMotion) return "reduced";
  if (viewportWidth < 900) return "balanced";
  return "cinematic";
}

export function resolveMotionMode(
  requested: MotionMode,
  prefersReducedMotion: boolean
): MotionMode {
  return prefersReducedMotion ? "reduced" : requested;
}

export const MOTION_MODES: MotionMode[] = ["cinematic", "balanced", "reduced"];

export function isValidMotionMode(value: string): value is MotionMode {
  return MOTION_MODES.includes(value as MotionMode);
}
