import { Token, SourceLocation, Position } from './types';

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (!this.isEOF()) {
      // Skip whitespace
      this.skipWhitespace();
      
      if (this.isEOF()) break;

      // Get current character
      const char = this.peek();

      // Start position for token
      const start = this.getPosition();

      if (this.isAlpha(char)) {
        tokens.push(this.identifier());
      } else if (this.isDigit(char)) {
        tokens.push(this.number());
      } else {
        switch (char) {
          case '"':
          case "'":
            tokens.push(this.string());
            break;
          case '{':
            tokens.push(this.createToken('LBRACE', '{'));
            this.advance();
            break;
          case '}':
            tokens.push(this.createToken('RBRACE', '}'));
            this.advance();
            break;
          case '[':
            tokens.push(this.createToken('LBRACKET', '['));
            this.advance();
            break;
          case ']':
            tokens.push(this.createToken('RBRACKET', ']'));
            this.advance();
            break;
          case ':':
            tokens.push(this.createToken('COLON', ':'));
            this.advance();
            break;
          case ',':
            tokens.push(this.createToken('COMMA', ','));
            this.advance();
            break;
          case '-':
            tokens.push(this.createToken('DASH', '-'));
            this.advance();
            break;
          case '@':
            tokens.push(this.createToken('AT', '@'));
            this.advance();
            break;
          case '#':
            tokens.push(this.createToken('HASH', '#'));
            this.advance();
            break;
          case '(':
            tokens.push(this.createToken('LPAREN', '('));
            this.advance();
            break;
          case ')':
            tokens.push(this.createToken('RPAREN', ')'));
            this.advance();
            break;
          default:
            throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
        }
      }
    }

    // Add EOF token
    tokens.push(this.createToken('EOF', ''));
    
    return tokens;
  }

  private identifier(): Token {
    const start = this.getPosition();
    let value = '';

    while (!this.isEOF() && (this.isAlphaNumeric(this.peek()) || this.peek() === '-')) {
      value += this.advance();
    }

    // Check for keywords
    const type = this.getKeywordType(value);
    return this.createToken(type, value, start);
  }

  private number(): Token {
    const start = this.getPosition();
    let value = '';
    let isFloat = false;

    while (!this.isEOF() && (this.isDigit(this.peek()) || this.peek() === '.')) {
      if (this.peek() === '.') {
        if (isFloat) break;
        isFloat = true;
      }
      value += this.advance();
    }

    return this.createToken(isFloat ? 'FLOAT' : 'INTEGER', value, start);
  }

  private string(): Token {
    const start = this.getPosition();
    const quote = this.advance(); // Skip opening quote
    let value = '';

    while (!this.isEOF() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance(); // Skip backslash
        value += this.getEscapedChar(this.advance());
      } else {
        value += this.advance();
      }
    }

    if (this.isEOF()) {
      throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
    }

    this.advance(); // Skip closing quote
    return this.createToken('STRING', value, start);
  }

  private getEscapedChar(char: string): string {
    switch (char) {
      case 'n': return '\n';
      case 't': return '\t';
      case 'r': return '\r';
      case '"': return '"';
      case "'": return "'";
      case '\\': return '\\';
      default: return char;
    }
  }

  private createToken(type: string, value: string, startPos?: Position): Token {
    const start = startPos || this.getPosition();
    const end = this.getPosition();
    
    return {
      type,
      value,
      location: { start, end }
    };
  }

  private getPosition(): Position {
    return { line: this.line, column: this.column };
  }

  private isEOF(): boolean {
    return this.position >= this.source.length;
  }

  private peek(): string {
    return this.source[this.position] || '';
  }

  private advance(): string {
    const char = this.peek();
    this.position++;
    
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    
    return char;
  }

  private skipWhitespace(): void {
    while (!this.isEOF() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private getKeywordType(word: string): string {
    const keywords: { [key: string]: string } = {
      'mods': 'IDENTIFIER',
      'data': 'IDENTIFIER',
      'variables': 'IDENTIFIER',
      'ui': 'IDENTIFIER',
      'actions': 'IDENTIFIER',
      'true': 'BOOLEAN',
      'false': 'BOOLEAN',
      'null': 'NULL'
    };

    return keywords[word] || 'IDENTIFIER';
  }
}