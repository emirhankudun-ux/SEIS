import type { BehanceVisualItem, DrawingItem, LocalizedDictionary } from "@seis/content";

type CinematicProofBeltProps = {
  dictionary: LocalizedDictionary;
  behanceVisuals: BehanceVisualItem[];
  drawings: DrawingItem[];
  compact?: boolean;
};

export function CinematicProofBelt({
  dictionary,
  behanceVisuals,
  drawings,
  compact = false
}: CinematicProofBeltProps) {
  const proofItems = [
    ...behanceVisuals.filter((item) => item.featured).slice(0, compact ? 4 : 6).map((item) => ({
      id: `proof-behance-${item.id}`,
      source: dictionary.portfolioFilterBehance,
      title: item.title,
      image: item.image,
      href: item.href,
      external: true
    })),
    ...drawings.filter((drawing) => drawing.featured).slice(0, compact ? 4 : 6).map((drawing) => ({
      id: `proof-drawing-${drawing.id}`,
      source: dictionary.portfolioSourceDrawing,
      title: drawing.title,
      image: drawing.src,
      href: "/drawings",
      external: false
    }))
  ];

  return (
    <section className="proof-belt" data-compact={compact} aria-label={dictionary.portfolioMotionGalleryLabel}>
      <div className="proof-belt-copy">
        <p className="eyebrow">{dictionary.behancePortfolioEyebrow}</p>
        <strong>{dictionary.portfolioPageEyebrow}</strong>
      </div>
      <div className="proof-belt-track">
        {[...proofItems, ...proofItems].map((item, index) => {
          const isDuplicate = index >= proofItems.length;

          return (
          <a
            className="proof-belt-card"
            data-duplicate={isDuplicate ? "true" : "false"}
            href={item.href}
            key={`${item.id}-${index}`}
            rel={item.external ? "noopener noreferrer" : undefined}
            target={item.external ? "_blank" : undefined}
            aria-hidden={isDuplicate || undefined}
            tabIndex={isDuplicate ? -1 : undefined}
          >
            <img src={item.image} alt={`${item.title} - ${item.source}`} loading="lazy" decoding="async" />
            <span>
              <small>{item.source}</small>
              <strong>{item.title}</strong>
            </span>
          </a>
          );
        })}
      </div>
    </section>
  );
}
