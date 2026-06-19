import { z } from "zod";

export const GapSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  priority: z.string().min(1),
  nextAction: z.string().min(1),
  closureMetric: z.string().min(1),
  qualityCommands: z.array(z.string()).min(1),
});

export const GapRegisterSchema = z.object({
  gaps: z.array(GapSchema),
  summary: z.object({
    gaps: z.number().int().nonnegative(),
  }),
}).refine(
  (data) => data.summary.gaps === data.gaps.length,
  { message: "summary.gaps must equal the number of gap records" }
);

export const MarketplaceChannelSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.string().min(1),
  bestFor: z.array(z.string()).optional(),
  gate: z.string().optional(),
});

export const TrustedSourceSchema = z.object({
  id: z.string().min(1),
  publisher: z.string().min(1),
  family: z.string().min(1),
  activationPosture: z.string().min(1),
});

export const TrustedMarketplaceIntakeSchema = z.object({
  marketplaceChannels: z.array(MarketplaceChannelSchema).min(1),
  trustedSourceShortlist: z.array(TrustedSourceSchema).min(1),
});

export const ConnectorSchema = z.object({
  id: z.string().min(1),
  surface: z.string().min(1),
  status: z.string().min(1),
  activationPolicy: z.string().min(1),
  blockedWithout: z.array(z.string()),
  qualityCommands: z.array(z.string()),
});

export const CapabilityFamilySchema = z.object({
  id: z.string().min(1),
  includes: z.array(z.string()),
  defaultAction: z.string().min(1),
  liveWriteGate: z.union([z.boolean(), z.string()]),
});

export const ConnectorRegistrySchema = z.object({
  version: z.number().int().positive(),
  id: z.string().min(1),
  mode: z.string().min(1),
  policy: z.record(z.unknown()),
  ecosystemActivation: z.record(z.unknown()),
  connectors: z.array(ConnectorSchema).min(1),
  skills: z.array(z.string()),
  capabilityFamilies: z.array(CapabilityFamilySchema),
  automationRules: z.array(z.string()),
});

export type Gap = z.infer<typeof GapSchema>;
export type GapRegister = z.infer<typeof GapRegisterSchema>;
export type MarketplaceChannel = z.infer<typeof MarketplaceChannelSchema>;
export type TrustedSource = z.infer<typeof TrustedSourceSchema>;
export type Connector = z.infer<typeof ConnectorSchema>;
export type CapabilityFamily = z.infer<typeof CapabilityFamilySchema>;
export type ConnectorRegistry = z.infer<typeof ConnectorRegistrySchema>;
