export { createSecureEvaluator } from './evaluator.js';
export { parse as parseLegacy } from '../lib/parser.js';
export { parse as parseModern } from '../lib/parser_new.js';
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
