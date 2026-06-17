import { getCinematicScenePresets } from "@seis/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    presets: getCinematicScenePresets()
  });
}
