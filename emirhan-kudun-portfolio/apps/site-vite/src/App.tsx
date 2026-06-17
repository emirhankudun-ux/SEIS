import { useState, type CSSProperties } from "react";

import {
  behanceEmbeds,
  behanceVisuals,
  contactQa,
  drawings,
  evolutionTracks,
  getDictionary,
  locales,
  portfolioCollections,
  portfolioIndex,
  qualityStandards,
  services,
  siteMeta,
  socialLinks,
  works,
  type Locale
} from "@seis/content";

function isExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function App() {
  const [locale, setLocale] = useState<Locale>("tr");
  const dict = getDictionary(locale);
  const featuredDrawings = drawings.filter((drawing) => drawing.featured).slice(0, 6);
  const featuredEmbeds = behanceEmbeds.filter((item) => item.featured).slice(0, 5);
  const [activeEmbedId, setActiveEmbedId] = useState(featuredEmbeds[0]?.id ?? behanceEmbeds[0]?.id ?? "");
  const activeEmbed = featuredEmbeds.find((item) => item.id === activeEmbedId) ?? featuredEmbeds[0] ?? behanceEmbeds[0];
  const orbitalDeckItems = [
    ...behanceVisuals.filter((item) => item.featured).slice(0, 5).map((item) => ({
      id: `behance-${item.id}`,
      source: dict.portfolioFilterBehance,
      meta: item.category,
      title: item.title,
      image: item.image,
      href: item.href,
      external: true
    })),
    ...featuredDrawings.slice(0, 4).map((drawing) => ({
      id: `drawing-${drawing.id}`,
      source: dict.portfolioSourceDrawing,
      meta: drawing.category,
      title: drawing.title,
      image: drawing.src,
      href: "#drawings",
      external: false
    }))
  ];
  const proofBeltItems = [
    ...behanceVisuals.filter((item) => item.featured).slice(0, 6).map((item) => ({
      id: `proof-behance-${item.id}`,
      source: dict.portfolioFilterBehance,
      title: item.title,
      image: item.image,
      href: item.href,
      external: true
    })),
    ...featuredDrawings.map((drawing) => ({
      id: `proof-drawing-${drawing.id}`,
      source: dict.portfolioSourceDrawing,
      title: drawing.title,
      image: drawing.src,
      href: "#drawings",
      external: false
    }))
  ];
  const discoveryLanes = [
    {
      id: "behance",
      title: dict.behanceVisualsTitle,
      summary: dict.portfolioFlowBehanceLead,
      metric: `${behanceVisuals.length} ${dict.portfolioMetricBehance}`,
      images: behanceVisuals.filter((item) => item.featured).slice(0, 3).map((item) => item.image)
    },
    {
      id: "drawings",
      title: dict.drawingsTitle,
      summary: dict.portfolioFlowDrawingsLead,
      metric: `${drawings.length} ${dict.portfolioMetricDrawings}`,
      images: featuredDrawings.slice(0, 3).map((drawing) => drawing.src)
    },
    {
      id: "works",
      title: dict.worksTitle,
      summary: dict.portfolioFlowWorksLead,
      metric: `${works.length} ${dict.portfolioMetricWorks}`,
      images: []
    }
  ];
  const proofBeltLoopItems = [...proofBeltItems, ...proofBeltItems];

  return (
    <main>
      <a className="skip-link" href="#portfolio">{dict.skipPortfolio}</a>

      <nav className="nav">
        <a className="nav-brand" href="#home">Emirhan Kudun</a>
        <div className="nav-links" aria-label={dict.primaryNavigationLabel}>
          <a href="#portfolio">{dict.navPortfolio}</a>
          <a href="#behance">{dict.navBehance}</a>
          <a href="#drawings">{dict.navDrawings}</a>
          <a href="#contact">{dict.navContact}</a>
        </div>
        <div className="nav-actions" aria-label={dict.languageSelectorLabel}>
          {locales.map((item) => (
            <button
              aria-pressed={locale === item}
              className={locale === item ? "active" : ""}
              key={item}
              onClick={() => setLocale(item)}
              type="button"
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <section className="hero" id="home">
        <p>{dict.heroEyebrow}</p>
        <h1>{dict.heroTitle}</h1>
        <span>{dict.heroLead}</span>
        <div className="hero-metrics" aria-label="Portfolio preview metrics">
          <strong>{dict.studioMetricOne}</strong>
          <strong>{dict.studioMetricTwo}</strong>
          <strong>{dict.studioMetricThree}</strong>
        </div>
      </section>

      <section className="proof-belt" aria-label={dict.portfolioMotionGalleryLabel}>
        <div className="proof-belt-copy">
          <small>{dict.behancePortfolioEyebrow}</small>
          <strong>{dict.portfolioPageEyebrow}</strong>
        </div>
        <div className="proof-belt-track">
          {proofBeltLoopItems.map((item, index) => (
            <a
              aria-hidden={index >= proofBeltItems.length ? true : undefined}
              className="proof-belt-card"
              href={item.href}
              key={`${item.id}-${index}`}
              rel={item.external ? "noreferrer" : undefined}
              tabIndex={index >= proofBeltItems.length ? -1 : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <img src={item.image} alt={`${item.title} - ${item.source}`} loading="lazy" />
              <span>
                <small>{item.source}</small>
                <strong>{item.title}</strong>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="orbital-deck" aria-labelledby="orbital-preview-title">
        <div className="orbital-copy">
          <small>{dict.portfolioMotionGalleryLabel}</small>
          <h2 id="orbital-preview-title">{dict.behanceVisualsTitle}</h2>
          <p>{dict.behanceVisualsLead}</p>
        </div>
        <div className="orbital-stage" aria-label={dict.portfolioMotionGalleryLabel}>
          <span className="orbital-ring orbital-ring-one" aria-hidden="true" />
          <span className="orbital-ring orbital-ring-two" aria-hidden="true" />
          <span className="orbital-ring orbital-ring-three" aria-hidden="true" />
          <span className="orbital-core" aria-hidden="true">Be</span>
          {orbitalDeckItems.map((item) => (
            <a
              className="orbital-card"
              data-source={item.external ? "behance" : "drawing"}
              href={item.href}
              key={item.id}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <img src={item.image} alt={`${item.title} - ${item.source} / ${item.meta}`} loading="lazy" />
              <span>
                <small>{item.source} / {item.meta}</small>
                <strong>{item.title}</strong>
              </span>
            </a>
          ))}
        </div>
      </section>

      {activeEmbed ? (
        <section className="behance-spotlight" aria-labelledby="behance-spotlight-title">
          <div className="behance-spotlight-copy">
            <small>{dict.behanceEmbedEyebrow}</small>
            <h2 id="behance-spotlight-title">{dict.behanceTitle}</h2>
            <p>{dict.behanceLead}</p>
            <a className="mail-link" href={activeEmbed.url} target="_blank" rel="noreferrer">{dict.behanceOpen}</a>
          </div>
          <div className="behance-spotlight-preview">
            <div className="behance-live-frame" style={{ "--embed-aspect": activeEmbed.aspectRatio } as CSSProperties}>
              <iframe
                src={activeEmbed.embedUrl}
                title={`${activeEmbed.title} live Behance embed`}
                loading="lazy"
                allow="clipboard-write *; fullscreen *;"
              />
            </div>
          </div>
          <div className="behance-spotlight-list" aria-label={dict.behanceVisualsTitle}>
            {featuredEmbeds.map((embed, index) => (
              <button
                aria-pressed={embed.id === activeEmbed.id}
                className={embed.id === activeEmbed.id ? "active" : ""}
                key={embed.id}
                onClick={() => setActiveEmbedId(embed.id)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{embed.title}</strong>
                <small>{embed.category}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid" id="services">
        {services.map((service) => (
          <article key={service.id}>
            <h2>{service.title}</h2>
            <p>{service.summary}</p>
          </article>
        ))}
      </section>

      <section className="grid" id="portfolio">
        {works.slice(0, 6).map((work) => (
          <article key={work.id}>
            <small>{work.tag}</small>
            <h2>{work.title}</h2>
            <p>{work.summary}</p>
          </article>
        ))}
      </section>

      <section className="drawings" id="drawings">
        {featuredDrawings.map((drawing) => (
          <figure key={drawing.id}>
            <img src={drawing.src} alt={drawing.title} loading="lazy" />
            <figcaption>
              <strong>{drawing.title}</strong>
              <span>{drawing.category}</span>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="visuals" id="behance">
        <div>
          <small>Behance / Visuals</small>
          <h2>{dict.behanceVisualsTitle}</h2>
          <p>{dict.behanceVisualsLead}</p>
        </div>
        <div className="visual-grid">
          {behanceVisuals.map((item) => (
            <a className="visual-card" href={item.href} target="_blank" rel="noreferrer" key={item.id}>
              <img src={item.image} alt={`${item.title} - ${item.category}`} loading="lazy" />
              <span>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <em className="sr-only">{dict.externalLinkLabel}</em>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="collections">
        <div>
          <small>{dict.portfolioCollectionsEyebrow}</small>
          <h2>{dict.portfolioCollectionsTitle}</h2>
          <p>{dict.portfolioCollectionsLead}</p>
        </div>
        <div className="collection-grid">
          {portfolioCollections.slice(0, 3).map((collection) => (
            <a className="collection-card" data-accent={collection.accent} href={collection.href} key={collection.id}>
              <div className="collection-media">
                {collection.images.slice(0, 3).map((image) => (
                  <img src={image} alt={collection.title} loading="lazy" key={image} />
                ))}
              </div>
              <small>{collection.tone}</small>
              <h3>{collection.title}</h3>
              <p>{collection.summary}</p>
              <ul className="collection-proof-list" aria-label={dict.portfolioCollectionProof}>
                {collection.proof.map((proof) => (
                  <li key={proof}>{proof}</li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </section>

      <section className="flow">
        <div>
          <small>{dict.portfolioFlowEyebrow}</small>
          <h2>{dict.portfolioFlowTitle}</h2>
          <p>{dict.portfolioFlowLead}</p>
        </div>
        <div className="flow-grid">
          {discoveryLanes.map((lane, index) => (
            <article data-lane={lane.id} key={lane.id}>
              <div className="flow-head">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{lane.metric}</small>
              </div>
              <div className="flow-media" aria-hidden="true">
                {lane.images.length > 0 ? lane.images.map((image) => (
                  <img src={image} alt="" loading="lazy" key={image} />
                )) : works.slice(0, 3).map((work) => (
                  <span key={work.id}>{work.title.slice(0, 2)}</span>
                ))}
              </div>
              <h3>{lane.title}</h3>
              <p>{lane.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-index">
        <div>
          <small>{dict.portfolioIndexEyebrow}</small>
          <h2>{dict.portfolioIndexTitle}</h2>
          <p>{dict.portfolioIndexLead}</p>
        </div>
        <div className="portfolio-index-grid">
          {portfolioIndex.slice(0, 12).map((item) => (
            <a className="portfolio-index-card" data-source={item.source} href={item.href} key={item.id}>
              {item.image ? (
                <img src={item.image} alt={`${item.title} - ${item.category}`} loading="lazy" />
              ) : (
                <span className="portfolio-index-monogram">{item.title.slice(0, 2)}</span>
              )}
              <span>
                <small>{item.source} / {item.category}</small>
                <strong>{item.title}</strong>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="grid">
        {behanceEmbeds.slice(0, 3).map((embed) => (
          <article className="embed-card" key={embed.id}>
            <small>{embed.category}</small>
            <h2>{embed.title}</h2>
            <p>{embed.notes}</p>
            <pre><code>{embed.embedCode}</code></pre>
          </article>
        ))}
      </section>

      <section className="contact-preview" id="contact">
        <div>
          <small>{dict.qaEyebrow}</small>
          <h2>{dict.qaTitle}</h2>
          <p>{dict.qaLead}</p>
          <a className="mail-link" href={`mailto:${siteMeta.email}`}>{siteMeta.email}</a>
          <div className="social-links">
            {socialLinks.map((link) => (
              <a
                href={link.href}
                key={link.id}
                rel={isExternalHref(link.href) ? "noreferrer" : undefined}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              >
                <span>{link.mark}</span>
                {link.label}
                {!link.href.startsWith("mailto:") ? <em className="sr-only">{dict.externalLinkLabel}</em> : null}
              </a>
            ))}
          </div>
        </div>
        <div className="qa-grid">
          {contactQa.map((item) => (
            <article key={item.id}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-preview">
        <div>
          <small>Lab / Long-term</small>
          <h2>{dict.evolutionTitle}</h2>
          <p>{dict.evolutionLead}</p>
        </div>
        <div className="lab-grid">
          {evolutionTracks.map((track) => (
            <article key={track.id}>
              <small>{track.status} / {track.timeframe}</small>
              <h3>{track.title}</h3>
              <p>{track.summary}</p>
            </article>
          ))}
        </div>
        <div className="quality-mini-grid">
          {qualityStandards.map((standard) => (
            <article key={standard.id}>
              <strong>{standard.title}</strong>
              <p>{standard.metric}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
