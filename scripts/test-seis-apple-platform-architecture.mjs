import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  collectChangedPaths,
  loadApplePlatformYamlSemantics,
  shouldEnforceGoalDiffScope,
  validateActiveGoalSharedDocuments,
  validateApplePlatformArchitecture,
  validateChangedPaths,
} from './check-seis-apple-platform-architecture.mjs';

const root = process.cwd();
let driftClassCount = 0;
const yamlPaths = [
  '.github/workflows/foundation-check.yml',
  '.github/workflows/apple-platform-foundation.yml',
  'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
];
const requiredPaths = [
  '.github/workflows/foundation-check.yml',
  '.github/workflows/apple-platform-foundation.yml',
  'apps/seis-demo-web/contracts/seis-demo-contract.json',
  'apps/seis-demo-web/README.md',
  'data/seis-apple-platform-architecture.json',
  'docs/APPLE_PLATFORM_STRATEGY.md',
  'docs/INDEX.md',
  'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md',
  'docs/architecture/seis-command-center.md',
  'docs/architecture/web-mobile-foundation.md',
  'docs/adr/0003-seis-apple-native-architecture-foundation.md',
  'docs/deployment/seis-demo-native-web-deploy-plan.md',
  'docs/roadmap/NEXT_PR_QUEUE.md',
  'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
  'package.json',
  'packages/seis_platform_swift/Package.swift',
  'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json',
];
const canonicalYamlBytes = new Map(
  yamlPaths.map(relativePath => [relativePath, fs.readFileSync(path.join(root, relativePath))]),
);
const canonicalYamlSemantics = loadApplePlatformYamlSemantics(root);

function validateFixture(fixture) {
  const yamlIsCanonical = yamlPaths.every(relativePath => {
    try {
      return fs
        .readFileSync(path.join(fixture, relativePath))
        .equals(canonicalYamlBytes.get(relativePath));
    } catch {
      return false;
    }
  });
  return validateApplePlatformArchitecture(
    fixture,
    yamlIsCanonical ? { yamlSemantics: canonicalYamlSemantics } : undefined,
  );
}

function makeFixture() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'seis-apple-architecture-'));
  for (const relativePath of requiredPaths) {
    const source = path.join(root, relativePath);
    const target = path.join(fixture, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  return fixture;
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(
    result.status,
    0,
    `git ${args.join(' ')} must pass: ${result.stderr || result.stdout}`,
  );
}

function mutateText(fixture, relativePath, replace) {
  const file = path.join(fixture, relativePath);
  const before = fs.readFileSync(file, 'utf8');
  const after = replace(before);
  assert.notEqual(after, before, `${relativePath} fixture mutation must change content`);
  fs.writeFileSync(file, after);
}

function mutateJson(fixture, relativePath, mutate) {
  const file = path.join(fixture, relativePath);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(value);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function expectFailure(name, mutate, expectedError) {
  const fixture = makeFixture();
  try {
    mutate(fixture);
    const errors = validateFixture(fixture);
    assert.ok(
      errors.some(error => error.includes(expectedError)),
      `${name} must fail with ${JSON.stringify(expectedError)}; received ${JSON.stringify(errors)}`,
    );
    driftClassCount += 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

assert.deepEqual(
  validateFixture(root),
  [],
  'canonical Apple architecture must pass',
);

{
  const fixture = makeFixture();
  try {
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('status: proposed', 'status: in-progress'),
    );
    const errors = validateApplePlatformArchitecture(fixture, {
      yamlSemantics: canonicalYamlSemantics,
    });
    assert.ok(
      errors.some(error => error.includes('semantic status: must equal "proposed"')),
      `stale cross-root YAML cache must parse actual files; received ${JSON.stringify(errors)}`,
    );
    driftClassCount += 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

{
  const fixture = makeFixture();
  try {
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('status: proposed', 'status: in-progress'),
    );
    const errors = validateApplePlatformArchitecture(fixture, {
      yamlSemantics: { documents: null },
    });
    assert.ok(
      errors.includes('semantic YAML cache: documents must be an object'),
      `malformed YAML cache must return a deterministic error; received ${JSON.stringify(errors)}`,
    );
    assert.ok(
      errors.some(error => error.includes('semantic status: must equal "proposed"')),
      `malformed YAML cache must still parse actual files; received ${JSON.stringify(errors)}`,
    );
    driftClassCount += 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

{
  const fixture = makeFixture();
  try {
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('status: proposed', 'status: in-progress'),
    );
    const clonedYamlSemantics = JSON.parse(JSON.stringify(canonicalYamlSemantics));
    const errors = validateApplePlatformArchitecture(fixture, {
      yamlSemantics: clonedYamlSemantics,
    });
    assert.ok(
      errors.includes('semantic YAML cache: cache was not produced by the canonical loader'),
      `deep-cloned YAML cache must fail provenance validation; received ${JSON.stringify(errors)}`,
    );
    assert.ok(
      errors.some(error => error.includes('semantic status: must equal "proposed"')),
      `untrusted YAML cache must still parse semantic mutations; received ${JSON.stringify(errors)}`,
    );
    driftClassCount += 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

expectFailure(
  'Swift tools directive suffix drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace('// swift-tools-version: 6.0', '// swift-tools-version: 6.0.999'),
    ),
  'Swift tools version must remain 6.0',
);

expectFailure(
  'SwiftPM minimum platform drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace('.macOS(.v13)', '.macOS(.v14)'),
    ),
  'exact platform inventory',
);

expectFailure(
  'additive SwiftPM platform drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace('.iOS(.v16)', '.iOS(.v16),\n        .tvOS(.v17)'),
    ),
  'exact platform inventory',
);

expectFailure(
  'additive SwiftPM product drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace(
        '.executable(name: "SeisAppleNativeShell", targets: ["SeisAppleNativeShell"])',
        '.executable(name: "SeisAppleNativeShell", targets: ["SeisAppleNativeShell"]),\n        .library(name: "UnexpectedKit", targets: ["SeisPlatformKit"])',
      ),
    ),
  'exact product inventory',
);

expectFailure(
  'external Swift package dependency',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace(
        'products: [',
        'dependencies: [.package(url: "https://example.invalid/package", from: "1.0.0")],\n    products: [',
      ),
    ),
  'external package dependencies are not permitted',
);

expectFailure(
  'additive target dependency drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace(
        'dependencies: ["SeisPlatformKit"],',
        'dependencies: ["SeisPlatformKit", "UnexpectedKit"],',
      ),
    ),
  'exact target, dependency, and resource inventory',
);

