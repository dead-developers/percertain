import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

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
    
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        versions: {
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
        },
        sharedWith: {
          select: {
            userId: true,
            permission: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            favorites: true
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
    
    // Check if user has access to this project
    const isOwner = project.userId === session.user.id;
    const isShared = project.sharedWith.some(share => share.userId === session.user.id);
    
    if (!isOwner && !isShared && !project.isPublic) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the project' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const existingProject = await prisma.project.findUnique({
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
    
    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    const isOwner = existingProject.userId === session.user.id;
    const canEdit = existingProject.sharedWith.length > 0;
    
    if (!isOwner && !canEdit) {
      return NextResponse.json(
        { message: 'You do not have permission to edit this project' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, description, isPublic, dslCode, createVersion } = body;
    
    // Update project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        dslCode: dslCode !== undefined ? dslCode : undefined,
        updatedAt: new Date()
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
    
    // Create a new version if requested
    if (createVersion && dslCode) {
      await prisma.projectVersion.create({
        data: {
          name: body.versionName || `Version ${new Date().toLocaleString()}`,
          dslCode,
          projectId,
          userId: session.user.id
        }
      });
    }
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Check if project exists and user is the owner
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Only the project owner can delete this project' },
        { status: 403 }
      );
    }
    
    // Delete project and all related data
    await prisma.project.delete({
      where: {
        id: projectId
      }
    });
    
    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the project' },
      { status: 500 }
    );
  }
}
