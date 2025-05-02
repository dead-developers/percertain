import { AppNode, CompilationResult } from './types';

export class CodeGenerator {
  private ast: AppNode;
  private errors: string[] = [];
  private indentLevel = 0;
  private indentString = '    '; // 4 spaces

  constructor(ast: AppNode) {
    this.ast = ast;
  }

  generate(): CompilationResult {
    try {
      const code = this.generateCode();
      return {
        code,
        errors: this.errors
      };
    } catch (error) {
      if (error instanceof Error) {
        this.errors.push(error.message);
      } else {
        this.errors.push('Unknown error during code generation');
      }
      return {
        code: '',
        errors: this.errors
      };
    }
  }

  private generateCode(): string {
    let code = this.generateImports();
    code += this.generateAppClass();
    return code;
  }

  private generateImports(): string {
    let imports = 'import fasthtml as html\n';
    imports += 'from fasthtml import Page\n\n';
    
    // Add additional imports based on mods
    if (this.ast.mods && this.ast.mods.items.length > 0) {
      imports += 'from huggingface_hub import InferenceClient\n';
      imports += 'import json\n';
      imports += 'import os\n\n';
    }
    
    return imports;
  }

  private generateAppClass(): string {
    let code = `class App(Page):\n`;
    this.indentLevel++;
    
    // Constructor
    code += this.indent(`def __init__(self):\n`);
    this.indentLevel++;
    code += this.indent(`super().__init__(\n`);
    this.indentLevel++;
    code += this.indent(`title="${this.ast.name}",\n`);
    if (this.ast.description) {
      code += this.indent(`description="${this.ast.description}",\n`);
    }
    this.indentLevel--;
    code += this.indent(`)\n\n`);
    
    // Variables
    if (this.ast.variables && this.ast.variables.items.length > 0) {
      for (const variable of this.ast.variables.items) {
        code += this.indent(`self.${variable.name} = ${this.valueToString(variable.value)}\n`);
      }
      code += '\n';
    }
    
    // Data
    if (this.ast.data && this.ast.data.items.length > 0) {
      for (const item of this.ast.data.items) {
        code += this.indent(`self.${item.name} = ${this.valueToString(item.value)}\n`);
      }
      code += '\n';
    }
    
    // Hugging Face client setup for mods
    if (this.ast.mods && this.ast.mods.items.length > 0) {
      code += this.indent(`# Set up Hugging Face client\n`);
      code += this.indent(`self.hf_client = InferenceClient(token=os.environ.get("HUGGINGFACE_API_KEY"))\n\n`);
    }
    
    this.indentLevel--;
    
    // Render method
    code += this.indent(`def render(self):\n`);
    this.indentLevel++;
    
    // Generate UI components
    if (this.ast.ui) {
      code += this.generateUIComponents();
    } else {
      code += this.indent(`return html.div({"class": "app"}, [\n`);
      this.indentLevel++;
      code += this.indent(`html.h1({"class": "title"}, "${this.ast.name}"),\n`);
      if (this.ast.description) {
        code += this.indent(`html.p({"class": "description"}, "${this.ast.description}"),\n`);
      }
      this.indentLevel--;
      code += this.indent(`])\n`);
    }
    
    this.indentLevel--;
    
    // Action methods
    if (this.ast.actions && this.ast.actions.items.length > 0) {
      code += '\n';
      for (const action of this.ast.actions.items) {
        code += this.indent(`def ${action.name}(self, event=None):\n`);
        this.indentLevel++;
        code += this.indent(`${action.code}\n`);
        this.indentLevel--;
      }
    }
    
    // Mod methods
    if (this.ast.mods && this.ast.mods.items.length > 0) {
      code += '\n';
      for (const mod of this.ast.mods.items) {
        code += this.generateModMethod(mod.name);
      }
    }
    
    return code;
  }

  private generateUIComponents(): string {
    let code = this.indent(`return html.div({"class": "app"}, [\n`);
    this.indentLevel++;
    
    if (this.ast.ui && this.ast.ui.layout && this.ast.ui.layout.sections.length > 0) {
      for (const section of this.ast.ui.layout.sections) {
        code += this.indent(`# ${section.name} section\n`);
        code += this.indent(`html.div({"class": "section ${section.name}"}, [\n`);
        this.indentLevel++;
        
        // Find components for this section
        const sectionComponents = this.ast.ui.components.sections.find(s => s.name === section.name);
        if (sectionComponents && sectionComponents.components.length > 0) {
          for (const component of sectionComponents.components) {
            code += this.generateComponent(component);
          }
        }
        
        this.indentLevel--;
        code += this.indent(`]),\n`);
      }
    }
    
    this.indentLevel--;
    code += this.indent(`])\n`);
    
    return code;
  }

