import type { WithSourceLocation } from './source-location.js';

export type { SourceLocation, SourcePosition, WithSourceLocation } from './source-location.js';

// Defines the structure of the Abstract Syntax Tree (AST) and the data context.

export type AstNode =
  | TemplateNode
  | LiteralNode
  | VariableNode
  | IndirectVariableNode
  | ArrayNode
  | CrossProductNode
  | ConditionalNode
  | FunctionCallNode
  | OutputExpressionNode
  | ForBlockNode
  | IfBlockNode;

export type ExpressionNode =
  | IdentifierExpression
  | PropertyAccessExpression
  | BracketLookupExpression
  | ConcatExpression
  | StringLiteralExpression
  | FilterPipelineExpression;

export interface OutputExpressionNode extends WithSourceLocation {
  type: 'OutputExpression';
  expression: ExpressionNode;
  raw: string;
}

export interface ForBlockNode extends WithSourceLocation {
  type: 'ForBlock';
  item: string;
  collection: ExpressionNode;
  body: TemplateNode;
}

export interface IfBlockNode extends WithSourceLocation {
  type: 'IfBlock';
  condition: IfConditionNode;
  trueBranch: TemplateNode;
  falseBranch: TemplateNode;
}

export type IfConditionNode =
  | ({ type: 'NotCondition'; operand: IfConditionNode } & WithSourceLocation)
  | ({ type: 'ExpressionCondition'; expression: ExpressionNode } & WithSourceLocation);

export interface IdentifierExpression extends WithSourceLocation {
  type: 'Identifier';
  name: string;
}

export interface PropertyAccessExpression extends WithSourceLocation {
  type: 'PropertyAccess';
  path: string[];
}

export interface BracketLookupExpression extends WithSourceLocation {
  type: 'BracketLookup';
  key: ExpressionNode;
}

export interface ConcatExpression extends WithSourceLocation {
  type: 'Concat';
  parts: ExpressionNode[];
}

export interface StringLiteralExpression extends WithSourceLocation {
  type: 'StringLiteral';
  value: string;
}

export interface FilterPipelineExpression extends WithSourceLocation {
  type: 'FilterPipeline';
  input: ExpressionNode;
  filters: FilterCallNode[];
}

export interface FilterCallNode extends WithSourceLocation {
  name: string;
  args: ExpressionNode[];
}

export interface TemplateNode extends WithSourceLocation {
  type: 'Template';
  body: AstNode[];
}

export interface LiteralNode extends WithSourceLocation {
  type: 'Literal';
  value: string;
}

export interface VariableNode extends WithSourceLocation {
  type: 'Variable';
  name: AstNode; // MODIFIED: The name is a nested template.
  raw: string;
}

export interface IndirectVariableNode extends WithSourceLocation {
  type: 'IndirectVariable';
  name: AstNode; // The nested template for the name.
  raw: string; // The original raw tag (e.g., "<##<#env#>-key##>").
}

export interface ArrayNode extends WithSourceLocation {
  type: 'Array';
  name: AstNode; // Updated: name is always an AstNode (specifically TemplateNode from grammar)
}

export interface CrossProductNode extends WithSourceLocation {
  type: 'CrossProduct';
  template: AstNode;
  iterator: ArrayNode;
  delimiter?: string;
  terminator?: string;
  sliceTemplate?: AstNode; // MODIFIED: Replaces offset/limit with a template.
}

export interface ConditionalNode extends WithSourceLocation {
  type: 'Conditional';
  condition: AstNode;
  trueBranch: AstNode;
  falseBranch: AstNode;
}

export interface FunctionCallNode extends WithSourceLocation {
  type: 'FunctionCall';
  functionName: string;
  args: AstNode[];
}

// Data context and Function Registry
export type DataContextValue = string | number | undefined | DataContext | DataContextValue[];
export type DataContext = Map<string, DataContextValue>;

export type RegisteredFunction = (...args: any[]) => Promise<string | number>;
export type FunctionRegistry = Map<string, RegisteredFunction>;

export type ParseFunction = (
  template: string,
  options?: { enablePeggyTracing?: boolean; sourcePath?: string }
) => AstNode;
