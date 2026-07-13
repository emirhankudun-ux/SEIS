import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT_PATH = 'data/seis-apple-platform-architecture.json';
const MANIFEST_PATH = 'packages/seis_platform_swift/Package.swift';
const MAP_PATH = 'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md';
const ADR_PATH = 'docs/adr/0003-seis-apple-native-architecture-foundation.md';
const STRATEGY_PATH = 'docs/APPLE_PLATFORM_STRATEGY.md';
const DOC_INDEX_PATH = 'docs/INDEX.md';
const COMMAND_CENTER_PATH = 'docs/architecture/seis-command-center.md';
const WEB_MOBILE_PATH = 'docs/architecture/web-mobile-foundation.md';
const WEB_README_PATH = 'apps/seis-demo-web/README.md';
const DEPLOYMENT_PATH = 'docs/deployment/seis-demo-native-web-deploy-plan.md';
const NEXT_PR_QUEUE_PATH = 'docs/roadmap/NEXT_PR_QUEUE.md';
const GOAL_PATH = 'goals/backlog/SEIS-GOAL-0001--apple-native-architecture-foundation.yaml';
const WORKFLOW_PATH = '.github/workflows/foundation-check.yml';
const APPLE_WORKFLOW_PATH = '.github/workflows/apple-platform-foundation.yml';
const PACKAGE_JSON_PATH = 'package.json';
const YAML_BOOLEAN_TRUE_KEY = '__yaml_boolean_true_key__';
const APPLE_GOAL_BRANCH = 'apple/seis-native-architecture-foundation';
const loadedYamlSemantics = new WeakSet();

const READ_ONLY_INPUT_PATHS = new Set([
  MANIFEST_PATH,
  'apps/seis-demo-web/contracts/seis-demo-contract.json',
  'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json',
]);

const APPLE_SCOPE_ACTIVATION_PATHS = new Set([
  APPLE_WORKFLOW_PATH,
  CONTRACT_PATH,
  MAP_PATH,
  ADR_PATH,
  STRATEGY_PATH,
  GOAL_PATH,
  'scripts/check-seis-apple-platform-architecture.mjs',
  'scripts/test-seis-apple-platform-architecture.mjs',
]);

const YAML_PATHS = [GOAL_PATH, WORKFLOW_PATH, APPLE_WORKFLOW_PATH];

const RUBY_YAML_TO_JSON = String.raw`
require "json"
require "yaml"

def validate_ast!(node, relative_path)
  if node.respond_to?(:tag) && node.tag
    raise "#{relative_path}: explicit YAML tags are not permitted"
  end
  if node.respond_to?(:anchor) && node.anchor
    raise "#{relative_path}: YAML anchors are not permitted"
  end
  if node.is_a?(Psych::Nodes::Mapping)
    raw_keys = {}
    node.children.each_slice(2) do |key_node, _value_node|
      if key_node.respond_to?(:tag) && key_node.tag
        raise "#{relative_path}: explicit YAML tags are not permitted"
      end
      if key_node.respond_to?(:anchor) && key_node.anchor
        raise "#{relative_path}: YAML anchors are not permitted"
      end
      unless key_node.is_a?(Psych::Nodes::Scalar) && key_node.plain
        raise "#{relative_path}: YAML mapping keys must be plain scalars"
      end
      if key_node.value == "<<"
        raise "#{relative_path}: YAML merge keys are not permitted"
      end
      if raw_keys.key?(key_node.value)
        raise "#{relative_path}: duplicate YAML mapping key #{key_node.value}"
      end
      raw_keys[key_node.value] = true
    end
  end
  children = node.respond_to?(:children) ? node.children : nil
  children&.each { |child| validate_ast!(child, relative_path) }
end

def normalize_yaml(value, relative_path, path = [])
  case value
  when Hash
    result = {}
    value.each do |key, child|
      normalized_key =
        case key
        when String
          key
        when TrueClass
          "__yaml_boolean_true_key__"
        else
          raise "#{relative_path}: non-string YAML mapping key at #{path.join('.')}"
        end
      raise "#{relative_path}: colliding YAML mapping key #{normalized_key}" if result.key?(normalized_key)
      result[normalized_key] = normalize_yaml(child, relative_path, path + [normalized_key])
    end
    result
  when Array
    value.each_with_index.map { |child, index| normalize_yaml(child, relative_path, path + [index]) }
  else
    value
  end
end

root = ARGV.shift
result = {}
ARGV.each do |relative_path|
  absolute_path = File.join(root, relative_path)
  text = File.read(absolute_path)
  stream = Psych.parse_stream(text)
  raise "#{relative_path}: expected exactly one YAML document" unless stream.children.length == 1
  document = stream.children.first
  validate_ast!(document, relative_path)
  root_node = document.root
  raise "#{relative_path}: expected a YAML mapping root" unless root_node.is_a?(Psych::Nodes::Mapping)
  root_keys = root_node.children.each_slice(2).map do |key_node, _value_node|
    raise "#{relative_path}: top-level YAML keys must be plain scalars" unless key_node.is_a?(Psych::Nodes::Scalar) && key_node.plain
    key_node.value
  end
  raise "#{relative_path}: duplicate top-level YAML key" unless root_keys.uniq.length == root_keys.length
  value = YAML.safe_load(
    text,
    permitted_classes: [],
    permitted_symbols: [],
    aliases: false
  )
  raise "#{relative_path}: expected a YAML mapping root" unless value.is_a?(Hash)
  result[relative_path] = {
    "value" => normalize_yaml(value, relative_path),
    "root_keys" => root_keys,
  }
end
STDOUT.write(JSON.generate(result))
`;

const exactTopLevelKeys = [
  'boundaries',
  'canonical_owner_repo',
  'goal_id',
  'maturity',
  'non_claims',
  'package',
  'platform_roles',
  'readiness_semantics',
  'schema_version',
  'status',
  'validation',
  'web_native_contract',
];

const expectedPlatformRoles = [
  {
    id: 'macos',
    display_name: 'macOS',
    state: 'prototype',
    role: 'Primary native Command Center and deep production-workflow surface.',
    current_evidence:
      'SwiftPM exposes the SeisAppleNativeShell executable; this is package-level prototype evidence, not a signed or released app.',
  },
  {
    id: 'ipados',
    display_name: 'iPadOS',
    state: 'planned',
    role: 'SEIS Brain, knowledge review, design review, and creative-planning surface.',
    current_evidence:
      'SwiftPM represents compatibility through the iOS 16 declaration; there is no dedicated iPadOS target or application evidence.',
  },
  {
    id: 'ios',
    display_name: 'iOS',
    state: 'planned',
    role: 'Companion for status, alerts, search, capture, and quick notes.',
    current_evidence:
      'The package declares iOS 16, but no standalone iOS application target is present.',
  },
  {
    id: 'visionos',
    display_name: 'visionOS',
    state: 'research',
    role: 'Research-only spatial surface after shared Apple foundations are healthy.',
    current_evidence:
      'No visionOS platform declaration, target, application, build, or release evidence is present.',
  },
  {
    id: 'web',
    display_name: 'Web',
    state: 'active-demo',
    role: 'No-key public demo, onboarding, documentation, and GitHub showcase.',
    current_evidence:
      'Tracked static web surfaces provide public demonstration; web is not the long-term native architectural center.',
  },
];

const expectedBoundaries = {
  native_center:
    'macOS remains the primary native product center. SeisPlatformKit currently mixes shared contracts with a conditional SwiftUI/AppKit/UIKit continuation surface; separating presentation from shared domain contracts is a required child Goal before stable maturity.',
  web_demo:
    'Web remains a no-key public demo and onboarding surface and must not claim native, provider, credential, signing, or deployment readiness.',
  shared_contracts:
    'Target direction: platform consumers depend on explicit public-safe contracts and platform-specific presentation does not become a dependency of shared domain models. The current mixed library target is recorded technical debt, not proof that the target boundary is already achieved.',
  private_data:
    'The public-safe artifacts introduced by SEIS-GOAL-0001 contain no secret values, private memory, provider credentials, SSH material, or personal data; this is not a repository-wide privacy certification.',
};

const expectedWebNativeContract = {
  state: 'duplicated-fixture',
  ownership: 'unresolved',
  sync_direction: 'unresolved',
  required_compatibility: 'byte-identical',
  content_sha256: '49474eda1de0808c200b5ae99b58a028a1727ec2fa6c6124e58c976b0add5da0',
  paths: [
    'apps/seis-demo-web/contracts/seis-demo-contract.json',
    'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json',
  ],
  next_decision:
    'Select one shared canonical contract owner or a generated one-way distribution path in a child Goal.',
};

const expectedReadinessSemantics = {
  state: 'declarative-prototype',
  current_evidence: [
    'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisApplePersistenceReadinessContract.swift',
    'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift',
  ],
  interpretation:
    'Current ready labels and aggregate booleans describe declared checklist coverage and configured policy strings; they do not prove runtime CloudKit, persistence, provider, platform, build, or release readiness.',
  required_action:
    'A child Goal must replace overloaded ready labels with planned, configured, verified, unavailable, and failed states backed by runtime or test evidence before product maturity advances.',
};

const expectedQualityGates = {
  architecture: 'required',
  product: 'required',
  brand_creative_direction: 'not-applicable',
  design_system: 'not-applicable',
  ui_ux: 'not-applicable',
  engineering: 'required',
  ai_integrity: 'required',
  model_provider_routing: 'not-applicable',
  agent_permission: 'not-applicable',
  mcp_plugin_tool: 'not-applicable',
  security: 'required',
  privacy: 'required',
  accessibility: 'required',
  performance: 'required',
  data: 'not-applicable',
  documentation: 'required',
  devops: 'required',
  testing: 'required',
  release: 'not-applicable',
  public_readiness: 'required',
};

