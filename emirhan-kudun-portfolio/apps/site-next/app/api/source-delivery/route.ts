import {
  ecosystemAggressiveDevelopmentLanes,
  ecosystemAiHelperLanes,
  ecosystemEnvironmentSourceExports,
  ecosystemOutputSurfaces,
  ecosystemPlatformSourceMirror,
  ecosystemPluginInstallPlan,
  ecosystemSidePanelReceipts,
  ecosystemSourceDeliveryArtifacts,
  ecosystemSourceExportIndex,
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
      deliveryArtifacts: ecosystemSourceDeliveryArtifacts.length,
      aggressiveDevelopmentLanes: ecosystemAggressiveDevelopmentLanes.length,
      installPlanSteps: ecosystemPluginInstallPlan.length,
      environmentExports: ecosystemEnvironmentSourceExports.length,
      platformSourceMirror: ecosystemPlatformSourceMirror.length,
      proofCards: ecosystemSourceProofCards.length,
      aiHelperLanes: ecosystemAiHelperLanes.length,
      exportIndexItems: ecosystemSourceExportIndex.length,
      sidePanelReceipts: ecosystemSidePanelReceipts.length,
      outputSurfaces: ecosystemOutputSurfaces.length
    },
    deliveryArtifacts: ecosystemSourceDeliveryArtifacts,
    aggressiveDevelopmentLanes: ecosystemAggressiveDevelopmentLanes,
    installPlan: ecosystemPluginInstallPlan,
    platformSourceMirror: ecosystemPlatformSourceMirror,
    proofCards: ecosystemSourceProofCards,
    aiHelperLanes: ecosystemAiHelperLanes,
    exportIndex: ecosystemSourceExportIndex,
    sidePanelReceipts: ecosystemSidePanelReceipts,
    environmentExports: ecosystemEnvironmentSourceExports,
    outputSurfaces: ecosystemOutputSurfaces
  });
}
