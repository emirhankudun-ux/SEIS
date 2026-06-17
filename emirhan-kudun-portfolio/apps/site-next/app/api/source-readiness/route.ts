import {
  ecosystemSourceActivationPlan,
  ecosystemConnectionAttempts,
  ecosystemConnectionStateSummary,
  ecosystemEnvironmentSourceExports,
  ecosystemInstallPolicySummary,
  ecosystemPluginInstallPlan,
  ecosystemSidePanelReceipts,
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
      readinessLanes: ecosystemSourceReadinessMatrix.length,
      activationPlanSteps: ecosystemSourceActivationPlan.length,
      installPlanSteps: ecosystemPluginInstallPlan.length,
      environmentExports: ecosystemEnvironmentSourceExports.length,
      sidePanelReceipts: ecosystemSidePanelReceipts.length,
      deliveryArtifacts: ecosystemSourceDeliveryArtifacts.length,
      connectionStates: ecosystemConnectionStateSummary,
      installPolicies: ecosystemInstallPolicySummary,
      connectionAttempts: ecosystemConnectionAttempts.length
    },
    readinessMatrix: ecosystemSourceReadinessMatrix,
    activationPlan: ecosystemSourceActivationPlan,
    installPlan: ecosystemPluginInstallPlan,
    environmentExports: ecosystemEnvironmentSourceExports,
    sidePanelReceipts: ecosystemSidePanelReceipts,
    deliveryArtifacts: ecosystemSourceDeliveryArtifacts,
    connectionEvidence: ecosystemConnectionAttempts
  });
}
