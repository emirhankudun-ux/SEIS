import {
  ecosystemSourceActionPackets,
  ecosystemSourceExecutionQueue,
  ecosystemSourceOutputManifest,
  ecosystemSourceSignalMap,
  ecosystemSourceTotal,
  type EcosystemSourceExecutionPriority
} from "@seis/content";

export const dynamic = "force-dynamic";

const priorityOrder: EcosystemSourceExecutionPriority[] = ["now", "next", "blocked", "backlog"];

export function GET() {
  const prioritySummary = priorityOrder.reduce(
    (summary, priority) => ({
      ...summary,
      [priority]: ecosystemSourceExecutionQueue.filter((item) => item.priority === priority).length
    }),
    {} as Record<EcosystemSourceExecutionPriority, number>
  );

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      execution: "Queue is derived from local metadata and does not execute provider calls.",
      guardrail: "Use one source family at a time; credentialed writes remain explicit-approval tasks."
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      signalMapItems: ecosystemSourceSignalMap.length,
      queueItems: ecosystemSourceExecutionQueue.length,
      actionPackets: ecosystemSourceActionPackets.length,
      prioritySummary
    },
    queue: ecosystemSourceExecutionQueue,
    actionPacketHandoff: "/api/source-action-packets"
  });
}
