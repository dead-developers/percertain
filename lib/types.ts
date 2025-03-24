// Type definitions for Percertain DSL

// Basic types
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'array' | 'object';
export type OptionalType = `${PrimitiveType}?`;
export type ValueType = PrimitiveType | OptionalType | Array<PrimitiveType | string>;

// Grammar types
export interface GrammarProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'union';
  properties?: {
    [key: string]: GrammarProperty | ValueType;
  } & {
    '*'?: GrammarProperty | ValueType;
  };
  items?: GrammarProperty | string;
  variants?: string[];
  enum?: string[];
  pattern?: string;
}

export interface Grammar {
  [key: string]: GrammarProperty;
}

// AST types
export interface ASTNode {
  type: string;
  value?: any;
  children?: ASTNode[];
  location?: SourceLocation;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

// Parser types
export interface Token {
  type: string;
  value: string;
  location: SourceLocation;
}

export interface ParserError {
  message: string;
  location: SourceLocation;
}

// Component types
export interface Component {
  type: string;
  props: {
    [key: string]: any;
  };
  children?: Component[];
}

// Mod types
export interface Mod {
  prefix: string;
  suffix: string;
  capabilities: string[];
}

// Runtime types
export interface RuntimeContext {
  variables: {
    [key: string]: any;
  };
  actions: {
    [key: string]: Function;
  };
  mods: {
    [key: string]: Mod;
  };
}

// FastHTML types
export interface FastHTMLComponent {
  tag: string;
  attributes?: {
    [key: string]: string | number | boolean;
  };
  children?: FastHTMLComponent[];
  content?: string;
}

// Error Types
export interface CompileError {
  message: string;
  location: SourceLocation;
  type: 'syntax' | 'semantic' | 'runtime';
  source?: string;
  code?: string;
  suggestions?: string[];
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: CompileError[];
  warnings: CompileError[];
}

// Context Types
export interface CompilationContext {
  source: string;
  ast: ASTNode;
  symbols: Map<string, any>;
  errors: CompileError[];
  warnings: CompileError[];
}

// UI Component Props
export interface UIComponentProps {
  type: string;
  props: {
    [key: string]: any;
  };
  children?: UIComponentProps[];
  events?: {
    [key: string]: Function;
  };
  bindings?: {
    [key: string]: string;
  };
}

// Action Types
export interface Action {
  name: string;
  params: {
    [key: string]: any;
  };
  body: string;
  async?: boolean;
}

// Data Source Types
export interface DataSource {
  type: 'csv' | 'json' | 'folder' | 'image' | 'api';
  path?: string;
  url?: string;
  options?: {
    [key: string]: any;
  };
}

// Variable Types
export interface Variable {
  name: string;
  type: PrimitiveType;
  value: any;
  reactive?: boolean;
}

// Event Types
export interface EventHandler {
  event: string;
  action: string;
  params?: {
    [key: string]: any;
  };
}

// Mod System Types
export type ModPrefix = 'data' | 'visual' | 'code' | 'create' | 'play';
export type ModSuffix = 'think' | 'visual' | 'code' | 'create';

export interface ModDefinition {
  prefix: ModPrefix;
  suffix: ModSuffix;
  description: string;
  inputType: string[];
  outputType: string;
  capabilities: string[];
}

// Parser Result Types
export interface ParseResult {
  ast: ASTNode | null;
  errors: ParserError[];
}

// Compiler Result Types
export interface CompileResult {
  code: string;
  errors: CompileError[];
  warnings: CompileError[];
  ast?: ASTNode;
}
