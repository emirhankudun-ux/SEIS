import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  walkthrough: 'docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md',
  publicRoute: 'apps/web/seis-linux-replica-public-demo.html',
  readme: 'README.md',
  review: 'docs/reviews/SEIS_LINUX_REPLICA_LIVE_DEMO_REVIEW.md',
  replica: 'apps/web/seis-linux-replica.html',
  routeCheck: 'scripts/check-seis-static-demo-routes.mjs',
  smokeCheck: 'scripts/check-seis-linux-replica-browser-smoke.mjs',
  referenceBankCheck: 'scripts/check-seis-reference-banks.mjs',
};

const checks = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function check(name, ok, detail = {}) {
  checks.push({
    name,
    ok: Boolean(ok),
    ...detail,
  });
}

for (const [key, file] of Object.entries(files)) {
  const exists = fs.existsSync(path.join(root, file));
  check(`${key} file exists`, exists, { file });
}

const walkthrough = read(files.walkthrough);
const publicRoute = read(files.publicRoute);
const readme = read(files.readme);
const review = read(files.review);
const replica = read(files.replica);

const requiredWalkthroughSnippets = [
  'seis-linux-replica.html?demo=live',
  'seis-linux-replica-public-demo.html',
  'Live Demo Console',
  'Demo Readiness',
  'Icon-first OS chrome',
  'semantic app symbols',
  'aria-label',
  'Local Functional Audit',
  '67',
  '35',
  '34',
  '1',
  '8',
  'workbench snapshots',
  'Enhanced app slots',
  'SEIS App Library',
  'SEIS AI Chat',
  'Conversation Center',
  'data-ai-conversation-core',
  'data-ai-intent-chip',
  'data-ai-intent-symbol',
  'data-ai-dock-symbol',
  'data-ai-chat-open-code',
  'data-quick-app="ai-chat"',
  'compatibility alias for SEIS AI Chat',
  'duplicate pinned rail item',
  'generic chat surface',
  'SEIS Code AI',
  'SEIS AGI Control',
  'SEIS SSH Control',
  'Apple Native Shell capsule',
  'contained as a Linux Replica capsule',
  'data-native-dock-symbol',
  'data-window-head-symbol',
  'data-category-symbol',
  'data-start-action-symbol',
  'data-start-route-symbol',
  'data-topbar-action-symbol',
  'data-window-arrange-symbol',
  'visually hidden in the capsule dock',
  'data-about-action-symbol',
  'data-readiness-action-symbol',
  'data-live-action-symbol',
  'data-launchpad-action-symbol',
  'data-launchpad-card-symbol',
  'data-file-action-symbol',
  'data-editor-action-symbol',
  'data-task-action-symbol',
  'data-log-action-symbol',
  'data-settings-action-symbol',
  'data-todo-action-symbol',
  'data-monitor-action-symbol',
  'data-code-ai-action-symbol',
  'data-ssh-control-action-symbol',
  'data-bridge-action-symbol',
  'data-reference-hero-action-symbol',
  'data-reference-action-symbol',
  'data-reference-index-symbol',
  'data-reference-detail-action-symbol',
  'visually hidden',
  'Website / AI Platform',
  'Ubuntu Web Desktop',
  'Focused lane',
  'Design Board',
  '?demo=live&source=website',
  '?demo=live&source=ubuntu',
  'live',
  'readiness',
  'apps',
  'refs',
  'sources',
  'website',
  'ubuntu',
  'no SSH',
  'no provider calls',
  'no secrets',
  'apps/web/reference-banks/',
  '219',
  '148',
  '71',
  'SEIS placeholder previews',
  'npm run check:seis-reference-banks',
  'node scripts/check-seis-linux-replica-browser-smoke.mjs --static',
  'npm run check:seis-linux-replica-browser-smoke',
];

for (const snippet of requiredWalkthroughSnippets) {
  check(`walkthrough mentions ${snippet}`, walkthrough.includes(snippet), {
    file: files.walkthrough,
  });
}

check(
  'README links public walkthrough',
  readme.includes('docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md'),
  { file: files.readme },
);

check(
  'README lists walkthrough validation',
  readme.includes('node scripts/check-seis-linux-replica-public-walkthrough.mjs'),
  { file: files.readme },
);

check(
  'README lists static Linux Replica contract validation',
  readme.includes('node scripts/check-seis-linux-replica-browser-smoke.mjs --static'),
  { file: files.readme },
);

check(
  'README lists reference-bank validation',
  readme.includes('npm run check:seis-reference-banks'),
  { file: files.readme },
);

check(
  'README documents public demo route',
  readme.includes('seis-linux-replica-public-demo.html'),
  { file: files.readme },
);

check(
  'review links public walkthrough',
  review.includes('docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md'),
  { file: files.review },
);

