import { portfolioIndex } from "@seis/content";

export const dynamic = "force-dynamic";

type PortfolioIndexCounts = {
  total: number;
  featured: number;
  behance: number;
  drawing: number;
  work: number;
};

export function GET() {
  const counts = portfolioIndex.reduce<PortfolioIndexCounts>(
    (summary, item) => {
      summary.total += 1;
      summary[item.source] += 1;
      if (item.featured) summary.featured += 1;
      return summary;
    },
    { total: 0, featured: 0, behance: 0, drawing: 0, work: 0 }
  );

  return Response.json({
    counts,
    items: portfolioIndex
  });
}