  private generateComponent(component: any): string {
    switch (component.name) {
      case 'heading':
        return this.indent(`html.h1({"class": "heading"}, ${this.propertyToString(component.properties.text)}),\n`);
      case 'text':
        return this.indent(`html.p({"class": "text"}, ${this.propertyToString(component.properties.content)}),\n`);
      case 'button':
        return this.indent(`html.button({"class": "button", "onClick": "${component.properties.onClick}"}, ${this.propertyToString(component.properties.label)}),\n`);
      case 'input':
        return this.indent(`html.input({"class": "input", "type": "${component.properties.type || 'text'}", "placeholder": ${this.propertyToString(component.properties.placeholder)}}),\n`);
      case 'image':
        return this.indent(`html.img({"class": "image", "src": ${this.propertyToString(component.properties.src)}, "alt": ${this.propertyToString(component.properties.alt || '')}}),\n`);
      case 'link':
        return this.indent(`html.a({"class": "link", "href": ${this.propertyToString(component.properties.href)}}, ${this.propertyToString(component.properties.text)}),\n`);
      case 'container':
        let containerCode = this.indent(`html.div({"class": "container"}, [\n`);
        this.indentLevel++;
        
        if (component.properties.children && Array.isArray(component.properties.children)) {
          for (const child of component.properties.children) {
            containerCode += this.generateComponent(child);
          }
        }
        
        this.indentLevel--;
        containerCode += this.indent(`]),\n`);
        return containerCode;
      default:
        return this.indent(`html.div({"class": "${component.name}"}, "Unknown component: ${component.name}"),\n`);
    }
  }

  private generateModMethod(modName: string): string {
    const [prefix, suffix] = modName.split('-');
    
    let code = this.indent(`def ${modName.replace('-', '_')}(self, input_data):\n`);
    this.indentLevel++;
    
    switch (modName) {
      case 'data-think':
        code += this.indent(`# Analyze data and generate insights\n`);
        code += this.indent(`prompt = f"Analyze this data and provide insights: {input_data}"\n`);
        code += this.indent(`result = self.hf_client.text_generation(prompt, model="gpt2", max_length=100)\n`);
        code += this.indent(`return result\n`);
        break;
      case 'data-visual':
        code += this.indent(`# Create visualization from data\n`);
        code += this.indent(`# This would typically generate chart code\n`);
        code += this.indent(`return html.div({"class": "visualization"}, [\n`);
        this.indentLevel++;
        code += this.indent(`html.h3({}, "Data Visualization"),\n`);
        code += this.indent(`html.pre({}, json.dumps(input_data, indent=2))\n`);
        this.indentLevel--;
        code += this.indent(`])\n`);
        break;
      case 'visual-think':
        code += this.indent(`# Analyze image and generate insights\n`);
        code += this.indent(`result = self.hf_client.image_classification(input_data, model="google/vit-base-patch16-224")\n`);
        code += this.indent(`return result\n`);
        break;
      case 'code-think':
        code += this.indent(`# Analyze code and generate insights\n`);
        code += this.indent(`prompt = f"Analyze this code and provide insights: {input_data}"\n`);
        code += this.indent(`result = self.hf_client.text_generation(prompt, model="gpt2", max_length=100)\n`);
        code += this.indent(`return result\n`);
        break;
      default:
        code += this.indent(`# Custom mod: ${modName}\n`);
        code += this.indent(`return f"Processing {input_data} with {modName}"\n`);
    }
    
    this.indentLevel--;
    return code;
  }

  private propertyToString(value: any): string {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // This is a variable reference
      const varName = value.substring(1, value.length - 1);
      return `self.${varName}`;
    }
    
    return this.valueToString(value);
  }

  private valueToString(value: any): string {
    if (value === null) {
      return 'None';
    }
    
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    
    if (Array.isArray(value)) {
      return `[${value.map(item => this.valueToString(item)).join(', ')}]`;
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value).map(([key, val]) => `"${key}": ${this.valueToString(val)}`);
      return `{${entries.join(', ')}}`;
    }
    
    return 'None';
  }

  private indent(text: string): string {
    return this.indentString.repeat(this.indentLevel) + text;
  }
}
