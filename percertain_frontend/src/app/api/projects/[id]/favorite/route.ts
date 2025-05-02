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
    
    // Check if project exists and is public
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (!project.isPublic) {
      return NextResponse.json(
        { message: 'Cannot favorite a private project' },
        { status: 403 }
      );
    }
    
    // Check if user already favorited this project
    const existingFavorite = await prisma.projectFavorite.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id
        }
      }
    });
    
    if (existingFavorite) {
      // Remove favorite
      await prisma.projectFavorite.delete({
        where: {
          projectId_userId: {
            projectId,
            userId: session.user.id
          }
        }
      });
      
      return NextResponse.json({ favorited: false });
    } else {
      // Add favorite
      await prisma.projectFavorite.create({
        data: {
          projectId,
          userId: session.user.id
        }
      });
      
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('Error favoriting project:', error);
    return NextResponse.json(
      { message: 'An error occurred while favoriting the project' },
      { status: 500 }
    );
  }
}
