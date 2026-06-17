export type EcosystemSourceItem = {
  id: string;
  label: string;
  plugin: string;
  role: string;
};

export type EcosystemSourceKind =
  | "plugin"
  | "skill"
  | "app"
  | "mcp"
  | "runtime"
  | "agent"
  | "bundled";

export type EcosystemSourceVisibility = "represented_in_manifest" | "available_in_session" | "invoked_in_session";

export type EcosystemSourceConnectionState =
  | "manifest_only"
  | "session_available"
  | "tool_discovered"
  | "tool_invoked"
  | "reauth_required"
  | "missing_connection";

export type EcosystemSourceSidePanelMode =
  | "local_output"
  | "platform_tool"
  | "platform_auth_blocked"
  | "future_connector_task";

export type EcosystemSourceInstallPolicy =
  | "no_install_needed"
  | "future_task_only"
  | "requires_user_auth"
  | "requires_connection_setup";

export type EcosystemSourceRecord = EcosystemSourceItem & {
  groupId: string;
  groupLabel: string;
  sourceKind: EcosystemSourceKind;
  sourceProvider: string;
  visibilityMode: EcosystemSourceVisibility;
  connectionState: EcosystemSourceConnectionState;
  sidePanelMode: EcosystemSourceSidePanelMode;
  installPolicy: EcosystemSourceInstallPolicy;
  connectionNote: string;
};

export type EcosystemSourceGroup = {
  id: string;
  title: string;
  label: string;
  strategy: string;
  sources: EcosystemSourceItem[];
};

export type PolyglotSourceContract = {
  id: string;
  language: string;
  extension: string;
  layer: string;
  path: string;
  role: string;
  status: "live" | "contract";
};

export type EcosystemOutputSurface = {
  id: string;
  label: string;
  path: string;
  role: string;
  sourceMode: "ui" | "api" | "repo" | "health";
};

export type EcosystemConnectionAttempt = {
  id: string;
  sourceId: string;
  label: string;
  status: EcosystemSourceConnectionState;
  result: string;
};

export type EcosystemSourceReadinessLane = {
  id: "connected" | "available" | "discovered" | "blocked" | "manifest";
  label: string;
  status: "ready" | "available" | "discovered" | "blocked" | "queued";
  description: string;
  sourceIds: string[];
  count: number;
  nextAction: string;
};

export type EcosystemSourceActivationPlan = {
  id: string;
  title: string;
  priority: "now" | "next" | "blocked" | "backlog";
  sourceIds: string[];
  count: number;
  outputPath: string;
  action: string;
  guardrail: string;
};

export type EcosystemAggressiveDevelopmentLane = {
  id: string;
  title: string;
  priority: "now" | "next" | "blocked" | "backlog";
  posture: "command" | "build" | "creative" | "growth" | "ops" | "quality" | "research";
  sourceIds: string[];
  count: number;
  connectedCount: number;
  callableCount: number;
  blockedCount: number;
  manifestCount: number;
  outputPath: string;
  actionNow: string;
  usesConnectedPlugins: string;
  blocker: string;
  guardrail: string;
};

export type EcosystemPluginInstallPlan = {
  id: string;
  title: string;
  phase: "ready" | "needs_auth" | "needs_connection" | "future_task" | "bulk_guardrail";
  sourceIds: string[];
  count: number;
  outputPath: string;
  action: string;
  guardrail: string;
};

export type EcosystemEnvironmentSourceExport = {
  id: string;
  label: string;
  channel: "platform" | "ui" | "api" | "repo";
  visibility: "partial" | "complete" | "machine_readable" | "local_source";
  sourceIds: string[];
  count: number;
  evidencePath: string;
  note: string;
  nextAction: string;
};

export type EcosystemSourceDeliveryArtifact = {
  id: string;
  label: string;
  artifactType: "ui" | "api" | "repo" | "archive" | "policy";
  path: string;
  downloadMode: "browser_view" | "machine_readable_json" | "repo_file" | "local_archive_reference";
  count: number;
  sourceIds: string[];
  purpose: string;
  guardrail: string;
};

export type EcosystemSourceExportIndexItem = {
  id: string;
  label: string;
  format: "json" | "html" | "repo" | "archive";
  path: string;
  status: "primary" | "supporting" | "local_reference";
  sourceIds: string[];
  count: number;
  purpose: string;
  useWhen: string;
};

export type EcosystemAiHelperLane = {
  id: string;
  label: string;
  helperType:
    | "active_agent"
    | "model_route"
    | "creative_ai"
    | "research_ai"
    | "quality_ai"
    | "automation_ai";
  status: "active" | "available" | "connection_blocked" | "auth_gated" | "future_task";
  sourceIds: string[];
  count: number;
  evidencePath: string;
  role: string;
  nextAction: string;
  guardrail: string;
};

export type EcosystemSourceSignalMapItem = {
  id: string;
  label: string;
  strategy: string;
  total: number;
  invoked: number;
  callable: number;
  blocked: number;
  manifestOnly: number;
  authGated: number;
  connectionGated: number;
  futureOnly: number;
  sourceKinds: Record<EcosystemSourceKind, number>;
  providers: string[];
  strongestState: "live_evidence" | "callable" | "gated" | "cataloged" | "blocked";
  action: string;
  outputPath: string;
};

export type EcosystemSourceExecutionPriority = "now" | "next" | "blocked" | "backlog";

export type EcosystemSourceExecutionQueueItem = {
  id: string;
  label: string;
  priority: EcosystemSourceExecutionPriority;
  sourceFamilyId: string;
  sourceFamilyLabel: string;
  sourceIds: string[];
  count: number;
  signalState: EcosystemSourceSignalMapItem["strongestState"];
  laneIds: string[];
  outputPath: string;
  action: string;
  guardrail: string;
  acceptanceCriteria: string[];
};

export type EcosystemSourceActionPacketMode =
  | "command"
  | "build"
  | "creative"
  | "growth"
  | "ops"
  | "quality"
  | "research"
  | "backlog";

export type EcosystemSourceActionPacket = {
  id: string;
  label: string;
  queueId: string;
  priority: EcosystemSourceExecutionPriority;
  packetMode: EcosystemSourceActionPacketMode;
  sourceFamilyId: string;
  sourceFamilyLabel: string;
  sourceIds: string[];
  count: number;
  laneIds: string[];
  evidencePaths: string[];
  objective: string;
  firstMove: string;
  localValidation: string[];
  stopCondition: string;
  handoffPath: string;
  guardrail: string;
  acceptanceCriteria: string[];
};

export type EcosystemSourceActionBoardColumn = {
  id: EcosystemSourceExecutionPriority;
  label: string;
  packetIds: string[];
  count: number;
  sourceCount: number;
  leadingPacketId: string | null;
  nextMove: string;
  riskNote: string;
};

export type EcosystemSourceActionBoardMode = {
  id: EcosystemSourceActionPacketMode;
  label: string;
  packetIds: string[];
  count: number;
  sourceCount: number;
};

export type EcosystemSourceActionBoard = {
  id: string;
  label: string;
  handoffPath: string;
  packetCount: number;
  sourceCount: number;
  columns: EcosystemSourceActionBoardColumn[];
  modes: EcosystemSourceActionBoardMode[];
  nextPacketId: string | null;
  operatingRule: string;
};

export type EcosystemSourceQualityGate = {
  id: string;
  label: string;
  gateType: "typecheck" | "boundary" | "lint" | "content" | "runtime" | "smoke";
  priority: "required" | "recommended";
  command: string;
  scope: string;
  packetIds: string[];
  evidencePath: string;
  passSignal: string;
  failureResponse: string;
};

export type EcosystemSourceRunbookStep = {
  id: string;
  label: string;
  order: number;
  phase: "preflight" | "contract" | "implementation" | "validation" | "publish";
  gateIds: string[];
  command: string;
  expectedSignal: string;
  stopRule: string;
  handoffPath: string;
};

export type EcosystemSourceRunbook = {
  id: string;
  label: string;
  packetId: string | null;
  boardPath: string;
  qualityGatePath: string;
  steps: EcosystemSourceRunbookStep[];
  operatingRule: string;
};

export type EcosystemSourceExecutionReceipt = {
  id: string;
  label: string;
  receiptType: "board" | "packet" | "gate" | "runbook" | "ui" | "package";
  status: "ready" | "visible" | "machine_readable" | "operator_handoff";
  evidencePath: string;
  sourceIds: string[];
  count: number;
  proves: string;
  nextAction: string;
};

export type EcosystemSourceExecutionDigestMetric = {
  id: string;
  label: string;
  value: number;
  evidencePath: string;
  signal: string;
};

export type EcosystemSourceExecutionDigest = {
  id: string;
  label: string;
  headline: string;
  summary: string;
  leadingPacketId: string | null;
  primaryEvidencePath: string;
  metrics: EcosystemSourceExecutionDigestMetric[];
  nextAction: string;
  guardrail: string;
};

export type EcosystemSourceContinuationBrief = {
  id: string;
  label: string;
  headline: string;
  summary: string;
  packetId: string | null;
  packetLabel: string;
  priority: EcosystemSourceExecutionPriority | "none";
  primaryHandoffPath: string;
  readFirstPaths: string[];
  validationCommands: string[];
  publishCommand: string;
  nextMove: string;
  stopRules: string[];
  evidencePaths: string[];
  guardrail: string;
};

export type EcosystemSidePanelReceipt = {
  id: string;
  label: string;
  receiptMode: "platform_visible" | "session_callable" | "local_complete" | "blocked" | "backlog";
  sourceIds: string[];
  count: number;
  evidencePath: string;
  expectation: string;
  limitation: string;
};

export type EcosystemPlatformSourceMirror = {
  id: string;
  label: string;
  mirrorMode:
    | "observed_panel"
    | "platform_evidence"
    | "session_callable"
    | "local_bound"
    | "blocked_setup"
    | "future_backlog";
  status: "visible" | "candidate" | "callable" | "bound" | "blocked" | "queued";
  sourceIds: string[];
  count: number;
  candidateCount?: number;
  evidencePath: string;
  userMeaning: string;
  nextAction: string;
  limitation: string;
};

export type EcosystemSourceProofCard = {
  id: string;
  label: string;
  channel: "platform" | "ui" | "api" | "repo";
  status: "platform_controlled" | "complete" | "machine_readable" | "install_plan" | "polyglot";
  sourceIds: string[];
  count: number;
  evidencePath: string;
  userSees: string;
  limitation: string;
};

function source(id: string, label: string, plugin: string, role: string): EcosystemSourceItem {
  return { id, label, plugin, role };
}

function getSourceProvider(pluginRef: string): string {
  return pluginRef.split("@").at(-1) || "unknown";
}

function getSourceKind(item: EcosystemSourceItem): EcosystemSourceKind {
  const pluginRef = item.plugin;
  const provider = getSourceProvider(pluginRef);
  const searchable = `${item.id} ${item.label} ${item.role} ${pluginRef}`.toLowerCase();
  if (provider === "skills" || provider.endsWith("-skills")) return "skill";
  if (searchable.includes("skill")) return "skill";
  if (provider === "openai-codex") return "agent";
  if (provider === "openai-bundled" || provider === "openai-primary-runtime") return "bundled";
  if (searchable.includes("mcp")) return "mcp";
  if (provider.includes("curated")) return "app";
  if (provider.includes("runtime")) return "runtime";
  return "plugin";
}

type ConnectionDetails = Pick<
  EcosystemSourceRecord,
  "connectionState" | "sidePanelMode" | "installPolicy" | "connectionNote" | "visibilityMode"
>;

const sessionConnectionOverrides: Record<string, ConnectionDetails> = {
  base44: {
    connectionState: "tool_invoked",
    sidePanelMode: "platform_tool",
    installPolicy: "no_install_needed",
    connectionNote: "Base44 connector responded to a read-only app lookup in this session.",
    visibilityMode: "invoked_in_session"
  },
  wix: {
    connectionState: "reauth_required",
    sidePanelMode: "platform_auth_blocked",
    installPolicy: "requires_user_auth",
    connectionNote: "Wix site builder was invoked, but the platform returned 401 reauthentication required.",
    visibilityMode: "invoked_in_session"
  },
  fal: {
    connectionState: "tool_invoked",
    sidePanelMode: "platform_tool",
    installPolicy: "no_install_needed",
    connectionNote: "Fal model recommendation responded with live image-generation model options.",
    visibilityMode: "invoked_in_session"
  },
  replit: {
    connectionState: "tool_discovered",
    sidePanelMode: "platform_tool",
    installPolicy: "future_task_only",
    connectionNote: "Replit app tools were discovered; creating a new external app remains opt-in.",
    visibilityMode: "available_in_session"
  },
  shutterstock: {
    connectionState: "tool_invoked",
    sidePanelMode: "platform_tool",
    installPolicy: "no_install_needed",
    connectionNote: "Shutterstock image search returned a preview search result set for portfolio imagery.",
    visibilityMode: "invoked_in_session"
  },
  lovable: {
    connectionState: "tool_discovered",
    sidePanelMode: "platform_tool",
    installPolicy: "future_task_only",
    connectionNote: "Lovable builder tools were discovered; project creation was left opt-in to avoid an extra external site.",
    visibilityMode: "available_in_session"
  },
  figma: {
    connectionState: "tool_invoked",
    sidePanelMode: "platform_tool",
    installPolicy: "no_install_needed",
    connectionNote: "Figma identity was checked successfully; design file creation remains opt-in.",
    visibilityMode: "invoked_in_session"
  },
  cloudinary: {
    connectionState: "tool_invoked",
    sidePanelMode: "platform_tool",
    installPolicy: "no_install_needed",
    connectionNote: "Cloudinary visual search responded successfully with an empty matching asset set.",
    visibilityMode: "invoked_in_session"
  },
  snowflake: {
    connectionState: "missing_connection",
    sidePanelMode: "platform_auth_blocked",
    installPolicy: "requires_connection_setup",
    connectionNote: "Snowflake Cortex Code was attempted, but no Snowflake connection is configured.",
    visibilityMode: "invoked_in_session"
  },
  codex: {
    connectionState: "tool_invoked",
    sidePanelMode: "platform_tool",
    installPolicy: "no_install_needed",
    connectionNote: "Codex is the active local implementation agent for this portfolio pass.",
    visibilityMode: "invoked_in_session"
  }
};

function getSourceConnectionDetails(item: EcosystemSourceItem, sourceKind: EcosystemSourceKind): ConnectionDetails {
  const override = sessionConnectionOverrides[item.id];
  if (override) return override;

  if (sourceKind === "skill" || sourceKind === "mcp" || sourceKind === "bundled" || sourceKind === "agent") {
    return {
      connectionState: "session_available",
      sidePanelMode: "platform_tool",
      installPolicy: "no_install_needed",
      connectionNote: "Available in the current Codex plugin or skill environment; invoked only when the task needs it.",
      visibilityMode: "available_in_session"
    };
  }

  return {
    connectionState: "manifest_only",
    sidePanelMode: "future_connector_task",
    installPolicy: "future_task_only",
    connectionNote: "Represented in the local source ledger; external auth or a concrete connector task is required before live calls.",
    visibilityMode: "represented_in_manifest"
  };
}

