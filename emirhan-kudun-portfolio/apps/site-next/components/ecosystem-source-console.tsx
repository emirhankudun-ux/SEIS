import {
  ecosystemAggressiveDevelopmentLanes,
  ecosystemAiHelperLanes,
  ecosystemSourceActivationPlan,
  ecosystemConnectionAttempts,
  ecosystemConnectionStateSummary,
  ecosystemEnvironmentSourceExports,
  ecosystemInstallPolicySummary,
  ecosystemOutputSurfaces,
  ecosystemPlatformSourceMirror,
  ecosystemPluginInstallPlan,
  ecosystemSidePanelReceipts,
  ecosystemSourceDeliveryArtifacts,
  ecosystemSourceExportIndex,
  ecosystemSourceFlatList,
  ecosystemSourceKindSummary,
  ecosystemSourceOutputManifest,
  ecosystemSourceGroups,
  ecosystemSourceProofCards,
  ecosystemSourceReadinessMatrix,
  ecosystemSourceTotal,
  polyglotSourceContracts,
  type Locale
} from "@seis/content";

type SourceConsoleCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  lead: string;
  totalLabel: string;
  groupsLabel: string;
  languagesLabel: string;
  sourceLabel: string;
  pluginLabel: string;
  outputsTitle: string;
  outputsLead: string;
  outputSurfaceLabel: string;
  uniqueRefsLabel: string;
  sourceKindsTitle: string;
  sourceKindLabel: string;
  visibilityLabel: string;
  readinessTitle: string;
  readinessLead: string;
  readinessNextLabel: string;
  activationTitle: string;
  activationLead: string;
  activationActionLabel: string;
  activationGuardrailLabel: string;
  environmentTitle: string;
  environmentLead: string;
  environmentEvidenceLabel: string;
  environmentNextLabel: string;
  platformMirrorTitle: string;
  platformMirrorLead: string;
  platformMirrorMeaningLabel: string;
  platformMirrorNextLabel: string;
  platformMirrorLimitationLabel: string;
  platformMirrorCandidateLabel: string;
  sidePanelTitle: string;
  sidePanelLead: string;
  sidePanelExpectationLabel: string;
  sidePanelLimitationLabel: string;
  sourceProofTitle: string;
  sourceProofLead: string;
  sourceProofSeesLabel: string;
  sourceProofLimitationLabel: string;
  exportIndexTitle: string;
  exportIndexLead: string;
  exportIndexUseLabel: string;
  aiHelpersTitle: string;
  aiHelpersLead: string;
  aiHelpersNextLabel: string;
  aiHelpersGuardrailLabel: string;
  aggressiveTitle: string;
  aggressiveLead: string;
  aggressiveActionLabel: string;
  aggressiveUsesLabel: string;
  aggressiveBlockerLabel: string;
  aggressiveGuardrailLabel: string;
  aggressiveConnectedLabel: string;
  aggressiveCallableLabel: string;
  aggressiveManifestLabel: string;
  installPlanTitle: string;
  installPlanLead: string;
  installPlanActionLabel: string;
  installPlanGuardrailLabel: string;
  deliveryTitle: string;
  deliveryLead: string;
  deliveryModeLabel: string;
  deliveryGuardrailLabel: string;
  connectionTitle: string;
  connectionLead: string;
  connectionStateLabel: string;
  installPolicyLabel: string;
  attemptsTitle: string;
  sidePanelLabel: string;
  polyglotTitle: string;
  polyglotLead: string;
  liveLabel: string;
  contractLabel: string;
};

