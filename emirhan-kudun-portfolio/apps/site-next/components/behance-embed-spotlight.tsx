"use client";

import { useId, useMemo, useState } from "react";

import type { BehanceEmbedItem, LocalizedDictionary } from "@seis/content";
import type { CSSProperties } from "react";

type BehanceEmbedSpotlightProps = {
  dictionary: LocalizedDictionary;
  embeds: BehanceEmbedItem[];
};

export function BehanceEmbedSpotlight({ dictionary, embeds }: BehanceEmbedSpotlightProps) {
  const featuredEmbeds = useMemo(() => embeds.filter((item) => item.featured).slice(0, 5), [embeds]);
  const [activeId, setActiveId] = useState(featuredEmbeds[0]?.id ?? embeds[0]?.id ?? "");
  const headingId = useId();
  const activeEmbed = featuredEmbeds.find((item) => item.id === activeId) ?? featuredEmbeds[0] ?? embeds[0];

  if (!activeEmbed) return null;

  return (
    <section className="behance-spotlight" aria-labelledby={headingId}>
      <div className="behance-spotlight-copy">
        <p className="eyebrow">{dictionary.behanceEmbedEyebrow}</p>
        <h2 id={headingId}>{dictionary.behanceTitle}</h2>
        <p>{dictionary.behanceLead}</p>
        <a
          className="text-link"
          href={activeEmbed.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${dictionary.behanceOpen}. ${dictionary.externalLinkLabel}`}
        >
          {dictionary.behanceOpen}
        </a>
      </div>
      <div className="behance-spotlight-preview">
        <div className="behance-embed-frame" style={{ "--embed-aspect": activeEmbed.aspectRatio } as CSSProperties}>
          <iframe
            src={activeEmbed.embedUrl}
            title={`${activeEmbed.title} live Behance embed`}
            loading="lazy"
            allow="clipboard-write *; fullscreen *;"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
      <div className="behance-spotlight-list" aria-label={dictionary.behanceVisualsTitle}>
        {featuredEmbeds.map((embed, index) => (
          <button
            aria-pressed={embed.id === activeEmbed.id}
            className={embed.id === activeEmbed.id ? "active" : ""}
            key={embed.id}
            onClick={() => setActiveId(embed.id)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{embed.title}</strong>
            <small>{embed.category}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