export const ecosystemSourceGroups: EcosystemSourceGroup[] = [
  {
    id: "builders-hosting-runtime",
    title: "Builder, hosting and runtime sources",
    label: "Build / Host / Runtime",
    strategy: "Use as portfolio build lanes, deployment references and no-code/low-code inspiration without pulling external credentials into source.",
    sources: [
      source("base44", "@base44", "plugin://base44@claude-plugins-official", "App builder lane"),
      source("wix", "@wix", "plugin://wix@claude-plugins-official", "Site builder benchmark"),
      source("lovable", "@lovable", "plugin://lovable@openai-curated", "Rapid app ideation"),
      source("replit", "@replit", "plugin://replit@openai-curated", "Sandbox runtime reference"),
      source("hostinger", "@hostinger", "plugin://hostinger@openai-curated", "Hosted site reference"),
      source("vercel", "@vercel", "plugin://vercel@claude-plugins-official", "Production deploy lane"),
      source("netlify", "@netlify", "plugin://netlify@openai-curated", "Static deploy lane"),
      source("render", "@render", "plugin://render@openai-curated", "Service deploy lane"),
      source("railway", "@railway", "plugin://railway@claude-plugins-official", "Infrastructure deploy lane"),
      source("cloudflare", "@cloudflare", "plugin://cloudflare@claude-plugins-official", "Edge runtime lane"),
      source("firebase", "@firebase", "plugin://firebase@claude-plugins-official", "Managed backend lane"),
      source("supabase", "@supabase", "plugin://supabase@claude-plugins-official", "Postgres backend lane"),
      source("convex", "@convex", "plugin://convex@claude-plugins-official", "Reactive backend lane"),
      source("neon", "@neon", "plugin://neon@claude-plugins-official", "Serverless Postgres lane"),
      source("mongodb", "@mongodb", "plugin://mongodb@claude-plugins-official", "Document database lane"),
      source("prisma", "@prisma", "plugin://prisma@claude-plugins-official", "Database modeling lane"),
      source("planetscale", "@planetscale", "plugin://planetscale@claude-plugins-official", "Branching database lane"),
      source("appwrite", "@appwrite", "plugin://appwrite@claude-plugins-official", "Backend platform lane")
    ]
  },
  {
    id: "creative-media-design",
    title: "Creative media and design sources",
    label: "Creative / Design",
    strategy: "Use for visual direction, image/video pipelines, design handoff and cinematic asset planning while keeping generated media reviewable.",
    sources: [
      source("fal", "@fal", "plugin://fal@openai-curated", "Image and media generation"),
      source("picsart", "@picsart", "plugin://picsart@openai-curated", "Image editing source"),
      source("shutterstock", "@shutterstock", "plugin://shutterstock@openai-curated", "Licensed media source"),
      source("canva", "@canva", "plugin://canva@openai-curated", "Editable design source"),
      source("figma", "@figma", "plugin://figma@claude-plugins-official", "Design system source"),
      source("cloudinary", "@cloudinary", "plugin://cloudinary@claude-plugins-official", "Media delivery source"),
      source("heygen", "@heygen", "plugin://heygen@openai-curated", "Avatar video source"),
      source("hyperframes", "@hyperframes", "plugin://hyperframes@claude-plugins-official", "HTML-to-video source"),
      source("remotion", "@remotion", "plugin://remotion@openai-curated", "React video source"),
      source("runway-api", "@runway-api", "plugin://runway-api@claude-plugins-official", "Generative video source"),
      source("biorender", "@biorender", "plugin://biorender@openai-curated", "Scientific figure source"),
      source("adobe-creativity", "@adobe-for-creativity", "plugin://adobe-for-creativity@claude-plugins-official", "Creative Cloud source"),
      source("creative-production", "@creative-production", "plugin://creative-production@openai-curated-remote", "Campaign asset source"),
      source("stardust", "@stardust", "plugin://stardust@adobe-skills", "Website redesign source")
    ]
  },
  {
    id: "analytics-gtm-intelligence",
    title: "Analytics, GTM and market intelligence sources",
    label: "Analytics / GTM",
    strategy: "Use as future measurement, SEO and commercial intelligence sources; the portfolio displays them as readiness inputs, not live credentialed calls.",
    sources: [
      source("posthog", "@posthog", "plugin://posthog@claude-plugins-official", "Product analytics source"),
      source("mixpanel", "@mixpanel", "plugin://mixpanel@openai-curated", "Event analytics source"),
      source("mixpanel-headless", "@mixpanel-headless", "plugin://mixpanel-headless@openai-curated", "Headless analytics source"),
      source("amplitude", "@amplitude", "plugin://amplitude@claude-plugins-official", "Behavior analytics source"),
      source("semrush", "@semrush", "plugin://semrush@openai-curated", "SEO intelligence source"),
      source("similarweb", "@similarweb", "plugin://similarweb@openai-curated", "Traffic intelligence source"),
      source("conductor", "@conductor", "plugin://conductor@openai-curated", "Search visibility source"),
      source("ranked-ai", "@ranked-ai", "plugin://ranked-ai@openai-curated", "AI SEO source"),
      source("channel99", "@channel99", "plugin://channel99@openai-curated", "Marketing performance source"),
      source("hg-insights", "@hg-insights", "plugin://hg-insights@openai-curated", "Technographic source"),
      source("zoominfo", "@zoominfo", "plugin://zoominfo@claude-plugins-official", "B2B data source"),
      source("clay", "@clay", "plugin://clay@openai-curated", "Prospecting source"),
      source("apollo", "@apollo", "plugin://apollo@claude-plugins-official", "B2B prospecting source"),
      source("hunter", "@hunter", "plugin://hunter@claude-plugins-official", "Email discovery source"),
      source("happenstance", "@happenstance", "plugin://happenstance@openai-curated", "Network search source"),
      source("hubspot", "@hubspot", "plugin://hubspot@openai-curated", "CRM source"),
      source("close", "@close", "plugin://close@openai-curated", "Sales CRM source"),
      source("attio", "@attio", "plugin://attio@openai-curated", "Relationship CRM source"),
      source("carta-crm", "@carta-crm", "plugin://carta-crm@claude-plugins-official", "Investment CRM source"),
      source("common-room", "@common-room", "plugin://common-room@openai-curated", "Buyer intelligence source"),
      source("demandbase", "@demandbase", "plugin://demandbase@openai-curated", "Account intelligence source"),
      source("cb-insights", "@cb-insights", "plugin://cb-insights@openai-curated", "Private market source"),
      source("pitchbook", "@pitchbook", "plugin://pitchbook@openai-curated", "Capital market source"),
      source("particl-market-research", "@particl-market-research", "plugin://particl-market-research@openai-curated", "Ecommerce research source"),
      source("brand24", "@brand24", "plugin://brand24@openai-curated", "Brand monitoring source"),
      source("waldo", "@waldo", "plugin://waldo@openai-curated", "Strategy intelligence source"),
      source("rox", "@rox", "plugin://rox@openai-curated", "Revenue agent source"),
      source("meticulate", "@meticulate", "plugin://meticulate@openai-curated", "Company matching source")
    ]
  },
  {
    id: "productivity-sales-ops",
    title: "Productivity, sales and operations sources",
    label: "Productivity / Ops",
    strategy: "Use for contact, meetings, work management and business operations surfaces while preserving local-only portfolio behavior by default.",
    sources: [
      source("calendly", "@calendly", "plugin://calendly@openai-curated", "Scheduling source"),
      source("zoom", "@zoom", "plugin://zoom@openai-curated", "Meeting source"),
      source("zoom-plugin", "@zoom-plugin", "plugin://zoom-plugin@claude-plugins-official", "Zoom development source"),
      source("granola", "@granola", "plugin://granola@openai-curated", "Meeting memory source"),
      source("fireflies", "@fireflies", "plugin://fireflies@openai-curated", "Meeting transcript source"),
      source("read-ai", "@read-ai", "plugin://read-ai@openai-curated", "Meeting intelligence source"),
      source("otter-ai", "@otter-ai", "plugin://otter-ai@openai-curated", "Transcript source"),
      source("circleback", "@circleback", "plugin://circleback@claude-plugins-official", "Conversation source"),
      source("google-calendar", "@google-calendar", "plugin://google-calendar@openai-curated", "Calendar source"),
      source("gmail", "@gmail", "plugin://gmail@openai-curated", "Email source"),
      source("outlook-email", "@outlook-email", "plugin://outlook-email@openai-curated", "Outlook source"),
      source("slack", "@slack", "plugin://slack@claude-plugins-official", "Collaboration source"),
      source("linear", "@linear", "plugin://linear@claude-plugins-official", "Issue tracking source"),
      source("asana", "@asana", "plugin://asana@claude-plugins-official", "Work management source"),
      source("atlassian", "@atlassian-rovo", "plugin://atlassian-rovo@openai-curated", "Jira and Confluence source"),
      source("notion", "@notion", "plugin://notion@claude-plugins-official", "Knowledge workspace source"),
      source("google-drive", "@google-drive", "plugin://google-drive@openai-curated", "Document source"),
      source("box", "@box", "plugin://box@claude-plugins-official", "File source"),
      source("egnyte", "@egnyte", "plugin://egnyte@openai-curated", "File governance source"),
      source("docusign", "@docusign", "plugin://docusign@openai-curated", "Agreement source"),
      source("signnow", "@signnow", "plugin://signnow@openai-curated", "Signature source"),
      source("brex", "@brex", "plugin://brex@openai-curated", "Finance ops source"),
      source("streak", "@streak", "plugin://streak@openai-curated", "Gmail CRM source"),
      source("monday", "@monday-com", "plugin://monday-com@openai-curated", "Work OS source"),
      source("clickup", "@clickup", "plugin://clickup@openai-curated", "Task OS source"),
      source("pylon", "@pylon", "plugin://pylon@openai-curated", "Customer support source"),
      source("help-scout", "@help-scout", "plugin://help-scout@openai-curated", "Support inbox source"),
      source("highlevel", "@highlevel", "plugin://highlevel@openai-curated", "Agency CRM source"),
      source("fyxer", "@fyxer", "plugin://fyxer@openai-curated", "Email writing source")
    ]
  },
  {
    id: "engineering-ai-security",
    title: "Engineering, AI and security sources",
    label: "Engineering / AI / Security",
    strategy: "Use as code, AI workflow, observability and security lanes. External calls remain opt-in, credential-aware and bounded.",
    sources: [
      source("openai-developers", "@openai-developers", "plugin://openai-developers@openai-curated", "AI platform source"),
      source("nvidia-skills", "@nvidia-skills", "plugin://nvidia-skills@claude-plugins-official", "Accelerated AI source"),
      source("hugging-face", "@hugging-face", "plugin://hugging-face@openai-curated", "Model hub source"),
      source("huggingface-skills", "@huggingface-skills", "plugin://huggingface-skills@claude-plugins-official", "ML workflow source"),
      source("togetherai", "@togetherai-skills", "plugin://togetherai-skills@claude-plugins-official", "Inference source"),
      source("temporal", "@temporal", "plugin://temporal@openai-curated", "Durable workflow source"),
      source("outputai", "@outputai", "plugin://outputai@claude-plugins-official", "Durable AI workflow source"),
      source("codex", "@codex", "plugin://codex@openai-codex", "Coding agent source"),
      source("superpowers", "@superpowers", "plugin://superpowers@claude-plugins-official", "Process skill source"),
      source("frontend-design", "@frontend-design", "plugin://frontend-design@claude-plugins-official", "UI skill source"),
      source("build-web-apps", "@build-web-apps", "plugin://build-web-apps@openai-curated", "Web app skill source"),
      source("build-web-data-visualization", "@build-web-data-visualization", "plugin://build-web-data-visualization@openai-curated", "Visualization skill source"),
      source("build-ios-apps", "@build-ios-apps", "plugin://build-ios-apps@openai-curated", "iOS skill source"),
      source("build-macos-apps", "@build-macos-apps", "plugin://build-macos-apps@openai-curated", "macOS skill source"),
      source("test-android-apps", "@test-android-apps", "plugin://test-android-apps@openai-curated", "Android test source"),
      source("expo", "@expo", "plugin://expo@claude-plugins-official", "React Native source"),
      source("twilio", "@twilio-developer-kit", "plugin://twilio-developer-kit@claude-plugins-official", "Messaging API source"),
      source("stripe", "@stripe", "plugin://stripe@claude-plugins-official", "Payments API source"),
      source("razorpay", "@razorpay", "plugin://razorpay@openai-curated", "Payments source"),
      source("sumup", "@sumup", "plugin://sumup@claude-plugins-official", "Payment terminal source"),
      source("quicknode", "@quicknode", "plugin://quicknode@openai-curated", "Blockchain infra source"),
      source("pinecone", "@pinecone", "plugin://pinecone@claude-plugins-official", "Vector database source"),
      source("zilliz", "@zilliz", "plugin://zilliz@claude-plugins-official", "Vector database source"),
      source("redis", "@redis-development", "plugin://redis-development@claude-plugins-official", "Cache source"),
      source("terraform", "@terraform", "plugin://terraform@claude-plugins-official", "IaC source"),
      source("azure", "@azure", "plugin://azure@claude-plugins-official", "Cloud source"),
      source("aws-core", "@aws-core", "plugin://aws-core@claude-plugins-official", "Cloud source"),
      source("aws-serverless", "@aws-serverless", "plugin://aws-serverless@claude-plugins-official", "Serverless source"),
      source("aws-amplify", "@aws-amplify", "plugin://aws-amplify@claude-plugins-official", "Full-stack AWS source"),
      source("mapbox", "@mapbox", "plugin://mapbox@claude-plugins-official", "Map source"),
      source("auth0", "@auth0", "plugin://auth0@claude-plugins-official", "Identity source"),
      source("workos", "@workos", "plugin://workos@claude-plugins-official", "Enterprise auth source"),
      source("codex-security", "@codex-security", "plugin://codex-security@openai-curated", "Security workflow source"),
      source("semgrep", "@semgrep", "plugin://semgrep@claude-plugins-official", "Static analysis source"),
      source("sonarqube", "@sonarqube", "plugin://sonarqube@claude-plugins-official", "Code quality source"),
      source("aikido", "@aikido", "plugin://aikido@claude-plugins-official", "Security scan source"),
      source("crunch", "@42crunch-api-security-testing", "plugin://42crunch-api-security-testing@claude-plugins-official", "API security source"),
      source("nightvision", "@nightvision", "plugin://nightvision@claude-plugins-official", "DAST source"),
      source("zscaler", "@zscaler", "plugin://zscaler@claude-plugins-official", "Cloud security source"),
      source("crowdstrike", "@crowdstrike-falcon-foundry", "plugin://crowdstrike-falcon-foundry@claude-plugins-official", "Security app source"),
      source("sentry", "@sentry", "plugin://sentry@claude-plugins-official", "Error monitoring source"),
      source("sentry-cli", "@sentry-cli", "plugin://sentry-cli@claude-plugins-official", "Sentry CLI source"),
      source("datadog", "@datadog", "plugin://datadog@claude-plugins-official", "Observability source"),
      source("rootly", "@rootly", "plugin://rootly@claude-plugins-official", "Incident source"),
      source("pagerduty", "@pagerduty", "plugin://pagerduty@claude-plugins-official", "Incident source"),
      source("coderabbit", "@coderabbit", "plugin://coderabbit@claude-plugins-official", "Code review source"),
      source("greptile", "@greptile", "plugin://greptile@claude-plugins-official", "Code search review source"),
      source("qodo", "@qodo-skills", "plugin://qodo-skills@claude-plugins-official", "Quality review source"),
      source("sonatype", "@sonatype-guide", "plugin://sonatype-guide@claude-plugins-official", "Dependency security source")
    ]
  },
  {
    id: "skills-mcp-runtime",
    title: "Explicit skills, MCP and primary runtime sources",
    label: "Skills / MCP / Runtime",
    strategy: "Make skill-backed, MCP-backed and bundled runtime sources visible as first-class portfolio environment sources.",
    sources: [
      source("azure-sdk-rust", "@azure-sdk-rust", "plugin://azure-sdk-rust@skills", "Rust Azure SDK skill source"),
      source("azure-sdk-java", "@azure-sdk-java", "plugin://azure-sdk-java@skills", "Java Azure SDK skill source"),
      source("azure-sdk-dotnet", "@azure-sdk-dotnet", "plugin://azure-sdk-dotnet@skills", ".NET Azure SDK skill source"),
      source("azure-sdk-python", "@azure-sdk-python", "plugin://azure-sdk-python@skills", "Python Azure SDK skill source"),
      source("deep-wiki", "@deep-wiki", "plugin://deep-wiki@skills", "Repository wiki skill source"),
      source("ui5-typescript-conversion", "@ui5-typescript-conversion", "plugin://ui5-typescript-conversion@claude-plugins-official", "UI5 TypeScript conversion skill source"),
      source("ui5", "@ui5", "plugin://ui5@claude-plugins-official", "SAPUI5 skill and MCP source"),
      source("togetherai-skills", "@togetherai-skills", "plugin://togetherai-skills@claude-plugins-official", "Together AI skill source"),
      source("netlify-skills", "@netlify-skills", "plugin://netlify-skills@claude-plugins-official", "Netlify skill source"),
      source("qodo-skills", "@qodo-skills", "plugin://qodo-skills@claude-plugins-official", "Qodo review skill source"),
      source("huggingface-skills-runtime", "@huggingface-skills", "plugin://huggingface-skills@claude-plugins-official", "Hugging Face skill source"),
      source("datahub-skills", "@datahub-skills", "plugin://datahub-skills@claude-plugins-official", "DataHub skill source"),
      source("liquid-skills", "@liquid-skills", "plugin://liquid-skills@claude-plugins-official", "Liquid theme skill source"),
      source("liquid-lsp", "@liquid-lsp", "plugin://liquid-lsp@claude-plugins-official", "Liquid language server source"),
      source("mcp-tunnels", "@mcp-tunnels", "plugin://mcp-tunnels@claude-plugins-official", "MCP tunnel source"),
      source("mcp-server-dev", "@mcp-server-dev", "plugin://mcp-server-dev@claude-plugins-official", "MCP server development source"),
      source("mcp-apps", "@mcp-apps", "plugin://mcp-apps@claude-plugins-official", "MCP app development source"),
      source("postman", "@postman", "plugin://postman@claude-plugins-official", "Postman MCP/API lifecycle source"),
      source("miro", "@miro", "plugin://miro@claude-plugins-official", "Miro board MCP source"),
      source("microsoft-docs", "@microsoft-docs", "plugin://microsoft-docs@claude-plugins-official", "Microsoft docs MCP source"),
      source("playwright", "@playwright", "plugin://playwright@claude-plugins-official", "Browser test skill source"),
      source("playground", "@playground", "plugin://playground@claude-plugins-official", "Interactive playground skill source"),
      source("plugin-dev", "@plugin-dev", "plugin://plugin-dev@claude-plugins-official", "Plugin development skill source"),
      source("plugin-eval", "@plugin-eval", "plugin://plugin-eval@openai-curated", "Plugin evaluation source"),
      source("skill-creator", "@skill-creator", "plugin://skill-creator@claude-plugins-official", "Skill creation source"),
      source("claude-md-management", "@claude-md-management", "plugin://claude-md-management@claude-plugins-official", "Project memory skill source"),
      source("claude-code-setup", "@claude-code-setup", "plugin://claude-code-setup@claude-plugins-official", "Agent setup skill source"),
      source("commit-commands", "@commit-commands", "plugin://commit-commands@claude-plugins-official", "Commit workflow skill source"),
      source("code-simplifier", "@code-simplifier", "plugin://code-simplifier@claude-plugins-official", "Code simplification skill source"),
      source("code-modernization", "@code-modernization", "plugin://code-modernization@claude-plugins-official", "Modernization skill source"),
      source("feature-dev", "@feature-dev", "plugin://feature-dev@claude-plugins-official", "Feature development skill source"),
      source("pr-review-toolkit", "@pr-review-toolkit", "plugin://pr-review-toolkit@claude-plugins-official", "PR review skill source"),
      source("security-guidance", "@security-guidance", "plugin://security-guidance@claude-plugins-official", "Security guidance skill source"),
      source("learning-output-style", "@learning-output-style", "plugin://learning-output-style@claude-plugins-official", "Learning output style source"),
      source("explanatory-output-style", "@explanatory-output-style", "plugin://explanatory-output-style@claude-plugins-official", "Explanatory output style source"),
      source("latex", "@latex", "plugin://latex@openai-bundled", "Bundled LaTeX runtime source"),
      source("chrome", "@chrome", "plugin://chrome@openai-bundled", "Bundled Chrome automation source"),
      source("browser", "@Browser", "plugin://Browser@openai-bundled", "Bundled browser source"),
      source("presentations", "@presentations", "plugin://presentations@openai-primary-runtime", "Primary presentation runtime source"),
      source("spreadsheets", "@spreadsheets", "plugin://spreadsheets@openai-primary-runtime", "Primary spreadsheet runtime source"),
      source("documents", "@documents", "plugin://documents@openai-primary-runtime", "Primary document runtime source")
    ]
  },
  {
    id: "data-finance-research",
    title: "Data, finance and research sources",
    label: "Data / Finance / Research",
    strategy: "Use for market, policy, finance, data and knowledge research surfaces. The website records them as source options instead of running private lookups.",
    sources: [
      source("thoughtspot", "@thoughtspot", "plugin://thoughtspot@openai-curated", "BI source"),
      source("motherduck", "@motherduck", "plugin://motherduck@openai-curated", "DuckDB cloud source"),
      source("deepnote", "@deepnote", "plugin://deepnote@openai-curated", "Notebook source"),
      source("data-analytics", "@data-analytics", "plugin://data-analytics@openai-curated-remote", "Analytics workflow source"),
      source("coupler", "@coupler-io", "plugin://coupler-io@openai-curated", "Business data source"),
      source("windsor", "@windsor-ai", "plugin://windsor-ai@claude-plugins-official", "Marketing data source"),
      source("omni", "@omni-analytics", "plugin://omni-analytics@openai-curated", "Semantic BI source"),
      source("cube", "@cube", "plugin://cube@openai-curated", "Metrics API source"),
      source("datarobot", "@datarobot-agent-skills", "plugin://datarobot-agent-skills@claude-plugins-official", "ML platform source"),
      source("clickhouse", "@clickhouse", "plugin://clickhouse@claude-plugins-official", "Analytics database source"),
      source("duckdb", "@duckdb-skills", "plugin://duckdb-skills@claude-plugins-official", "Local analytics source"),
      source("snowflake", "@snowflake-cortex-code", "plugin://snowflake-cortex-code@claude-plugins-official", "Snowflake AI source"),
      source("oracle", "@oracle-ai-data-platform-workbench-spark-connectors", "plugin://oracle-ai-data-platform-workbench-spark-connectors@claude-plugins-official", "Data platform source"),
      source("quartr", "@quartr", "plugin://quartr@openai-curated", "IR transcript source"),
      source("daloopa", "@daloopa", "plugin://daloopa@openai-curated", "Financial data source"),
      source("moody", "@moody-s", "plugin://moody-s@openai-curated", "Credit research source"),
      source("mt-newswires", "@mt-newswires", "plugin://mt-newswires@openai-curated", "Financial news source"),
      source("alpaca", "@alpaca", "plugin://alpaca@openai-curated", "Market data source"),
      source("binance", "@binance", "plugin://binance@openai-curated", "Crypto market source"),
      source("public-equity", "@public-equity-investing", "plugin://public-equity-investing@openai-curated-remote", "Public equity source"),
      source("investment-banking", "@investment-banking", "plugin://investment-banking@openai-curated-remote", "Deal analysis source"),
      source("zotero", "@zotero", "plugin://zotero@openai-curated", "Citation source"),
      source("readwise", "@readwise", "plugin://readwise@openai-curated", "Reading source"),
      source("mem", "@mem", "plugin://mem@openai-curated", "Knowledge memory source"),
      source("life-science", "@life-science-research", "plugin://life-science-research@openai-curated", "Science research source"),
      source("policynote", "@policynote", "plugin://policynote@openai-curated", "Policy research source"),
      source("govtribe", "@govtribe", "plugin://govtribe@openai-curated", "Government contract source"),
      source("factiva", "@dow-jones-factiva", "plugin://dow-jones-factiva@openai-curated", "News archive source"),
      source("dovetail", "@dovetail", "plugin://dovetail@openai-curated", "Research repository source"),
      source("coveo", "@coveo", "plugin://coveo@openai-curated", "Enterprise search source"),
      source("network-solutions", "@network-solutions", "plugin://network-solutions@openai-curated", "Domain source"),
      source("keybid-puls", "@keybid-puls", "plugin://keybid-puls@openai-curated", "Real estate ROI source"),
      source("skywatch", "@skywatch", "plugin://skywatch@openai-curated", "Satellite imagery source")
    ]
  }
];

