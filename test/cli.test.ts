import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Writable, Readable } from 'stream';
import * as fs from 'fs';

// Mock the 'fs' module. This must be defined at the top-level of the file.
// Vitest hoists `vi.mock` calls, ensuring the mock is applied before the module under test is imported.
vi.mock('fs', async (importOriginal) => {
  const original = await importOriginal<typeof import('fs')>();
  return {
    ...original, // Retain original exports for other fs functions if needed
    readFileSync: vi.fn(), // Mock readFileSync explicitly
  };
});

// Import the module under test AFTER the mock is defined.
import { runCli } from '../src/cli.js';

// Import the mocked 'fs' module to access its mocked functions for setting behavior.
// We cast it to `any` because TypeScript might not correctly infer the mock's type without extra configuration.
import * as fsMocked from 'fs';
const mockReadFileSync = fsMocked.readFileSync as any as vi.Mock; // Explicitly cast to vi.Mock for easier usage

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
  // Instead of exiting, throw an error to stop test execution and assert the code
  throw new Error(`Process exited with code: ${code}`);
});

let stdoutOutput = '';
let stderrOutput = '';
const mockStdout = new Writable({
  write(chunk, encoding, callback) {
    stdoutOutput += chunk.toString();
    callback();
  }
});
const mockStderr = new Writable({
  write(chunk, encoding, callback) {
    stderrOutput += chunk.toString();
    callback();
  }
});

let mockStdinReadable: Readable;

describe('CLI Interface (Story 12)', () => {
  beforeEach(() => {
    mockExit.mockClear();
    mockReadFileSync.mockClear(); // Clear mock calls and implementations
    stdoutOutput = '';
    stderrOutput = '';

    // Create new mock streams for each test to ensure isolation
    mockStdinReadable = new Readable();
    mockStdinReadable._read = () => {}; // No-op _read method for now
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore all mocks after each test
  });

  it('should display help message with --help flag and return 0', async () => {
    const exitCode = await runCli(['--help'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(0);
    expect(stdoutOutput).toContain('Usage: template-engine');
    expect(stderrOutput).not.toContain('Error:');
  });

  it('should return 1 if --data is missing', async () => {
    const exitCode = await runCli(['--template', 'template.txt'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(1);
    expect(stderrOutput).toContain('Error: --data <file> is a required argument.');
    expect(stderrOutput).toContain('Usage: template-engine');
    expect(stdoutOutput).toBe('');
  });

  it('should render template from file with data from file', async () => {
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (filePath === 'template.txt') return 'Hello, <#name#>!';
      if (filePath === 'data.json') return '{"name": "World"}';
      return '';
    });

    const exitCode = await runCli(['--template', 'template.txt', '--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(0);
    expect(stdoutOutput).toBe('Hello, World!');
    expect(stderrOutput).toBe('');
  });

  it('should render template from stdin with data from file', async () => {
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (filePath === 'data.json') return '{"name": "StreamUser"}';
      return '';
    });

    // Simulate stdin input
    mockStdinReadable.push('Hello, <#name#> from stdin!');
    mockStdinReadable.push(null); // Signal end of stream

    const exitCode = await runCli(['--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(0);
    expect(stdoutOutput).toBe('Hello, StreamUser from stdin!');
    expect(stderrOutput).toBe('');
  });

  it('should return 1 on invalid template syntax', async () => {
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (filePath === 'template.txt') return 'Invalid <#syntax->'; // Malformed template
      if (filePath === 'data.json') return '{"key": "value"}';
      return '';
    });

    const exitCode = await runCli(['--template', 'template.txt', '--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(1);
    expect(stderrOutput).toContain('Error: Expected'); // Peggy parse error
    expect(stdoutOutput).toBe('');
  });

  it('should return 1 on invalid JSON data', async () => {
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (filePath === 'template.txt') return 'Hello, <#name#>!';
      if (filePath === 'data.json') return '{"name": "World",'; // Malformed JSON
      return '';
    });

    const exitCode = await runCli(['--template', 'template.txt', '--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(1);
    // Updated assertion to match the specific error message from Node.js's JSON.parse for this input.
    expect(stderrOutput).toContain('Error: Expected double-quoted property name in JSON at position 17');
    expect(stdoutOutput).toBe('');
  });

  it('should handle template engine evaluation errors gracefully', async () => {
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (filePath === 'template.txt') return '<#a#>';
      if (filePath === 'data.json') return '{"a": "<#b#>", "b": "<#a#>"}'; // Circular reference
      return '';
    });

    const exitCode = await runCli(['--template', 'template.txt', '--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(1);
    expect(stderrOutput).toContain('Error: Max evaluation depth exceeded');
    expect(stdoutOutput).toBe('');
  });

  it('should handle complex nested JSON data for context', async () => {
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath === 'template.txt') return '<~<`- <#name#> from <#details.city#> residing in <#details.address.street#>`><*><[users]>~>';
        if (filePath === 'data.json') return JSON.stringify({
            users: [
                { name: 'Alice', details: { city: 'NY', address: { street: 'Main St' } } },
                { name: 'Bob', details: { city: 'LA', address: { street: 'Elm St' } } },
            ]
        });
        return '';
    });

    const exitCode = await runCli(['--template', 'template.txt', '--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);
    expect(exitCode).toBe(0);
    expect(stdoutOutput).toBe('- Alice from NY residing in Main St- Bob from LA residing in Elm St');
    expect(stderrOutput).toBe('');
  });

  it('should return 1 and provide detailed location info for a malformed tag', async () => {
    const templateContent = 'Hello\nThis is an <#malformed';
    mockReadFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (filePath === 'template.txt') return templateContent;
      if (filePath === 'data.json') return '{}';
      return '';
    });

    const exitCode = await runCli(['--template', 'template.txt', '--data', 'data.json'], mockStdinReadable, mockStdout, mockStderr);

    expect(exitCode).toBe(1);
    expect(stdoutOutput).toBe('');

    // Assert against the actual error message generated by the parser.
    // The rich formatting (location, source line, pointer) is handled by cli.ts.
    expect(stderrOutput).toContain('Syntax Error: Expected end of input but "<" found.');
    expect(stderrOutput).toContain('at template.txt:2:12');
    expect(stderrOutput).toContain('  2 | This is an <#malformed');
    expect(stderrOutput).toContain('|            ^');
  });
});
