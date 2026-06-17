import {
  ecosystemConnectionAttempts,
  ecosystemConnectionStateSummary,
  ecosystemInstallPolicySummary,
  ecosystemSourceFlatList,
  ecosystemSourceOutputManifest
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  const evidenceSourceIds = new Set(ecosystemConnectionAttempts.map((attempt) => attempt.sourceId));
  const evidenceSources = ecosystemSourceFlatList.filter((source) => evidenceSourceIds.has(source.id));

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: ecosystemSourceOutputManifest.platformSidePanelPolicy,
    summary: {
      connectionAttempts: ecosystemConnectionAttempts.length,
      connectionStates: ecosystemConnectionStateSummary,
      installPolicies: ecosystemInstallPolicySummary,
      evidenceSources: evidenceSources.length
    },
    connectionAttempts: ecosystemConnectionAttempts,
    evidenceSources
  });
}
