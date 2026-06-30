import { describe, it, expect } from 'vitest';
import {
  formatTemplateParseError,
  isTemplateSyntaxError,
} from '../../src/errors/format-parse-error.js';
import { parseLegacy, parseModern } from '../../src/parse.js';

describe('Template parse error formatting', () => {
  const multilineInput = 'line1\nline2\n{{ unclosed';

  describe('parseModern', () => {
    it('should attach line and column to syntax errors', () => {
      try {
        parseModern(multilineInput, { sourcePath: 'report.v2.template' });
        expect.fail('expected parse to throw');
      } catch (error) {
        expect(isTemplateSyntaxError(error)).toBe(true);
        expect(error.location?.source).toBe('report.v2.template');
        expect(error.location?.start.line).toBe(3);
        expect(error.location?.start.column).toBeGreaterThan(0);
      }
    });

    it('should format errors with file path, line, column, and caret', () => {
      try {
        parseModern(multilineInput, { sourcePath: 'report.v2.template' });
        expect.fail('expected parse to throw');
      } catch (error) {
        const formatted = formatTemplateParseError(error, {
          sourcePath: 'report.v2.template',
          sourceText: multilineInput,
        });

        expect(formatted).toContain('report.v2.template:3:');
        expect(formatted).toContain('{{ unclosed');
        expect(formatted).toContain('^');
      }
    });
  });

  describe('parseLegacy', () => {
    it('should format legacy syntax errors with source location', () => {
      const input = 'Hello <#name#';
      try {
        parseLegacy(input, { sourcePath: 'legacy.template' });
        expect.fail('expected parse to throw');
      } catch (error) {
        const formatted = formatTemplateParseError(error, {
          sourcePath: 'legacy.template',
          sourceText: input,
        });

        expect(formatted).toContain('legacy.template:1:');
        expect(formatted).toContain('Hello <#name#');
      }
    });
  });

  describe('formatTemplateParseError', () => {
    it('should fall back to a plain message for non-syntax errors', () => {
      expect(
        formatTemplateParseError(new Error('boom'), {
          sourceText: 'ignored',
        })
      ).toBe('Error: boom');
    });
  });
});
