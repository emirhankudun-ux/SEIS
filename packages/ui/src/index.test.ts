import { describe, it, expect } from "vitest";
import {
  SEIS_MOTION_ATTR,
  SEIS_MOTION_MODES,
  SEIS_CAPABILITY_ACTIVATION_MODES,
  SEIS_RISK_LEVELS,
  motionModeLabel,
  activationBadgeVariant,
} from "./index";

describe("SEIS_MOTION_ATTR", () => {
  it("is the expected DOM data attribute name", () => {
    expect(SEIS_MOTION_ATTR).toBe("data-motion-mode");
  });
});

describe("SEIS_MOTION_MODES", () => {
  it("contains exactly cinematic, balanced, reduced", () => {
    expect(SEIS_MOTION_MODES).toEqual(["cinematic", "balanced", "reduced"]);
  });
});

describe("SEIS_CAPABILITY_ACTIVATION_MODES", () => {
  it("contains the four expected modes", () => {
    expect(SEIS_CAPABILITY_ACTIVATION_MODES).toContain("active");
    expect(SEIS_CAPABILITY_ACTIVATION_MODES).toContain("guarded");
    expect(SEIS_CAPABILITY_ACTIVATION_MODES).toContain("blocked-until-target");
    expect(SEIS_CAPABILITY_ACTIVATION_MODES).toContain("candidate");
  });
});

describe("motionModeLabel", () => {
  it("returns a capitalised label for every mode", () => {
    expect(motionModeLabel("cinematic")).toBe("Cinematic");
    expect(motionModeLabel("balanced")).toBe("Balanced");
    expect(motionModeLabel("reduced")).toBe("Reduced");
  });
});

describe("activationBadgeVariant", () => {
  it("maps active → success", () => {
    expect(activationBadgeVariant("active")).toBe("success");
  });

  it("maps guarded → warning", () => {
    expect(activationBadgeVariant("guarded")).toBe("warning");
  });

  it("maps blocked-until-target → danger", () => {
    expect(activationBadgeVariant("blocked-until-target")).toBe("danger");
  });

  it("maps candidate → neutral", () => {
    expect(activationBadgeVariant("candidate")).toBe("neutral");
  });

  it("covers all activation modes without gaps", () => {
    for (const mode of SEIS_CAPABILITY_ACTIVATION_MODES) {
      expect(() => activationBadgeVariant(mode)).not.toThrow();
    }
  });
});

describe("SEIS_RISK_LEVELS", () => {
  it("contains low, medium, high", () => {
    expect(SEIS_RISK_LEVELS).toContain("low");
    expect(SEIS_RISK_LEVELS).toContain("medium");
    expect(SEIS_RISK_LEVELS).toContain("high");
  });
});
