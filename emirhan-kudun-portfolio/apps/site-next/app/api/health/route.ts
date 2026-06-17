import { getDeploymentTargets, getMcpReadinessSnapshot, getSourceArchives, getRuntimeSnapshot } from "@seis/runtime";
import { getDecisionQuestionCount } from "@seis/content/decision-questions";
import {
  ecosystemAggressiveDevelopmentLanes,
  ecosystemAiHelperLanes,
  ecosystemSourceActivationPlan,
  ecosystemConnectionAttempts,
  ecosystemConnectionStateSummary,
  ecosystemEnvironmentSourceExports,
  ecosystemInstallPolicySummary,
  ecosystemOutputSurfaces,
  ecosystemPlatformSourceMirror,
  ecosystemPluginInstallPlan,
  ecosystemPluginRefs,
  ecosystemSidePanelReceipts,
  ecosystemSourceDeliveryArtifacts,
  ecosystemSourceExportIndex,
  ecosystemSourceGroups,
  ecosystemSourceKindSummary,
  ecosystemSourceProofCards,
  ecosystemSourceReadinessMatrix,
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

export const dynamic = "force-dynamic";

export function GET() {
  const snapshot = getRuntimeSnapshot();
  const mcp = getMcpReadinessSnapshot();
  const archives = getSourceArchives();
  const deploymentTargets = getDeploymentTargets();

  return Response.json({
    ok: true,
    service: "seis-premium-portfolio",
    generatedAt: snapshot.generatedAt,
    summary: snapshot.summary,
    mcpSummary: mcp.summary,
    sourceArchiveCount: archives.length,
    ecosystemSourceCount: ecosystemSourceTotal,
    ecosystemUniquePluginRefCount: ecosystemPluginRefs.length,
    ecosystemSourceKindSummary,
    ecosystemConnectionStateSummary,
    ecosystemInstallPolicySummary,
    ecosystemConnectionAttemptCount: ecosystemConnectionAttempts.length,
    ecosystemSourceGroupCount: ecosystemSourceGroups.length,
    ecosystemReadinessLaneCount: ecosystemSourceReadinessMatrix.length,
    ecosystemActivationPlanStepCount: ecosystemSourceActivationPlan.length,
    ecosystemAggressiveDevelopmentLaneCount: ecosystemAggressiveDevelopmentLanes.length,
    ecosystemPluginInstallPlanStepCount: ecosystemPluginInstallPlan.length,
    ecosystemEnvironmentExportCount: ecosystemEnvironmentSourceExports.length,
    ecosystemSidePanelReceiptCount: ecosystemSidePanelReceipts.length,
    ecosystemPlatformSourceMirrorCount: ecosystemPlatformSourceMirror.length,
    ecosystemSourceProofCardCount: ecosystemSourceProofCards.length,
    ecosystemSourceActionBoardColumnCount: ecosystemSourceActionBoard.columns.length,
    ecosystemSourceActionPacketCount: ecosystemSourceActionPackets.length,
    ecosystemSourceQualityGateCount: ecosystemSourceQualityGates.length,
    ecosystemSourceRunbookStepCount: ecosystemSourceRunbook.steps.length,
    ecosystemSourceExecutionReceiptCount: ecosystemSourceExecutionReceipts.length,
    ecosystemSourceExecutionDigestMetricCount: ecosystemSourceExecutionDigest.metrics.length,
    ecosystemSourceContinuationBriefReadPathCount: ecosystemSourceContinuationBrief.readFirstPaths.length,
    ecosystemSourceExecutionQueueCount: ecosystemSourceExecutionQueue.length,
    ecosystemSourceSignalMapCount: ecosystemSourceSignalMap.length,
    ecosystemAiHelperLaneCount: ecosystemAiHelperLanes.length,
    ecosystemSourceExportIndexCount: ecosystemSourceExportIndex.length,
    ecosystemDeliveryArtifactCount: ecosystemSourceDeliveryArtifacts.length,
    ecosystemOutputSurfaceCount: ecosystemOutputSurfaces.length,
    polyglotSourceContractCount: polyglotSourceContracts.length,
    deploymentTargetCount: deploymentTargets.length,
    decisionQuestionCount: getDecisionQuestionCount()
  });
}