const expectedEvidenceStates = {
  'SEIS1-EVIDENCE-002': { type: 'architecture-review', status: 'pending', exit_code: 'null' },
  'SEIS1-EVIDENCE-004': {
    type: 'native-package-validation',
    status: 'pending',
    exit_code: 'null',
  },
  'SEIS1-EVIDENCE-005': { type: 'remote-ci', status: 'pending', exit_code: 'null' },
  'SEIS1-EVIDENCE-006': {
    type: 'native-library-build-attempt',
    status: 'failed',
    exit_code: '130',
  },
  'SEIS1-EVIDENCE-010': {
    type: 'native-toolchain-preflight',
    status: 'failed',
    exit_code: '1',
  },
  'SEIS1-EVIDENCE-011': {
    type: 'platform-kernel-validation-attempt',
    status: 'failed',
    exit_code: '1',
  },
};

const expectedFuturePlatformEvidence = [
  'Dedicated macOS application accessibility and reduced-motion review before stable maturity.',
  'Dedicated iPadOS and iOS targets plus simulator or device tests before implementation claims.',
  'Measured launch, memory, energy, and interaction budgets before release-candidate maturity.',
  'Signing, entitlements, sandbox, notarization, privacy, and rollback review before distribution.',
];

const expectedNonClaims = [
  'No signed, notarized, distributed, or stable Apple application is claimed.',
  'No dedicated iPadOS, iOS, or visionOS application target is claimed.',
  'No live provider, CloudKit synchronization, credential, deployment, or background execution is claimed.',
];

const expectedDocumentHashes = {
  [MAP_PATH]: '9acd6570f7f46e7a6d9c73fbea14f28363f3770d5b910d767588ce36f99f0fd8',
  [ADR_PATH]: '75699ccc7f04719b9afc4123c6364655aea4525c822de43e22771727cc816e44',
  [STRATEGY_PATH]: '295f3d932af6993e53fd83dcce0d08d0c46c842f5604a6fd7dddf69c0d4c78cc',
};

const expectedDocumentSectionHashes = [
  {
    path: WEB_README_PATH,
    start: 'Shared contract notes:',
    end: null,
    sha256: '17ec913f86d3f4a52251a68196e861f8345d83365722b6fa49ffde28081234c7',
  },
  {
    path: COMMAND_CENTER_PATH,
    start: '## Platform Phases',
    end: '## Deployment Strategy',
    sha256: 'e3003d4236c96c3aad75dd57216774f84304d949e3a58b40a86c041d1c2cf1ce',
  },
  {
    path: WEB_MOBILE_PATH,
    start: '## Scope Note',
    end: '## Recommended Stack',
    sha256: '1b8ac6d18f6ba196c885e73f265e396db0e9e3c5b6a39d281c3beda0990bca6e',
  },
  {
    path: DEPLOYMENT_PATH,
    start: '## 2) Native demo shell deployment/tests (seis-demo-native)',
    end: null,
    sha256: 'b4b40e1fcb85bbc0036f296f694e402315ea17007cc6a4c2cbe6410d0a89ab01',
  },
  {
    path: NEXT_PR_QUEUE_PATH,
    start: '## Proposed Apple-Native Architecture Stack - 2026-07-13',
    end: '## Current Recommended Product Demo Stack',
    sha256: '267d7742e0cad9b133de3be711bc5776148a8bcdd4029db1c11d9971cde372c0',
  },
  {
    path: NEXT_PR_QUEUE_PATH,
    start: '## Human Approval Needed',
    end: '- Push to `main`',
    sha256: 'bb04c0d8f3e3c413556beb7c5b862f2fa7b20ffc07a72a92d9353bd548afdefc',
  },
];

const expectedActiveGoalSharedDocumentHashes = {
  [WEB_README_PATH]: 'ba70ae9aa620b57ee31e7de17dfcbb2500d4a9a56d31918dc24e0b4dec7345df',
  [COMMAND_CENTER_PATH]: 'eb94a1e1e763eb4d45fe73e2bce5d4ff25f2cfc00e7397323a495f5e2b29baec',
  [WEB_MOBILE_PATH]: 'd8fef6d47966a556ed2e876973c0032be23eced545d89a30eb04d5493f0391c2',
  [DEPLOYMENT_PATH]: '9cc478bf61d7bcfef2e12e8f5d1f23a22966689d1dcb01302dfad7b2bb3fddcb',
  [NEXT_PR_QUEUE_PATH]: '8abcbb94b111bdd42d388ad7f7d94b633417ea14a1147aaccfec5d35a1ece154',
  [DOC_INDEX_PATH]: '9c779652e9b9656ad0441925637238068844fd6ac7305fe586cf1aa67f7bebb4',
};

const expectedGoalSectionHashes = {
  requirements: '9723e95e0d11a493981ce17ba4039884bae5e3491be654712b61f8366cde43ee',
  non_goals: '5ae0dd9f6133cf3d793829b6b8b88b2f6f8ad9be1e4886bac93236eef51e1fc0',
  acceptance_criteria: '88cbb2d25e4a7b0200bff31dc6b79acc513383324714ace1fa29894d77cd25e3',
  definition_of_ready: '9ee24963ab73661fee657cbffd1ede025cbf598867772cf2f7a99f5e0b635743',
  definition_of_done: 'bf7d8703eef698ce3a1c43683179d3d832aa6fc6e1143cd8a62259973ce0cca8',
  notes: '9f8acb71e1aa282f634b9f23b9a2df51a7c2cb2eedb210f270bde35b3a77ea15',
};

const expectedGoalSemanticHashes = {
  scope: '2d666c9f3998fbf26dd6dec4193cd904f9c91d3c1adcb45c019348fb7d617a5a',
  architecture_layers: '49ac83770ac80da743bf487577c3dc99e65e15db8f440ee24773e39e47bb0810',
  requirements: 'b99b5b4a65d1b687b768d01cac8ae87cbaec46ede8bf9b39dbe854027ae814e6',
  non_goals: '0b6e30022ca6c6921c9b8c0d5e688d9b29c85e673f4a955917722e570d513ce1',
  acceptance_criteria: '58a7c71bece9d8ba4c641d3426e89fe0aa1cd4bff3f9280c8c0ff00d475fcdd5',
  definition_of_ready: '9bb3e62244b8c25519d7489b130d6d0190611a06b72c27f870fda62a64349f22',
  definition_of_done: '407c64e03222de36e3e63797c6e448703beaf1ac142333fff99e5323a282fb9f',
  notes: 'c4f6b4f57a609b5a766434ff073fcf54fb6e4b62f2b049d3e2a1d2ef202f0707',
};

const expectedNormalizedGoalSemanticHash =
  '17b035cddf4ea0f734f8abaedf71a5e3ea17e805e42a8e1b9e0d7103dd2626d3';

const expectedGoalGithubEvidence = {
  issue_url: 'https://github.com/emirhankudun-ux/SEIS/issues/181',
  commit_sha: 'c756ce43477e1e7b53fc1eb48d96d0336ee17804',
  pull_request_url: 'https://github.com/emirhankudun-ux/SEIS/pull/182',
  release_note_url: null,
};

const goalSectionBoundaries = [
  ['requirements', 'non_goals'],
  ['non_goals', 'acceptance_criteria'],
  ['acceptance_criteria', 'definition_of_ready'],
  ['definition_of_ready', 'definition_of_done'],
  ['definition_of_done', 'dependencies'],
  ['notes', null],
];

const expectedCompactManifest =
  'importPackageDescription' +
  'letpackage=Package(' +
  'name:"SeisPlatformKit",' +
  'platforms:[.macOS(.v13),.iOS(.v16)],' +
  'products:[.library(name:"SeisPlatformKit",targets:["SeisPlatformKit"]),.executable(name:"SeisAppleNativeShell",targets:["SeisAppleNativeShell"])],' +
  'targets:[.target(name:"SeisPlatformKit"),.executableTarget(name:"SeisAppleNativeShell",dependencies:["SeisPlatformKit"],resources:[.copy("Resources/seisdemo-urlscheme-template.plist"),.copy("Resources/seis-demo-contract.json")]),.testTarget(name:"SeisPlatformKitTests",dependencies:["SeisPlatformKit"])])';

const expectedPortableCommands = [
  'npm run check:seis-apple-platform-architecture',
  'npm run test:seis-apple-platform-architecture',
  'npm run check:ecosystem-foundation',
  'npm run test:ecosystem-foundation',
  'npm run check:foundation',
  'npm run check:seis-platform-kernel',
  'git diff --check',
];

const expectedDarwinCommands = [
  'swift package --package-path packages/seis_platform_swift describe',
  'swift build --package-path packages/seis_platform_swift --target SeisPlatformKit',
  'swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell',
  'swift test --package-path packages/seis_platform_swift',
];

const expectedAppleWorkflowPaths = [
  '.github/workflows/apple-platform-foundation.yml',
  'data/seis-apple-platform-architecture.json',
  'docs/APPLE_PLATFORM_STRATEGY.md',
  'docs/architecture/**',
  'docs/adr/0003-seis-apple-native-architecture-foundation.md',
  'goals/**',
  'packages/seis_platform_swift/**',
  'scripts/check-seis-apple-platform-architecture.mjs',
  'scripts/test-seis-apple-platform-architecture.mjs',
  'package.json',
];

const expectedAppleWorkflowTriggers = {
  pull_request: { paths: expectedAppleWorkflowPaths },
  push: { branches: ['main'], paths: expectedAppleWorkflowPaths },
};

const expectedFoundationWorkflowTriggers = {
  pull_request: null,
  push: { branches: ['main'] },
};

const expectedAppleWorkflowJob = {
  name: 'SwiftPM package, library, executable, and tests',
  'runs-on': 'macos-latest',
  'timeout-minutes': 20,
  steps: [
    {
      name: 'Checkout',
      uses: 'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
      with: { 'fetch-depth': 0, 'persist-credentials': false },
    },
    { name: 'Record toolchain', run: 'swift --version' },
    { name: 'Describe package', run: expectedDarwinCommands[0] },
    { name: 'Build shared library', run: expectedDarwinCommands[1] },
    { name: 'Build native shell executable', run: expectedDarwinCommands[2] },
    { name: 'Test package', run: expectedDarwinCommands[3] },
  ],
};

