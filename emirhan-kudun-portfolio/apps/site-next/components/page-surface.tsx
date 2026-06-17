import Link from "next/link";

import {
  behanceEmbeds,
  behanceVisuals,
  drawings,
  evolutionTracks,
  getDictionary,
  portfolioCollections,
  portfolioIndex,
  qualityStandards,
  services,
  works
} from "@seis/content";

import { BehanceEmbedPanel } from "./behance-embed-panel";
import { BehanceEmbedSpotlight } from "./behance-embed-spotlight";
import { BehanceOrbitalDeck } from "./behance-orbital-deck";
import { BehanceVisualGrid } from "./behance-visual-grid";
import { BriefIntakeForm } from "./brief-intake-form";
import { CinematicProofBelt } from "./cinematic-proof-belt";
import { CinematicShowcaseScene } from "./cinematic-showcase-scene";
import { ContactHub } from "./contact-hub";
import { DrawingArchive } from "./drawing-archive";
import { EcosystemSourceConsole } from "./ecosystem-source-console";
import { EvolutionRoadmap } from "./evolution-roadmap";
import { PortfolioCollections } from "./portfolio-collections";
import { PortfolioDiscoveryFlow } from "./portfolio-discovery-flow";
import { PortfolioIndex } from "./portfolio-index";

type PageMode = "portfolio" | "drawings" | "lab" | "ops" | "contact";

const navItems = [
  ["/", "navHome", "home"],
  ["/portfolio", "navPortfolio", "portfolio"],
  ["/portfolio#portfolio-behance", "navBehance", "behance"],
  ["/drawings", "navDrawings", "drawings"],
  ["/sources", "sourceEnvironmentNav", "sources"],
  ["/lab", "navLab", "lab"],
  ["/ops", "navOps", "ops"],
  ["/contact", "navContact", "contact"]
] as const;

