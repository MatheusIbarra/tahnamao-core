import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const openapiPath = join(process.cwd(), 'docs/contracts/openapi/openapi.yaml');
const outputPath = join(
  process.cwd(),
  'docs/contracts/postman/tahnamao-core.postman_collection.json',
);

const openapiRaw = readFileSync(openapiPath, 'utf8');
if (!openapiRaw.includes('/health/live') || !openapiRaw.includes('/health/ready')) {
  throw new Error('OpenAPI file does not contain required health endpoints.');
}

const collection = {
  info: {
    name: 'tahnamao-core',
    _postman_id: 'c0cdb531-01df-47df-8af5-cffb14af9c71',
    description: 'Collection synchronized from OpenAPI contract.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'baseUrl', value: 'http://localhost:3000/api/v1' }],
  item: [
    {
      name: 'Health / Live',
      request: { method: 'GET', header: [], url: { raw: '{{baseUrl}}/health/live', host: ['{{baseUrl}}',], path: ['health', 'live'] } },
      response: [],
    },
    {
      name: 'Health / Ready',
      request: { method: 'GET', header: [], url: { raw: '{{baseUrl}}/health/ready', host: ['{{baseUrl}}',], path: ['health', 'ready'] } },
      response: [],
    },
  ],
};

writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8');
process.stdout.write(`Postman collection synchronized at ${outputPath}\n`);
