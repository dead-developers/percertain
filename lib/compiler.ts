import { ASTNode, CompilationContext, CompileError, FastHTMLComponent } from './types';

export class Compiler {
  private context: CompilationContext;

  constructor(source: string, ast: ASTNode) {
    this.context = {
      source,
      ast,
      symbols: new Map(),
      errors: [],
      warnings: []
    };
  }

  compile(): { code: string; errors: CompileError[]; warnings: CompileError[] } {
    try {
      const fastHTML = this.compileNode(this.context.ast);
      const code = this.generateFastHTML(fastHTML);
      return {
        code,
        errors: this.context.errors,
        warnings: this.context.warnings
      };
    } catch (error) {
      this.context.errors.push({
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        location: this.context.ast.location!,
        type: 'runtime'
      });
      return {
        code: '',
        errors: this.context.errors,
        warnings: this.context.warnings
      };
    }
  }

  private compileNode(node: ASTNode): FastHTMLComponent | null {
    switch (node.type) {
      case 'Program':
        return this.compileProgram(node);
      case 'AtDeclaration':
        return this.compileAtDeclaration(node);
      case 'Statement':
        return this.compileStatement(node);
      case 'Object':
        return this.compileObject(node);
      case 'Array':
        return this.compileArray(node);
      case 'String':
      case 'Integer':
      case 'Float':
      case 'Boolean':
      case 'Null':
        return this.compilePrimitive(node);
      case 'Property':
        return this.compileProperty(node);
      default:
        this.error(`Unknown node type: ${node.type}`, node.location!);
        return null;
    }
  }

  private compileProgram(node: ASTNode): FastHTMLComponent {
    const children = node.children?.map(child => this.compileNode(child)).filter(Boolean) as FastHTMLComponent[];
    
    return {
      tag: 'div',
      attributes: { class: 'percertain-app' },
      children
    };
  }

  private compileAtDeclaration(node: ASTNode): FastHTMLComponent {
    const { keyword, value } = node.value;
    
    switch (keyword) {
      case 'app':
        return {
          tag: 'div',
          attributes: { 
            class: 'app-container',
            'data-app-name': value
          }
        };
      case 'description':
        return {
          tag: 'meta',
          attributes: { 
            name: 'description',
            content: value
          }
        };
      default:
        this.warning(`Unknown @declaration: ${keyword}`, node.location!);
        return {
          tag: 'div',
          attributes: {
            class: `at-declaration-${keyword}`,
            'data-value': value
          }
        };
    }
  }

  private compileStatement(node: ASTNode): FastHTMLComponent {
    const { identifier, value } = node.value;
    
    return {
      tag: 'div',
      attributes: {
        class: `statement-${identifier}`,
        'data-value': JSON.stringify(value)
      },
      children: value.type === 'Object' || value.type === 'Array' 
        ? [this.compileNode(value)].filter(Boolean) as FastHTMLComponent[]
        : undefined
    };
  }

  private compileObject(node: ASTNode): FastHTMLComponent {
    const children = node.children?.map(child => this.compileNode(child)).filter(Boolean) as FastHTMLComponent[];
    
    return {
      tag: 'div',
      attributes: { class: 'object-container' },
      children
    };
  }

  private compileArray(node: ASTNode): FastHTMLComponent {
    const children = node.children?.map(child => this.compileNode(child)).filter(Boolean) as FastHTMLComponent[];
    
    return {
      tag: 'div',
      attributes: { class: 'array-container' },
      children
    };
  }

  private compilePrimitive(node: ASTNode): FastHTMLComponent {
    return {
      tag: 'span',
      attributes: { 
        class: `primitive-${node.type.toLowerCase()}`,
        'data-value': String(node.value)
      }
    };
  }

  private compileProperty(node: ASTNode): FastHTMLComponent {
    const { key, value } = node.value;
    const compiledValue = this.compileNode(value);

    return {
      tag: 'div',
      attributes: {
        class: 'property',
        'data-key': key
      },
      children: compiledValue ? [compiledValue] : undefined
    };
  }

  private generateFastHTML(component: FastHTMLComponent | null): string {
    if (!component) return '';

    const { tag, attributes, children, content } = component;
    
    // Generate attributes string
    const attrs = Object.entries(attributes || {})
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    // Generate children or content
    const innerContent = children 
      ? children.map(child => this.generateFastHTML(child)).join('\n')
      : content || '';

    // Generate the complete tag
    return `<${tag}${attrs ? ' ' + attrs : ''}>${innerContent}</${tag}>`;
  }

  private error(message: string, location: any): void {
    this.context.errors.push({
      message,
      location,
      type: 'semantic'
    });
  }

  private warning(message: string, location: any): void {
    this.context.warnings.push({
      message,
      location,
      type: 'semantic'
    });
  }
}