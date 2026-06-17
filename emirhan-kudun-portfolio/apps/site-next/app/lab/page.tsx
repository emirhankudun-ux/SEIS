import type { Metadata } from "next";

import { PageSurface } from "../../components/page-surface";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lab",
  description: "Long-term portfolio development lab for Behance, drawings, cinematic motion, contact intake and publish readiness.",
  path: "/lab"
});

export default function LabPage() {
  return <PageSurface mode="lab" />;
}
