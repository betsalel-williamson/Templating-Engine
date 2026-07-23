import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
if (!root) {
  console.error('usage: node spec-alignment.mjs <worktreeRoot>');
  process.exit(2);
}

const indexDts = path.join(root, 'packages/template-engine-core/dist/index.d.ts');
const srcIndex = path.join(root, 'packages/template-engine-core/src/index.ts');

const texts = [indexDts, srcIndex]
  .filter((p) => fs.existsSync(p))
  .map((p) => fs.readFileSync(p, 'utf8'));

const blob = texts.join('\n');
const ok = /TrustedTemplate/.test(blob);

if (!ok) {
  console.error('spec-alignment: TrustedTemplate not found in core exports/sources');
  process.exit(1);
}
console.log('spec-alignment: TrustedTemplate symbol present');
