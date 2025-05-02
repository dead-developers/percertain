// Types for the Percertain DSL

export enum TokenType {
  // Keywords
  AT = '@',
  APP = 'app',
  DESCRIPTION = 'description',
  DATA = 'data',
  VARIABLES = 'variables',
  UI = 'ui',
  ACTIONS = 'actions',
  MODS = 'mods',
  
  // Literals
  STRING = 'string',
  NUMBER = 'number',
  TRUE = 'true',
  FALSE = 'false',
  NULL = 'null',
  
  // Identifiers
  IDENTIFIER = 'identifier',
  
  // Punctuation
  COLON = ':',
  SEMICOLON = ';',
  COMMA = ',',
  DOT = '.',
  LEFT_PAREN = '(',
  RIGHT_PAREN = ')',
  LEFT_BRACE = '{',
  RIGHT_BRACE = '}',
  LEFT_BRACKET = '[',
  RIGHT_BRACKET = ']',
  EQUALS = '=',
  DASH = '-',
  
  // Other
  COMMENT = 'comment',
  WHITESPACE = 'whitespace',
  NEWLINE = 'newline',
  EOF = 'eof',
  ERROR = 'error'
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
}

export interface AppNode extends ASTNode {
  type: 'app';
  name: string;
  description?: string;
  data?: DataNode;
  variables?: VariablesNode;
  ui?: UINode;
  actions?: ActionsNode;
  mods?: ModsNode;
}

export interface DataNode extends ASTNode {
  type: 'data';
  items: DataItemNode[];
}

export interface DataItemNode extends ASTNode {
  type: 'dataItem';
  name: string;
  value: any;
}

export interface VariablesNode extends ASTNode {
  type: 'variables';
  items: VariableNode[];
}

export interface VariableNode extends ASTNode {
  type: 'variable';
  name: string;
  value: any;
}

export interface UINode extends ASTNode {
  type: 'ui';
  layout: LayoutNode;
  components: ComponentsNode;
}

export interface LayoutNode extends ASTNode {
  type: 'layout';
  sections: SectionNode[];
}

export interface SectionNode extends ASTNode {
  type: 'section';
  name: string;
}

export interface ComponentsNode extends ASTNode {
  type: 'components';
  sections: ComponentSectionNode[];
}

export interface ComponentSectionNode extends ASTNode {
  type: 'componentSection';
  name: string;
  components: ComponentNode[];
}

export interface ComponentNode extends ASTNode {
  type: 'component';
  name: string;
  properties: Record<string, any>;
}

export interface ActionsNode extends ASTNode {
  type: 'actions';
  items: ActionNode[];
}

export interface ActionNode extends ASTNode {
  type: 'action';
  name: string;
  code: string;
}

export interface ModsNode extends ASTNode {
  type: 'mods';
  items: ModNode[];
}

export interface ModNode extends ASTNode {
  type: 'mod';
  name: string;
  parameters?: Record<string, any>;
}

export interface CompilationResult {
  code: string;
  errors: string[];
}

export interface ParserResult {
  ast: AppNode | null;
  errors: string[];
}