export function PageSurface({ mode }: { mode: PageMode }) {
  const dict = getDictionary("tr");
  const featuredDrawings = drawings.filter((drawing) => drawing.featured).slice(0, 8);
  const resolvePortfolioCollectionHref = (href: string) => {
    if (mode !== "portfolio") return href;
    if (href === "#behance") return "#portfolio-behance";
    if (href === "#drawings") return "/drawings";
    if (href === "#studio" || href === "#services") return "/";
    return href;
  };
  const portfolioStats = [
    { label: dict.portfolioMetricBehance, value: behanceVisuals.length.toString(), detail: dict.behanceVisualsEyebrow },
    { label: dict.portfolioMetricDrawings, value: drawings.length.toString(), detail: dict.drawingArchiveEyebrow },
    { label: dict.portfolioMetricCollections, value: portfolioCollections.length.toString(), detail: dict.portfolioCollectionsEyebrow },
    { label: dict.portfolioMetricEmbeds, value: behanceEmbeds.length.toString(), detail: dict.behanceEmbedEyebrow }
  ];
  const motionPortfolioCards = [
    ...behanceVisuals.filter((item) => item.featured).slice(0, 3).map((item) => ({
      id: `behance-${item.id}`,
      image: item.image,
      title: item.title,
      meta: `${dict.portfolioFilterBehance} / ${item.category}`,
      source: "behance"
    })),
    ...featuredDrawings.slice(0, 3).map((drawing) => ({
      id: `drawing-${drawing.id}`,
      image: drawing.src,
      title: drawing.title,
      meta: `${dict.portfolioSourceDrawing} / ${drawing.category}`,
      source: "drawing"
    }))
  ];

  return (
    <main className="page-shell" id="page-main-content">
      <a href="#page-content" className="skip-link">{dict.skipContent}</a>
      <nav className="top-nav" aria-label={dict.primaryNavigationLabel}>
        <Link href="/" className="brand">
          Emirhan Kudun
        </Link>
        <div className="nav-links">
          {navItems.map(([href, key, itemMode]) => (
            <Link key={href} href={href} aria-current={itemMode === mode ? "page" : undefined}>
              {dict[key] || (key === "sourceEnvironmentNav" ? "Sources" : "Ops")}
            </Link>
          ))}
        </div>
      </nav>

      {mode === "portfolio" && (
        <section className="section page-hero" id="page-content">
          <p className="eyebrow">{dict.portfolioPageEyebrow}</p>
          <h1>{dict.portfolioPageTitle}</h1>
          <div className="portfolio-proof-strip" aria-label={dict.portfolioPageEyebrow}>
            {portfolioStats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                <small>{stat.detail}</small>
              </article>
            ))}
          </div>
          <div className="studio-showcase portfolio-3d-showcase">
            <CinematicShowcaseScene />
            <div className="portfolio-3d-cards" aria-label={dict.portfolioMotionGalleryLabel}>
              {motionPortfolioCards.map((card) => (
                <figure className="portfolio-3d-card" data-source={card.source} key={card.id}>
                  <img src={card.image} alt={`${card.title} - ${card.meta}`} loading="lazy" decoding="async" />
                  <figcaption>
                    <strong>{card.title}</strong>
                    <span>{card.meta}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <CinematicProofBelt dictionary={dict} behanceVisuals={behanceVisuals} drawings={drawings} />
          <BehanceOrbitalDeck dictionary={dict} behanceVisuals={behanceVisuals} drawings={drawings} />
          <BehanceEmbedSpotlight dictionary={dict} embeds={behanceEmbeds} />
          <PortfolioCollections
            dictionary={dict}
            collections={portfolioCollections}
            resolveHref={(collection) => resolvePortfolioCollectionHref(collection.href)}
          />
          <PortfolioDiscoveryFlow
            dictionary={dict}
            behanceVisuals={behanceVisuals}
            drawings={drawings}
            works={works}
            links={{ behance: "#portfolio-behance", drawings: "/drawings", works: "#portfolio-work-cards" }}
          />
          <BehanceVisualGrid dictionary={dict} items={behanceVisuals} id="portfolio-behance" />
          <BehanceEmbedPanel dictionary={dict} embeds={behanceEmbeds} />
          <PortfolioIndex dictionary={dict} items={portfolioIndex} />
          <EcosystemSourceConsole locale="tr" compact />
          <div className="featured-strip" aria-label={dict.featuredDrawingsLabel}>
            {featuredDrawings.map((drawing) => (
              <figure className="featured-drawing" key={drawing.id}>
                <img src={drawing.src} alt={`${drawing.title} - ${drawing.tone}`} loading="lazy" decoding="async" />
                <figcaption>{drawing.title}</figcaption>
              </figure>
            ))}
          </div>
          <div className="card-grid" id="portfolio-work-cards">
            {works.map((work) => (
              <article className="work-card" key={work.id}>
                <p className="kicker">{work.tag}</p>
                <h2>{work.title}</h2>
                <p>{work.summary}</p>
                <span>{work.impact}</span>
                <Link className="text-link" href={`/portfolio/${work.id}`}>{dict.portfolioOpenItem}</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {mode === "drawings" && (
        <section className="section page-hero" id="page-content">
          <p className="eyebrow">{dict.drawingArchiveEyebrow}</p>
          <h1>{dict.drawingPageTitle}</h1>
          <p>{dict.drawingArchiveLead}</p>
          <DrawingArchive dictionary={dict} drawings={drawings} />
        </section>
      )}

      {mode === "lab" && (
        <section className="section page-hero lab-page" id="page-content">
          <EvolutionRoadmap dictionary={dict} tracks={evolutionTracks} standards={qualityStandards} />
        </section>
      )}

      {mode === "contact" && (
        <section className="section page-hero contact-page" id="page-content">
          <p className="eyebrow">{dict.contactEyebrow}</p>
          <h1>{dict.contactTitle}</h1>
          <p className="page-lead">{dict.contactLead}</p>
          <div className="contact-layout">
            <ContactHub dictionary={dict} />
            <BriefIntakeForm dictionary={dict} services={services} />
          </div>
        </section>
      )}
    </main>
  );
}
