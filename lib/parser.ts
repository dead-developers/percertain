import { Token, ASTNode, ParserError, SourceLocation } from './types';
import { Lexer } from './lexer';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;
  private errors: ParserError[] = [];

  constructor(source: string) {
    const lexer = new Lexer(source);
    this.tokens = lexer.tokenize();
  }

  parse(): { ast: ASTNode | null; errors: ParserError[] } {
    try {
      const ast = this.parseProgram();
      return { ast, errors: this.errors };
    } catch (error) {
      this.errors.push({
        message: error instanceof Error ? error.message : 'Unknown error',
        location: this.currentToken().location
      });
      return { ast: null, errors: this.errors };
    }
  }

  private parseProgram(): ASTNode {
    const children: ASTNode[] = [];

    while (!this.isAtEnd()) {
      try {
        if (this.match('AT')) {
          children.push(this.parseAtDeclaration());
        } else if (this.match('IDENTIFIER')) {
          children.push(this.parseStatement());
        } else {
          this.advance();
        }
      } catch (error) {
        this.synchronize();
      }
    }

    return {
      type: 'Program',
      children
    };
  }

  private parseAtDeclaration(): ASTNode {
    const identifier = this.consume('IDENTIFIER', 'Expected identifier after @');
    const value = this.consume('STRING', 'Expected string after @identifier');

    return {
      type: 'AtDeclaration',
      value: {
        keyword: identifier.value,
        value: value.value
      },
      location: identifier.location
    };
  }

  private parseStatement(): ASTNode {
    const identifier = this.previous();
    this.consume('COLON', 'Expected ":" after identifier');
    const value = this.parseValue();

    return {
      type: 'Statement',
      value: {
        identifier: identifier.value,
        value
      },
      location: identifier.location
    };
  }

  private parseValue(): ASTNode {
    if (this.match('STRING')) return this.parseString();
    if (this.match('INTEGER', 'FLOAT')) return this.parseNumber();
    if (this.match('BOOLEAN')) return this.parseBoolean();
    if (this.match('NULL')) return this.parseNull();
    if (this.match('LBRACE')) return this.parseObject();
    if (this.match('LBRACKET')) return this.parseArray();
    if (this.match('IDENTIFIER')) return this.parseIdentifier();

    throw this.error('Expected value');
  }

  private parseString(): ASTNode {
    return {
      type: 'String',
      value: this.previous().value,
      location: this.previous().location
    };
  }

  private parseNumber(): ASTNode {
    const token = this.previous();
    return {
      type: token.type === 'INTEGER' ? 'Integer' : 'Float',
      value: parseFloat(token.value),
      location: token.location
    };
  }

  private parseBoolean(): ASTNode {
    return {
      type: 'Boolean',
      value: this.previous().value === 'true',
      location: this.previous().location
    };
  }

  private parseNull(): ASTNode {
    return {
      type: 'Null',
      value: null,
      location: this.previous().location
    };
  }

  private parseObject(): ASTNode {
    const properties: ASTNode[] = [];
    const location = this.previous().location;

    while (!this.check('RBRACE') && !this.isAtEnd()) {
      const key = this.consume('STRING', 'Expected string key in object');
      this.consume('COLON', 'Expected ":" after object key');
      const value = this.parseValue();

      properties.push({
        type: 'Property',
        value: {
          key: key.value,
          value
        },
        location: key.location
      });

      if (!this.check('RBRACE')) {
        this.match('COMMA'); // Optional comma
      }
    }

    this.consume('RBRACE', 'Expected "}" after object');

    return {
      type: 'Object',
      children: properties,
      location
    };
  }

  private parseArray(): ASTNode {
    const elements: ASTNode[] = [];
    const location = this.previous().location;

    while (!this.check('RBRACKET') && !this.isAtEnd()) {
      elements.push(this.parseValue());

      if (!this.check('RBRACKET')) {
        this.match('COMMA'); // Optional comma
      }
    }

    this.consume('RBRACKET', 'Expected "]" after array');

    return {
      type: 'Array',
      children: elements,
      location
    };
  }

  private parseIdentifier(): ASTNode {
    return {
      type: 'Identifier',
      value: this.previous().value,
      location: this.previous().location
    };
  }

  private match(...types: string[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.currentToken().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private consume(type: string, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(message);
  }

  private error(message: string): Error {
    const token = this.currentToken();
    this.errors.push({
      message,
      location: token.location
    });
    return new Error(message);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === 'SEMICOLON') return;

      switch (this.currentToken().type) {
        case 'AT':
        case 'IDENTIFIER':
          return;
      }

      this.advance();
    }
  }

  private isAtEnd(): boolean {
    return this.currentToken().type === 'EOF';
  }

  private currentToken(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}