export const polyglotSourceContracts: PolyglotSourceContract[] = [
  {
    id: "typescript-contracts",
    language: "TypeScript",
    extension: ".ts / .tsx",
    layer: "UI + API contracts",
    path: "packages/content/src/plugin-sources.ts",
    role: "Typed ecosystem source registry shared by portfolio UI and API routes.",
    status: "live"
  },
  {
    id: "css-visual-system",
    language: "CSS",
    extension: ".css",
    layer: "Design system",
    path: "apps/site-next/app/globals.css",
    role: "Responsive source console, premium typography rhythm and accessible states.",
    status: "live"
  },
  {
    id: "python-health",
    language: "Python",
    extension: ".py",
    layer: "Automation",
    path: "sources/polyglot/python/source_health.py",
    role: "Local source-health scoring contract for future CI checks.",
    status: "contract"
  },
  {
    id: "go-manifest",
    language: "Go",
    extension: ".go",
    layer: "Service manifest",
    path: "sources/polyglot/go/portfolio_source_manifest.go",
    role: "Typed service struct for exporting source readiness to Go services.",
    status: "contract"
  },
  {
    id: "rust-contract",
    language: "Rust",
    extension: ".rs",
    layer: "Systems contract",
    path: "sources/polyglot/rust/source_contract.rs",
    role: "Memory-safe source gate model for future native tooling.",
    status: "contract"
  },
  {
    id: "java-contract",
    language: "Java",
    extension: ".java",
    layer: "Enterprise contract",
    path: "sources/polyglot/java/PortfolioSourceContract.java",
    role: "Immutable source DTO for JVM integrations.",
    status: "contract"
  },
  {
    id: "csharp-contract",
    language: "C#",
    extension: ".cs",
    layer: ".NET contract",
    path: "sources/polyglot/csharp/PortfolioSourceContract.cs",
    role: "Record type for .NET source governance adapters.",
    status: "contract"
  },
  {
    id: "sql-readiness",
    language: "SQL",
    extension: ".sql",
    layer: "Persistence",
    path: "sources/polyglot/sql/source_readiness.sql",
    role: "Portable readiness view for future database-backed source status.",
    status: "contract"
  },
  {
    id: "graphql-schema",
    language: "GraphQL",
    extension: ".graphql",
    layer: "API schema",
    path: "sources/polyglot/graphql/source-schema.graphql",
    role: "Query contract for source groups and polyglot language cards.",
    status: "contract"
  },
  {
    id: "swift-contract",
    language: "Swift",
    extension: ".swift",
    layer: "Apple client",
    path: "sources/polyglot/swift/SourceContract.swift",
    role: "Mobile-friendly source card model for future iOS preview surfaces.",
    status: "contract"
  },
  {
    id: "kotlin-contract",
    language: "Kotlin",
    extension: ".kt",
    layer: "Android client",
    path: "sources/polyglot/kotlin/SourceContract.kt",
    role: "Android source card model for future mobile portfolio surfaces.",
    status: "contract"
  },
  {
    id: "php-adapter",
    language: "PHP",
    extension: ".php",
    layer: "CMS adapter",
    path: "sources/polyglot/php/source_contract.php",
    role: "CMS-side source serialization helper.",
    status: "contract"
  },
  {
    id: "ruby-adapter",
    language: "Ruby",
    extension: ".rb",
    layer: "Automation adapter",
    path: "sources/polyglot/ruby/source_contract.rb",
    role: "Small source grouping helper for future content scripts.",
    status: "contract"
  }
];

export const ecosystemSourceTotal = ecosystemSourceGroups.reduce(
  (total, group) => total + group.sources.length,
  0
);

export const ecosystemSourceFlatList: EcosystemSourceRecord[] = ecosystemSourceGroups.flatMap((group) =>
  group.sources.map((item) => {
    const sourceKind = getSourceKind(item);
    const connectionDetails = getSourceConnectionDetails(item, sourceKind);

    return {
      ...item,
      groupId: group.id,
      groupLabel: group.label,
      sourceKind,
      sourceProvider: getSourceProvider(item.plugin),
      ...connectionDetails
    };
  })
);

export const ecosystemPluginRefs = [...new Set(ecosystemSourceFlatList.map((item) => item.plugin))].sort();

export const ecosystemSourceKindSummary = ecosystemSourceFlatList.reduce(
  (summary, item) => ({
    ...summary,
    [item.sourceKind]: summary[item.sourceKind] + 1
  }),
  {
    plugin: 0,
    skill: 0,
    app: 0,
    mcp: 0,
    runtime: 0,
    agent: 0,
    bundled: 0
  } satisfies Record<EcosystemSourceKind, number>
);

export const ecosystemConnectionStateSummary = ecosystemSourceFlatList.reduce(
  (summary, item) => ({
    ...summary,
    [item.connectionState]: summary[item.connectionState] + 1
  }),
  {
    manifest_only: 0,
    session_available: 0,
    tool_discovered: 0,
    tool_invoked: 0,
    reauth_required: 0,
    missing_connection: 0
  } satisfies Record<EcosystemSourceConnectionState, number>
);

export const ecosystemInstallPolicySummary = ecosystemSourceFlatList.reduce(
  (summary, item) => ({
    ...summary,
    [item.installPolicy]: summary[item.installPolicy] + 1
  }),
  {
    no_install_needed: 0,
    future_task_only: 0,
    requires_user_auth: 0,
    requires_connection_setup: 0
  } satisfies Record<EcosystemSourceInstallPolicy, number>
);

function getSourceIdsForReadiness(predicate: (source: EcosystemSourceRecord) => boolean): string[] {
  return ecosystemSourceFlatList.filter(predicate).map((item) => item.id).sort();
}

const connectedSourceIds = getSourceIdsForReadiness((source) => source.connectionState === "tool_invoked");
const availableSourceIds = getSourceIdsForReadiness((source) => source.connectionState === "session_available");
const discoveredSourceIds = getSourceIdsForReadiness((source) => source.connectionState === "tool_discovered");
const blockedSourceIds = getSourceIdsForReadiness((source) =>
  source.connectionState === "reauth_required" || source.connectionState === "missing_connection"
);
const manifestOnlySourceIds = getSourceIdsForReadiness((source) => source.connectionState === "manifest_only");
const platformEvidenceSourceIds = [...connectedSourceIds, ...discoveredSourceIds, ...blockedSourceIds].sort();
const platformCallableSourceIds = getSourceIdsForReadiness((source) => source.sidePanelMode === "platform_tool");
const allSourceIds = ecosystemSourceFlatList.map((source) => source.id).sort();
const noInstallNeededSourceIds = getSourceIdsForReadiness((source) => source.installPolicy === "no_install_needed");
const authRequiredSourceIds = getSourceIdsForReadiness((source) => source.installPolicy === "requires_user_auth");
const connectionSetupSourceIds = getSourceIdsForReadiness((source) => source.installPolicy === "requires_connection_setup");
const futureTaskOnlySourceIds = getSourceIdsForReadiness((source) => source.installPolicy === "future_task_only");

function getGroupSourceIds(groupId: string): string[] {
  return ecosystemSourceFlatList.filter((source) => source.groupId === groupId).map((source) => source.id).sort();
}

function getUniqueSourceIds(sourceIds: string[]): string[] {
  return [...new Set(sourceIds)].sort();
}

function getEmptySourceKindSummary(): Record<EcosystemSourceKind, number> {
  return {
    plugin: 0,
    skill: 0,
    app: 0,
    mcp: 0,
    runtime: 0,
    agent: 0,
    bundled: 0
  };
}

function getSignalAction(strongestState: EcosystemSourceSignalMapItem["strongestState"]): string {
  if (strongestState === "live_evidence") return "Use as immediate proof for the next portfolio source pass.";
  if (strongestState === "callable") return "Promote one callable source only when a concrete task needs it.";
  if (strongestState === "gated") return "Resolve the exact provider auth or connection setup outside git.";
  if (strongestState === "blocked") return "Keep blocked providers visible and avoid retry loops until credentials change.";
  return "Keep cataloged locally until a specific portfolio workflow selects this group.";
}

function getSignalState(records: EcosystemSourceRecord[]): EcosystemSourceSignalMapItem["strongestState"] {
  const invoked = records.some((source) => source.connectionState === "tool_invoked");
  const callable = records.some((source) =>
    source.connectionState === "tool_discovered" ||
    source.connectionState === "session_available" ||
    source.sidePanelMode === "platform_tool"
  );
  const gated = records.some((source) =>
    source.installPolicy === "requires_user_auth" ||
    source.installPolicy === "requires_connection_setup"
  );
  const blocked = records.every((source) =>
    source.connectionState === "reauth_required" ||
    source.connectionState === "missing_connection"
  );

  if (blocked) return "blocked";
  if (invoked) return "live_evidence";
  if (callable) return "callable";
  if (gated) return "gated";
  return "cataloged";
}

