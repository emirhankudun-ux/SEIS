import {
  ecosystemSourceContinuationBrief,
  ecosystemSourceExecutionDigest,
  ecosystemSourceOutputManifest,
  ecosystemSourceRunbook,
  ecosystemSourceTotal
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      continuation: "Brief coordinates the next local source pass and does not perform provider actions.",
      guardrail: ecosystemSourceRunbook.operatingRule
    },
    summary: {
      totalSources: ecosystemSourceTotal,
      readFirstPaths: ecosystemSourceContinuationBrief.readFirstPaths.length,
      validationCommands: ecosystemSourceContinuationBrief.validationCommands.length,
      leadingPacketId: ecosystemSourceContinuationBrief.packetId,
      digestMetrics: ecosystemSourceExecutionDigest.metrics.length
    },
    digest: ecosystemSourceExecutionDigest,
    continuationBrief: ecosystemSourceContinuationBrief
  });
}
