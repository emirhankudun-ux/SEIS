import {
  ecosystemConnectionAttempts,
  ecosystemPlatformSourceMirror,
  ecosystemSourceOutputManifest
} from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    policy: {
      source: ecosystemSourceOutputManifest.policy,
      sidePanel: ecosystemSourceOutputManifest.platformSidePanelPolicy,
      connectionMirror: "The side-panel screenshot is treated as an observed platform view; the portfolio APIs remain the complete source mirror."
    },
    summary: {
      mirrorLanes: ecosystemPlatformSourceMirror.length,
      observedPanelIcons: ecosystemPlatformSourceMirror.find((item) => item.mirrorMode === "observed_panel")?.count || 0,
      connectionAttempts: ecosystemConnectionAttempts.length
    },
    connectionMirror: ecosystemPlatformSourceMirror,
    connectionAttempts: ecosystemConnectionAttempts
  });
}
