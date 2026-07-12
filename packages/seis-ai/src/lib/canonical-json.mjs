export function canonicalJsonStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(entry => canonicalJsonStringify(entry)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJsonStringify(value[key])}`)
      .join(',')}}`;
  }

  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError('canonical JSON does not support undefined values');
  }
  return serialized;
}