function getExecutionPriority(
  signalState: EcosystemSourceSignalMapItem["strongestState"]
): EcosystemSourceExecutionPriority {
  if (signalState === "live_evidence") return "now";
  if (signalState === "callable") return "next";
  if (signalState === "gated" || signalState === "blocked") return "blocked";
  return "backlog";
}

function createSourceSignalMapItem(group: EcosystemSourceGroup): EcosystemSourceSignalMapItem {
  const records = ecosystemSourceFlatList.filter((source) => source.groupId === group.id);
  const strongestState = getSignalState(records);
  const sourceKinds = records.reduce((summary, source) => {
    summary[source.sourceKind] += 1;
    return summary;
  }, getEmptySourceKindSummary());

  return {
    id: group.id,
    label: group.label,
    strategy: group.strategy,
    total: records.length,
    invoked: records.filter((source) => source.connectionState === "tool_invoked").length,
    callable: records.filter((source) =>
      source.connectionState === "tool_discovered" ||
      source.connectionState === "session_available" ||
      source.sidePanelMode === "platform_tool"
    ).length,
    blocked: records.filter((source) => blockedSourceIds.includes(source.id)).length,
    manifestOnly: records.filter((source) => source.connectionState === "manifest_only").length,
    authGated: records.filter((source) => source.installPolicy === "requires_user_auth").length,
    connectionGated: records.filter((source) => source.installPolicy === "requires_connection_setup").length,
    futureOnly: records.filter((source) => source.installPolicy === "future_task_only").length,
    sourceKinds,
    providers: [...new Set(records.map((source) => source.sourceProvider))].sort(),
    strongestState,
    action: getSignalAction(strongestState),
    outputPath: "/api/source-signal-map"
  };
}

export const ecosystemSourceSignalMap: EcosystemSourceSignalMapItem[] = ecosystemSourceGroups.map(createSourceSignalMapItem);

function createAggressiveDevelopmentLane(
  lane: Omit<
    EcosystemAggressiveDevelopmentLane,
    "count" | "connectedCount" | "callableCount" | "blockedCount" | "manifestCount"
  >
): EcosystemAggressiveDevelopmentLane {
  const sourceIds = getUniqueSourceIds(lane.sourceIds);
  const sourceSet = new Set(sourceIds);

  return {
    ...lane,
    sourceIds,
    count: sourceIds.length,
    connectedCount: sourceIds.filter((id) => connectedSourceIds.includes(id) || discoveredSourceIds.includes(id)).length,
    callableCount: sourceIds.filter((id) => platformCallableSourceIds.includes(id)).length,
    blockedCount: sourceIds.filter((id) => blockedSourceIds.includes(id)).length,
    manifestCount: ecosystemSourceFlatList.filter((source) => sourceSet.has(source.id) && source.connectionState === "manifest_only").length
  };
}

export const ecosystemSourceReadinessMatrix: EcosystemSourceReadinessLane[] = [
  {
    id: "connected",
    label: "Invoked in this session",
    status: "ready",
    description: "Connectors or tools that were actually called and produced a local evidence record.",
    sourceIds: connectedSourceIds,
    count: connectedSourceIds.length,
    nextAction: "Use these as the strongest platform Sources evidence."
  },
  {
    id: "available",
    label: "Available in session",
    status: "available",
    description: "Plugins, skills or apps exposed in the current environment and ready for task-specific activation.",
    sourceIds: availableSourceIds,
    count: availableSourceIds.length,
    nextAction: "Invoke only when the portfolio needs that exact authenticated capability."
  },
  {
    id: "discovered",
    label: "Tool discovered",
    status: "discovered",
    description: "Tools that were discoverable, but external project creation was intentionally left opt-in.",
    sourceIds: discoveredSourceIds,
    count: discoveredSourceIds.length,
    nextAction: "Create external builds only after choosing a target provider."
  },
  {
    id: "blocked",
    label: "Auth or connection blocked",
    status: "blocked",
    description: "Sources that were attempted but require user reauthentication or provider connection setup.",
    sourceIds: blockedSourceIds,
    count: blockedSourceIds.length,
    nextAction: "Complete provider auth or Snowflake connection setup outside the repo."
  },
  {
    id: "manifest",
    label: "Manifest-only backlog",
    status: "queued",
    description: "Requested plugin refs represented locally without starting credentialed external calls.",
    sourceIds: manifestOnlySourceIds,
    count: manifestOnlySourceIds.length,
    nextAction: "Promote one source at a time when a concrete connector task exists."
  }
];

export const ecosystemSourceActivationPlan: EcosystemSourceActivationPlan[] = [
  {
    id: "evidence-first-sources",
    title: "Publish invoked source evidence first",
    priority: "now",
    sourceIds: connectedSourceIds,
    count: connectedSourceIds.length,
    outputPath: "/api/source-connection-evidence",
    action: "Use invoked connectors as the strongest proof that platform Sources were actually touched.",
    guardrail: "Keep payloads read-only and avoid exposing private account details."
  },
  {
    id: "builder-provider-choice",
    title: "Choose one external builder lane",
    priority: "next",
    sourceIds: [...new Set(["base44", "replit", "lovable", "wix"])],
    count: 4,
    outputPath: "/api/source-activation-plan",
    action: "Pick exactly one external builder before creating a hosted duplicate of the local portfolio.",
    guardrail: "Do not create external projects automatically while the local portfolio remains the source of truth."
  },
  {
    id: "auth-and-connection-unblock",
    title: "Unblock auth and provider connections",
    priority: "blocked",
    sourceIds: blockedSourceIds,
    count: blockedSourceIds.length,
    outputPath: "/api/source-readiness",
    action: "Complete Wix reauthentication and Snowflake connection setup before retrying those live tools.",
    guardrail: "Credentials stay outside git; the portfolio records only status, not secrets."
  },
  {
    id: "session-tool-promotion",
    title: "Promote session-available tools by concrete task",
    priority: "next",
    sourceIds: availableSourceIds,
    count: availableSourceIds.length,
    outputPath: "/api/ecosystem-sources",
    action: "Move one available connector at a time from session_available to tool_invoked when a real portfolio task needs it.",
    guardrail: "Avoid bulk invocation because many connectors can read or write private external data."
  },
  {
    id: "manifest-backlog-governance",
    title: "Keep the full plugin backlog visible",
    priority: "backlog",
    sourceIds: manifestOnlySourceIds,
    count: manifestOnlySourceIds.length,
    outputPath: "/api/source-package",
    action: "Keep every submitted plugin ref exported even before authentication or live provider work exists.",
    guardrail: "Treat manifest-only records as future-ready references, not evidence of live external calls."
  }
];

export const ecosystemAggressiveDevelopmentLanes: EcosystemAggressiveDevelopmentLane[] = [
  createAggressiveDevelopmentLane({
    id: "connected-plugin-command-center",
    title: "Connected plugin command center",
    priority: "now",
    posture: "command",
    sourceIds: [...platformCallableSourceIds, ...platformEvidenceSourceIds],
    outputPath: "/api/aggressive-development-plan",
    actionNow: "Drive the next portfolio pass from already invoked, discovered or session-callable sources before touching auth-gated providers.",
    usesConnectedPlugins: "Uses every currently callable or evidenced source as the active command surface.",
    blocker: "Platform side-panel icons may stay compact even when the local command center is complete.",
    guardrail: "Do not bulk-run providers; route each source to one concrete portfolio task."
  }),
  createAggressiveDevelopmentLane({
    id: "build-host-deploy-sprint",
    title: "Build, host and deploy sprint",
    priority: "now",
    posture: "build",
    sourceIds: getGroupSourceIds("builders-hosting-runtime"),
    outputPath: "/sources",
    actionNow: "Harden the portfolio's local build, API source package and deployment-readiness story before creating another hosted duplicate.",
    usesConnectedPlugins: "Uses builder and hosting plugins as architecture references, with local Next APIs as the source of truth.",
    blocker: "Wix is reauth-blocked and external builder creation remains opt-in.",
    guardrail: "Keep deployment credentials and provider projects outside git until a single target is chosen."
  }),
  createAggressiveDevelopmentLane({
    id: "creative-cinematic-production-sprint",
    title: "Creative cinematic production sprint",
    priority: "next",
    posture: "creative",
    sourceIds: getGroupSourceIds("creative-media-design"),
    outputPath: "/api/ai-helper-orchestration",
    actionNow: "Use creative sources to plan image, video, design-system and motion asset work for the portfolio's premium visual layer.",
    usesConnectedPlugins: "Uses Fal, Shutterstock, Figma, Cloudinary and related creative tools as task-routed asset lanes.",
    blocker: "Licensed media and generative assets need a concrete brief before live generation or download.",
    guardrail: "No bulk asset generation, no unclear license use and no duplicate design projects."
  }),
  createAggressiveDevelopmentLane({
    id: "analytics-gtm-growth-sprint",
    title: "Analytics and GTM growth sprint",
    priority: "next",
    posture: "growth",
    sourceIds: getGroupSourceIds("analytics-gtm-intelligence"),
    outputPath: "/api/source-readiness",
    actionNow: "Turn analytics, SEO, market and CRM sources into a future measurement and discoverability plan.",
    usesConnectedPlugins: "Uses GTM plugins as readiness inputs for SEO, conversion, buyer intelligence and portfolio visibility.",
    blocker: "Most GTM tools require private account data or paid provider access before live analysis.",
    guardrail: "Never pull CRM, email, contact or paid market data without a specific approved question."
  }),
  createAggressiveDevelopmentLane({
    id: "ops-collaboration-automation-sprint",
    title: "Ops and collaboration automation sprint",
    priority: "blocked",
    posture: "ops",
    sourceIds: getGroupSourceIds("productivity-sales-ops"),
    outputPath: "/api/source-side-panel",
    actionNow: "Prepare scheduling, docs, task, email and collaboration workflows as auth-gated portfolio operations lanes.",
    usesConnectedPlugins: "Uses connected collaboration plugins only as explicit future workflow surfaces.",
    blocker: "Email, calendar, CRM, docs and collaboration providers require user auth and private workspace access.",
    guardrail: "Do not read inboxes, calendars, CRMs or documents for a visual portfolio improvement by default."
  }),
  createAggressiveDevelopmentLane({
    id: "engineering-quality-security-sprint",
    title: "Engineering, quality and security sprint",
    priority: "now",
    posture: "quality",
    sourceIds: getGroupSourceIds("engineering-ai-security"),
    outputPath: "/api/health",
    actionNow: "Use coding, AI, observability and security plugins to keep source APIs typed, bounded, inspectable and low-risk.",
    usesConnectedPlugins: "Uses Codex, frontend-design, security, test, observability and AI workflow sources as the local quality engine.",
    blocker: "Some security and telemetry providers need workspace auth or project configuration before live scans.",
    guardrail: "Prefer lightweight local checks first; escalate to external scanners only for focused risk review."
  }),
  createAggressiveDevelopmentLane({
    id: "skills-runtime-source-lab-sprint",
    title: "Skills, MCP and runtime source lab sprint",
    priority: "now",
    posture: "quality",
    sourceIds: getGroupSourceIds("skills-mcp-runtime"),
    outputPath: "sources/polyglot",
    actionNow: "Keep skills, MCPs and bundled runtimes visible as repo-local source contracts and future adapter lanes.",
    usesConnectedPlugins: "Uses session-available skills and bundled tools as the safest immediate extension surface.",
    blocker: "Some runtime tools are available only after tool discovery or task-specific activation.",
    guardrail: "Avoid dependency inflation; represent capability with contracts until a real adapter is needed."
  }),
  createAggressiveDevelopmentLane({
    id: "data-research-finance-sprint",
    title: "Data, research and finance sprint",
    priority: "backlog",
    posture: "research",
    sourceIds: getGroupSourceIds("data-finance-research"),
    outputPath: "/api/source-package",
    actionNow: "Hold data, finance, policy, geospatial and research sources as future intelligence lanes for portfolio proof and analysis.",
    usesConnectedPlugins: "Uses research plugins as cataloged options until a specific public-data or account-backed research task is chosen.",
    blocker: "Many research/data providers need paid access, account auth or a precise query.",
    guardrail: "Do not query private datasets, financial accounts or paid sources just to increase activity."
  })
];

function getLaneIdsForSourceIds(sourceIds: string[]): string[] {
  const sourceSet = new Set(sourceIds);
  return ecosystemAggressiveDevelopmentLanes
    .filter((lane) => lane.sourceIds.some((sourceId) => sourceSet.has(sourceId)))
    .map((lane) => lane.id)
    .sort();
}

function getExecutionGuardrail(priority: EcosystemSourceExecutionPriority): string {
  if (priority === "now") return "Use local evidence and read-only source outputs before any external write.";
  if (priority === "next") return "Promote exactly one callable provider when a concrete portfolio task needs it.";
  if (priority === "blocked") return "Stop at the blocker until user auth or provider connection setup changes.";
  return "Keep visible in the backlog; do not bulk-invoke or install catalog-only providers.";
}

function createSourceExecutionQueueItem(
  signal: EcosystemSourceSignalMapItem
): EcosystemSourceExecutionQueueItem {
  const priority = getExecutionPriority(signal.strongestState);
  const sourceIds = getGroupSourceIds(signal.id);

  return {
    id: `${signal.id}-execution`,
    label: `${signal.label} execution queue`,
    priority,
    sourceFamilyId: signal.id,
    sourceFamilyLabel: signal.label,
    sourceIds,
    count: sourceIds.length,
    signalState: signal.strongestState,
    laneIds: getLaneIdsForSourceIds(sourceIds),
    outputPath: "/api/source-execution-queue",
    action: signal.action,
    guardrail: getExecutionGuardrail(priority),
    acceptanceCriteria: [
      "Source family remains visible in /sources.",
      "Machine-readable queue is available at /api/source-execution-queue.",
      "No credentialed provider call is made by this queue.",
      "Next work stays bounded to one source family or one local surface."
    ]
  };
}

const executionPriorityOrder: Record<EcosystemSourceExecutionPriority, number> = {
  now: 0,
  next: 1,
  blocked: 2,
  backlog: 3
};

export const ecosystemSourceExecutionQueue: EcosystemSourceExecutionQueueItem[] = ecosystemSourceSignalMap
  .map(createSourceExecutionQueueItem)
  .sort((left, right) =>
    executionPriorityOrder[left.priority] - executionPriorityOrder[right.priority] ||
    right.count - left.count ||
    left.label.localeCompare(right.label)
  );

const sourceActionPacketModeByFamily: Record<string, EcosystemSourceActionPacketMode> = {
  "builders-hosting-runtime": "build",
  "creative-media-design": "creative",
  "analytics-gtm-intelligence": "growth",
  "productivity-sales-ops": "ops",
  "engineering-ai-security": "quality",
  "skills-mcp-runtime": "quality",
  "data-finance-research": "research"
};

function getActionPacketMode(item: EcosystemSourceExecutionQueueItem): EcosystemSourceActionPacketMode {
  return sourceActionPacketModeByFamily[item.sourceFamilyId] || (item.priority === "backlog" ? "backlog" : "command");
}

function getActionPacketEvidencePaths(item: EcosystemSourceExecutionQueueItem): string[] {
  const lanePaths = ecosystemAggressiveDevelopmentLanes
    .filter((lane) => item.laneIds.includes(lane.id))
    .map((lane) => lane.outputPath);

  return [...new Set(["/sources", "/ops", "/api/source-action-packets", "/api/source-execution-queue", item.outputPath, ...lanePaths])];
}

function getActionPacketStopCondition(priority: EcosystemSourceExecutionPriority): string {
  if (priority === "blocked") return "Stop at local representation until user auth or provider connection setup is complete.";
  if (priority === "backlog") return "Stop after cataloging; do not invoke backlog providers without a concrete approved task.";
  return "Stop after one reversible local portfolio improvement and passing lightweight validation.";
}

