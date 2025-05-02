import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            sharedWith: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        sharedWith: {
          select: {
            userId: true,
            permission: true,
            user: {
              select: {
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, description, isPublic, dslCode } = body;
    
    if (!name) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        isPublic: isPublic || false,
        dslCode: dslCode || '',
        userId: session.user.id,
        versions: {
          create: {
            name: 'Initial version',
            dslCode: dslCode || '',
            userId: session.user.id
          }
        }
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
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the project' },
      { status: 500 }
    );
  }
}
