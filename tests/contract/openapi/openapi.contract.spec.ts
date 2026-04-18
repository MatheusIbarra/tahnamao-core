import { readFileSync } from 'fs';
import { join } from 'path';

describe('OpenAPI contract', () => {
  it('contains required health endpoints and schemas', () => {
    const content = readFileSync(
      join(process.cwd(), 'docs/contracts/openapi/openapi.yaml'),
      'utf-8',
    );

    expect(content).toContain('/health/live');
    expect(content).toContain('/health/ready');
    expect(content).toContain('HealthResponse');
  });
});
