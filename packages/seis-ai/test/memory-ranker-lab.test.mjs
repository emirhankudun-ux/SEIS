import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  buildMemoryRankerModelArtifact,
  loadMemoryRankerDataset,
  rankMemoryCandidates,
  runMemoryRankerModelEval,
  trainMemoryRankerModel,
} from '../src/model/memory-ranker-lab.mjs';

const datasetPath = fileURLToPath(new URL('../data/memory-ranker-seed-v0.json', import.meta.url));

describe('SEIS Universe memory ranker learning lab', () => {
  it('loads dataset and builds deterministic model artifact', () => {
    const dataset = loadMemoryRankerDataset(datasetPath);
    const artifact = buildMemoryRankerModelArtifact(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');

    assert.equal(artifact.artifactId, 'seis-memory-ranker-seed-v0');
    assert.equal(artifact.model.modelFamily, 'seis-memory-ranker');
    assert.equal(artifact.eval.eval.ok, true);
    assert.equal(artifact.eval.eval.total, evalCases.length);
  });

  it('uses learned candidate-term signals to rank governance evidence first', () => {
    const dataset = loadMemoryRankerDataset(datasetPath);
    const model = trainMemoryRankerModel(dataset);
    const caseExample = dataset.cases.find(item => item.id === 'eval-memory-rank');

    const prediction = rankMemoryCandidates(model, caseExample.query.text, caseExample.candidates, {
      topK: 2,
    });

    assert.ok(prediction.ranking.length > 0);
    assert.equal(prediction.ranking[0].candidateId, caseExample.expectedOrder[0]);
  });

  it('passes eval split with expected top-1 retrieval for all seed cases', () => {
    const dataset = loadMemoryRankerDataset(datasetPath);
    const model = trainMemoryRankerModel(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');
    const report = runMemoryRankerModelEval(model, evalCases);

    assert.equal(report.ok, true);
    assert.equal(report.passedTop1, evalCases.length);
    assert.equal(report.failed.length, 0);
    assert.equal(report.top1Accuracy, 1);
  });

  it('provides deterministic tie handling and stable top-k output', () => {
    const dataset = loadMemoryRankerDataset(datasetPath);
    const model = trainMemoryRankerModel(dataset);
    const caseExample = dataset.cases.find(item => item.id === 'eval-governance-routes');
    const first = rankMemoryCandidates(model, caseExample.query.text, caseExample.candidates, { topK: 3 });
    const second = rankMemoryCandidates(model, caseExample.query.text, caseExample.candidates, { topK: 3 });

    assert.deepEqual(first.ranking, second.ranking);
    assert.equal(first.ranking.length, 3);
  });
});
