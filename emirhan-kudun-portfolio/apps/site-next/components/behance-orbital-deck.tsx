import type { BehanceVisualItem, DrawingItem, LocalizedDictionary } from "@seis/content";

type BehanceOrbitalDeckProps = {
  dictionary: LocalizedDictionary;
  behanceVisuals: BehanceVisualItem[];
  drawings: DrawingItem[];
  compact?: boolean;
};

export function BehanceOrbitalDeck({
  dictionary,
  behanceVisuals,
  drawings,
  compact = false
}: BehanceOrbitalDeckProps) {
  const behanceCards = behanceVisuals
    .filter((item) => item.featured)
    .slice(0, compact ? 4 : 5)
    .map((item) => ({
      id: `behance-orbit-${item.id}`,
      source: dictionary.portfolioFilterBehance,
      title: item.title,
      meta: item.category,
      image: item.image,
      href: item.href,
      external: true
    }));

  const drawingCards = drawings
    .filter((drawing) => drawing.featured)
    .slice(0, compact ? 3 : 4)
    .map((drawing) => ({
      id: `drawing-orbit-${drawing.id}`,
      source: dictionary.portfolioSourceDrawing,
      title: drawing.title,
      meta: drawing.category,
      image: drawing.src,
      href: "/drawings",
      external: false
    }));

  const cards = [...behanceCards, ...drawingCards].slice(0, compact ? 7 : 9);

  return (
    <section className="orbital-deck" data-compact={compact} aria-labelledby="orbital-deck-title">
      <div className="orbital-copy">
        <p className="eyebrow">{dictionary.portfolioMotionGalleryLabel}</p>
        <h2 id="orbital-deck-title">{dictionary.behanceVisualsTitle}</h2>
        <p>{dictionary.behanceVisualsLead}</p>
      </div>
      <div className="orbital-stage" aria-label={dictionary.portfolioMotionGalleryLabel}>
        <span className="orbital-ring orbital-ring-one" aria-hidden="true" />
        <span className="orbital-ring orbital-ring-two" aria-hidden="true" />
        <span className="orbital-ring orbital-ring-three" aria-hidden="true" />
        <span className="orbital-core" aria-hidden="true">Be</span>
        {cards.map((card, index) => (
          <a
            className="orbital-card"
            data-source={card.external ? "behance" : "drawing"}
            href={card.href}
            key={card.id}
            rel={card.external ? "noopener noreferrer" : undefined}
            target={card.external ? "_blank" : undefined}
          >
            <img src={card.image} alt={`${card.title} - ${card.source} / ${card.meta}`} loading="lazy" decoding="async" />
            <span>
              <small>{card.source} / {card.meta}</small>
              <strong>{card.title}</strong>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
