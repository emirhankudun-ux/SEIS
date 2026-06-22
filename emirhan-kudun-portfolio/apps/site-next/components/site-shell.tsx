"use client";

import { useEffect, useMemo, useState } from "react";

import {
  behanceEmbeds,
  behanceVisuals,
  drawings,
  evolutionTracks,
  getDictionary,
  isLocale,
  locales,
  portfolioCollections,
  portfolioIndex,
  qualityStandards,
  resolveLocale,
  services,
  works,
  type Locale
} from "@seis/content";

import { BriefIntakeForm } from "./brief-intake-form";
import { BehanceEmbedPanel } from "./behance-embed-panel";
import { BehanceEmbedSpotlight } from "./behance-embed-spotlight";
import { BehanceOrbitalDeck } from "./behance-orbital-deck";
import { BehanceVisualGrid } from "./behance-visual-grid";
import { CinematicHeroScene } from "./cinematic-hero-scene";
import { CinematicProofBelt } from "./cinematic-proof-belt";
import { CinematicShowcaseScene } from "./cinematic-showcase-scene";
import { ContactHub } from "./contact-hub";
import { DrawingArchive } from "./drawing-archive";
import { EcosystemSourceConsole, getSourceConsoleNavLabel } from "./ecosystem-source-console";
import { EvolutionRoadmap } from "./evolution-roadmap";
import { PortfolioCollections } from "./portfolio-collections";
import { PortfolioDiscoveryFlow } from "./portfolio-discovery-flow";
import { PortfolioIndex } from "./portfolio-index";

type ShellMode = "home";

const nav = [
  ["#home", "navHome", "Home"],
  ["#portfolio", "navPortfolio", "Portfolio"],
  ["#behance", "navBehance", "Behance"],
  ["#drawings", "navDrawings", "Drawings"],
  ["/sources", "sourceEnvironmentNav", "Sources"],
  ["#lab", "navLab", "Lab"],
  ["/ops", "navOps", "Ops"],
  ["#contact", "navContact", "Contact"]
] as const;

