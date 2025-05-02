import React, { useState, useEffect } from 'react';
import { ResizableLayout } from '@/components/resizable-layout';
import { EditorPane } from '@/components/editor/editor-pane';
import { PreviewPane } from '@/components/preview/preview-pane';
import { OutputPane } from '@/components/output/output-pane';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { compileCode } from '@/lib/compiler';

const defaultDslCode = `@app "My First App"
@description "A simple application created with Percertain"

@variables:
  title = "Welcome to My App"
  showHeader = true

@ui:
  layout:
    - section: header
    - section: main
  
  components:
    header:
      - heading: {text: "{title}"}
    
    main:
      - text: {content: "This is my first Percertain app!"}
      - button: {label: "Click me", onClick: "handleClick"}

@actions:
  handleClick: self.title = "Button clicked!"

@mods:
  - data-think
`;

export default function ProjectEditor() {
  const [dslCode, setDslCode] = useState(defaultDslCode);
  const [compiledCode, setCompiledCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activePane, setActivePane] = useState('editor');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Compile code when it changes
    const compileTimeout = setTimeout(async () => {
      try {
        const result = await compileCode(dslCode);
        
        setCompiledCode(result.code);
        setErrors(result.errors);
        
        if (result.errors.length === 0) {
          // Generate preview HTML
          const previewHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Preview</title>
              <style>
                body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
                .heading { font-size: 24px; margin-bottom: 16px; }
                .text { margin-bottom: 16px; }
                .button { 
                  background-color: #3b82f6; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                }
                .button:hover { background-color: #2563eb; }
                .section { margin-bottom: 24px; }
              </style>
            </head>
            <body>
              <div id="app"></div>
              <script>
                // This is a simplified preview that renders based on the DSL
                // In a real implementation, this would execute the FastHTML Python code
                
                const app = ${JSON.stringify(parseAppFromDsl(dslCode))};
                
                function renderApp() {
                  const appElement = document.getElementById('app');
                  
                  let html = '<div class="app">';
                  
                  // Render sections based on layout
                  if (app.ui && app.ui.layout) {
                    app.ui.layout.forEach(section => {
                      html += \`<div class="section \${section}">\`;
                      
                      // Find components for this section
                      const components = app.ui.components[section] || [];
                      
                      components.forEach(component => {
                        if (component.type === 'heading') {
                          const text = component.text.startsWith('{') && component.text.endsWith('}')
                            ? app.variables[component.text.substring(1, component.text.length - 1)]
                            : component.text;
                          html += \`<h1 class="heading">\${text}</h1>\`;
                        } else if (component.type === 'text') {
                          html += \`<p class="text">\${component.content}</p>\`;
                        } else if (component.type === 'button') {
                          html += \`<button class="button" onclick="handleAction('\${component.onClick}')">\${component.label}</button>\`;
                        }
                      });
                      
                      html += '</div>';
                    });
                  } else {
                    html += \`
                      <h1 class="heading">\${app.name}</h1>
                      <p class="text">\${app.description || ''}</p>
                    \`;
                  }
                  
                  html += '</div>';
                  
                  appElement.innerHTML = html;
                }
                
                function handleAction(actionName) {
                  if (actionName === 'handleClick') {
                    app.variables.title = "Button clicked!";
                    renderApp();
                  }
                }
                
                // Initial render
                renderApp();
              </script>
            </body>
            </html>
          `;
          
          setPreviewHtml(previewHtml);
        }
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Unknown error']);
      }
    }, 500);
    
    return () => clearTimeout(compileTimeout);
  }, [dslCode]);

  // Simulate saving to server
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (dslCode !== defaultDslCode) {
        setSaveStatus('Saving...');
        
        // Simulate API call
        setTimeout(() => {
          setSaveStatus('All changes saved');
        }, 1000);
      }
    }, 2000);
    
    return () => clearTimeout(saveTimeout);
  }, [dslCode]);

  const handleEditorChange = (value: string) => {
    setDslCode(value);
    setSaveStatus('Unsaved changes');
  };

  // Simple parser to extract app structure for preview
  function parseAppFromDsl(dsl: string) {
    try {
      const app: any = {
        name: '',
        description: '',
        variables: {},
        ui: {
          layout: [],
          components: {}
        }
      };
      
      // Extract app name
      const appMatch = dsl.match(/@app\s+"([^"]+)"/);
      if (appMatch) {
        app.name = appMatch[1];
      }
      
      // Extract description
      const descMatch = dsl.match(/@description\s+"([^"]+)"/);
      if (descMatch) {
        app.description = descMatch[1];
      }
      
      // Extract variables
      const variablesMatch = dsl.match(/@variables:([\s\S]*?)(?=@|$)/);
      if (variablesMatch) {
        const variablesSection = variablesMatch[1];
        const variableMatches = variablesSection.matchAll(/(\w+)\s*=\s*"([^"]+)"/g);
        
        for (const match of variableMatches) {
          app.variables[match[1]] = match[2];
        }
      }
      
      // Extract UI layout
      const layoutMatch = dsl.match(/layout:([\s\S]*?)(?=components:|$)/);
      if (layoutMatch) {
        const layoutSection = layoutMatch[1];
        const sectionMatches = layoutSection.matchAll(/-\s*section:\s*(\w+)/g);
        
        for (const match of sectionMatches) {
          app.ui.layout.push(match[1]);
        }
      }
      
      // Extract UI components
      const componentsMatch = dsl.match(/components:([\s\S]*?)(?=@|$)/);
      if (componentsMatch) {
        const componentsSection = componentsMatch[1];
        
        // Process each section
        for (const section of app.ui.layout) {
          const sectionMatch = componentsSection.match(new RegExp(`${section}:(\\s*[\\s\\S]*?)(?=\\w+:|$)`));
          
          if (sectionMatch) {
            const sectionComponents = [];
            const sectionContent = sectionMatch[1];
            
            // Extract headings
            const headingMatches = sectionContent.matchAll(/-\s*heading:\s*{text:\s*"([^"]+)"|{text:\s*{([^}]+)}}/g);
            for (const match of headingMatches) {
              sectionComponents.push({
                type: 'heading',
                text: match[1] || `{${match[2]}}`
              });
            }
            
            // Extract text components
            const textMatches = sectionContent.matchAll(/-\s*text:\s*{content:\s*"([^"]+)"}/g);
            for (const match of textMatches) {
              sectionComponents.push({
                type: 'text',
                content: match[1]
              });
            }
            
            // Extract buttons
            const buttonMatches = sectionContent.matchAll(/-\s*button:\s*{label:\s*"([^"]+)",\s*onClick:\s*"([^"]+)"}/g);
            for (const match of buttonMatches) {
              sectionComponents.push({
                type: 'button',
                label: match[1],
                onClick: match[2]
              });
            }
            
            app.ui.components[section] = sectionComponents;
          }
        }
      }
      
      return app;
    } catch (error) {
      console.error('Error parsing DSL:', error);
      return { name: 'Error parsing DSL', description: 'Check console for details' };
    }
  }

  // Render different content based on active pane (mobile only)
  const renderMobileContent = () => {
    switch (activePane) {
      case 'editor':
        return (
          <EditorPane
            initialValue={dslCode}
            onChange={handleEditorChange}
            errors={errors}
          />
        );
      case 'preview':
        return (
          <PreviewPane html={previewHtml} />
        );
      case 'output':
        return (
          <OutputPane code={compiledCode} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">Project Editor</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">{saveStatus}</span>
          <Button>Deploy to Production</Button>
        </div>
      </div>
      
      {errors.length > 0 && (
        <Alert 
          variant="error" 
          title="Compilation Errors"
          className="m-4"
          onClose={() => setErrors([])}
        >
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <div className="flex-grow overflow-hidden">
        {isMobile ? (
          renderMobileContent()
        ) : (
          <ResizableLayout sizes={[50, 50]}>
            <EditorPane
              initialValue={dslCode}
              onChange={handleEditorChange}
              errors={errors}
            />
            <ResizableLayout direction="vertical" sizes={[50, 50]}>
              <PreviewPane html={previewHtml} />
              <OutputPane code={compiledCode} />
            </ResizableLayout>
          </ResizableLayout>
        )}
      </div>
      
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
          <Button
            variant={activePane === 'editor' ? 'primary' : 'secondary'}
            onClick={() => setActivePane('editor')}
          >
            Editor
          </Button>
          <Button
            variant={activePane === 'preview' ? 'primary' : 'secondary'}
            onClick={() => setActivePane('preview')}
          >
            Preview
          </Button>
          <Button
            variant={activePane === 'output' ? 'primary' : 'secondary'}
            onClick={() => setActivePane('output')}
          >
            Output
          </Button>
        </div>
      )}
    </div>
  );
}
