const CREDENTIAL_VALUE_PATTERNS = [
  {
    id: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  },
  {
    id: 'provider-or-platform-token',
    pattern:
      /\b(?:hf_[A-Za-z0-9]{20,}|sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|(?:AKIA|ASIA)[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[A-Za-z0-9-]{20,})\b/,
  },
  {
    id: 'bearer-token',
    pattern: /\bBearer\s+[A-Za-z0-9._~+/-]{20,}={0,2}\b/i,
  },
  {
    id: 'jwt',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    id: 'credential-uri',
    pattern: /[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^/\s@]+@/i,
  },
];

const SENSITIVE_VALUE_KEY_PATTERN =
  /^(?:api[-_]?key|access[-_]?key|private[-_]?key|token|password|secret)$/i;

export function assertNoCredentialLikeJsonContent(rawContent, parsedContent, options = {}) {
  const label = options.label || 'JSON record';
  assertNoCredentialPattern(String(rawContent || ''), label);

  const queue = [parsedContent];
  while (queue.length > 0) {
    const value = queue.pop();
    if (typeof value === 'string') {
      assertNoCredentialPattern(value, label);
      continue;
    }
    if (!value || typeof value !== 'object') continue;
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_VALUE_KEY_PATTERN.test(key) && typeof child === 'string' && child.trim()) {
        throw new Error(`${label} contains a value in blocked credential field: ${key}`);
      }
      if (child !== null && (typeof child === 'object' || typeof child === 'string')) {
        queue.push(child);
      }
    }
  }
}

function assertNoCredentialPattern(value, label) {
  for (const candidate of CREDENTIAL_VALUE_PATTERNS) {
    if (candidate.pattern.test(value)) {
      throw new Error(`${label} contains a blocked credential category: ${candidate.id}`);
    }
  }
}
