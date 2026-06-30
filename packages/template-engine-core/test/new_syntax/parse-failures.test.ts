import { describe, it, expect } from 'vitest';
import {
  isTemplateSyntaxError,
  formatTemplateParseError,
} from '../../src/errors/format-parse-error.js';
import { parseModern } from '../../src/parse.js';

describe('New Syntax: Parse Failure Contracts', () => {
  it.each([
    ['unclosed output tag', '{{ name'],
    ['unclosed output tag with content', 'Hello {{ name'],
    ['missing endfor', '{% for item in items %}{{ item }}'],
    ['missing endif', '{% if flag %}yes'],
    ['missing closing brace on control tag', '{% for item in items %}'],
    ['invalid filter syntax', '{{ name | join }'],
    ['empty output tag', '{{ }}'],
    ['for without collection expression', '{% for item in %}{{ item }}{% endfor %}'],
    ['control tag without a valid block', '{% not a tag %}'],
    ['numeric literal in filter arguments', '{{ items | slice(1, 2) }}'],
  ])('should throw SyntaxError for %s', (_label, template) => {
    expect(() => parseModern(template)).toThrow(SyntaxError);
  });

  it('should include line and column metadata on syntax errors', () => {
    const template = 'ok\n{{ unclosed';
    try {
      parseModern(template, { sourcePath: 'broken.template' });
      expect.fail('expected parse to throw');
    } catch (error) {
      expect(isTemplateSyntaxError(error)).toBe(true);
      expect(error.location?.start).toEqual({ offset: 3, line: 2, column: 1 });
    }
  });

  it('should parse a lone open brace as literal text', () => {
    const ast = parseModern('price is { not a tag }');
    expect(ast.type).toBe('Template');
    expect(ast.body).toHaveLength(1);
    expect(ast.body[0].type).toBe('Literal');
  });
});
