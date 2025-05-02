import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

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
        { message: 'Only the project owner can share this project' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { email, permission } = body;
    
    if (!email || !permission) {
      return NextResponse.json(
        { message: 'Email and permission are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const userToShare = await prisma.user.findUnique({
      where: {
        email
      }
    });
    
    if (!userToShare) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if already shared
    const existingShare = await prisma.projectShare.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: userToShare.id
        }
      }
    });
    
    if (existingShare) {
      // Update existing share
      const updatedShare = await prisma.projectShare.update({
        where: {
          projectId_userId: {
            projectId,
            userId: userToShare.id
          }
        },
        data: {
          permission
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });
      
      return NextResponse.json(updatedShare);
    } else {
      // Create new share
      const newShare = await prisma.projectShare.create({
        data: {
          projectId,
          userId: userToShare.id,
          permission
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });
      
      return NextResponse.json(newShare, { status: 201 });
    }
  } catch (error) {
    console.error('Error sharing project:', error);
    return NextResponse.json(
      { message: 'An error occurred while sharing the project' },
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
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
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
        { message: 'Only the project owner can manage sharing' },
        { status: 403 }
      );
    }
    
    // Delete share
    await prisma.projectShare.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });
    
    return NextResponse.json(
      { message: 'Project share removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing project share:', error);
    return NextResponse.json(
      { message: 'An error occurred while removing the project share' },
      { status: 500 }
    );
  }
}
