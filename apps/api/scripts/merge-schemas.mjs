import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prismaDir = join(__dirname, '..', 'prisma');
const domainsDir = join(prismaDir, 'domains');
const headFile = join(prismaDir, 'schema-head.prisma');
const outputFile = join(prismaDir, 'schema.prisma');

const head = readFileSync(headFile, 'utf-8');
const domainFiles = readdirSync(domainsDir)
  .filter((f) => f.endsWith('.prisma'))
  .sort();

const parts = [head];

for (const file of domainFiles) {
  const content = readFileSync(join(domainsDir, file), 'utf-8');
  parts.push(`\n// --- Domain: ${file.replace('.prisma', '')} ---\n`);
  parts.push(content);
}

writeFileSync(outputFile, parts.join('\n'), 'utf-8');
console.log(`Merged schema written to ${outputFile} (${domainFiles.length} domain files)`);
