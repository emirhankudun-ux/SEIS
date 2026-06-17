import {
  ecosystemSourceActionBoard,
  ecosystemSourceActionPackets,
  ecosystemSourceExecutionQueue,
  ecosystemSourceOutputManifest,
  ecosystemSourceTotal,
  type EcosystemSourceActionPacketMode,
  type EcosystemSourceExecutionPriority
} from "@seis/content";

export const dynamic = "force-dynamic";

const priorityOrder: EcosystemSourceExecutionPriority[] = ["now", "next", "blocked", "backlog"];
const packetModeOrder: EcosystemSourceActionPacketMode[] = [
  "command",
  "build",
  "creative",
  "growth",
  "ops",
  "quality",
  "research",
  "backlog"
];

export function GET() {
  const prioritySummary = priorityOrder.reduce(
    (summary, priority) => ({
      ...summary,
      [priority]: ecosystemSourceActionPackets.filter((packet) => packet.priority === priority).length
    }),
    {} as Record<EcosystemSourceExecutionPriority, number>
  );

  const packetModeSummary = packetModeOrder.reduce(
    (summary, packetMode) => ({
      ...summary,
      [packetMode]: ecosystemSourceActionPackets.filter((packet) => packet.packetMode === packetMode).length
    }),
    {} as Record<EcosystemSourceActionPacketMode, number>
  );

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      packet: "Action packets are derived from local queue metadata and do not execute provider calls.",
      guardrail: "Use one packet at a time; auth-gated external helpers remain explicit task approvals."
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      queueItems: ecosystemSourceExecutionQueue.length,
      actionPackets: ecosystemSourceActionPackets.length,
      boardColumns: ecosystemSourceActionBoard.columns.length,
      nextPacketId: ecosystemSourceActionBoard.nextPacketId,
      prioritySummary,
      packetModeSummary
    },
    boardHandoff: "/api/source-action-board",
    packets: ecosystemSourceActionPackets
  });
}