const copyByLocale: Record<Locale, SourceConsoleCopy> = {
  tr: {
    nav: "Sources",
    eyebrow: "Environment / Sources",
    title: "Plugin kaynaklari ve full-stack dil kontratlari tek portfolyo yuzeyinde.",
    lead: "Bu konsol verilen eklenti evrenini credential cagirmadan gorunur kaynak mimarisine cevirir; her kaynak denetlenebilir, gruplu ve geri alinabilir kalir.",
    totalLabel: "kaynak",
    groupsLabel: "grup",
    languagesLabel: "dil kontrati",
    sourceLabel: "Sources",
    pluginLabel: "Plugin ref",
    outputsTitle: "Outputs / Sources",
    outputsLead: "Attigin eklenti listesi UI, API, health ve repo kaynak ciktilarina baglandi; dis plugin kurulumu sadece gercek bir connector gorevi gerektiginde acilir.",
    outputSurfaceLabel: "output yuzeyi",
    uniqueRefsLabel: "tekil plugin ref",
    sourceKindsTitle: "Plugin / skill gorunurlugu",
    sourceKindLabel: "Kaynak turu",
    visibilityLabel: "manifestte temsil",
    readinessTitle: "External binding readiness",
    readinessLead: "Kaynaklar calismis, oturumda hazir, discover edilmis, bloklu ve manifest-only lane'lerine ayrildi.",
    readinessNextLabel: "Sonraki aksiyon",
    activationTitle: "Connector activation plan",
    activationLead: "Dis kaynaklari guvenli sirayla canli ise tasir: once kanit, sonra tek builder, sonra auth bloklari.",
    activationActionLabel: "Aksiyon",
    activationGuardrailLabel: "Koruma",
    environmentTitle: "Environment source export",
    environmentLead: "Platform yan paneli, portfolio UI, API paketi ve repo kaynaklari ayri kanallar olarak export edildi.",
    environmentEvidenceLabel: "Kanit yolu",
    environmentNextLabel: "Sonraki aksiyon",
    platformMirrorTitle: "Observed Sources panel mirror",
    platformMirrorLead: "Screenshot'ta gorunen sinirli ikon paneli ile portfolio'nun tam 212 kaynak mirror'u ayrildi.",
    platformMirrorMeaningLabel: "Anlami",
    platformMirrorNextLabel: "Sonraki aksiyon",
    platformMirrorLimitationLabel: "Sinir",
    platformMirrorCandidateLabel: "aday kanit",
    sidePanelTitle: "Platform side-panel receipt",
    sidePanelLead: "Yan panelde gorunebilecek gercek tool kaniti ile portfolio'nun tam local kaynak aynasi ayrildi.",
    sidePanelExpectationLabel: "Beklenti",
    sidePanelLimitationLabel: "Sinir",
    sourceProofTitle: "Sources proof",
    sourceProofLead: "Platform yan paneli, portfolio UI, API outputlari, install plani ve repo full-stack kontratlari tek kanit seridinde ayrildi.",
    sourceProofSeesLabel: "Gorecegin yer",
    sourceProofLimitationLabel: "Sinir",
    exportIndexTitle: "Download / export index",
    exportIndexLead: "Tum indirilebilir ve incelenebilir source ciktilari tek indexte toplandi: package, proof, install plan, side panel, environment, delivery ve polyglot.",
    exportIndexUseLabel: "Ne zaman kullanilir",
    aiHelpersTitle: "AI helper orchestration",
    aiHelpersLead: "Codex aktif mimar; Cortex/Snowflake baglanti bekliyor; creative, research, quality ve ops AI kaynaklari gorev bazli yardima hazir.",
    aiHelpersNextLabel: "Sonraki aksiyon",
    aiHelpersGuardrailLabel: "Koruma",
    aggressiveTitle: "Aggressive development cockpit",
    aggressiveLead: "Tum bagli ve session-callable kaynaklar sprint lane'lerine ayrildi; her lane hangi eklentileri kullandigini, blocker'i ve korumayi gosterir.",
    aggressiveActionLabel: "Simdi yapilacak",
    aggressiveUsesLabel: "Bagli eklenti kullanimi",
    aggressiveBlockerLabel: "Blokaj",
    aggressiveGuardrailLabel: "Koruma",
    aggressiveConnectedLabel: "connected",
    aggressiveCallableLabel: "callable",
    aggressiveManifestLabel: "manifest",
    installPlanTitle: "Plugin install plan",
    installPlanLead: "Hazir kaynaklar, auth isteyenler, connection isteyenler ve gelecekte tek tek acilacak backlog ayni yerde planlandi.",
    installPlanActionLabel: "Install / baglanti aksiyonu",
    installPlanGuardrailLabel: "Koruma",
    deliveryTitle: "Source delivery bundle",
    deliveryLead: "Indirilebilir JSON, repo dosyalari, archive referanslari ve install policy tek teslim paketinde toplandi.",
    deliveryModeLabel: "Teslim modu",
    deliveryGuardrailLabel: "Koruma",
    connectionTitle: "Dis kaynak baglanti ledger'i",
    connectionLead: "Yan panel sadece gercek tool cagrilarini gosterebilir; burada local manifest, discovered tool, invoked tool ve auth bloklari birlikte gorunur.",
    connectionStateLabel: "Baglanti durumu",
    installPolicyLabel: "Install policy",
    attemptsTitle: "Son dis kaynak denemeleri",
    sidePanelLabel: "Yan panel modu",
    polyglotTitle: "Polyglot full-stack source lab",
    polyglotLead: "TypeScript, CSS ve Next API canli; Python, Go, Rust, Java, C#, SQL, GraphQL, Swift, Kotlin, PHP ve Ruby dosyalari governance kontrati olarak repo icinde durur.",
    liveLabel: "live",
    contractLabel: "contract"
  },
  en: {
    nav: "Sources",
    eyebrow: "Environment / Sources",
    title: "Plugin sources and full-stack language contracts in one portfolio surface.",
    lead: "This console turns the requested plugin universe into a visible source architecture without credentialed calls; every source stays grouped, inspectable and reversible.",
    totalLabel: "sources",
    groupsLabel: "groups",
    languagesLabel: "language contracts",
    sourceLabel: "Sources",
    pluginLabel: "Plugin ref",
    outputsTitle: "Outputs / Sources",
    outputsLead: "The submitted plugin list is wired into UI, API, health and repo source outputs; external plugin installation opens only for a concrete connector task.",
    outputSurfaceLabel: "output surfaces",
    uniqueRefsLabel: "unique plugin refs",
    sourceKindsTitle: "Plugin / skill visibility",
    sourceKindLabel: "Source kind",
    visibilityLabel: "represented in manifest",
    readinessTitle: "External binding readiness",
    readinessLead: "Sources are separated into invoked, session-ready, discovered, blocked and manifest-only lanes.",
    readinessNextLabel: "Next action",
    activationTitle: "Connector activation plan",
    activationLead: "Promote external sources safely: evidence first, one builder lane next, then auth blockers.",
    activationActionLabel: "Action",
    activationGuardrailLabel: "Guardrail",
    environmentTitle: "Environment source export",
    environmentLead: "The platform side panel, portfolio UI, API package and repo sources are exported as separate channels.",
    environmentEvidenceLabel: "Evidence path",
    environmentNextLabel: "Next action",
    platformMirrorTitle: "Observed Sources panel mirror",
    platformMirrorLead: "The limited icon panel in the screenshot is separated from the complete 212-source portfolio mirror.",
    platformMirrorMeaningLabel: "Meaning",
    platformMirrorNextLabel: "Next action",
    platformMirrorLimitationLabel: "Limitation",
    platformMirrorCandidateLabel: "evidence candidates",
    sidePanelTitle: "Platform side-panel receipt",
    sidePanelLead: "Actual tool evidence that may appear in the side panel is separated from the complete local portfolio source mirror.",
    sidePanelExpectationLabel: "Expectation",
    sidePanelLimitationLabel: "Limitation",
    sourceProofTitle: "Sources proof",
    sourceProofLead: "The platform side panel, portfolio UI, API outputs, install plan and repo full-stack contracts are separated into one proof strip.",
    sourceProofSeesLabel: "Where you see it",
    sourceProofLimitationLabel: "Limitation",
    exportIndexTitle: "Download / export index",
    exportIndexLead: "All downloadable and inspectable source outputs are collected into one index: package, proof, install plan, side panel, environment, delivery and polyglot.",
    exportIndexUseLabel: "Use when",
    aiHelpersTitle: "AI helper orchestration",
    aiHelpersLead: "Codex is the active architect; Cortex/Snowflake is connection-blocked; creative, research, quality and ops AI lanes stay task-routed.",
    aiHelpersNextLabel: "Next action",
    aiHelpersGuardrailLabel: "Guardrail",
    aggressiveTitle: "Aggressive development cockpit",
    aggressiveLead: "All connected and session-callable sources are mapped into sprint lanes; each lane shows which plugins it uses, its blocker and its guardrail.",
    aggressiveActionLabel: "Action now",
    aggressiveUsesLabel: "Connected plugin use",
    aggressiveBlockerLabel: "Blocker",
    aggressiveGuardrailLabel: "Guardrail",
    aggressiveConnectedLabel: "connected",
    aggressiveCallableLabel: "callable",
    aggressiveManifestLabel: "manifest",
    installPlanTitle: "Plugin install plan",
    installPlanLead: "Ready sources, auth-gated providers, connection setup and future one-by-one backlog promotion are planned in one place.",
    installPlanActionLabel: "Install / connection action",
    installPlanGuardrailLabel: "Guardrail",
    deliveryTitle: "Source delivery bundle",
    deliveryLead: "Downloadable JSON, repo files, archive references and install policy are collected into one handoff package.",
    deliveryModeLabel: "Delivery mode",
    deliveryGuardrailLabel: "Guardrail",
    connectionTitle: "External source connection ledger",
    connectionLead: "The side panel can show only real tool calls; this local ledger separates manifest, discovered tools, invoked tools and auth blocks.",
    connectionStateLabel: "Connection state",
    installPolicyLabel: "Install policy",
    attemptsTitle: "Latest external source checks",
    sidePanelLabel: "Side panel mode",
    polyglotTitle: "Polyglot full-stack source lab",
    polyglotLead: "TypeScript, CSS and Next API are live; Python, Go, Rust, Java, C#, SQL, GraphQL, Swift, Kotlin, PHP and Ruby files live in the repo as governance contracts.",
    liveLabel: "live",
    contractLabel: "contract"
  },
  fr: {
    nav: "Sources",
    eyebrow: "Environment / Sources",
    title: "Sources plugin et contrats full-stack dans une seule surface portfolio.",
    lead: "Cette console rend l'ecosysteme de plugins visible sans appels credentialed; chaque source reste groupee, lisible et reversible.",
    totalLabel: "sources",
    groupsLabel: "groupes",
    languagesLabel: "contrats langue",
    sourceLabel: "Sources",
    pluginLabel: "Plugin ref",
    outputsTitle: "Outputs / Sources",
    outputsLead: "La liste plugin fournie alimente les sorties UI, API, health et repo; l'installation externe reste reservee aux taches connector concretes.",
    outputSurfaceLabel: "surfaces output",
    uniqueRefsLabel: "plugin refs uniques",
    sourceKindsTitle: "Visibilite plugin / skill",
    sourceKindLabel: "Type source",
    visibilityLabel: "represente dans le manifest",
    readinessTitle: "Readiness connexions externes",
    readinessLead: "Les sources sont separees entre appelees, disponibles, detectees, bloquees et manifest-only.",
    readinessNextLabel: "Action suivante",
    activationTitle: "Plan activation connectors",
    activationLead: "Promouvoir les sources externes avec prudence: preuves, builder unique, puis blocages auth.",
    activationActionLabel: "Action",
    activationGuardrailLabel: "Garde-fou",
    environmentTitle: "Export sources environment",
    environmentLead: "Le panneau plateforme, l'UI portfolio, le paquet API et le repo sont exposes comme canaux separes.",
    environmentEvidenceLabel: "Chemin preuve",
    environmentNextLabel: "Action suivante",
    platformMirrorTitle: "Miroir du panneau Sources observe",
    platformMirrorLead: "Le panneau limite de la capture est separe du miroir portfolio complet.",
    platformMirrorMeaningLabel: "Sens",
    platformMirrorNextLabel: "Action suivante",
    platformMirrorLimitationLabel: "Limite",
    platformMirrorCandidateLabel: "candidats preuve",
    sidePanelTitle: "Receipt panneau plateforme",
    sidePanelLead: "Les preuves outil visibles cote plateforme sont separees du miroir local complet du portfolio.",
    sidePanelExpectationLabel: "Attente",
    sidePanelLimitationLabel: "Limite",
    sourceProofTitle: "Preuve Sources",
    sourceProofLead: "Panneau plateforme, UI portfolio, sorties API, plan install et contrats full-stack repo sont separes.",
    sourceProofSeesLabel: "Ou le voir",
    sourceProofLimitationLabel: "Limite",
    exportIndexTitle: "Index download / export",
    exportIndexLead: "Toutes les sorties source telechargeables et inspectables sont groupees dans un index.",
    exportIndexUseLabel: "Utiliser quand",
    aiHelpersTitle: "Orchestration assistants AI",
    aiHelpersLead: "Codex est actif; Cortex/Snowflake attend une connexion; les lanes creative, recherche, qualite et ops restent routees par tache.",
    aiHelpersNextLabel: "Action suivante",
    aiHelpersGuardrailLabel: "Garde-fou",
    aggressiveTitle: "Cockpit developpement agressif",
    aggressiveLead: "Toutes les sources connectees et session-callable sont mappees en lanes sprint; chaque lane affiche les plugins utilises, son blocage et son garde-fou.",
    aggressiveActionLabel: "Action maintenant",
    aggressiveUsesLabel: "Usage plugin connecte",
    aggressiveBlockerLabel: "Blocage",
    aggressiveGuardrailLabel: "Garde-fou",
    aggressiveConnectedLabel: "connectees",
    aggressiveCallableLabel: "callable",
    aggressiveManifestLabel: "manifest",
    installPlanTitle: "Plan installation plugins",
    installPlanLead: "Sources pretes, fournisseurs avec auth, connexions requises et backlog futur sont planifies ensemble.",
    installPlanActionLabel: "Action install / connexion",
    installPlanGuardrailLabel: "Garde-fou",
    deliveryTitle: "Bundle livraison sources",
    deliveryLead: "JSON telechargeable, fichiers repo, archives et politique install sont groupes dans un paquet.",
    deliveryModeLabel: "Mode livraison",
    deliveryGuardrailLabel: "Garde-fou",
    connectionTitle: "Ledger connexions externes",
    connectionLead: "Le panneau lateral ne montre que les outils reellement appeles; ce ledger separe manifest, outils detectes, appels et blocages auth.",
    connectionStateLabel: "Etat connexion",
    installPolicyLabel: "Politique install",
    attemptsTitle: "Dernieres verifications externes",
    sidePanelLabel: "Mode panneau",
    polyglotTitle: "Polyglot full-stack source lab",
    polyglotLead: "TypeScript, CSS et Next API sont live; Python, Go, Rust, Java, C#, SQL, GraphQL, Swift, Kotlin, PHP et Ruby restent comme contrats de gouvernance.",
    liveLabel: "live",
    contractLabel: "contract"
  },
  it: {
    nav: "Sources",
    eyebrow: "Environment / Sources",
    title: "Sorgenti plugin e contratti full-stack in una sola superficie portfolio.",
    lead: "Questa console rende visibile l'ecosistema plugin senza chiamate credentialed; ogni sorgente resta raggruppata, ispezionabile e reversibile.",
    totalLabel: "sorgenti",
    groupsLabel: "gruppi",
    languagesLabel: "contratti lingua",
    sourceLabel: "Sources",
    pluginLabel: "Plugin ref",
    outputsTitle: "Outputs / Sources",
    outputsLead: "La lista plugin inviata alimenta output UI, API, health e repo; installazioni esterne solo per task connector concreti.",
    outputSurfaceLabel: "superfici output",
    uniqueRefsLabel: "plugin ref unici",
    sourceKindsTitle: "Visibilita plugin / skill",
    sourceKindLabel: "Tipo sorgente",
    visibilityLabel: "rappresentato nel manifest",
    readinessTitle: "Readiness connessioni esterne",
    readinessLead: "Le sorgenti sono divise tra invocate, disponibili, rilevate, bloccate e manifest-only.",
    readinessNextLabel: "Azione successiva",
    activationTitle: "Piano attivazione connector",
    activationLead: "Porta live le sorgenti esterne in sicurezza: prove, un builder, poi blocchi auth.",
    activationActionLabel: "Azione",
    activationGuardrailLabel: "Guardrail",
    environmentTitle: "Export environment sources",
    environmentLead: "Pannello piattaforma, UI portfolio, pacchetto API e repo sono canali separati.",
    environmentEvidenceLabel: "Percorso prova",
    environmentNextLabel: "Azione successiva",
    platformMirrorTitle: "Mirror pannello Sources osservato",
    platformMirrorLead: "Il pannello icone limitato nello screenshot e separato dal mirror completo del portfolio.",
    platformMirrorMeaningLabel: "Significato",
    platformMirrorNextLabel: "Azione successiva",
    platformMirrorLimitationLabel: "Limite",
    platformMirrorCandidateLabel: "candidati prova",
    sidePanelTitle: "Receipt pannello piattaforma",
    sidePanelLead: "La prova tool visibile nel pannello e separata dal mirror locale completo del portfolio.",
    sidePanelExpectationLabel: "Aspettativa",
    sidePanelLimitationLabel: "Limite",
    sourceProofTitle: "Prova Sources",
    sourceProofLead: "Pannello piattaforma, UI portfolio, output API, piano install e contratti full-stack repo sono separati.",
    sourceProofSeesLabel: "Dove lo vedi",
    sourceProofLimitationLabel: "Limite",
    exportIndexTitle: "Indice download / export",
    exportIndexLead: "Tutti gli output source scaricabili e ispezionabili sono raccolti in un indice.",
    exportIndexUseLabel: "Usa quando",
    aiHelpersTitle: "Orchestrazione helper AI",
    aiHelpersLead: "Codex e attivo; Cortex/Snowflake attende connessione; creative, research, quality e ops AI restano route per task.",
    aiHelpersNextLabel: "Azione successiva",
    aiHelpersGuardrailLabel: "Guardrail",
    aggressiveTitle: "Cockpit sviluppo aggressivo",
    aggressiveLead: "Tutte le sorgenti connesse e session-callable sono mappate in sprint lane; ogni lane mostra plugin usati, blocco e guardrail.",
    aggressiveActionLabel: "Azione ora",
    aggressiveUsesLabel: "Uso plugin connessi",
    aggressiveBlockerLabel: "Blocco",
    aggressiveGuardrailLabel: "Guardrail",
    aggressiveConnectedLabel: "connesse",
    aggressiveCallableLabel: "callable",
    aggressiveManifestLabel: "manifest",
    installPlanTitle: "Piano install plugin",
    installPlanLead: "Sorgenti pronte, provider con auth, setup connessione e backlog futuro sono pianificati insieme.",
    installPlanActionLabel: "Azione install / connessione",
    installPlanGuardrailLabel: "Guardrail",
    deliveryTitle: "Bundle consegna sorgenti",
    deliveryLead: "JSON scaricabile, file repo, riferimenti archive e policy install sono in un unico pacchetto.",
    deliveryModeLabel: "Modo consegna",
    deliveryGuardrailLabel: "Guardrail",
    connectionTitle: "Ledger connessioni esterne",
    connectionLead: "Il pannello laterale mostra solo tool realmente chiamati; questo ledger separa manifest, tool rilevati, chiamate e blocchi auth.",
    connectionStateLabel: "Stato connessione",
    installPolicyLabel: "Policy install",
    attemptsTitle: "Ultimi check esterni",
    sidePanelLabel: "Modo pannello",
    polyglotTitle: "Polyglot full-stack source lab",
    polyglotLead: "TypeScript, CSS e Next API sono live; Python, Go, Rust, Java, C#, SQL, GraphQL, Swift, Kotlin, PHP e Ruby restano contratti di governance.",
    liveLabel: "live",
    contractLabel: "contract"
  },
  de: {
    nav: "Sources",
    eyebrow: "Environment / Sources",
    title: "Plugin-Quellen und Full-Stack-Sprachvertraege in einer Portfolio-Flache.",
    lead: "Diese Konsole macht das Plugin-Okosystem sichtbar, ohne credentialed Calls zu starten; jede Quelle bleibt gruppiert, pruefbar und reversibel.",
    totalLabel: "Quellen",
    groupsLabel: "Gruppen",
    languagesLabel: "Sprachvertraege",
    sourceLabel: "Sources",
    pluginLabel: "Plugin ref",
    outputsTitle: "Outputs / Sources",
    outputsLead: "Die gesendete Plugin-Liste ist an UI-, API-, Health- und Repo-Outputs gebunden; externe Installation nur fuer konkrete Connector-Aufgaben.",
    outputSurfaceLabel: "Output-Flachen",
    uniqueRefsLabel: "eindeutige Plugin refs",
    sourceKindsTitle: "Plugin / Skill Sichtbarkeit",
    sourceKindLabel: "Quellentyp",
    visibilityLabel: "im Manifest vertreten",
    readinessTitle: "Externe Binding Readiness",
    readinessLead: "Quellen sind in aufgerufen, verfuegbar, entdeckt, blockiert und manifest-only getrennt.",
    readinessNextLabel: "Naechste Aktion",
    activationTitle: "Connector Aktivierungsplan",
    activationLead: "Externe Quellen sicher aktivieren: zuerst Evidenz, dann ein Builder, dann Auth-Blocker.",
    activationActionLabel: "Aktion",
    activationGuardrailLabel: "Schutzregel",
    environmentTitle: "Environment Source Export",
    environmentLead: "Platform-Panel, Portfolio-UI, API-Paket und Repo-Quellen sind getrennte Kanaele.",
    environmentEvidenceLabel: "Evidenzpfad",
    environmentNextLabel: "Naechste Aktion",
    platformMirrorTitle: "Observed Sources Panel Mirror",
    platformMirrorLead: "Das begrenzte Icon-Panel im Screenshot ist vom vollstaendigen Portfolio-Mirror getrennt.",
    platformMirrorMeaningLabel: "Bedeutung",
    platformMirrorNextLabel: "Naechste Aktion",
    platformMirrorLimitationLabel: "Grenze",
    platformMirrorCandidateLabel: "Evidenzkandidaten",
    sidePanelTitle: "Platform Side-Panel Receipt",
    sidePanelLead: "Echte Tool-Evidenz fuer das Seitenpanel ist vom vollstaendigen lokalen Portfolio-Mirror getrennt.",
    sidePanelExpectationLabel: "Erwartung",
    sidePanelLimitationLabel: "Grenze",
    sourceProofTitle: "Sources Proof",
    sourceProofLead: "Platform-Panel, Portfolio-UI, API-Outputs, Install-Plan und Repo-Full-Stack-Vertraege sind getrennt.",
    sourceProofSeesLabel: "Wo sichtbar",
    sourceProofLimitationLabel: "Grenze",
    exportIndexTitle: "Download / Export Index",
    exportIndexLead: "Alle downloadbaren und pruefbaren Source-Outputs liegen in einem Index.",
    exportIndexUseLabel: "Nutzen wenn",
    aiHelpersTitle: "AI Helper Orchestration",
    aiHelpersLead: "Codex ist aktiv; Cortex/Snowflake wartet auf Verbindung; Creative, Research, Quality und Ops AI bleiben task-geroutet.",
    aiHelpersNextLabel: "Naechste Aktion",
    aiHelpersGuardrailLabel: "Schutzregel",
    aggressiveTitle: "Aggressive Development Cockpit",
    aggressiveLead: "Alle verbundenen und session-callable Quellen werden Sprint-Lanes zugeordnet; jede Lane zeigt Plugin-Nutzung, Blocker und Schutzregel.",
    aggressiveActionLabel: "Jetzt tun",
    aggressiveUsesLabel: "Verbundene Plugin-Nutzung",
    aggressiveBlockerLabel: "Blocker",
    aggressiveGuardrailLabel: "Schutzregel",
    aggressiveConnectedLabel: "verbunden",
    aggressiveCallableLabel: "callable",
    aggressiveManifestLabel: "manifest",
    installPlanTitle: "Plugin Install Plan",
    installPlanLead: "Bereite Quellen, Auth-Anbieter, Verbindungssetup und zukuenftiger Backlog sind gemeinsam geplant.",
    installPlanActionLabel: "Install / Verbindung",
    installPlanGuardrailLabel: "Schutzregel",
    deliveryTitle: "Source Delivery Bundle",
    deliveryLead: "Downloadbares JSON, Repo-Dateien, Archiv-Referenzen und Install Policy liegen in einem Paket.",
    deliveryModeLabel: "Delivery Mode",
    deliveryGuardrailLabel: "Schutzregel",
    connectionTitle: "Externe Quellen-Verbindung",
    connectionLead: "Das Seitenpanel zeigt nur echte Tool-Aufrufe; dieses Ledger trennt Manifest, entdeckte Tools, Aufrufe und Auth-Blocker.",
    connectionStateLabel: "Verbindungsstatus",
    installPolicyLabel: "Install Policy",
    attemptsTitle: "Letzte externe Checks",
    sidePanelLabel: "Seitenpanel-Modus",
    polyglotTitle: "Polyglot full-stack source lab",
    polyglotLead: "TypeScript, CSS und Next API sind live; Python, Go, Rust, Java, C#, SQL, GraphQL, Swift, Kotlin, PHP und Ruby liegen als Governance-Vertraege im Repo.",
    liveLabel: "live",
    contractLabel: "contract"
  }
};

