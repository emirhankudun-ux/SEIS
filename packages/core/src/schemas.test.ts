import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GapRegisterSchema,
  TrustedMarketplaceIntakeSchema,
  GapSchema,
  MarketplaceChannelSchema,
} from "./schemas";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../../../");

function readJSON(relPath: string) {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf8"));
}

// ── GapRegisterSchema ────────────────────────────────────────────────────────

describe("GapRegisterSchema", () => {
  it("validates the live data/gap-closure-register.json file", () => {
    const raw = readJSON("data/gap-closure-register.json");
    const result = GapRegisterSchema.safeParse(raw);
    expect(result.success, result.error?.message).toBe(true);
  });

  it("requires summary.gaps to match the actual gap count", () => {
    const invalid = {
      gaps: [
        { id: "g1", status: "open", priority: "high", nextAction: "fix", closureMetric: "done", qualityCommands: ["cmd"] },
      ],
      summary: { gaps: 99 },
    };
    expect(GapRegisterSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects gaps missing required fields", () => {
    const bad = { id: "g1", status: "open" };
    expect(GapSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects gaps with empty qualityCommands array", () => {
    const bad = {
      id: "g1", status: "open", priority: "high",
      nextAction: "fix", closureMetric: "done", qualityCommands: [],
    };
    expect(GapSchema.safeParse(bad).success).toBe(false);
  });
});

// ── TrustedMarketplaceIntakeSchema ───────────────────────────────────────────

describe("TrustedMarketplaceIntakeSchema", () => {
  it("validates the live content/development/trusted-marketplace-intake.json file", () => {
    const raw = readJSON("content/development/trusted-marketplace-intake.json");
    const result = TrustedMarketplaceIntakeSchema.safeParse(raw);
    expect(result.success, result.error?.message).toBe(true);
  });

  it("requires at least one marketplace channel", () => {
    const invalid = { marketplaceChannels: [], trustedSourceShortlist: [{ id: "x", publisher: "p", family: "f", activationPosture: "a" }] };
    expect(TrustedMarketplaceIntakeSchema.safeParse(invalid).success).toBe(false);
  });

  it("requires at least one trusted source", () => {
    const invalid = {
      marketplaceChannels: [{ id: "c", label: "C", status: "active" }],
      trustedSourceShortlist: [],
    };
    expect(TrustedMarketplaceIntakeSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects a channel missing the label field", () => {
    const bad = { id: "x", status: "active" };
    expect(MarketplaceChannelSchema.safeParse(bad).success).toBe(false);
  });
});
