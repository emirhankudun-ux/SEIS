import type { Metadata } from "next";

import { PageSurface } from "../../components/page-surface";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Iletisim",
  description: "Emirhan Kudun ile tasarim ve dijital sistem calismalari icin iletisim.",
  path: "/contact"
});

export default function ContactPage() {
  return <PageSurface mode="contact" />;
}
