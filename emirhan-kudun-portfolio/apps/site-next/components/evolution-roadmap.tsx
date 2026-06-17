import type { EvolutionTrackItem, LocalizedDictionary, QualityStandardItem } from "@seis/content";

type EvolutionRoadmapProps = {
  dictionary: LocalizedDictionary;
  tracks: EvolutionTrackItem[];
  standards: QualityStandardItem[];
  compact?: boolean;
};

const statusLabel: Record<EvolutionTrackItem["status"], string> = {
  live: "Live",
  next: "Next",
  planned: "Planned"
};

export function EvolutionRoadmap({ dictionary, tracks, standards, compact = false }: EvolutionRoadmapProps) {
  const visibleTracks = compact ? tracks.slice(0, 3) : tracks;

  return (
    <div className="evolution-roadmap" data-compact={compact}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{dictionary.evolutionEyebrow}</p>
          <h2>{dictionary.evolutionTitle}</h2>
        </div>
        <p>{dictionary.evolutionLead}</p>
      </div>
      <div className="evolution-grid">
        {visibleTracks.map((track, index) => (
          <article className="evolution-card" data-status={track.status} key={track.id}>
            <p className="kicker">{String(index + 1).padStart(2, "0")} / {statusLabel[track.status]}</p>
            <h3>{track.title}</h3>
            <span>{track.timeframe}</span>
            <p>{track.summary}</p>
            <ul>
              {track.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {!compact && (
        <div className="quality-panel">
          <div>
            <p className="eyebrow">{dictionary.qualityEyebrow}</p>
            <h3>{dictionary.qualityTitle}</h3>
            <p>{dictionary.qualityLead}</p>
          </div>
          <div className="quality-grid">
            {standards.map((standard) => (
              <article className="quality-card" key={standard.id}>
                <strong>{standard.title}</strong>
                <span>{standard.metric}</span>
                <p>{standard.summary}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
