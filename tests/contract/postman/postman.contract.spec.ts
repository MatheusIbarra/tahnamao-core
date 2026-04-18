import { readFileSync } from 'fs';
import { join } from 'path';

describe('Postman contract', () => {
  it('contains health requests synchronized with API contract', () => {
    const collectionRaw = readFileSync(
      join(process.cwd(), 'docs/contracts/postman/tahnamao-core.postman_collection.json'),
      'utf-8',
    );
    const collection = JSON.parse(collectionRaw) as {
      item: Array<{ name: string; request: { url: { raw: string } } }>;
    };

    const urls = collection.item.map((item) => item.request.url.raw);
    expect(urls).toContain('{{baseUrl}}/health/live');
    expect(urls).toContain('{{baseUrl}}/health/ready');
  });
});