export function SiteShell({ mode }: { mode: ShellMode }) {
  const [locale, setLocale] = useState<Locale>("tr");
  const [activeSection, setActiveSection] = useState<(typeof nav)[number][0]>("#home");
  const dictionary = useMemo(() => getDictionary(locale), [locale]);
  const featuredDrawings = useMemo(() => drawings.filter((drawing) => drawing.featured).slice(0, 8), []);
  const portfolioDrawings = useMemo(() => drawings.filter((drawing) => drawing.featured).slice(0, 6), []);
  const studioTiles = useMemo(() => [
    ...behanceVisuals.filter((item) => item.featured).slice(0, 2).map((item) => ({
      id: `behance-${item.id}`,
      image: item.image,
      title: item.title,
      meta: `Behance / ${item.category}`
    })),
    ...featuredDrawings.slice(0, 2).map((drawing) => ({
      id: `drawing-${drawing.id}`,
      image: drawing.src,
      title: drawing.title,
      meta: `Drawing / ${drawing.category}`
    }))
  ], [featuredDrawings]);

  useEffect(() => {
    const queryLocale = new URLSearchParams(window.location.search).get("lang");
    const stored = window.localStorage.getItem("seis-locale");
    const nextLocale = isLocale(queryLocale) ? queryLocale : resolveLocale(stored || "tr");
    setLocale(nextLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("seis-locale", locale);
    const currentUrl = new URL(window.location.href);
    if (locale === "tr") {
      currentUrl.searchParams.delete("lang");
    } else {
      currentUrl.searchParams.set("lang", locale);
    }
    const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentPath) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [locale]);

  useEffect(() => {
    const sections = nav
      .filter(([href]) => href.startsWith("#"))
      .map(([href]) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(`#${visibleEntry.target.id}` as (typeof nav)[number][0]);
        }
      },
      {
        rootMargin: "-24% 0px -52% 0px",
        threshold: [0.2, 0.4, 0.65]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="site-shell" data-mode={mode} id="main-content">
      <div className="skip-links" aria-label={dictionary.primaryNavigationLabel}>
        <a href="#home-copy" className="skip-link">{dictionary.skipContent}</a>
        <a href="#portfolio" className="skip-link">{dictionary.skipPortfolio}</a>
      </div>
      <nav className="top-nav" aria-label={dictionary.primaryNavigationLabel}>
        <a href="#home" className="brand" aria-label="Emirhan Kudun home">
          Emirhan Kudun
        </a>
        <div className="nav-links">
          {nav.map(([href, key, fallback]) => (
            <a
              key={href}
              href={href}
              aria-current={activeSection === href ? "location" : undefined}
            >
              {key === "sourceEnvironmentNav" ? getSourceConsoleNavLabel(locale) : dictionary[key] || fallback}
            </a>
          ))}
        </div>
        <div className="language-switcher" aria-label={dictionary.languageSelectorLabel}>
          {locales.map((item) => (
            <button
              className={item === locale ? "active" : ""}
              key={item}
              type="button"
              onClick={() => setLocale(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <section id="home" className="hero-section">
        <CinematicHeroScene />
        <div className="hero-copy" id="home-copy" tabIndex={-1}>
          <p className="eyebrow">{dictionary.heroEyebrow}</p>
          <h1>{dictionary.heroTitle}</h1>
          <p>{dictionary.heroLead}</p>
          <div className="hero-actions">
            <a href="#portfolio" className="primary-link">{dictionary.heroPrimary}</a>
            <a href="#behance" className="secondary-link">{dictionary.heroSecondary}</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Portfolio system highlights">
          <span>Behance / Drawings / 3D</span>
          <strong>{dictionary.heroPanelTitle}</strong>
          <p>{dictionary.heroPanelLead}</p>
          <div className="panel-line" />
          <div className="panel-metrics" aria-label="Hero metrics">
            <span>{dictionary.studioMetricOne}</span>
            <span>{dictionary.studioMetricTwo}</span>
            <span>{dictionary.studioMetricThree}</span>
          </div>
        </div>
      </section>
      <CinematicProofBelt
        dictionary={dictionary}
        behanceVisuals={behanceVisuals}
        drawings={drawings}
        compact
      />

      <section className="section" id="services">
        <p className="eyebrow">{dictionary.servicesEyebrow}</p>
        <h2>{dictionary.servicesTitle}</h2>
        <div className="card-grid compact">
          {services.map((service) => (
            <article className="work-card" key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section studio-section" id="studio">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{dictionary.studioEyebrow}</p>
            <h2>{dictionary.studioTitle}</h2>
          </div>
          <p>{dictionary.studioLead}</p>
        </div>
        <div className="studio-showcase">
          <CinematicShowcaseScene />
          <div className="studio-rail" aria-label={dictionary.studioRailLabel}>
            {studioTiles.map((tile) => (
              <article className="studio-tile" key={tile.id}>
                <img src={tile.image} alt={`${tile.title} - ${tile.meta}`} loading="lazy" decoding="async" />
                <span>
                  <small>{tile.meta}</small>
                  {tile.title}
                </span>
              </article>
            ))}
          </div>
        </div>
        <BehanceOrbitalDeck
          dictionary={dictionary}
          behanceVisuals={behanceVisuals}
          drawings={drawings}
          compact
        />
        <BehanceEmbedSpotlight dictionary={dictionary} embeds={behanceEmbeds} />
      </section>

      <section className="section editorial-section" id="portfolio">
        <p className="eyebrow">{dictionary.portfolioEyebrow}</p>
        <h2>{dictionary.worksTitle}</h2>
        <PortfolioCollections dictionary={dictionary} collections={portfolioCollections} compact />
        <PortfolioDiscoveryFlow
          dictionary={dictionary}
          behanceVisuals={behanceVisuals}
          drawings={drawings}
          works={works}
          compact
          links={{ behance: "#behance", drawings: "#drawings", works: "#portfolio" }}
        />
        <div className="portfolio-feature-layout" aria-label={dictionary.portfolioDrawingHighlightsLabel}>
          <div className="portfolio-behance-callout">
            <p className="eyebrow">{dictionary.behancePortfolioEyebrow}</p>
            <h3>{dictionary.behanceTitle}</h3>
            <p>{dictionary.behanceLead}</p>
            <a className="text-link" href="#behance">{dictionary.behanceOpen}</a>
          </div>
          <BehanceVisualGrid dictionary={dictionary} items={behanceVisuals} compact showHeading={false} />
          <div className="portfolio-drawing-strip" aria-label={dictionary.portfolioDrawingHighlightsLabel}>
            {portfolioDrawings.map((drawing) => (
              <figure className="portfolio-drawing-card" key={`portfolio-${drawing.id}`}>
                <img src={drawing.src} alt={`${drawing.title} - ${drawing.tone}`} loading="lazy" decoding="async" />
                <figcaption>{drawing.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="card-grid">
          {works.map((work) => (
            <article className="work-card" key={work.id}>
              <p className="kicker">{work.tag}</p>
              <h3>{work.title}</h3>
              <p>{work.summary}</p>
              <span>{work.impact}</span>
              <a className="text-link" href={`/portfolio/${work.id}`}>{dictionary.projectDetailOpen}</a>
            </article>
          ))}
        </div>
        <PortfolioIndex dictionary={dictionary} items={portfolioIndex} compact />
      </section>

      <section className="section behance-section" id="behance">
        <BehanceEmbedSpotlight dictionary={dictionary} embeds={behanceEmbeds} />
        <BehanceVisualGrid dictionary={dictionary} items={behanceVisuals} id="behance-visuals" />
        <BehanceEmbedPanel dictionary={dictionary} embeds={behanceEmbeds} compact />
      </section>

      <EcosystemSourceConsole locale={locale} />

      <section className="section gallery-section" id="drawings">
        <p className="eyebrow">{dictionary.drawingArchiveEyebrow}</p>
        <h2>{dictionary.drawingsTitle}</h2>
        <p>{dictionary.drawingArchiveLead}</p>
        <div className="featured-strip" aria-label={dictionary.featuredDrawingsLabel}>
          {featuredDrawings.map((drawing) => (
            <figure className="featured-drawing" key={`featured-${drawing.id}`}>
              <img src={drawing.src} alt={`${drawing.title} - ${drawing.tone}`} loading="lazy" decoding="async" />
              <figcaption>{drawing.title}</figcaption>
            </figure>
          ))}
        </div>
        <DrawingArchive dictionary={dictionary} drawings={drawings} compact />
      </section>

      <section className="section evolution-section" id="lab">
        <EvolutionRoadmap dictionary={dictionary} tracks={evolutionTracks} standards={qualityStandards} compact />
      </section>

      <section className="section contact-section" id="contact">
        <p className="eyebrow">{dictionary.contactEyebrow}</p>
        <h2>{dictionary.contactTitle}</h2>
        <p>{dictionary.contactLead}</p>
        <div className="contact-layout">
          <ContactHub dictionary={dictionary} />
          <BriefIntakeForm dictionary={dictionary} services={services} />
        </div>
      </section>
    </main>
  );
}