expectFailure(
  'additive SwiftPM target drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace(
        '.testTarget(name: "SeisPlatformKitTests", dependencies: ["SeisPlatformKit"])',
        '.target(name: "UnexpectedKit"),\n        .testTarget(name: "SeisPlatformKitTests", dependencies: ["SeisPlatformKit"])',
      ),
    ),
  'exact target, dependency, and resource inventory',
);

expectFailure(
  'additive target resource drift',
  fixture =>
    mutateText(fixture, 'packages/seis_platform_swift/Package.swift', text =>
      text.replace(
        '.copy("Resources/seis-demo-contract.json"),',
        '.copy("Resources/seis-demo-contract.json"),\n                .copy("Resources/unexpected.json"),',
      ),
    ),
  'exact target, dependency, and resource inventory',
);

expectFailure(
  'package product drift',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.package.products[0].name = 'RenamedKit';
    }),
  'products: must equal',
);

expectFailure(
  'iPadOS maturity overclaim',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.platform_roles.find(role => role.id === 'ipados').state = 'prototype';
    }),
  'platform roles and evidence boundaries: must equal',
);

expectFailure(
  'web boundary drift',
  fixture =>
    mutateText(fixture, 'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md', text =>
      text.replace('No-key public demo', 'Credential-backed live portal'),
    ),
  'missing required token "No-key public demo"',
);

expectFailure(
  'mixed library boundary hidden',
  fixture =>
    mutateText(fixture, 'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md', text =>
      text.replace('current mixed boundary', 'fully separated boundary'),
    ),
  'missing required token "current mixed boundary"',
);

expectFailure(
  'portable validation drift',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.validation.portable.shift();
    }),
  'portable validation: must equal',
);

expectFailure(
  'readiness semantics overclaim',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.readiness_semantics.state = 'verified';
    }),
  'complete readiness semantics: must equal',
);

expectFailure(
  'Foundation workflow drift',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace(
        'npm run test:seis-apple-platform-architecture --ignore-scripts',
        'npm run test:ecosystem-foundation',
      ),
    ),
  'missing exact executable line "npm run test:seis-apple-platform-architecture --ignore-scripts"',
);

expectFailure(
  'Apple executable CI drift',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace(
        'swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell',
        'swift build --package-path packages/seis_platform_swift --target SeisPlatformKit',
      ),
    ),
  'missing required token "swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell"',
);

expectFailure(
  'Goal maturity promotion without dependencies',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('status: proposed', 'status: in-progress'),
    ),
  'top-level status must remain proposed',
);

expectFailure(
  'Goal summary capability overclaim',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          '  Convert the existing Apple-platform direction and SwiftPM package surface',
          '  Deliver stable signed apps, live providers, CloudKit, and repository privacy certification',
        ),
    ),
  'semantic summary',
);

