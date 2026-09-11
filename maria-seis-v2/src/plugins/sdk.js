const requiredFields = ['id','name','version','capabilities','risk'];
export function validatePluginManifest(manifest) {
  const missing = requiredFields.filter(key => manifest?.[key] == null);
  if (missing.length) return { valid:false, errors:missing.map(key=>`Missing ${key}`) };
  if (!Array.isArray(manifest.capabilities) || !manifest.capabilities.length) return { valid:false, errors:['capabilities must be a non-empty array'] };
  if (!['observe','safe','modify','high'].includes(manifest.risk)) return { valid:false, errors:['invalid risk classification'] };
  return { valid:true, errors:[] };
}
export function defineMariaPlugin(manifest, factory) {
  const check = validatePluginManifest(manifest);
  if (!check.valid) throw new Error(`Invalid MARIA plugin: ${check.errors.join(', ')}`);
  return Object.freeze({ manifest:Object.freeze({...manifest}), create:factory });
}
