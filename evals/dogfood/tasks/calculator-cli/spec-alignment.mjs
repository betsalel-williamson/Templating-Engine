import fs from 'node:fs';
import path from 'node:path';
import {
  listGeneratedTsFiles,
  listTemplateFiles,
  readCodegenBlob,
  readTaskSourceBlob,
  taskImplementationRoot,
  usesCoreEngine,
} from '../../scorers/process.mjs';

const root = process.argv[2];
if (!root) {
  console.error('usage: node spec-alignment.mjs <worktreeRoot>');
  process.exit(2);
}

const taskId = 'calculator-cli';
const taskRoot = taskImplementationRoot(root, taskId);
const srcBlob = readTaskSourceBlob(root, taskId);
const codegenBlob = readCodegenBlob(root, taskId);
const templates = listTemplateFiles(root, taskId);
const generated = listGeneratedTsFiles(root, taskId);
const coreInSrc = usesCoreEngine(srcBlob);
const coreInCodegen = usesCoreEngine(codegenBlob);

if (!fs.existsSync(path.join(taskRoot, 'package.json'))) {
  console.error('spec-alignment: calculator-cli package.json missing');
  process.exit(1);
}

const isCodegenArm =
  templates.length > 0 ||
  coreInCodegen ||
  fs.existsSync(path.join(taskRoot, 'scripts/codegen.mjs'));

if (isCodegenArm) {
  if (!fs.existsSync(path.join(taskRoot, 'scripts/codegen.mjs'))) {
    console.error('spec-alignment: scripts/codegen.mjs missing');
    process.exit(1);
  }
  if (!coreInCodegen) {
    console.error('spec-alignment: codegen script must import template-engine-core');
    process.exit(1);
  }
  if (templates.length < 2) {
    console.error(`spec-alignment: need ≥2 .template files (found ${templates.length})`);
    process.exit(1);
  }
  if (generated.length < 1) {
    console.error('spec-alignment: src/generated/*.ts missing after codegen');
    process.exit(1);
  }
  if (coreInSrc) {
    console.error('spec-alignment: runtime src/ must not import template-engine-core');
    process.exit(1);
  }
  console.log('spec-alignment: build-time TS codegen structure ok');
  process.exit(0);
}

if (templates.length > 0 || generated.length > 0 || coreInSrc) {
  console.error('spec-alignment: Arm A must be plain TypeScript without templates/generated');
  process.exit(1);
}

console.log('spec-alignment: plain TypeScript structure ok');
process.exit(0);
