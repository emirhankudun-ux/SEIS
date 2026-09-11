const ALLOWED = Object.freeze(['projectId','mode','localFirst','allowCloud','safeMode','executionMode']);
const sanitize = input => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const key of ALLOWED) {
    const value = input[key];
    if (typeof value === 'string' || typeof value === 'boolean') out[key] = value;
  }
  return out;
};
export function createSafePreferences(storage, namespace='maria-seis') {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') throw new TypeError('Storage adapter required');
  const key = `${namespace}:preferences:v1`;
  return Object.freeze({
    save(input) { const safe=sanitize(input); storage.setItem(key,JSON.stringify(safe)); return structuredClone(safe); },
    load(defaults={}) {
      const fallback=sanitize(defaults);
      try { const raw=storage.getItem(key); if (!raw) return structuredClone(fallback); return {...fallback,...sanitize(JSON.parse(raw))}; }
      catch { return structuredClone(fallback); }
    },
    key
  });
}
