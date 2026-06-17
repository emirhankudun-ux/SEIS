"use client";

import { useEffect, useId, useMemo, useState } from "react";

import type { BehanceEmbedItem, LocalizedDictionary } from "@seis/content";
import type { CSSProperties } from "react";

type BehanceEmbedPanelProps = {
  dictionary: LocalizedDictionary;
  embeds: BehanceEmbedItem[];
  compact?: boolean;
};

export function BehanceEmbedPanel({ dictionary, embeds, compact = false }: BehanceEmbedPanelProps) {
  const [copyState, setCopyState] = useState<{ id: string; status: "copied" | "error" } | null>(null);
  const embedGridId = useId();
  const allEmbeds = useMemo(
    () => (compact ? embeds.filter((item) => item.featured).slice(0, 3) : embeds),
    [compact, embeds]
  );
  const initialCount = compact ? allEmbeds.length : Math.min(8, allEmbeds.length);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const visibleEmbeds = compact ? allEmbeds : allEmbeds.slice(0, visibleCount);
  const hasMore = !compact && visibleCount < allEmbeds.length;
  const canCollapse = !compact && allEmbeds.length > initialCount && visibleCount >= allEmbeds.length;
  const remainingCount = Math.max(allEmbeds.length - visibleCount, 0);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);

  async function copyEmbedCode(embed: BehanceEmbedItem) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }

      await navigator.clipboard.writeText(embed.embedCode);
      setCopyState({ id: embed.id, status: "copied" });
    } catch {
      setCopyState({ id: embed.id, status: "error" });
    }

    window.setTimeout(() => setCopyState((current) => current?.id === embed.id ? null : current), 1600);
  }

  return (
    <div className="behance-panel" data-compact={compact}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{dictionary.behanceEmbedEyebrow}</p>
          <h2>{dictionary.behanceTitle}</h2>
        </div>
        <p>{dictionary.behanceLead}</p>
      </div>
      <div className="behance-grid" id={embedGridId}>
        {visibleEmbeds.map((embed) => (
          <article className="behance-card" key={embed.id}>
            <p className="kicker">{embed.category}</p>
            <h3>{embed.title}</h3>
            <p>{embed.notes}</p>
            <div className="behance-embed-frame" style={{ "--embed-aspect": embed.aspectRatio } as CSSProperties}>
              <iframe
                src={embed.embedUrl}
                title={`${embed.title} live Behance embed`}
                loading="lazy"
                allow="clipboard-write *; fullscreen *;"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <pre aria-label={`${embed.title} embed code`}>
              <code>{embed.embedCode}</code>
            </pre>
            <div className="embed-actions">
              <button className="secondary-link" onClick={() => void copyEmbedCode(embed)} type="button">
                {copyState?.id === embed.id && copyState.status === "copied" ? dictionary.copied : dictionary.copyEmbed}
              </button>
              <a
                className="secondary-link"
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${dictionary.behanceOpen}. ${dictionary.externalLinkLabel}`}
              >
                {dictionary.behanceOpen}
                <span className="sr-only">{dictionary.externalLinkLabel}</span>
              </a>
            </div>
            <p className="embed-status" role="status" aria-live="polite">
              {copyState?.id === embed.id && copyState.status === "copied" && dictionary.copied}
              {copyState?.id === embed.id && copyState.status === "error" && dictionary.copyFailed}
            </p>
          </article>
        ))}
      </div>
      {!compact ? (
        <div className="behance-panel-controls">
          {hasMore ? (
            <button
              className="secondary-link"
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + 8, allEmbeds.length))}
              aria-controls={embedGridId}
            >
              {dictionary.behanceShowMore || "Daha fazla goster"}
              {remainingCount > 0 ? ` (+${Math.min(remainingCount, 8)})` : ""}
            </button>
          ) : null}
          {canCollapse ? (
            <button
              className="secondary-link"
              type="button"
              onClick={() => setVisibleCount(initialCount)}
              aria-controls={embedGridId}
            >
              {dictionary.behanceCollapse || "Listeyi sadelestir"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
