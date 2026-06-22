import {
  ecosystemSourceActionBoard,
  ecosystemSourceActionPackets,
  ecosystemSourceOutputManifest,
  ecosystemSourceQualityGates,
  ecosystemSourceRunbook,
  ecosystemSourceTotal
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  const requiredGateCount = ecosystemSourceQualityGates.filter((gate) => gate.priority === "required").length;
  const recommendedGateCount = ecosystemSourceQualityGates.filter((gate) => gate.priority === "recommended").length;

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      gates: "Quality gates are local validation contracts and do not execute provider authentication or external writes.",
      guardrail: ecosystemSourceActionBoard.operatingRule
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      actionPackets: ecosystemSourceActionPackets.length,
      boardColumns: ecosystemSourceActionBoard.columns.length,
      qualityGates: ecosystemSourceQualityGates.length,
      runbookSteps: ecosystemSourceRunbook.steps.length,
      requiredGateCount,
      recommendedGateCount
    },
    runbookHandoff: "/api/source-runbook",
    gates: ecosystemSourceQualityGates
  });
}
