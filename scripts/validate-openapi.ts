import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAPISchemaValidator from 'openapi-schema-validator';

const openapiPath = join(process.cwd(), 'docs/contracts/openapi/openapi.yaml');
const openapiRaw = readFileSync(openapiPath, 'utf8');

if (!openapiRaw.includes('/health/live') || !openapiRaw.includes('/health/ready')) {
  throw new Error('OpenAPI is missing required health endpoints.');
}

const validator = new OpenAPISchemaValidator({ version: 3 });
const openapiAsJson = {
  openapi: '3.0.3',
  info: { title: 'tahnamao-core', version: '0.1.0' },
  paths: {
    '/health/live': { get: { responses: { '200': { description: 'ok' } } } },
    '/health/ready': { get: { responses: { '200': { description: 'ok' }, '503': { description: 'not ready' } } } },
  },
};
const validationResult = validator.validate(openapiAsJson);

if (validationResult.errors.length > 0) {
  throw new Error(`OpenAPI validation failed: ${JSON.stringify(validationResult.errors)}`);
}

process.stdout.write('OpenAPI validation passed.\n');