const expectedFoundationSetupSteps = [
  {
    name: 'Checkout',
    uses: 'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
    with: { 'fetch-depth': 0, 'persist-credentials': false },
  },
  {
    name: 'Setup Node',
    uses: 'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e',
    with: { 'node-version': 20, cache: 'npm' },
  },
  { name: 'Install dependencies', run: 'npm ci --ignore-scripts' },
];

const expectedFoundationCommands = [
  'npm run check:seis-apple-platform-architecture --ignore-scripts',
  'npm run test:seis-apple-platform-architecture --ignore-scripts',
  'npm run check:seis-platform-kernel --ignore-scripts',
  'npm run check:seis-governance-foundation --ignore-scripts',
  'npm run check:open-source-governance --ignore-scripts',
  'npm run seis:check --ignore-scripts',
  'npm run check:workspace --ignore-scripts',
  'npm run check:seis-platform-language-policy --ignore-scripts',
  'npm run check:foundation --ignore-scripts',
  'npm run check:goal-tracking --ignore-scripts',
  'npm run check:ecosystem-foundation --ignore-scripts',
  'npm run test:ecosystem-foundation --ignore-scripts',
  'npm run check:security-boundary --ignore-scripts',
  'npm run test:security-boundary --ignore-scripts',
  'npm run check:plugin-interface-roadmap --ignore-scripts',
  'npm run check:seis-code --ignore-scripts',
  'npm run check:mythic-gacha --ignore-scripts',
  'npm run check:video-hero-showcase --ignore-scripts',
  'npm run audit:ai-providers --ignore-scripts',
];

const expectedFoundationScriptTargets = {
  'check:seis-apple-platform-architecture':
    'node scripts/check-seis-apple-platform-architecture.mjs',
  'test:seis-apple-platform-architecture': 'node scripts/test-seis-apple-platform-architecture.mjs',
  'check:seis-platform-kernel': 'python3 scripts/check-seis-platform-kernel.py',
  'check:seis-governance-foundation': 'node scripts/check-seis-governance-foundation.mjs',
  'check:open-source-governance': 'node scripts/check-open-source-governance.mjs',
  'seis:check': 'node packages/seis-ai/bin/seis-check.mjs',
  'check:workspace': 'node scripts/check-workspace.cjs',
  'check:seis-platform-language-policy':
    'python3 scripts/create-seis-platform-language-policy.py --check',
  'check:foundation': 'node scripts/check-foundation.mjs',
  'check:goal-tracking': 'node scripts/check-goal-tracking.mjs',
  'check:ecosystem-foundation': 'ruby scripts/validate-ecosystem-foundation.rb',
  'test:ecosystem-foundation': 'ruby scripts/test-ecosystem-foundation.rb',
  'check:security-boundary': 'node scripts/check-security-boundary.mjs',
  'test:security-boundary': 'node scripts/test-security-boundary.mjs',
  'check:plugin-interface-roadmap': 'node scripts/check-plugin-interface-roadmap.mjs',
  'check:seis-code': 'node scripts/check-seis-code.mjs',
  'check:mythic-gacha': 'node scripts/check-mythic-gacha.mjs',
  'check:video-hero-showcase': 'node scripts/check-video-hero-showcase.mjs',
  'audit:ai-providers': 'node scripts/audit-ai-providers.mjs',
};

const expectedGoalDependencies = ['ECO-GOAL-0001', 'ECO-GOAL-0002', 'ECO-GOAL-0003'];

const expectedGoalValidationCommands = [
  ...expectedPortableCommands.slice(0, 6),
  ...expectedDarwinCommands,
  'git diff --check',
];

function readText(root, relativePath, errors) {
  const absolutePath = path.join(root, relativePath);
  try {
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (error) {
    errors.push(`${relativePath}: cannot read (${error.code ?? error.message})`);
    return '';
  }
}

function parseYamlSemantics(root, errors) {
  const result = spawnSync('ruby', ['-e', RUBY_YAML_TO_JSON, root, ...YAML_PATHS], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 5 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || `exit ${result.status}`).trim();
    errors.push(`semantic YAML parse failed: ${detail}`);
    return { documents: {}, rootKeys: {} };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const documents = {};
    const rootKeys = {};
    for (const [relativePath, payload] of Object.entries(parsed)) {
      documents[relativePath] = payload?.value;
      rootKeys[relativePath] = payload?.root_keys;
    }
    return { documents, rootKeys };
  } catch (error) {
    errors.push(`semantic YAML parse returned invalid JSON: ${error.message}`);
    return { documents: {}, rootKeys: {} };
  }
}

function readYamlSourceDigests(root, errors) {
  const sourceDigests = {};
  for (const relativePath of YAML_PATHS) {
    try {
      sourceDigests[relativePath] = sha256(fs.readFileSync(path.join(root, relativePath)));
    } catch (error) {
      errors.push(
        `${relativePath}: cannot read for semantic YAML cache (${error.code ?? error.message})`,
      );
    }
  }
  return sourceDigests;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function yamlCacheShapeErrors(yamlSemantics) {
  if (!yamlSemantics || typeof yamlSemantics !== 'object' || Array.isArray(yamlSemantics)) {
    return ['cache must be an object'];
  }
  const errors = [];
  for (const field of ['documents', 'rootKeys', 'sourceDigests']) {
    const value = yamlSemantics[field];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${field} must be an object`);
    }
  }
  if (errors.length > 0) return errors;
  for (const relativePath of YAML_PATHS) {
    if (!Object.hasOwn(yamlSemantics.documents, relativePath)) {
      errors.push(`documents is missing ${relativePath}`);
    }
    if (!Array.isArray(yamlSemantics.rootKeys[relativePath])) {
      errors.push(`rootKeys.${relativePath} must be an array`);
    }
    if (!/^[a-f0-9]{64}$/.test(yamlSemantics.sourceDigests[relativePath] ?? '')) {
      errors.push(`sourceDigests.${relativePath} must be a SHA-256 digest`);
    }
  }
  return errors;
}

function resolveYamlSemantics(root, cachedYamlSemantics, errors) {
  if (cachedYamlSemantics === undefined) return parseYamlSemantics(root, errors);

  const shapeErrors = yamlCacheShapeErrors(cachedYamlSemantics);
  if (shapeErrors.length > 0) {
    for (const error of shapeErrors) errors.push(`semantic YAML cache: ${error}`);
    return parseYamlSemantics(root, errors);
  }
  if (!loadedYamlSemantics.has(cachedYamlSemantics)) {
    errors.push('semantic YAML cache: cache was not produced by the canonical loader');
    return parseYamlSemantics(root, errors);
  }

  const digestErrors = [];
  const currentDigests = readYamlSourceDigests(root, digestErrors);
  if (
    digestErrors.length > 0 ||
    YAML_PATHS.some(
      relativePath =>
        currentDigests[relativePath] !== cachedYamlSemantics.sourceDigests[relativePath],
    )
  ) {
    return parseYamlSemantics(root, errors);
  }
  return cachedYamlSemantics;
}

export function loadApplePlatformYamlSemantics(root = process.cwd()) {
  const errors = [];
  const yamlSemantics = parseYamlSemantics(root, errors);
  yamlSemantics.sourceDigests = readYamlSourceDigests(root, errors);
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  deepFreeze(yamlSemantics);
  loadedYamlSemantics.add(yamlSemantics);
  return yamlSemantics;
}

function requireIncludes(text, token, relativePath, errors) {
  if (!text.includes(token)) {
    errors.push(`${relativePath}: missing required token ${JSON.stringify(token)}`);
  }
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function extractTopLevelSection(text, startKey, endKey) {
  const start = text.indexOf(`${startKey}:`);
  if (start < 0) return null;
  const end = endKey ? text.indexOf(`${endKey}:`, start) : text.length;
  return end < 0 ? null : text.slice(start, end);
}

function extractMarkedSection(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start < 0) return null;
  const end = endMarker ? text.indexOf(endMarker, start) : text.length;
  return end < 0 ? null : text.slice(start, end);
}

function requireExactArray(actual, expected, label, errors) {
  if (!Array.isArray(actual) || JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label}: must equal ${JSON.stringify(expected)}`);
  }
}

