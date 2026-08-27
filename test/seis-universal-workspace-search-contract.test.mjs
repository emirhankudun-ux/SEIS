import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const paths = {
  workspace: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisAppleUniversalWorkspaceView.swift',
  hierarchy: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/UniversalWorkspace/SeisUniversalHierarchyView.swift',
  commands: 'packages/seis_platform_swift/Sources/SeisAppleNativeShell/App/SeisUniversalWorkspaceCommands.swift',
  searchState: 'packages/seis_platform_swift/Sources/SeisPlatformKit/SeisUniversalWorkspaceSearchState.swift'
};

test('Universal Workspace exposes one shared read-only search projection', async () => {
  const [workspace, hierarchy, commands, searchState] = await Promise.all([
    read(paths.workspace),
    read(paths.hierarchy),
    read(paths.commands),
    read(paths.searchState)
  ]);

  assert.match(workspace, /SeisUniversalWorkspaceSearchState/);
  assert.match(workspace, /@FocusState private var isSearchFocused/);
  assert.match(workspace, /TextField\("Filter workspace"/);
  assert.match(workspace, /searchProjection\(for:/);
  assert.match(workspace, /Current selection is hidden by filter/);
  assert.match(workspace, /focusSearch:/);

  assert.match(hierarchy, /let projection: SeisUniversalHierarchyProjection/);
  assert.match(hierarchy, /ForEach\(projection\.rootNodeIDs/);
  assert.match(hierarchy, /projection\.childNodeIDs\(for:/);

  assert.match(commands, /Button\("Find in Workspace"\)/);
  assert.match(commands, /keyboardShortcut\("f", modifiers: \[\.command\]\)/);

  assert.match(searchState, /public struct SeisUniversalWorkspaceSearchState: Sendable/);
  assert.match(searchState, /hierarchyProjection\(/);
  assert.match(searchState, /func contains\(nodeID:/);

  const scopedSource = [workspace, hierarchy, commands, searchState].join('\n');
  for (const forbidden of [
    'URLSession',
    'Process(',
    'executeTool',
    'runShell',
    'allowsExternalMutation: true'
  ]) {
    assert.doesNotMatch(scopedSource, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