function createSourceActionPacket(item: EcosystemSourceExecutionQueueItem): EcosystemSourceActionPacket {
  const packetMode = getActionPacketMode(item);

  return {
    id: `${item.sourceFamilyId}-action-packet`,
    label: `${item.sourceFamilyLabel} action packet`,
    queueId: item.id,
    priority: item.priority,
    packetMode,
    sourceFamilyId: item.sourceFamilyId,
    sourceFamilyLabel: item.sourceFamilyLabel,
    sourceIds: item.sourceIds,
    count: item.count,
    laneIds: item.laneIds,
    evidencePaths: getActionPacketEvidencePaths(item),
    objective: `Turn the ${item.sourceFamilyLabel.toLowerCase()} source family into one ${item.priority} portfolio improvement without bulk provider calls.`,
    firstMove: item.action,
    localValidation: [
      "npx tsc -p packages/content/tsconfig.json --noEmit",
      "npx tsc -p apps/site-next/tsconfig.json --noEmit",
      "npm run check:source-boundaries",
      "git diff --check"
    ],
    stopCondition: getActionPacketStopCondition(item.priority),
    handoffPath: "/api/source-action-packets",
    guardrail: item.guardrail,
    acceptanceCriteria: [
      ...item.acceptanceCriteria,
      "Action packet is visible in /sources.",
      "Machine-readable packet is available at /api/source-action-packets.",
      "Packet explains validation and stop conditions before any provider escalation."
    ]
  };
}

export const ecosystemSourceActionPackets: EcosystemSourceActionPacket[] = ecosystemSourceExecutionQueue.map(createSourceActionPacket);

const actionBoardPriorityLabels: Record<EcosystemSourceExecutionPriority, string> = {
  now: "Now",
  next: "Next",
  blocked: "Blocked",
  backlog: "Backlog"
};

const actionBoardModeLabels: Record<EcosystemSourceActionPacketMode, string> = {
  command: "Command",
  build: "Build",
  creative: "Creative",
  growth: "Growth",
  ops: "Ops",
  quality: "Quality",
  research: "Research",
  backlog: "Backlog"
};

const actionBoardPriorities: EcosystemSourceExecutionPriority[] = ["now", "next", "blocked", "backlog"];
const actionBoardModes: EcosystemSourceActionPacketMode[] = [
  "command",
  "build",
  "creative",
  "growth",
  "ops",
  "quality",
  "research",
  "backlog"
];

function getActionBoardRiskNote(priority: EcosystemSourceExecutionPriority): string {
  if (priority === "blocked") return "Auth or provider setup must change before live escalation.";
  if (priority === "backlog") return "Catalog only; keep visible without provider calls.";
  if (priority === "next") return "Promote one packet only after a concrete portfolio task chooses it.";
  return "Safe for one local reversible pass with lightweight validation.";
}

export const ecosystemSourceActionBoard: EcosystemSourceActionBoard = {
  id: "source-action-board",
  label: "Source action board",
  handoffPath: "/api/source-action-board",
  packetCount: ecosystemSourceActionPackets.length,
  sourceCount: ecosystemSourceActionPackets.reduce((total, packet) => total + packet.count, 0),
  columns: actionBoardPriorities.map((priority) => {
    const packets = ecosystemSourceActionPackets.filter((packet) => packet.priority === priority);
    const leadingPacket = packets[0];

    return {
      id: priority,
      label: actionBoardPriorityLabels[priority],
      packetIds: packets.map((packet) => packet.id),
      count: packets.length,
      sourceCount: packets.reduce((total, packet) => total + packet.count, 0),
      leadingPacketId: leadingPacket?.id || null,
      nextMove: leadingPacket?.firstMove || "No packet is currently assigned to this column.",
      riskNote: getActionBoardRiskNote(priority)
    };
  }),
  modes: actionBoardModes.map((packetMode) => {
    const packets = ecosystemSourceActionPackets.filter((packet) => packet.packetMode === packetMode);

    return {
      id: packetMode,
      label: actionBoardModeLabels[packetMode],
      packetIds: packets.map((packet) => packet.id),
      count: packets.length,
      sourceCount: packets.reduce((total, packet) => total + packet.count, 0)
    };
  }),
  nextPacketId: ecosystemSourceActionPackets.find((packet) => packet.priority === "now")?.id || null,
  operatingRule: "Work one packet at a time, validate locally, then stop before credentialed provider escalation."
};

const allActionPacketIds = ecosystemSourceActionPackets.map((packet) => packet.id);
const nowActionPacketIds = ecosystemSourceActionPackets.filter((packet) => packet.priority === "now").map((packet) => packet.id);

export const ecosystemSourceQualityGates: EcosystemSourceQualityGate[] = [
  {
    id: "content-typecheck-gate",
    label: "Content package typecheck",
    gateType: "typecheck",
    priority: "required",
    command: "npx tsc -p packages/content/tsconfig.json --noEmit",
    scope: "packages/content",
    packetIds: allActionPacketIds,
    evidencePath: "/api/source-quality-gates",
    passSignal: "Source registry types, derived packet contracts and export manifests compile.",
    failureResponse: "Stop and fix content model drift before touching UI or GitHub publish."
  },
  {
    id: "site-next-typecheck-gate",
    label: "Next app typecheck",
    gateType: "typecheck",
    priority: "required",
    command: "npx tsc -p apps/site-next/tsconfig.json --noEmit",
    scope: "apps/site-next",
    packetIds: allActionPacketIds,
    evidencePath: "/api/source-quality-gates",
    passSignal: "Source UI pages and API routes consume the content package without type drift.",
    failureResponse: "Stop and repair imports, props or route payloads before visual polish."
  },
  {
    id: "source-boundary-gate",
    label: "Source boundary check",
    gateType: "boundary",
    priority: "required",
    command: "npm run check:source-boundaries",
    scope: "source APIs and content boundaries",
    packetIds: allActionPacketIds,
    evidencePath: "/api/source-quality-gates",
    passSignal: "Source records remain in allowed public metadata boundaries.",
    failureResponse: "Stop and remove credential-bearing or out-of-bound source data."
  },
  {
    id: "lint-gate",
    label: "Repository lint",
    gateType: "lint",
    priority: "required",
    command: "npm run lint",
    scope: "workspace lint surface",
    packetIds: nowActionPacketIds,
    evidencePath: "/api/source-quality-gates",
    passSignal: "Changed source and UI files satisfy repository lint rules.",
    failureResponse: "Stop and fix style or static-analysis issues before commit."
  },
  {
    id: "content-runtime-gate",
    label: "Content and runtime checks",
    gateType: "runtime",
    priority: "recommended",
    command: "npm run check:content && npm run check:runtime",
    scope: "content counts and runtime readiness",
    packetIds: nowActionPacketIds,
    evidencePath: "/api/source-quality-gates",
    passSignal: "Portfolio content counts and runtime connector summaries remain coherent.",
    failureResponse: "Stop and report whether the blocker is content drift or runtime readiness."
  },
  {
    id: "source-smoke-gate",
    label: "Source API smoke",
    gateType: "smoke",
    priority: "recommended",
    command: "fetch /api/source-action-board, /api/source-quality-gates and /sources on the local dev server",
    scope: "local preview",
    packetIds: nowActionPacketIds,
    evidencePath: "/sources",
    passSignal: "Human UI and machine-readable source APIs expose the same source governance layer.",
    failureResponse: "Stop and fix the route, render, or summary mismatch before pushing."
  }
];

export const ecosystemSourceRunbook: EcosystemSourceRunbook = {
  id: "source-aggressive-runbook",
  label: "Source aggressive runbook",
  packetId: ecosystemSourceActionBoard.nextPacketId,
  boardPath: ecosystemSourceActionBoard.handoffPath,
  qualityGatePath: "/api/source-quality-gates",
  operatingRule: "Start from the board, work the leading now packet, run required gates first, then publish only after preflight is clean.",
  steps: [
    {
      id: "confirm-clean-branch",
      label: "Confirm clean branch and source target",
      order: 1,
      phase: "preflight",
      gateIds: [],
      command: "git status --short --branch",
      expectedSignal: "Branch is codex/seis-ux-cinematic-premium-foundation and unrelated dirty files are absent.",
      stopRule: "Stop and report unrelated dirty files before editing.",
      handoffPath: "/api/source-runbook"
    },
    {
      id: "read-action-board",
      label: "Read action board and leading packet",
      order: 2,
      phase: "contract",
      gateIds: ["source-smoke-gate"],
      command: "fetch /api/source-action-board",
      expectedSignal: "Board returns the leading now packet and operating rule.",
      stopRule: "Stop if the board route is unavailable or nextPacketId is empty.",
      handoffPath: "/api/source-action-board"
    },
    {
      id: "edit-bounded-source-surface",
      label: "Edit one bounded source surface",
      order: 3,
      phase: "implementation",
      gateIds: [],
      command: "apply one reversible content/API/UI/docs change",
      expectedSignal: "The change is visible in /sources and represented in a machine-readable API.",
      stopRule: "Stop before provider authentication, paid media, external project creation or private workspace reads.",
      handoffPath: "/sources"
    },
    {
      id: "run-required-gates",
      label: "Run required source quality gates",
      order: 4,
      phase: "validation",
      gateIds: ["content-typecheck-gate", "site-next-typecheck-gate", "source-boundary-gate", "lint-gate"],
      command: "npx tsc -p packages/content/tsconfig.json --noEmit && npx tsc -p apps/site-next/tsconfig.json --noEmit && npm run check:source-boundaries && npm run lint",
      expectedSignal: "Required type, source boundary and lint gates pass.",
      stopRule: "Stop and fix the first failing gate before any commit.",
      handoffPath: "/api/source-quality-gates"
    },
    {
      id: "run-recommended-gates",
      label: "Run recommended content/runtime and smoke checks",
      order: 5,
      phase: "validation",
      gateIds: ["content-runtime-gate", "source-smoke-gate"],
      command: "npm run check:content && npm run check:runtime && fetch /api/source-runbook",
      expectedSignal: "Content/runtime checks pass and runbook route returns the updated handoff.",
      stopRule: "Report any local preview blocker separately from code validation.",
      handoffPath: "/api/source-runbook"
    },
    {
      id: "publish-after-preflight",
      label: "Commit, preflight and push",
      order: 6,
      phase: "publish",
      gateIds: [],
      command: "git commit, npm run github:preflight, git push origin codex/seis-ux-cinematic-premium-foundation",
      expectedSignal: "Preflight reports ready=true and GitHub accepts the branch push.",
      stopRule: "Never force push; report fetch-first, auth or vulnerability warnings separately.",
      handoffPath: "GitHub origin branch"
    }
  ]
};

export const ecosystemSourceExecutionReceipts: EcosystemSourceExecutionReceipt[] = [
  {
    id: "action-board-receipt",
    label: "Action board receipt",
    receiptType: "board",
    status: "operator_handoff",
    evidencePath: "/api/source-action-board",
    sourceIds: ecosystemSourceActionBoard.columns.map((column) => column.id),
    count: ecosystemSourceActionBoard.columns.length,
    proves: "Priority columns exist for now, next, blocked and backlog source work.",
    nextAction: "Start from the leading now packet before choosing another source family."
  },
  {
    id: "action-packet-receipt",
    label: "Action packet receipt",
    receiptType: "packet",
    status: "machine_readable",
    evidencePath: "/api/source-action-packets",
    sourceIds: ecosystemSourceActionPackets.map((packet) => packet.id),
    count: ecosystemSourceActionPackets.length,
    proves: "Each source family has a bounded agent-ready action contract.",
    nextAction: "Use one packet at a time and stop before credentialed provider escalation."
  },
  {
    id: "quality-gate-receipt",
    label: "Quality gate receipt",
    receiptType: "gate",
    status: "ready",
    evidencePath: "/api/source-quality-gates",
    sourceIds: ecosystemSourceQualityGates.map((gate) => gate.id),
    count: ecosystemSourceQualityGates.length,
    proves: "Required and recommended local validation gates are published.",
    nextAction: "Run required gates before commit and recommended gates before push when practical."
  },
  {
    id: "runbook-receipt",
    label: "Runbook receipt",
    receiptType: "runbook",
    status: "operator_handoff",
    evidencePath: "/api/source-runbook",
    sourceIds: ecosystemSourceRunbook.steps.map((step) => step.id),
    count: ecosystemSourceRunbook.steps.length,
    proves: "Aggressive source work has an ordered preflight, validation and publish sequence.",
    nextAction: "Follow the runbook order for the next bounded source change."
  },
  {
    id: "human-ui-receipt",
    label: "Human UI receipt",
    receiptType: "ui",
    status: "visible",
    evidencePath: "/sources",
    sourceIds: ["sources-command-page", "source-action-board", "source-quality-gates", "source-runbook"],
    count: 4,
    proves: "The source governance layers are visible on the public command page.",
    nextAction: "Use /sources for human review and API links for agent handoff."
  },
  {
    id: "source-package-receipt",
    label: "Source package receipt",
    receiptType: "package",
    status: "machine_readable",
    evidencePath: "/api/source-package",
    sourceIds: ["source-package", "source-export-index", "source-delivery"],
    count: 3,
    proves: "The complete source package exports board, packets, gates, runbook and source records.",
    nextAction: "Use /api/source-package as the broadest machine-readable handoff."
  }
];

export const ecosystemPluginInstallPlan: EcosystemPluginInstallPlan[] = [
  {
    id: "already-available-session-capabilities",
    title: "Use already available session capabilities",
    phase: "ready",
    sourceIds: noInstallNeededSourceIds,
    count: noInstallNeededSourceIds.length,
    outputPath: "/api/source-side-panel",
    action: "Use installed, bundled or session-available sources first; no extra download is needed for this portfolio source console.",
    guardrail: "Invoke each provider only when a concrete task needs its data, media or deployment surface."
  },
  {
    id: "reauth-required-providers",
    title: "Complete provider login or reauth",
    phase: "needs_auth",
    sourceIds: authRequiredSourceIds,
    count: authRequiredSourceIds.length,
    outputPath: "/api/source-readiness",
    action: "Complete provider login outside git, then retry the exact blocked connector.",
    guardrail: "Never store account tokens, cookies, connection strings or session exports in the repository."
  },
  {
    id: "connection-setup-required",
    title: "Configure required connection profiles",
    phase: "needs_connection",
    sourceIds: connectionSetupSourceIds,
    count: connectionSetupSourceIds.length,
    outputPath: "/api/source-readiness",
    action: "Create the provider connection profile on the machine, then rerun the single source check.",
    guardrail: "Connection files and secrets stay in user-level config, not in portfolio code."
  },
  {
    id: "future-task-only-backlog",
    title: "Keep future connector backlog visible",
    phase: "future_task",
    sourceIds: futureTaskOnlySourceIds,
    count: futureTaskOnlySourceIds.length,
    outputPath: "/api/source-package",
    action: "Promote one provider only after a real portfolio workflow chooses it.",
    guardrail: "Do not create duplicate hosted projects, CRM records, payments, meetings or data lookups just to make a source appear."
  },
  {
    id: "no-bulk-install-rule",
    title: "No bulk install or bulk invocation rule",
    phase: "bulk_guardrail",
    sourceIds: allSourceIds,
    count: allSourceIds.length,
    outputPath: "docs/plugin-source-output-manifest.md",
    action: "Represent the complete plugin universe locally, then install or connect providers one at a time.",
    guardrail: "Bulk activation is unsafe because many plugins touch private data, paid media, external projects or write-capable systems."
  }
];

export const ecosystemEnvironmentSourceExports: EcosystemEnvironmentSourceExport[] = [
  {
    id: "platform-side-sources",
    label: "Platform Sources side panel",
    channel: "platform",
    visibility: "partial",
    sourceIds: platformEvidenceSourceIds,
    count: platformEvidenceSourceIds.length,
    evidencePath: "Codex environment side panel",
    note: "The platform controls this list and usually shows only invoked or discovered tools.",
    nextAction: "Use the portfolio source console when the side panel omits manifest-only plugin refs."
  },
  {
    id: "portfolio-ui-sources",
    label: "Portfolio UI source console",
    channel: "ui",
    visibility: "complete",
    sourceIds: ecosystemSourceFlatList.map((source) => source.id),
    count: ecosystemSourceTotal,
    evidencePath: "/sources",
    note: "The website renders the complete plugin ledger, grouped by source family and connection state.",
    nextAction: "Use this as the human-readable source environment."
  },
  {
    id: "machine-readable-source-package",
    label: "Machine-readable source package",
    channel: "api",
    visibility: "machine_readable",
    sourceIds: ecosystemSourceFlatList.map((source) => source.id),
    count: ecosystemSourceTotal,
    evidencePath: "/api/source-package",
    note: "The API exports plugin refs, readiness lanes, activation plan, output surfaces and polyglot contracts.",
    nextAction: "Use this as the output/source artifact for automation and audits."
  },
  {
    id: "repo-polyglot-source-lab",
    label: "Repo polyglot source lab",
    channel: "repo",
    visibility: "local_source",
    sourceIds: polyglotSourceContracts.map((contract) => contract.id),
    count: polyglotSourceContracts.length,
    evidencePath: "sources/polyglot",
    note: "Full-stack language contracts live in the repo without adding runtime dependency weight.",
    nextAction: "Promote a contract to live code only when a concrete backend or integration task needs it."
  }
];