function requireExactValue(actual, expected, label, errors) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label}: must equal ${JSON.stringify(expected)}`);
  }
}

function sortedKeys(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.keys(value).sort()
    : [];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compactSwift(source, errors = null) {
  let output = '';
  let inString = false;
  let escaped = false;
  let lineComment = false;
  let blockCommentDepth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockCommentDepth > 0) {
      if (character === '/' && next === '*') {
        blockCommentDepth += 1;
        index += 1;
      } else if (character === '*' && next === '/') {
        blockCommentDepth -= 1;
        index += 1;
      }
      continue;
    }
    if (inString) {
      output += character;
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      blockCommentDepth = 1;
      index += 1;
      continue;
    }
    if (character === '"') {
      inString = true;
      output += character;
      continue;
    }
    if (!/\s/.test(character)) output += character;
  }

  if (blockCommentDepth > 0 && errors) {
    errors.push(`${MANIFEST_PATH}: unterminated Swift block comment`);
  }
  if (inString && errors) {
    errors.push(`${MANIFEST_PATH}: unterminated Swift string literal`);
  }
  return output.replace(/,([\])}])/g, '$1');
}

function extractSwiftArray(source, label, errors) {
  const match = new RegExp(`^ {4}${escapeRegExp(label)}\\s*:\\s*\\[`, 'm').exec(source);
  if (!match) {
    errors.push(`${MANIFEST_PATH}: missing ${label} array`);
    return '';
  }
  const openingIndex = match.index + match[0].lastIndexOf('[');
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = openingIndex; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === '[') depth += 1;
    if (character === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(openingIndex + 1, index);
    }
  }
  errors.push(`${MANIFEST_PATH}: unterminated ${label} array`);
  return '';
}

function splitSwiftArrayEntries(source) {
  const compact = compactSwift(source);
  const entries = [];
  let start = 0;
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < compact.length; index += 1) {
    const character = compact[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === '{') braces += 1;
    else if (character === '}') braces -= 1;
    else if (character === ',' && parentheses === 0 && brackets === 0 && braces === 0) {
      const entry = compact.slice(start, index);
      if (entry) entries.push(entry);
      start = index + 1;
    }
  }
  const finalEntry = compact.slice(start);
  if (finalEntry) entries.push(finalEntry);
  return entries;
}

function extractYamlList(text, key, indent) {
  const lines = text.split(/\r?\n/);
  const keyLine = `${' '.repeat(indent)}${key}:`;
  const start = lines.findIndex(line => line === keyLine);
  if (start < 0) return null;
  const itemPrefix = `${' '.repeat(indent + 2)}- `;
  const values = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === '' || /^\s+#/.test(line)) continue;
    const currentIndent = line.match(/^ */)[0].length;
    if (currentIndent <= indent) break;
    if (line.startsWith(itemPrefix)) values.push(line.slice(itemPrefix.length));
  }
  return values;
}

function extractNestedYamlList(text, parent, key) {
  const lines = text.split(/\r?\n/);
  const parentStart = lines.findIndex(line => line === `${parent}:`);
  if (parentStart < 0) return null;
  let childStart = -1;
  for (let index = parentStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(' ')) break;
    if (line === `  ${key}:`) {
      childStart = index;
      break;
    }
  }
  if (childStart < 0) return null;
  const values = [];
  for (let index = childStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === '' || /^\s+#/.test(line)) continue;
    const currentIndent = line.match(/^ */)[0].length;
    if (currentIndent <= 2) break;
    if (line.startsWith('    - ')) values.push(line.slice(6));
  }
  return values;
}

function yamlMappingKey(line, indent) {
  const prefix = ' '.repeat(indent);
  if (!line.startsWith(prefix) || line.startsWith(`${prefix} `)) return null;
  const match =
    /^(?:"([A-Za-z_][A-Za-z0-9_-]*)"|'([A-Za-z_][A-Za-z0-9_-]*)'|([A-Za-z_][A-Za-z0-9_-]*)):(?:\s|$)/.exec(
      line.slice(indent),
    );
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function requireUniqueGoalMappingKeys(text, errors) {
  const firstContentLine = text.split(/\r?\n/).find(line => line.trim() && !/^\s*#/.test(line));
  if (firstContentLine !== 'schema_version: 2') {
    errors.push(`${GOAL_PATH}: first content line must be schema_version: 2`);
  }
  if (/^(?:---|\.\.\.)(?:\s|$)/m.test(text)) {
    errors.push(`${GOAL_PATH}: YAML document markers are not permitted`);
  }
  if (/^\s*["'][^"']+["']\s*:/m.test(text)) {
    errors.push(`${GOAL_PATH}: quoted YAML mapping keys are not permitted`);
  }
  if (/^\s*\?\s+/m.test(text)) {
    errors.push(`${GOAL_PATH}: explicit YAML mapping keys are not permitted`);
  }
  const topLevelCounts = new Map();
  const childCounts = new Map([
    ['validation', new Map()],
    ['quality_gates', new Map()],
  ]);
  let activeParent = null;

  for (const line of text.split(/\r?\n/)) {
    const topLevel = yamlMappingKey(line, 0);
    if (topLevel) {
      topLevelCounts.set(topLevel, (topLevelCounts.get(topLevel) ?? 0) + 1);
      activeParent = childCounts.has(topLevel) ? topLevel : null;
      continue;
    }
    if (activeParent) {
      const directChild = yamlMappingKey(line, 2);
      if (directChild) {
        const counts = childCounts.get(activeParent);
        counts.set(directChild, (counts.get(directChild) ?? 0) + 1);
      } else if (line && !line.startsWith(' ')) {
        activeParent = null;
      }
    }
  }

  for (const [key, count] of topLevelCounts) {
    if (count !== 1) errors.push(`${GOAL_PATH}: duplicate top-level YAML key ${key}`);
  }
  for (const [parent, counts] of childCounts) {
    for (const [key, count] of counts) {
      if (count !== 1) errors.push(`${GOAL_PATH}: duplicate ${parent} YAML key ${key}`);
    }
  }
}

function extractTopLevelYamlScalar(text, key) {
  const match = new RegExp(`^${escapeRegExp(key)}:\\s*([^\\n#]+?)\\s*$`, 'm').exec(text);
  return match?.[1] ?? null;
}

function extractYamlScalarMapping(text, parent) {
  const lines = text.split(/\r?\n/);
  const parentStart = lines.findIndex(line => line === `${parent}:`);
  if (parentStart < 0) return null;
  const result = {};
  for (let index = parentStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(' ')) break;
    const match = /^  ([A-Za-z_][A-Za-z0-9_-]*):\s*([^#\n]+?)\s*$/.exec(line);
    if (match) result[match[1]] = match[2];
  }
  return result;
}

function extractEvidenceRecordBlocks(text, id) {
  const lines = text.split(/\r?\n/);
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index] === `  - id: ${id}`) starts.push(index);
  }
  return starts.map(start => {
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
      if (/^  - id: /.test(lines[index]) || (lines[index] && !lines[index].startsWith(' '))) {
        end = index;
        break;
      }
    }
    return lines.slice(start, end).join('\n');
  });
}

function validateEvidenceStates(goal, errors) {
  for (const [id, expected] of Object.entries(expectedEvidenceStates)) {
    const blocks = extractEvidenceRecordBlocks(goal, id);
    if (blocks.length !== 1) {
      errors.push(`${GOAL_PATH}: ${id} must occur exactly once`);
      continue;
    }
    const block = blocks[0];
    for (const [key, value] of Object.entries(expected)) {
      const keyPattern = new RegExp(
        `^    (?:"${escapeRegExp(key)}"|'${escapeRegExp(key)}'|${escapeRegExp(key)}):\\s*([^#\\n]+?)\\s*$`,
        'gm',
      );
      const matches = [...block.matchAll(keyPattern)];
      if (matches.length !== 1 || matches[0][1] !== value) {
        errors.push(`${GOAL_PATH}: ${id} ${key} must remain ${value}`);
      }
    }
  }
}

function validateGoalSemantics(goal, errors) {
  if (!goal || typeof goal !== 'object' || Array.isArray(goal)) {
    errors.push(`${GOAL_PATH}: semantic root must be a mapping`);
    return;
  }
  for (const [key, expected] of [
    ['schema_version', 2],
    ['id', 'SEIS-GOAL-0001'],
    ['status', 'proposed'],
    ['maturity', 'specification'],
    ['security_classification', 'public-safe'],
    ['privacy_impact', 'none'],
    ['canonical_owner_repo', 'seis'],
    ['title', 'Ratify the SEIS Apple-native architecture foundation'],
    [
      'summary',
      'Convert the existing Apple-platform direction and SwiftPM package surface into one reviewed architecture decision, exact platform and package map, web-demo boundary, build and test strategy, and deterministic drift gate without implementing new native product features.',
    ],
  ]) {
    requireExactValue(goal[key], expected, `${GOAL_PATH}: semantic ${key}`, errors);
  }
  requireExactArray(
    goal.dependencies,
    expectedGoalDependencies,
    `${GOAL_PATH}: semantic dependencies`,
    errors,
  );
  requireExactArray(
    goal.validation?.commands,
    expectedGoalValidationCommands,
    `${GOAL_PATH}: semantic validation commands`,
    errors,
  );
  requireExactValue(
    goal.quality_gates,
    expectedQualityGates,
    `${GOAL_PATH}: semantic quality gates`,
    errors,
  );
  for (const [key, expectedHash] of Object.entries(expectedGoalSemanticHashes)) {
    if (sha256(JSON.stringify(goal[key])) !== expectedHash) {
      errors.push(`${GOAL_PATH}: semantic ${key} drift`);
    }
  }
  const normalizedGoal = JSON.parse(JSON.stringify(goal));
  for (const key of ['issue_url', 'commit_sha', 'pull_request_url', 'release_note_url']) {
    if (normalizedGoal.github) normalizedGoal.github[key] = null;
  }
  if (sha256(JSON.stringify(normalizedGoal)) !== expectedNormalizedGoalSemanticHash) {
    errors.push(`${GOAL_PATH}: normalized semantic Goal drift`);
  }
  requireExactValue(
    {
      issue_url: goal.github?.issue_url,
      commit_sha: goal.github?.commit_sha,
      pull_request_url: goal.github?.pull_request_url,
      release_note_url: goal.github?.release_note_url,
    },
    expectedGoalGithubEvidence,
    `${GOAL_PATH}: exact semantic GitHub evidence metadata`,
    errors,
  );
  if (
    goal.github?.suggested_branch !== 'apple/seis-native-architecture-foundation' ||
    goal.github?.branch_name !== 'apple/seis-native-architecture-foundation'
  ) {
    errors.push(`${GOAL_PATH}: semantic GitHub branch must remain Apple foundation branch`);
  }

  const records = Array.isArray(goal.evidence_records) ? goal.evidence_records : [];
  for (const [id, expected] of Object.entries(expectedEvidenceStates)) {
    const matches = records.filter(record => record?.id === id);
    if (matches.length !== 1) {
      errors.push(`${GOAL_PATH}: semantic ${id} must occur exactly once`);
      continue;
    }
    const record = matches[0];
    if (
      record.type !== expected.type ||
      record.status !== expected.status ||
      String(record.exit_code) !== expected.exit_code
    ) {
      errors.push(`${GOAL_PATH}: semantic ${id} state drift`);
    }
  }
}