check(
  'review lists walkthrough validation',
  review.includes('node scripts/check-seis-linux-replica-public-walkthrough.mjs'),
  { file: files.review },
);

check(
  'review lists static Linux Replica contract validation',
  review.includes('node scripts/check-seis-linux-replica-browser-smoke.mjs --static'),
  { file: files.review },
);

check(
  'review lists reference-bank validation',
  review.includes('npm run check:seis-reference-banks'),
  { file: files.review },
);

check(
  'review documents public demo route',
  review.includes('seis-linux-replica-public-demo.html'),
  { file: files.review },
);

for (const snippet of [
  'Static route package',
  '`10` routes, `15` precache assets',
  'Functional core apps',
  '`67`',
  'Enhanced app slots',
  '`35`',
  'Enhanced workbenches',
  '`34`',
  'SEIS AI Chat alias',
  '`1`',
  'Playable local games',
  '`8`',
  'Visible functional audit panels',
  'Icon-first side rail',
  'Side rail app symbols',
  'Visible side rail text codes',
  'All functional app audit',
  '`67` passed, `0` failed',
  'Workbench state flow',
  '`34` snapshots, `34` resets',
  'Playable game state flow',
  '`8` resets',
  'Local Functional Audit',
  'Reference thumbnail fallback',
  'Apple Native Shell capsule',
  'Apple Native dock symbols',
  'Visible Apple Native dock text codes',
  'Window header symbols',
  'Launcher chrome symbols',
  'SEIS App Library action symbols',
  'Launchpad quick action symbols',
  'Launchpad card symbols',
  'Icon-first quick actions',
  'Visible quick action text codes',
  'Terminal `apps` functional coverage',
  'Terminal `sources` lane coverage',
  'Deep-link terminal ready',
]) {
  check(`review includes functional audit evidence: ${snippet}`, review.includes(snippet), {
    file: files.review,
  });
}

for (const snippet of [
  'Open Live Demo',
  'seis-linux-replica.html?demo=live',
  'No API keys',
  'No SSH execution',
  '219',
  'Website / AI Platform',
  'Ubuntu Web Desktop',
  '?demo=live&source=website',
  '?demo=live&source=ubuntu',
  'docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md',
]) {
  check(`public route includes ${snippet}`, publicRoute.includes(snippet), {
    file: files.publicRoute,
  });
}

check(
  'review no longer leaves walkthrough as missing work',
  !review.includes('add a public-facing demo walkthrough page when the full demo package is ready'),
  { file: files.review },
);

for (const snippet of [
  'Live Demo Console',
  'Demo Readiness',
  'SEIS App Library',
  'Apple Native Shell',
  'Website Lane',
  'Ubuntu Desktop',
  'Focused lane',
  'data-reference-active-source',
  'data-reference-lane-focus',
  'data-reference-design-board',
  'data-native-shell-contained',
  'data-native-capsule-stage',
  'data-native-capsule-dock',
  'data-native-dock-symbol',
  'data-native-signal',
  'data-app-symbol',
  'data-window-head-symbol',
  'data-category-symbol',
  'data-start-action-symbol',
  'data-start-route-symbol',
  'actionSymbolMarkup',
  'icon-action-strip',
  'data-about-action-symbol',
  'data-readiness-action-symbol',
  'data-live-action-symbol',
  'data-launchpad-action-strip',
  'data-launchpad-action-symbol',
  'data-launchpad-core-card',
  'data-launchpad-reference-card',
  'data-launchpad-card-symbol',
  'data-file-action-strip',
  'data-file-action-symbol',
  'data-editor-action-strip',
  'data-editor-action-symbol',
  'data-task-action-strip',
  'data-task-action-symbol',
  'data-log-action-strip',
  'data-log-action-symbol',
  'data-browser-action-strip',
  'data-browser-action-symbol',
  'data-game-action-strip',
  'data-game-shell-action-symbol',
  'data-generic-action-strip',
  'data-generic-action-symbol',
  'data-topbar-action-symbol',
  'data-arrange-windows',
  'data-window-arrange-symbol',
  'windowArrangementSnapshot',
  'w.appId==="apple-native-shell"',
  'data-settings-action-strip',
  'data-settings-action-symbol',
  'data-todo-action-strip',
  'data-todo-action-symbol',
  'data-paint-action-strip',
  'data-paint-action-symbol',
  'data-media-action-strip',
  'data-media-action-symbol',
  'data-monitor-action-strip',
  'data-monitor-action-symbol',
  'data-code-ai-action-strip',
  'data-code-ai-action-symbol',
  'data-ssh-control-action-strip',
  'data-ssh-control-action-symbol',
  'data-bridge-action-strip',
  'data-bridge-action-symbol',
  'data-code-workspace-action-symbol',
  'data-design-action-symbol',
  'data-cloud-action-symbol',
  'data-store-action-symbol',
  'data-store-route-action-symbol',
  'data-music-action-symbol',
  'data-music-state',
  'data-ai-core-action-symbol',
  'data-web-action-symbol',
  'data-bridge-workspace-action-symbol',
  'data-reference-hero-action-symbol',
  'data-reference-action-symbol',
  'data-reference-index-symbol',
  'data-reference-detail-action-symbol',
  'data-ai-intent-symbol',
  'data-ai-dock-symbol',
  'host.dataset.iconFirstRail',
  'appSymbolMarkup',
  'referenceSourceIntent',
  'DEMO_INTENT',
  'renderFunctionalAuditEvidence',
  'data-functional-audit-evidence',
  'data-audit-metric',
  'data-audit-proof',
  'apps:()=>commands.coreapps()',
  'refs:(args)=>',
]) {
  check(`replica includes ${snippet}`, replica.includes(snippet), {
    file: files.replica,
  });
}

