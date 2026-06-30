export { createSecureEvaluator } from './evaluator.js';
export { parseLegacy, parseModern, type ParseOptions } from './parse.js';
export {
  formatTemplateParseError,
  isTemplateSyntaxError,
  type FormatParseErrorOptions,
  type SourceLocation,
  type SourcePosition,
  type TemplateSyntaxError,
} from './errors/format-parse-error.js';
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
