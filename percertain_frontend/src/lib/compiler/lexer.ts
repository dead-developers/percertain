import { Token, TokenType } from './types';

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private column = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      literal: null,
      line: this.line,
      column: this.column
    });

    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      case '@':
        this.addToken(TokenType.AT);
        this.identifier();
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case '[':
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case ']':
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case '=':
        this.addToken(TokenType.EQUALS);
        break;
      case '-':
        this.addToken(TokenType.DASH);
        break;
      case '"':
        this.string();
        break;
      case '#':
        this.comment();
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break;
      case '\n':
        this.line++;
        this.column = 1;
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.error(`Unexpected character: ${c}`);
        }
        break;
    }
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.error('Unterminated string');
      return;
    }

    // The closing "
    this.advance();

    // Trim the surrounding quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a decimal part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenType.NUMBER, value);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    let type: TokenType;

    switch (text) {
      case 'app':
        type = TokenType.APP;
        break;
      case 'description':
        type = TokenType.DESCRIPTION;
        break;
      case 'data':
        type = TokenType.DATA;
        break;
      case 'variables':
        type = TokenType.VARIABLES;
        break;
      case 'ui':
        type = TokenType.UI;
        break;
      case 'actions':
        type = TokenType.ACTIONS;
        break;
      case 'mods':
        type = TokenType.MODS;
        break;
      case 'true':
        type = TokenType.TRUE;
        this.addToken(type, true);
        return;
      case 'false':
        type = TokenType.FALSE;
        this.addToken(type, false);
        return;
      case 'null':
        type = TokenType.NULL;
        this.addToken(type, null);
        return;
      default:
        type = TokenType.IDENTIFIER;
        break;
    }

    this.addToken(type);
  }

  private comment(): void {
    // A comment goes until the end of the line
    while (this.peek() !== '\n' && !this.isAtEnd()) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    this.addToken(TokenType.COMMENT, text);
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    this.column++;
    return this.source.charAt(this.current++);
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_' || c === '-';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push({
      type,
      lexeme: text,
      literal,
      line: this.line,
      column: this.column - (this.current - this.start)
    });
  }

  private error(message: string): void {
    console.error(`Error at line ${this.line}, column ${this.column}: ${message}`);
    this.addToken(TokenType.ERROR, message);
  }
}
