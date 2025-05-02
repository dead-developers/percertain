import { Lexer } from './lexer';
import { Parser } from './parser';
import { CodeGenerator } from './generator';
import { CompilationResult } from './types';

export async function compileCode(source: string): Promise<CompilationResult> {
  try {
    // Tokenize the source code
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    
    // Parse tokens into an AST
    const parser = new Parser(tokens);
    const { ast, errors: parseErrors } = parser.parse();
    
    if (parseErrors.length > 0 || !ast) {
      return {
        code: '',
        errors: parseErrors,
      };
    }
    
    // Generate code from the AST
    const generator = new CodeGenerator(ast);
    const { code, errors: genErrors } = generator.generate();
    
    return {
      code,
      errors: [...parseErrors, ...genErrors],
    };
  } catch (error) {
    return {
      code: '',
      errors: [error instanceof Error ? error.message : 'Unknown error during compilation'],
    };
  }
}
