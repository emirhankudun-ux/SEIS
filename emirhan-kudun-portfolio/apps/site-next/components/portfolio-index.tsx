"use client";

import { useDeferredValue, useMemo, useState } from "react";

import type { LocalizedDictionary, PortfolioIndexItem } from "@seis/content";

type PortfolioIndexProps = {
  dictionary: LocalizedDictionary;
  items: PortfolioIndexItem[];
  compact?: boolean;
};

type PortfolioFilter = "all" | "featured" | PortfolioIndexItem["source"];

function countFor(filter: PortfolioFilter, items: PortfolioIndexItem[]) {
  if (filter === "all") return items.length;
  if (filter === "featured") return items.filter((item) => item.featured).length;
  return items.filter((item) => item.source === filter).length;
}

export function PortfolioIndex({ dictionary, items, compact = false }: PortfolioIndexProps) {
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const sourceLabel: Record<PortfolioIndexItem["source"], string> = {
    behance: "Behance",
    drawing: dictionary.portfolioSourceDrawing,
    work: dictionary.portfolioSourceWork
  };
  const filters = useMemo(
    () => [
      { id: "all" as const, label: dictionary.portfolioFilterAll },
      { id: "featured" as const, label: dictionary.portfolioFilterFeatured },
      { id: "behance" as const, label: dictionary.portfolioFilterBehance },
      { id: "drawing" as const, label: dictionary.portfolioFilterDrawings },
      { id: "work" as const, label: dictionary.portfolioFilterWork }
    ],
    [dictionary]
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "featured" ? item.featured : item.source === activeFilter);
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.category, item.summary, item.source].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        );

      return matchesFilter && matchesQuery;
    });

    return compact ? filtered.slice(0, 12) : filtered;
  }, [activeFilter, compact, deferredQuery, items]);

  return (
    <section className="portfolio-index" data-compact={compact} aria-labelledby="portfolio-index-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{dictionary.portfolioIndexEyebrow}</p>
          <h2 id="portfolio-index-title">{dictionary.portfolioIndexTitle}</h2>
        </div>
        <p>{dictionary.portfolioIndexLead}</p>
      </div>

      <div className="portfolio-index-controls">
        <div className="portfolio-index-filters" aria-label={dictionary.portfolioIndexFiltersLabel}>
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter.id}
              className={activeFilter === filter.id ? "active" : ""}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              <span>{filter.label}</span>
              <strong>{countFor(filter.id, items)}</strong>
            </button>
          ))}
        </div>
        <label className="portfolio-search">
          <span>{dictionary.portfolioSearchLabel}</span>
          <input
            aria-label={dictionary.portfolioSearchLabel}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dictionary.portfolioSearchPlaceholder}
            type="search"
            value={query}
          />
        </label>
      </div>

      {visibleItems.length > 0 ? (
        <div className="portfolio-index-grid">
          {visibleItems.map((item) => (
            <a
              className="portfolio-index-card"
              data-source={item.source}
              href={item.href}
              key={item.id}
              aria-label={`${item.title} - ${sourceLabel[item.source]} / ${item.category}${item.external ? `. ${dictionary.externalLinkLabel}` : ""}`}
              rel={item.external ? "noopener noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {item.image ? (
                <img src={item.image} alt={`${item.title} - ${item.category}`} loading="lazy" decoding="async" />
              ) : (
                <span className="portfolio-index-monogram">{item.title.slice(0, 2)}</span>
              )}
              <span className="portfolio-index-card-copy">
                <small className="card-link-meta">
                  <span>{sourceLabel[item.source]} / {item.category}</span>
                  {item.external ? <span className="external-link-mark" aria-hidden="true">↗</span> : null}
                  {item.external ? <span className="sr-only">{dictionary.externalLinkLabel}</span> : null}
                </small>
                <strong>{item.title}</strong>
                <em>{dictionary.portfolioOpenItem}</em>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="portfolio-index-empty">{dictionary.portfolioIndexEmpty}</p>
      )}
    </section>
  );
}
