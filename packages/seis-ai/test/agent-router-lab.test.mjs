import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  buildAgentRouterModelArtifact,
  loadAgentRouterDataset,
  predictAgentRoute,
  runAgentRouterModelEval,
  trainAgentRouterModel,
} from '../src/model/agent-router-lab.mjs';

const datasetPath = fileURLToPath(new URL('../data/agent-router-seed-v0.json', import.meta.url));

describe('SEIS Universe agent router learning lab', () => {
  it('loads dataset and builds deterministic model artifact', () => {
    const dataset = loadAgentRouterDataset(datasetPath);
    const artifact = buildAgentRouterModelArtifact(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');

    assert.equal(artifact.artifactId, 'seis-agent-router-seed-v0');
    assert.equal(artifact.model.modelFamily, 'seis-agent-router');
    assert.equal(artifact.eval.eval.ok, true);
    assert.equal(artifact.eval.eval.total, evalCases.length);
  });

  it('routes cloud-sensitive work to the cloud lane through the plugin integration tool', () => {
    const dataset = loadAgentRouterDataset(datasetPath);
    const model = trainAgentRouterModel(dataset);
    const prediction = predictAgentRoute(model, {
      text: 'Validate cloud SSH bootstrap rollback and provider readiness before deploy.',
      signals: ['cloud', 'ssh', 'rollback', 'provider'],
    });

    assert.equal(prediction.laneId, 'seis-cloud');
    assert.equal(prediction.toolName, 'seis_plugin_integration');
    assert.equal(prediction.defaultGate, 'npm run check:cloud-access-policy');
  });

  it('routes design and data work to separate lanes', () => {
    const dataset = loadAgentRouterDataset(datasetPath);
    const model = trainAgentRouterModel(dataset);

    const design = predictAgentRoute(model, {
      text: 'Review accessibility, responsive UI, motion, and dashboard layout.',
    });
    const data = predictAgentRoute(model, {
      text: 'Prepare dataset provenance, schema, memory retrieval, and training report.',
    });

    assert.equal(design.laneId, 'seis-design');
    assert.equal(data.laneId, 'seis-data');
  });

  it('routes specialist SEIS-Agent lanes for security, research, automation, and product work', () => {
    const dataset = loadAgentRouterDataset(datasetPath);
    const model = trainAgentRouterModel(dataset);

    const security = predictAgentRoute(model, {
      text: 'Review token redaction, vulnerability exposure, permission hardening, and security rollback risk.',
    });
    const research = predictAgentRoute(model, {
      text: 'Research official documentation, standards, source provenance, and version compatibility.',
    });
    const automation = predictAgentRoute(model, {
      text: 'Create an idempotent automation workflow with dry-run mode and runbook ownership.',
    });
    const product = predictAgentRoute(model, {
      text: 'Define product requirements, acceptance criteria, launch readiness, and user outcomes.',
    });

    assert.equal(security.laneId, 'seis-security');
    assert.equal(research.laneId, 'seis-research');
    assert.equal(automation.laneId, 'seis-automation');
    assert.equal(product.laneId, 'seis-product');
  });

  it('passes eval split with expected lane predictions for all seed cases', () => {
    const dataset = loadAgentRouterDataset(datasetPath);
    const model = trainAgentRouterModel(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');
    const report = runAgentRouterModelEval(model, evalCases);

    assert.equal(report.ok, true);
    assert.equal(report.passed, evalCases.length);
    assert.equal(report.failed.length, 0);
  });

  it('keeps deterministic routing for repeated inputs', () => {
    const dataset = loadAgentRouterDataset(datasetPath);
    const model = trainAgentRouterModel(dataset);
    const task = {
      text: 'Implement MCP runtime tests and package script coverage for the agent tool loop.',
    };

    assert.deepEqual(predictAgentRoute(model, task), predictAgentRoute(model, task));
  });
});
