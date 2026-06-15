import { z } from "zod";

export const GapSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.string().min(1),
  priority: z.string().min(1),
  surface: z.string().min(1),
  impact: z.string().min(1),
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

export const ConnectorCapabilitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  activationMode: z.enum(["active", "guarded", "blocked-until-target", "candidate"]),
  risk: z.enum(["low", "medium", "high"]),
});

export type Gap = z.infer<typeof GapSchema>;
export type GapRegister = z.infer<typeof GapRegisterSchema>;
export type MarketplaceChannel = z.infer<typeof MarketplaceChannelSchema>;
export type TrustedSource = z.infer<typeof TrustedSourceSchema>;
