import { Token, TokenType, ParserResult, AppNode, DataNode, VariablesNode, UINode, ActionsNode, ModsNode, DataItemNode, VariableNode, LayoutNode, SectionNode, ComponentsNode, ComponentSectionNode, ComponentNode, ActionNode, ModNode } from './types';

export class Parser {
  private tokens: Token[];
  private current = 0;
  private errors: string[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ParserResult {
    try {
      const app = this.app();
      return {
        ast: app,
        errors: this.errors
      };
    } catch (error) {
      if (error instanceof Error) {
        this.errors.push(error.message);
      } else {
        this.errors.push('Unknown error during parsing');
      }
      return {
        ast: null,
        errors: this.errors
      };
    }
  }

  private app(): AppNode {
    const app: AppNode = {
      type: 'app',
      name: ''
    };

    // Parse @app
    this.consume(TokenType.AT, "Expected '@' before app declaration");
    this.consume(TokenType.APP, "Expected 'app' after '@'");
    const nameToken = this.consume(TokenType.STRING, "Expected app name as string");
    app.name = nameToken.literal;

    // Parse optional @description
    if (this.match(TokenType.AT) && this.check(TokenType.DESCRIPTION)) {
      this.advance(); // Consume DESCRIPTION
      const descriptionToken = this.consume(TokenType.STRING, "Expected description as string");
      app.description = descriptionToken.literal;
    }

    // Parse sections
    while (!this.isAtEnd()) {
      if (this.match(TokenType.AT)) {
        const sectionType = this.advance();
        
        switch (sectionType.type) {
          case TokenType.DATA:
            app.data = this.dataSection();
            break;
          case TokenType.VARIABLES:
            app.variables = this.variablesSection();
            break;
          case TokenType.UI:
            app.ui = this.uiSection();
            break;
          case TokenType.ACTIONS:
            app.actions = this.actionsSection();
            break;
          case TokenType.MODS:
            app.mods = this.modsSection();
            break;
          default:
            this.error(`Unexpected section type: ${sectionType.lexeme}`);
            // Skip to next section
            while (!this.isAtEnd() && !this.check(TokenType.AT)) {
              this.advance();
            }
        }
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    return app;
  }

  private dataSection(): DataNode {
    const data: DataNode = {
      type: 'data',
      items: []
    };

    this.consume(TokenType.COLON, "Expected ':' after @data");
    
    // Parse data items
    while (!this.isAtEnd() && !this.check(TokenType.AT)) {
      if (this.check(TokenType.IDENTIFIER)) {
        const item = this.dataItem();
        data.items.push(item);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    return data;
  }

  private dataItem(): DataItemNode {
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected data item name");
    this.consume(TokenType.COLON, "Expected ':' after data item name");
    
    const value = this.parseValue();
    
    return {
      type: 'dataItem',
      name: nameToken.lexeme,
      value
    };
  }

  private variablesSection(): VariablesNode {
    const variables: VariablesNode = {
      type: 'variables',
      items: []
    };

    this.consume(TokenType.COLON, "Expected ':' after @variables");
    
    // Parse variable declarations
    while (!this.isAtEnd() && !this.check(TokenType.AT)) {
      if (this.check(TokenType.IDENTIFIER)) {
        const variable = this.variableDeclaration();
        variables.items.push(variable);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    return variables;
  }

  private variableDeclaration(): VariableNode {
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected variable name");
    this.consume(TokenType.EQUALS, "Expected '=' after variable name");
    
    const value = this.parseValue();
    
    return {
      type: 'variable',
      name: nameToken.lexeme,
      value
    };
  }

  private uiSection(): UINode {
    this.consume(TokenType.COLON, "Expected ':' after @ui");
    
    // Parse layout
    this.consume(TokenType.IDENTIFIER, "Expected 'layout' in UI section");
    this.consume(TokenType.COLON, "Expected ':' after 'layout'");
    const layout = this.layoutSection();
    
    // Parse components
    this.consume(TokenType.IDENTIFIER, "Expected 'components' in UI section");
    this.consume(TokenType.COLON, "Expected ':' after 'components'");
    const components = this.componentsSection();
    
    return {
      type: 'ui',
      layout,
      components
    };
  }

  private layoutSection(): LayoutNode {
    const layout: LayoutNode = {
      type: 'layout',
      sections: []
    };
    
    // Parse layout sections
    while (!this.isAtEnd() && !this.check(TokenType.IDENTIFIER, 'components')) {
      if (this.match(TokenType.DASH)) {
        const section = this.layoutSectionItem();
        layout.sections.push(section);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }
    
    return layout;
  }

  private layoutSectionItem(): SectionNode {
    this.consume(TokenType.IDENTIFIER, "Expected 'section' in layout item");
    this.consume(TokenType.COLON, "Expected ':' after 'section'");
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected section name");
    
    return {
      type: 'section',
      name: nameToken.lexeme
    };
  }

  private componentsSection(): ComponentsNode {
    const components: ComponentsNode = {
      type: 'components',
      sections: []
    };
    
    // Parse component sections
    while (!this.isAtEnd() && !this.check(TokenType.AT)) {
      if (this.check(TokenType.IDENTIFIER)) {
        const section = this.componentSection();
        components.sections.push(section);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }
    
    return components;
  }

  private componentSection(): ComponentSectionNode {
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected component section name");
    this.consume(TokenType.COLON, "Expected ':' after component section name");
    
    const section: ComponentSectionNode = {
      type: 'componentSection',
      name: nameToken.lexeme,
      components: []
    };
    
    // Parse components
    while (!this.isAtEnd() && !this.check(TokenType.IDENTIFIER, nameToken.lexeme === 'header' ? 'main' : null)) {
      if (this.match(TokenType.DASH)) {
        const component = this.component();
        section.components.push(component);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }
    
    return section;
  }

  private component(): ComponentNode {
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected component type");
    this.consume(TokenType.COLON, "Expected ':' after component type");
    
    // Parse component properties
    const properties = this.parseObject();
    
    return {
      type: 'component',
      name: nameToken.lexeme,
      properties
    };
  }

  private actionsSection(): ActionsNode {
    const actions: ActionsNode = {
      type: 'actions',
      items: []
    };

    this.consume(TokenType.COLON, "Expected ':' after @actions");
    
    // Parse action declarations
    while (!this.isAtEnd() && !this.check(TokenType.AT)) {
      if (this.check(TokenType.IDENTIFIER)) {
        const action = this.actionDeclaration();
        actions.items.push(action);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    return actions;
  }

  private actionDeclaration(): ActionNode {
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected action name");
    this.consume(TokenType.COLON, "Expected ':' after action name");
    
    // Collect all tokens until the next action or section
    let code = '';
    const startPos = this.current;
    
    while (!this.isAtEnd() && 
           !this.check(TokenType.AT) && 
           !(this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.COLON))) {
      code += this.advance().lexeme + ' ';
    }
    
    return {
      type: 'action',
      name: nameToken.lexeme,
      code: code.trim()
    };
  }

  private modsSection(): ModsNode {
    const mods: ModsNode = {
      type: 'mods',
      items: []
    };

    this.consume(TokenType.COLON, "Expected ':' after @mods");
    
    // Parse mod declarations
    while (!this.isAtEnd() && !this.check(TokenType.AT)) {
      if (this.match(TokenType.DASH)) {
        const mod = this.modDeclaration();
        mods.items.push(mod);
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    return mods;
  }

  private modDeclaration(): ModNode {
    const nameToken = this.consume(TokenType.IDENTIFIER, "Expected mod name");
    
    // Check for optional parameters
    let parameters: Record<string, any> | undefined;
    
    if (this.match(TokenType.LEFT_PAREN)) {
      parameters = this.parseObject();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after mod parameters");
    }
    
    return {
      type: 'mod',
      name: nameToken.lexeme,
      parameters
    };
  }

  private parseValue(): any {
    if (this.match(TokenType.STRING)) {
      return this.previous().literal;
    }
    
    if (this.match(TokenType.NUMBER)) {
      return this.previous().literal;
    }
    
    if (this.match(TokenType.TRUE)) {
      return true;
    }
    
    if (this.match(TokenType.FALSE)) {
      return false;
    }
    
    if (this.match(TokenType.NULL)) {
      return null;
    }
    
    if (this.match(TokenType.LEFT_BRACE)) {
      return this.parseObject();
    }
    
    if (this.match(TokenType.LEFT_BRACKET)) {
      return this.parseArray();
    }
    
    this.error("Expected value");
    return null;
  }

  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    
    // Empty object
    if (this.match(TokenType.RIGHT_BRACE)) {
      return obj;
    }
    
    do {
      // Key can be identifier or string
      let key: string;
      
      if (this.match(TokenType.IDENTIFIER)) {
        key = this.previous().lexeme;
      } else if (this.match(TokenType.STRING)) {
        key = this.previous().literal;
      } else {
        this.error("Expected property name");
        break;
      }
      
      this.consume(TokenType.COLON, "Expected ':' after property name");
      
      const value = this.parseValue();
      obj[key] = value;
      
    } while (this.match(TokenType.COMMA));
    
    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after object");
    
    return obj;
  }

  private parseArray(): any[] {
    const array: any[] = [];
    
    // Empty array
    if (this.match(TokenType.RIGHT_BRACKET)) {
      return array;
    }
    
    do {
      const value = this.parseValue();
      array.push(value);
    } while (this.match(TokenType.COMMA));
    
    this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after array");
    
    return array;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    
    this.error(message);
    throw new Error(message);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    
    return false;
  }

  private check(type: TokenType, value: string | null = null): boolean {
    if (this.isAtEnd()) return false;
    if (this.peek().type !== type) return false;
    if (value !== null && this.peek().lexeme !== value) return false;
    
    return true;
  }

  private checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1].type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private error(message: string): void {
    const token = this.peek();
    const errorMsg = `Error at line ${token.line}, column ${token.column}: ${message}`;
    this.errors.push(errorMsg);
  }
}
