import {
  ecosystemSourceActionBoard,
  ecosystemSourceExecutionReceipts,
  ecosystemSourceOutputManifest,
  ecosystemSourceQualityGates,
  ecosystemSourceRunbook,
  ecosystemSourceTotal
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      runbook: "Runbook steps order local source work and validation; they do not execute external provider actions.",
      guardrail: ecosystemSourceRunbook.operatingRule
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      runbookSteps: ecosystemSourceRunbook.steps.length,
      receipts: ecosystemSourceExecutionReceipts.length,
      executionReceipts: ecosystemSourceExecutionReceipts.length,
      boardColumns: ecosystemSourceActionBoard.columns.length,
      qualityGates: ecosystemSourceQualityGates.length,
      leadingPacketId: ecosystemSourceRunbook.packetId
    },
    receiptHandoff: "/api/source-execution-receipts",
    runbook: ecosystemSourceRunbook,
    qualityGates: ecosystemSourceQualityGates
  });
}
