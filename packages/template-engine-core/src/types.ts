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

export interface OutputExpressionNode {
  type: 'OutputExpression';
  expression: ExpressionNode;
  raw: string;
}

export interface ForBlockNode {
  type: 'ForBlock';
  item: string;
  collection: ExpressionNode;
  body: TemplateNode;
}

export interface IfBlockNode {
  type: 'IfBlock';
  condition: IfConditionNode;
  trueBranch: TemplateNode;
  falseBranch: TemplateNode;
}

export type IfConditionNode =
  | { type: 'NotCondition'; operand: IfConditionNode }
  | { type: 'ExpressionCondition'; expression: ExpressionNode };

export interface IdentifierExpression {
  type: 'Identifier';
  name: string;
}

export interface PropertyAccessExpression {
  type: 'PropertyAccess';
  path: string[];
}

export interface BracketLookupExpression {
  type: 'BracketLookup';
  key: ExpressionNode;
}

export interface ConcatExpression {
  type: 'Concat';
  parts: ExpressionNode[];
}

export interface StringLiteralExpression {
  type: 'StringLiteral';
  value: string;
}

export interface FilterPipelineExpression {
  type: 'FilterPipeline';
  input: ExpressionNode;
  filters: FilterCallNode[];
}

export interface FilterCallNode {
  name: string;
  args: ExpressionNode[];
}

export interface TemplateNode {
  type: 'Template';
  body: AstNode[];
}

export interface LiteralNode {
  type: 'Literal';
  value: string;
}

export interface VariableNode {
  type: 'Variable';
  name: AstNode; // MODIFIED: The name is a nested template.
  raw: string;
}

export interface IndirectVariableNode {
  type: 'IndirectVariable';
  name: AstNode; // The nested template for the name.
  raw: string; // The original raw tag (e.g., "<##<#env#>-key##>").
}

export interface ArrayNode {
  type: 'Array';
  name: AstNode; // Updated: name is always an AstNode (specifically TemplateNode from grammar)
}

export interface CrossProductNode {
  type: 'CrossProduct';
  template: AstNode;
  iterator: ArrayNode;
  delimiter?: string;
  terminator?: string;
  sliceTemplate?: AstNode; // MODIFIED: Replaces offset/limit with a template.
}

export interface ConditionalNode {
  type: 'Conditional';
  condition: AstNode;
  trueBranch: AstNode;
  falseBranch: AstNode;
}

export interface FunctionCallNode {
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
