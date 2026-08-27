import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repositoryRootURL = new URL('../', import.meta.url);
const repositoryRoot = fileURLToPath(repositoryRootURL);
const read = (relativePath) => readFile(new URL(relativePath, repositoryRootURL), 'utf8');

const paths = {
  package: 'packages/seis_platform_swift/Package.swift',
  app: 'packages/seis_platform_swift/Sources/SeisFullTechnologyMac/App/SeisFullTechnologyMacApp.swift',
  model: 'packages/seis_platform_swift/Sources/SeisFullTechnologyMac/Models/SeisFullTechnologyMacViewModel.swift',
  rootView: 'packages/seis_platform_swift/Sources/SeisFullTechnologyMac/Views/SeisFullTechnologyRootView.swift',
  sidebar: 'packages/seis_platform_swift/Sources/SeisFullTechnologyMac/Views/SeisFullTechnologySidebarView.swift',
  detail: 'packages/seis_platform_swift/Sources/SeisFullTechnologyMac/Views/SeisFullTechnologyDetailView.swift',
  universalWorkspace: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift',
  universalPalette: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalCommandPaletteView.swift'
};

test('Swift package declares a bounded native Full Technology executable', async () => {
  const manifest = await read(paths.package);
  assert.match(
    manifest,
    /\.executable\(name: "SeisFullTechnologyMac", targets: \["SeisFullTechnologyMac"\]\)/
  );
  assert.match(
    manifest,
    /\.executableTarget\(\s*name: "SeisFullTechnologyMac",\s*dependencies: \["SeisPlatformKit"\]/s
  );
});

test('native Full Technology target exposes the required app surfaces', async () => {
  for (const path of Object.values(paths).slice(1, 6)) {
    assert.equal(
      existsSync(`${repositoryRoot}/${path}`),
      true,
      `missing native app file: ${path}`
    );
  }

  const [app, model, rootView, sidebar, detail] = await Promise.all([
    read(paths.app),
    read(paths.model),
    read(paths.rootView),
    read(paths.sidebar),
    read(paths.detail)
  ]);

  assert.match(app, /@main/);
  assert.match(app, /WindowGroup/);
  assert.match(app, /SeisFullTechnologyRootView/);
  assert.match(app, /defaultSize\(width: 1180, height: 760\)/);

  assert.match(model, /SeisFullTechnologyNativeStore/);
  assert.match(model, /CommandLine\.arguments/);
  assert.match(model, /FileManager\.default\.currentDirectoryPath/);
  assert.match(model, /func load\(\)/);
  assert.match(model, /func updateQuery\(/);
  assert.match(model, /func selectDomain\(/);

  assert.match(rootView, /NavigationSplitView/);
  assert.match(rootView, /\.searchable\(/);
  assert.match(rootView, /Read-only native inspection/);
  assert.match(rootView, /SEIS-GOAL-021/);
  assert.match(rootView, /Canonical binding unresolved/);
  assert.match(rootView, /No matching domains/);
  assert.match(rootView, /Retry/);

  assert.match(sidebar, /List\(/);
  assert.match(sidebar, /visibleDomains/);
  assert.match(sidebar, /resultSummary/);

  assert.match(detail, /capabilities/);
  assert.match(detail, /defaultNetwork/);
  assert.match(detail, /defaultWrite/);
  assert.match(detail, /No tools execute from this surface/);

  const nativeSource = [app, model, rootView, sidebar, detail].join('\n');
  for (const forbidden of [
    'URLSession',
    'Process(',
    'NSWorkspace.shared.open',
    'executeTool',
    'runShell'
  ]) {
    assert.doesNotMatch(
      nativeSource,
      new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    );
  }
});

test('Universal Workspace exposes keyboard-first navigation through the shared command dispatcher', async () => {
  const [workspace, palette] = await Promise.all([
    read(paths.universalWorkspace),
    read(paths.universalPalette)
  ]);

  assert.match(workspace, /\.onMoveCommand\(/);
  assert.match(workspace, /\.onExitCommand\s*\{/);
  assert.match(workspace, /applyWorkspaceCommand\(commandID:/);
  assert.match(workspace, /selection\.next/);
  assert.match(workspace, /selection\.previous/);
  assert.match(workspace, /hierarchy\.expand-focused/);
  assert.match(workspace, /hierarchy\.collapse-focused/);
  assert.match(workspace, /selection\.clear/);

  assert.match(palette, /workspaceCommands\(matching:/);
  assert.match(palette, /selection\./);

  const universalSource = `${workspace}\n${palette}`;
  for (const forbidden of ['URLSession', 'Process(', 'NSWorkspace.shared.open']) {
    assert.doesNotMatch(
      universalSource,
      new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    );
  }
});