function validateWorkflowSemantics(yamlDocuments, yamlRootKeys, errors) {
  const appleWorkflow = yamlDocuments[APPLE_WORKFLOW_PATH];
  if (!appleWorkflow || typeof appleWorkflow !== 'object') {
    errors.push(`${APPLE_WORKFLOW_PATH}: semantic workflow mapping is required`);
  } else {
    requireExactArray(
      [...(yamlRootKeys[APPLE_WORKFLOW_PATH] ?? [])].sort(),
      ['jobs', 'name', 'on', 'permissions'],
      `${APPLE_WORKFLOW_PATH}: exact semantic top-level keys`,
      errors,
    );
    requireExactArray(
      sortedKeys(appleWorkflow),
      [YAML_BOOLEAN_TRUE_KEY, 'jobs', 'name', 'permissions'].sort(),
      `${APPLE_WORKFLOW_PATH}: exact normalized top-level keys`,
      errors,
    );
    requireExactValue(
      appleWorkflow.name,
      'Apple Platform Foundation',
      `${APPLE_WORKFLOW_PATH}: semantic workflow name`,
      errors,
    );
    requireExactValue(
      appleWorkflow[YAML_BOOLEAN_TRUE_KEY],
      expectedAppleWorkflowTriggers,
      `${APPLE_WORKFLOW_PATH}: semantic pull-request and main-push triggers`,
      errors,
    );
    requireExactValue(
      appleWorkflow.permissions,
      { contents: 'read' },
      `${APPLE_WORKFLOW_PATH}: semantic permissions`,
      errors,
    );
    requireExactArray(
      sortedKeys(appleWorkflow.jobs),
      ['swiftpm'],
      `${APPLE_WORKFLOW_PATH}: semantic jobs`,
      errors,
    );
    requireExactValue(
      appleWorkflow.jobs?.swiftpm,
      expectedAppleWorkflowJob,
      `${APPLE_WORKFLOW_PATH}: semantic SwiftPM job and executable steps`,
      errors,
    );
  }

  const foundationWorkflow = yamlDocuments[WORKFLOW_PATH];
  if (!foundationWorkflow || typeof foundationWorkflow !== 'object') {
    errors.push(`${WORKFLOW_PATH}: semantic workflow mapping is required`);
    return;
  }
  requireExactArray(
    [...(yamlRootKeys[WORKFLOW_PATH] ?? [])].sort(),
    ['jobs', 'name', 'on', 'permissions'],
    `${WORKFLOW_PATH}: exact semantic top-level keys`,
    errors,
  );
  requireExactArray(
    sortedKeys(foundationWorkflow),
    [YAML_BOOLEAN_TRUE_KEY, 'jobs', 'name', 'permissions'].sort(),
    `${WORKFLOW_PATH}: exact normalized top-level keys`,
    errors,
  );
  requireExactValue(
    foundationWorkflow.name,
    'Foundation Check',
    `${WORKFLOW_PATH}: semantic workflow name`,
    errors,
  );
  requireExactValue(
    foundationWorkflow[YAML_BOOLEAN_TRUE_KEY],
    expectedFoundationWorkflowTriggers,
    `${WORKFLOW_PATH}: semantic pull-request and main-push triggers`,
    errors,
  );
  requireExactValue(
    foundationWorkflow.permissions,
    { contents: 'read' },
    `${WORKFLOW_PATH}: semantic permissions`,
    errors,
  );
  requireExactArray(
    sortedKeys(foundationWorkflow.jobs),
    ['check'],
    `${WORKFLOW_PATH}: semantic jobs`,
    errors,
  );
  const checkJob = foundationWorkflow.jobs?.check;
  if (!checkJob || typeof checkJob !== 'object') {
    errors.push(`${WORKFLOW_PATH}: semantic check job is required`);
    return;
  }
  requireExactArray(
    sortedKeys(checkJob),
    ['name', 'runs-on', 'steps', 'timeout-minutes'],
    `${WORKFLOW_PATH}: semantic check job fields`,
    errors,
  );
  requireExactValue(
    checkJob.name,
    'Foundation governance check',
    `${WORKFLOW_PATH}: semantic check job name`,
    errors,
  );
  requireExactValue(
    checkJob['runs-on'],
    'ubuntu-latest',
    `${WORKFLOW_PATH}: semantic check runner`,
    errors,
  );
  requireExactValue(
    checkJob['timeout-minutes'],
    10,
    `${WORKFLOW_PATH}: semantic check timeout`,
    errors,
  );
  const steps = Array.isArray(checkJob.steps) ? checkJob.steps : [];
  if (steps.length !== expectedFoundationSetupSteps.length + 1) {
    errors.push(`${WORKFLOW_PATH}: semantic check job must contain exactly four steps`);
  }
  for (const [index, expectedStep] of expectedFoundationSetupSteps.entries()) {
    requireExactValue(
      steps[index],
      expectedStep,
      `${WORKFLOW_PATH}: semantic setup step ${index + 1}`,
      errors,
    );
  }
  const lightweightSteps = steps.filter(step => step?.name === 'Run lightweight checks');
  if (lightweightSteps.length !== 1) {
    errors.push(`${WORKFLOW_PATH}: semantic lightweight-check step must occur exactly once`);
    return;
  }
  const lightweightStep = lightweightSteps[0];
  requireExactArray(
    sortedKeys(lightweightStep),
    ['name', 'run'],
    `${WORKFLOW_PATH}: semantic lightweight-check step fields`,
    errors,
  );
  const executableLines =
    typeof lightweightStep.run === 'string'
      ? lightweightStep.run
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(Boolean)
      : [];
  for (const line of executableLines) {
    if (!/^npm run [A-Za-z0-9:_-]+ --ignore-scripts$/.test(line)) {
      errors.push(
        `${WORKFLOW_PATH}: semantic lightweight-check line is not an npm script ${JSON.stringify(line)}`,
      );
    }
  }
  requireExactArray(
    executableLines,
    expectedFoundationCommands,
    `${WORKFLOW_PATH}: exact semantic lightweight-check commands`,
    errors,
  );
}

function parseContract(root, errors) {
  const text = readText(root, CONTRACT_PATH, errors);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    errors.push(`${CONTRACT_PATH}: invalid JSON (${error.message})`);
    return null;
  }
}

function validateContract(contract, errors) {
  if (!contract) return;
  if (JSON.stringify(sortedKeys(contract)) !== JSON.stringify(exactTopLevelKeys)) {
    errors.push(`${CONTRACT_PATH}: top-level fields must match the canonical contract`);
  }
  if (contract.schema_version !== 1) errors.push(`${CONTRACT_PATH}: schema_version must be 1`);
  if (contract.goal_id !== 'SEIS-GOAL-0001')
    errors.push(`${CONTRACT_PATH}: goal_id must be SEIS-GOAL-0001`);
  if (contract.status !== 'proposed') errors.push(`${CONTRACT_PATH}: status must remain proposed`);
  if (contract.maturity !== 'specification')
    errors.push(`${CONTRACT_PATH}: maturity must remain specification`);
  if (contract.canonical_owner_repo !== 'seis')
    errors.push(`${CONTRACT_PATH}: canonical owner must remain seis`);

  const packageContract = contract.package;
  if (!packageContract || typeof packageContract !== 'object') {
    errors.push(`${CONTRACT_PATH}: package must be an object`);
  } else {
    requireExactArray(
      sortedKeys(packageContract),
      [
        'external_dependencies',
        'manifest',
        'minimum_platforms',
        'name',
        'path',
        'products',
        'targets',
        'tools_version',
      ],
      `${CONTRACT_PATH}: exact package fields`,
      errors,
    );
    if (packageContract.path !== 'packages/seis_platform_swift')
      errors.push(`${CONTRACT_PATH}: package path drift`);
    if (packageContract.manifest !== MANIFEST_PATH)
      errors.push(`${CONTRACT_PATH}: package manifest path drift`);
    if (packageContract.tools_version !== '6.0')
      errors.push(`${CONTRACT_PATH}: Swift tools version must remain 6.0`);
    if (packageContract.name !== 'SeisPlatformKit')
      errors.push(`${CONTRACT_PATH}: package name must remain SeisPlatformKit`);
    requireExactArray(
      packageContract.minimum_platforms,
      [
        { id: 'macos', version: '13' },
        { id: 'ios', version: '16' },
      ],
      `${CONTRACT_PATH}: minimum platforms`,
      errors,
    );
    requireExactArray(
      packageContract.products,
      [
        { name: 'SeisPlatformKit', kind: 'library', targets: ['SeisPlatformKit'] },
        { name: 'SeisAppleNativeShell', kind: 'executable', targets: ['SeisAppleNativeShell'] },
      ],
      `${CONTRACT_PATH}: products`,
      errors,
    );
    requireExactArray(
      packageContract.targets,
      [
        {
          name: 'SeisPlatformKit',
          kind: 'library',
          dependencies: [],
          resources: [],
          current_layers: [
            'domain-contracts',
            'application-runtime',
            'data-infrastructure',
            'presentation',
            'observability',
          ],
        },
        {
          name: 'SeisAppleNativeShell',
          kind: 'executable',
          dependencies: ['SeisPlatformKit'],
          resources: [
            'Resources/seisdemo-urlscheme-template.plist',
            'Resources/seis-demo-contract.json',
          ],
          current_layers: [
            'presentation',
            'application-runtime',
            'resource-loading',
            'local-process-integration',
            'observability',
          ],
        },
        {
          name: 'SeisPlatformKitTests',
          kind: 'test',
          dependencies: ['SeisPlatformKit'],
          resources: [],
          current_layers: ['testing'],
        },
      ],
      `${CONTRACT_PATH}: targets`,
      errors,
    );
    requireExactArray(
      packageContract.external_dependencies,
      [],
      `${CONTRACT_PATH}: external dependencies`,
      errors,
    );
  }

  requireExactArray(
    contract.platform_roles,
    expectedPlatformRoles,
    `${CONTRACT_PATH}: platform roles and evidence boundaries`,
    errors,
  );

  requireExactValue(
    contract.web_native_contract,
    expectedWebNativeContract,
    `${CONTRACT_PATH}: complete web-native contract`,
    errors,
  );
  requireExactValue(
    contract.readiness_semantics,
    expectedReadinessSemantics,
    `${CONTRACT_PATH}: complete readiness semantics`,
    errors,
  );

  requireExactArray(
    contract.validation?.portable,
    expectedPortableCommands,
    `${CONTRACT_PATH}: portable validation`,
    errors,
  );
  requireExactArray(
    contract.validation?.darwin_swiftpm,
    expectedDarwinCommands,
    `${CONTRACT_PATH}: Darwin validation`,
    errors,
  );
  requireExactArray(
    contract.validation?.future_platform_evidence,
    expectedFuturePlatformEvidence,
    `${CONTRACT_PATH}: future platform evidence`,
    errors,
  );
  requireExactArray(
    sortedKeys(contract.validation),
    ['darwin_swiftpm', 'future_platform_evidence', 'portable'],
    `${CONTRACT_PATH}: exact validation fields`,
    errors,
  );
  requireExactValue(
    contract.boundaries,
    expectedBoundaries,
    `${CONTRACT_PATH}: product, web, architecture, and privacy boundaries`,
    errors,
  );
  requireExactArray(contract.non_claims, expectedNonClaims, `${CONTRACT_PATH}: non-claims`, errors);
}

