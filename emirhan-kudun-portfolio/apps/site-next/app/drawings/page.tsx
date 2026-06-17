import type { Metadata } from "next";

import { PageSurface } from "../../components/page-surface";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cizimler",
  description: "Emirhan Kudun secili cizim arsivi.",
  path: "/drawings"
});

export default function DrawingsPage() {
  return <PageSurface mode="drawings" />;
}
