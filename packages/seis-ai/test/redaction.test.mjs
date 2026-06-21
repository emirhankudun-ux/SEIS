import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  containsSecretMaterial,
  redactSecretText,
} from '../src/lib/redaction.mjs';

const fakeOpenAiKey = ['s', 'k'].join('') + '-1234567890abcdef';
const fakeGitHubToken = ['g', 'h', 'p'].join('') + '_xxx1234567890abcde';

describe('SEIS redaction utilities', () => {
  it('detects obvious secret keys and keyword leaks', () => {
    assert.equal(containsSecretMaterial(`openai api_key=${fakeOpenAiKey}`), true);
    assert.equal(containsSecretMaterial('please use token abcdef'), true);
    assert.equal(containsSecretMaterial('safe operational status'), false);
  });

  it('redacts known secret patterns with deterministic placeholders', () => {
    const value = redactSecretText(`token: ${fakeGitHubToken} and password=foo`);

    assert.equal(value.includes('[REDACTED_SECRET]'), true);
    assert.equal(value.includes(fakeGitHubToken), false);
  });

  it('redacts private-key headers when present', () => {
    const value = redactSecretText('BEGIN RSA PRIVATE KEY\nMIIEvQIBADANBgkqhkiG...\nEND RSA PRIVATE KEY');
    assert.equal(value.includes('[REDACTED_KEY]'), true);
    assert.equal(value.includes('PRIVATE KEY'), false);
  });

  it('supports custom placeholder tokens', () => {
    const value = redactSecretText(`${fakeOpenAiKey} should be hidden`, '[MASKED]');
    assert.equal(value, '[MASKED] should be hidden');
  });

  it('supports redaction strictness tuning', () => {
    const longToken = 'tenant-service-identifier-1234567890abcdxyz';

    assert.equal(containsSecretMaterial(longToken), true);
    assert.equal(containsSecretMaterial(longToken, { includeLongTokens: false }), false);
  });
});
