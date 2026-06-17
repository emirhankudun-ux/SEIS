import {
  ecosystemConnectionAttempts,
  ecosystemEnvironmentSourceExports,
  ecosystemPluginInstallPlan,
  ecosystemSidePanelReceipts,
  ecosystemSourceActivationPlan,
  ecosystemSourceDeliveryArtifacts,
  ecosystemSourceOutputManifest,
  ecosystemSourceReadinessMatrix
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
      activationPlanSteps: ecosystemSourceActivationPlan.length,
      installPlanSteps: ecosystemPluginInstallPlan.length,
      readinessLanes: ecosystemSourceReadinessMatrix.length,
      environmentExports: ecosystemEnvironmentSourceExports.length,
      sidePanelReceipts: ecosystemSidePanelReceipts.length,
      deliveryArtifacts: ecosystemSourceDeliveryArtifacts.length,
      connectionAttempts: ecosystemConnectionAttempts.length
    },
    activationPlan: ecosystemSourceActivationPlan,
    installPlan: ecosystemPluginInstallPlan,
    environmentExports: ecosystemEnvironmentSourceExports,
    sidePanelReceipts: ecosystemSidePanelReceipts,
    deliveryArtifacts: ecosystemSourceDeliveryArtifacts,
    readinessMatrix: ecosystemSourceReadinessMatrix,
    connectionEvidence: ecosystemConnectionAttempts
  });
}
