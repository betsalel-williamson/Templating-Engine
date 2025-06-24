// Defines the structure of the Abstract Syntax Tree (AST) and the data context.

export type AstNode =
  | TemplateNode
  | LiteralNode
  | VariableNode
  | IndirectVariableNode
  | ArrayNode
  | CrossProductNode
  | ConditionalNode;

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
  name: string;
}

export interface IndirectVariableNode {
  type: 'IndirectVariable';
  name: string;
}

export interface ArrayNode {
  type: 'Array';
  name: string | { type: 'Variable', name: string };
}

export interface CrossProductNode {
  type: 'CrossProduct';
  template: AstNode;
  iterator: ArrayNode;
}

export interface ConditionalNode {
  type: 'Conditional';
  condition: AstNode;
  trueBranch: AstNode;
  falseBranch: AstNode;
}

// Data context for evaluation
export type DataContextValue = string | number | DataContext | DataContextValue[];
export type DataContext = Map<string, DataContextValue>;
