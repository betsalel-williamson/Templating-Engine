export { createSecureEvaluator } from './evaluator.js';
export { parseLegacy, parseModern, type ParseOptions } from './parse.js';
export {
  formatSourceLocationDiagnostic,
  formatTemplateError,
  formatTemplateEvaluationError,
  formatTemplateParseError,
  hasTemplateSourceLocation,
  isTemplateSyntaxError,
  type FormatParseErrorOptions,
  type TemplateSyntaxError,
} from './errors/format-parse-error.js';
export {
  TemplateEvaluationError,
  createTemplateEvaluationError,
  isTemplateEvaluationError,
} from './errors/template-evaluation-error.js';
export type { SourceLocation, SourcePosition, WithSourceLocation } from './source-location.js';
export type {
  AstNode,
  TemplateNode,
  LiteralNode,
  VariableNode,
  IndirectVariableNode,
  ArrayNode,
  CrossProductNode,
  ConditionalNode,
  FunctionCallNode,
  OutputExpressionNode,
  ForBlockNode,
  IfBlockNode,
  ExpressionNode,
  DataContextValue,
  DataContext,
  RegisteredFunction,
  FunctionRegistry,
  ParseFunction,
} from './types.js';
export type { Filter, FilterRegistry } from './filters/types.js';
