import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sort = url.searchParams.get('sort') || 'popular';
    
    // Fetch public projects
    const projects = await prisma.project.findMany({
      where: {
        isPublic: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: sort === 'popular' 
        ? { favorites: { _count: 'desc' } } 
        : { updatedAt: 'desc' }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching gallery projects:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching gallery projects' },
      { status: 500 }
    );
  }
}
