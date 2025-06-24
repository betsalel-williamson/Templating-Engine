import { readFileSync } from 'fs';
import { createSecureEvaluator } from './evaluator.js';
import { parse } from '../lib/parser.js';
import type { DataContext, DataContextValue } from './types.js';

function convertObjectToDataContext(obj: any): DataContext {
    const context = new Map<string, DataContextValue>();
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    context.set(key, value.map(item =>
                        typeof item === 'object' && item !== null ? convertObjectToDataContext(item) : item
                    ));
                } else {
                    context.set(key, convertObjectToDataContext(value));
                }
            } else {
                context.set(key, value);
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

export async function runCli(argv: string[], stdinStream: NodeJS.ReadStream, stdoutStream: NodeJS.WriteStream, stderrStream: NodeJS.WriteStream): Promise<number> {
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

  let templateContent: string = '';

  try {
    if (templateFilePath) {
      templateContent = readFileSync(templateFilePath, 'utf8');
    } else {
      templateContent = await readStream(stdinStream);
    }

    const dataContent = readFileSync(dataFilePath, 'utf8');
    const parsedJson = JSON.parse(dataContent);
    const dataContext = convertObjectToDataContext(parsedJson);

    const secureEvaluate = createSecureEvaluator({ functions: new Map() });
    const ast = parse(templateContent);
    const output = await secureEvaluate(ast, dataContext);
    stdoutStream.write(output);
    return 0;
  } catch (error: any) {
    // This is where the new, robust error handling lives.
    if (error.location && error.location.start && templateContent) {
      const { line, column } = error.location.start;
      const sourcePath = templateFilePath || '<stdin>';
      const lines = templateContent.split('\n');
      const errorLine = lines[line - 1] || '';
      const pointer = ' '.repeat(column - 1) + '^';
      const formattedMessage = [
        `\nSyntax Error: ${error.message}`,
        ` at ${sourcePath}:${line}:${column}`,
        ``,
        `  ${line} | ${errorLine}`,
        `    | ${pointer}`,
        ``
      ].join('\n');
      stderrStream.write(formattedMessage);
    } else {
      stderrStream.write(`Error: ${error.message}\n`);
    }
    return 1;
  }
}

function readStream(stream: NodeJS.ReadStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.setEncoding('utf8');
    stream.on('data', chunk => { data += chunk; });
    stream.on('end', () => resolve(data));
    stream.on('error', err => reject(err));
  });
}

if (require.main === module) {
  runCli(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    .then(exitCode => process.exit(exitCode))
    .catch(err => {
      console.error(`Unhandled error: ${err.message}`);
      process.exit(1);
    });
}
