import {
  ecosystemSourceActionBoard,
  ecosystemSourceActionPackets,
  ecosystemSourceOutputManifest,
  ecosystemSourceQualityGates,
  ecosystemSourceTotal
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      board: "Action board is derived from local packet metadata and does not execute provider calls.",
      guardrail: ecosystemSourceActionBoard.operatingRule
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      actionPackets: ecosystemSourceActionPackets.length,
      boardColumns: ecosystemSourceActionBoard.columns.length,
      boardModes: ecosystemSourceActionBoard.modes.length,
      qualityGates: ecosystemSourceQualityGates.length,
      nextPacketId: ecosystemSourceActionBoard.nextPacketId
    },
    board: ecosystemSourceActionBoard,
    qualityGateHandoff: "/api/source-quality-gates",
    packets: ecosystemSourceActionPackets
  });
}
