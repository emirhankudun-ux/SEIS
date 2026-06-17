import {
  ecosystemSourceOutputManifest,
  ecosystemSourceProofCards,
  ecosystemSourceTotal
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      sidePanel: ecosystemSourceOutputManifest.platformSidePanelPolicy
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      proofCards: ecosystemSourceProofCards.length
    },
    proofCards: ecosystemSourceProofCards
  });
}
