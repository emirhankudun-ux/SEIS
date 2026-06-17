import {
  ecosystemConnectionStateSummary,
  ecosystemInstallPolicySummary,
  ecosystemSourceGroups,
  ecosystemSourceExecutionQueue,
  ecosystemSourceOutputManifest,
  ecosystemSourceSignalMap,
  ecosystemSourceTotal
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  const totals = ecosystemSourceSignalMap.reduce(
    (summary, item) => ({
      invoked: summary.invoked + item.invoked,
      callable: summary.callable + item.callable,
      blocked: summary.blocked + item.blocked,
      manifestOnly: summary.manifestOnly + item.manifestOnly,
      authGated: summary.authGated + item.authGated,
      connectionGated: summary.connectionGated + item.connectionGated,
      futureOnly: summary.futureOnly + item.futureOnly
    }),
    {
      invoked: 0,
      callable: 0,
      blocked: 0,
      manifestOnly: 0,
      authGated: 0,
      connectionGated: 0,
      futureOnly: 0
    }
  );

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      sidePanel: ecosystemSourceOutputManifest.platformSidePanelPolicy,
      signalMap: "Derived from local source metadata; no provider is called by this endpoint."
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      groups: ecosystemSourceGroups.length,
      signalMapItems: ecosystemSourceSignalMap.length,
      queueItems: ecosystemSourceExecutionQueue.length,
      connectionStates: ecosystemConnectionStateSummary,
      installPolicies: ecosystemInstallPolicySummary,
      totals
    },
    signalMap: ecosystemSourceSignalMap
  });
}
