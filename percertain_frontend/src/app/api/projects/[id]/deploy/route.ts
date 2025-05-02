import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const projectId = params.id;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if project exists and user has permission
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        sharedWith: {
          where: {
            userId: session.user.id,
            permission: 'EDIT'
          }
        }
      }
    });
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    const isOwner = project.userId === session.user.id;
    const canEdit = project.sharedWith.length > 0;
    
    if (!isOwner && !canEdit) {
      return NextResponse.json(
        { message: 'You do not have permission to deploy this project' },
        { status: 403 }
      );
    }
    
    // Generate FastHTML Python code from DSL
    const fastHtmlCode = generateFastHtmlCode(project.dslCode);
    
    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        userId: session.user.id,
        status: 'PENDING',
        environment: 'production',
        code: fastHtmlCode
      }
    });
    
    // In a real implementation, this would trigger a deployment to Vercel
    // For now, we'll simulate a successful deployment
    
    // Update deployment status after a short delay
    setTimeout(async () => {
      try {
        await prisma.deployment.update({
          where: {
            id: deployment.id
          },
          data: {
            status: 'COMPLETED',
            url: `https://percertain-${projectId.substring(0, 8)}.vercel.app`,
            completedAt: new Date()
          }
        });
      } catch (error) {
        console.error('Error updating deployment status:', error);
      }
    }, 3000);
    
    return NextResponse.json({
      id: deployment.id,
      status: 'PENDING',
      message: 'Deployment initiated'
    });
  } catch (error) {
    console.error('Error deploying project:', error);
    return NextResponse.json(
      { message: 'An error occurred while deploying the project' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const projectId = params.id;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get deployments for this project
    const deployments = await prisma.deployment.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching deployments' },
      { status: 500 }
    );
  }
}

// Function to generate FastHTML Python code from DSL
function generateFastHtmlCode(dslCode: string): string {
  // Parse the DSL code
  const app = parseAppFromDsl(dslCode);
  
  // Generate FastHTML Python code
  return `
from fasthtml import FastHTML, Component, Page

app = FastHTML(title="${app.name}")

@app.page("/")
def home_page():
    return Page(
        title="${app.name}",
        description="${app.description || ''}",
        content=[
            ${generateComponentsCode(app)}
        ]
    )

if __name__ == "__main__":
    app.run()
  `.trim();
}

// Helper function to parse DSL code
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

// Helper function to generate FastHTML component code
function generateComponentsCode(app: any): string {
  let code = '';
  
  if (app.ui && app.ui.layout && app.ui.layout.length > 0) {
    // Generate components for each section in the layout
    for (const section of app.ui.layout) {
      code += `
            # ${section} section
            Component("div", className="section ${section}", children=[
      `;
      
      const components = app.ui.components[section] || [];
      
      for (const component of components) {
        if (component.type === 'heading') {
          const text = component.text.startsWith('{') && component.text.endsWith('}')
            ? `{${component.text.substring(1, component.text.length - 1)}}`
            : `"${component.text}"`;
          
          code += `
                Component("h1", className="heading", text=${text}),
          `;
        } else if (component.type === 'text') {
          code += `
                Component("p", className="text", text="${component.content}"),
          `;
        } else if (component.type === 'button') {
          code += `
                Component("button", 
                    className="button", 
                    text="${component.label}",
                    onClick="${component.onClick}"
                ),
          `;
        }
      }
      
      code += `
            ]),
      `;
    }
  } else {
    // Default components if no layout is defined
    code += `
            Component("h1", className="heading", text="${app.name}"),
    `;
    
    if (app.description) {
      code += `
            Component("p", className="text", text="${app.description}"),
      `;
    }
  }
  
  return code;
}