expectFailure(
  'descriptive inventory evidence promoted to native build proof',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          '    type: native-package-inventory\n    description: >-',
          '    type: native-build-and-test-proof\n    description: >-',
        ),
    ),
  'normalized semantic Goal drift',
);

expectFailure(
  'fabricated GitHub evidence metadata',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text
          .replace(
            'issue_url: https://github.com/emirhankudun-ux/SEIS/issues/181',
            'issue_url: https://github.com/emirhankudun-ux/SEIS/issues/1',
          )
          .replace('  commit_sha: null', '  commit_sha: deadbee')
          .replace(
            '  pull_request_url: null',
            '  pull_request_url: https://github.com/emirhankudun-ux/SEIS/pull/1',
          )
          .replace(
            '  release_note_url: null',
            '  release_note_url: https://github.com/emirhankudun-ux/SEIS/releases/tag/fake',
          ),
    ),
  'exact semantic GitHub evidence metadata',
);

expectFailure(
  'Goal dependency moved outside canonical list',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          '  - ECO-GOAL-0002\n  - ECO-GOAL-0003\n\nblocked_by:',
          '  - ECO-GOAL-0003\n\nblocked_by:',
        ),
    ),
  'exact dependencies: must equal',
);

expectFailure(
  'Goal validation command moved outside canonical list',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('    - npm run check:seis-apple-platform-architecture\n', ''),
    ),
  'exact validation commands: must equal',
);

expectFailure(
  'web-native fixture divergence',
  fixture =>
    mutateText(
      fixture,
      'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json',
      text => `${text.trimEnd()}\n `,
    ),
  'web-native demo contract copies must remain byte-identical',
);

expectFailure(
  'ADR acceptance without human review',
  fixture =>
    mutateText(fixture, 'docs/adr/0003-seis-apple-native-architecture-foundation.md', text =>
      text.replace('## Status\n\nProposed', '## Status\n\nAccepted'),
    ),
  'missing required token "## Status\\n\\nProposed"',
);

expectFailure(
  'validation snapshot build overclaim',
  fixture =>
    mutateText(fixture, 'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md', text =>
      text.replace('failed evidence, not a build pass', 'verified evidence and a build pass'),
    ),
  'missing required token "failed evidence, not a build pass"',
);

expectFailure(
  'Apple draft queue base drift',
  fixture =>
    mutateText(fixture, 'docs/roadmap/NEXT_PR_QUEUE.md', text =>
      text.replace('`security/ecosystem-local-secret-boundary`', '`main`'),
    ),
  '`security/ecosystem-local-secret-boundary`',
);

for (const [name, mutation] of [
  ['post-initialization platform mutation', 'package.platforms?.append(.tvOS(.v17))'],
  ['post-initialization product mutation', 'package.products.removeAll()'],
  ['post-initialization target mutation', 'package.targets.removeLast()'],
  ['post-initialization target dependency mutation', 'package.targets[1].dependencies.removeAll()'],
  ['post-initialization target resource mutation', 'package.targets[1].resources?.removeAll()'],
]) {
  expectFailure(
    name,
    fixture =>
      mutateText(
        fixture,
        'packages/seis_platform_swift/Package.swift',
        text => `${text.trimEnd()}\n\n${mutation}\n`,
      ),
    'exact declarative manifest body drift',
  );
}

for (const [relativePath, appendedText] of [
  ['docs/INDEX.md', 'Indirect semantic drift: native delivery milestone GA.'],
  [
    'docs/architecture/seis-command-center.md',
    'Indirect semantic drift: distribution milestone complete.',
  ],
]) {
  const fixture = makeFixture();
  try {
    mutateText(fixture, relativePath, text => `${text.trimEnd()}\n\n${appendedText}\n`);
    const errors = validateActiveGoalSharedDocuments(fixture);
    assert.ok(
      errors.some(error =>
        error.includes(`${relativePath}: active-Goal reviewed document SHA-256 drift`),
      ),
      `active Goal shared-document hash must reject arbitrary drift in ${relativePath}`,
    );
    driftClassCount += 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

expectFailure(
  'unterminated Swift manifest block comment',
  fixture =>
    mutateText(
      fixture,
      'packages/seis_platform_swift/Package.swift',
      text => `${text.trimEnd()}\n/*`,
    ),
  'unterminated Swift block comment',
);

expectFailure(
  'unterminated Swift manifest string literal',
  fixture =>
    mutateText(
      fixture,
      'packages/seis_platform_swift/Package.swift',
      text => `${text.trimEnd()}\n"`,
    ),
  'unterminated Swift string literal',
);

expectFailure(
  'duplicate top-level Goal dependencies override',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => `${text.trimEnd()}\n\ndependencies: []\n`,
    ),
  'duplicate top-level YAML key dependencies',
);

expectFailure(
  'duplicate top-level Goal validation override',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => `${text.trimEnd()}\n\nvalidation:\n  commands:\n    - echo bypass\n`,
    ),
  'duplicate top-level YAML key validation',
);

