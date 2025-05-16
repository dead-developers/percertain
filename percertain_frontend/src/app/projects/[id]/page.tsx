"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ResizableLayout } from '@/components/resizable-layout';
import { EditorPane } from '@/components/editor/editor-pane';
import { PreviewPane } from '@/components/preview/preview-pane';
import { OutputPane } from '@/components/output/output-pane';
import { compileCode } from '@/lib/compiler';

interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  dslCode: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  versions: {
    id: string;
    name: string;
    dslCode: string;
    createdAt: string;
    userId: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  sharedWith: {
    userId: string;
    permission: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }[];
  _count: {
    favorites: number;
  };
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [dslCode, setDslCode] = useState('');
  const [compiledCode, setCompiledCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activePane, setActivePane] = useState('editor');
  const [showVersions, setShowVersions] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('VIEW');

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
    fetchProject();
  }, [params.id]);

  useEffect(() => {
    if (dslCode) {
      compileAndPreview();
    }
  }, [dslCode]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data);
      setDslCode(data.dslCode);
    } catch (error) {
      setError('Error loading project. Please try again later.');
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const compileAndPreview = async () => {
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
  };

  const handleEditorChange = (value: string) => {
    setDslCode(value);
    setSaveStatus('Unsaved changes');
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dslCode
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save project');
      }
      
      setSaveStatus('All changes saved');
    } catch (error) {
      setSaveStatus('Error saving');
      setError('Error saving project. Please try again.');
      console.error('Error saving project:', error);
    }
  };

  const handleCreateVersion = async () => {
    try {
      setSaveStatus('Creating version...');
      
      const versionName = prompt('Enter a name for this version:');
      
      if (!versionName) return;
      
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dslCode,
          createVersion: true,
          versionName
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create version');
      }
      
      setSaveStatus('Version created');
      fetchProject(); // Refresh project data to show new version
    } catch (error) {
      setSaveStatus('Error creating version');
      setError('Error creating version. Please try again.');
      console.error('Error creating version:', error);
    }
  };

  const handleLoadVersion = (versionCode: string) => {
    setDslCode(versionCode);
    setShowVersions(false);
    setSaveStatus('Unsaved changes');
  };

  const handleShareProject = async () => {
    try {
      if (!shareEmail) {
        setError('Email is required');
        return;
      }
      
      const response = await fetch(`/api/projects/${params.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: shareEmail,
          permission: sharePermission
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to share project');
      }
      
      setShareEmail('');
      setError(null);
      fetchProject(); // Refresh project data to show updated sharing
    } catch (error) {
      setError('Error sharing project. Please try again.');
      console.error('Error sharing project:', error);
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/share?userId=${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove share');
      }
      
      fetchProject(); // Refresh project data to show updated sharing
    } catch (error) {
      setError('Error removing share. Please try again.');
      console.error('Error removing share:', error);
    }
  };

  const handleTogglePublic = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublic: !project?.isPublic
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project visibility');
      }
      
      setProject(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null);
    } catch (error) {
      setError('Error updating project visibility. Please try again.');
      console.error('Error updating project visibility:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading project...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="mb-6">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => router.push('/projects')}>
              Back to Projects
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 p-4 border-b">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-gray-500">{project.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <span className="text-sm text-gray-500">{saveStatus}</span>
              <Button variant="outline" onClick={() => setShowVersions(!showVersions)}>
                Versions
              </Button>
              <Button variant="outline" onClick={() => setShowSharing(!showSharing)}>
                Sharing
              </Button>
              <Button variant="outline" onClick={handleTogglePublic}>
                {project.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
              <Button variant="outline" onClick={handleCreateVersion}>
                Save Version
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <Alert 
          variant="error" 
          title="Error"
          className="m-4"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
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
      
      {showVersions && (
        <div className="container mx-auto px-4 py-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold">Versions</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.versions.map(version => (
                  <div key={version.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{version.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleString()} by {version.user.name}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleLoadVersion(version.dslCode)}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {showSharing && (
        <div className="container mx-auto px-4 py-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold">Share Project</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded-md"
                  />
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="VIEW">View only</option>
                    <option value="EDIT">Can edit</option>
                  </select>
                  <Button onClick={handleShareProject}>
                    Share
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shared with</h3>
                  {project.sharedWith.length === 0 ? (
                    <p className="text-gray-500">This project is not shared with anyone</p>
                  ) : (
                    <div className="space-y-2">
                      {project.sharedWith.map(share => (
                        <div key={share.userId} className="flex justify-between items-center p-2 border rounded">
                          <div className="flex items-center">
                            {share.user.image ? (
                              <img 
                                src={share.user.image} 
                                alt={share.user.name} 
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
                            )}
                            <div>
                              <p>{share.user.name}</p>
                              <p className="text-sm text-gray-500">{share.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-4 text-sm">
                              {share.permission === 'VIEW' ? 'View only' : 'Can edit'}
                            </span>
                            <Button 
                              variant="outline" 
                              onClick={() => handleRemoveShare(share.userId)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
