import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { parseModern } from '../../src/parse.js';
import { createSecureEvaluator } from '../../src/evaluator.js';
import { formatTemplateEvaluationError } from '../../src/errors/format-parse-error.js';
import { isTemplateEvaluationError } from '../../src/errors/template-evaluation-error.js';

describe('Template evaluation error formatting', () => {
  const usersContext: DataContext = new Map([
    [
      'users',
      [
        new Map([
          ['name', 'Alice'],
          ['roles', 'admin'],
        ]),
      ],
    ],
  ]);

  it('should attach source location to AST nodes when parsing with sourcePath', () => {
    const sourcePath = 'report.v2.template';
    const sourceText = 'line1\n{{ users | join(", ") }}';
    const ast = parseModern(sourceText, { sourcePath });

    expect(ast.location?.source).toBe(sourcePath);
    expect(ast.location?.start.line).toBe(1);

    const outputNode = ast.body[1];
    expect(outputNode.type).toBe('OutputExpression');
    if (outputNode.type === 'OutputExpression') {
      expect(outputNode.location?.source).toBe(sourcePath);
      expect(outputNode.location?.start.line).toBe(2);
    }
  });

  it('should format unknown filter errors with file path, line, column, and caret', async () => {
    const sourcePath = 'report.v2.template';
    const sourceText = 'line1\n{{ users | unknown }}';
    const ast = parseModern(sourceText, { sourcePath });
    const evaluate = createSecureEvaluator({
      functions: new Map(),
      resolveAliases: true,
      parseTemplate: parseModern,
    });

    try {
      await evaluate(ast, usersContext);
      expect.fail('expected evaluation to throw');
    } catch (error) {
      expect(isTemplateEvaluationError(error)).toBe(true);
      expect(error.location?.source).toBe(sourcePath);
      expect(error.location?.start.line).toBe(2);
      expect(error.location?.start.column).toBeGreaterThan(0);

      const formatted = formatTemplateEvaluationError(error, {
        sourcePath,
        sourceText,
      });

      expect(formatted).toContain('Unknown filter: "unknown"');
      expect(formatted).toContain('report.v2.template:2:');
      expect(formatted).toContain('{{ users | unknown }}');
      expect(formatted).toContain('^');
    }
  });

  it('should format circular alias errors with file path, line, column, and caret', async () => {
    const sourcePath = 'aliases.template';
    const sourceText = 'line1\n{{ varA }}';
    const ast = parseModern(sourceText, { sourcePath });
    const context: DataContext = new Map([
      ['varA', 'varB'],
      ['varB', 'varA'],
    ]);
    const evaluate = createSecureEvaluator({
      functions: new Map(),
      resolveAliases: true,
      parseTemplate: parseModern,
    });

    try {
      await evaluate(ast, context);
      expect.fail('expected evaluation to throw');
    } catch (error) {
      expect(isTemplateEvaluationError(error)).toBe(true);
      expect(error.message).toBe('Circular alias reference detected: varA -> varB -> varA');
      expect(error.location?.source).toBe(sourcePath);
      expect(error.location?.start.line).toBe(2);
      expect(error.location?.start.column).toBeGreaterThan(0);

      const formatted = formatTemplateEvaluationError(error, {
        sourcePath,
        sourceText,
      });

      expect(formatted).toContain('Circular alias reference detected: varA -> varB -> varA');
      expect(formatted).toContain('aliases.template:2:');
      expect(formatted).toContain('{{ varA }}');
      expect(formatted).toContain('^');
    }
  });
});