expectFailure(
  'duplicate nested Foundation workflow runs-on override',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace(
        '    runs-on: ubuntu-latest',
        '    runs-on: ubuntu-latest\n    runs-on: windows-latest',
      ),
    ),
  'duplicate YAML mapping key runs-on',
);

expectFailure(
  'duplicate nested Apple workflow step run override',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace(
        '        run: swift --version',
        '        run: swift --version\n        run: echo bypass',
      ),
    ),
  'duplicate YAML mapping key run',
);

expectFailure(
  'disabled Apple workflow job',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace('  swiftpm:\n', '  swiftpm:\n    if: false\n'),
    ),
  'conditional job or step execution is not permitted',
);

expectFailure(
  'echo-only Apple test command',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace(
        'run: swift test --package-path packages/seis_platform_swift',
        'run: echo swift test --package-path packages/seis_platform_swift',
      ),
    ),
  'echo-only command substitution is not permitted',
);

expectFailure(
  'signed application contract overclaim',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.platform_roles[0].current_evidence =
        'The signed and released macOS application is stable and production-ready.';
    }),
  'platform roles and evidence boundaries: must equal',
);

expectFailure(
  'live web control-plane contract overclaim',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.boundaries.web_demo = 'Web is the live credential-backed production control plane.';
    }),
  'product, web, architecture, and privacy boundaries: must equal',
);

expectFailure(
  'repository-wide privacy contract overclaim',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.boundaries.private_data = 'The entire repository is privacy-certified and secret-free.';
    }),
  'product, web, architecture, and privacy boundaries: must equal',
);

expectFailure(
  'non-claims inverted into capability claims',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.non_claims = [
        'The stable Apple application is signed and notarized.',
        'Dedicated iPadOS, iOS, and visionOS applications are released.',
        'Live providers, CloudKit, deployment, and background execution are verified.',
      ];
    }),
  'non-claims: must equal',
);

expectFailure(
  'readiness contradiction suffix',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.readiness_semantics.interpretation +=
        ' All runtime, CloudKit, provider, build, and release capabilities are verified.';
    }),
  'complete readiness semantics: must equal',
);

expectFailure(
  'readiness evidence path drift',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.readiness_semantics.current_evidence[0] = 'missing/readiness-proof.swift';
    }),
  'complete readiness semantics: must equal',
);

expectFailure(
  'web-native stable release field',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.web_native_contract.release_status = 'stable-live';
    }),
  'complete web-native contract: must equal',
);

expectFailure(
  'web-native ownership contradiction',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.web_native_contract.next_decision = 'Ownership is resolved for live production.';
    }),
  'complete web-native contract: must equal',
);

for (const [name, key, expectedError] of [
  [
    'quoted Goal dependencies override',
    '"dependencies": []',
    'quoted YAML mapping keys are not permitted',
  ],
  [
    'escaped quoted Goal dependencies override',
    '"\\x64ependencies": []',
    'quoted YAML mapping keys are not permitted',
  ],
  [
    'quoted Goal validation override',
    '"validation": {commands: [echo bypass]}',
    'quoted YAML mapping keys are not permitted',
  ],
  [
    'escaped quoted Goal validation override',
    '"\\x76alidation": {commands: [echo bypass]}',
    'quoted YAML mapping keys are not permitted',
  ],
]) {
  expectFailure(
    name,
    fixture =>
      mutateText(
        fixture,
        'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
        text => `${text.trimEnd()}\n\n${key}\n`,
      ),
    expectedError,
  );
}

expectFailure(
  'quoted disabled Apple workflow job',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace('  swiftpm:\n', '  swiftpm:\n    "if": false\n'),
    ),
  'conditional job or step execution is not permitted',
);

expectFailure(
  'escaped quoted disabled Apple workflow job',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace('  swiftpm:\n', '  swiftpm:\n    "\\x69f": false\n'),
    ),
  'quoted YAML mapping key is not permitted',
);

expectFailure(
  'Apple step custom shell bypass',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace(
        'run: swift --version',
        'run: swift --version\n        shell: /usr/bin/true {0}',
      ),
    ),
  'custom shell execution is not permitted',
);

