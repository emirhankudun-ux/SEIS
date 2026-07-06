import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const registryPath = path.join(
  root,
  'packages/seis-ai/models/nvidia-nim-run-anywhere-downloadable-registry.json'
);
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

describe('NVIDIA NIM downloadable registry', () => {
  it('tracks only observed Download Available / Run Anywhere catalog refs', () => {
    assert.equal(registry.id, 'seis-nvidia-nim-run-anywhere-downloadable-registry');
    assert.equal(registry.status, 'metadata-only-downloadable-catalog');
    assert.equal(registry.sourceFilter.value, 'nim_type_run_anywhere');
    assert.equal(registry.modelRefs.length, registry.observedResultTotal);
    assert.equal(new Set(registry.modelRefs).size, registry.modelRefs.length);

    for (const modelRef of registry.modelRefs) {
      assert.match(modelRef, /^[a-z0-9-]+\/[a-z0-9._-]+$/);
    }
  });

  it('keeps downloads, providers, and runtime authority disabled', () => {
    assert.match(registry.truthBoundary, /downloads no model weights/);
    assert.equal(registry.installPolicy.downloadableCatalogOnly, true);
    assert.equal(registry.installPolicy.modelWeightsDownloaded, false);
    assert.equal(registry.installPolicy.ngcContainersPulled, false);
    assert.equal(registry.installPolicy.apiEndpointCalled, false);
    assert.equal(registry.installPolicy.runtimeEnabled, false);
    assert.equal(registry.installPolicy.secretsAllowedInRepo, false);
  });

  it('retains representative SEIS-relevant model references', () => {
    assert.ok(registry.modelRefs.includes('nvidia/nemotron-ocr-v2'));
    assert.ok(registry.modelRefs.includes('nvidia/nv-embedqa-e5-v5'));
    assert.ok(registry.modelRefs.includes('nvidia/nemoguard-jailbreak-detect'));
    assert.ok(registry.modelRefs.includes('meta/llama-3_1-8b-instruct'));
    assert.ok(registry.modelRefs.includes('openai/gpt-oss-20b'));
  });
});
