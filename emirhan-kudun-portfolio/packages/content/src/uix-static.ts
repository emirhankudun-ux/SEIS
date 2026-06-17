import uixRoutes from "./uix-static/routes.json";

export type UixStaticSurface = {
  id: "uix-web";
  name: string;
  sourcePath: string;
  appPath: string;
  contentModules: string[];
  routeCount: number;
  localeCount: number;
  notes: string;
};

export const uixStaticSurface: UixStaticSurface = {
  id: "uix-web",
  name: "UIX Web Static Surface",
  sourcePath: "UIX-Apps/apps/web",
  appPath: "apps/uix-web",
  contentModules: [
    "packages/content/src/uix-static/artworks.js",
    "packages/content/src/uix-static/locales.js",
    "packages/content/src/uix-static/routes.json"
  ],
  routeCount: uixRoutes.routes.length,
  localeCount: 7,
  notes: "Migrated into the SEIS Concept branch as a static workspace plus typed content bridge."
};

export const uixStaticRoutes = uixRoutes;
