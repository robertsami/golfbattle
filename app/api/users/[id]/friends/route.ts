import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id]/friends - Get all friends of a user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    
    // Validate the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: {
          select: {
            id: true,
            name: true,
            email: true,
            friendId: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/friends - Add a friend
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const body = await request.json();
    const { friendId } = body;
    
    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      );
    }
    
    // Validate the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the friend by their friendId
    const friend = await prisma.user.findUnique({
      where: { friendId },
    });
    
    if (!friend) {
      return NextResponse.json(
        { error: 'Friend not found with the provided friendId' },
        { status: 404 }
      );
    }
    
    // Check if they're already friends
    const existingFriendship = await prisma.user.findFirst({
      where: {
        id: userId,
        friends: {
          some: {
            id: friend.id,
          },
        },
      },
    });
    
    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Already friends with this user' },
        { status: 409 }
      );
    }
    
    // Add the friend
    await prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          connect: {
            id: friend.id,
          },
        },
      },
    });
    
    // Make the friendship bidirectional
    await prisma.user.update({
      where: { id: friend.id },
      data: {
        friends: {
          connect: {
            id: userId,
          },
        },
      },
    });
    
    return NextResponse.json(
      { message: 'Friend added successfully', friend },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding friend:', error);
    return NextResponse.json(
      { error: 'Failed to add friend' },
      { status: 500 }
    );
  }
}