export const ecosystemSidePanelReceipts: EcosystemSidePanelReceipt[] = [
  {
    id: "platform-visible-receipt",
    label: "Platform-visible tool evidence",
    receiptMode: "platform_visible",
    sourceIds: platformEvidenceSourceIds,
    count: platformEvidenceSourceIds.length,
    evidencePath: "Codex environment side panel",
    expectation: "These are the sources most likely to appear in the platform-controlled side panel because they were invoked, discovered or blocked by auth.",
    limitation: "The platform decides its own Sources display; local plugin refs cannot force side-panel entries."
  },
  {
    id: "session-callable-receipt",
    label: "Session-callable plugin and skill surface",
    receiptMode: "session_callable",
    sourceIds: platformCallableSourceIds,
    count: platformCallableSourceIds.length,
    evidencePath: "/api/source-side-panel",
    expectation: "These sources are available through current plugins, skills, MCPs, bundled tools or already invoked connectors.",
    limitation: "Available does not mean used; invoking them still needs a concrete task and safe credentials."
  },
  {
    id: "portfolio-complete-receipt",
    label: "Complete local portfolio mirror",
    receiptMode: "local_complete",
    sourceIds: allSourceIds,
    count: allSourceIds.length,
    evidencePath: "/sources",
    expectation: "The website and APIs render the complete submitted plugin universe as the guaranteed source ledger.",
    limitation: "This is local source representation, not a claim that every external provider was authenticated or called."
  },
  {
    id: "blocked-provider-receipt",
    label: "Auth and connection blockers",
    receiptMode: "blocked",
    sourceIds: blockedSourceIds,
    count: blockedSourceIds.length,
    evidencePath: "/api/source-readiness",
    expectation: "Blocked sources remain visible with exact next actions for user auth or provider setup.",
    limitation: "Credentials and connection profiles must stay outside git."
  },
  {
    id: "manifest-backlog-receipt",
    label: "Manifest-only plugin backlog",
    receiptMode: "backlog",
    sourceIds: manifestOnlySourceIds,
    count: manifestOnlySourceIds.length,
    evidencePath: "/api/source-package",
    expectation: "Every remaining submitted plugin ref stays listed for future task-specific activation.",
    limitation: "Backlog entries should be promoted one at a time, not bulk-invoked."
  }
];

export const ecosystemPlatformSourceMirror: EcosystemPlatformSourceMirror[] = [
  {
    id: "observed-screenshot-sources-panel",
    label: "Observed Sources panel icons",
    mirrorMode: "observed_panel",
    status: "visible",
    sourceIds: platformEvidenceSourceIds,
    count: 6,
    candidateCount: platformEvidenceSourceIds.length,
    evidencePath: "/Users/emirhan/Desktop/Screenshot 2026-06-04 at 15.41.09.png",
    userMeaning: "The attached screenshot shows a partial platform-controlled Sources panel with six visible icons.",
    nextAction: "Use this as the observed platform view, then rely on the portfolio mirror for the complete list.",
    limitation: "Codex cannot force this platform panel to display every plugin:// manifest record."
  },
  {
    id: "platform-evidence-candidates",
    label: "Platform evidence candidates",
    mirrorMode: "platform_evidence",
    status: "candidate",
    sourceIds: platformEvidenceSourceIds,
    count: platformEvidenceSourceIds.length,
    evidencePath: "/api/source-connection-evidence",
    userMeaning: "These sources have invocation, discovery, auth-block or connection-block evidence in this session.",
    nextAction: "Promote one candidate at a time when a concrete task needs that provider.",
    limitation: "Evidence candidates may still be hidden or compacted by the platform side panel UI."
  },
  {
    id: "session-callable-surface",
    label: "Session-callable source surface",
    mirrorMode: "session_callable",
    status: "callable",
    sourceIds: platformCallableSourceIds,
    count: platformCallableSourceIds.length,
    evidencePath: "/api/source-side-panel",
    userMeaning: "These sources are available through installed plugins, skills, MCPs, bundled tools or discovered apps.",
    nextAction: "Call only the exact source needed for the next safe portfolio task.",
    limitation: "Callable does not mean authenticated, invoked or safe to bulk-run."
  },
  {
    id: "portfolio-complete-binding",
    label: "Complete portfolio source binding",
    mirrorMode: "local_bound",
    status: "bound",
    sourceIds: allSourceIds,
    count: allSourceIds.length,
    evidencePath: "/sources",
    userMeaning: "All submitted plugin refs are bound to the portfolio UI and source APIs as the complete local mirror.",
    nextAction: "Inspect /sources or /api/source-package for the guaranteed complete source list.",
    limitation: "Local binding is source governance, not proof that every provider accepted auth or produced external data."
  },
  {
    id: "blocked-auth-connection-setup",
    label: "Auth and connection setup blockers",
    mirrorMode: "blocked_setup",
    status: "blocked",
    sourceIds: blockedSourceIds,
    count: blockedSourceIds.length,
    evidencePath: "/api/source-readiness",
    userMeaning: "These providers need user login, reauth or local connection profiles before a live retry.",
    nextAction: "Resolve the specific auth or connection blocker outside git, then rerun the single provider check.",
    limitation: "Secrets, cookies and connection profiles must never be committed to the portfolio repository."
  },
  {
    id: "manifest-backlog-binding",
    label: "Manifest backlog binding",
    mirrorMode: "future_backlog",
    status: "queued",
    sourceIds: manifestOnlySourceIds,
    count: manifestOnlySourceIds.length,
    evidencePath: "/api/source-package",
    userMeaning: "The remaining plugin refs stay represented and ready for future task-specific activation.",
    nextAction: "Pick one backlog provider only when the portfolio needs its exact capability.",
    limitation: "Bulk invocation would create noise, auth failures, paid actions or private data reads."
  }
];

export const ecosystemSourceExecutionDigest: EcosystemSourceExecutionDigest = {
  id: "source-execution-digest",
  label: "Source execution digest",
  headline: "Source governance is visible, sequenced and receipt-backed.",
  summary: "Board, packets, quality gates, runbook and receipts are all derived from the local source registry without bulk provider calls.",
  leadingPacketId: ecosystemSourceActionBoard.nextPacketId,
  primaryEvidencePath: "/sources",
  nextAction: "Continue from the leading now packet, then run the required quality gates before committing.",
  guardrail: "Digest is public/local evidence only; it does not claim every external provider is authenticated or invoked.",
  metrics: [
    {
      id: "source-count",
      label: "Plugin sources",
      value: ecosystemSourceTotal,
      evidencePath: "/api/source-package",
      signal: "Complete submitted plugin ledger remains machine-readable."
    },
    {
      id: "board-columns",
      label: "Board columns",
      value: ecosystemSourceActionBoard.columns.length,
      evidencePath: "/api/source-action-board",
      signal: "Priority control exists for now, next, blocked and backlog work."
    },
    {
      id: "action-packets",
      label: "Action packets",
      value: ecosystemSourceActionPackets.length,
      evidencePath: "/api/source-action-packets",
      signal: "Source families have bounded agent-ready handoff contracts."
    },
    {
      id: "quality-gates",
      label: "Quality gates",
      value: ecosystemSourceQualityGates.length,
      evidencePath: "/api/source-quality-gates",
      signal: "Local validation gates are published before push."
    },
    {
      id: "runbook-steps",
      label: "Runbook steps",
      value: ecosystemSourceRunbook.steps.length,
      evidencePath: "/api/source-runbook",
      signal: "Aggressive source work has an ordered execution sequence."
    },
    {
      id: "execution-receipts",
      label: "Execution receipts",
      value: ecosystemSourceExecutionReceipts.length,
      evidencePath: "/api/source-execution-receipts",
      signal: "Public proof surfaces are collected for review."
    }
  ]
};

const leadingSourceActionPacket = ecosystemSourceActionPackets.find((packet) => packet.id === ecosystemSourceActionBoard.nextPacketId) || ecosystemSourceActionPackets[0] || null;
const requiredSourceQualityGateCommands = ecosystemSourceQualityGates
  .filter((gate) => gate.priority === "required")
  .map((gate) => gate.command);

export const ecosystemSourceContinuationBrief: EcosystemSourceContinuationBrief = {
  id: "source-continuation-brief",
  label: "Source continuation brief",
  headline: "Continue from one visible packet, then prove it with local gates.",
  summary: "A compact handoff for the next aggressive source pass: read these surfaces, make one reversible edit, run these gates and stop before external provider escalation.",
  packetId: leadingSourceActionPacket?.id || null,
  packetLabel: leadingSourceActionPacket?.label || "No action packet selected",
  priority: leadingSourceActionPacket?.priority || "none",
  primaryHandoffPath: "/api/source-continuation-brief",
  readFirstPaths: [
    ...new Set([
      "/api/source-continuation-brief",
      "/api/source-execution-digest",
      ecosystemSourceActionBoard.handoffPath,
      "/api/source-quality-gates",
      "/api/source-runbook",
      ...(leadingSourceActionPacket?.evidencePaths || [])
    ])
  ],
  validationCommands: [
    ...new Set([
      ...(leadingSourceActionPacket?.localValidation || requiredSourceQualityGateCommands),
      "npm run check:content",
      "npm run check:runtime"
    ])
  ],
  publishCommand: "npm run github:preflight, then git push origin HEAD",
  nextMove: leadingSourceActionPacket?.firstMove || ecosystemSourceExecutionDigest.nextAction,
  stopRules: [
    ecosystemSourceRunbook.operatingRule,
    leadingSourceActionPacket?.stopCondition || "Stop if no leading packet is available.",
    "Report local validation, GitHub push state and Dependabot/security warnings separately."
  ],
  evidencePaths: ["/sources", "/ops", "/api/source-package", "/api/source-export-index"],
  guardrail: "Continuation brief is local coordination only; it does not authenticate providers, create external projects or execute writes."
};

export const ecosystemSourceProofCards: EcosystemSourceProofCard[] = [
  {
    id: "platform-side-panel-proof",
    label: "Platform Sources panel proof",
    channel: "platform",
    status: "platform_controlled",
    sourceIds: platformEvidenceSourceIds,
    count: platformEvidenceSourceIds.length,
    evidencePath: "Codex environment Sources panel",
    userSees: "Only invoked, discovered or auth-blocked tools are likely to appear in the platform-controlled panel.",
    limitation: "Local plugin:// manifest records cannot force platform side-panel entries."
  },
  {
    id: "portfolio-ui-proof",
    label: "Complete portfolio UI proof",
    channel: "ui",
    status: "complete",
    sourceIds: allSourceIds,
    count: allSourceIds.length,
    evidencePath: "/sources",
    userSees: "The portfolio page renders the complete submitted plugin universe as grouped source cards.",
    limitation: "This is public metadata and source governance, not private provider data."
  },
  {
    id: "api-package-proof",
    label: "Machine-readable output proof",
    channel: "api",
    status: "machine_readable",
    sourceIds: allSourceIds,
    count: allSourceIds.length,
    evidencePath: "/api/source-package",
    userSees: "Agents, audits and future automations can read the complete source package as JSON.",
    limitation: "Plugin refs are manifest evidence until a specific provider is safely invoked."
  },
  {
    id: "install-plan-proof",
    label: "Install and connection proof",
    channel: "api",
    status: "install_plan",
    sourceIds: ecosystemPluginInstallPlan.map((step) => step.id),
    count: ecosystemPluginInstallPlan.length,
    evidencePath: "/api/source-install-plan",
    userSees: "Ready, auth-gated, connection-gated, future-task and no-bulk phases are exported explicitly.",
    limitation: "Credentials, cookies and provider connection files stay outside the repository."
  },
  {
    id: "polyglot-repo-proof",
    label: "Full-stack language proof",
    channel: "repo",
    status: "polyglot",
    sourceIds: polyglotSourceContracts.map((contract) => contract.id),
    count: polyglotSourceContracts.length,
    evidencePath: "sources/polyglot",
    userSees: "Full-stack language coverage is visible as repo-local contracts without dependency inflation.",
    limitation: "Contracts are promoted to live integrations only when a real backend task needs them."
  }
];

export const ecosystemAiHelperLanes: EcosystemAiHelperLane[] = [
  {
    id: "codex-local-architect",
    label: "Codex local architect lane",
    helperType: "active_agent",
    status: "active",
    sourceIds: ["codex", "frontend-design", "build-web-apps", "build-web-data-visualization"],
    count: 4,
    evidencePath: "Codex local workspace",
    role: "Primary portfolio implementation, UI architecture, source registry and validation loop.",
    nextAction: "Continue bounded local implementation inside the portfolio checkout.",
    guardrail: "No secret writes, no unrelated refactors and no main-branch assumptions."
  },
  {
    id: "cortex-snowflake-route",
    label: "Cortex / Snowflake model route",
    helperType: "model_route",
    status: "connection_blocked",
    sourceIds: ["snowflake"],
    count: 1,
    evidencePath: "Snowflake Cortex Code CLI",
    role: "External model and warehouse-aware helper route for advanced reasoning tasks.",
    nextAction: "Configure a Snowflake connection profile outside the repository before retrying.",
    guardrail: "Do not commit connection profiles, tokens or Snowflake account metadata."
  },
  {
    id: "claude-codex-openai-helper-lane",
    label: "Claude skills, Codex and OpenAI helper lane",
    helperType: "model_route",
    status: "available",
    sourceIds: ["codex", "openai-developers", "claude-code-setup", "claude-md-management", "outputai"],
    count: 5,
    evidencePath: "/api/ai-helper-orchestration",
    role: "Coordinate local coding, agent setup, project memory and future OpenAI workflow handoffs.",
    nextAction: "Route each helper to a concrete task instead of invoking every model at once.",
    guardrail: "Represent unavailable external models honestly as future or connection-gated helpers."
  },
  {
    id: "creative-ai-production-lane",
    label: "Creative AI production lane",
    helperType: "creative_ai",
    status: "future_task",
    sourceIds: ["fal", "shutterstock", "figma", "canva", "cloudinary", "heygen", "runway-api", "remotion"],
    count: 8,
    evidencePath: "/api/source-activation-plan",
    role: "Generate, edit, organize and package premium visual, video and design assets when selected.",
    nextAction: "Open one creative provider at a time for a real asset request.",
    guardrail: "Avoid bulk media generation, duplicate external projects and licensed-asset confusion."
  },
  {
    id: "research-intelligence-lane",
    label: "Research and intelligence lane",
    helperType: "research_ai",
    status: "future_task",
    sourceIds: [
      "hugging-face",
      "huggingface-skills",
      "nvidia-skills",
      "semrush",
      "similarweb",
      "conductor",
      "quartr",
      "deepnote",
      "data-analytics"
    ],
    count: 9,
    evidencePath: "/api/source-readiness",
    role: "Support model research, GPU/AI direction, SEO intelligence, market context and analytics.",
    nextAction: "Promote only the provider needed for the next portfolio research question.",
    guardrail: "Separate public source metadata from private analytics, paid data and account data."
  },
  {
    id: "quality-security-lane",
    label: "Quality, security and observability lane",
    helperType: "quality_ai",
    status: "available",
    sourceIds: ["codex-security", "semgrep", "sonarqube", "aikido", "sentry", "datadog", "playwright", "coderabbit", "greptile"],
    count: 9,
    evidencePath: "/api/health",
    role: "Review security posture, code quality, runtime health, browser behavior and observability hooks.",
    nextAction: "Run lightweight local validation first, then escalate to a provider only for a focused check.",
    guardrail: "No broad scans, no account data pulls and no noisy CI loops unless requested."
  },
  {
    id: "business-ops-automation-lane",
    label: "Business and ops automation lane",
    helperType: "automation_ai",
    status: "auth_gated",
    sourceIds: ["gmail", "slack", "google-calendar", "linear", "asana", "notion", "hubspot", "clay", "apollo", "zoom"],
    count: 10,
    evidencePath: "/api/source-side-panel",
    role: "Prepare outreach, scheduling, project management, CRM and collaboration workflows when authorized.",
    nextAction: "Authenticate the exact provider needed for the concrete portfolio workflow.",
    guardrail: "Never pull private inbox, CRM, calendar or workspace data for a visual portfolio task by default."
  }
];

