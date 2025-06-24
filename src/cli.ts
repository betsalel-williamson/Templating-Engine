import { readFileSync } from 'fs';
import { createSecureEvaluator } from './evaluator.js';
import { parse } from '../lib/parser.js';
import { DataContext, DataContextValue } from './types.js'; // Ensure DataContextValue is imported

// Function to recursively convert a plain JavaScript object to a DataContext (Map)
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

Examples:
  template-engine --template template.txt --data data.json
  cat template.txt | template-engine --data data.json
`;

// Exported for testing, but also serves as the main entry point for the CLI
export async function runCli(argv: string[], stdinStream: NodeJS.ReadStream, stdoutStream: NodeJS.WriteStream, stderrStream: NodeJS.WriteStream): Promise<number> {
  let templateFilePath: string | undefined;
  let dataFilePath: string | undefined;
  let showHelp = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') {
      showHelp = true;
    } else if (arg === '--template') {
      templateFilePath = argv[++i];
    } else if (arg === '--data') {
      dataFilePath = argv[++i];
    }
  }

  if (showHelp) {
    stdoutStream.write(USAGE);
    return 0; // Indicate success for help
  }

  if (!dataFilePath) {
    stderrStream.write('Error: --data <file> is a required argument.\n');
    stderrStream.write(USAGE);
    return 1; // Indicate error
  }

  let templateContent: string;
  let dataContent: string;

  try {
    if (templateFilePath) {
      templateContent = readFileSync(templateFilePath, 'utf8');
    } else {
      // Read template from stdin
      templateContent = await readStream(stdinStream);
    }

    dataContent = readFileSync(dataFilePath, 'utf8');
    const parsedJson = JSON.parse(dataContent);
    const dataContext = convertObjectToDataContext(parsedJson);

    // Secure evaluator with no built-in functions for CLI (for security, host app adds them)
    // The CLI's purpose is content generation, not arbitrary code execution via templates.
    const secureEvaluate = createSecureEvaluator({ functions: new Map() });

    const ast = parse(templateContent);
    const output = await secureEvaluate(ast, dataContext);
    stdoutStream.write(output);
    return 0; // Indicate success
  } catch (error: any) {
    stderrStream.write(`Error: ${error.message}\n`);
    return 1; // Indicate error
  }
}

function readStream(stream: NodeJS.ReadStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    // Set encoding to utf8 for consistent text processing
    stream.setEncoding('utf8');
    stream.on('data', chunk => {
      data += chunk;
    });
    stream.on('end', () => {
      resolve(data);
    });
    stream.on('error', err => {
      reject(err);
    });
  });
}

// Check if this module is being run directly as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  runCli(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    .then(exitCode => process.exit(exitCode))
    .catch(err => {
      console.error(`Unhandled error: ${err.message}`);
      process.exit(1);
    });
}
