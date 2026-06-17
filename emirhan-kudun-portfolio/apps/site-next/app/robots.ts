import type { MetadataRoute } from "next";

import { siteMeta } from "@seis/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"]
    },
    sitemap: `${siteMeta.domain.replace(/\/$/, "")}/sitemap.xml`
  };
}
