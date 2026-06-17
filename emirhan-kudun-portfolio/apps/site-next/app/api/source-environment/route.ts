import {
  ecosystemEnvironmentSourceExports,
  ecosystemOutputSurfaces,
  ecosystemPluginInstallPlan,
  ecosystemSidePanelReceipts,
  ecosystemSourceDeliveryArtifacts,
  ecosystemSourceOutputManifest
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
      environmentExports: ecosystemEnvironmentSourceExports.length,
      installPlanSteps: ecosystemPluginInstallPlan.length,
      sidePanelReceipts: ecosystemSidePanelReceipts.length,
      deliveryArtifacts: ecosystemSourceDeliveryArtifacts.length,
      outputSurfaces: ecosystemOutputSurfaces.length
    },
    environmentExports: ecosystemEnvironmentSourceExports,
    installPlan: ecosystemPluginInstallPlan,
    sidePanelReceipts: ecosystemSidePanelReceipts,
    deliveryArtifacts: ecosystemSourceDeliveryArtifacts,
    outputSurfaces: ecosystemOutputSurfaces
  });
}
