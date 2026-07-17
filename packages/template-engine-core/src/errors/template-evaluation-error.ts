import type { SourceLocation } from '../source-location.js';

export class TemplateEvaluationError extends Error {
  readonly location?: SourceLocation;

  constructor(message: string, location?: SourceLocation) {
    super(message);
    this.name = 'TemplateEvaluationError';
    this.location = location;
  }
}

export function isTemplateEvaluationError(error: unknown): error is TemplateEvaluationError {
  return error instanceof TemplateEvaluationError;
}

export function createTemplateEvaluationError(
  message: string,
  location?: SourceLocation
): TemplateEvaluationError {
  return new TemplateEvaluationError(message, location);
}
