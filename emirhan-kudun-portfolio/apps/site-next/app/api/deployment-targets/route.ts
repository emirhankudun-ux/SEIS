import { getDeploymentTargets } from "@seis/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  const targets = getDeploymentTargets();

  return Response.json({
    total: targets.length,
    targets
  });
}
