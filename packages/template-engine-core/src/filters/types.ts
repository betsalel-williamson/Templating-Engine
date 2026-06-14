import { DataContext, DataContextValue } from '../types.js';

/**
 * Defines the signature for a Filter function.
 *
 * @param input The value from the left-hand side of the `|` operator.
 * @param context The current DataContext at the point of evaluation.
 * @param args Any additional arguments passed to the filter, e.g., `filter:arg1:arg2`.
 * @returns The transformed value.
 */
export type Filter = (
  input: DataContextValue,
  context: DataContext,
  ...args: string[]
) => DataContextValue;

export type FilterRegistry = Map<string, Filter>;
