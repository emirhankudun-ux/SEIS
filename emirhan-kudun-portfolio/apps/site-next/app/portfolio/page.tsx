import type { Metadata } from "next";

import { PageSurface } from "../../components/page-surface";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolyo",
  description: "Emirhan Kudun Behance isleri, cizimler ve secili gorsel sistemler.",
  path: "/portfolio"
});

export default function PortfolioPage() {
  return <PageSurface mode="portfolio" />;
}
