import {
  ecosystemEnvironmentSourceExports,
  ecosystemPlatformSourceMirror,
  ecosystemSidePanelReceipts,
  ecosystemSourceOutputManifest,
  ecosystemSourceProofCards
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
      sidePanelReceipts: ecosystemSidePanelReceipts.length,
      platformSourceMirror: ecosystemPlatformSourceMirror.length,
      proofCards: ecosystemSourceProofCards.length,
      environmentExports: ecosystemEnvironmentSourceExports.length
    },
    platformSourceMirror: ecosystemPlatformSourceMirror,
    sidePanelReceipts: ecosystemSidePanelReceipts,
    proofCards: ecosystemSourceProofCards,
    environmentExports: ecosystemEnvironmentSourceExports
  });
}
