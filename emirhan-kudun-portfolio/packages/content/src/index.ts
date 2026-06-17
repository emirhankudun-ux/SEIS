import rawContent from "./data.json";
export * from "./plugin-sources";
export * from "./uix-static";

export const locales = ["tr", "en", "fr", "it", "de"] as const;

export type Locale = (typeof locales)[number];
export type LocalizedDictionary = Record<string, string>;

export type SiteMeta = {
  domain: string;
  author: string;
  email: string;
  city: string;
  country: string;
  title: string;
  description: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  summary: string;
};

export type WorkItem = {
  id: string;
  tag: string;
  title: string;
  summary: string;
  impact: string;
};

export type DrawingItem = {
  id: string;
  title: string;
  src: string;
  tone: string;
  category: "graphite" | "color";
  archiveRole: string;
  sortIndex: number;
  featured?: boolean;
};

export type BehanceVisualItem = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  image: string;
  href: string;
  embedUrl: string;
  embedCode: string;
  notes: string;
  featured?: boolean;
};

export type BehanceEmbedItem = {
  id: string;
  projectId: string;
  title: string;
  url: string;
  embedUrl: string;
  aspectRatio: string;
  category: string;
  notes: string;
  embedCode: string;
  featured?: boolean;
};

export type PortfolioIndexSource = "behance" | "drawing" | "work";

export type PortfolioIndexItem = {
  id: string;
  source: PortfolioIndexSource;
  title: string;
  category: string;
  summary: string;
  href: string;
  image?: string;
  featured?: boolean;
  external?: boolean;
  sortIndex: number;
};

export type PortfolioCollectionItem = {
  id: string;
  title: string;
  summary: string;
  tone: string;
  href: string;
  images: string[];
  proof: string[];
  accent: "gold" | "teal" | "ivory";
};

export type SoftwareLanguageItem = {
  id: string;
  name: string;
  layer: string;
  role: string;
  status: "active" | "planned";
};

export type SocialLinkItem = {
  id: string;
  label: string;
  href: string;
  mark: string;
};

export type QuestionAnswerItem = {
  id: string;
  question: string;
  answer: string;
};

export type EvolutionTrackItem = {
  id: string;
  title: string;
  timeframe: string;
  status: "live" | "next" | "planned";
  summary: string;
  focus: string[];
};

export type QualityStandardItem = {
  id: string;
  title: string;
  metric: string;
  summary: string;
};

export type SeisContent = {
  locales: Locale[];
  site: SiteMeta;
  dictionary: Record<Locale, LocalizedDictionary>;
  services: ServiceItem[];
  works: WorkItem[];
  drawings: DrawingItem[];
  behanceVisuals: BehanceVisualItem[];
  behanceEmbeds: BehanceEmbedItem[];
  portfolioCollections: PortfolioCollectionItem[];
  softwareLanguages: SoftwareLanguageItem[];
  socialLinks: SocialLinkItem[];
  contactQa: QuestionAnswerItem[];
  evolutionTracks: EvolutionTrackItem[];
  qualityStandards: QualityStandardItem[];
};

export const content = rawContent as SeisContent;

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && (locales as readonly string[]).includes(value));
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : "tr";
}

export function getDictionary(locale: string | undefined | null): LocalizedDictionary {
  return content.dictionary[resolveLocale(locale)];
}

export const siteMeta = content.site;
export const services = content.services;
export const works = content.works;
export const drawings = content.drawings;
export const behanceVisuals = content.behanceVisuals;
export const behanceEmbeds = content.behanceEmbeds;
export const portfolioCollections = content.portfolioCollections;
export const softwareLanguages = content.softwareLanguages;
export const socialLinks = content.socialLinks;
export const contactQa = content.contactQa;
export const evolutionTracks = content.evolutionTracks;
export const qualityStandards = content.qualityStandards;

export function buildPortfolioIndex(): PortfolioIndexItem[] {
  const behanceItems = behanceVisuals.map((item, index): PortfolioIndexItem => ({
    id: `behance-${item.id}`,
    source: "behance",
    title: item.title,
    category: item.category,
    summary: item.notes,
    href: item.href,
    image: item.image,
    featured: item.featured,
    external: true,
    sortIndex: index + 1
  }));

  const drawingItems = drawings.map((drawing): PortfolioIndexItem => ({
    id: `drawing-${drawing.id}`,
    source: "drawing",
    title: drawing.title,
    category: drawing.category,
    summary: `${drawing.tone} / ${drawing.archiveRole}`,
    href: "/drawings",
    image: drawing.src,
    featured: drawing.featured,
    sortIndex: 100 + drawing.sortIndex
  }));

  const workItems = works.map((work, index): PortfolioIndexItem => ({
    id: `work-${work.id}`,
    source: "work",
    title: work.title,
    category: work.tag,
    summary: `${work.summary} ${work.impact}`,
    href: `/portfolio/${work.id}`,
    featured: index < 4,
    sortIndex: 200 + index
  }));

  return [...behanceItems, ...drawingItems, ...workItems].sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    return a.sortIndex - b.sortIndex;
  });
}

export const portfolioIndex = buildPortfolioIndex();
