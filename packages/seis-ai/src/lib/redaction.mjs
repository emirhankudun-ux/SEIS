const SECRET_TOKEN_PATTERNS = [
  /\b(sk-[A-Za-z0-9]{12,})\b/g,
  /\b(gh[pouso]_[A-Za-z0-9]{12,})\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];

const PRIVATE_KEY_BLOCK_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY[\s\S]*?END [A-Z ]*PRIVATE KEY/gi;
const PRIVATE_KEY_LABEL_PATTERN = /\b(?:BEGIN|END) [A-Z ]*PRIVATE KEY\b/gi;
const SECRET_KEYWORD_PATTERN = /\b(api[_-]?key|token|password|credential|secret)\b/i;
const LONG_TOKEN_PATTERN = /(?<![A-Za-z0-9])(?=[a-z0-9_-]{24,}\b)(?=[a-z0-9_-]*\d)[a-z0-9_-]+\b/gi;

/**
 * Return true when text likely contains secret-like material.
 */
export function containsSecretMaterial(text, options = {}) {
  const normalized = String(text || '');
  const includeLongTokens = options.includeLongTokens ?? true;
  if (SECRET_KEYWORD_PATTERN.test(normalized)) {
    return true;
  }

  if (SECRET_TOKEN_PATTERNS.some((pattern) => hasMatch(pattern, normalized))) {
    return true;
  }

  if (PRIVATE_KEY_BLOCK_PATTERN.test(normalized) || PRIVATE_KEY_LABEL_PATTERN.test(normalized)) {
    return true;
  }

  if (includeLongTokens && LONG_TOKEN_PATTERN.test(normalized)) {
    return true;
  }

  return false;
}

function hasMatch(pattern, value) {
  const matcher = new RegExp(pattern.source, pattern.flags.replace('g', ''));
  return matcher.test(value);
}

/**
 * Redact known secret-like values in text output.
 */
export function redactSecretText(input, placeholder = '[REDACTED_SECRET]') {
  const normalized = String(input || '');

  if (!normalized) {
    return '';
  }

  return normalized
    .replace(PRIVATE_KEY_BLOCK_PATTERN, '[REDACTED_KEY]')
    .replace(PRIVATE_KEY_LABEL_PATTERN, '[REDACTED_KEY]')
    .replace(SECRET_TOKEN_PATTERNS[0], placeholder)
    .replace(SECRET_TOKEN_PATTERNS[1], placeholder)
    .replace(SECRET_TOKEN_PATTERNS[2], placeholder)
    .replace(/\b(api[_-]?key|token|password|credential|secret)\b/gi, placeholder)
    .replace(LONG_TOKEN_PATTERN, placeholder);
}
