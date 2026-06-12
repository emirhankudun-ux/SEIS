export type FocusLanguageName = "JavaScript" | "TypeScript" | "Objective-C";
export type LanguagePanelName = FocusLanguageName | "Other";

export interface LanguageByteEntry {
  language: string;
  bytes: number;
}

export interface LanguagePanelEntry {
  panel: LanguagePanelName;
  bytes: number;
  percent: number;
  sourceLanguages: string[];
}

export interface LanguagePanelSplit {
  totalBytes: number;
  focusLanguages: readonly FocusLanguageName[];
  panels: LanguagePanelEntry[];
}

export const focusLanguageNames = ["JavaScript", "TypeScript", "Objective-C"] as const;
export const languagePanelOrder = ["JavaScript", "TypeScript", "Objective-C", "Other"] as const;

const focusLanguageSet = new Set<string>(focusLanguageNames);

export function buildLanguagePanelSplit(entries: LanguageByteEntry[]): LanguagePanelSplit {
  const byLanguage = new Map<string, number>();

  for (const entry of entries) {
    const language = String(entry.language || "").trim();
    const bytes = normalizeBytes(entry.bytes);
    if (!language || bytes === 0) continue;
    byLanguage.set(language, (byLanguage.get(language) || 0) + bytes);
  }

  const totalBytes = [...byLanguage.values()].reduce((sum, bytes) => sum + bytes, 0);
  const focusPanels = focusLanguageNames.map((language) => {
    const bytes = byLanguage.get(language) || 0;
    return createPanel(language, bytes, totalBytes, [language]);
  });

  const otherSourceLanguages = [...byLanguage.keys()]
    .filter((language) => !focusLanguageSet.has(language))
    .sort((left, right) => left.localeCompare(right));
  const otherBytes = otherSourceLanguages.reduce((sum, language) => sum + (byLanguage.get(language) || 0), 0);

  return {
    totalBytes,
    focusLanguages: focusLanguageNames,
    panels: [
      ...focusPanels,
      createPanel("Other", otherBytes, totalBytes, otherSourceLanguages)
    ]
  };
}

export function validateLanguagePanelSplit(split: LanguagePanelSplit): string[] {
  const failures: string[] = [];
  const panelNames = new Set(split.panels.map((panel) => panel.panel));

  for (const required of languagePanelOrder) {
    if (!panelNames.has(required)) {
      failures.push(`missing language panel: ${required}`);
    }
  }

  const other = split.panels.find((panel) => panel.panel === "Other");
  if (!other) {
    failures.push("missing Other panel");
  } else {
    for (const language of focusLanguageNames) {
      if (other.sourceLanguages.includes(language)) {
        failures.push(`Other panel must not include focused language: ${language}`);
      }
    }
  }

  const summedBytes = split.panels.reduce((sum, panel) => sum + panel.bytes, 0);
  if (summedBytes !== split.totalBytes) {
    failures.push(`panel byte total mismatch: expected ${split.totalBytes}, got ${summedBytes}`);
  }

  return failures;
}

export function runLanguageSplitContractSelfTest(): string[] {
  const split = buildLanguagePanelSplit([
    { language: "JavaScript", bytes: 510 },
    { language: "TypeScript", bytes: 260 },
    { language: "Objective-C", bytes: 120 },
    { language: "Python", bytes: 80 },
    { language: "Swift", bytes: 30 },
    { language: "JavaScript", bytes: 10 },
    { language: "Objective-C", bytes: -1 }
  ]);

  const failures = validateLanguagePanelSplit(split);
  const other = split.panels.find((panel) => panel.panel === "Other");
  const javascript = split.panels.find((panel) => panel.panel === "JavaScript");
  const typescript = split.panels.find((panel) => panel.panel === "TypeScript");
  const objectiveC = split.panels.find((panel) => panel.panel === "Objective-C");

  if (javascript?.bytes !== 520) failures.push("JavaScript bytes should stay isolated");
  if (typescript?.bytes !== 260) failures.push("TypeScript bytes should stay isolated");
  if (objectiveC?.bytes !== 120) failures.push("Objective-C bytes should stay isolated");
  if (other?.bytes !== 110) failures.push("Other bytes should contain only non-focused languages");
  if (other?.sourceLanguages.join(",") !== "Python,Swift") {
    failures.push("Other source language list should exclude focus languages");
  }

  return failures;
}

function createPanel(
  panel: LanguagePanelName,
  bytes: number,
  totalBytes: number,
  sourceLanguages: string[]
): LanguagePanelEntry {
  return {
    panel,
    bytes,
    percent: totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(2)) : 0,
    sourceLanguages
  };
}

function normalizeBytes(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}
