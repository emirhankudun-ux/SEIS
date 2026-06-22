import {
  ecosystemAggressiveDevelopmentLanes,
  ecosystemAiHelperLanes,
  ecosystemOutputSurfaces,
  ecosystemSourceExportIndex,
  ecosystemSourceActionBoard,
  ecosystemSourceActionPackets,
  ecosystemSourceQualityGates,
  ecosystemSourceRunbook,
  ecosystemSourceExecutionReceipts,
  ecosystemSourceExecutionDigest,
  ecosystemSourceContinuationBrief,
  ecosystemSourceExecutionQueue,
  ecosystemSourceSignalMap,
  ecosystemSourceTotal,
  polyglotSourceContracts
} from "@seis/content";
import { getDeploymentTargets, getMcpReadinessSnapshot, getRuntimeSnapshot } from "@seis/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  const runtime = getRuntimeSnapshot();
  const mcp = getMcpReadinessSnapshot();
  const deploymentTargets = getDeploymentTargets();
  const readyDeploymentTargets = deploymentTargets.filter((target) => target.status === "active" || target.status === "configured");
  const blockedDeploymentTargets = deploymentTargets.filter((target) => target.status === "needs_credentials" || target.status === "unavailable");
  const githubTarget = deploymentTargets.find((target) => target.id === "github-origin");

  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      posture: "Aggressive local development is allowed; credentialed deploys, payments, messages and external writes remain explicit-approval tasks.",
      github: "The active Codex branch is the recoverable GitHub source of truth before production hosting.",
      sources: "Plugin sources are routed through governed sprint lanes, not invoked in bulk."
    },
    summary: {
      sourceCount: ecosystemSourceTotal,
      aggressiveDevelopmentLanes: ecosystemAggressiveDevelopmentLanes.length,
      aiHelperLanes: ecosystemAiHelperLanes.length,
      outputSurfaces: ecosystemOutputSurfaces.length,
      sourceExportItems: ecosystemSourceExportIndex.length,
      sourceActionBoardColumns: ecosystemSourceActionBoard.columns.length,
      sourceActionPackets: ecosystemSourceActionPackets.length,
      sourceQualityGates: ecosystemSourceQualityGates.length,
      sourceRunbookSteps: ecosystemSourceRunbook.steps.length,
      sourceExecutionReceipts: ecosystemSourceExecutionReceipts.length,
      sourceExecutionDigestMetrics: ecosystemSourceExecutionDigest.metrics.length,
      sourceContinuationBriefReadPaths: ecosystemSourceContinuationBrief.readFirstPaths.length,
      sourceExecutionQueue: ecosystemSourceExecutionQueue.length,
      sourceSignalMap: ecosystemSourceSignalMap.length,
      polyglotSourceContracts: polyglotSourceContracts.length,
      runtimeReady: runtime.summary.active + runtime.summary.configured,
      runtimeTotal: runtime.summary.total,
      deploymentReady: readyDeploymentTargets.length,
      deploymentTotal: deploymentTargets.length,
      deploymentBlocked: blockedDeploymentTargets.length,
      mcpReady: mcp.summary.active + mcp.summary.configured,
      mcpTotal: mcp.summary.total
    },
    githubTarget,
    runtime,
    mcp,
    deploymentTargets,
    aggressiveDevelopmentLanes: ecosystemAggressiveDevelopmentLanes,
    aiHelperLanes: ecosystemAiHelperLanes,
    sourceActionBoard: ecosystemSourceActionBoard,
    sourceActionPackets: ecosystemSourceActionPackets,
    sourceQualityGates: ecosystemSourceQualityGates,
    sourceRunbook: ecosystemSourceRunbook,
    sourceExecutionReceipts: ecosystemSourceExecutionReceipts,
    sourceExecutionDigest: ecosystemSourceExecutionDigest,
    sourceContinuationBrief: ecosystemSourceContinuationBrief,
    sourceExecutionQueue: ecosystemSourceExecutionQueue,
    sourceSignalMap: ecosystemSourceSignalMap,
    exportIndex: ecosystemSourceExportIndex
  });
}
