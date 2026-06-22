import { evolutionTracks, qualityStandards } from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    tracks: evolutionTracks,
    qualityStandards
  });
}
