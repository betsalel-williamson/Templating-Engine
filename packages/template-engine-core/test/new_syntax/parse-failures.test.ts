import { describe, it, expect } from 'vitest';
import { parse as parseNew } from '../../lib/parser_new.js';

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
    expect(() => parseNew(template)).toThrow(SyntaxError);
  });

  it('should parse a lone open brace as literal text', () => {
    const ast = parseNew('price is { not a tag }');
    expect(ast.type).toBe('Template');
    expect(ast.body).toHaveLength(1);
    expect(ast.body[0].type).toBe('Literal');
  });
});
