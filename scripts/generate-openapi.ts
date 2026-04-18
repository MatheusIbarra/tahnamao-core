import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const sourcePath = join(process.cwd(), 'docs/contracts/openapi/openapi.yaml');
const outputPath = join(process.cwd(), 'dist/openapi/openapi.yaml');

const openapi = readFileSync(sourcePath, 'utf-8');
mkdirSync(join(process.cwd(), 'dist/openapi'), { recursive: true });
writeFileSync(outputPath, openapi, { encoding: 'utf-8' });

process.stdout.write(`OpenAPI exported to ${outputPath}\n`);