expectFailure(
  'escaped quoted Apple step shell bypass',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace(
        'run: swift --version',
        'run: swift --version\n        "\\x73hell": /usr/bin/true {0}',
      ),
    ),
  'quoted YAML mapping key is not permitted',
);

expectFailure(
  'commented Foundation Apple checks',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text
        .replace(
          '          npm run check:seis-apple-platform-architecture --ignore-scripts',
          '          # npm run check:seis-apple-platform-architecture --ignore-scripts',
        )
        .replace(
          '          npm run test:seis-apple-platform-architecture --ignore-scripts',
          '          # npm run test:seis-apple-platform-architecture --ignore-scripts',
        ),
    ),
  'missing exact executable line "npm run check:seis-apple-platform-architecture --ignore-scripts"',
);

expectFailure(
  'disabled Foundation workflow job',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace('  check:\n', '  check:\n    if: false\n'),
    ),
  'conditional job or step execution is not permitted',
);

expectFailure(
  'Foundation workflow true-shell defaults',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace('jobs:\n', 'defaults:\n  run:\n    shell: /usr/bin/true {0}\n\njobs:\n'),
    ),
  'custom shell execution is not permitted',
);

expectFailure(
  'missing Foundation platform-kernel execution',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace(
        '          npm run check:seis-platform-kernel --ignore-scripts',
        '          # npm run check:seis-platform-kernel --ignore-scripts',
      ),
    ),
  'missing exact executable line "npm run check:seis-platform-kernel --ignore-scripts"',
);

expectFailure(
  'Foundation early successful exit',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace(
        '        run: |\n          npm run check:seis-apple-platform-architecture --ignore-scripts',
        '        run: |\n          exit 0\n          npm run check:seis-apple-platform-architecture --ignore-scripts',
      ),
    ),
  'semantic lightweight-check line is not an npm script "exit 0"',
);

expectFailure(
  'Foundation preparatory npm command injection',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace('        run: |\n', '        run: |\n          npm run disable-apple-gates\n'),
    ),
  'exact semantic lightweight-check commands',
);

for (const [name, relativePath] of [
  ['Apple manual-only trigger replacement', '.github/workflows/apple-platform-foundation.yml'],
  ['Foundation manual-only trigger replacement', '.github/workflows/foundation-check.yml'],
]) {
  expectFailure(
    name,
    fixture =>
      mutateText(fixture, relativePath, text =>
        text.replace(/on:\n[\s\S]*?\npermissions:/, 'on:\n  workflow_dispatch:\n\npermissions:'),
      ),
    'semantic pull-request and main-push triggers',
  );
}

for (const [name, relativePath] of [
  ['Apple YAML-tag trigger collision', '.github/workflows/apple-platform-foundation.yml'],
  ['Foundation YAML-tag trigger collision', '.github/workflows/foundation-check.yml'],
]) {
  expectFailure(
    name,
    fixture =>
      mutateText(fixture, relativePath, text =>
        text.replace('on:\n', 'on: workflow_dispatch\n!!str true:\n'),
      ),
    'explicit YAML tags are not permitted',
  );
}

expectFailure(
  'Apple top-level executable PATH override',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace('permissions:\n', 'env:\n  PATH: ./fake-bin:/usr/bin\n\npermissions:\n'),
    ),
  'exact semantic top-level keys',
);

expectFailure(
  'npm focused-check lifecycle bypass',
  fixture =>
    mutateJson(fixture, 'package.json', value => {
      value.scripts['precheck:seis-apple-platform-architecture'] = 'node -e "process.exit(0)"';
    }),
  'lifecycle script precheck:seis-apple-platform-architecture is not permitted',
);

expectFailure(
  'platform-kernel package script substitution',
  fixture =>
    mutateJson(fixture, 'package.json', value => {
      value.scripts['check:seis-platform-kernel'] = 'node -e "process.exit(0)"';
    }),
  'missing exact platform-kernel check script',
);

expectFailure(
  'Foundation security-gate package script substitution',
  fixture =>
    mutateJson(fixture, 'package.json', value => {
      value.scripts['check:security-boundary'] = 'true';
    }),
  'Foundation script check:security-boundary must remain',
);

expectFailure(
  'npm platform-kernel lifecycle bypass',
  fixture =>
    mutateJson(fixture, 'package.json', value => {
      value.scripts['precheck:seis-platform-kernel'] = 'node -e "process.exit(0)"';
    }),
  'lifecycle script precheck:seis-platform-kernel is not permitted',
);