function validatePackageManifest(manifest, errors) {
  if (manifest.split(/\r?\n/, 1)[0] !== '// swift-tools-version: 6.0') {
    errors.push(`${MANIFEST_PATH}: Swift tools version must remain 6.0`);
  }
  const compactManifest = compactSwift(manifest, errors);
  if (compactManifest !== expectedCompactManifest) {
    errors.push(`${MANIFEST_PATH}: exact declarative manifest body drift`);
  }
  if (!compactManifest.includes('letpackage=Package(name:"SeisPlatformKit",')) {
    errors.push(`${MANIFEST_PATH}: package name must remain SeisPlatformKit`);
  }
  if (compactManifest.includes('.package(')) {
    errors.push(`${MANIFEST_PATH}: external package dependencies are not permitted in this Goal`);
  }

  const platforms = splitSwiftArrayEntries(extractSwiftArray(manifest, 'platforms', errors));
  requireExactArray(
    platforms,
    ['.macOS(.v13)', '.iOS(.v16)'],
    `${MANIFEST_PATH}: exact platform inventory`,
    errors,
  );

  const products = splitSwiftArrayEntries(extractSwiftArray(manifest, 'products', errors));
  requireExactArray(
    products,
    [
      '.library(name:"SeisPlatformKit",targets:["SeisPlatformKit"])',
      '.executable(name:"SeisAppleNativeShell",targets:["SeisAppleNativeShell"])',
    ],
    `${MANIFEST_PATH}: exact product inventory`,
    errors,
  );

  const targets = splitSwiftArrayEntries(extractSwiftArray(manifest, 'targets', errors));
  requireExactArray(
    targets,
    [
      '.target(name:"SeisPlatformKit")',
      '.executableTarget(name:"SeisAppleNativeShell",dependencies:["SeisPlatformKit"],resources:[.copy("Resources/seisdemo-urlscheme-template.plist"),.copy("Resources/seis-demo-contract.json")])',
      '.testTarget(name:"SeisPlatformKitTests",dependencies:["SeisPlatformKit"])',
    ],
    `${MANIFEST_PATH}: exact target, dependency, and resource inventory`,
    errors,
  );
}

const unsupportedCapabilityClaimPatterns = [
  /\b(?:native shell|native application|apple application|application|app)\b[^.\n]{0,60}\b(?:is|are|has been|have been)\b[^.\n]{0,20}\b(?:signed|notarized|stable|released|distributed|production-ready|verified)\b/i,
  /\b(?:signed|notarized|stable|released|production-ready)\b[^.\n]{0,80}\b(?:application|app)\b[^.\n]{0,80}\b(?:distributed|released|stable|verified|production-ready)\b/i,
  /\b(?:SEIS|we|product|project)\b[^.\n]{0,50}\b(?:ships|delivers|distributes|releases)\b[^.\n]{0,80}\b(?:signed|notarized|stable|native shell|native application|production users?)\b/i,
  /\b(?:web|webview|browser)\b[^.\n]{0,80}\bstores?\b[^.\n]{0,80}\bcredentials?\b/i,
  /\b(?:live|credential-backed)\b[^.\n]{0,80}\b(?:provider|cloudkit|control plane|webview)\b[^.\n]{0,40}\b(?:is|are|enabled|verified|connected|available|active)\b/i,
  /\bweb\s+is\s+the\s+canonical\s+(?:native\s+)?product\s+center\b/i,
  /\ball\s+(?:human\s+)?approvals?\b[^.\n]{0,80}\b(?:complete|passed|accepted|approved)\b/i,
  /\b(?:pull request|PR)\b[^.\n]{0,80}\b(?:merge-ready|release-authorized|approved)\b/i,
  /\brepository\b[^.\n]{0,80}\b(?:privacy[- ]certified|secret-free)\b/i,
  /\b(?:native shell|native application|macOS build)\b[^.\n]{0,100}\b(?:general availability|code signing|notarization|notarized|production users?)\b/i,
  /\bcloudkit\s+synchronization\b[^.\n]{0,60}\b(?:live|connected|available|enabled)\b/i,
  /\bbrowser\b[^.\n]{0,60}\b(?:persists?|stores?)\b[^.\n]{0,60}\b(?:provider\s+)?api keys?\b/i,
  /\ball\s+required\s+human\s+reviews?\b[^.\n]{0,40}\b(?:passed|approved|complete)\b/i,
  /\b(?:this\s+)?PR\b[^.\n]{0,80}\bevery\s+approval\b[^.\n]{0,40}\b(?:can\s+merge|merge-ready|approved)\b/i,
  /\brepository\b[^.\n]{0,80}\b(?:contains?\s+no\s+secrets?|audited\s+and\s+secret-free)\b/i,
  /\bproduction users?\b[^.\n]{0,80}\b(?:download|install|receive)\b[^.\n]{0,80}\b(?:notarized|signed|stable)\b/i,
];

function validateNoUnsupportedCapabilityClaims(text, relativePath, errors) {
  for (const pattern of unsupportedCapabilityClaimPatterns) {
    for (const match of text.matchAll(new RegExp(pattern.source, `${pattern.flags}g`))) {
      const clauseStart = Math.max(
        text.lastIndexOf('\n', match.index),
        text.lastIndexOf('.', match.index),
        text.lastIndexOf(';', match.index),
      );
      const claimPrefix = text.slice(clauseStart + 1, match.index);
      const affirmativeNegationPhrase = /\b(?:not only|contains? no secrets?)\b/i.test(match[0]);
      if (
        !affirmativeNegationPhrase &&
        (/\b(?:no|not(?!\s+only\b)|never|without|unavailable|unresolved|pending|failed|cannot|does not|do not|must not)\b/i.test(
          match[0],
        ) ||
          /\b(?:no|never|without|must not|does not|do not)\s+(?:an?\s+|the\s+)?$/i.test(
            claimPrefix,
          ))
      ) {
        continue;
      }
      errors.push(
        `${relativePath}: unsupported positive capability claim ${JSON.stringify(match[0])}`,
      );
    }
  }
}

