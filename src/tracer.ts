import * as fs from 'fs';
import * as path from 'path';

let depth = 0;
const logFile = path.join(process.cwd(), 'trace.log');

// This function is exported so tests can clear the log before a run.
export function clearTraceLog() {
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }
}

interface TraceEvent {
  type: 'rule.enter' | 'rule.match' | 'rule.fail';
  rule: string;
  location: any;
}

export const fileTracer = {
  trace: (event: TraceEvent) => {
    const indent = '  '.repeat(depth);
    let line = '';

    switch (event.type) {
      case 'rule.enter':
        line = `${indent}[?] ${event.rule} at line ${event.location.start.line}, col ${event.location.start.column}\n`;
        depth++;
        break;
      case 'rule.match':
        depth--;
        line = `${'  '.repeat(depth)}[✓] Match ${event.rule}\n`;
        break;
      case 'rule.fail':
        depth--;
        line = `${'  '.repeat(depth)}[✗] Fail  ${event.rule}\n`;
        break;
    }
    // Append to the log file instead of writing to the console.
    fs.appendFileSync(logFile, line);
  },
};
