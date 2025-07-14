import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createTestEvaluator } from './test-helper';
import type { DataContext, DataContextValue } from '../src/types';

/**
 * Converts a plain JavaScript object (from a JSON file) into a DataContext Map,
 * recursively handling nested objects and arrays.
 */
function convertObjectToDataContext(obj: any): DataContext {
  const context = new Map<string, DataContextValue>();
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          context.set(
            key,
            value.map((item) =>
              typeof item === 'object' && item !== null ? convertObjectToDataContext(item) : item
            )
          );
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

const recipesDir = path.join(process.cwd(), 'recipes');
const recipeTemplates = fs.readdirSync(recipesDir).filter((file) => file.endsWith('.template'));

describe('Recipe Golden File Tests', () => {
  // We use the default test evaluator, which uses the legacy parser.
  const evaluate = createTestEvaluator(new Map(), false, 'legacy', false);

  // This loop dynamically creates a test suite for each recipe.
  for (const templateFile of recipeTemplates) {
    const baseName = path.basename(templateFile, '.template');
    const templatePath = path.join(recipesDir, templateFile);
    const dataPath = path.join(recipesDir, `${baseName}.json`);
    const resultPath = path.join(recipesDir, `${baseName}.result`);

    // A test suite is only created if all three files (.template, .json, .result) exist.
    if (!fs.existsSync(dataPath) || !fs.existsSync(resultPath)) {
      it.skip(`Recipe: ${baseName} (missing data or result file)`, () => {});
      continue;
    }

    describe(`Recipe: ${baseName}`, () => {
      it('should produce an output that matches the golden file (.result)', async () => {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        const expectedOutput = fs.readFileSync(resultPath, 'utf8');

        const jsonData = JSON.parse(dataContent);
        const dataContext = convertObjectToDataContext(jsonData);

        const actualOutput = await evaluate(templateContent, dataContext);

        // We normalize line endings to ensure tests pass on both Unix and Windows.
        const normalize = (str: string) => str.replace(/\r\n/g, '\n');

        expect(normalize(actualOutput)).toBe(normalize(expectedOutput));
      });
    });
  }
});