export const ecosystemSourceDeliveryArtifacts: EcosystemSourceDeliveryArtifact[] = [
  {
    id: "source-console-human-view",
    label: "Human-readable source console",
    artifactType: "ui",
    path: "/sources",
    downloadMode: "browser_view",
    count: ecosystemSourceTotal,
    sourceIds: ecosystemSourceFlatList.map((source) => source.id),
    purpose: "Let visitors and reviewers inspect every submitted plugin ref without needing connector credentials.",
    guardrail: "Render public metadata only; never expose account data or secrets."
  },
  {
    id: "source-package-json",
    label: "Complete source package JSON",
    artifactType: "api",
    path: "/api/source-package",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceTotal,
    sourceIds: ecosystemSourceFlatList.map((source) => source.id),
    purpose: "Provide the strongest outputs/sources handoff for audits, agents and future automation.",
    guardrail: "Treat plugin refs as manifest evidence, not proof of live external writes."
  },
  {
    id: "source-environment-json",
    label: "Environment channel export",
    artifactType: "api",
    path: "/api/source-environment",
    downloadMode: "machine_readable_json",
    count: ecosystemEnvironmentSourceExports.length,
    sourceIds: ecosystemEnvironmentSourceExports.map((source) => source.id),
    purpose: "Explain why platform Sources, portfolio UI, API package and repo files can show different counts.",
    guardrail: "Keep the platform side-panel limitation explicit."
  },
  {
    id: "side-panel-receipt-json",
    label: "Side-panel receipt JSON",
    artifactType: "api",
    path: "/api/source-side-panel",
    downloadMode: "machine_readable_json",
    count: ecosystemSidePanelReceipts.length,
    sourceIds: ecosystemSidePanelReceipts.map((receipt) => receipt.id),
    purpose: "Make platform-visible, session-callable, blocked and local-complete source expectations explicit.",
    guardrail: "Do not imply that manifest-only plugin refs are platform side-panel entries."
  },
  {
    id: "source-proof-json",
    label: "Sources proof JSON",
    artifactType: "api",
    path: "/api/source-proof",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceProofCards.length,
    sourceIds: ecosystemSourceProofCards.map((proof) => proof.id),
    purpose: "Give a direct receipt for what the user sees in platform Sources, portfolio UI, API outputs and repo files.",
    guardrail: "Keep platform-controlled visibility separate from the complete local source mirror."
  },
  {
    id: "source-export-index-json",
    label: "Source export index JSON",
    artifactType: "api",
    path: "/api/source-export-index",
    downloadMode: "machine_readable_json",
    count: 20,
    sourceIds: [
      "source-package",
      "source-signal-map",
      "source-execution-queue",
      "source-action-packets",
      "source-action-board",
      "source-quality-gates",
      "source-runbook",
      "source-execution-receipts",
      "source-execution-digest",
      "source-continuation-brief",
      "source-proof",
      "source-install-plan",
      "source-side-panel",
      "source-environment",
      "source-delivery",
      "ai-helper-orchestration",
      "source-connection-mirror",
      "aggressive-development-plan",
      "ops-command-center",
      "polyglot-lab"
    ],
    purpose: "Collect the strongest downloadable and inspectable source outputs into one index.",
    guardrail: "Index existing outputs; do not duplicate secret-bearing provider data."
  },
  {
    id: "source-continuation-brief-json",
    label: "Source continuation brief JSON",
    artifactType: "api",
    path: "/api/source-continuation-brief",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceContinuationBrief.readFirstPaths.length + ecosystemSourceContinuationBrief.validationCommands.length,
    sourceIds: [ecosystemSourceContinuationBrief.id, ...(ecosystemSourceContinuationBrief.packetId ? [ecosystemSourceContinuationBrief.packetId] : [])],
    purpose: "Provide the shortest handoff for continuing source development from the leading packet.",
    guardrail: "Brief coordinates local continuation only; it does not execute provider actions."
  },
  {
    id: "source-execution-digest-json",
    label: "Source execution digest JSON",
    artifactType: "api",
    path: "/api/source-execution-digest",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceExecutionDigest.metrics.length,
    sourceIds: ecosystemSourceExecutionDigest.metrics.map((metric) => metric.id),
    purpose: "Summarize source governance metrics across board, packets, gates, runbook and receipts.",
    guardrail: "Digest summarizes local evidence only; it does not perform provider actions."
  },
  {
    id: "source-execution-receipts-json",
    label: "Source execution receipts JSON",
    artifactType: "api",
    path: "/api/source-execution-receipts",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceExecutionReceipts.length,
    sourceIds: ecosystemSourceExecutionReceipts.map((receipt) => receipt.id),
    purpose: "Publish proof cards for board, packet, gate, runbook, UI and package evidence.",
    guardrail: "Receipts describe public/local evidence only; they do not claim provider authentication."
  },
  {
    id: "source-runbook-json",
    label: "Source aggressive runbook JSON",
    artifactType: "api",
    path: "/api/source-runbook",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceRunbook.steps.length,
    sourceIds: ecosystemSourceRunbook.steps.map((step) => step.id),
    purpose: "Publish the ordered preflight, implementation, validation and publish steps for aggressive source work.",
    guardrail: "Runbook coordinates local validation and GitHub publish only; external provider writes remain out of scope."
  },
  {
    id: "source-quality-gates-json",
    label: "Source quality gates JSON",
    artifactType: "api",
    path: "/api/source-quality-gates",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceQualityGates.length,
    sourceIds: ecosystemSourceQualityGates.map((gate) => gate.id),
    purpose: "Expose validation commands, pass signals and failure responses for aggressive source work.",
    guardrail: "Quality gates validate local code and route behavior; they do not authenticate providers."
  },
  {
    id: "source-action-board-json",
    label: "Source action board JSON",
    artifactType: "api",
    path: "/api/source-action-board",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceActionBoard.columns.length,
    sourceIds: ecosystemSourceActionBoard.columns.map((column) => column.id),
    purpose: "Group action packets into now, next, blocked and backlog columns for operator and agent handoff.",
    guardrail: "Board state is local coordination only; it does not launch provider tasks."
  },
  {
    id: "source-action-packets-json",
    label: "Source action packets JSON",
    artifactType: "api",
    path: "/api/source-action-packets",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceActionPackets.length,
    sourceIds: ecosystemSourceActionPackets.map((packet) => packet.id),
    purpose: "Package each source-family queue item as an agent-ready action contract with validation and stop conditions.",
    guardrail: "Packets coordinate local work only; provider escalation remains explicit and task-specific."
  },
  {
    id: "source-execution-queue-json",
    label: "Source execution queue JSON",
    artifactType: "api",
    path: "/api/source-execution-queue",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceExecutionQueue.length,
    sourceIds: ecosystemSourceExecutionQueue.map((item) => item.id),
    purpose: "Turn source family signals into now, next, blocked and backlog execution items.",
    guardrail: "Queue safe local work only; do not perform credentialed provider actions."
  },
  {
    id: "source-signal-map-json",
    label: "Source signal map JSON",
    artifactType: "api",
    path: "/api/source-signal-map",
    downloadMode: "machine_readable_json",
    count: ecosystemSourceSignalMap.length,
    sourceIds: ecosystemSourceSignalMap.map((item) => item.id),
    purpose: "Summarize every plugin family by invoked, callable, blocked, auth-gated and manifest-only signals.",
    guardrail: "Use derived public metadata only; do not call providers or store credentials."
  },
  {
    id: "ai-helper-orchestration-json",
    label: "AI helper orchestration JSON",
    artifactType: "api",
    path: "/api/ai-helper-orchestration",
    downloadMode: "machine_readable_json",
    count: ecosystemAiHelperLanes.length,
    sourceIds: ecosystemAiHelperLanes.map((lane) => lane.id),
    purpose: "Show how Codex, model routes, creative AI, research AI, quality AI and ops AI should help without bulk invocation.",
    guardrail: "Each helper lane must stay task-specific, credential-safe and honest about auth or connection blockers."
  },
  {
    id: "source-connection-mirror-json",
    label: "Platform source connection mirror JSON",
    artifactType: "api",
    path: "/api/source-connection-mirror",
    downloadMode: "machine_readable_json",
    count: ecosystemPlatformSourceMirror.length,
    sourceIds: ecosystemPlatformSourceMirror.map((item) => item.id),
    purpose: "Mirror the attached side-panel observation against platform evidence, callable sources, local binding and blockers.",
    guardrail: "Do not claim that observed platform icons equal full provider authentication."
  },
  {
    id: "aggressive-development-plan-json",
    label: "Aggressive development plan JSON",
    artifactType: "api",
    path: "/api/aggressive-development-plan",
    downloadMode: "machine_readable_json",
    count: ecosystemAggressiveDevelopmentLanes.length,
    sourceIds: ecosystemAggressiveDevelopmentLanes.map((lane) => lane.id),
    purpose: "Turn all connected and cataloged sources into governed build, creative, growth, ops, quality and research sprint lanes.",
    guardrail: "Aggressive means high routing clarity, not uncontrolled provider writes."
  },
  {
    id: "ops-command-center-json",
    label: "Ops command center JSON",
    artifactType: "api",
    path: "/api/ops-command-center",
    downloadMode: "machine_readable_json",
    count: 4,
    sourceIds: ["runtime-readiness", "deployment-targets", "aggressive-development-plan", "ai-helper-orchestration"],
    purpose: "Aggregate source, runtime, GitHub, MCP and deployment readiness into one operations payload.",
    guardrail: "Expose status and routing only; do not execute deploys, paid calls, messages or credentialed writes."
  },
  {
    id: "install-plan-json",
    label: "Plugin install plan JSON",
    artifactType: "api",
    path: "/api/source-install-plan",
    downloadMode: "machine_readable_json",
    count: ecosystemPluginInstallPlan.length,
    sourceIds: ecosystemPluginInstallPlan.map((step) => step.id),
    purpose: "Translate the install/download request into ready, auth-gated, connection-gated, backlog and no-bulk phases.",
    guardrail: "Do not install, authenticate or invoke providers in bulk."
  },
  {
    id: "runtime-source-archives",
    label: "Runtime source archives",
    artifactType: "archive",
    path: "/api/source-archives",
    downloadMode: "local_archive_reference",
    count: 4,
    sourceIds: ["portfolio-v4", "portfolio-infra-v1", "portfolio-v3", "portfolio-v2"],
    purpose: "Expose local source archive provenance for the portfolio baseline and historical references.",
    guardrail: "List checksums and source paths only; do not bulk-import historical archives."
  },
  {
    id: "polyglot-source-lab",
    label: "Polyglot repo source lab",
    artifactType: "repo",
    path: "sources/polyglot",
    downloadMode: "repo_file",
    count: polyglotSourceContracts.length,
    sourceIds: polyglotSourceContracts.map((contract) => contract.id),
    purpose: "Represent full-stack language surfaces without adding runtime dependency weight.",
    guardrail: "Promote contract files to live integrations only when a concrete feature needs them."
  },
  {
    id: "install-policy-doc",
    label: "Install and activation policy",
    artifactType: "policy",
    path: "docs/plugin-source-output-manifest.md",
    downloadMode: "repo_file",
    count: Object.values(ecosystemInstallPolicySummary).reduce((total, count) => total + count, 0),
    sourceIds: Object.keys(ecosystemInstallPolicySummary),
    purpose: "Document when a plugin is already available, future-only, auth-gated or connection-gated.",
    guardrail: "Install or invoke a connector only for a specific approved task."
  }
];

export const ecosystemConnectionAttempts: EcosystemConnectionAttempt[] = [
  {
    id: "base44-readonly-check",
    sourceId: "base44",
    label: "Base44 read-only connector check",
    status: "tool_invoked",
    result: "Authenticated connector responded with an empty portfolio app list."
  },
  {
    id: "wix-builder-check",
    sourceId: "wix",
    label: "Wix site builder activation",
    status: "reauth_required",
    result: "Wix returned 401 reauthentication required before site generation could start."
  },
  {
    id: "fal-model-recommendation",
    sourceId: "fal",
    label: "Fal model recommendation",
    status: "tool_invoked",
    result: "Fal returned live model recommendations for cinematic portfolio image generation."
  },
  {
    id: "replit-tool-discovery",
    sourceId: "replit",
    label: "Replit app tool discovery",
    status: "tool_discovered",
    result: "Replit creation tools are callable; a new external app was not created to avoid duplicating the local portfolio."
  },
  {
    id: "shutterstock-image-search",
    sourceId: "shutterstock",
    label: "Shutterstock image search",
    status: "tool_invoked",
    result: "Shutterstock returned a 15-result preview search set for cinematic portfolio workspace imagery."
  },
  {
    id: "lovable-tool-discovery",
    sourceId: "lovable",
    label: "Lovable builder discovery",
    status: "tool_discovered",
    result: "Lovable build tools are callable; project creation remains opt-in to avoid duplicate external builds."
  },
  {
    id: "figma-auth-check",
    sourceId: "figma",
    label: "Figma identity check",
    status: "tool_invoked",
    result: "Figma returned an authenticated user and plan, so design handoff can be created when explicitly needed."
  },
  {
    id: "cloudinary-visual-search",
    sourceId: "cloudinary",
    label: "Cloudinary visual asset search",
    status: "tool_invoked",
    result: "Cloudinary visual search responded successfully; no matching portfolio hero assets were found."
  },
  {
    id: "snowflake-cortex-check",
    sourceId: "snowflake",
    label: "Snowflake Cortex Code route",
    status: "missing_connection",
    result: "Cortex Code routed the task, then stopped because no Snowflake connection is configured."
  }
];

