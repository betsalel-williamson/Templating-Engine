import { mkdirSync } from 'node:fs';

const dir = process.argv[2];

if (!dir) {
  console.error('Usage: node scripts/ensure-dir.mjs <directory>');
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
