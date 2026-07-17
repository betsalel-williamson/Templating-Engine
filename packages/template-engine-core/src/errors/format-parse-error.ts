import type { SourceLocation } from '../source-location.js';
import { isTemplateEvaluationError } from './template-evaluation-error.js';

export type { SourceLocation, SourcePosition } from '../source-location.js';

export interface TemplateSyntaxError extends SyntaxError {
  location?: SourceLocation;
  format?(sources: Array<{ source?: string; text: string }>): string;
}

export function isTemplateSyntaxError(error: unknown): error is TemplateSyntaxError {
  return (
    error instanceof SyntaxError &&
    typeof error === 'object' &&
    error !== null &&
    'location' in error &&
    typeof (error as TemplateSyntaxError).location?.start?.line === 'number'
  );
}

export function hasTemplateSourceLocation(
  error: unknown
): error is Error & { location: SourceLocation } {
  if (!(error instanceof Error) || typeof error !== 'object' || error === null) {
    return false;
  }

  if (isTemplateSyntaxError(error)) {
    return false;
  }

  return (
    'location' in error &&
    typeof (error as { location?: SourceLocation }).location?.start?.line === 'number'
  );
}

export interface FormatParseErrorOptions {
  /** Display path for the template (for example `template.txt` or `<stdin>`). */
  sourcePath?: string;
  /** Full template source text used to render a source line and caret. */
  sourceText: string;
}

/**
 * Formats a message and source span with line/column and a caret, matching Peggy
 * parse diagnostics.
 */
export function formatSourceLocationDiagnostic(
  message: string,
  location: SourceLocation,
  options: FormatParseErrorOptions
): string {
  const sourcePath = options.sourcePath ?? '<template>';
  const locationSource = location.source ?? sourcePath;
  const sourceLines = options.sourceText.split(/\r\n|\n|\r/g);
  const start = location.start;
  const end = location.end;
  const loc = `${locationSource}:${start.line}:${start.column}`;
  const lineNumberWidth = String(start.line).length;
  const filler = ''.padEnd(lineNumberWidth, ' ');
  const line = sourceLines[start.line - 1] ?? '';
  const lastColumn = start.line === end.line ? end.column : line.length + 1;
  const hatLen = Math.max(lastColumn - start.column, 1);

  return (
    `Error: ${message}\n --> ${loc}\n` +
    `${filler} |\n` +
    `${start.line} | ${line}\n` +
    `${filler} | ${''.padEnd(start.column - 1, ' ')}${''.padEnd(hatLen, '^')}`
  );
}

/**
 * Formats template parse or evaluation errors with line/column and a source caret,
 * similar to rustc or TypeScript diagnostics.
 */
export function formatTemplateError(error: unknown, options: FormatParseErrorOptions): string {
  const sourcePath = options.sourcePath ?? '<template>';

  if (isTemplateSyntaxError(error) && typeof error.format === 'function') {
    const locationSource = error.location?.source ?? sourcePath;
    return error.format([{ source: locationSource, text: options.sourceText }]);
  }

  if (isTemplateEvaluationError(error) && error.location) {
    return formatSourceLocationDiagnostic(error.message, error.location, options);
  }

  if (hasTemplateSourceLocation(error)) {
    return formatSourceLocationDiagnostic(error.message, error.location, options);
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Error: ${String(error)}`;
}

/**
 * Formats a Peggy template parse error with line/column and a source caret,
 * similar to rustc or TypeScript diagnostics.
 */
export function formatTemplateParseError(error: unknown, options: FormatParseErrorOptions): string {
  return formatTemplateError(error, options);
}

/**
 * Formats a runtime evaluation error when the thrown error carries a source span.
 */
export function formatTemplateEvaluationError(
  error: unknown,
  options: FormatParseErrorOptions
): string {
  return formatTemplateError(error, options);
}
