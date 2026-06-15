import { describe, it, expect } from "vitest";
import {
  getDefaultMotionMode,
  resolveMotionMode,
  isValidMotionMode,
  MOTION_MODES,
} from "./motion";

describe("getDefaultMotionMode", () => {
  it("returns 'reduced' when prefers-reduced-motion is active, regardless of viewport", () => {
    expect(getDefaultMotionMode(true, 1920)).toBe("reduced");
    expect(getDefaultMotionMode(true, 320)).toBe("reduced");
  });

  it("returns 'balanced' on narrow viewports without reduced-motion", () => {
    expect(getDefaultMotionMode(false, 375)).toBe("balanced");
    expect(getDefaultMotionMode(false, 899)).toBe("balanced");
  });

  it("returns 'cinematic' on wide viewports without reduced-motion", () => {
    expect(getDefaultMotionMode(false, 900)).toBe("cinematic");
    expect(getDefaultMotionMode(false, 1440)).toBe("cinematic");
  });
});

describe("resolveMotionMode", () => {
  it("overrides any requested mode to 'reduced' when prefers-reduced-motion is active", () => {
    expect(resolveMotionMode("cinematic", true)).toBe("reduced");
    expect(resolveMotionMode("balanced", true)).toBe("reduced");
    expect(resolveMotionMode("reduced", true)).toBe("reduced");
  });

  it("honours the requested mode when prefers-reduced-motion is not active", () => {
    expect(resolveMotionMode("cinematic", false)).toBe("cinematic");
    expect(resolveMotionMode("balanced", false)).toBe("balanced");
    expect(resolveMotionMode("reduced", false)).toBe("reduced");
  });
});

describe("isValidMotionMode", () => {
  it("returns true for every valid mode", () => {
    for (const mode of MOTION_MODES) {
      expect(isValidMotionMode(mode)).toBe(true);
    }
  });

  it("returns false for unknown strings", () => {
    expect(isValidMotionMode("")).toBe(false);
    expect(isValidMotionMode("fast")).toBe(false);
    expect(isValidMotionMode("CINEMATIC")).toBe(false);
  });
});

describe("MOTION_MODES", () => {
  it("contains exactly three modes", () => {
    expect(MOTION_MODES).toHaveLength(3);
    expect(MOTION_MODES).toContain("cinematic");
    expect(MOTION_MODES).toContain("balanced");
    expect(MOTION_MODES).toContain("reduced");
  });
});