function validateDocuments(root, contract, errors, goalSemantics) {
  const map = readText(root, MAP_PATH, errors);
  const adr = readText(root, ADR_PATH, errors);
  const strategy = readText(root, STRATEGY_PATH, errors);
  const docsIndex = readText(root, DOC_INDEX_PATH, errors);
  const commandCenter = readText(root, COMMAND_CENTER_PATH, errors);
  const webMobile = readText(root, WEB_MOBILE_PATH, errors);
  const webReadme = readText(root, WEB_README_PATH, errors);
  const deployment = readText(root, DEPLOYMENT_PATH, errors);
  const nextPrQueue = readText(root, NEXT_PR_QUEUE_PATH, errors);
  const goal = readText(root, GOAL_PATH, errors);
  requireUniqueGoalMappingKeys(goal, errors);
  validateEvidenceStates(goal, errors);
  validateGoalSemantics(goalSemantics, errors);

  for (const [relativePath, text] of [
    [MAP_PATH, map],
    [ADR_PATH, adr],
    [STRATEGY_PATH, strategy],
  ]) {
    if (sha256(text) !== expectedDocumentHashes[relativePath]) {
      errors.push(`${relativePath}: reviewed document SHA-256 drift`);
    }
  }
  const reviewedDocuments = new Map([
    [WEB_README_PATH, webReadme],
    [COMMAND_CENTER_PATH, commandCenter],
    [WEB_MOBILE_PATH, webMobile],
    [DEPLOYMENT_PATH, deployment],
    [NEXT_PR_QUEUE_PATH, nextPrQueue],
    [DOC_INDEX_PATH, docsIndex],
  ]);
  for (const expected of expectedDocumentSectionHashes) {
    const section = extractMarkedSection(
      reviewedDocuments.get(expected.path) ?? '',
      expected.start,
      expected.end,
    );
    if (!section || sha256(section) !== expected.sha256) {
      errors.push(
        `${expected.path}: reviewed ${JSON.stringify(expected.start)} section SHA-256 drift`,
      );
    }
  }
  for (const [relativePath, text] of reviewedDocuments) {
    validateNoUnsupportedCapabilityClaims(text, relativePath, errors);
  }
  for (const [startKey, endKey] of goalSectionBoundaries) {
    const section = extractTopLevelSection(goal, startKey, endKey);
    if (!section || sha256(section) !== expectedGoalSectionHashes[startKey]) {
      errors.push(`${GOAL_PATH}: reviewed ${startKey} section SHA-256 drift`);
    }
  }

  for (const heading of [
    'Decision Boundary',
    'Current Swift Package Map',
    'Current Layer Inventory',
    'Platform Roles',
    'Dependency Direction',
    'Current Web-Native Contract',
    'Current Readiness Semantics',
    'Web Demo Boundary',
    'Build and Test Strategy',
    'Validation Snapshot',
    'Current Gaps',
    'Rollback',
  ])
    requireIncludes(map, `## ${heading}`, MAP_PATH, errors);

  for (const role of contract?.platform_roles ?? []) {
    const roleRow = new RegExp(
      `^\\|\\s*${escapeRegExp(role.display_name)}\\s*\\|\\s*${escapeRegExp(role.state)}\\s*\\|`,
      'm',
    );
    if (!roleRow.test(map)) {
      errors.push(`${MAP_PATH}: missing platform row ${role.display_name}/${role.state}`);
    }
  }
  for (const command of [...expectedPortableCommands, ...expectedDarwinCommands]) {
    requireIncludes(map, command, MAP_PATH, errors);
  }
  requireIncludes(map, 'No-key public demo', MAP_PATH, errors);
  requireIncludes(map, 'Ownership and sync direction\nremain unresolved', MAP_PATH, errors);
  requireIncludes(map, 'current mixed boundary', MAP_PATH, errors);
  requireIncludes(map, 'application/runtime behavior', MAP_PATH, errors);
  requireIncludes(map, 'declarative prototype metadata only', MAP_PATH, errors);
  requireIncludes(
    map,
    'a child Goal must\n   separate them before stable maturity',
    MAP_PATH,
    errors,
  );
  requireIncludes(map, 'failed evidence, not a build pass', MAP_PATH, errors);
  requireIncludes(
    map,
    '`SeisAppleNativeShell` product build and `swift test` were not run',
    MAP_PATH,
    errors,
  );

  for (const heading of [
    'Status',
    'Context',
    'Decision',
    'Consequences',
    'Alternatives Considered',
    'Security and Privacy',
    'Accessibility and Performance',
    'Migration and Rollback',
    'Follow-up',
  ])
    requireIncludes(adr, `## ${heading}`, ADR_PATH, errors);
  requireIncludes(adr, '## Status\n\nProposed', ADR_PATH, errors);
  requireIncludes(adr, '`SeisPlatformKit`', ADR_PATH, errors);
  requireIncludes(adr, '`SeisAppleNativeShell`', ADR_PATH, errors);
  requireIncludes(adr, '`SeisAppleContinuationSurface.swift`', ADR_PATH, errors);

  requireIncludes(strategy, 'architecture/SEIS_APPLE_PLATFORM_MAP.md', STRATEGY_PATH, errors);
  requireIncludes(
    strategy,
    'adr/0003-seis-apple-native-architecture-foundation.md',
    STRATEGY_PATH,
    errors,
  );
  requireIncludes(strategy, '## Validation Strategy', STRATEGY_PATH, errors);
  requireIncludes(
    docsIndex,
    '| [architecture/SEIS_APPLE_PLATFORM_MAP.md](architecture/SEIS_APPLE_PLATFORM_MAP.md) | Proposed exact SwiftPM inventory, Apple product roles, web boundary, and validation strategy. |',
    DOC_INDEX_PATH,
    errors,
  );
  requireIncludes(
    docsIndex,
    '| [adr/0003-seis-apple-native-architecture-foundation.md](adr/0003-seis-apple-native-architecture-foundation.md) | Proposed Apple-native platform roles, package boundary, maturity, and web-demo decision. |',
    DOC_INDEX_PATH,
    errors,
  );
  requireIncludes(webMobile, '## Scope Note', WEB_MOBILE_PATH, errors);
  requireIncludes(
    webMobile,
    'does not define the SEIS native product center',
    WEB_MOBILE_PATH,
    errors,
  );
  requireIncludes(
    commandCenter,
    'do not redefine the platform roles or claim that the\nSwiftPM shell is a released native application',
    COMMAND_CENTER_PATH,
    errors,
  );
  requireIncludes(
    commandCenter,
    'docs/architecture/SEIS_APPLE_PLATFORM_MAP.md',
    COMMAND_CENTER_PATH,
    errors,
  );
  requireIncludes(
    webReadme,
    'canonical owner ve sync direction kararı henüz verilmemiştir',
    WEB_README_PATH,
    errors,
  );
  requireIncludes(
    webReadme,
    'Ayrı bir iOS/macOS WebView app target kanıtı yoktur',
    WEB_README_PATH,
    errors,
  );
  requireIncludes(deployment, 'signed/notarized\napp bundle', DEPLOYMENT_PATH, errors);
  requireIncludes(
    deployment,
    'iOS simulator build bu sürümde unavailable',
    DEPLOYMENT_PATH,
    errors,
  );
  for (const token of [
    '## Proposed Apple-Native Architecture Stack - 2026-07-13',
    '`proposed` / `specification`; draft-only and not merge-ready',
    '`apple/seis-native-architecture-foundation`',
    '`security/ecosystem-local-secret-boundary`',
    'exit 130 and is not passing evidence',
    '`swift test` was not run',
    'CommandLineTools rather than full Xcode',
    'Do not force-push or rewrite shared history',
    'Accountable-human ADR acceptance',
  ])
    requireIncludes(nextPrQueue, token, NEXT_PR_QUEUE_PATH, errors);

  if (!/^id: SEIS-GOAL-0001$/m.test(goal)) {
    errors.push(`${GOAL_PATH}: top-level id must remain SEIS-GOAL-0001`);
  }
  if (!/^maturity: specification$/m.test(goal)) {
    errors.push(`${GOAL_PATH}: top-level maturity must remain specification`);
  }
  if (!/^status: proposed$/m.test(goal)) {
    errors.push(`${GOAL_PATH}: top-level status must remain proposed`);
  }
  if (extractTopLevelYamlScalar(goal, 'security_classification') !== 'public-safe') {
    errors.push(`${GOAL_PATH}: security_classification must remain public-safe`);
  }
  if (extractTopLevelYamlScalar(goal, 'privacy_impact') !== 'none') {
    errors.push(`${GOAL_PATH}: privacy_impact must remain none`);
  }
  requireExactValue(
    extractYamlScalarMapping(goal, 'quality_gates'),
    expectedQualityGates,
    `${GOAL_PATH}: exact quality gates`,
    errors,
  );
  requireExactArray(
    extractYamlList(goal, 'dependencies', 0),
    expectedGoalDependencies,
    `${GOAL_PATH}: exact dependencies`,
    errors,
  );
  requireExactArray(
    extractNestedYamlList(goal, 'validation', 'commands'),
    expectedGoalValidationCommands,
    `${GOAL_PATH}: exact validation commands`,
    errors,
  );

  for (const [relativePath, text] of [
    [CONTRACT_PATH, JSON.stringify(contract)],
    [MAP_PATH, map],
    [ADR_PATH, adr],
    [STRATEGY_PATH, strategy],
    [DOC_INDEX_PATH, docsIndex],
    [COMMAND_CENTER_PATH, commandCenter],
    [WEB_MOBILE_PATH, webMobile],
    [WEB_README_PATH, webReadme],
    [DEPLOYMENT_PATH, deployment],
    [NEXT_PR_QUEUE_PATH, nextPrQueue],
    [GOAL_PATH, goal],
  ]) {
    if (/\/Users\/|Mobile Documents|~\/|[A-Za-z]:\\/.test(text)) {
      errors.push(`${relativePath}: contains a machine-specific path`);
    }
  }
}

function validateWebNativeFixture(root, contract, errors) {
  const paths = contract?.web_native_contract?.paths;
  if (!Array.isArray(paths) || paths.length !== 2) return;
  const [webPath, nativePath] = paths;
  const web = readText(root, webPath, errors);
  const native = readText(root, nativePath, errors);
  if (web && native && web !== native) {
    errors.push(`${CONTRACT_PATH}: web-native demo contract copies must remain byte-identical`);
  }
  const expectedHash = contract?.web_native_contract?.content_sha256;
  for (const [relativePath, content] of [
    [webPath, web],
    [nativePath, native],
  ]) {
    if (content) {
      const actualHash = sha256(content);
      if (actualHash !== expectedHash) {
        errors.push(`${relativePath}: content SHA-256 must match the reviewed no-key fixture`);
      }
    }
  }

  try {
    const demoContract = JSON.parse(web);
    requireExactArray(
      sortedKeys(demoContract),
      [
        'analytics_events',
        'contract_name',
        'contract_version',
        'platform_targets',
        'routes',
        'scenarios',
      ],
      `${webPath}: exact top-level demo-contract fields`,
      errors,
    );
    requireExactArray(
      demoContract.platform_targets,
      ['iOS', 'macOS', 'web'],
      `${webPath}: exact public demo platform targets`,
      errors,
    );
    requireExactArray(
      demoContract.routes?.map(route => route.path),
      ['/', '/demo', '/demo/:scenario', '/results/:runId'],
      `${webPath}: exact no-key public routes`,
      errors,
    );
  } catch (error) {
    errors.push(`${webPath}: invalid shared demo-contract JSON (${error.message})`);
  }
}

