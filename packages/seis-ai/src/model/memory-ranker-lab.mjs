import { readFileSync } from 'node:fs';

const MIN_TERM_LENGTH = 2;
const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'from',
  'with',
  'that',
  'this',
  'when',
  'before',
  'what',
  'how',
  'are',
  'is',
  'a',
  'an',
  'to',
  'in',
  'of',
  'on',
  'or',
  'by',
  'at',
  'it',
  'we',
  'i',
  'first',
  'seis',
  'where',
  'which',
  'should',
  'do',
  'did',
  'if',
  'it',
  'also',
  'then',
  'than',
]);

function normalizeTerm(term) {
  return String(term || '')
    .toLowerCase()
    .trim();
}

function tokenize(text = '') {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s_-]/g, ' ');
  return normalized
    .split(/\s+/)
    .map(normalizeTerm)
    .filter(term => term.length >= MIN_TERM_LENGTH && !STOP_WORDS.has(term));
}

function uniqueSortedTerms(terms) {
  return [...new Set(terms)].sort();
}

function profileCandidate(candidate) {
  const titleTerms = uniqueSortedTerms(tokenize(candidate.title || ''));
  const summaryTerms = uniqueSortedTerms(tokenize(candidate.summary || ''));
  const topicTerms = uniqueSortedTerms(tokenize((candidate.topics || []).join(' ')));
  const sourceTerms = uniqueSortedTerms(tokenize(candidate.source || ''));
  const terms = uniqueSortedTerms([
    ...titleTerms,
    ...summaryTerms,
    ...topicTerms,
    ...sourceTerms,
  ]);

  return {
    id: candidate.id,
    title: candidate.title || candidate.id,
    titleTerms,
    summaryTerms,
    topicTerms,
    sourceTerms,
    terms,
    termWeights: terms.reduce((acc, term) => {
      acc[term] = 1;
      return acc;
    }, {}),
  };
}

function vectorIncrement(target, keys, amount) {
  for (const key of keys) {
    target[key] = (target[key] || 0) + amount;
  }
}

export function loadMemoryRankerDataset(datasetPath) {
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
  validateDataset(dataset);
  return dataset;
}

export function trainMemoryRankerModel(dataset) {
  validateDataset(dataset);

  const trainCases = dataset.cases.filter(item => item.split === 'train');
  const candidateWeights = {};
  const candidatePrior = {};
  const queryWeights = {};
  const candidatesCatalog = {};
  const vocabulary = new Set();

  for (const item of trainCases) {
    const queryTerms = tokenize(item.query.text || '');
    const expected = new Set(item.expectedOrder);
    const available = new Set();

    for (const candidate of item.candidates) {
      if (!candidate || typeof candidate.id !== 'string') {
        throw new Error(`invalid candidate payload in dataset case: ${item.id}`);
      }

      const profile = profileCandidate(candidate);
      candidatesCatalog[candidate.id] = {
        title: candidate.title || candidate.id,
        source: candidate.source || '',
        terms: profile.terms,
        titleTerms: profile.titleTerms,
        summaryTerms: profile.summaryTerms,
        topicTerms: profile.topicTerms,
        sourceTerms: profile.sourceTerms,
      };

      candidatePrior[candidate.id] = (candidatePrior[candidate.id] || 0) + 1;
      for (const term of profile.terms) {
        vocabulary.add(term);
      }

      available.add(candidate.id);
    }

    for (const expectedId of expected) {
      if (!available.has(expectedId)) {
        throw new Error(`expected candidate ${expectedId} not present in case ${item.id}`);
      }
      candidatePrior[expectedId] += 1;
    }

    const positiveCandidates = item.candidates.filter(candidate => expected.has(candidate.id));
    for (const candidate of positiveCandidates) {
      const positiveProfile = profileCandidate(candidate);
      candidateWeights[candidate.id] = candidateWeights[candidate.id] || {};

      vectorIncrement(
        candidateWeights[candidate.id],
        [...queryTerms, ...positiveProfile.terms],
        1,
      );
      for (const term of [...queryTerms, ...positiveProfile.terms]) {
        vocabulary.add(term);
      }
    }

    for (const term of queryTerms) {
      vectorIncrement(queryWeights, [term], 0.5);
    }
  }

  const weightsByCandidate = Object.entries(candidateWeights)
    .sort(([left], [right]) => left.localeCompare(right))
    .reduce((acc, [candidateId, weights]) => {
      acc[candidateId] = Object.fromEntries(
        Object.entries(weights)
          .sort(([left], [right]) => left.localeCompare(right)),
      );
      return acc;
    }, {});

  const priorByCandidate = Object.entries(candidatePrior)
    .sort(([left], [right]) => left.localeCompare(right))
    .reduce((acc, [candidateId, count]) => {
      acc[candidateId] = count;
      return acc;
    }, {});

  return {
    modelId: 'seis-memory-ranker-seed-v0',
    modelFamily: 'seis-memory-ranker',
    version: dataset.version,
    datasetId: dataset.datasetId,
    trainingCaseCount: trainCases.length,
    vocabulary: [...vocabulary].sort(),
    candidateProfiles: Object.entries(candidatesCatalog)
      .sort(([left], [right]) => left.localeCompare(right))
      .reduce((acc, [candidateId, profile]) => {
        acc[candidateId] = profile;
        return acc;
      }, {}),
    candidateWeights: weightsByCandidate,
    candidatePrior: priorByCandidate,
    queryWeights: Object.fromEntries(Object.entries(queryWeights).sort()),
  };
}

