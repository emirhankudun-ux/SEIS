import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  containsSecretMaterial,
  redactSecretText,
} from '../src/lib/redaction.mjs';

describe('SEIS redaction utilities', () => {
  it('detects obvious secret keys and keyword leaks', () => {
    assert.equal(containsSecretMaterial('openai api_key=sk-1234567890abcdef'), true);
    assert.equal(containsSecretMaterial('please use token abcdef'), true);
    assert.equal(containsSecretMaterial('safe operational status'), false);
  });

  it('redacts known secret patterns with deterministic placeholders', () => {
    const value = redactSecretText('token: ghp_xxx1234567890abcde and password=foo');

    assert.equal(value.includes('[REDACTED_SECRET]'), true);
    assert.equal(value.includes('ghp_xxx1234567890abcde'), false);
  });

  it('redacts private-key headers when present', () => {
    const value = redactSecretText('BEGIN RSA PRIVATE KEY\nMIIEvQIBADANBgkqhkiG...\nEND RSA PRIVATE KEY');
    assert.equal(value.includes('[REDACTED_KEY]'), true);
    assert.equal(value.includes('PRIVATE KEY'), false);
  });

  it('supports custom placeholder tokens', () => {
    const value = redactSecretText('sk-1234567890abcdef should be hidden', '[MASKED]');
    assert.equal(value, '[MASKED] should be hidden');
  });

  it('supports redaction strictness tuning', () => {
    const longToken = 'tenant-service-identifier-1234567890abcdxyz';

    assert.equal(containsSecretMaterial(longToken), true);
    assert.equal(containsSecretMaterial(longToken, { includeLongTokens: false }), false);
  });
});
