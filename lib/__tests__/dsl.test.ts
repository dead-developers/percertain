import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Compiler } from '../compiler';

describe('Percertain DSL', () => {
  describe('Lexer', () => {
    it('should tokenize basic declarations', () => {
      const source = `@app "My Test App"`;
      
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      
      expect(tokens.map(t => t.type)).toContain('AT');
      expect(tokens.map(t => t.type)).toContain('IDENTIFIER');
      expect(tokens.map(t => t.type)).toContain('STRING');
    });

    it('should handle mod declarations', () => {
      const source = `mods: ["data-think", "visual-think-code"]`;
      
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      
      expect(tokens.map(t => t.type)).toContain('IDENTIFIER');
      expect(tokens.map(t => t.type)).toContain('COLON');
      expect(tokens.map(t => t.type)).toContain('LBRACKET');
      expect(tokens.map(t => t.type)).toContain('STRING');
      expect(tokens.map(t => t.type)).toContain('COMMA');
      expect(tokens.map(t => t.type)).toContain('RBRACKET');
    });
  });

  describe('Parser', () => {
    it('should parse basic app structure', () => {
      const source = `
        @app "My Test App"
        data: {
          "userInput": { "source": "form" }
        }
        variables: {
          "selectedTheme": "light"
        }
        ui: {
          "layout": ["header", "content"]
        }
      `;
      
      const parser = new Parser(source);
      const { ast, errors } = parser.parse();
      
      expect(errors).toHaveLength(0);
      expect(ast).toBeTruthy();
      expect(ast?.type).toBe('Program');
    });

    it('should handle mod combinations', () => {
      const source = `
        actions: {
          "analyzeUI": {
            "code": "insights = visual-think-code(image: screenshot, output: 'react-components')"
          }
        }
      `;
      
      const parser = new Parser(source);
      const { ast, errors } = parser.parse();
      
      expect(errors).toHaveLength(0);
      expect(ast).toBeTruthy();
    });
  });

  describe('Compiler', () => {
    it('should compile to FastHTML', () => {
      const source = `
        @app "My Test App"
        ui: {
          "layout": ["header"],
          "components": {
            "header": {
              "heading": "Welcome",
              "text": "This is a test app"
            }
          }
        }
      `;
      
      const parser = new Parser(source);
      const { ast } = parser.parse();
      
      const compiler = new Compiler(source, ast!);
      const { code, errors } = compiler.compile();
      
      expect(errors).toHaveLength(0);
      expect(code).toContain('<div class="percertain-app"');
      expect(code).toContain('data-app-name="My Test App"');
    });

    it('should handle mod execution placeholders', () => {
      const source = `
        actions: {
          "analyzeData": {
            "code": "insights = data-think(data: userInput, depth: 'comprehensive')"
          }
        }
      `;
      
      const parser = new Parser(source);
      const { ast } = parser.parse();
      
      const compiler = new Compiler(source, ast!);
      const { code, errors } = compiler.compile();
      
      expect(errors).toHaveLength(0);
      expect(code).toContain('statement-analyzeData');
    });
  });

  describe('Integration', () => {
    it('should process a complete app definition', () => {
      const source = `
        @app "Data Analysis App"
        data: {
          "csvData": { "source": "csv" },
          "imageData": { "source": "folder", "path": "uploads/" }
        }
        variables: {
          "selectedView": "analysis",
          "insightType": "detailed"
        }
        ui: {
          "layout": ["header", "mainContent", "insights"],
          "components": {
            "header": {
              "heading": "Data Analysis",
              "text": "Upload your data to begin"
            },
            "mainContent": {
              "chart": {
                "data": "csvData",
                "type": "auto"
              }
            },
            "insights": {
              "card": {
                "title": "AI Analysis",
                "content": "aiInsights"
              }
            }
          }
        }
        actions: {
          "analyzeData": {
            "code": "aiInsights = data-think(data: csvData, depth: 'comprehensive')"
          }
        }
        mods: ["data-think", "data-visual", "visual-think"]
      `;
      
      // Process through lexer
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      expect(tokens.length).toBeGreaterThan(0);
      
      // Process through parser
      const parser = new Parser(source);
      const { ast, errors: parseErrors } = parser.parse();
      expect(parseErrors).toHaveLength(0);
      expect(ast).toBeTruthy();
      
      // Process through compiler
      const compiler = new Compiler(source, ast!);
      const { code, errors: compileErrors } = compiler.compile();
      expect(compileErrors).toHaveLength(0);
      expect(code).toBeTruthy();
      
      // Verify key components are present
      expect(code).toContain('class="percertain-app"');
      expect(code).toContain('data-app-name="Data Analysis App"');
    });
  });
});