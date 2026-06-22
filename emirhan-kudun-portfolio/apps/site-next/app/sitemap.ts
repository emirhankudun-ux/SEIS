import type { MetadataRoute } from "next";

import { siteMeta, works } from "@seis/content";

const staticRoutes = [
  "",
  "/portfolio",
  "/drawings",
  "/sources",
  "/lab",
  "/ops",
  "/contact"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = siteMeta.domain.replace(/\/$/, "");
  const routes = [
    ...staticRoutes,
    ...works.map((work) => `/portfolio/${work.id}`)
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.72
  }));
}