for (const snippet of [
  'data-functional-audit-evidence',
  'allFunctionalAppAudit',
  'stateFlowPassed',
  'auditNoKeyProof',
  'Website / AI Platform',
  'Ubuntu Web Desktop',
  'referenceSourceIntent',
  'data-reference-lane-focus',
  'data-reference-design-board',
  'data-native-shell-contained',
  'data-native-capsule-stage',
  'data-native-capsule-dock',
  'data-native-signal',
  'nativeDockSymbols',
  'nativeDockVisibleCodeLabels',
  'aboutActionSymbols',
  'aboutActionVisibleCodeLabels',
  'readinessActionSymbols',
  'readinessActionVisibleCodeLabels',
  'liveActionSymbols',
  'liveActionVisibleCodeLabels',
  'launchpadActionButtons',
  'launchpadActionSymbols',
  'launchpadActionVisibleCodeLabels',
  'launchpadCoreCards',
  'launchpadReferenceCards',
  'launchpadCardSymbols',
  'fileActionButtons',
  'fileActionSymbols',
  'fileActionVisibleCodeLabels',
  'editorActionButtons',
  'editorActionSymbols',
  'editorActionVisibleCodeLabels',
  'taskActionButtons',
  'taskActionSymbols',
  'taskActionVisibleCodeLabels',
  'logActionButtons',
  'logActionSymbols',
  'logActionVisibleCodeLabels',
  'topbarActionButtons',
  'topbarActionSymbols',
  'topbarActionVisibleCodeLabels',
  'windowArrangeButtons',
  'windowArrangeSymbols',
  'windowArrangement',
  'appleNativeArrangement',
  'settingsActionButtons',
  'settingsActionSymbols',
  'settingsActionVisibleCodeLabels',
  'todoActionButtons',
  'todoActionSymbols',
  'todoActionVisibleCodeLabels',
  'monitorActionButtons',
  'monitorActionSymbols',
  'monitorActionVisibleCodeLabels',
  'codeAiActionButtons',
  'codeAiActionSymbols',
  'codeAiActionVisibleCodeLabels',
  'sshControlActionButtons',
  'sshControlActionSymbols',
  'sshControlActionVisibleCodeLabels',
  'bridgeWorkspaceActionButtons',
  'bridgeWorkspaceActionSymbols',
  'bridgeWorkspaceActionVisibleCodeLabels',
  'windowHeadSymbols',
  'windowHeadRawMarks',
  'categoryButtons',
  'categorySymbols',
  'activeCategorySymbols',
  'categoryVisibleLabels',
  'startActionSymbols',
  'startRouteSymbols',
  'startActionVisibleCodeLabels',
  'referenceHeroActionSymbols',
  'referenceHeroActionVisibleCodeLabels',
  'referenceActionSymbols',
  'referenceIndexSymbols',
  'referenceActionVisibleCodeLabels',
  'referenceDetailActionSymbols',
  'referenceDetailActionVisibleCodeLabels',
  'sideRailSymbols',
  'sideRailVisibleCodeLabels',
  'aiIntentSymbols',
  'aiDockSymbols',
  'aiDockVisibleCodeLabels',
  'apps:()=>commands.coreapps()',
  'refs:(args)=>',
]) {
  check(`smoke check includes ${snippet}`, read(files.smokeCheck).includes(snippet), {
    file: files.smokeCheck,
  });
}

for (const snippet of [
  'Website / AI Platform',
  'Ubuntu Web Desktop',
  'data-reference-lane-focus',
  'data-reference-design-board',
  'secretLikePatternScan',
  'noLiveBridge',
]) {
  check(`reference bank check includes ${snippet}`, read(files.referenceBankCheck).includes(snippet), {
    file: files.referenceBankCheck,
  });
}

const result = {
  ok: checks.every((item) => item.ok),
  checkedAt: new Date().toISOString(),
  files,
  checks,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
