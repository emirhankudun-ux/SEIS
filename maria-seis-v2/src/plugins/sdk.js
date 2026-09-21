/** Manifest validation is metadata hygiene, NOT a sandbox or permission grant. */
export function validatePluginManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return {valid:false,errors:['manifest must be an object']};
  if (typeof manifest.id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(manifest.id)) errors.push('invalid id');
  if (typeof manifest.name !== 'string' || !manifest.name.trim() || manifest.name.length > 120) errors.push('invalid name');
  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(manifest.version)) errors.push('invalid version');
  const caps = manifest.capabilities;
  if (!Array.isArray(caps) || !caps.length || caps.length > 32 || caps.some(c => typeof c !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(c)) || new Set(caps).size !== caps.length) errors.push('invalid capabilities');
  if (!['observe','safe','modify','high'].includes(manifest.risk)) errors.push('invalid risk');
  return {valid:errors.length === 0,errors};
}
export function defineMariaPlugin(manifest, factory) {
  const check = validatePluginManifest(manifest);
  if (!check.valid) throw new TypeError(`Invalid MARIA plugin: ${check.errors.join(', ')}`);
  if (typeof factory !== 'function') throw new TypeError('Plugin factory must be callable');
  const metadata = Object.freeze({id:manifest.id,name:manifest.name,version:manifest.version,
    risk:manifest.risk,capabilities:Object.freeze([...manifest.capabilities])});
  return Object.freeze({manifest:metadata,create:factory});
}