export function getSourceConsoleNavLabel(locale: Locale): string {
  return copyByLocale[locale].nav;
}

export function EcosystemSourceConsole({ locale = "tr", compact = false }: { locale?: Locale; compact?: boolean }) {
  const copy = copyByLocale[locale] || copyByLocale.tr;
  const sourceById = new Map(ecosystemSourceFlatList.map((source) => [source.id, source]));

  return (
    <section className="section source-console" id="sources" data-compact={compact ? "true" : "false"}>
      <div className="source-console-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <p>{copy.lead}</p>
      </div>

      <div className="source-console-metrics" aria-label={copy.eyebrow}>
        <article>
          <strong>{ecosystemSourceTotal}</strong>
          <span>{copy.totalLabel}</span>
        </article>
        <article>
          <strong>{ecosystemSourceGroups.length}</strong>
          <span>{copy.groupsLabel}</span>
        </article>
        <article>
          <strong>{polyglotSourceContracts.length}</strong>
          <span>{copy.languagesLabel}</span>
        </article>
        <article>
          <strong>{ecosystemSourceOutputManifest.uniquePluginRefCount}</strong>
          <span>{copy.uniqueRefsLabel}</span>
        </article>
        <article>
          <strong>{ecosystemOutputSurfaces.length}</strong>
          <span>{copy.outputSurfaceLabel}</span>
        </article>
      </div>

      <div className="source-proof-strip" aria-label={copy.sourceProofTitle}>
        <div>
          <p className="eyebrow">{copy.sourceProofTitle}</p>
          <h3>{copy.sourceProofTitle}</h3>
          <p>{copy.sourceProofLead}</p>
        </div>
        <div className="source-proof-grid">
          {ecosystemSourceProofCards.map((proof) => (
            <article className="source-proof-card" data-status={proof.status} key={proof.id}>
              <span>{proof.channel} / {proof.status}</span>
              <strong>{proof.count}</strong>
              <h4>{proof.label}</h4>
              <p><b>{copy.sourceProofSeesLabel}:</b> {proof.userSees}</p>
              <p><b>{copy.sourceProofLimitationLabel}:</b> {proof.limitation}</p>
              <code>{proof.evidencePath}</code>
            </article>
          ))}
        </div>
      </div>

      <div className="source-export-index" aria-label={copy.exportIndexTitle}>
        <div>
          <p className="eyebrow">{copy.exportIndexTitle}</p>
          <h3>{copy.exportIndexTitle}</h3>
          <p>{copy.exportIndexLead}</p>
        </div>
        <div className="source-export-index-grid">
          {ecosystemSourceExportIndex.map((item) => (
            <article className="source-export-index-card" data-status={item.status} key={item.id}>
              <span>{item.format} / {item.status}</span>
              <strong>{item.count}</strong>
              <h4>{item.label}</h4>
              <p>{item.purpose}</p>
              <small>{copy.exportIndexUseLabel}: {item.useWhen}</small>
              <code>{item.path}</code>
            </article>
          ))}
        </div>
      </div>

      <div className="source-ai-helper-orchestration" aria-label={copy.aiHelpersTitle}>
        <div>
          <p className="eyebrow">{copy.aiHelpersTitle}</p>
          <h3>{copy.aiHelpersTitle}</h3>
          <p>{copy.aiHelpersLead}</p>
        </div>
        <div className="source-ai-helper-grid">
          {ecosystemAiHelperLanes.map((lane) => (
            <article className="source-ai-helper-card" data-status={lane.status} key={lane.id}>
              <span>{lane.helperType} / {lane.status}</span>
              <strong>{lane.count}</strong>
              <h4>{lane.label}</h4>
              <p>{lane.role}</p>
              <small>{copy.aiHelpersNextLabel}: {lane.nextAction}</small>
              <small>{copy.aiHelpersGuardrailLabel}: {lane.guardrail}</small>
              <code>{lane.evidencePath}</code>
            </article>
          ))}
        </div>
      </div>

      <div className="source-aggressive-cockpit" aria-label={copy.aggressiveTitle}>
        <div>
          <p className="eyebrow">{copy.aggressiveTitle}</p>
          <h3>{copy.aggressiveTitle}</h3>
          <p>{copy.aggressiveLead}</p>
        </div>
        <div className="source-aggressive-grid">
          {ecosystemAggressiveDevelopmentLanes.map((lane) => (
            <article className="source-aggressive-card" data-priority={lane.priority} key={lane.id}>
              <span>{lane.posture} / {lane.priority}</span>
              <strong>{lane.count}</strong>
              <small>
                {lane.connectedCount} {copy.aggressiveConnectedLabel} / {lane.callableCount} {copy.aggressiveCallableLabel} / {lane.manifestCount} {copy.aggressiveManifestLabel}
              </small>
              <h4>{lane.title}</h4>
              <p><b>{copy.aggressiveActionLabel}:</b> {lane.actionNow}</p>
              <p><b>{copy.aggressiveUsesLabel}:</b> {lane.usesConnectedPlugins}</p>
              <p><b>{copy.aggressiveBlockerLabel}:</b> {lane.blocker}</p>
              <p><b>{copy.aggressiveGuardrailLabel}:</b> {lane.guardrail}</p>
              <code>{lane.outputPath}</code>
            </article>
          ))}
        </div>
      </div>

      <div className="source-output-panel" aria-label={copy.outputsTitle}>
        <div>
          <p className="eyebrow">Outputs / Sources</p>
          <h3>{copy.outputsTitle}</h3>
          <p>{copy.outputsLead}</p>
        </div>
        <div className="source-output-stack">
          <div className="source-kind-strip" aria-label={copy.sourceKindsTitle}>
            {Object.entries(ecosystemSourceKindSummary)
              .filter(([, count]) => count > 0)
              .map(([kind, count]) => (
                <article className="source-kind-card" data-kind={kind} key={kind}>
                  <span>{copy.sourceKindLabel}</span>
                  <strong>{kind}</strong>
                  <small>{count} / {copy.visibilityLabel}</small>
                </article>
              ))}
          </div>
          <div className="source-readiness-matrix" aria-label={copy.readinessTitle}>
            <div>
              <p className="eyebrow">{copy.readinessTitle}</p>
              <h4>{copy.readinessTitle}</h4>
              <p>{copy.readinessLead}</p>
            </div>
            <div className="source-readiness-grid">
              {ecosystemSourceReadinessMatrix.map((lane) => (
                <article className="source-readiness-card" data-status={lane.status} key={lane.id}>
                  <span>{lane.status}</span>
                  <strong>{lane.count}</strong>
                  <h5>{lane.label}</h5>
                  <p>{lane.description}</p>
                  <small>{copy.readinessNextLabel}: {lane.nextAction}</small>
                </article>
              ))}
            </div>
          </div>
          <div className="source-activation-plan" aria-label={copy.activationTitle}>
            <div>
              <p className="eyebrow">{copy.activationTitle}</p>
              <h4>{copy.activationTitle}</h4>
              <p>{copy.activationLead}</p>
            </div>
            <div className="source-activation-grid">
              {ecosystemSourceActivationPlan.map((step) => (
                <article className="source-activation-card" data-priority={step.priority} key={step.id}>
                  <span>{step.priority}</span>
                  <strong>{step.count}</strong>
                  <h5>{step.title}</h5>
                  <p><b>{copy.activationActionLabel}:</b> {step.action}</p>
                  <p><b>{copy.activationGuardrailLabel}:</b> {step.guardrail}</p>
                  <code>{step.outputPath}</code>
                </article>
              ))}
            </div>
          </div>
          <div className="source-environment-export" aria-label={copy.environmentTitle}>
            <div>
              <p className="eyebrow">{copy.environmentTitle}</p>
              <h4>{copy.environmentTitle}</h4>
              <p>{copy.environmentLead}</p>
            </div>
            <div className="source-environment-grid">
              {ecosystemEnvironmentSourceExports.map((item) => (
                <article className="source-environment-card" data-channel={item.channel} key={item.id}>
                  <span>{item.channel} / {item.visibility}</span>
                  <strong>{item.count}</strong>
                  <h5>{item.label}</h5>
                  <p>{item.note}</p>
                  <small>{copy.environmentEvidenceLabel}: {item.evidencePath}</small>
                  <small>{copy.environmentNextLabel}: {item.nextAction}</small>
                </article>
              ))}
            </div>
          </div>
          <div className="source-platform-mirror" aria-label={copy.platformMirrorTitle}>
            <div>
              <p className="eyebrow">{copy.platformMirrorTitle}</p>
              <h4>{copy.platformMirrorTitle}</h4>
              <p>{copy.platformMirrorLead}</p>
            </div>
            <div className="source-platform-mirror-grid">
              {ecosystemPlatformSourceMirror.map((item) => (
                <article className="source-platform-mirror-card" data-status={item.status} key={item.id}>
                  <span>{item.mirrorMode} / {item.status}</span>
                  <strong>{item.count}</strong>
                  {typeof item.candidateCount === "number" ? <small>{item.candidateCount} {copy.platformMirrorCandidateLabel}</small> : null}
                  <h5>{item.label}</h5>
                  <p><b>{copy.platformMirrorMeaningLabel}:</b> {item.userMeaning}</p>
                  <p><b>{copy.platformMirrorNextLabel}:</b> {item.nextAction}</p>
                  <p><b>{copy.platformMirrorLimitationLabel}:</b> {item.limitation}</p>
                  <code>{item.evidencePath}</code>
                </article>
              ))}
            </div>
          </div>
          <div className="source-side-panel-receipt" aria-label={copy.sidePanelTitle}>
            <div>
              <p className="eyebrow">{copy.sidePanelTitle}</p>
              <h4>{copy.sidePanelTitle}</h4>
              <p>{copy.sidePanelLead}</p>
            </div>
            <div className="source-side-panel-grid">
              {ecosystemSidePanelReceipts.map((item) => (
                <article className="source-side-panel-card" data-receipt={item.receiptMode} key={item.id}>
                  <span>{item.receiptMode}</span>
                  <strong>{item.count}</strong>
                  <h5>{item.label}</h5>
                  <p><b>{copy.sidePanelExpectationLabel}:</b> {item.expectation}</p>
                  <p><b>{copy.sidePanelLimitationLabel}:</b> {item.limitation}</p>
                  <code>{item.evidencePath}</code>
                </article>
              ))}
            </div>
          </div>
          <div className="source-install-plan" aria-label={copy.installPlanTitle}>
            <div>
              <p className="eyebrow">{copy.installPlanTitle}</p>
              <h4>{copy.installPlanTitle}</h4>
              <p>{copy.installPlanLead}</p>
            </div>
            <div className="source-install-plan-grid">
              {ecosystemPluginInstallPlan.map((step) => (
                <article className="source-install-plan-card" data-phase={step.phase} key={step.id}>
                  <span>{step.phase}</span>
                  <strong>{step.count}</strong>
                  <h5>{step.title}</h5>
                  <p><b>{copy.installPlanActionLabel}:</b> {step.action}</p>
                  <p><b>{copy.installPlanGuardrailLabel}:</b> {step.guardrail}</p>
                  <code>{step.outputPath}</code>
                </article>
              ))}
            </div>
          </div>
          <div className="source-delivery-bundle" aria-label={copy.deliveryTitle}>
            <div>
              <p className="eyebrow">{copy.deliveryTitle}</p>
              <h4>{copy.deliveryTitle}</h4>
              <p>{copy.deliveryLead}</p>
            </div>
            <div className="source-delivery-grid">
              {ecosystemSourceDeliveryArtifacts.map((item) => (
                <article className="source-delivery-card" data-artifact={item.artifactType} key={item.id}>
                  <span>{item.artifactType}</span>
                  <strong>{item.count}</strong>
                  <h5>{item.label}</h5>
                  <p>{item.purpose}</p>
                  <small>{copy.deliveryModeLabel}: {item.downloadMode}</small>
                  <small>{copy.deliveryGuardrailLabel}: {item.guardrail}</small>
                  <code>{item.path}</code>
                </article>
              ))}
            </div>
          </div>
          <div className="source-connection-ledger" aria-label={copy.connectionTitle}>
            <div>
              <p className="eyebrow">{copy.sidePanelLabel}</p>
              <h4>{copy.connectionTitle}</h4>
              <p>{copy.connectionLead}</p>
            </div>
            <div className="source-connection-strip">
              {Object.entries(ecosystemConnectionStateSummary)
                .filter(([, count]) => count > 0)
                .map(([state, count]) => (
                  <article className="source-connection-card" data-state={state} key={state}>
                    <span>{copy.connectionStateLabel}</span>
                    <strong>{state}</strong>
                    <small>{count}</small>
                  </article>
                ))}
            </div>
            <div className="source-install-strip">
              {Object.entries(ecosystemInstallPolicySummary)
                .filter(([, count]) => count > 0)
                .map(([policy, count]) => (
                  <article className="source-install-card" key={policy}>
                    <span>{copy.installPolicyLabel}</span>
                    <strong>{policy}</strong>
                    <small>{count}</small>
                  </article>
                ))}
            </div>
            <div className="source-attempt-list" aria-label={copy.attemptsTitle}>
              {ecosystemConnectionAttempts.map((attempt) => (
                <article className="source-attempt-card" data-state={attempt.status} key={attempt.id}>
                  <span>{attempt.status}</span>
                  <strong>{attempt.label}</strong>
                  <p>{attempt.result}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="source-output-grid">
            {ecosystemOutputSurfaces.map((surface) => (
              <article className="source-output-card" data-mode={surface.sourceMode} key={surface.id}>
                <span>{surface.sourceMode}</span>
                <strong>{surface.label}</strong>
                <p>{surface.role}</p>
                <code>{surface.path}</code>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="source-console-grid" aria-label={copy.sourceLabel}>
        {ecosystemSourceGroups.map((group) => (
          <article className="source-group" key={group.id}>
            <div className="source-group-meta">
              <span>{group.label}</span>
              <strong>{group.sources.length}</strong>
            </div>
            <h3>{group.title}</h3>
            <p>{group.strategy}</p>
            <ul className="source-chip-list" aria-label={`${group.title} ${copy.sourceLabel}`}>
              {group.sources.map((item) => (
                <li className="source-chip" data-kind={sourceById.get(item.id)?.sourceKind || "plugin"} key={item.id}>
                  <span>{item.label}</span>
                  <small>{sourceById.get(item.id)?.sourceKind || "plugin"} / {sourceById.get(item.id)?.connectionState || "manifest_only"}</small>
                  <small>{sourceById.get(item.id)?.sidePanelMode || "future_connector_task"} / {item.role}</small>
                  <code aria-label={`${copy.pluginLabel}: ${item.plugin}`}>{item.plugin}</code>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="polyglot-console" aria-label={copy.polyglotTitle}>
        <div>
          <p className="eyebrow">Polyglot / Full-stack</p>
          <h3>{copy.polyglotTitle}</h3>
          <p>{copy.polyglotLead}</p>
        </div>
        <div className="polyglot-grid">
          {polyglotSourceContracts.map((item) => (
            <article className="polyglot-card" data-status={item.status} key={item.id}>
              <span>{item.language}</span>
              <strong>{item.extension}</strong>
              <p>{item.role}</p>
              <code>{item.path}</code>
              <small>{item.status === "live" ? copy.liveLabel : copy.contractLabel} / {item.layer}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