export function rankMemoryCandidates(model, query, candidates, options = {}) {
  const topK = options.topK ?? candidates.length;
  const queryText = typeof query === 'string' ? query : query.text;
  const queryTerms = tokenize(queryText || '');
  const queryTermSet = new Set(queryTerms);

  const ranking = candidates
    .map(candidate => {
      const profile = profileCandidate(candidate);
      let weightedScore = 0;
      const hitSet = new Set();
      const hitTerms = [];
      let titleMatchCount = 0;
      let summaryMatchCount = 0;
      let topicMatchCount = 0;
      let sourceMatchCount = 0;

      for (const term of queryTerms) {
        if (profile.titleTerms.includes(term)) {
          hitSet.add(term);
          hitTerms.push(term);
          weightedScore += 4.8;
          titleMatchCount += 1;
        } else if (profile.summaryTerms.includes(term)) {
          hitSet.add(term);
          hitTerms.push(term);
          weightedScore += 3.1;
          summaryMatchCount += 1;
        } else if (profile.topicTerms.includes(term)) {
          hitSet.add(term);
          hitTerms.push(term);
          weightedScore += 1.9;
          topicMatchCount += 1;
        } else if (profile.sourceTerms.includes(term)) {
          hitSet.add(term);
          hitTerms.push(term);
          weightedScore += 1.2;
          sourceMatchCount += 1;
        } else if (profile.termWeights[term]) {
          hitTerms.push(term);
          weightedScore += 2.6;
          hitSet.add(term);
        }
        weightedScore += model.queryWeights[term] || 0;
        weightedScore += (model.candidateWeights[candidate.id]?.[term] || 0) * 0.4;
      }

      const matchedTerms = hitSet.size;

      if (matchedTerms === 0 && (model.candidatePrior[candidate.id] || 0) > 0) {
        weightedScore += Math.min(1.25, (model.candidatePrior[candidate.id] || 0) * 0.08);
      }

      weightedScore += (model.candidatePrior[candidate.id] || 0) * 0.03;
      weightedScore += hitSet.size * 0.05;

      return {
        id: candidate.id,
        title: candidate.title || candidate.id,
        score: Number(weightedScore.toFixed(6)),
        matchedTerms: Array.from(hitSet),
        matchedTermCount: matchedTerms,
        titleMatchCount,
        summaryMatchCount,
        topicMatchCount,
        sourceMatchCount,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.matchedTermCount !== left.matchedTermCount) {
        return right.matchedTermCount - left.matchedTermCount;
      }
      if (right.titleMatchCount !== left.titleMatchCount) {
        return right.titleMatchCount - left.titleMatchCount;
      }
      if (right.summaryMatchCount !== left.summaryMatchCount) {
        return right.summaryMatchCount - left.summaryMatchCount;
      }
      if (right.topicMatchCount !== left.topicMatchCount) {
        return right.topicMatchCount - left.topicMatchCount;
      }
      if (right.sourceMatchCount !== left.sourceMatchCount) {
        return right.sourceMatchCount - left.sourceMatchCount;
      }
      return left.title.localeCompare(right.title);
    });

  return {
    query: typeof query === 'string' ? { id: 'inline-query', text: query } : query,
    topK: Math.min(topK, ranking.length),
    ranking: ranking.slice(0, topK).map(item => ({
      candidateId: item.id,
      title: item.title,
      score: item.score,
      matchedTerms: item.matchedTerms,
      matchedTermCount: item.matchedTermCount,
    })),
    queryTerms: queryTermSet ? [...queryTermSet].sort() : [],
    candidateCount: ranking.length,
  };
}

