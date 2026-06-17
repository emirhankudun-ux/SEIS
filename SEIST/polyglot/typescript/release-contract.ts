export type SeisLocale = "tr" | "en" | "fr" | "it" | "de" | "es" | "ar";

export interface SeisReleaseContract {
  version: 1;
  packagePath: string;
  packageBytes: number;
  sha256: string;
  generatedAt: string;
  deployStatus: "ready_for_confirmed_server";
  activeTarget: string | null;
  liveUploadBlocked: boolean;
  preservation: {
    backupCommand: string;
    releaseLedger: string;
  };
  contents: string[];
  requiredBeforeLiveDeploy: string[];
}

export const expectedLocales: SeisLocale[] = ["tr", "en", "fr", "it", "de", "es", "ar"];
