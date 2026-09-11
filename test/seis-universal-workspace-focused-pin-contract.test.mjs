import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const repositoryRootURL = new URL('../', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, repositoryRootURL), 'utf8');

const workspacePath = 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift';

test('Universal Viewport exposes a local pin toggle for the focused selection', async () => {
  const workspace = await read(workspacePath);

  assert.match(workspace, /toggleFocusedSelectionPin/);
  assert.match(workspace, /selectionShelf\?\.isPinned/);
  assert.match(workspace, /pin\.fill/);
  assert.match(workspace, /pin\.slash/);
  assert.match(workspace, /focusedNodeID/);

  for (const forbidden of [
    'URLSession',
    'Process(',
    'executeTool',
    'runShell',
    'allowsExternalMutation: true'
  ]) {
    assert.doesNotMatch(
      workspace,
      new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    );
  }
});
