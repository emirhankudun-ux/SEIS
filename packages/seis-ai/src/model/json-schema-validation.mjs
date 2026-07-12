import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const validatorCache = new WeakMap();

export function validateJsonSchema(schema, value) {
  const validator = getValidator(schema);
  const valid = validator(value);
  if (valid) return [];
  return (validator.errors || []).map(formatAjvError);
}

export function assertValidJsonSchema(schema) {
  getValidator(schema);
}

function getValidator(schema) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new Error('JSON Schema must be an object');
  }
  const cached = validatorCache.get(schema);
  if (cached) return cached;

  const ajv = new Ajv2020({
    allErrors: true,
    allowUnionTypes: true,
    strict: true,
    validateFormats: true,
  });
  addFormats(ajv);
  const validator = ajv.compile(schema);
  validatorCache.set(schema, validator);
  return validator;
}

function formatAjvError(error) {
  const instancePath = error.instancePath ? `$${error.instancePath}` : '$';
  const property = error.params?.missingProperty ? `.${error.params.missingProperty}` : '';
  return `${instancePath}${property}: ${error.message || error.keyword}`;
}
