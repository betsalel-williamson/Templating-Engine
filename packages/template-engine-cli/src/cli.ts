#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import {
  createSecureEvaluator,
  formatTemplateParseError,
  parseLegacy as parse,
  type DataContext,
  type DataContextValue,
} from '@bwilliamson/template-engine-core';

function convertObjectToDataContext(obj: Record<string, unknown>): DataContext {
  const context = new Map<string, DataContextValue>();
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          context.set(
            key,
            value.map((item) =>
              typeof item === 'object' && item !== null
                ? convertObjectToDataContext(item as Record<string, unknown>)
                : (item as DataContextValue)
            )
          );
        } else {
          context.set(key, convertObjectToDataContext(value as Record<string, unknown>));
        }
      } else {
        context.set(key, value as DataContextValue);
      }
    }
  }
  return context;
}

const USAGE = `
Usage: template-engine [options]

Options:
  --template <file>  Path to the template file. If omitted, template is read from stdin.
  --data <file>      Path to the JSON data file. (Required)
  --help             Show this help message.
`;

export async function runCli(
  argv: string[],
  stdinStream: NodeJS.ReadStream,
  stdoutStream: NodeJS.WriteStream,
  stderrStream: NodeJS.WriteStream
): Promise<number> {
  let templateFilePath: string | undefined;
  let dataFilePath: string | undefined;
  let showHelp = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') showHelp = true;
    else if (arg === '--template') templateFilePath = argv[++i];
    else if (arg === '--data') dataFilePath = argv[++i];
  }

  if (showHelp) {
    stdoutStream.write(USAGE);
    return 0;
  }

  if (!dataFilePath) {
    stderrStream.write('Error: --data <file> is a required argument.\n' + USAGE);
    return 1;
  }

  let templateContent = '';

  try {
    if (templateFilePath) {
      templateContent = readFileSync(templateFilePath, 'utf8');
    } else {
      templateContent = await readStream(stdinStream);
    }

    const dataContent = readFileSync(dataFilePath, 'utf8');
    const parsedJson = JSON.parse(dataContent) as Record<string, unknown>;
    const dataContext = convertObjectToDataContext(parsedJson);

    const secureEvaluate = createSecureEvaluator({ functions: new Map() });
    const sourcePath = templateFilePath ?? '<stdin>';
    const ast = parse(templateContent, { sourcePath });
    const output = await secureEvaluate(ast, dataContext);
    stdoutStream.write(output);
    return 0;
  } catch (error: unknown) {
    if (templateContent) {
      stderrStream.write(
        `${formatTemplateParseError(error, {
          sourcePath: templateFilePath ?? '<stdin>',
          sourceText: templateContent,
        })}\n`
      );
    } else {
      stderrStream.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    return 1;
  }
}

function readStream(stream: NodeJS.ReadStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      data += chunk;
    });
    stream.on('end', () => resolve(data));
    stream.on('error', (err) => reject(err));
  });
}

const isMainModule =
  process.argv[1] !== undefined &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);

if (isMainModule) {
  runCli(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    .then((exitCode) => process.exit(exitCode))
    .catch((err: Error) => {
      console.error(`Unhandled error: ${err.message}`);
      process.exit(1);
    });
}