export const ecosystemOutputSurfaces: EcosystemOutputSurface[] = [
  {
    id: "home-source-console",
    label: "Homepage environment sources",
    path: "/#sources",
    role: "Primary portfolio source console with grouped plugin references.",
    sourceMode: "ui"
  },
  {
    id: "sources-command-page",
    label: "Dedicated sources command page",
    path: "/sources",
    role: "Routeable human-readable source console with signal map, source families and API handoff links.",
    sourceMode: "ui"
  },
  {
    id: "portfolio-source-console",
    label: "Portfolio source console",
    path: "/portfolio#sources",
    role: "Compact source console embedded in the portfolio route.",
    sourceMode: "ui"
  },
  {
    id: "ecosystem-sources-api",
    label: "Ecosystem sources API",
    path: "/api/ecosystem-sources",
    role: "JSON output for groups, flat plugin refs, output surfaces and polyglot contracts.",
    sourceMode: "api"
  },
  {
    id: "source-connection-evidence-api",
    label: "Source connection evidence API",
    path: "/api/source-connection-evidence",
    role: "Focused JSON evidence for invoked, discovered, reauth-blocked and connection-missing external sources.",
    sourceMode: "api"
  },
  {
    id: "source-package-api",
    label: "Downloadable source package API",
    path: "/api/source-package",
    role: "Machine-readable package of all plugin refs, source states, output surfaces and polyglot contracts.",
    sourceMode: "api"
  },
  {
    id: "source-readiness-api",
    label: "Source readiness API",
    path: "/api/source-readiness",
    role: "Action-oriented readiness lanes for invoked, available, discovered, blocked and manifest-only plugin sources.",
    sourceMode: "api"
  },
  {
    id: "source-activation-plan-api",
    label: "Source activation plan API",
    path: "/api/source-activation-plan",
    role: "Safe next-action plan for promoting plugin sources into live external connector work.",
    sourceMode: "api"
  },
  {
    id: "source-environment-api",
    label: "Source environment API",
    path: "/api/source-environment",
    role: "Environment-vs-output source map for platform panel, UI, API and repo channels.",
    sourceMode: "api"
  },
  {
    id: "source-delivery-api",
    label: "Source delivery API",
    path: "/api/source-delivery",
    role: "Download, archive and install-policy artifact map for the submitted plugin universe.",
    sourceMode: "api"
  },
  {
    id: "source-side-panel-api",
    label: "Source side-panel receipt API",
    path: "/api/source-side-panel",
    role: "Explicit receipt for what can appear in platform Sources versus the complete local portfolio source mirror.",
    sourceMode: "api"
  },
  {
    id: "source-proof-api",
    label: "Source proof API",
    path: "/api/source-proof",
    role: "Direct proof cards for platform, UI, API, install and full-stack source visibility.",
    sourceMode: "api"
  },
  {
    id: "source-signal-map-api",
    label: "Source signal map API",
    path: "/api/source-signal-map",
    role: "Derived source family signal map for invoked, callable, blocked, auth-gated and cataloged plugin families.",
    sourceMode: "api"
  },
  {
    id: "source-execution-queue-api",
    label: "Source execution queue API",
    path: "/api/source-execution-queue",
    role: "Prioritized execution queue generated from source family signals and aggressive development lanes.",
    sourceMode: "api"
  },
  {
    id: "source-action-packets-api",
    label: "Source action packets API",
    path: "/api/source-action-packets",
    role: "Agent-ready action packets generated from source execution queue items, validation gates and stop conditions.",
    sourceMode: "api"
  },
  {
    id: "source-action-board-api",
    label: "Source action board API",
    path: "/api/source-action-board",
    role: "Priority and mode board for source action packets, including leading next moves and risk notes.",
    sourceMode: "api"
  },
  {
    id: "source-quality-gates-api",
    label: "Source quality gates API",
    path: "/api/source-quality-gates",
    role: "Validation gate map for source action packets, including commands, pass signals and failure responses.",
    sourceMode: "api"
  },
  {
    id: "source-runbook-api",
    label: "Source aggressive runbook API",
    path: "/api/source-runbook",
    role: "Ordered runbook for preflight, implementation, validation and GitHub publish of bounded source work.",
    sourceMode: "api"
  },
  {
    id: "source-execution-receipts-api",
    label: "Source execution receipts API",
    path: "/api/source-execution-receipts",
    role: "Evidence receipt set for source board, packets, quality gates, runbook, UI and package outputs.",
    sourceMode: "api"
  },
  {
    id: "source-execution-digest-api",
    label: "Source execution digest API",
    path: "/api/source-execution-digest",
    role: "Compact source governance summary for board, packets, gates, runbook and receipts.",
    sourceMode: "api"
  },
  {
    id: "source-continuation-brief-api",
    label: "Source continuation brief API",
    path: "/api/source-continuation-brief",
    role: "Shortest next-pass handoff with read-first surfaces, validation commands and stop rules.",
    sourceMode: "api"
  },
  {
    id: "source-export-index-api",
    label: "Source export index API",
    path: "/api/source-export-index",
    role: "Single index of downloadable and inspectable source outputs.",
    sourceMode: "api"
  },
  {
    id: "ai-helper-orchestration-api",
    label: "AI helper orchestration API",
    path: "/api/ai-helper-orchestration",
    role: "Task-routed helper map for Codex, model routes, creative AI, research AI, quality AI and ops AI.",
    sourceMode: "api"
  },
  {
    id: "source-connection-mirror-api",
    label: "Source connection mirror API",
    path: "/api/source-connection-mirror",
    role: "Screenshot-aware mirror for platform Sources icons, connection evidence, callable tools and local binding.",
    sourceMode: "api"
  },
  {
    id: "aggressive-development-plan-api",
    label: "Aggressive development plan API",
    path: "/api/aggressive-development-plan",
    role: "Governed sprint lanes that use every connected source family without unsafe bulk invocation.",
    sourceMode: "api"
  },
  {
    id: "ops-command-center-api",
    label: "Ops command center API",
    path: "/api/ops-command-center",
    role: "Aggregated operations payload for source routing, runtime readiness, GitHub persistence and deployment gates.",
    sourceMode: "api"
  },
  {
    id: "source-install-plan-api",
    label: "Source install plan API",
    path: "/api/source-install-plan",
    role: "Safe install, auth and connection plan for plugin sources.",
    sourceMode: "api"
  },
  {
    id: "source-archives-api",
    label: "Source archives API",
    path: "/api/source-archives",
    role: "Runtime source archive checksums and provenance references.",
    sourceMode: "api"
  },
  {
    id: "software-languages-api",
    label: "Software languages API",
    path: "/api/software-languages",
    role: "JSON output for live language surfaces and future full-stack contracts.",
    sourceMode: "api"
  },
  {
    id: "health-api",
    label: "Health summary API",
    path: "/api/health",
    role: "Operational count summary for source groups, plugin refs and polyglot contracts.",
    sourceMode: "health"
  },
  {
    id: "polyglot-repo-lab",
    label: "Polyglot source lab",
    path: "sources/polyglot",
    role: "Repo-local full-stack language contracts that do not add runtime dependency weight.",
    sourceMode: "repo"
  }
];

export const ecosystemSourceExportIndex: EcosystemSourceExportIndexItem[] = [
  {
    id: "source-package",
    label: "Complete source package",
    format: "json",
    path: "/api/source-package",
    status: "primary",
    sourceIds: allSourceIds,
    count: allSourceIds.length,
    purpose: "Full machine-readable package for every submitted plugin ref, state, output and polyglot contract.",
    useWhen: "Use this when another agent, audit or automation needs the complete Sources payload."
  },
  {
    id: "source-signal-map",
    label: "Source signal map",
    format: "json",
    path: "/api/source-signal-map",
    status: "primary",
    sourceIds: ecosystemSourceSignalMap.map((item) => item.id),
    count: ecosystemSourceSignalMap.length,
    purpose: "Shows every plugin family as a compact readiness and action map.",
    useWhen: "Use this when deciding which source family should drive the next aggressive portfolio pass."
  },
  {
    id: "source-execution-queue",
    label: "Source execution queue",
    format: "json",
    path: "/api/source-execution-queue",
    status: "primary",
    sourceIds: ecosystemSourceExecutionQueue.map((item) => item.id),
    count: ecosystemSourceExecutionQueue.length,
    purpose: "Converts source signals into a prioritized local execution queue.",
    useWhen: "Use this when continuing aggressive development and choosing the next bounded source-family action."
  },
  {
    id: "source-action-packets",
    label: "Source action packets",
    format: "json",
    path: "/api/source-action-packets",
    status: "primary",
    sourceIds: ecosystemSourceActionPackets.map((packet) => packet.id),
    count: ecosystemSourceActionPackets.length,
    purpose: "Turns queue items into agent-ready action contracts with evidence paths, validation commands and stop conditions.",
    useWhen: "Use this when another AI helper needs a bounded next action without direct provider execution."
  },
  {
    id: "source-action-board",
    label: "Source action board",
    format: "json",
    path: "/api/source-action-board",
    status: "primary",
    sourceIds: ecosystemSourceActionBoard.columns.map((column) => column.id),
    count: ecosystemSourceActionBoard.columns.length,
    purpose: "Groups action packets by priority and packet mode so operators can pick the next safe source move.",
    useWhen: "Use this when continuing aggressive development from an operations board instead of a flat packet list."
  },
  {
    id: "source-quality-gates",
    label: "Source quality gates",
    format: "json",
    path: "/api/source-quality-gates",
    status: "primary",
    sourceIds: ecosystemSourceQualityGates.map((gate) => gate.id),
    count: ecosystemSourceQualityGates.length,
    purpose: "Publishes the local validation gates required before source work is considered safe to push.",
    useWhen: "Use this before committing or asking another helper to continue aggressive source development."
  },
  {
    id: "source-runbook",
    label: "Source aggressive runbook",
    format: "json",
    path: "/api/source-runbook",
    status: "primary",
    sourceIds: ecosystemSourceRunbook.steps.map((step) => step.id),
    count: ecosystemSourceRunbook.steps.length,
    purpose: "Orders source work from clean-branch preflight through validation and GitHub publish.",
    useWhen: "Use this when continuing aggressive development and needing the exact safe execution sequence."
  },
  {
    id: "source-execution-receipts",
    label: "Source execution receipts",
    format: "json",
    path: "/api/source-execution-receipts",
    status: "primary",
    sourceIds: ecosystemSourceExecutionReceipts.map((receipt) => receipt.id),
    count: ecosystemSourceExecutionReceipts.length,
    purpose: "Collects public evidence cards for the board, packets, quality gates, runbook, UI and package handoffs.",
    useWhen: "Use this when verifying what the portfolio can prove about aggressive source work."
  },
  {
    id: "source-execution-digest",
    label: "Source execution digest",
    format: "json",
    path: "/api/source-execution-digest",
    status: "primary",
    sourceIds: ecosystemSourceExecutionDigest.metrics.map((metric) => metric.id),
    count: ecosystemSourceExecutionDigest.metrics.length,
    purpose: "Provides a compact status summary for the source governance stack.",
    useWhen: "Use this when you need the fastest machine-readable source execution overview."
  },
  {
    id: "source-continuation-brief",
    label: "Source continuation brief",
    format: "json",
    path: "/api/source-continuation-brief",
    status: "primary",
    sourceIds: [ecosystemSourceContinuationBrief.id, ...(ecosystemSourceContinuationBrief.packetId ? [ecosystemSourceContinuationBrief.packetId] : [])],
    count: ecosystemSourceContinuationBrief.readFirstPaths.length,
    purpose: "Packages the leading packet, read-first surfaces, validation commands and stop rules for the next pass.",
    useWhen: "Use this when the next agent or operator says continue and needs the shortest safe handoff."
  },
  {
    id: "source-proof",
    label: "Sources proof",
    format: "json",
    path: "/api/source-proof",
    status: "primary",
    sourceIds: ecosystemSourceProofCards.map((proof) => proof.id),
    count: ecosystemSourceProofCards.length,
    purpose: "Small proof card set explaining where sources are visible: platform, UI, API, install plan and repo.",
    useWhen: "Use this when you need the shortest receipt for environment Sources visibility."
  },
  {
    id: "source-install-plan",
    label: "Install and connection plan",
    format: "json",
    path: "/api/source-install-plan",
    status: "primary",
    sourceIds: ecosystemPluginInstallPlan.map((step) => step.id),
    count: ecosystemPluginInstallPlan.length,
    purpose: "Safe plan for ready, auth-gated, connection-gated, future-task and no-bulk plugin handling.",
    useWhen: "Use this before downloading, authenticating or connecting any external provider."
  },
  {
    id: "source-side-panel",
    label: "Platform side-panel receipt",
    format: "json",
    path: "/api/source-side-panel",
    status: "supporting",
    sourceIds: ecosystemSidePanelReceipts.map((receipt) => receipt.id),
    count: ecosystemSidePanelReceipts.length,
    purpose: "Separates what the platform-controlled Sources panel can show from the complete local mirror.",
    useWhen: "Use this when the side panel omits manifest-only plugins."
  },
  {
    id: "source-environment",
    label: "Environment source channels",
    format: "json",
    path: "/api/source-environment",
    status: "supporting",
    sourceIds: ecosystemEnvironmentSourceExports.map((item) => item.id),
    count: ecosystemEnvironmentSourceExports.length,
    purpose: "Explains platform, UI, API and repo source channels as separate outputs.",
    useWhen: "Use this when comparing side-panel counts with portfolio output counts."
  },
  {
    id: "source-delivery",
    label: "Delivery artifact map",
    format: "json",
    path: "/api/source-delivery",
    status: "supporting",
    sourceIds: ecosystemSourceDeliveryArtifacts.map((artifact) => artifact.id),
    count: ecosystemSourceDeliveryArtifacts.length,
    purpose: "Lists browser, JSON, repo, archive and policy delivery artifacts.",
    useWhen: "Use this when packaging the source handoff for review."
  },
  {
    id: "ai-helper-orchestration",
    label: "AI helper orchestration",
    format: "json",
    path: "/api/ai-helper-orchestration",
    status: "supporting",
    sourceIds: ecosystemAiHelperLanes.map((lane) => lane.id),
    count: ecosystemAiHelperLanes.length,
    purpose: "Explains which AI helpers should assist, which are active, and which are auth or connection gated.",
    useWhen: "Use this when deciding whether to call Codex, Cortex, creative, research, quality or ops assistants."
  },
  {
    id: "source-connection-mirror",
    label: "Source connection mirror",
    format: "json",
    path: "/api/source-connection-mirror",
    status: "supporting",
    sourceIds: ecosystemPlatformSourceMirror.map((item) => item.id),
    count: ecosystemPlatformSourceMirror.length,
    purpose: "Compares the observed Sources side-panel icons with platform evidence, callable tools, local binding and blockers.",
    useWhen: "Use this when the side panel shows only a few icons but the portfolio needs the complete connection proof."
  },
  {
    id: "aggressive-development-plan",
    label: "Aggressive development plan",
    format: "json",
    path: "/api/aggressive-development-plan",
    status: "primary",
    sourceIds: ecosystemAggressiveDevelopmentLanes.map((lane) => lane.id),
    count: ecosystemAggressiveDevelopmentLanes.length,
    purpose: "Shows how every connected or cataloged plugin family is actively routed into portfolio development.",
    useWhen: "Use this when continuing aggressive development with all connected plugin sources."
  },
  {
    id: "ops-command-center",
    label: "Ops command center",
    format: "json",
    path: "/api/ops-command-center",
    status: "primary",
    sourceIds: ["runtime-readiness", "deployment-targets", "aggressive-development-plan", "ai-helper-orchestration"],
    count: 4,
    purpose: "Aggregates source routing, runtime readiness, GitHub persistence and deployment gates for agent handoff.",
    useWhen: "Use this when continuing aggressive development after a GitHub publish."
  },
  {
    id: "polyglot-lab",
    label: "Polyglot repo source lab",
    format: "repo",
    path: "sources/polyglot",
    status: "local_reference",
    sourceIds: polyglotSourceContracts.map((contract) => contract.id),
    count: polyglotSourceContracts.length,
    purpose: "Repo-local full-stack language contracts without dependency inflation.",
    useWhen: "Use this when GitHub/source viewers need real full-stack language evidence."
  }
];

export const ecosystemSourceOutputManifest = {
  requestedInput: "User-provided plugin list",
  policy: "Plugins are represented as local, credential-safe source references. Install or invoke a plugin only when a future task needs that specific authenticated capability.",
  platformSidePanelPolicy: "The platform side Sources panel can show only actually invoked or discovered tools; the portfolio UI and APIs show the complete local source ledger.",
  sourceCount: ecosystemSourceTotal,
  uniquePluginRefCount: ecosystemPluginRefs.length,
  sourceKindSummary: ecosystemSourceKindSummary,
  connectionStateSummary: ecosystemConnectionStateSummary,
  installPolicySummary: ecosystemInstallPolicySummary,
  readinessLaneCount: ecosystemSourceReadinessMatrix.length,
  activationPlanCount: ecosystemSourceActivationPlan.length,
  aggressiveDevelopmentLaneCount: ecosystemAggressiveDevelopmentLanes.length,
  installPlanCount: ecosystemPluginInstallPlan.length,
  environmentExportCount: ecosystemEnvironmentSourceExports.length,
  sidePanelReceiptCount: ecosystemSidePanelReceipts.length,
  platformSourceMirrorCount: ecosystemPlatformSourceMirror.length,
  proofCardCount: ecosystemSourceProofCards.length,
  aiHelperLaneCount: ecosystemAiHelperLanes.length,
  sourceSignalMapCount: ecosystemSourceSignalMap.length,
  sourceExecutionQueueCount: ecosystemSourceExecutionQueue.length,
  sourceActionPacketCount: ecosystemSourceActionPackets.length,
  sourceActionBoardColumnCount: ecosystemSourceActionBoard.columns.length,
  sourceQualityGateCount: ecosystemSourceQualityGates.length,
  sourceRunbookStepCount: ecosystemSourceRunbook.steps.length,
  sourceExecutionReceiptCount: ecosystemSourceExecutionReceipts.length,
  sourceExecutionDigestMetricCount: ecosystemSourceExecutionDigest.metrics.length,
  sourceContinuationBriefReadPathCount: ecosystemSourceContinuationBrief.readFirstPaths.length,
  exportIndexCount: ecosystemSourceExportIndex.length,
  deliveryArtifactCount: ecosystemSourceDeliveryArtifacts.length,
  groupCount: ecosystemSourceGroups.length,
  polyglotContractCount: polyglotSourceContracts.length,
  outputSurfaceCount: ecosystemOutputSurfaces.length,
  connectionAttemptCount: ecosystemConnectionAttempts.length
} as const;