function validateAutomation(root, errors, yamlDocuments, yamlRootKeys) {
  validateWorkflowSemantics(yamlDocuments, yamlRootKeys, errors);
  const packageJsonText = readText(root, PACKAGE_JSON_PATH, errors);
  let packageJson = null;
  try {
    packageJson = JSON.parse(packageJsonText);
  } catch (error) {
    errors.push(`${PACKAGE_JSON_PATH}: invalid JSON (${error.message})`);
  }
  const invokedScriptNames = expectedFoundationCommands.map(command =>
    command.slice('npm run '.length, -' --ignore-scripts'.length),
  );
  requireExactArray(
    invokedScriptNames,
    Object.keys(expectedFoundationScriptTargets),
    `${WORKFLOW_PATH}: exact invoked-script target inventory`,
    errors,
  );
  for (const [scriptName, expectedTarget] of Object.entries(expectedFoundationScriptTargets)) {
    if (packageJson?.scripts?.[scriptName] !== expectedTarget) {
      errors.push(
        `${PACKAGE_JSON_PATH}: Foundation script ${scriptName} must remain ${JSON.stringify(expectedTarget)}`,
      );
    }
  }
  if (
    packageJson?.scripts?.['check:seis-apple-platform-architecture'] !==
    'node scripts/check-seis-apple-platform-architecture.mjs'
  ) {
    errors.push(`${PACKAGE_JSON_PATH}: missing exact Apple architecture check script`);
  }
  if (
    packageJson?.scripts?.['test:seis-apple-platform-architecture'] !==
    'node scripts/test-seis-apple-platform-architecture.mjs'
  ) {
    errors.push(`${PACKAGE_JSON_PATH}: missing exact Apple architecture test script`);
  }
  if (
    packageJson?.scripts?.['check:seis-platform-kernel'] !==
    'python3 scripts/check-seis-platform-kernel.py'
  ) {
    errors.push(`${PACKAGE_JSON_PATH}: missing exact platform-kernel check script`);
  }
  for (const lifecycleScript of [
    'precheck:seis-apple-platform-architecture',
    'postcheck:seis-apple-platform-architecture',
    'pretest:seis-apple-platform-architecture',
    'posttest:seis-apple-platform-architecture',
    'precheck:seis-platform-kernel',
    'postcheck:seis-platform-kernel',
  ]) {
    if (Object.prototype.hasOwnProperty.call(packageJson?.scripts ?? {}, lifecycleScript)) {
      errors.push(`${PACKAGE_JSON_PATH}: lifecycle script ${lifecycleScript} is not permitted`);
    }
  }

  const workflow = readText(root, WORKFLOW_PATH, errors);
  for (const command of expectedFoundationCommands.slice(0, 3)) {
    const executableLine = new RegExp(`^ {10}${escapeRegExp(command)}$`, 'gm');
    if ([...workflow.matchAll(executableLine)].length !== 1) {
      errors.push(`${WORKFLOW_PATH}: missing exact executable line ${JSON.stringify(command)}`);
    }
  }
  for (const [pattern, label] of [
    [/^\s*(?:"if"|'if'|if)\s*:/m, 'conditional job or step execution'],
    [/^\s*(?:"shell"|'shell'|shell)\s*:/m, 'custom shell execution'],
    [/^\s*(?:"defaults"|'defaults'|defaults)\s*:/m, 'workflow run defaults'],
    [/^\s*(?:"continue-on-error"|'continue-on-error'|continue-on-error)\s*:/m, 'continue-on-error'],
    [/^\s*["'][^"']+["']\s*:/m, 'quoted YAML mapping key'],
    [/^\s*\?\s+/m, 'explicit YAML mapping key'],
  ]) {
    if (pattern.test(workflow)) errors.push(`${WORKFLOW_PATH}: ${label} is not permitted`);
  }

  const appleWorkflow = readText(root, APPLE_WORKFLOW_PATH, errors);
  for (const token of [
    'permissions:\n  contents: read',
    'runs-on: macos-latest',
    'fetch-depth: 0',
    'persist-credentials: false',
    ...expectedDarwinCommands,
  ])
    requireIncludes(appleWorkflow, token, APPLE_WORKFLOW_PATH, errors);

  const forbiddenWorkflowPatterns = [
    [/^\s*(?:"if"|'if'|if)\s*:/m, 'conditional job or step execution'],
    [/^\s*(?:"continue-on-error"|'continue-on-error'|continue-on-error)\s*:/m, 'continue-on-error'],
    [/^\s*(?:"shell"|'shell'|shell)\s*:/m, 'custom shell execution'],
    [/^\s*(?:"defaults"|'defaults'|defaults)\s*:/m, 'workflow run defaults'],
    [/^\s*["'][^"']+["']\s*:/m, 'quoted YAML mapping key'],
    [/^\s*\?\s+/m, 'explicit YAML mapping key'],
    [/\|\|\s*true|;\s*true(?:\s|$)/m, 'failure masking'],
    [/^\s*run:\s*echo\b/m, 'echo-only command substitution'],
  ];
  for (const [pattern, label] of forbiddenWorkflowPatterns) {
    if (pattern.test(appleWorkflow)) {
      errors.push(`${APPLE_WORKFLOW_PATH}: ${label} is not permitted`);
    }
  }

  const runCommands = [...appleWorkflow.matchAll(/^\s+run:\s+(.+)$/gm)].map(match => match[1]);
  requireExactArray(
    runCommands,
    ['swift --version', ...expectedDarwinCommands],
    `${APPLE_WORKFLOW_PATH}: exact executable run commands`,
    errors,
  );
  if ((appleWorkflow.match(/^jobs:$/gm) ?? []).length !== 1) {
    errors.push(`${APPLE_WORKFLOW_PATH}: exactly one jobs mapping is required`);
  }
  if ((appleWorkflow.match(/^  swiftpm:$/gm) ?? []).length !== 1) {
    errors.push(`${APPLE_WORKFLOW_PATH}: exactly one swiftpm job is required`);
  }
}

export function validateChangedPaths(changedPaths, allowedPaths, errors = []) {
  const allowed = new Set(allowedPaths);
  for (const changedPath of [...new Set(changedPaths)].sort()) {
    if (
      typeof changedPath !== 'string' ||
      changedPath.startsWith('/') ||
      changedPath.split('/').includes('..')
    ) {
      errors.push(`Goal diff scope: invalid changed path ${JSON.stringify(changedPath)}`);
      continue;
    }
    if (READ_ONLY_INPUT_PATHS.has(changedPath)) {
      errors.push(`Goal diff scope: read-only validation input changed ${changedPath}`);
      continue;
    }
    if (!allowed.has(changedPath)) {
      errors.push(`Goal diff scope: out-of-scope path changed ${changedPath}`);
    }
  }
  return errors;
}

function readGitPaths(root, args, label, errors) {
  const result = spawnSync('git', args, {
    cwd: root,
    maxBuffer: 5 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = (
      result.stderr?.toString('utf8') ||
      result.stdout?.toString('utf8') ||
      `exit ${result.status}`
    ).trim();
    errors.push(`Goal diff scope: ${label} failed (${detail})`);
    return [];
  }
  const output = result.stdout?.toString('utf8') ?? '';
  if (output && !output.endsWith('\0')) {
    errors.push(`Goal diff scope: ${label} did not return NUL-delimited paths`);
    return [];
  }
  return output.split('\0').filter(value => value !== '');
}

function resolveGoalDiffBase() {
  if (process.env.SEIS_APPLE_DIFF_BASE) return process.env.SEIS_APPLE_DIFF_BASE;
  if (process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.GITHUB_BASE_REF) {
    return `origin/${process.env.GITHUB_BASE_REF}`;
  }
  return null;
}

export function shouldEnforceGoalDiffScope(changedPaths, environment = process.env) {
  if (environment.SEIS_APPLE_DIFF_BASE) return true;
  if (environment.GITHUB_EVENT_NAME !== 'pull_request') return false;
  if (environment.GITHUB_HEAD_REF === APPLE_GOAL_BRANCH) return true;
  return changedPaths.some(relativePath => APPLE_SCOPE_ACTIVATION_PATHS.has(relativePath));
}

export function validateActiveGoalSharedDocuments(root, errors = []) {
  for (const [relativePath, expectedHash] of Object.entries(
    expectedActiveGoalSharedDocumentHashes,
  )) {
    const content = readText(root, relativePath, errors);
    if (content && sha256(content) !== expectedHash) {
      errors.push(`${relativePath}: active-Goal reviewed document SHA-256 drift`);
    }
  }
  return errors;
}

export function collectChangedPaths(root, diffBase, errors = []) {
  const changedPaths = new Set(
    readGitPaths(
      root,
      [
        'diff',
        '--no-renames',
        '--name-only',
        '-z',
        '--diff-filter=ACDMRTUXB',
        `${diffBase}...HEAD`,
      ],
      `committed diff from ${diffBase}`,
      errors,
    ),
  );
  for (const relativePath of readGitPaths(
    root,
    ['diff', '--no-renames', '--name-only', '-z', '--diff-filter=ACDMRTUXB', 'HEAD'],
    'working-tree diff',
    errors,
  )) {
    changedPaths.add(relativePath);
  }
  for (const relativePath of readGitPaths(
    root,
    ['ls-files', '-z', '--others', '--exclude-standard'],
    'untracked-file inventory',
    errors,
  )) {
    changedPaths.add(relativePath);
  }
  return [...changedPaths];
}

function validateGoalDiffScope(root, goalSemantics, errors) {
  const diffBase = resolveGoalDiffBase();
  if (!diffBase) return;
  if (!/^[A-Za-z0-9._/-]+$/.test(diffBase)) {
    errors.push(`Goal diff scope: invalid base reference ${JSON.stringify(diffBase)}`);
    return;
  }
  const allowedPaths = goalSemantics?.scope?.paths;
  if (!Array.isArray(allowedPaths) || allowedPaths.some(value => typeof value !== 'string')) {
    errors.push(`Goal diff scope: semantic scope.paths must be a string array`);
    return;
  }
  const changedPaths = collectChangedPaths(root, diffBase, errors);
  if (!shouldEnforceGoalDiffScope(changedPaths)) return;
  validateActiveGoalSharedDocuments(root, errors);
  validateChangedPaths([...changedPaths], allowedPaths, errors);
}

export function validateApplePlatformArchitecture(root = process.cwd(), options = {}) {
  const errors = [];
  const yamlSemantics = resolveYamlSemantics(root, options?.yamlSemantics, errors);
  const yamlDocuments = yamlSemantics.documents;
  const contract = parseContract(root, errors);
  validateContract(contract, errors);
  const manifest = readText(root, MANIFEST_PATH, errors);
  validatePackageManifest(manifest, errors);
  validateDocuments(root, contract, errors, yamlDocuments[GOAL_PATH]);
  validateWebNativeFixture(root, contract, errors);
  validateAutomation(root, errors, yamlDocuments, yamlSemantics.rootKeys);
  validateGoalDiffScope(root, yamlDocuments[GOAL_PATH], errors);
  return errors;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const errors = validateApplePlatformArchitecture();
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }
  console.log('SEIS Apple platform architecture check passed: 5 roles, 2 products, 3 targets.');
}
