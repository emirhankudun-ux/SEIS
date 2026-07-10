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
  'Reference Vault',
  'Interactive Reviewer Console',
  'seis.publicDemoReviewerConsole.v1',
  'Export reviewer note',
  'live',
  'readiness',
  'sources',
  'no SSH',
  'no provider calls',
  'no secrets',
  'apps/web/reference-banks/',
  '219',
  '148',
  '71',
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
  'review documents public demo route',
  review.includes('seis-linux-replica-public-demo.html'),
  { file: files.review },
);

for (const snippet of [
  'Open Live Demo',
  'Interactive reviewer console',
  'data-reviewer-console',
  'seis.publicDemoReviewerConsole.v1',
  'copy-server-command',
  'export-reviewer-note',
  'aria-pressed',
  'localStorage',
  'seis-linux-replica.html?demo=live',
  'No API keys',
  'No SSH execution',
  '219',
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

for (const snippet of ['Live Demo Console', 'Demo Readiness', 'Reference Vault', 'DEMO_INTENT']) {
  check(`replica includes ${snippet}`, replica.includes(snippet), {
    file: files.replica,
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
