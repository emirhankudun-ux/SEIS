import {
  ecosystemInstallPolicySummary,
  ecosystemPluginInstallPlan,
  ecosystemSidePanelReceipts,
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
      installPlanSteps: ecosystemPluginInstallPlan.length,
      installPolicies: ecosystemInstallPolicySummary,
      readinessLanes: ecosystemSourceReadinessMatrix.length,
      sidePanelReceipts: ecosystemSidePanelReceipts.length
    },
    installPlan: ecosystemPluginInstallPlan,
    installPolicies: ecosystemInstallPolicySummary,
    readinessMatrix: ecosystemSourceReadinessMatrix,
    sidePanelReceipts: ecosystemSidePanelReceipts
  });
}