expectFailure(
  'equal credentialed live demo-contract copies',
  fixture => {
    for (const relativePath of [
      'apps/seis-demo-web/contracts/seis-demo-contract.json',
      'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json',
    ]) {
      mutateJson(fixture, relativePath, value => {
        value.mode = 'credentialed-live-production';
        value.platform_targets.push('visionOS');
        value.routes.push({
          path: '/admin',
          view: 'live-provider',
          title: 'Admin',
          description: 'Stores browser credentials.',
        });
      });
    }
  },
  'content SHA-256 must match the reviewed no-key fixture',
);

expectFailure(
  'platform-map appended capability claims',
  fixture =>
    mutateText(
      fixture,
      'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md',
      text =>
        `${text.trimEnd()}\n\nThe signed stable app, live providers, and repository privacy certification are verified.\n`,
    ),
  'reviewed document SHA-256 drift',
);

expectFailure(
  'second accepted ADR status',
  fixture =>
    mutateText(
      fixture,
      'docs/adr/0003-seis-apple-native-architecture-foundation.md',
      text => `${text.trimEnd()}\n\n## Status\n\nAccepted\n`,
    ),
  'reviewed document SHA-256 drift',
);

expectFailure(
  'Goal privacy impact promotion',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('privacy_impact: none', 'privacy_impact: high'),
    ),
  'privacy_impact must remain none',
);

expectFailure(
  'Goal privacy gate promotion',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => text.replace('  privacy: required', '  privacy: passed'),
    ),
  'exact quality gates: must equal',
);

expectFailure(
  'machine-contract package release overclaim fields',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.package.release_status = 'stable-production';
      value.package.signed = true;
    }),
  'exact package fields: must equal',
);

expectFailure(
  'machine-contract validation overclaim fields',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.validation.status = 'passed';
      value.validation.privacy_certified = true;
    }),
  'exact validation fields: must equal',
);

for (const [id, originalStatus, originalExit, expectedError] of [
  ['SEIS1-EVIDENCE-004', 'pending', 'null', 'status must remain pending'],
  ['SEIS1-EVIDENCE-005', 'pending', 'null', 'status must remain pending'],
  ['SEIS1-EVIDENCE-006', 'failed', '130', 'status must remain failed'],
  ['SEIS1-EVIDENCE-010', 'failed', '1', 'status must remain failed'],
  ['SEIS1-EVIDENCE-011', 'failed', '1', 'status must remain failed'],
]) {
  expectFailure(
    `${id} unsupported evidence promotion`,
    fixture =>
      mutateText(
        fixture,
        'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
        text => {
          const marker = `  - id: ${id}`;
          const start = text.indexOf(marker);
          assert.ok(start >= 0, `${id} fixture record must exist`);
          const next = text.indexOf('\n  - id: ', start + marker.length);
          const end = next >= 0 ? next : text.indexOf('\nquality_gates:', start);
          const block = text
            .slice(start, end)
            .replace(`    status: ${originalStatus}`, '    status: passed')
            .replace(`    exit_code: ${originalExit}`, '    exit_code: 0');
          return `${text.slice(0, start)}${block}${text.slice(end)}`;
        },
      ),
    expectedError,
  );
}

expectFailure(
  'executable target layer underclaim',
  fixture =>
    mutateJson(fixture, 'data/seis-apple-platform-architecture.json', value => {
      value.package.targets.find(target => target.name === 'SeisAppleNativeShell').current_layers =
        ['presentation'];
    }),
  'targets: must equal',
);

for (const [name, relativePath, contradiction, endMarker] of [
  [
    'web README capability contradiction',
    'apps/seis-demo-web/README.md',
    'The live WebView stores browser provider credentials.',
    null,
  ],
  [
    'Command Center release contradiction',
    'docs/architecture/seis-command-center.md',
    'The native shell is a stable released application.',
    '## Deployment Strategy',
  ],
  [
    'web-mobile native-center contradiction',
    'docs/architecture/web-mobile-foundation.md',
    'Web is the canonical native product center.',
    '## Recommended Stack',
  ],
  [
    'deployment release contradiction',
    'docs/deployment/seis-demo-native-web-deploy-plan.md',
    'The signed and notarized application is distributed.',
    null,
  ],
  [
    'PR queue approval contradiction',
    'docs/roadmap/NEXT_PR_QUEUE.md',
    'All approvals are complete and the Apple pull request is merge-ready.',
    '## Current Recommended Product Demo Stack',
  ],
]) {
  expectFailure(
    name,
    fixture =>
      mutateText(fixture, relativePath, text =>
        endMarker
          ? text.replace(endMarker, `${contradiction}\n\n${endMarker}`)
          : `${text.trimEnd()}\n\n${contradiction}\n`,
      ),
    'section SHA-256 drift',
  );
}

