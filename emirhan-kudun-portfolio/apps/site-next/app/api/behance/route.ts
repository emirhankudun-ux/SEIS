import { behanceEmbeds, behanceVisuals } from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    profile: "https://www.behance.net/emirhankudun",
    visuals: behanceVisuals,
    embeds: behanceEmbeds
  });
}
