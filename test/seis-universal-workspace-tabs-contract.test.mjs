import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const repositoryRootURL = new URL('../', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, repositoryRootURL), 'utf8');

const paths = {
  workspace: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift',
  commands: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/App/SeisUniversalWorkspaceCommands.swift',
  tabs: 'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspaceTabs.swift'
};

test('Universal Workspace exposes independent native tabs through focused commands', async () => {
  const [workspace, commands, tabs] = await Promise.all([
    read(paths.workspace),
    read(paths.commands),
    read(paths.tabs)
  ]);

  assert.match(tabs, /struct SeisUniversalWorkspaceTabs/);
  assert.match(tabs, /func openTab\(/);
  assert.match(tabs, /func closeTab\(/);
  assert.match(tabs, /func activateNextTab\(/);
  assert.match(tabs, /func activatePreviousTab\(/);
  assert.match(tabs, /updateActiveSearchQuery/);

  assert.match(workspace, /SeisUniversalWorkspaceTabs/);
  assert.match(workspace, /openWorkspaceTab/);
  assert.match(workspace, /closeWorkspaceTab/);
  assert.match(workspace, /activateWorkspaceTab/);
  assert.match(workspace, /workspaceTabStrip/);

  assert.match(commands, /newTab:/);
  assert.match(commands, /closeTab:/);
  assert.match(commands, /nextTab:/);
  assert.match(commands, /previousTab:/);
  assert.match(commands, /keyboardShortcut\("t", modifiers: \[\.command\]\)/);
  assert.match(commands, /keyboardShortcut\("w", modifiers: \[\.command\]\)/);
  assert.match(commands, /keyboardShortcut\(.+modifiers: \[\.control\]\)/s);

  const source = [workspace, commands, tabs].join('\n');
  for (const forbidden of [
    'URLSession',
    'Process(',
    'executeTool',
    'runShell',
    'allowsExternalMutation: true'
  ]) {
    assert.doesNotMatch(
      source,
      new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    );
  }
});
