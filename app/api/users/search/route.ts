import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/search - Search for users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const friendId = searchParams.get('friendId');
    
    // Build the where clause based on provided parameters
    const where: any = {};
    
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // Case-insensitive search
      };
    }
    
    if (email) {
      where.email = {
        equals: email, // Exact match for email
      };
    }
    
    if (friendId) {
      where.friendId = {
        equals: friendId, // Exact match for friendId
      };
    }
    
    // If no search parameters provided, return empty array
    if (Object.keys(where).length === 0) {
      return NextResponse.json([]);
    }
    
    // Search for users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        friendId: true,
        image: true,
      },
      take: 10, // Limit results
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}