import {
  ecosystemAggressiveDevelopmentLanes,
  ecosystemSourceOutputManifest
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  const laneAssignmentCoverage = ecosystemAggressiveDevelopmentLanes.reduce((total, lane) => total + lane.count, 0);
  const uniqueSourceCoverage = new Set(ecosystemAggressiveDevelopmentLanes.flatMap((lane) => lane.sourceIds)).size;

  const prioritySummary = ecosystemAggressiveDevelopmentLanes.reduce<Record<string, number>>((summary, lane) => {
    summary[lane.priority] = (summary[lane.priority] || 0) + 1;
    return summary;
  }, {});

  const postureSummary = ecosystemAggressiveDevelopmentLanes.reduce<Record<string, number>>((summary, lane) => {
    summary[lane.posture] = (summary[lane.posture] || 0) + 1;
    return summary;
  }, {});

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      aggressiveDevelopment: "Use every connected source through governed sprint lanes, not through blanket external writes.",
      sidePanel: ecosystemSourceOutputManifest.platformSidePanelPolicy
    },
    summary: {
      lanes: ecosystemAggressiveDevelopmentLanes.length,
      prioritySummary,
      postureSummary,
      laneAssignmentCoverage,
      uniqueSourceCoverage,
      callableCoverage: ecosystemAggressiveDevelopmentLanes.reduce((total, lane) => total + lane.callableCount, 0),
      blockedCoverage: ecosystemAggressiveDevelopmentLanes.reduce((total, lane) => total + lane.blockedCount, 0)
    },
    lanes: ecosystemAggressiveDevelopmentLanes
  });
}
