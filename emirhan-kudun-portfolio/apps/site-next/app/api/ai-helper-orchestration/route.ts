import {
  ecosystemAiHelperLanes,
  ecosystemSourceOutputManifest
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  const statusSummary = ecosystemAiHelperLanes.reduce<Record<string, number>>((summary, lane) => {
    summary[lane.status] = (summary[lane.status] || 0) + 1;
    return summary;
  }, {});

  const helperTypeSummary = ecosystemAiHelperLanes.reduce<Record<string, number>>((summary, lane) => {
    summary[lane.helperType] = (summary[lane.helperType] || 0) + 1;
    return summary;
  }, {});

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      orchestration: "Use every AI helper as a task-routed lane, not as a bulk invocation.",
      sidePanel: ecosystemSourceOutputManifest.platformSidePanelPolicy
    },
    summary: {
      aiHelperLanes: ecosystemAiHelperLanes.length,
      statusSummary,
      helperTypeSummary
    },
    lanes: ecosystemAiHelperLanes
  });
}
