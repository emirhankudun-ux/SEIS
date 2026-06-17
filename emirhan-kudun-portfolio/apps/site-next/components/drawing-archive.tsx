"use client";

import { useMemo, useState } from "react";

import type { DrawingItem, LocalizedDictionary } from "@seis/content";

type DrawingArchiveProps = {
  dictionary: LocalizedDictionary;
  drawings: DrawingItem[];
  compact?: boolean;
};

type DrawingFilter = "all" | "featured" | DrawingItem["category"];

function countFor(filter: DrawingFilter, drawings: DrawingItem[]) {
  if (filter === "all") return drawings.length;
  if (filter === "featured") return drawings.filter((drawing) => drawing.featured).length;
  return drawings.filter((drawing) => drawing.category === filter).length;
}

export function DrawingArchive({ dictionary, drawings, compact = false }: DrawingArchiveProps) {
  const [activeFilter, setActiveFilter] = useState<DrawingFilter>(compact ? "featured" : "all");
  const filters = useMemo(
    () => [
      { id: "all" as const, label: dictionary.drawingFilterAll },
      { id: "featured" as const, label: dictionary.drawingFilterFeatured },
      { id: "graphite" as const, label: dictionary.drawingFilterGraphite },
      { id: "color" as const, label: dictionary.drawingFilterColor }
    ],
    [dictionary]
  );
  const activeFilterLabel = useMemo(
    () => filters.find((filter) => filter.id === activeFilter)?.label ?? dictionary.drawingFilterAll,
    [activeFilter, dictionary.drawingFilterAll, filters]
  );
  const visibleDrawings = useMemo(() => {
    const filtered = drawings.filter((drawing) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "featured") return drawing.featured;
      return drawing.category === activeFilter;
    });

    return compact ? filtered.slice(0, 8) : filtered;
  }, [activeFilter, compact, drawings]);

  return (
    <div className="drawing-archive" data-compact={compact}>
      <div className="drawing-toolbar" aria-label={dictionary.drawingArchiveEyebrow}>
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className={activeFilter === filter.id ? "active" : ""}
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            <span>{filter.label}</span>
            <strong>{countFor(filter.id, drawings)}</strong>
          </button>
        ))}
      </div>
      <p className="drawing-results" aria-live="polite">
        <span>{activeFilterLabel}</span>
        <strong>{visibleDrawings.length}</strong>
      </p>
      <div className="drawing-grid">
        {visibleDrawings.map((drawing) => (
          <figure className="drawing-card" data-category={drawing.category} key={drawing.id}>
            <img src={drawing.src} alt={`${drawing.title} - ${drawing.tone}`} loading="lazy" decoding="async" />
            <figcaption>
              <strong>{drawing.title}</strong>
              <span>{drawing.tone}</span>
              <small>{drawing.archiveRole}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
