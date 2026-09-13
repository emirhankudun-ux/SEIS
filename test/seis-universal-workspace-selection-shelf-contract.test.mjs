import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const repositoryRootURL = new URL('../', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, repositoryRootURL), 'utf8');

const paths = {
  workspace: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift',
  shelfView: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalSelectionShelfView.swift',
  shelfModel: 'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspaceSelectionShelf.swift'
};

test('Universal Workspace exposes local recent and pinned selections without execution authority', async () => {
  const [workspace, shelfView, shelfModel] = await Promise.all([
    read(paths.workspace),
    read(paths.shelfView),
    read(paths.shelfModel)
  ]);

  assert.match(shelfModel, /struct SeisUniversalWorkspaceSelectionShelf/);
  assert.match(shelfModel, /recentNodeIDs/);
  assert.match(shelfModel, /pinnedNodeIDs/);
  assert.match(shelfModel, /recordSelection/);
  assert.match(shelfModel, /togglePin/);

  assert.match(workspace, /SeisUniversalWorkspaceSelectionShelf/);
  assert.match(workspace, /selectionShelfView/);
  assert.match(workspace, /recordShelfSelection/);
  assert.match(workspace, /togglePinnedSelection/);

  assert.match(shelfView, /Pinned/);
  assert.match(shelfView, /Recent/);
  assert.match(shelfView, /onSelect/);
  assert.match(shelfView, /onTogglePin/);

  const source = [workspace, shelfView, shelfModel].join('\n');
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