for (const [name, relativePath, contradiction] of [
  [
    'Command Center contradiction outside reviewed section',
    'docs/architecture/seis-command-center.md',
    'The native shell is a stable released application.',
  ],
  [
    'web-mobile contradiction outside reviewed section',
    'docs/architecture/web-mobile-foundation.md',
    'Web is the canonical native product center.',
  ],
  [
    'PR queue contradiction outside reviewed sections',
    'docs/roadmap/NEXT_PR_QUEUE.md',
    'All approvals are complete and the Apple pull request is merge-ready.',
  ],
  [
    'notarized native-shell shipping claim',
    'docs/architecture/seis-command-center.md',
    'SEIS now ships a notarized native shell to production users.',
  ],
  [
    'unrelated negation before signed release claim',
    'docs/architecture/web-mobile-foundation.md',
    'This is not a prototype because the native application is signed and released.',
  ],
  [
    'documentation index stable live claim',
    'docs/INDEX.md',
    'SEIS now ships a notarized native shell to production users.',
  ],
  [
    'documentation index general-availability claim',
    'docs/INDEX.md',
    'The native shell reached general availability after code signing and notarization.',
  ],
  [
    'documentation index CloudKit claim',
    'docs/INDEX.md',
    'CloudKit synchronization is live and connected.',
  ],
  [
    'documentation index browser-key claim',
    'docs/INDEX.md',
    'The browser persists provider API keys locally.',
  ],
  [
    'documentation index human-review claim',
    'docs/INDEX.md',
    'All required human reviews have passed.',
  ],
  [
    'documentation index merge-authority claim',
    'docs/INDEX.md',
    'This PR has every approval and can merge.',
  ],
  [
    'documentation index repository-secret certification claim',
    'docs/INDEX.md',
    'The repository was audited and contains no secrets.',
  ],
  [
    'documentation index production-download claim',
    'docs/INDEX.md',
    'Production users can download the notarized macOS build today.',
  ],
  [
    'documentation index not-only signed-release claim',
    'docs/INDEX.md',
    'The native application is not only signed but also notarized and released.',
  ],
]) {
  expectFailure(
    name,
    fixture => mutateText(fixture, relativePath, text => `${text.trimEnd()}\n\n${contradiction}\n`),
    'unsupported positive capability claim',
  );
}

expectFailure(
  'Goal Definition of Ready contradiction',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          '  - ECO-GOAL-0001, ECO-GOAL-0002, and ECO-GOAL-0003 are completed or archived with canonical evidence.',
          '  - No ecosystem dependency needs completion or canonical evidence.',
        ),
    ),
  'reviewed definition_of_ready section SHA-256 drift',
);

expectFailure(
  'Goal final-note merge-readiness contradiction',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          '  - Proposed ADR and Goal status are intentionally enforced only for this draft specification; it is not merge-ready while its Definition of Ready dependencies remain open.',
          '  - Stable and merge-ready; all approvals and dependencies are complete.',
        ),
    ),
  'reviewed notes section SHA-256 drift',
);

expectFailure(
  'explicit-key Goal dependencies override',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => `${text.trimEnd()}\n\n? dependencies\n: []\n`,
    ),
  'explicit YAML mapping keys are not permitted',
);

expectFailure(
  'explicit-key Goal validation override',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        `${text.trimEnd()}\n\n? validation\n: {commands: [echo bypass], manual: [], evidence: []}\n`,
    ),
  'explicit YAML mapping keys are not permitted',
);

expectFailure(
  'explicit-key failed evidence promotion',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          '    status: failed\n    command: >-\n      swift build --disable-sandbox',
          '    status: failed\n    ? status\n    : passed\n    ? exit_code\n    : 0\n    command: >-\n      swift build --disable-sandbox',
        ),
    ),
  'explicit YAML mapping keys are not permitted',
);

expectFailure(
  'explicit-key disabled Apple workflow job',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace('  swiftpm:\n', '  swiftpm:\n    ? if\n    : false\n'),
    ),
  'explicit YAML mapping key is not permitted',
);

expectFailure(
  'explicit-key Apple step shell bypass',
  fixture =>
    mutateText(fixture, '.github/workflows/apple-platform-foundation.yml', text =>
      text.replace(
        'run: swift --version',
        'run: swift --version\n        ? shell\n        : /usr/bin/true {0}',
      ),
    ),
  'explicit YAML mapping key is not permitted',
);

expectFailure(
  'explicit-key disabled Foundation workflow job',
  fixture =>
    mutateText(fixture, '.github/workflows/foundation-check.yml', text =>
      text.replace('  check:\n', '  check:\n    ? if\n    : false\n'),
    ),
  'explicit YAML mapping key is not permitted',
);

