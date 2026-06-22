import { drawings } from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  const counts = drawings.reduce(
    (summary, drawing) => {
      summary.total += 1;
      summary[drawing.category] += 1;
      if (drawing.featured) summary.featured += 1;
      return summary;
    },
    { total: 0, featured: 0, graphite: 0, color: 0 }
  );

  return Response.json({
    counts,
    drawings
  });
}