export function runMemoryRankerModelEval(model, cases) {
  const results = cases.map(item => {
    const prediction = rankMemoryCandidates(model, item.query, item.candidates, {
      topK: Math.max(item.expectedOrder.length, 3),
    });

    const expected = item.expectedOrder || [];
    const passedTop1 = expected[0] === prediction.ranking[0].candidateId;
    const intersection = expected.filter(id =>
      prediction.ranking.some(item => item.candidateId === id),
    );

    const precisionAtK = expected.length === 0 ? 0 : intersection.length / expected.length;
    const reciprocalRank =
      intersection.length === 0
        ? 0
        : 1 / (prediction.ranking.findIndex(item => item.candidateId === expected[0]) + 1);

    return {
      id: item.id,
      split: item.split,
      expected: expected[0],
      predicted: prediction.ranking[0]?.candidateId || null,
      topKPredicted: prediction.ranking.map(item => item.candidateId),
      passedTop1,
      precisionAtK,
      reciprocalRank,
    };
  });

  const top1Passed = results.filter(item => item.passedTop1);
  const top1Accuracy = results.length === 0 ? 0 : top1Passed.length / results.length;
  const averageReciprocalRank =
    results.length === 0 ? 0 : results.reduce((sum, item) => sum + item.reciprocalRank, 0) / results.length;

  return {
    ok: results.every(item => item.passedTop1),
    top1Accuracy: Number(top1Accuracy.toFixed(6)),
    averageReciprocalRank: Number(averageReciprocalRank.toFixed(6)),
    total: results.length,
    passedTop1: top1Passed.length,
    results: results.map(item => ({ id: item.id, ...item })),
    failed: results.filter(item => !item.passedTop1).map(item => ({
      id: item.id,
      split: item.split,
      expected: item.expected,
      actual: item.predicted,
      topKPredicted: item.topKPredicted,
      top1Accuracy: item.passedTop1 ? 1 : 0,
    })),
  };
}

export function buildMemoryRankerModelArtifact(dataset) {
  const model = trainMemoryRankerModel(dataset);
  const evalCases = dataset.cases.filter(item => item.split === 'eval');
  const trainCases = dataset.cases.filter(item => item.split === 'train');

  return {
    artifactId: 'seis-memory-ranker-seed-v0',
    artifactType: 'seis-owned-local-retrieval-experiment',
    dataset: {
      datasetId: dataset.datasetId,
      version: dataset.version,
      sourceClass: dataset.sourceClass,
      consent: dataset.consent,
    },
    model,
    eval: {
      train: summarizeEval(runMemoryRankerModelEval(model, trainCases)),
      eval: summarizeEval(runMemoryRankerModelEval(model, evalCases)),
    },
  };
}

function summarizeEval(report) {
  return {
    ok: report.ok,
    total: report.total,
    passedTop1: report.passedTop1,
    top1Accuracy: report.top1Accuracy,
    averageReciprocalRank: report.averageReciprocalRank,
  };
}

function validateDataset(dataset) {
  if (!dataset || typeof dataset !== 'object') {
    throw new TypeError('dataset must be an object');
  }
  if (typeof dataset.datasetId !== 'string' || dataset.datasetId.length === 0) {
    throw new Error('dataset must declare a datasetId');
  }
  if (!Array.isArray(dataset.cases) || dataset.cases.length === 0) {
    throw new Error('dataset must include at least one case');
  }

  const ids = new Set();

  for (const item of dataset.cases) {
    if (!item.id || ids.has(item.id)) {
      throw new Error(`invalid or duplicate dataset case id: ${item.id}`);
    }
    ids.add(item.id);

    if (!['train', 'eval'].includes(item.split)) {
      throw new Error(`invalid split for dataset case: ${item.id}`);
    }
    if (!item.query || typeof item.query.text !== 'string' || item.query.text.length === 0) {
      throw new Error(`invalid query in dataset case: ${item.id}`);
    }
    if (!Array.isArray(item.candidates) || item.candidates.length < 2) {
      throw new Error(`dataset case must include at least two candidates: ${item.id}`);
    }
    if (!Array.isArray(item.expectedOrder) || item.expectedOrder.length === 0) {
      throw new Error(`dataset case must include expectedOrder: ${item.id}`);
    }

    const candidateIds = new Set();
    for (const candidate of item.candidates) {
      if (!candidate.id || typeof candidate.id !== 'string') {
        throw new Error(`candidate must have string id in case: ${item.id}`);
      }
      if (candidateIds.has(candidate.id)) {
        throw new Error(`duplicate candidate id in case: ${item.id} -> ${candidate.id}`);
      }
      candidateIds.add(candidate.id);
    }

    for (const expectedId of item.expectedOrder) {
      if (!candidateIds.has(expectedId)) {
        throw new Error(`expected candidate ${expectedId} missing from case: ${item.id}`);
      }
    }
  }
}
