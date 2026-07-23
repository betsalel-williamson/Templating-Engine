import fs from 'node:fs';
import path from 'node:path';
import {
  listTemplateFiles,
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
const blob = readTaskSourceBlob(root, taskId);
const templates = listTemplateFiles(root, taskId);
const coreImport = usesCoreEngine(blob);

if (!fs.existsSync(path.join(taskRoot, 'package.json'))) {
  console.error('spec-alignment: calculator-cli package.json missing');
  process.exit(1);
}

if (coreImport) {
  if (templates.length < 2) {
    console.error(`spec-alignment: Arm B needs ≥2 .template files (found ${templates.length})`);
    process.exit(1);
  }
  if (!/help\.template|renderHelp/.test(blob)) {
    console.error('spec-alignment: help template path missing');
    process.exit(1);
  }
  if (!/formatResult\.template|renderOutput|renderResult/.test(blob)) {
    console.error('spec-alignment: runtime output template path missing');
    process.exit(1);
  }
  console.log('spec-alignment: template codegen structure ok');
  process.exit(0);
}

if (templates.length > 0) {
  console.error('spec-alignment: Arm A must not use .template files');
  process.exit(1);
}

console.log('spec-alignment: plain TypeScript structure ok');
process.exit(0);
