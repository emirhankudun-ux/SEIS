export type RequestedStackId =
  | "javascript"
  | "nodejs"
  | "mysql"
  | "react"
  | "expressjs"
  | "typescript";

export interface RequestedSoftwareStackTechnology {
  id: RequestedStackId;
  label: string;
  runtimeRole: string;
  primaryLane: string;
  entrypoints: string[];
  supportingPlugins: string[];
}

export interface RequestedSoftwareStackSource {
  id: "seis-requested-software-stack";
  generatedAt: string;
  technologyCount: number;
  technologies: RequestedSoftwareStackTechnology[];
  activationPolicy: "activate_only_when_relevant_authenticated_scoped_and_user_approved";
}

export function assertTechnologyCount(source: RequestedSoftwareStackSource): boolean {
  return source.technologyCount === source.technologies.length && source.technologies.length >= 6;
}
