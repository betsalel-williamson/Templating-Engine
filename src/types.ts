// Defines the structure of the Abstract Syntax Tree (AST) and the data context.

export type AstNode =
  | TemplateNode
  | LiteralNode
  | VariableNode
  | IndirectVariableNode
  | ArrayNode
  | CrossProductNode
  | ConditionalNode
  | FunctionCallNode; // New node type

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
  raw: string; // New: Stores the original raw string of the variable tag (e.g., "<#name#>" or "{{ name }}")
}

export interface IndirectVariableNode {
  type: 'IndirectVariable';
  name: string;
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
  offset?: number; // New: for array slicing
  limit?: number;  // New: for array slicing
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
