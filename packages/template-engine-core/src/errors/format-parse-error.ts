export interface SourcePosition {
  offset: number;
  line: number;
  column: number;
}

export interface SourceLocation {
  source?: string;
  start: SourcePosition;
  end: SourcePosition;
}

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

export interface FormatParseErrorOptions {
  /** Display path for the template (for example `template.txt` or `<stdin>`). */
  sourcePath?: string;
  /** Full template source text used to render a source line and caret. */
  sourceText: string;
}

/**
 * Formats a Peggy template parse error with line/column and a source caret,
 * similar to rustc or TypeScript diagnostics.
 */
export function formatTemplateParseError(error: unknown, options: FormatParseErrorOptions): string {
  const sourcePath = options.sourcePath ?? '<template>';

  if (isTemplateSyntaxError(error) && typeof error.format === 'function') {
    const locationSource = error.location?.source ?? sourcePath;
    return error.format([{ source: locationSource, text: options.sourceText }]);
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Error: ${String(error)}`;
}