expectFailure(
  'multi-document Goal first-document smuggling',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text => {
        const firstDocument = JSON.stringify({
          schema_version: 2,
          id: 'SEIS-GOAL-0001',
          status: 'proposed',
          dependencies: [],
          validation: { commands: ['echo bypass'] },
          evidence_records: [
            {
              id: 'SEIS1-EVIDENCE-006',
              type: 'native-library-build-attempt',
              status: 'passed',
              exit_code: 0,
            },
          ],
        });
        return `${firstDocument}\n---\n${text}`;
      },
    ),
  'YAML document markers are not permitted',
);

expectFailure(
  'single-document Goal merge-key smuggling',
  fixture =>
    mutateText(
      fixture,
      'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml',
      text =>
        text.replace(
          'schema_version: 2\n',
          'schema_version: 2\n<<: {dependencies: [], validation: {commands: [echo bypass]}}\n',
        ),
    ),
  'YAML merge keys are not permitted',
);

assert.deepEqual(
  validateChangedPaths(
    ['docs/architecture/SEIS_APPLE_PLATFORM_MAP.md'],
    ['docs/architecture/SEIS_APPLE_PLATFORM_MAP.md'],
  ),
  [],
  'an explicitly scoped architecture artifact must be accepted',
);

assert.equal(
  shouldEnforceGoalDiffScope(
    [
      'scripts/check-seis-apple-platform-architecture.mjs',
      'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift',
    ],
    {
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_HEAD_REF: 'alternate-apple-branch',
      GITHUB_BASE_REF: 'security/ecosystem-local-secret-boundary',
    },
  ),
  true,
  'an alternate PR branch that changes an Apple Goal artifact must enforce diff scope',
);
driftClassCount += 1;

for (const [name, changedPath, expectedError] of [
  [
    'web runtime diff scope escape',
    'apps/seis-demo-web/index.html',
    'out-of-scope path changed apps/seis-demo-web/index.html',
  ],
  [
    'production Swift diff scope escape',
    'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift',
    'out-of-scope path changed packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift',
  ],
  [
    'read-only Package.swift diff scope escape',
    'packages/seis_platform_swift/Package.swift',
    'read-only validation input changed packages/seis_platform_swift/Package.swift',
  ],
]) {
  const allowedPaths = expectedError.startsWith('out-of-scope') ? [] : [changedPath];
  const errors = validateChangedPaths([changedPath], allowedPaths);
  assert.ok(
    errors.some(error => error.includes(expectedError)),
    `${name} must fail with ${JSON.stringify(expectedError)}; received ${JSON.stringify(errors)}`,
  );
  driftClassCount += 1;
}

const gitFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'seis-apple-diff-scope-'));
try {
  runGit(gitFixture, ['init', '--quiet']);
  runGit(gitFixture, ['config', 'user.name', 'SEIS Fixture']);
  runGit(gitFixture, ['config', 'user.email', 'seis-fixture@example.invalid']);
  fs.writeFileSync(path.join(gitFixture, 'outside-source.swift'), 'read-only source\n');
  runGit(gitFixture, ['add', '--all']);
  runGit(gitFixture, ['commit', '--quiet', '-m', 'fixture baseline']);

  fs.renameSync(
    path.join(gitFixture, 'outside-source.swift'),
    path.join(gitFixture, 'allowed-destination.md'),
  );
  const unusualPath = ' leading-and-trailing \nname ';
  fs.writeFileSync(path.join(gitFixture, unusualPath), 'untracked\n');

  const collectionErrors = [];
  const collectedPaths = collectChangedPaths(gitFixture, 'HEAD', collectionErrors);
  assert.deepEqual(collectionErrors, [], 'NUL-delimited changed-path collection must pass');
  for (const expectedPath of ['outside-source.swift', 'allowed-destination.md', unusualPath]) {
    assert.ok(
      collectedPaths.includes(expectedPath),
      `changed-path collector must preserve ${JSON.stringify(expectedPath)} exactly`,
    );
  }

  const collectedScopeErrors = validateChangedPaths(collectedPaths, ['allowed-destination.md']);
  assert.ok(
    collectedScopeErrors.some(error => error.includes('outside-source.swift')),
    'rename source outside the Goal scope must be rejected',
  );
  assert.ok(
    collectedScopeErrors.some(error => error.includes(unusualPath)),
    'leading, trailing, and newline filename bytes must not alias an allowed path',
  );
  driftClassCount += 2;
} finally {
  fs.rmSync(gitFixture, { recursive: true, force: true });
}

console.log(
  `SEIS Apple platform architecture negative fixtures passed: ${driftClassCount} drift classes rejected.`,
);
